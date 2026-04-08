# Uteach Audio Summary Backend

Modular FastAPI backend for transcribing and summarizing lectures using AI.

## Requirements
- Python 3.12+
- WeasyPrint dependencies (for PDF export)
- pypdf (for PDF text extraction)

## Setup
1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
4. `pip install -r requirements.txt`
5. `cp .env.example .env` (fill in your credentials)

## Running
`uvicorn src.main:app --reload`
(venv) PS C:\Users\marti\OneDrive\Plocha\uteach\uteach\backend> python
 -m src.main --port 8000

## Testing
`pytest`
