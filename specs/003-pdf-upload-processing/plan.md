# Implementation Plan: PDF Upload Processing

**Branch**: `003-pdf-upload-processing` | **Date**: 2026-03-21 | **Spec**: `/specs/003-pdf-upload-processing/spec.md`
**Input**: Feature specification from `/specs/003-pdf-upload-processing/spec.md`

## Summary
Implement a stateless PDF text extraction service and integrate it into the LLM summarization pipeline. Extracted text from up to 3 PDF files (10MB each) will be stored in the frontend's IndexedDB and sent as supporting context to the Ollama LLM provider to improve summary accuracy and technical grounding.

## Technical Context

**Language/Version**: Python 3.12+ (Backend), TypeScript 5.4+ (Frontend)
**Primary Dependencies**: `pypdf` (Text extraction), `FastAPI` (Backend API), `ollama` (LLM adapter), `React 18` (Frontend)
**Storage**: Stateless server; IndexedDB (`idb-keyval`) for frontend persistence of extracted text.
**Testing**: `pytest` for extraction logic; Vitest for frontend components.
**Target Platform**: Web (modern browsers).
**Project Type**: Full-stack web application.
**Performance Goals**: PDF text extraction in under 8 seconds for a 10-page document.
**Constraints**: 10MB per file, maximum 3 files per session.

## Constitution Check

*GATE: Passed. Principles of Modularity, Statelessness, and Simplicity are maintained.*

- **I. Modularity**: Extraction logic is isolated in a new service.
- **II. Simplicity**: Standard text extraction is used instead of complex RAG.
- **III. Statelessness**: Server does not store documents; all state is client-side.

## Project Structure

### Documentation (this feature)

```text
specs/003-pdf-upload-processing/
├── plan.md              # This file
├── research.md          # PDF extraction and Ollama integration research
├── data-model.md        # Document and Context entity definitions
├── quickstart.md        # Implementation roadmap
└── contracts/
    └── api.md           # /api/pdf/extract and updated /api/llm/summarize
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   └── pdf.py             # NEW: Extraction endpoint
│   ├── services/
│   │   └── documents.py       # NEW: Document extraction service (pypdf)
│   └── adapters/
│       └── ollama_llm.py      # UPDATE: Handle supporting_docs in prompt
└── tests/
    └── test_documents.py      # NEW: Extraction unit tests

frontend/
├── src/
│   ├── components/
│   │   └── PDFUploader.tsx    # NEW: UI for file selection and status
│   ├── hooks/
│   │   └── usePersistence.ts  # UPDATE: Store UploadedDocument in IndexedDB
│   └── services/
│       └── summary.ts         # UPDATE: Include docs in summarize call
└── tests/
    └── components/
        └── PDFUploader.test.tsx # NEW: UI tests
```

**Structure Decision**: Option 2 (Web application) is used as it fits the existing backend/frontend separation.

## Complexity Tracking

*No violations detected.*
