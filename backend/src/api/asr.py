from typing import Annotated, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from src.adapters.kky_asr import KKYASRAdapter

router = APIRouter()
asr_adapter = KKYASRAdapter()


@router.post("/transcribe")
async def transcribe(
    file: Annotated[UploadFile, File()],
    language: Annotated[Optional[str], Form()] = "cs"
):
    try:
        audio_data = await file.read()
        if not audio_data:
            raise HTTPException(status_code=400, detail="Empty audio file")

        result = await asr_adapter.transcribe(audio_data, language)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
