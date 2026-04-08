# uteach Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-22

## Active Technologies

- **Backend**: Python 3.12+, FastAPI, Pydantic, httpx (DigestAuth), WeasyPrint, markdown2 (001-audio-lecture-summary)
- **Frontend**: React 18, TypeScript 5.4+, Vite, Lucide-React, IndexedDB (idb-keyval) (001-audio-lecture-summary)
- **AI Integration**: KKY ASR API, Ollama KKY LLM service (001-audio-lecture-summary)

## Project Structure

```text
backend/
├── src/
│   ├── adapters/        # AI provider interfaces
│   ├── api/             # HTTP endpoints
│   └── services/        # Business logic
frontend/
├── src/
│   ├── components/      # UI elements
│   ├── hooks/           # Logic & persistence
│   └── services/        # API clients
```

## Commands

### Backend (Python)
- **Install**: `pip install -r requirements.txt`
- **Test**: `pytest`
- **Lint**: `ruff check .`
- **Run**: `uvicorn src.main:app --reload`

### Frontend (React)
- **Install**: `npm install`
- **Test**: `npm test`
- **Lint**: `npm run lint`
- **Run**: `npm run dev`

## Code Style

- **Python**: Modular architecture with Abstract Base Classes for AI providers.
- **Frontend**: Functional components with custom hooks for side effects (ASR, Persistence).
- **Statelessness**: The server MUST NOT store user data; all state must reside in the client.

## Recent Changes

- **001-audio-lecture-summary**: Initialized architecture for audio-to-summary pipeline with IndexedDB recovery and stateless FastAPI proxy.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
