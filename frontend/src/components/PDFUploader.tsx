import React, { useRef, useState } from 'react';
import { FileText, Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { UploadedDocument } from '../hooks/usePersistence';

interface PDFUploaderProps {
  documents: UploadedDocument[];
  onUpload: (doc: UploadedDocument) => void;
  onRemove: (id: string) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api/v1`;

const PDFUploader: React.FC<PDFUploaderProps> = ({ documents, onUpload, onRemove }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (documents.length >= 3) {
      setError("Můžete nahrát maximálně 3 dokumenty.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Soubor je příliš velký (max 10MB).");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/pdf/extract`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Chyba při extrakci textu.");
      }

      const data = await response.json();
      const newDoc: UploadedDocument = {
        // Simple crypto.randomUUID() check (falls back if needed)
        id: typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 15),
        name: data.name,
        size: data.size,
        extractedText: data.content,
        timestamp: Date.now(),
      };

      onUpload(newDoc);
    } catch (err: unknown) {
      console.error('PDF extraction failed:', err);
      const errorMessage = err instanceof Error ? err.message : "Nepodařilo se zpracovat dokument.";
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
          <FileText size={20} className="text-indigo-600" />
          Podpůrné dokumenty
        </h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
          {documents.length} / 3
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm animate-in fade-in zoom-in-95 duration-200 group hover:border-indigo-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <CheckCircle2 size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 truncate max-w-[200px] leading-tight">{doc.name}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{(doc.size / 1024).toFixed(1)} KB</span>
              </div>
            </div>
            <button
              onClick={() => onRemove(doc.id)}
              className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              title="Smazat dokument"
            >
              <X size={20} />
            </button>
          </div>
        ))}

        {documents.length < 3 && !isUploading && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all group"
          >
            <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Upload size={24} />
            </div>
            <span className="font-black text-sm tracking-tight uppercase tracking-wider">Přidat PDF dokument</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              className="hidden"
            />
          </button>
        )}

        {isUploading && (
          <div className="flex flex-col items-center justify-center gap-4 p-8 bg-indigo-50/50 border border-indigo-100 border-dashed rounded-[1.5rem] text-indigo-600 font-black text-sm animate-pulse">
            <Loader2 size={32} className="animate-spin" />
            <span className="tracking-tight uppercase tracking-wider">Zpracovávám text z PDF...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 animate-in shake-in duration-300">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFUploader;
