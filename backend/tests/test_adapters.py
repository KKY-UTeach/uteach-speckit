import pytest
from src.adapters.kky_asr import KKYASRAdapter
from src.adapters.ollama_llm import OllamaLLMAdapter

@pytest.mark.asyncio
async def test_asr_adapter_mock_fallback():
    # Test fallback behavior when no URL is provided
    adapter = KKYASRAdapter()
    adapter.url = None
    result = await adapter.transcribe(b"fake-audio")
    assert "text" in result
    assert "MOCK TRANSCRIPT" in result["text"]

@pytest.mark.asyncio
async def test_llm_adapter_mock_fallback():
    # Test generate response
    adapter = OllamaLLMAdapter()
    # In test environment, it should hit the exception and return mock
    result = await adapter.generate_response("Test transcript", format_type="summary")
    assert "AI Shrnutí (MOCK)" in result
    assert "Bod 1" in result
