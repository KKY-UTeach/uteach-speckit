# API Contract: PDF Processing

## Endpoints

### 1. Extract PDF Text
`POST /api/pdf/extract`

Receives a PDF file, extracts text content, and returns it. Stateless.

**Request**:
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: PDF file (Binary)

**Response (200 OK)**:
- **Content-Type**: `application/json`
```json
{
  "name": "filename.pdf",
  "size": 102456,
  "content": "Full extracted text content..."
}
```

**Errors**:
- **400 Bad Request**: Invalid file type (must be PDF) or size too large.
- **500 Internal Server Error**: Extraction failed (e.g., corrupted file).

---

### 2. Generate Summary (Updated)
`POST /api/llm/summarize`

Generates a summary using transcript and supporting documents.

**Request**:
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "transcript": "Original transcript text...",
  "supporting_docs": [
    {
      "name": "slides.pdf",
      "content": "Extracted text from slides..."
    }
  ],
  "format_type": "summary"
}
```

**Response (200 OK)**:
- **Content-Type**: `application/json`
```json
{
  "content": "Generated markdown summary..."
}
```
