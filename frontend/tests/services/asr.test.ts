import { afterEach, describe, expect, it, vi } from 'vitest';
import { transcribeAudio } from '../../src/services/asr';

describe('transcribeAudio', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends trimmed WAV audio with a matching filename', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ job_id: 'test', text: 'Přepis', status: 'success' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await transcribeAudio(new Blob(['trimmed audio'], { type: 'audio/wav' }));

    const formData = fetchMock.mock.calls[0][1].body as FormData;
    expect((formData.get('file') as File).name).toBe('lecture_audio.wav');
  });

  it('sends the selected language to the transcription API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ job_id: 'test', text: 'Transcript', status: 'success' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await transcribeAudio(new Blob(['audio'], { type: 'audio/webm' }), 'en');

    const formData = fetchMock.mock.calls[0][1].body as FormData;
    expect(formData.get('language')).toBe('en');
  });
});
