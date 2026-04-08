# Data Model: PDF Upload & Context

## Entities

### `UploadedDocument` (Frontend - IndexedDB)
Represents a PDF document uploaded by the user and processed by the backend.

- `id`: UUID (locally generated)
- `name`: String (original filename)
- `size`: Number (bytes)
- `extractedText`: String (content returned from the extraction service)
- `timestamp`: Number (ms when uploaded)

### `SummarizationContext` (Backend - DTO)
The payload sent from the frontend to the LLM summarization service.

- `transcript`: String (required, the main audio transcript)
- `supporting_docs`: List of `DocumentContext` (optional)
- `format_type`: Enum ('summary', 'keyword-table')

### `DocumentContext` (Backend - DTO)
A lightweight representation of a document for LLM context.

- `name`: String (filename for reference)
- `content`: String (extracted text)

## Relationships
- A `SummarizationContext` contains one `transcript` and 0 to 3 `DocumentContext` objects.
- Each `DocumentContext` maps directly to an `UploadedDocument` stored in the frontend's IndexedDB.

## Validation Rules
- **Document Limit**: Maximum of 3 documents allowed per session.
- **File Size**: Up to 10MB per PDF file.
- **Text Length**: Extracted text should be truncated to 50,000 characters (or similar limit) to avoid overflowing the LLM context window.
