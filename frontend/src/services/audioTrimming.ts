const encodeWav = (audioBuffer: AudioBuffer, startFrame: number, endFrame: number): Blob => {
  const channelCount = audioBuffer.numberOfChannels;
  const frameCount = endFrame - startFrame;
  const bytesPerSample = 2;
  const blockAlign = channelCount * bytesPerSample;
  const buffer = new ArrayBuffer(44 + frameCount * blockAlign);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, buffer.byteLength - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, audioBuffer.sampleRate, true);
  view.setUint32(28, audioBuffer.sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(36, 'data');
  view.setUint32(40, frameCount * blockAlign, true);

  let offset = 44;
  for (let frame = startFrame; frame < endFrame; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[frame]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += bytesPerSample;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

export const trimAudio = async (
  audio: Blob,
  startSeconds: number,
  endSeconds: number,
): Promise<Blob> => {
  if (!Number.isFinite(startSeconds) || !Number.isFinite(endSeconds) || startSeconds < 0 || endSeconds <= startSeconds) {
    throw new Error('Zadejte platný začátek a konec výřezu.');
  }

  const context = new AudioContext();
  try {
    let decoded: AudioBuffer;
    try {
      decoded = await context.decodeAudioData(await audio.arrayBuffer());
    } catch {
      throw new Error('Audio se nepodařilo načíst nebo oříznout. Zkuste jiný zvukový soubor.');
    }
    if (endSeconds > decoded.duration) {
      throw new Error('Konec výřezu nemůže být za koncem audia.');
    }

    const startFrame = Math.floor(startSeconds * decoded.sampleRate);
    const endFrame = Math.min(decoded.length, Math.ceil(endSeconds * decoded.sampleRate));
    if (startFrame >= endFrame) {
      throw new Error('Vybraný výřez audia je příliš krátký.');
    }

    return encodeWav(decoded, startFrame, endFrame);
  } finally {
    await context.close();
  }
};
