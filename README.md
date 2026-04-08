# Uteach: Smart Lecture Assistant

Uteach is a modular web application that transcribes audio lectures and generates structured summaries using AI. It supports supplemental PDF context to improve accuracy and provides modern PDF export functionality.

## Project Structure

- **`backend/`**: FastAPI (Python) service for ASR (Speech-to-Text), PDF text extraction, and LLM summarization.
- **`frontend/`**: React (TypeScript) + Vite application with IndexedDB for session persistence.
- **`specs/`**: Feature specifications and technical implementation plans.

---

## 1. Prerequisites

### Backend
- **Python 3.12+**
- **OS Libraries (for PDF Export)**:
  - Ubuntu/Debian: `sudo apt-get install libpango-1.0-0 libharfbuzz0b libpangoft2-1.0-0 libpangocairo-1.0-0 libffi-dev libjpeg-dev libopenjp2-7-dev libgdk-pixbuf2.0-0`
  - macOS: `brew install pango cairo libffi`
  - Windows: Already included in standard installs, but ensures `pypdf` is available for extraction.

### Frontend
- **Node.js 20+**
- **npm 10+**

---

## 2. Setup & Configuration

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install python-multipart
   ```
4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Ensure the following variables are set in `.env`:
   ```env
   KKY_ASR_URL=https://ollama.kky.zcu.cz:444/api/asr
   OLLAMA_URL=https://ollama.kky.zcu.cz
   OLLAMA_USER=uteach
   OLLAMA_PASS=your_password
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## 3. Running the Project

You will need two terminal sessions running simultaneously.

### Terminal 1: Backend
```bash
cd backend
# Ensure venv is active
python -m src.main --port 8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 4. Features & Usage

1. **Audio Capture**: Record a lecture directly in the browser or upload an existing audio file (`.webm`, `.mp3`, `.wav`).
2. **Supporting Documents**: Upload up to 3 PDF files (max 10MB each) to provide additional context for the AI (e.g., lecture slides).
3. **Transcript Editor**: Review and edit the automatically transcribed text before summarization.
4. **AI Summarization**: Choose between a **Structured Summary** or a **Keyword Table**.
5. **Persistence**: Your progress is automatically saved to your browser's IndexedDB. You can restore your session even after a page refresh.
6. **PDF Export**: Export the final AI-generated summary as a professionally styled PDF.

---

## 5. Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 6. Deployment

For detailed production deployment instructions (including OS-level dependencies and Nginx configuration), refer to [DEPLOYMENT.md](./DEPLOYMENT.md).
