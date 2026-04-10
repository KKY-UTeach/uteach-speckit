import httpx
import os
import ollama
from typing import List, Optional, Dict, Any
from src.adapters.base import LLMProvider
from dotenv import load_dotenv

load_dotenv()

class OllamaLLMAdapter(LLMProvider):
    def __init__(self):
        self.url = os.getenv("OLLAMA_URL")
        self.user = os.getenv("OLLAMA_USER")
        self.password = os.getenv("OLLAMA_PASS")
        
        # Initialize the AsyncClient with DigestAuth if credentials are provided
        kwargs = {"host": self.url}
        if self.user and self.password:
            kwargs["auth"] = httpx.DigestAuth(self.user, self.password)
        
        self.client = ollama.AsyncClient(**kwargs)

    async def generate_response(
        self, 
        transcript: str, 
        supporting_docs: Optional[List[Any]] = None,
        format_type: str = 'summary',
        config: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generates a summary or keyword table in Czech.
        Uses gpt-oss:20b or gemma3:12b.
        """
        # Using gpt-oss:20b for summarization as it's generally better for longer texts
        model = "gpt-oss:20b"
        
        prompt_templates = {
            'summary': "Shrňte následující přepis přednášky do jasných odstavců. Zvýrazněte klíčové koncepty.",
            'keyword-table': "Extrahujte hlavní klíčová slova a jejich definice z této přednášky do markdown tabulky."
        }
        
        system_prompt = prompt_templates.get(format_type, prompt_templates['summary'])
        
        # Build document context if provided
        doc_context = ""
        if supporting_docs:
            doc_context = "\n\nContext from Supporting Documents:\n---\n"
            for doc in supporting_docs:
                # Robustly handle both Pydantic objects and dicts
                if hasattr(doc, 'name'):
                    name = doc.name
                elif isinstance(doc, dict):
                    name = doc.get('name', 'Document')
                else:
                    name = "Document"
                
                if hasattr(doc, 'content'):
                    content = doc.content
                elif isinstance(doc, dict):
                    content = doc.get('content', '')
                else:
                    content = str(doc)
                
                doc_context += f"File: {name}\nContent: {content}\n---\n"

        messages = [
            {
                'role': 'system',
                'content': 'Odpovídej v češtině.',
            },
            {
                'role': 'user',
                'content': f"{system_prompt}{doc_context}\n\nTranscript:\n{transcript}",
            },
        ]

        try:
            response = await self.client.chat(
                model=model,
                messages=messages,
                options={"num_ctx": 8192}
            )
            return response['message']['content']
        except Exception as e:
            print(f"Ollama Error: {e}")
            # Fallback mock for development if server is unreachable
            return f"### AI Shrnutí (MOCK)\n\nToto je simulovaná odpověď z modelu {model}.\n\n- **Bod 1**: Přednáška rozebírá důležitost čisté architektury.\n- **Bod 2**: Modulární design umožňuje snadnou výměnu komponent."
