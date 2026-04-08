# Feature Specification: Audio Lecture Summary Application

**Feature Branch**: `001-audio-lecture-summary`  
**Created**: 2026-03-21  
**Status**: Draft  
**Input**: User description: "I want the app to have this general workflow. First page will be simple with a field for recording audio or uploading an audio file. When user decides to record audio there will be some simple controls. After one of these steps it will be able to download the recorded audio or continue onto the next page. When continuing the app will call KKY ASR API which will transcribe the audio to a text form. On this next page the transcribed text will be shown and it will be possible to edit this text to correct some mistakes, it will also be possible to download this transcript. In the next step another API for Ollama KKY will be called and an LLM will output a summary or any other selected form like keyword table. This will use some prompt specified in a configuration file depending on the desired output. It will also be possible to upload some additional documents for the LLM as a supporting documents (presentations, pdfs, documents) if the model used supports it. Final output will be a markdown file and it will also be transformed into a pdf file for ease of distribution. At the top of the page there will be a progress bar for these steps and it will be possible to go to any step to upload a file. The server side will be stateless and will not store any user data, it will only provide access to the different APIs. These API modules for KKY ASR and LLM will be swappable for different models, so it should be compartmentalized and modular. The frontend should be modern and simple looking with visual feedback for the user for ease of use. Ease of use for the user is one of the main desired values, the usage should be frictionless for the end user."

## Clarifications

### Session 2026-03-21
- Q: Maximum audio file size and duration? → A: No artificial processing limits.
- Q: Limit on supporting documents? → A: Maximum 5 documents.
- Q: Target platform? → A: Desktop-first Responsive.
- Q: Access control? → A: Public Access (No Auth).
- Q: Language support? → A: Hardcoded (Czech Only).
- Q: Explicit out-of-scope items? → A: Multi-user, history, mobile native, offline, accounts.
- Q: Maximum size per supporting document? → A: 10MB per file.
- Q: Session recovery logic? → A: Warning + optional local recovery; download required.
- Q: Transcription progress granularity? → A: Stage-based status updates (e.g., Uploading, Processing).
- Q: Supporting document processing? → A: Deferred; maintain modularity for future processing.

## Out of Scope
- Multi-user collaboration or shared sessions.
- Long-term storage or history of generated summaries (server is stateless).
- Native mobile applications (iOS/Android).
- Offline processing mode.
- User accounts, registration, or profiles.
- Real-time (live) transcription.

## User Scenarios & Testing

### User Story 1 - Audio Capture & Upload (Priority: P1)

As a student or researcher, I want to record a lecture or upload an existing audio file so that I can prepare it for transcription.

**Why this priority**: This is the entry point of the application. Without audio input, no further steps are possible.

**Independent Test**: User can upload a valid audio file or record a short clip using on-screen controls and see a success state with options to download or proceed.

**Acceptance Scenarios**:

1. **Given** the landing page, **When** I click "Upload" and select a valid audio file, **Then** the file is processed and I see the option to download it or continue.
2. **Given** the landing page, **When** I click "Record" and use the record/stop controls, **Then** the recorded audio is captured and I see the option to download it or continue.

---

### User Story 2 - Transcript Editing & Export (Priority: P1)

As a user, I want to review and correct the transcribed text from the audio so that the final summary is based on accurate information.

**Why this priority**: Automated transcription can have errors; manual correction ensures high-quality input for the LLM summarization.

**Independent Test**: After a successful ASR call, the user is presented with an editable text area containing the transcript and can successfully download the edited version.

**Acceptance Scenarios**:

1. **Given** the transcription page with text loaded, **When** I edit a sentence and click "Save/Update", **Then** the changes are reflected in the current session.
2. **Given** the transcription page, **When** I click "Download Transcript", **Then** a text file containing the current transcript is downloaded to my device.

---

### User Story 3 - AI Summary Generation with Supporting Docs (Priority: P2)

As a user, I want to generate a summary or keyword table from my transcript, optionally using supporting documents, so that I can quickly understand the lecture content.

**Why this priority**: This is the core value proposition of the app—transforming raw audio/text into structured knowledge.

**Independent Test**: User can select a summary format, upload a supporting PDF, and receive a markdown/PDF output that synthesizes both the transcript and the document.

**Acceptance Scenarios**:

1. **Given** the summarization page, **When** I select "Keyword Table" and click "Generate", **Then** the LLM returns a structured table based on the transcript.
2. **Given** the summarization page, **When** I upload a presentation PDF as a supporting document and generate a summary, **Then** the output reflects information from both the audio and the PDF.

### User Story 5 - Independent Stage Entry (Priority: P3)

As a user with a pre-existing transcript, I want to upload it directly to the summarization stage so that I can bypass the audio capture and transcription steps.

**Independent Test**: User can navigate to the Summarize stage, upload a `.txt` file, and proceed to generate a summary.

**Acceptance Scenarios**:
1. **Given** I am on the Summarize stage, **When** I upload a valid `.txt` file, **Then** the content is loaded into the transcript editor.

---

### User Story 4 - Multi-Step Navigation & Progress (Priority: P3)

As a user, I want to see my progress through the stages and be able to return to previous steps so that I have full control over the workflow.

