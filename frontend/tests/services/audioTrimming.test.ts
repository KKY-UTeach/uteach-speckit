import { afterEach, describe, expect, it, vi } from 'vitest';
import { trimAudio } from '../../src/services/audioTrimming';

const createAudioBuffer = (): AudioBuffer => {
  const samples = Float32Array.from({ length: 100 }, (_, index) => index / 100);
  return {
    duration: 10,
    length: samples.length,
    numberOfChannels: 1,
    sampleRate: 10,
    getChannelData: () => samples,
  } as AudioBuffer;
};

describe('trimAudio', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('encodes only the selected range as a WAV audio blob', async () => {
    const audioBuffer = createAudioBuffer();
    const close = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('AudioContext', class {
      decodeAudioData = vi.fn().mockResolvedValue(audioBuffer);
      close = close;
    });

    const trimmed = await trimAudio(new Blob(['audio']), 2, 5);
    const bytes = await trimmed.arrayBuffer();
    const view = new DataView(bytes);

    expect(trimmed.type).toBe('audio/wav');
    expect(bytes.byteLength).toBe(44 + 30 * 2);
    expect(view.getUint32(40, true)).toBe(30 * 2);
    expect(view.getInt16(44, true)).toBe(Math.round((20 / 100) * 0x7fff));
    expect(close).toHaveBeenCalledOnce();
  });

  it('rejects an empty or reversed range without decoding audio', async () => {
    await expect(trimAudio(new Blob(['audio']), 5, 5)).rejects.toThrow('Zadejte platný začátek');
  });
});
