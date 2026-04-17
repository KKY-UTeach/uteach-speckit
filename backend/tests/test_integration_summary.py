import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_summarize_with_docs_integration():
    """
    Test the /summarize endpoint with supporting documents.
    It should return a successful response (mocked or real).
    """
    payload = {
        "transcript": "Toto je testovací přepis přednášky o programování.",
        "format": "summary",
        "supporting_docs": [
            {"name": "test_slides.pdf", "content": "Klíčové téma: SOLID principy a čistý kód."}
        ],
    }

    response = client.post("/v1/llm/summarize", json=payload)

    # Assert successful API response
    assert response.status_code == 200
    data = response.json()
    assert "markdown" in data

    # Verify we got some content (either real or fallback mock)
    markdown = data["markdown"]
    assert len(markdown) > 0


def test_summarize_pdf_only_integration():
    """
    Test generating a summary from PDF context ONLY (empty transcript).
    This supports User Story 2.
    """
    payload = {
        "transcript": "",
        "format": "summary",
        "supporting_docs": [
            {"name": "article.pdf", "content": "Detailed text about quantum computing history."}
        ],
    }

    response = client.post("/v1/llm/summarize", json=payload)
    assert response.status_code == 200
    assert "markdown" in response.json()
