import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AudioCapture from '../../src/components/AudioCapture';
import { useAudioRecorder } from '../../src/hooks/useAudioRecorder';

class MockMediaRecorder {
  state: RecordingState = 'inactive';
  mimeType = 'audio/webm';
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onstop: ((event: Event) => void) | null = null;
  stream: MediaStream;

  constructor(stream: MediaStream) {
    this.stream = stream;
  }

  start() {
    this.state = 'recording';
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    this.onstop?.(new Event('stop'));
  }
}

describe('useAudioRecorder', () => {
  const originalMediaDevices = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices');
  const originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
  const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
  const stopTrack = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    stopTrack.mockClear();
    const stream = {
      getTracks: () => [{ stop: stopTrack }],
    } as unknown as MediaStream;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:recording'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    vi.stubGlobal('MediaRecorder', MockMediaRecorder);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    if (originalMediaDevices) {
      Object.defineProperty(navigator, 'mediaDevices', originalMediaDevices);
    } else {
      delete (navigator as Navigator & { mediaDevices?: MediaDevices }).mediaDevices;
    }
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

  it('tracks elapsed recording time and excludes paused time', async () => {
    let clock = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => clock);
    const { result, unmount } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });
    clock = 1500;
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(result.current.elapsedMilliseconds).toBe(1500);

    act(() => {
      result.current.pauseRecording();
      vi.advanceTimersByTime(5000);
    });
    clock = 6500;
    expect(result.current.isPaused).toBe(true);
    expect(result.current.elapsedMilliseconds).toBe(1500);

    act(() => {
      result.current.resumeRecording();
      clock = 7500;
      vi.advanceTimersByTime(1000);
      result.current.stopRecording();
    });
    expect(result.current.isRecording).toBe(false);
    expect(result.current.elapsedMilliseconds).toBe(2500);
    expect(result.current.recording?.blob.type).toBe('audio/webm');
    expect(stopTrack).toHaveBeenCalledOnce();
    unmount();
  });

  it('shows the timer and pause, resume, and stop controls while recording', async () => {
    const { unmount } = render(React.createElement(AudioCapture, { onCaptured: vi.fn() }));

    fireEvent.click(screen.getByRole('button', { name: 'Nahrávat' }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByLabelText('Délka nahrávání')).toHaveTextContent('00:00');
    fireEvent.click(screen.getByRole('button', { name: 'Pozastavit' }));
    expect(screen.getByText('Pozastaveno')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Pokračovat' }));
    expect(screen.getByText('Nahrává se')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Zastavit' }));
    expect(screen.getByText('Audio připraveno')).toBeInTheDocument();
    unmount();
  });
});
