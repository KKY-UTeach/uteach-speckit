from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any

class ASRProvider(ABC):
    @abstractmethod
    async def transcribe(self, audio_data: bytes, language: Optional[str] = None) -> Dict[str, Any]:
        """Transcribe audio data to text."""
        pass

class LLMProvider(ABC):
    @abstractmethod
    async def generate_response(
        self, 
        transcript: str, 
        supporting_docs: Optional[List[str]] = None,
        format_type: str = 'summary',
        config: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate a summary or other structured response from a transcript."""
        pass
