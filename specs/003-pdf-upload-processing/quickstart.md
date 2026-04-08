# Quickstart: PDF Upload & Context Augmentation

## Implementation Steps

### Backend
1.  **Add `pypdf` dependency** (if not already installed).
2.  **Implement `DocumentExtractionService`** in `backend/src/services/documents.py`.
3.  **Add `/api/pdf/extract` route** in `backend/src/api/pdf.py`.
4.  **Update `OllamaLLMAdapter.generate_response`** in `backend/src/adapters/ollama_llm.py` to handle `supporting_docs`.

### Frontend
1.  **Create `PDFUploader` component** in `frontend/src/components/PDFUploader.tsx`.
2.  **Update `usePersistence` hook** to store `UploadedDocument` objects in IndexedDB.
3.  **Integrate `PDFUploader`** into the main `App.tsx` flow.
4.  **Update `summaryService`** to send stored document text in the `POST /api/llm/summarize` request.

## Verification
-   **Unit Test**: Extraction service returns text for a valid PDF.
-   **Integration Test**: End-to-end flow from PDF upload to summary generation with combined context.
-   **Visual Check**: Filenames are displayed correctly in the UI.
