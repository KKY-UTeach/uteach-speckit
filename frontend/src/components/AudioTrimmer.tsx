import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Scissors } from 'lucide-react';
import { trimAudio } from '../services/audioTrimming';

interface AudioTrimmerProps {
  audio: Blob;
  onTranscribe: (audio: Blob) => void;
}

const formatTime = (seconds: number): string => {
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;
  return [hours, minutes, remainingSeconds]
    .map(part => String(part).padStart(2, '0'))
    .join(':');
};

const AudioTrimmer: React.FC<AudioTrimmerProps> = ({ audio, onTranscribe }) => {
  const [duration, setDuration] = useState<number | null>(null);
  const [startSeconds, setStartSeconds] = useState(0);
  const [endSeconds, setEndSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(audio);
    const player = audioRef.current;
    if (!player) {
      URL.revokeObjectURL(url);
      return undefined;
    }

    const handleMetadata = () => {
      if (Number.isFinite(player.duration)) {
        setDuration(player.duration);
        setEndSeconds(player.duration);
      }
    };
    player.addEventListener('loadedmetadata', handleMetadata);
    player.src = url;
    return () => {
      player.removeEventListener('loadedmetadata', handleMetadata);
      player.pause();
      URL.revokeObjectURL(url);
    };
  }, [audio]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const makeTrimmedAudio = async () => {
    if (duration === null || startSeconds < 0 || endSeconds > duration || endSeconds <= startSeconds) {
      setError('Zadejte platný začátek a konec výřezu.');
      return null;
    }
    if (startSeconds === 0 && endSeconds === duration) return audio;

    setIsPreparing(true);
    setError(null);
    try {
      return await trimAudio(audio, startSeconds, endSeconds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audio se nepodařilo oříznout.');
      return null;
    } finally {
      setIsPreparing(false);
    }
  };

  const handlePreview = async () => {
    const trimmedAudio = await makeTrimmedAudio();
    if (trimmedAudio) {
      setPreviewUrl(URL.createObjectURL(trimmedAudio));
    }
  };

  const handleTranscribe = async () => {
    const trimmedAudio = await makeTrimmedAudio();
    if (trimmedAudio) onTranscribe(trimmedAudio);
  };

  const handleStartChange = (value: number) => {
    setStartSeconds(value);
    setPreviewUrl(null);
    setError(null);
  };

  const handleEndChange = (value: number) => {
    setEndSeconds(value);
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <div className="flex w-full max-w-2xl flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3">
        <div className="inline-flex px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
          Volitelné
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Oříznout audio</h2>
        <p className="text-slate-500 font-medium">
          Nastavte začátek a konec nahrávky. Přepisovat se bude pouze vybraný úsek.
        </p>
      </div>

      <div className="w-full space-y-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 md:p-8">
        <div className="w-full rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <audio ref={audioRef} controls className="w-full h-10" aria-label="Přehrát původní audio" />
        </div>

        {duration !== null && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-bold text-slate-700">
                <span>Začátek (sekundy)</span>
                <input
                  type="number"
                  min={0}
                  max={duration}
                  step={0.1}
                  value={startSeconds}
                  onChange={event => handleStartChange(Number(event.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono"
                />
              </label>
              <label className="space-y-2 text-sm font-bold text-slate-700">
                <span>Konec (sekundy)</span>
                <input
                  type="number"
                  min={0}
                  max={duration}
                  step={0.1}
                  value={endSeconds}
                  onChange={event => handleEndChange(Number(event.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono"
                />
              </label>
            </div>
            <p className="text-center text-xs font-bold text-slate-400">
              Délka audia {formatTime(duration)} · výběr {formatTime(Math.max(0, endSeconds - startSeconds))}
            </p>
          </>
        )}

        <button
          type="button"
          onClick={handlePreview}
          disabled={duration === null || isPreparing}
          className="w-full rounded-xl border border-indigo-200 bg-white px-5 py-3 font-bold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPreparing ? 'Připravuji výřez…' : 'Náhled vybraného úseku'}
        </button>
        {previewUrl && (
          <div className="w-full rounded-2xl border border-indigo-100 bg-white p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600">Náhled výřezu</p>
            <audio controls src={previewUrl} className="w-full h-10" aria-label="Přehrát vybraný úsek audia" />
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="w-full rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleTranscribe}
        disabled={duration === null || isPreparing}
        className="flex w-full items-center justify-center space-x-3 rounded-2xl bg-indigo-600 py-5 text-xl font-black text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Scissors size={22} />
        <span>{isPreparing ? 'Připravuji výřez…' : 'Přepsat vybraný úsek'}</span>
        {!isPreparing && <ArrowRight size={22} />}
      </button>
    </div>
  );
};

export default AudioTrimmer;
