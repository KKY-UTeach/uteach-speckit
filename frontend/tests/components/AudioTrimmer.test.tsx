import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AudioTrimmer from '../../src/components/AudioTrimmer';

describe('AudioTrimmer', () => {
  const originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
  const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalCreateObjectURL) {
      Object.defineProperty(URL, 'createObjectURL', originalCreateObjectURL);
    } else {
      delete (URL as typeof URL & { createObjectURL?: typeof URL.createObjectURL }).createObjectURL;
    }
    if (originalRevokeObjectURL) {
      Object.defineProperty(URL, 'revokeObjectURL', originalRevokeObjectURL);
    } else {
      delete (URL as typeof URL & { revokeObjectURL?: typeof URL.revokeObjectURL }).revokeObjectURL;
    }
  });

  it('previews and passes the selected audio segment for transcription', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const samples = new Float32Array(100);
    const decoded = {
      duration: 10,
      length: samples.length,
      numberOfChannels: 1,
      sampleRate: 10,
      getChannelData: () => samples,
    } as AudioBuffer;
    vi.stubGlobal('AudioContext', class {
      decodeAudioData = vi.fn().mockResolvedValue(decoded);
      close = vi.fn().mockResolvedValue(undefined);
    });
    let objectUrlIndex = 0;
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => `blob:audio-${objectUrlIndex++}`),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    const onTranscribe = vi.fn();
    const { unmount } = render(<AudioTrimmer audio={new Blob(['audio'])} onTranscribe={onTranscribe} />);

    const originalAudio = screen.getByLabelText('Přehrát původní audio');
    Object.defineProperty(originalAudio, 'duration', { configurable: true, value: 10 });
    fireEvent.loadedMetadata(originalAudio);
    fireEvent.change(screen.getByLabelText('Začátek (sekundy)'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Konec (sekundy)'), { target: { value: '5' } });

    fireEvent.click(screen.getByRole('button', { name: 'Náhled vybraného úseku' }));
    await screen.findByLabelText('Přehrát vybraný úsek audia');

    fireEvent.click(screen.getByRole('button', { name: 'Přepsat vybraný úsek' }));
    await waitFor(() => expect(onTranscribe).toHaveBeenCalledOnce());
    expect(onTranscribe.mock.calls[0][0]).toBeInstanceOf(Blob);
    expect(onTranscribe.mock.calls[0][0].type).toBe('audio/wav');
    expect(await onTranscribe.mock.calls[0][0].arrayBuffer()).toHaveProperty('byteLength', 104);
    unmount();
  });
});
