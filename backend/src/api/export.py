from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from fpdf import FPDF
from typing import Optional
import os

router = APIRouter()

class ExportRequest(BaseModel):
    markdown: str
    title: Optional[str] = "Přednáška - Souhrn"

class PDFGenerator(FPDF):
    def __init__(self):
        super().__init__()
        # Register Unicode Fonts to support characters like 'ř', 'č', 'ž'
        # Pointing to the specific resources/fonts directory you mentioned
        font_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "resources", "fonts")
        
        self.add_font("DejaVu", style="", fname=os.path.join(font_path, "DejaVuSans.ttf"))
        self.add_font("DejaVu", style="B", fname=os.path.join(font_path, "DejaVuSans-Bold.ttf"))
        self.add_font("DejaVu", style="I", fname=os.path.join(font_path, "DejaVuSans-Oblique.ttf"))

    def header(self):
        self.set_font('DejaVu', 'B', 15)
        # Using modern fpdf2 syntax for line breaks
        self.cell(0, 10, 'Uteach AI Summary', border=False, new_x="LMARGIN", new_y="NEXT", align='C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('DejaVu', 'I', 8)
        self.cell(0, 10, f'Stránka {self.page_no()}/{{nb}}', align='C')

@router.post("/pdf")
async def export_pdf(request: ExportRequest):
    try:
        pdf = PDFGenerator()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()
        
        # Get the effective page width to prevent "Not enough horizontal space" errors
        epw = pdf.epw 
        
        # Title
        pdf.set_font("DejaVu", "B", 20)
        pdf.set_text_color(37, 99, 235) # indigo-600
        pdf.multi_cell(epw, 15, request.title, align='L')
        pdf.ln(5)
        
        # Content processing
        pdf.set_text_color(51, 65, 85) # slate-700
        lines = request.markdown.split('\n')
        
        for line in lines:
            if not line.strip():
                pdf.ln(2)
                continue
                
            # Force the cursor to the left margin before every new line
            pdf.set_x(pdf.l_margin) 
                
            # Headers ###
            if line.startswith('###'):
                pdf.set_font("DejaVu", "B", 14)
                pdf.set_text_color(37, 99, 235)
                pdf.multi_cell(epw, 10, line.replace('###', '').strip())
                pdf.set_font("DejaVu", "", 11)
                pdf.set_text_color(51, 65, 85)
                
            # List items -
            elif line.startswith('-'):
                pdf.set_font("DejaVu", "", 11)
                # Parse markdown in list items just in case you have **bold** in a bullet point
                pdf.multi_cell(epw, 8, f"  • {line.replace('-', '').strip()}", markdown=True)
                
            # Regular text (with automatic Markdown parsing for **bold** and *italics*)
            else:
                pdf.set_font("DejaVu", "", 11)
                pdf.multi_cell(epw, 8, line, markdown=True)

        # Output as bytes to prevent Starlette/FastAPI "bytearray has no attribute encode" error
        pdf_output = bytes(pdf.output())
        
        return Response(
            content=pdf_output,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=summary.pdf"}
        )
    except Exception as e:
        print(f"PDF Export Error: {e}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")