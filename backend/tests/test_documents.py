import pytest
from src.services.documents import DocumentExtractionService
from fpdf import FPDF
import io

def create_test_pdf(text: str) -> bytes:
    """Helper to create a simple PDF in memory."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=12)
    pdf.cell(200, 10, txt=text, ln=1, align='C')
    # fpdf2 output(dest='S') returns bytes
    return pdf.output()

def test_extract_text_from_pdf():
    service = DocumentExtractionService()
    expected_text = "Hello Uteach PDF Extraction"
    pdf_content = create_test_pdf(expected_text)
    
    extracted_text = service.extract_text(pdf_content)
    assert expected_text in extracted_text

def test_extract_text_empty_pdf():
    service = DocumentExtractionService()
    # Create empty PDF with one page but no text
    pdf = FPDF()
    pdf.add_page()
    pdf_content = pdf.output()
    
    with pytest.raises(ValueError, match="se nepodařilo extrahovat žádný text"):
        service.extract_text(pdf_content)

def test_extract_text_invalid_content():
    service = DocumentExtractionService()
    with pytest.raises(ValueError, match="Failed to extract text from PDF"):
        service.extract_text(b"not a pdf content")
