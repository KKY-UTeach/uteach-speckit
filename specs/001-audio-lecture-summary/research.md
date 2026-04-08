# Research: Audio Lecture Summary Application

## Technical Decisions

### 1. KKY ASR API Integration
- **Decision**: Use `httpx` for asynchronous multipart form-data uploads.
- **Rationale**: KKY ASR typically requires binary audio upload. Async handling prevents blocking the FastAPI event loop during large file transfers.
- **Alternatives**: `requests` (synchronous, rejected for performance).

### 2. Ollama KKY Summarization
- **Decision**: Implement a template-based prompt system for Czech summarization.
- **Rationale**: Ollama's `llama3` or `mistral` models perform well with structured prompts. Hardcoding Czech instructions in the system prompt ensures FR-017 compliance.
- **Prompt Structure**: `Context: {supporting_docs} | Action: Summarize {transcript} | Output: Markdown`.

### 3. PDF Generation (fpdf2)
- **Decision**: Convert Markdown to plain text then to PDF using `fpdf2`.
- **Rationale**: Replaced `weasyprint` because it requires external GTK+ system libraries which are often missing on Windows/VM environments. `fpdf2` is a pure-Python library ensuring maximum portability for the local/VM deployment.
- **Alternatives**: `weasyprint` (rejected due to complex system dependencies).

### 4. Session Recovery (IndexedDB)
- **Decision**: Use `IndexedDB` (via `idb-keyval`) for storing audio blobs and transcripts on the client.
- **Rationale**: `LocalStorage` has a ~5MB limit, which is insufficient for audio files. IndexedDB supports large binary data and satisfies FR-019.
- **Workflow**: Auto-save every 30s or on stage transition.

## Resolved Unknowns

| Unknown | Decision | Rationale |
|---------|----------|-----------|
| Audio Storage Limit? | None (Client-side) | Use IndexedDB to handle files up to hundreds of MBs. |
| PDF Styling? | CSS-in-HTML | Most flexible way to achieve "Ease of Use" visuals in static docs. |
| API Statelessness? | Token-based passing | Pass transcript and docs in the body of the summarization request. |

## Best Practices

- **Security**: Audio blobs processed in memory; no permanent disk storage on the backend to maintain statelessness.
- **UX**: Use `MediaRecorder` API with `audio/webm` or `audio/ogg` for broad browser compatibility.
- **Performance**: Chunked uploads if ASR API supports it; otherwise, provide clear "Processing..." status text.
