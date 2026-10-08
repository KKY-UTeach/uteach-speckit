import os
from typing import Any, Dict, List, Optional

import httpx
import ollama
from dotenv import load_dotenv

from src.adapters.base import LLMProvider

load_dotenv()

PROMPT_TEMPLATES = {
    "cs": {
        "response_instruction": "Odpovídej v češtině.",
        "summary": "Shrňte následující přepis přednášky do jasných odstavců. Zvýrazněte klíčové koncepty.",
        "keyword-table": "Extrahujte hlavní klíčová slova a jejich definice z této přednášky do markdown tabulky.",
        "mock_heading": "### AI Shrnutí (MOCK)",
        "mock_intro": "Toto je simulovaná odpověď z modelu",
        "mock_point_1": "Přednáška rozebírá důležitost čisté architektury.",
        "mock_point_2": "Modulární design umožňuje snadnou výměnu komponent.",
        "point_label_1": "Bod 1",
        "point_label_2": "Bod 2",
    },
    "en": {
        "response_instruction": "Respond in English.",
        "summary": "Summarize the lecture transcript into clear paragraphs and highlight the key concepts.",
        "keyword-table": "Extract the main keywords and their definitions from this lecture into a markdown table.",
        "mock_heading": "### AI Summary (MOCK)",
        "mock_intro": "This is a simulated response from model",
        "mock_point_1": "The lecture explores the importance of clean architecture.",
        "mock_point_2": "Modular design makes it easier to swap components.",
        "point_label_1": "Point 1",
        "point_label_2": "Point 2",
    },
}


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
        format_type: str = "summary",
        config: Optional[Dict[str, Any]] = None,
        language: str = "cs",
    ) -> str:
        """
        Generates a summary or keyword table in the requested language.
        Uses gpt-oss:20b or gemma3:12b.
        """
        language_key = (language or "cs").lower()
        locale = PROMPT_TEMPLATES.get(language_key, PROMPT_TEMPLATES["cs"])

        model = "gpt-oss:20b"
        system_prompt = locale.get(format_type, locale["summary"])

        doc_context = ""
        if supporting_docs:
            doc_context = "\n\nContext from Supporting Documents:\n---\n"
            for doc in supporting_docs:
                if hasattr(doc, "name"):
                    name = doc.name
                elif isinstance(doc, dict):
                    name = doc.get("name", "Document")
                else:
                    name = "Document"

                if hasattr(doc, "content"):
                    content = doc.content
                elif isinstance(doc, dict):
                    content = doc.get("content", "")
                else:
                    content = str(doc)

                doc_context += f"File: {name}\nContent: {content}\n---\n"

        messages = [
            {
                "role": "system",
                "content": locale["response_instruction"],
            },
            {
                "role": "user",
                "content": f"{system_prompt}{doc_context}\n\nTranscript:\n{transcript}",
            },
        ]

        try:
            response = await self.client.chat(
                model=model, messages=messages, options={"num_ctx": 8192}
            )
            return response["message"]["content"]
        except Exception as e:
            print(f"Ollama Error: {e}")
            return (
                f"{locale['mock_heading']}\n\n{locale['mock_intro']} {model}.\n\n"
                f"- **{locale['point_label_1']}**: {locale['mock_point_1']}\n"
                f"- **{locale['point_label_2']}**: {locale['mock_point_2']}"
            )
