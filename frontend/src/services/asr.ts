import type { SupportedLanguage } from '../i18n';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export interface TranscriptionResponse {
  job_id: string;
  text: string;
  status: string;
}

export const transcribeAudio = async (
  audioBlob: Blob,
  language: SupportedLanguage = 'cs',
): Promise<TranscriptionResponse> => {
  const formData = new FormData();
  const mimeType = audioBlob.type.split(';', 1)[0];
  const extensionByMimeType: Record<string, string> = {
    'audio/mp4': 'm4a',
    'audio/mpeg': 'mp3',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
    'audio/webm': 'webm',
    'audio/x-wav': 'wav',
  };
  const extension = extensionByMimeType[mimeType] || 'webm';
  formData.append('file', audioBlob, `lecture_audio.${extension}`);
  formData.append('language', language);

  const response = await fetch(`${API_BASE_URL}/asr/transcribe`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Transcription failed' }));
    throw new Error(errorData.detail || 'Transcription failed');
  }

  return await response.json();
};
