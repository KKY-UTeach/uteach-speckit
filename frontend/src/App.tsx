import React, { useState, useEffect } from 'react';
import ProgressBar from './components/ProgressBar';
import AudioCapture from './components/AudioCapture';
import TranscriptEditor from './components/TranscriptEditor';
import SummaryView from './components/SummaryView';
import PDFUploader from './components/PDFUploader';
import { transcribeAudio } from './services/asr';
import { summarizeTranscript, exportToPdf } from './services/summary';
import { usePersistence, SessionData, UploadedDocument } from './hooks/usePersistence';
import { AlertCircle, Loader2, Sparkles, History, X, Cpu, FileUp, ArrowRight } from 'lucide-react';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [format, setFormat] = useState('summary');
  const [supportingDocs, setSupportingDocs] = useState<UploadedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showRestore, setShowRestore] = useState(false);
  const [pendingSession, setPendingSession] = useState<SessionData | null>(null);

  const { saveSession, loadSession, clearSession } = usePersistence();

  useEffect(() => {
    const checkSession = async () => {
      const saved = await loadSession();
      if (saved && (saved.transcript || (saved.supportingDocs && saved.supportingDocs.length > 0))) {
        setPendingSession(saved);
        setShowRestore(true);
      }
    };
    checkSession();
  }, [loadSession]);

  useEffect(() => {
    if (transcript || currentStep > 1 || supportingDocs.length > 0) {
      saveSession({
        transcript,
        currentStep,
        format,
        supportingDocs,
        lastUpdated: Date.now()
      });
    }
  }, [transcript, currentStep, format, supportingDocs, saveSession]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep > 1 && currentStep < 4) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep]);

  const restoreSession = () => {
    if (pendingSession) {
      setTranscript(pendingSession.transcript);
      setCurrentStep(pendingSession.currentStep);
      setFormat(pendingSession.format);
      setSupportingDocs(pendingSession.supportingDocs || []);
    }
    setShowRestore(false);
  };

  const handleAudioCaptured = async (blob: Blob) => {
    setIsLoading(true);
    setError(null);
    setStatusText('Nahrávání audia...');
    try {
      setTimeout(() => setStatusText('Přepisování přednášky...'), 1500);
      const response = await transcribeAudio(blob);
      setTranscript(response.text);
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsLoading(false);
      setStatusText('');
    }
  };

  const handleTranscriptConfirmed = (text: string) => {
    setTranscript(text);
    setCurrentStep(3);
  };

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);
    setStatusText('AI analyzuje přednášku...');
    try {
      const docs = supportingDocs.map(d => ({ name: d.name, content: d.extractedText }));
      const response = await summarizeTranscript(transcript, format, docs);
      setSummary(response.markdown);
      setCurrentStep(4);
    } catch (err) {
      setError('Generování souhrnu selhalo.');
    } finally {
      setIsLoading(false);
      setStatusText('');
    }
  };

  const handleAddDocument = (doc: UploadedDocument) => {
    setSupportingDocs(prev => [...prev, doc]);
  };

  const handleRemoveDocument = (id: string) => {
    setSupportingDocs(prev => prev.filter(d => d.id !== id));
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await exportToPdf(summary);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `souhrn_${new Date().getTime()}.pdf`;
      a.click();
    } catch (err) {
      setError('Export do PDF selhal.');
    }
  };

  const reset = async () => {
    setTranscript('');
    setSummary('');
    setSupportingDocs([]);
    setCurrentStep(1);
    setError(null);
    await clearSession();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center font-sans">
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-8 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3 group cursor-default">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">U</div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Uteach <span className="text-indigo-600">AI</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Smart Lecture Assistant</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
          <Cpu size={14} className="text-slate-400" />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Stateless Core</span>
        </div>
      </header>

      <main className="max-w-5xl w-full p-6 space-y-10 mb-20 mt-6 animate-in fade-in duration-700">
        <ProgressBar currentStep={currentStep} />
        
        {showRestore && (
          <div className="w-full p-5 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 text-white flex items-center justify-between animate-in slide-in-from-top-2 duration-500">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-2.5 rounded-lg">
                <History size={20} />
              </div>
              <div>
                <p className="font-bold text-base leading-tight">Nedokončená práce</p>
                <p className="text-indigo-100 text-sm opacity-90">Chcete obnovit předchozí sezení?</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={restoreSession}
                className="bg-white text-indigo-600 px-5 py-2 rounded-xl font-black text-sm hover:bg-slate-50 transition-all shadow-md active:scale-95"
              >Obnovit</button>
              <button 
                onClick={() => setShowRestore(false)}
                className="text-white/60 hover:text-white p-2 transition-colors"
              ><X size={20} /></button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 p-8 md:p-16 min-h-[600px] flex flex-col items-center relative overflow-hidden transition-all duration-500 hover:shadow-md">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20"></div>
          
          {error && (
            <div className="w-full max-w-2xl mb-10 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-center space-x-3 animate-in slide-in-from-top-4 duration-300">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-8 h-[450px]">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={24} className="text-indigo-600 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-slate-900 font-black text-3xl tracking-tight leading-tight">{statusText}</p>
                <p className="text-slate-400 font-medium tracking-wide">Dejte nám chvilku, kouzlíme s AI...</p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              {currentStep === 1 && (
                <div className="flex flex-col items-center space-y-12 w-full max-w-2xl">
                  <AudioCapture onCaptured={handleAudioCaptured} />
                  <div className="w-full border-t border-slate-100 pt-10">
                    <PDFUploader 
                      documents={supportingDocs} 
                      onUpload={handleAddDocument} 
                      onRemove={handleRemoveDocument} 
                    />
                  </div>
                  {supportingDocs.length > 0 && (
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="flex items-center space-x-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:bg-indigo-50 px-6 py-3 rounded-xl transition-all border border-indigo-100 animate-in slide-in-from-bottom-2 duration-300 shadow-sm"
                    >
                      <span>Pokračovat pouze s PDF</span>
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              )}
              {currentStep === 2 && <TranscriptEditor initialText={transcript} onConfirm={handleTranscriptConfirmed} />}
              {currentStep === 3 && (
                <div className="flex flex-col items-center space-y-12 w-full max-w-2xl animate-in fade-in zoom-in-95 duration-500">
                  <div className="text-center space-y-3">
                    <div className="inline-flex px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">Poslední krok</div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Nastavení výstupu</h2>
                    <p className="text-slate-500 font-medium max-w-md mx-auto">Vyberte styl zpracování, který vám nejvíce vyhovuje pro studium.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Formát dokumentu</label>
                      <div className="flex flex-col space-y-3">
                        {[
                          { id: 'summary', label: 'Strukturovaný souhrn', desc: 'Přehledné odstavce s klíčovými body.' },
                          { id: 'keyword-table', label: 'Tabulka pojmů', desc: 'Seznam definic a důležitých termínů.' }
                        ].map((f) => (
                          <button 
                            key={f.id}
                            onClick={() => setFormat(f.id)}
                            className={`p-5 rounded-[1.5rem] border-2 text-left transition-all group ${
                              format === f.id 
                                ? 'bg-indigo-50 border-indigo-500 ring-4 ring-indigo-500/10' 
                                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                            }`}
                          >
                            <p className={`font-bold transition-colors ${format === f.id ? 'text-indigo-700' : 'text-slate-700'}`}>{f.label}</p>
                            <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">{f.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Podklady (PDF)</label>
                      <PDFUploader 
                        documents={supportingDocs} 
                        onUpload={handleAddDocument} 
                        onRemove={handleRemoveDocument} 
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateSummary}
                    className="w-full py-5 rounded-[1.5rem] bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all font-black text-xl flex items-center justify-center space-x-4 active:scale-[0.98]"
                  >
                    <Sparkles size={24} className="fill-indigo-400" />
                    <span>Zpracovat přednášku</span>
                  </button>
                </div>
              )}
              {currentStep === 4 && (
                <SummaryView 
                  markdown={summary} 
                  onDownloadPdf={handleDownloadPdf}
                  onReset={reset} 
                />
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between w-full px-6 items-center">
          {currentStep > 1 && !isLoading ? (
            <button 
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} 
              className="text-slate-400 hover:text-indigo-600 font-black tracking-widest uppercase text-[10px] transition-colors flex items-center space-x-2"
            >
              <span className="text-base leading-none">←</span>
              <span>Zpět na {currentStep === 2 ? 'Nahrávání' : currentStep === 3 ? 'Editor' : 'Nastavení'}</span>
            </button>
          ) : <div />}
          
          <div className="px-4 py-1.5 bg-slate-200/50 rounded-full text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
            <span>Krok {currentStep} ze 4 • {Math.round((currentStep/4)*100)}% hotovo</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
