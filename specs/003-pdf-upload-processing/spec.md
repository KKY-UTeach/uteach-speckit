# Feature Specification: PDF Upload Processing

**Feature Branch**: `003-pdf-upload-processing`  
**Created**: 2026-03-21  
**Status**: Draft  
**Input**: User description: "I want to be able to upload pdf files during the llm process. Implement this as a 002 task"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Supplemental PDF Context (Priority: P1)

As a student, I want to upload a PDF (such as lecture slides or reading material) alongside my audio recording, so that the generated summary is more accurate and includes details from the written material that might have been missed in the audio.

**Why this priority**: This is the core functionality requested—augmenting the LLM process with PDF data. It provides the most immediate value to users who want high-quality summaries.

**Independent Test**: Can be tested by recording a short audio clip, uploading a PDF with specific facts not mentioned in the audio, and verifying that the final summary contains those specific facts.

**Acceptance Scenarios**:

1. **Given** I have a transcript of a lecture, **When** I upload a PDF containing supporting materials, **Then** the "Generate Summary" button becomes active (if not already).
2. **Given** I have uploaded a PDF and recorded audio, **When** I request a summary, **Then** the system uses both sources to generate a comprehensive set of notes.

---

### User Story 2 - Standalone PDF Summary (Priority: P2)

As a student, I want to generate a summary from a PDF file without having to record any audio, so that I can quickly digest written materials like articles or book chapters.

**Why this priority**: Extends the utility of the application to asynchronous learning and pre-existing materials, making it a more versatile study tool.

**Independent Test**: Can be tested by navigating to the application, uploading a PDF without starting an audio recording, and successfully generating a summary.

**Acceptance Scenarios**:

1. **Given** I am on the main screen and have not recorded audio, **When** I upload a PDF and click "Generate Summary", **Then** the system produces a summary based solely on the PDF content.

---

### User Story 3 - Manage Uploaded Files (Priority: P3)

As a student, I want to see the name of the file I uploaded and have the ability to remove it or replace it before I generate the summary.

**Why this priority**: Essential for a good user experience and error correction.

**Independent Test**: Can be tested by uploading a file, confirming its name appears in the UI, clicking a "Remove" button, and verifying the file is gone.

**Acceptance Scenarios**:

1. **Given** I have uploaded "Slides_V1.pdf", **When** I view the upload area, **Then** I see the filename "Slides_V1.pdf".
2. **Given** I have uploaded a file, **When** I click the "Remove" icon, **Then** the file is removed and the system state reverts to "no file uploaded".

### Edge Cases

- **Large Files**: What happens when a user uploads a PDF that exceeds the system's processing capacity? (System should provide a clear error message and limit file size).
- **Non-Text PDFs**: How does the system handle a PDF that contains only images (e.g., a scanned document)? (System should notify the user if no text can be extracted).
- **Multiple Files**: The system MUST support up to 3 PDF files per summarization session. Users can see all uploaded files and remove them individually.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow users to select and upload up to 3 PDF files from their local device.
- **FR-002**: The system MUST extract all readable text from the uploaded PDFs for use in the summarization process.
- **FR-003**: The system MUST support PDF files up to 10MB each.
- **FR-004**: The system MUST provide visual feedback to the user while the PDF is being processed/extracted.
- **FR-005**: The system MUST include extracted PDF text as context when prompting the LLM for a summary.
- **FR-006**: The system MUST prioritize the transcript as the primary narrative but use the PDF for terminology and factual grounding.
- **FR-007**: The system MUST persist the uploaded PDF text in the local session state until the summary is generated or the session is cleared.

### Key Entities

- **SourceMaterial**: Represents any input used for summarization (Transcript or PDF).
- **UploadedDocument**: A specific entity for the PDF, containing the original filename, its size, and the extracted text content.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can upload and have a 10-page PDF processed (text extracted) in under 8 seconds.
- **SC-002**: The system successfully handles PDFs containing up to 50,000 characters of text without crashing or timing out.
- **SC-003**: Summaries generated with a PDF context show a 20% increase in technical term accuracy compared to audio-only summaries (verified by test suite).
- **SC-004**: Zero user-perceived data loss of uploaded PDFs during the transition from audio recording to summary generation.
