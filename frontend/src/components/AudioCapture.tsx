import React, { useRef } from 'react';
import { Mic, Square, Upload, Trash2, Download, ArrowRight, Play } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface AudioCaptureProps {
  onCaptured: (blob: Blob) => void;
}

const AudioCapture: React.FC<AudioCaptureProps> = ({ onCaptured }) => {
  const { isRecording, recording, startRecording, stopRecording, clearRecording, setRecording } = useAudioRecorder();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert("Soubor je příliš velký (max 50MB).");
        return;
      }
      const url = URL.createObjectURL(file);
      setRecording({ blob: file, url });
    }
  };

  const handleDownload = () => {
    if (!recording) return;
    const a = document.createElement('a');
    a.href = recording.url;
    a.download = `přednáška_${new Date().getTime()}.webm`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center space-y-10 w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3">
        <div className="inline-flex px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">Začněte zde</div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Vstupní audio</h2>
        <p className="text-slate-500 font-medium">Nahrajte přednášku v reálném čase nebo nahrajte existující audio soubor.</p>
      </div>

      {!recording ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex flex-col items-center justify-center p-10 rounded-[2rem] border-2 transition-all space-y-5 group relative overflow-hidden
              ${isRecording 
                ? 'bg-rose-50 border-rose-200 text-rose-600' 
                : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:border-indigo-300 hover:bg-white'}`}
          >
            {isRecording && <div className="absolute top-4 right-4 flex items-center space-x-1.5">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
            </div>}
            <div className={`p-5 rounded-2xl ${isRecording ? 'bg-rose-100' : 'bg-white shadow-sm'} group-hover:scale-110 transition-transform duration-300`}>
              {isRecording ? <Square size={36} fill="currentColor" /> : <Mic size={36} />}
            </div>
            <span className="font-black text-lg tracking-tight">{isRecording ? 'Zastavit' : 'Nahrávat'}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-10 rounded-[2rem] border-2 border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-white transition-all space-y-5 group"
          >
            <div className="p-5 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Upload size={36} />
            </div>
            <span className="font-black text-lg tracking-tight">Nahrát soubor</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="audio/*" 
              className="hidden" 
            />
          </button>
        </div>
      ) : (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 md:p-10 flex flex-col items-center space-y-8 animate-in zoom-in-95 duration-300">
          <div className="flex items-center space-x-3 text-indigo-600 bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">
            <Play size={16} fill="currentColor" />
            <span className="font-black text-xs uppercase tracking-widest">Audio připraveno</span>
          </div>
          
          <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <audio controls src={recording.url} className="w-full h-10" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full pt-2">
            <button
              onClick={clearRecording}
              className="flex items-center justify-center space-x-2 py-4 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all font-bold text-sm shadow-sm"
            >
              <Trash2 size={18} />
              <span>Smazat</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center space-x-2 py-4 rounded-2xl bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-50 transition-all font-bold text-sm shadow-sm"
            >
              <Download size={18} />
              <span>Stáhnout</span>
            </button>
          </div>

          <button
            onClick={() => onCaptured(recording.blob)}
            className="w-full flex items-center justify-center space-x-3 py-5 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all font-black text-xl active:scale-[0.98]"
          >
            <span>Spustit přepis</span>
            <ArrowRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioCapture;
