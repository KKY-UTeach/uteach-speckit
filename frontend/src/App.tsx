import React, { useState, useEffect } from 'react';
import ProgressBar from './components/ProgressBar';
import AudioCapture from './components/AudioCapture';
import TranscriptEditor from './components/TranscriptEditor';
import SummaryView from './components/SummaryView';
import PDFUploader from './components/PDFUploader';
import { transcribeAudio } from './services/asr';
import { summarizeTranscript, exportToPdf } from './services/summary';
import { usePersistence, SessionData, UploadedDocument } from './hooks/usePersistence';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, SupportedLanguage, languageLabels, translations } from './i18n';
import { AlertCircle, Sparkles, History, X, Cpu, ArrowRight, Globe } from 'lucide-react';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [sourceAudio, setSourceAudio] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [format, setFormat] = useState('summary');
  const [supportingDocs, setSupportingDocs] = useState<UploadedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showRestore, setShowRestore] = useState(false);
  const [pendingSession, setPendingSession] = useState<SessionData | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
    const storedLanguage = window.localStorage.getItem('uteach-language');
    if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage as SupportedLanguage)) {
      return storedLanguage as SupportedLanguage;
    }
    return DEFAULT_LANGUAGE;
  });

  const { saveSession, loadSession, clearSession } = usePersistence();
  const t = translations[language];

  useEffect(() => {
    window.localStorage.setItem('uteach-language', language);
  }, [language]);

  useEffect(() => {
    const checkSession = async () => {
      const saved = await loadSession();
      if (saved && (saved.transcript || (saved.supportingDocs && saved.supportingDocs.length > 0))) {
        setPendingSession(saved);
        setShowRestore(true);
        if (saved.language && SUPPORTED_LANGUAGES.includes(saved.language as SupportedLanguage)) {
          setLanguage(saved.language as SupportedLanguage);
        }
      }
    };
    checkSession();
  }, [loadSession]);

  useEffect(() => {
    if (transcript || currentStep > 1 || supportingDocs.length > 0) {
      saveSession({
        transcript,
        currentStep,
        workflowVersion: 3,
        format,
        supportingDocs,
        language,
        lastUpdated: Date.now()
      });
    }
  }, [transcript, currentStep, format, supportingDocs, language, saveSession]);

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
      const restoredStep = pendingSession.workflowVersion === 2
        ? pendingSession.currentStep <= 2
          ? 1
          : pendingSession.currentStep - 1
        : Math.min(pendingSession.currentStep, 4);
      setCurrentStep(restoredStep);
      setFormat(pendingSession.format);
      setSupportingDocs(pendingSession.supportingDocs || []);
      if (pendingSession.language && SUPPORTED_LANGUAGES.includes(pendingSession.language as SupportedLanguage)) {
        setLanguage(pendingSession.language as SupportedLanguage);
      }
    }
    setShowRestore(false);
  };

  const handleAudioCaptured = async (blob: Blob, originalAudio: Blob) => {
    setSourceAudio(originalAudio);
    setIsLoading(true);
    setError(null);
    setStatusText(t.recordingStatus);
    try {
      setTimeout(() => setStatusText(t.transcribingStatus), 1500);
      const response = await transcribeAudio(blob, language);
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
    setStatusText(t.analyzingStatus);
    try {
      const docs = supportingDocs.map(d => ({ name: d.name, content: d.extractedText }));
      const response = await summarizeTranscript(transcript, format, docs, language);
      setSummary(response.markdown);
      setCurrentStep(4);
    } catch (err) {
      setError(t.summaryError);
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
      a.download = `summary_${new Date().getTime()}.pdf`;
      a.click();
    } catch (err) {
      setError(t.exportError);
    }
  };

  const reset = async () => {
    setTranscript('');
    setSummary('');
    setSourceAudio(null);
    setSupportingDocs([]);
    setCurrentStep(1);
    setError(null);
    await clearSession();
  };

  const formatOptions = [
    { id: 'summary', label: t.formatOptions.summary.label, desc: t.formatOptions.summary.desc },
    { id: 'keyword-table', label: t.formatOptions['keyword-table'].label, desc: t.formatOptions['keyword-table'].desc },
  ];
  const stepSummary = t.stepSummary
    .replace('{step}', String(currentStep))
    .replace('{percent}', String(Math.round((currentStep / 4) * 100)));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center font-sans">
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-8 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3 group cursor-default">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">U</div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Uteach <span className="text-indigo-600">AI</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{t.appTagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
            <Cpu size={14} className="text-slate-400" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t.coreStatus}</span>
          </div>
          <button
            type="button"
            aria-label={t.languageSelectorLabel}
            onClick={() => setLanguage(language === 'cs' ? 'en' : 'cs')}
            className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 rounded-full text-sm font-bold text-slate-700 hover:border-indigo-200 hover:text-indigo-600 transition-colors shadow-sm"
          >
            <Globe size={16} />
            <span>{languageLabels[language]}</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl w-full p-6 space-y-10 mb-20 mt-6 animate-in fade-in duration-700">
        <ProgressBar currentStep={currentStep} language={language} />

        {showRestore && (
          <div className="w-full p-5 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 text-white flex items-center justify-between animate-in slide-in-from-top-2 duration-500">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-2.5 rounded-lg">
                <History size={20} />
              </div>
              <div>
                <p className="font-bold text-base leading-tight">{t.restoreTitle}</p>
                <p className="text-indigo-100 text-sm opacity-90">{t.restoreMessage}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={restoreSession}
                className="bg-white text-indigo-600 px-5 py-2 rounded-xl font-black text-sm hover:bg-slate-50 transition-all shadow-md active:scale-95"
              >{t.restoreAction}</button>
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
                <p className="text-slate-400 font-medium tracking-wide">{t.loadingMessage}</p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              {currentStep === 1 && (
                <div className="flex flex-col items-center space-y-12 w-full max-w-2xl">
                  <AudioCapture initialAudio={sourceAudio} onCaptured={handleAudioCaptured} language={language} />
                  <div className="w-full border-t border-slate-100 pt-10">
                    <PDFUploader
                      documents={supportingDocs}
                      onUpload={handleAddDocument}
                      onRemove={handleRemoveDocument}
                      language={language}
                    />
                  </div>
                  {supportingDocs.length > 0 && (
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="flex items-center space-x-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:bg-indigo-50 px-6 py-3 rounded-xl transition-all border border-indigo-100 animate-in slide-in-from-bottom-2 duration-300 shadow-sm"
                    >
                      <span>{t.continuePdf}</span>
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              )}
              {currentStep === 2 && <TranscriptEditor initialText={transcript} onConfirm={handleTranscriptConfirmed} language={language} />}
              {currentStep === 3 && (
                <div className="flex flex-col items-center space-y-12 w-full max-w-2xl animate-in fade-in zoom-in-95 duration-500">
                  <div className="text-center space-y-3">
                    <div className="inline-flex px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">{t.summarySettingsBadge}</div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t.summarySettingsTitle}</h2>
                    <p className="text-slate-500 font-medium max-w-md mx-auto">{t.summarySettingsSubtitle}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t.formatLabel}</label>
                      <div className="flex flex-col space-y-3">
                        {formatOptions.map((f) => (
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
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t.supportingDocsLabel}</label>
                      <PDFUploader
                        documents={supportingDocs}
                        onUpload={handleAddDocument}
                        onRemove={handleRemoveDocument}
                        language={language}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateSummary}
                    className="w-full py-5 rounded-[1.5rem] bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all font-black text-xl flex items-center justify-center space-x-4 active:scale-[0.98]"
                  >
                    <Sparkles size={24} className="fill-indigo-400" />
                    <span>{t.generateSummary}</span>
                  </button>
                </div>
              )}
              {currentStep === 4 && (
                <SummaryView
                  markdown={summary}
                  onDownloadPdf={handleDownloadPdf}
                  onReset={reset}
                  language={language}
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
              <span>
                {t.backLabel} {currentStep === 2 ? t.backSteps.recording : currentStep === 3 ? t.backSteps.editor : t.backSteps.settings}
              </span>
            </button>
          ) : <div />}

          <div className="px-4 py-1.5 bg-slate-200/50 rounded-full text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
            <span>{stepSummary}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
