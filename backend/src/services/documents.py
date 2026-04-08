from pypdf import PdfReader
import io

class DocumentExtractionService:
    def extract_text(self, file_content: bytes) -> str:
        """
        Extracts text from PDF binary content using pypdf.
        """
        try:
            reader = PdfReader(io.BytesIO(file_content))
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            
            final_text = text.strip()
            if not final_text:
                raise ValueError("Z PDF dokumentu se nepodařilo extrahovat žádný text. Ujistěte se, že nejde o naskenovaný obrázek.")
                
            return final_text
        except Exception as e:
            # Re-wrap as ValueError for cleaner API handling
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
