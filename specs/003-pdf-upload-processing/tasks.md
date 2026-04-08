# Tasks: PDF Upload Processing

**Input**: Design documents from `specs/003-pdf-upload-processing/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Phase 1: Setup

**Purpose**: Project initialization and dependency check

- [X] T001 Create project structure per implementation plan (backend/src/api/pdf.py, backend/src/services/documents.py)
- [X] T002 Verify `pypdf` is in `backend/requirements.txt` and installable via `pip install -r requirements.txt`

## Phase 2: Foundational

**Purpose**: Core infrastructure blocking user stories

- [X] T003 [P] Update `SummarizeRequest` in `backend/src/api/llm.py` to support new `supporting_docs` structure
- [X] T004 [P] Implement `DocumentExtractionService` in `backend/src/services/documents.py` using `pypdf`
- [X] T005 [P] Implement unit tests for `DocumentExtractionService` in `backend/tests/test_documents.py`
- [X] T006 Update `OllamaLLMAdapter.generate_response` in `backend/src/adapters/ollama_llm.py` to handle `supporting_docs` list with content
- [X] T007 [P] Update `usePersistence` hook in `frontend/src/hooks/usePersistence.ts` to support `UploadedDocument` storage

---

## Phase 3: User Story 1 - Supplemental PDF Context (Priority: P1) đźŽŻ MVP

**Goal**: Upload PDF alongside audio to augment the generated summary.

**Independent Test**: Record a short audio, upload a PDF with specific terminology, and verify the terminology appears in the final summary.

### Tests for User Story 1

- [X] T008 [P] [US1] Integration test for Audio + PDF combined summary context in `backend/tests/test_integration_summary.py`

### Implementation for User Story 1

- [X] T009 [P] [US1] Create extraction endpoint `POST /api/v1/pdf/extract` in `backend/src/api/pdf.py`
- [X] T010 [P] [US1] Register PDF router in `backend/src/main.py`
- [X] T011 [P] [US1] Create basic `PDFUploader` component in `frontend/src/components/PDFUploader.tsx` for file selection
- [X] T012 [US1] Update `summaryService` in `frontend/src/services/summary.ts` to include `supporting_docs` in request body
- [X] T013 [US1] Integrate `PDFUploader` into main `App.tsx` and connect it to document state

**Checkpoint**: User Story 1 (MVP) is fully functional - PDF text is extracted, stored, and sent to LLM with audio.

---

## Phase 4: User Story 2 - Standalone PDF Summary (Priority: P2)

**Goal**: Generate a summary based solely on uploaded PDF content without audio recording.

**Independent Test**: Navigate to the app, upload a PDF, and click "Generate Summary" without starting a recording.

### Implementation for User Story 2

- [X] T014 [US2] Update UI logic in `frontend/src/App.tsx` to enable summary generation button when ONLY PDF is present
- [X] T015 [US2] Add test case for PDF-only summary generation in `backend/tests/test_integration_summary.py`

**Checkpoint**: User Story 2 works independently - PDF can be the sole source of summary content.

---

## Phase 5: User Story 3 - Manage Uploaded Files (Priority: P3)

**Goal**: Display filenames and provide "Remove" functionality for uploaded PDFs.

**Independent Test**: Upload multiple files, verify all names are shown, remove one, and verify it is no longer in the list.

### Implementation for User Story 3

- [X] T016 [US3] Enhance `PDFUploader` in `frontend/src/components/PDFUploader.tsx` to list multiple files and add removal icons
- [X] T017 [US3] Implement removal logic for document state in `frontend/src/App.tsx` (handle up to 3 files)
- [X] T018 [P] [US3] Create component test for `PDFUploader` in `frontend/tests/components/PDFUploader.test.tsx`

**Checkpoint**: All user stories are functional and provide a complete management experience for supporting documents.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, error handling, and documentation.

- [X] T019 [P] Add file size (10MB) and type validation in `backend/src/api/pdf.py`
- [X] T020 [P] Implement visual feedback (loading spinners) for PDF processing in `frontend/src/components/PDFUploader.tsx`
- [X] T021 [P] Implement error notification for non-text PDFs in `backend/src/services/documents.py`
- [X] T022 [P] Update `README.md` with new PDF processing requirements (pypdf)
- [X] T023 Run verification scenarios from `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Must be completed first to ensure dependencies exist.
- **Foundational (Phase 2)**: Depends on Setup - Blocks implementation of all user stories.
- **User Story 1 (Phase 3)**: MVP - No dependencies on other stories.
- **User Story 2 & 3 (Phases 4-5)**: Depend on US1 base implementation.
- **Polish (Phase 6)**: Final stage after all stories are verified.

### Parallel Opportunities

- T003, T004, T005, T007 (Foundational services and hooks can be built in parallel)
- T009, T010, T011 (API endpoint and UI component skeleton can be built in parallel)
- T018 (Component testing can be done while integration is in progress)
- All Polish tasks (T019-T022) can run in parallel once US3 is complete

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational backend services.
2. Implement PDF extraction endpoint.
3. Build basic uploader and connect to summary generation.
4. **STOP and VALIDATE**: Verify audio + PDF summary works.

### Incremental Delivery

1. Foundation -> Robust extraction and persistence.
2. US1 -> Combined context (Primary Value).
3. US2 -> Standalone PDF support.
4. US3 -> Full management UI.
5. Polish -> UX refinements and edge case handling.
