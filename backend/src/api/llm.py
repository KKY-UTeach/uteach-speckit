from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from src.adapters.ollama_llm import OllamaLLMAdapter

router = APIRouter()
llm_adapter = OllamaLLMAdapter()


class DocumentContext(BaseModel):
    name: str
    content: str


class SummarizeRequest(BaseModel):
    transcript: str
    format: Optional[str] = "summary"
    supporting_docs: Optional[List[DocumentContext]] = None
    language: Optional[str] = "cs"


@router.post("/summarize")
async def summarize(request: SummarizeRequest):
    try:
        markdown = await llm_adapter.generate_response(
            transcript=request.transcript,
            format_type=request.format,
            supporting_docs=request.supporting_docs,
            language=request.language,
        )
        return {"markdown": markdown}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
