# Research: PDF Processing & Ollama Integration

## PDF Text Extraction Library

**Decision**: Use `pypdf` for text extraction.
**Rationale**: 
- `fpdf2` (mentioned in user input) is a library for **creating** PDFs and does not support text extraction.
- `pypdf` is already present in `backend/requirements.txt`.
- `pypdf` is a robust, pure-Python library that handles text extraction efficiently without external system dependencies.
**Alternatives considered**: 
- `pdfplumber`: Better for table extraction but significantly slower and not in `requirements.txt`.
- `PyMuPDF` (fitz): Faster, but requires C++ bindings which may complicate cross-platform portability.

## Ollama Document Context

**Decision**: Pass extracted text as a "Supporting Context" block in the LLM prompt.
**Rationale**: 
- The `ollama` Python library and underlying API do not natively support direct PDF uploads for multimodal context (unlike images).
- Context window of the used models (gpt-oss:20b, gemma) is sufficiently large (8192+ tokens) to accommodate extracted text from typical lecture slides or papers.
- This approach provides full control over how the document context is prioritized relative to the audio transcript.

## Interface & State Flow

**Decision**: Implement a stateless extraction endpoint `POST /api/pdf/extract`.
**Rationale**: 
- Aligns with Principle I (Modularity) and Principle II (Statelessness) of the project constitution.
- **Workflow**:
  1. Frontend uploads PDF to `/api/pdf/extract`.
  2. Backend extracts text (using `pypdf`) and returns a JSON response with the extracted content.
  3. Frontend stores the extracted text in IndexedDB (persistence).
  4. Summarization request sends both the transcript and the stored document text to the LLM.
- This ensures the server never stores files or state, while the user can recover their work if the browser refreshes.
