# API Contracts: Audio Lecture Summary Application

## 1. Transcription Service
- **Endpoint**: `POST /api/v1/asr/transcribe`
- **Request**: `Multipart/Form-Data`
  - `file`: Binary (audio)
  - `language`: String ('cs')
- **Response**: `application/json`
  ```json
  {
    "job_id": "uuid",
    "text": "Full transcribed text...",
    "status": "completed"
  }
  ```

## 2. Summarization Service
- **Endpoint**: `POST /api/v1/llm/summarize`
- **Request**: `application/json`
  ```json
  {
    "transcript": "...",
    "format": "summary",
    "supporting_docs": ["text from doc 1", "..."]
  }
  ```
- **Response**: `application/json`
  ```json
  {
    "markdown": "### Summary\n- Point 1...",
    "model": "ollama-kky-llama3"
  }
  ```

## 3. PDF Export Service
- **Endpoint**: `POST /api/v1/export/pdf`
- **Request**: `application/json`
  ```json
  {
    "markdown": "...",
    "title": "Lecture Summary"
  }
  ```
- **Response**: `application/pdf` (Binary stream)
