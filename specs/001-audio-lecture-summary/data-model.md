# Data Model: Audio Lecture Summary Application

## Entities

### AudioSource (Client-side)
- **id**: UUID
- **blob**: Blob (Binary audio data)
- **mimeType**: String (e.g., 'audio/webm')
- **duration**: Number (seconds)
- **capturedAt**: DateTime

### Transcript (Client-side)
- **rawText**: String (Output from ASR)
- **editedText**: String (User corrected version)
- **language**: String ('cs-CZ')
- **confidence**: Number (0-1)

### SupportingDocument (Client-side)
- **id**: UUID
- **filename**: String
- **content**: String (extracted text - deferred processing)
- **size**: Number (max 10MB)

### SummaryResult (Client-side)
- **markdown**: String (Output from LLM)
- **format**: Enum ('summary', 'keyword-table')
- **generatedAt**: DateTime

## State Transitions

1. **INITIAL**: No data.
2. **CAPTURED**: `AudioSource` defined. User can download raw audio.
3. **TRANSCRIBING**: API call to KKY ASR in progress. Status: 'Uploading' -> 'Processing'.
4. **REVIEWING**: `Transcript` defined. User can edit `editedText`.
5. **SUMMARIZING**: API call to Ollama KKY in progress.
6. **COMPLETED**: `SummaryResult` defined. User can export to PDF.
