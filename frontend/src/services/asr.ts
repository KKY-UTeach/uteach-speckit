const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface TranscriptionResponse {
  job_id: string;
  text: string;
  status: string;
}

export const transcribeAudio = async (audioBlob: Blob): Promise<TranscriptionResponse> => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'lecture_audio.webm');
  formData.append('language', 'cs');

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
