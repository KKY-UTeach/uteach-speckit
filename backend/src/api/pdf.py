from fastapi import APIRouter, UploadFile, File, HTTPException
from src.services.documents import DocumentExtractionService

router = APIRouter()
doc_service = DocumentExtractionService()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@router.post("/extract")
async def extract_pdf_text(file: UploadFile = File(...)):
    """
    Endpoint to extract text from a PDF file.
    Returns the filename, size, and extracted text content.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        content = await file.read()
        
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="Soubor je příliš velký (maximum je 10MB).")

        text = doc_service.extract_text(content)
        
        return {
            "name": file.filename,
            "size": len(content),
            "content": text
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
