# Tasks: Audio Lecture Summary Application

**Input**: Design documents from `specs/001-audio-lecture-summary/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Unit tests for adapters and integration tests for processing pipelines are requested per Constitution (Principle III).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure (backend/ and frontend/) per implementation plan
- [X] T002 Initialize FastAPI backend with dependencies (`httpx`, `weasyprint`, `markdown2`) in `backend/`
- [X] T003 Initialize React frontend with Vite and TypeScript in `frontend/`
- [X] T004 [P] Configure linting and formatting (ruff for python, eslint for ts) for both projects

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Implement abstract base classes for AI providers (`ASRProvider`, `LLMProvider`) in `backend/src/adapters/base.py`
- [X] T006 [P] Create API routing structure and main entry point in `backend/src/main.py`
- [X] T007 [P] Implement basic layout with navigation progress bar shell in `frontend/src/components/ProgressBar.tsx`
- [X] T008 Setup environment configuration management for API keys in `backend/.env`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Audio Capture & Upload (Priority: P1) 🎯 MVP

**Goal**: Record or upload an audio file and get a transcription from KKY ASR.

**Independent Test**: User uploads audio, clicks continue, and sees a basic transcript (from ASR) in the next view.

### Implementation for User Story 1

- [X] T009 [P] [US1] Create `KKYASRAdapter` implementation in `backend/src/adapters/kky_asr.py`
- [X] T010 [P] [US1] Implement transcription endpoint (`/api/v1/asr/transcribe`) in `backend/src/api/asr.py`
- [X] T011 [P] [US1] Create `AudioCapture` component with file upload and record controls in `frontend/src/components/AudioCapture.tsx`
- [X] T012 [US1] Implement `useAudioRecorder` hook using MediaRecorder API in `frontend/src/hooks/useAudioRecorder.ts`
- [X] T013 [US1] Implement raw audio download functionality in `frontend/src/components/AudioCapture.tsx` (FR-003)
- [X] T014 [US1] Integrate frontend capture with backend transcription API in `frontend/src/services/asr.ts`

**Checkpoint**: User Story 1 functional and testable independently.

---

## Phase 4: User Story 2 - Transcript Editing & Export (Priority: P1)

**Goal**: Review, edit, and download the transcribed text.

**Independent Test**: User can edit the transcript text and download it as a .txt file.

### Implementation for User Story 2

- [X] T015 [P] [US2] Create `TranscriptEditor` component with editable text area in `frontend/src/components/TranscriptEditor.tsx`
- [X] T016 [US2] Implement transcript download as `.txt` functionality in `frontend/src/components/TranscriptEditor.tsx`
- [X] T017 [US2] Add manual edit state management for transcript in `frontend/src/App.tsx`

**Checkpoint**: User Story 2 functional and testable independently.

---

## Phase 5: User Story 3 - AI Summary Generation (Priority: P2)

**Goal**: Generate summary/keyword table using Ollama KKY and export to PDF.

**Independent Test**: User clicks "Generate", receives a summary, and can download the PDF.

### Implementation for User Story 3

- [X] T018 [P] [US3] Create `OllamaLLMAdapter` implementation in `backend/src/adapters/ollama_llm.py`
- [X] T019 [P] [US3] Implement summarization endpoint (`/api/v1/llm/summarize`) in `backend/src/api/llm.py`
- [X] T020 [P] [US3] Implement PDF export endpoint using WeasyPrint in `backend/src/api/export.py`
- [ ] T021 [US3] Add supporting document upload and text extraction (PyPDF) in `backend/src/services/documents.py` (DEFERRED TO POST-MVP)

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup (Phase 1)**: Must be first.
2. **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories.
3. **User Stories (Phase 3+)**: Depend on Foundational.
   - US1 and US2 are P1 (Critical MVP).
   - US3 is P2.
   - US4 is P3.
4. **Polish (Phase 7)**: Final stage.

### Parallel Opportunities

- Foundational tasks (T005, T006, T007) can run in parallel.
- US1 and US3 adapter implementations (T009, T018) can run in parallel with UI work (T011, T021).

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Setup + Foundational.
2. Complete US1 (Capture & Transcription).
3. Complete US2 (Transcript Editing).
4. **STOP and VALIDATE**: Test basic capture → transcription → edit → download flow.

### Incremental Delivery

1. Add US3 (AI Summary & PDF Export) after MVP is stable.
2. Add US4 (UI Navigation & Persistence) last for polished UX.
