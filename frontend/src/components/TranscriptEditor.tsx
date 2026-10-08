import React, { useState } from 'react';
import { Download, FileText, CheckCircle, ArrowRight, Type } from 'lucide-react';
import { SupportedLanguage, translations } from '../i18n';

interface TranscriptEditorProps {
  initialText: string;
  onConfirm: (editedText: string) => void;
  language: SupportedLanguage;
}

const TranscriptEditor: React.FC<TranscriptEditorProps> = ({ initialText, onConfirm, language }) => {
  const [text, setText] = useState(initialText);
  const t = translations[language];

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col space-y-8 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3">
        <div className="inline-flex px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">{t.transcriptReviewBadge}</div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t.transcriptTitle}</h2>
        <p className="text-slate-500 font-medium">{t.transcriptDescription}</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-slate-50/80 px-8 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-slate-500">
            <Type size={16} />
            <span className="text-xs font-black uppercase tracking-widest">{t.transcriptEditorLabel}</span>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 py-2 px-4 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all font-bold text-xs shadow-sm"
          >
            <Download size={14} />
            <span>{t.downloadText}</span>
          </button>
        </div>

        <div className="relative p-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-[400px] p-8 rounded-2xl border-none focus:ring-0 outline-none transition-all resize-none text-slate-700 leading-relaxed font-medium text-lg placeholder-slate-300"
            placeholder={t.transcriptPlaceholder}
          />
          <div className="absolute bottom-6 right-8 px-3 py-1 bg-slate-100 rounded-lg text-[10px] text-slate-400 font-black uppercase tracking-widest">
            {text.split(/\s+/).filter(Boolean).length} {t.words} • {text.length} {t.characters}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => onConfirm(text)}
          className="flex items-center space-x-3 py-5 px-12 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all font-black text-xl active:scale-[0.98] group"
        >
          <CheckCircle size={24} className="group-hover:scale-110 transition-transform" />
          <span>{t.confirmAndContinue}</span>
          <ArrowRight size={24} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default TranscriptEditor;
