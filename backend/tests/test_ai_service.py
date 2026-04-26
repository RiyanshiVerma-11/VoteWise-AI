import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from backend.app.services.ai_service import AIService

@pytest.fixture
def ai_service():
    with patch('google.genai.Client'):
        return AIService()

@pytest.mark.asyncio
async def test_get_election_guidance_cache(ai_service):
    ai_service.guidance_cache["en:registration:how to vote"] = "Test Response"
    res = await ai_service.get_election_guidance("how to vote", "registration", "en")
    assert res == "Test Response"

@pytest.mark.asyncio
async def test_get_election_guidance_faq(ai_service):
    ai_service.faq_cache = {"how to vote": {"en": "FAQ Response"}}
    res = await ai_service.get_election_guidance("how to vote", None, "en")
    assert res == "FAQ Response"

@pytest.mark.asyncio
async def test_fact_check_cache(ai_service):
    ai_service.factcheck_cache = {"fake claim": {"verdict": "Fake", "explanation": "Logic"}}
    res = await ai_service.fact_check("fake claim", "en")
    assert "Fake" in res
    assert "Logic" in res

@pytest.mark.asyncio
async def test_fact_check_gemini_fallback(ai_service):
    ai_service.client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "Gemini Fact Check"
    ai_service._generate_content_with_retry = AsyncMock(return_value=mock_response)
    
    # Use a unique claim that won't match any substring in the cache
    import uuid
    unique_claim = f"unprecedented unicorn claim {uuid.uuid4()}"
    
    with patch.object(ai_service, '_cache_fact_check'):
        res = await ai_service.fact_check(unique_claim, "en")
        assert res == "Gemini Fact Check"

@pytest.mark.asyncio
async def test_election_guidance_gemini_fallback(ai_service):
    ai_service.client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "Gemini Guidance"
    ai_service._generate_content_with_retry = AsyncMock(return_value=mock_response)
    
    # Use a query that won't match any cache/FAQ
    res = await ai_service.get_election_guidance("complex scenario about voting laws", None, "en")
    assert res == "Gemini Guidance"

def test_cache_fact_check(ai_service):
    with patch("builtins.open", MagicMock()):
        ai_service._cache_fact_check("test claim", "test result")
        assert "test claim" in ai_service.factcheck_cache
        assert ai_service.factcheck_cache["test claim"]["explanation"] == "test result"

def test_get_semantic_embedding(ai_service):
    ai_service.client = MagicMock()
    mock_embedding = MagicMock()
    mock_embedding.values = [0.1, 0.2, 0.3]
    ai_service.client.models.embed_content.return_value = MagicMock(embeddings=[mock_embedding])
    
    res = ai_service.get_semantic_embedding("test text")
    assert res == [0.1, 0.2, 0.3]
    ai_service.client.models.embed_content.assert_called_once_with(
        model="models/embedding-001",
        contents="test text"
    )
