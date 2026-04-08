import React from 'react';
import { Download, RefreshCw, FileText, CheckCircle } from 'lucide-react';

interface SummaryViewProps {
  markdown: string;
  onDownloadPdf: () => void;
  onReset: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ markdown, onDownloadPdf, onReset }) => {
  return (
    <div className="flex flex-col space-y-8 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 text-green-600">
          <CheckCircle size={28} />
          <h2 className="text-2xl font-bold">AI Souhrn Připraven</h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onDownloadPdf}
            className="flex items-center space-x-2 py-2 px-5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all font-bold border border-blue-100 shadow-sm"
          >
            <Download size={18} />
            <span>Stáhnout PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 md:p-16 border-2 border-gray-50 shadow-inner min-h-[400px]">
        <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed font-medium">
          {/* Simple markdown rendering for preview */}
          {markdown.split('\n').map((line, i) => (
            <p key={i} className="mb-4">
              {line.startsWith('###') ? <span className="text-xl font-bold text-blue-600">{line.replace('###', '')}</span> : 
               line.startsWith('-') ? <span className="flex items-start">
                 <span className="text-blue-400 mr-2">•</span>
                 <span>{line.replace('-', '')}</span>
               </span> : line}
            </p>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 py-4 px-10 rounded-2xl border-2 border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all font-bold uppercase tracking-widest text-xs"
        >
          <RefreshCw size={16} />
          <span>Zpracovat další přednášku</span>
        </button>
      </div>
    </div>
  );
};

export default SummaryView;
