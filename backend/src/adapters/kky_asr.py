import httpx
from typing import Optional, Dict, Any
from src.adapters.base import ASRProvider


class KKYASRAdapter(ASRProvider):
    def __init__(self, timeout: int = 3600):
        self.base_url = "https://uwebasr.zcu.cz/api/v2/lindat"
        self.timeout = timeout
        # Map languages to Zipformer models as per app.py logic
        self.language_models = {
            "cs": "generic/cs/zipformer",
            "sk": "generic/sk/zipformer",
            "en": "generic/en/zipformer",
            "de": "generic/de/zipformer",
            "pl": "generic/pl/zipformer",
            "hu": "generic/hu/zipformer",
            "hr": "generic/hr/zipformer",
            "sr": "generic/sr/zipformer",
        }

    async def transcribe(self, audio_data: bytes, language: Optional[str] = None) -> Dict[str, Any]:
        """
        Sends audio data to the KKY UWebASR API and returns the transcription result.
        """
        lang = language if language in self.language_models else "cs"
        model_path = self.language_models[lang]
        api_url = f"{self.base_url}/{model_path}?format=plaintext"

        headers = {"Content-Type": "application/octet-stream"}

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(api_url, content=audio_data, headers=headers)

                if response.status_code == 200:
                    return {"status": "success", "text": response.text, "language": lang}
                elif response.status_code == 503:
                    return {"status": "error", "message": "All ASR workers are currently busy."}
                else:
                    return {
                        "status": "error",
                        "message": f"API returned HTTP {response.status_code}: {response.text[:200]}",
                    }

            except httpx.TimeoutException:
                return {"status": "error", "message": "The request timed out."}
            except httpx.RequestError as e:
                return {"status": "error", "message": f"Network error: {str(e)}"}