**Why this priority**: Enhances "ease of use" and "frictionless" experience by providing context and flexibility.

**Independent Test**: User can click on the progress bar at any stage to return to a previous step (e.g., to upload a different audio file) without a full page reload.

**Acceptance Scenarios**:

1. **Given** I am on the Summarization page, **When** I click the "Transcription" step in the progress bar, **Then** I am returned to the transcript editing view with my previous edits preserved.

### Edge Cases

- **Large Audio Files**: System MUST handle files of any length, subject only to browser memory and API provider constraints.
- **Unsupported Document Formats**: What happens if a user uploads an invalid file type as a supporting document?
- **API Failures**: How is the user notified if the ASR or LLM service is unavailable?
- **No Speech Detected**: What is shown if the uploaded audio contains only silence or noise?

## Requirements

### Functional Requirements

- **FR-001**: System MUST support recording audio directly from the browser with start/stop/pause controls.
- **FR-002**: System MUST support uploading audio files in common formats (e.g., MP3, WAV, M4A). No artificial processing limits are imposed by the application.
- **FR-003**: System MUST provide a "Download" option for the raw captured/uploaded audio before proceeding.
- **FR-004**: System MUST call the KKY ASR API for transcription and handle asynchronous responses with visual progress feedback using stage-based status text (e.g., "Uploading...", "Processing...").
- **FR-005**: System MUST provide an editable text interface for the generated transcript.
- **FR-006**: System MUST support uploading up to 5 supporting documents (PDF, DOCX, PPTX) for the LLM summarization step, with a maximum size of 10MB per file.
- **FR-007**: System MUST allow users to select from pre-defined output formats (Summary, Keyword Table, etc.) which map to specific prompt configurations.
- **FR-008**: System MUST call the Ollama KKY API for LLM processing, passing the transcript. Content extraction for supporting documents is DEFERRED for this version; the UI placeholder exists but functionality is planned for future modular integration.
- **FR-010**: System MUST generate the final output in Markdown format.
- **FR-011**: System MUST provide a PDF version of the final Markdown output for download.
- **FR-012**: System MUST feature a persistent progress bar indicating the current stage. The UI MUST allow jumping to any stage if the required input for that stage is present or can be provided.
- **FR-013**: System MUST be stateless on the server side. The frontend MUST treat each stage as an independent processing unit.
- **FR-014**: System MUST utilize a modular adapter pattern for ASR and LLM services to allow for swappable backends.
- **FR-015**: UI MUST be Desktop-first Responsive, optimized for high-density editing tasks while remaining functional on mobile devices.
- **FR-016**: Application MUST be publicly accessible without authentication.
- **FR-017**: System MUST be hardcoded to support the Czech language for ASR and LLM processing.
- **FR-018**: System MUST implement a "Before Unload" warning to prevent accidental session loss.
- **FR-019**: System SHOULD provide an option to recover the last session from Browser Local Storage.
- **FR-020**: Independent Entry Points: Each stage must support being the initial entry point of the workflow:
  - **Capture Stage**: Entry via Mic Recording or Audio File Upload.
  - **Summarize Stage**: Entry via Transcript File Upload (.txt) or manual text paste, bypassing prior stages.
- **FR-021**: Each stage MUST allow exporting its primary output (Raw Audio, Edited Transcript, Final Summary) independently of the full workflow.

### Technical Integration

#### Modular Adapters (MVP Stack)
To satisfy the modularity requirement (FR-014), the application utilizes a provider-based architecture for AI services.

- **ASRProvider (Transcription)**:
  - **Interface**: `transcribe(audio_data: bytes, language: str) -> Dict`
  - **MVP Implementation**: `KKYASRAdapter` using `httpx` with **DigestAuth** to communicate with the OpenWebUI ASR endpoint.
- **LLMProvider (Summarization)**:
  - **Interface**: `generate_response(transcript: str, format_type: str) -> str`
  - **MVP Implementation**: `OllamaLLMAdapter` using the `ollama` Python library with **DigestAuth**.
  - **Target Models**: `gpt-oss:20b` (Primary for summary), `gemma3:12b` (Secondary/Logic).
- **PDF Export**:
  - **MVP Implementation**: `fpdf2` (Pure Python) for generating styled documents from Markdown strings without system GTK dependencies.

### Key Entities

- **AudioSource**: Represents the input audio, either a recorded stream or an uploaded file.
- **Transcript**: The text output from the ASR process, including user corrections.
- **SupportingDocument**: Optional additional context provided by the user (PDF, etc.).
- **SummaryConfiguration**: The selected output format and its associated LLM prompt template.
- **FinalOutput**: The resulting Markdown and PDF documents.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete the entire flow from audio upload to PDF summary in under 5 minutes for a 10-minute lecture.
- **SC-002**: 90% of transcription edits are completed by users in a single pass without needing to restart the flow.
- **SC-003**: The system handles 100% of API timeout or error scenarios by displaying a user-friendly "Retry" option without data loss.
- **SC-004**: Switching between different ASR or LLM backends requires zero changes to the core application logic (verified by architectural review).
- **SC-005**: 95% of users successfully navigate between steps using the progress bar without reporting confusion in usability testing.
