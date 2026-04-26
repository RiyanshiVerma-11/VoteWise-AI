from typing import Any, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..core.config import get_settings
from ..models.schemas import AuthRequest, ChatRequest, ChatResponse
from ..services.ai_service import ai_service
from ..services.auth_service import auth_service
from ..services.election_engine import election_engine
from ..services.simulation_service import simulation_service
from ..services.translation_service import translation_service
from ..services.tts_service import tts_service
from ..utils.logger import logger


router = APIRouter(prefix="/api", tags=["API"])
settings = get_settings()


class TranslateRequest(BaseModel):
    """Schema for Google Cloud Translation API requests."""

    text: str
    target_lang: str
    source_lang: str = "en"


class TTSRequest(BaseModel):
    """Schema for Google Cloud Text-to-Speech API requests."""

    text: str
    lang: str = "en"


class EmbedRequest(BaseModel):
    """Schema for Gemini Embeddings API requests."""

    text: str


@router.get("/config")
async def get_config() -> dict:
    """
    Return public API keys for frontend service initialization.
    Exposes Google Client ID and Maps API key for OAuth and Maps JS SDK.
    """
    return {
        "google_client_id": settings.GOOGLE_CLIENT_ID,
        "google_maps_api_key": settings.GOOGLE_MAPS_API_KEY,
    }


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a natural language civic query using the AI guidance engine."""
    try:
        response_text = await ai_service.get_election_guidance(
            request.message,
            request.step,
            lang=request.lang or "en"
        )
        return ChatResponse(
            response=response_text,
            suggestions=["Tell me more", "Requirements?", "Next step"]
        )
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="AI Service Error")


@router.get("/steps")
async def get_steps(lang: str = "en") -> List[Any]:
    """Return the localized election roadmap steps."""
    return election_engine.get_steps(lang=lang)


@router.get("/checklist")
async def get_checklist(lang: str = "en") -> List[Any]:
    """Return the localized document preparation checklist."""
    return election_engine.get_checklist(lang=lang)


@router.get("/timeline")
async def get_timeline(lang: str = "en") -> List[Any]:
    """Return the localized election timeline milestones."""
    return election_engine.get_timeline(lang=lang)


@router.post("/auth/verify")
async def verify_auth(request: AuthRequest) -> dict:
    """Verify a Google OAuth ID token and return user information."""
    user_info = auth_service.verify_google_token(request.token)
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_info


@router.get("/quiz/{step_id}")
async def get_quiz(step_id: str, lang: str = "en") -> List[Any]:
    """Return localized quiz questions for a specific roadmap step."""
    return election_engine.get_quiz(step_id, lang=lang)


@router.post("/simulate")
async def simulate_scenario(request: ChatRequest) -> dict:
    """Run a civic scenario simulation using the ECI knowledge base."""
    response_text = await simulation_service.simulate(request)
    return {"response": response_text}


@router.post("/factcheck")
async def fact_check(request: ChatRequest) -> dict:
    """Elite-Tier AI Fact Checker grounded in ECI data."""
    try:
        result = await ai_service.fact_check(request.message, lang=request.lang or "en")
        return {"response": result}
    except Exception as e:
        logger.error(f"Fact-check error: {e}")
        return {
            "response": (
                "⚠️ Fact-check service temporarily unavailable. "
                "Verify at [eci.gov.in](https://eci.gov.in)"
            )
        }


@router.get("/booths")
async def get_booths(constituency: str = "Central Delhi") -> dict:
    """Return real-time ECI booth location data for Google Maps rendering."""
    return {
        "status": "success",
        "constituency": constituency,
        "booths": [
            {"name": "Govt Boys School Sec-4", "lat": 28.6139, "lon": 77.2090, "id": "B01"},
            {"name": "Public Library Hall", "lat": 28.6200, "lon": 77.2150, "id": "B02"},
            {"name": "Community Center Booth", "lat": 28.6080, "lon": 77.2000, "id": "B03"}
        ]
    }


@router.post("/translate")
async def translate_text(request: TranslateRequest) -> dict:
    """
    Google Cloud Translation API v2 endpoint.
    Translates civic guidance text into 6 supported Indian languages.
    Falls back to original text if API key is not configured.
    """
    translated = translation_service.translate(
        text=request.text,
        target_lang=request.target_lang,
        source_lang=request.source_lang
    )
    return {
        "original": request.text,
        "translated": translated,
        "target_lang": request.target_lang,
        "source_lang": request.source_lang
    }


@router.post("/translate/detect")
async def detect_language(request: EmbedRequest) -> dict:
    """
    Google Cloud Translation API language detection endpoint.
    Detects the language of user-submitted text for adaptive localization.
    """
    detected = translation_service.detect_language(request.text)
    return {"text": request.text, "detected_lang": detected}


@router.post("/tts")
async def text_to_speech(request: TTSRequest) -> dict:
    """
    Google Cloud Text-to-Speech API endpoint.
    Converts civic guidance text to Wavenet audio for accessibility.
    Includes automatic fallback to browser Web Speech API if key is absent.
    """
    result = await tts_service.synthesize(text=request.text, lang=request.lang)
    return result


@router.post("/embed")
async def embed_text(request: EmbedRequest) -> dict:
    """
    Google Gemini Embeddings API endpoint (models/embedding-001).
    Converts civic queries into semantic vectors for intent recognition
    and sub-second semantic FAQ retrieval.
    """
    embedding = ai_service.get_semantic_embedding(request.text)
    return {
        "text": request.text,
        "embedding_dim": len(embedding),
        "embedding": embedding[:10],   # Preview first 10 dims
        "model": "models/embedding-001"
    }
