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
    adapter = OllamaLLMAdapter()
    result = await adapter.generate_response("Test transcript", format_type="summary")
    assert "AI Shrnutí (MOCK)" in result
    assert "Bod 1" in result


@pytest.mark.asyncio
async def test_llm_adapter_english_mock_fallback():
    adapter = OllamaLLMAdapter()
    result = await adapter.generate_response("Test transcript", format_type="summary", language="en")
    assert "AI Summary (MOCK)" in result
    assert "Point 1" in result
