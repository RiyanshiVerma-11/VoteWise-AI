import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from backend.app.main import app
from backend.app.models.schemas import ChatRequest

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
@patch("backend.app.services.ai_service.ai_service.get_election_guidance", new_callable=AsyncMock)
async def test_chat_success(mock_guidance):
    mock_guidance.return_value = "Mocked AI Response"
    response = client.post("/api/chat", json={"message": "How to register?", "lang": "en"})
    assert response.status_code == 200
    assert response.json()["response"] == "Mocked AI Response"

@pytest.mark.asyncio
@patch("backend.app.services.ai_service.ai_service.get_election_guidance", new_callable=AsyncMock)
async def test_chat_gemini_down(mock_guidance):
    mock_guidance.side_effect = Exception("Gemini API down")
    response = client.post("/api/chat", json={"message": "How to register?", "lang": "en"})
    assert response.status_code == 500
    assert "AI Service Error" in response.json()["detail"]

def test_invalid_json_payload():
    response = client.post("/api/chat", content="invalid json")
    assert response.status_code == 422 # Unprocessable Entity
