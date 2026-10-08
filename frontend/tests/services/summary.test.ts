import { afterEach, describe, expect, it, vi } from 'vitest';
import { summarizeTranscript } from '../../src/services/summary';

describe('summarizeTranscript', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends the selected language to the summary API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ markdown: 'Summary' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await summarizeTranscript('Transcript', 'summary', [], 'en');

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).language).toBe('en');
  });
});
