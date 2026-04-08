# Deployment Guide: Audio Lecture Summary Application

This guide provides step-by-step instructions for setting up the application from scratch on a fresh Virtual Machine (Ubuntu/Debian recommended).

## 1. System Prerequisites

The application requires Python 3.12+ for the backend and Node.js 20+ for the frontend. Additionally, some OS-level libraries are required for PDF generation.

### OS-level Dependencies (for WeasyPrint)
WeasyPrint requires several libraries for rendering. On Ubuntu/Debian, run:

```bash
sudo apt-get update
sudo apt-get install -y \
    python3-pip \
    python3-venv \
    build-essential \
    python3-dev \
    python3-setuptools \
    python3-wheel \
    libpango-1.0-0 \
    libharfbuzz0b \
    libpangoft2-1.0-0 \
    libpangocairo-1.0-0 \
    libffi-dev \
    libjpeg-dev \
    libopenjp2-7-dev \
    libgdk-pixbuf2.0-0
```

### Node.js Installation
Install Node.js 20 or newer:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 2. Project Setup

Clone or copy the project directory to your VM.

```bash
cd uteach
```

### Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   Copy the example file and ensure the Ollama KKY credentials are set:
   ```bash
   cp .env.example .env
   ```
   Your `.env` should look like this:
   ```env
   KKY_ASR_URL=
   OLLAMA_URL=
   OLLAMA_USER=
   OLLAMA_PASS=
   ```

### Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```

---

## 3. Running the Application

To run the application, you will need two terminal sessions (or use `screen`/`tmux`).

### Terminal 1: Backend (FastAPI)
```bash
cd backend
source venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

### Terminal 2: Frontend (Vite)
```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

*Note: The `--host 0.0.0.0` flag ensures the application is accessible from outside the VM via its IP address.*

---

## 4. Verification & Usage

1. Open your browser and go to `http://<VM_IP_ADDRESS>:5173`.
2. **Step 1 (Capture)**: Record a short clip or upload an audio file.
3. **Step 2 (Transcribe)**: Click "Transcribe Lecture". The status should update to "Nahrávání audia..." and then "Přepisování přednášky...".
4. **Step 3 (Edit)**: Review the transcript, edit if necessary, and click "Confirm & Summarize".
5. **Step 4 (Summarize)**: Select your desired format and click "Vygenerovat AI Souhrn".
6. **Step 5 (Export)**: Download the final PDF summary.

## Troubleshooting

- **DigestAuth Failures**: Ensure the `OLLAMA_URL` in `.env` does not have a trailing slash unless required by the specific client version.
- **PDF Generation Errors**: Usually caused by missing OS libraries listed in Section 1. Ensure `libpango` and `libcairo` are correctly installed.
- **Browser Mic Access**: Browser security requires HTTPS for microphone access. If accessing via IP, you may need to use the "Upload File" option instead of "Record Audio".
