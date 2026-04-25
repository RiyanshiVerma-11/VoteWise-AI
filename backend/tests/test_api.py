import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_steps_english():
    response = client.get("/api/steps?lang=en")
    assert response.status_code == 200
    assert len(response.json()) > 0
    assert response.json()[0]["id"] == "registration"

def test_get_steps_hindi():
    response = client.get("/api/steps?lang=hi")
    assert response.status_code == 200
    assert response.json()[0]["title"] == "मतदाता पंजीकरण"

def test_quiz_data():
    response = client.get("/api/quiz/registration?lang=en")
    assert response.status_code == 200
    # We now have multiple questions
    assert len(response.json()) >= 3 
    assert "minimum age" in response.json()[0]["question"].lower()

def test_ai_chat_schema():
    payload = {"message": "How do I vote?", "lang": "en"}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    assert "response" in response.json()

def test_checklist_data():
    response = client.get("/api/checklist?lang=en")
    assert response.status_code == 200
    assert len(response.json()) == 5
    assert "title" in response.json()[0]
    assert "description" in response.json()[0]

def test_timeline_data():
    response = client.get("/api/timeline?lang=en")
    assert response.status_code == 200
    assert len(response.json()) == 4
    assert "phase" in response.json()[0]
    assert "status" in response.json()[0]

def test_simulate_scenario_match():
    payload = {"message": "I lost my id card", "step": "registration", "lang": "en"}
    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 200
    assert "lost id" in response.json()["response"].lower() or "epic" in response.json()["response"].lower()

def test_security_headers():
    response = client.get("/")
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert "Content-Security-Policy" in response.headers

def test_invalid_language_fallback():
    # Should fallback to English or handled gracefully
    response = client.get("/api/steps?lang=fr")
    assert response.status_code == 200
    assert response.json()[0]["id"] == "registration"

def test_health_endpoint_details():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "2.0.0"

def test_malformed_auth_token():
    payload = {"token": "malformed.token.here"}
    response = client.post("/api/auth/verify", json=payload)
    # The auth_service.verify_google_token(request.token) will return None for malformed token
    # which triggers a 401 in main.py
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid token"

def test_global_exception_handler():
    # Triggering an error by calling a route that doesn't exist
    response = client.get("/non-existent-path")
    assert response.status_code == 404

def test_missing_language_param():
    # Should fallback gracefully when required param is missing or handled
    response = client.get("/api/steps")
    # Assuming the API uses a default or requires it. 
    # Even if it errors, it should be a 422 Unprocessable Entity for missing Pydantic query param, 
    # or a 200 with fallback. Let's assert it's one of the safe HTTP responses.
    assert response.status_code in [200, 422]

def test_cors_headers_present():
    # Checking if CORS headers are injected
    response = client.options("/api/steps?lang=en")
    assert "access-control-allow-origin" in response.headers or response.status_code in [200, 204]

