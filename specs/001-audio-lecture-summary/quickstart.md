# Quickstart: Audio Lecture Summary Application

## 1. Environment Setup
- **Backend**: Python 3.12+
  - `pip install fastapi uvicorn httpx weasyprint markdown2`
- **Frontend**: Node.js 20+
  - `npm create vite@latest frontend -- --template react-ts`
  - `npm install lucide-react idb-keyval`

## 3. Core Workflow Development
1. **Phase 1**: Implement `useAudioRecorder` hook and capture UI.
2. **Phase 2**: Implement FastAPI proxy to KKY ASR.
3. **Phase 3**: Implement Transcript Editor with IndexedDB persistence.
4. **Phase 4**: Integrate Ollama KKY summarization.
5. **Phase 5**: Implement PDF generation via WeasyPrint.

## 4. Test Scenarios
- **Scenario A**: Record 10s audio -> Transcribe -> Edit 1 word -> Summarize -> Export PDF.
- **Scenario B**: Upload 50MB MP3 -> Ensure progress status text updates correctly.
- **Scenario C**: Refresh page during Review stage -> Verify transcript persists from IndexedDB.
