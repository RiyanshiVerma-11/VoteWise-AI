import os
from fastapi import APIRouter, HTTPException
from ..models.schemas import ChatRequest, ChatResponse, AuthRequest
from ..services.ai_service import ai_service
from ..services.auth_service import auth_service
from ..services.election_engine import election_engine
from ..services.simulation_service import simulation_service
from ..utils.logger import logger
from ..core.config import get_settings

router = APIRouter(prefix="/api", tags=["API"])
settings = get_settings()

@router.get("/config")
async def get_config():
    return {"google_client_id": settings.GOOGLE_CLIENT_ID}

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
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
async def get_steps(lang: str = "en"):
    return election_engine.get_steps(lang=lang)

@router.get("/checklist")
async def get_checklist(lang: str = "en"):
    return election_engine.get_checklist(lang=lang)

@router.get("/timeline")
async def get_timeline(lang: str = "en"):
    return election_engine.get_timeline(lang=lang)

@router.post("/auth/verify")
async def verify_auth(request: AuthRequest):
    user_info = auth_service.verify_google_token(request.token)
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_info

@router.get("/quiz/{step_id}")
async def get_quiz(step_id: str, lang: str = "en"):
    return election_engine.get_quiz(step_id, lang=lang)

@router.post("/simulate")
async def simulate_scenario(request: ChatRequest):
    response_text = await simulation_service.simulate(request)
    return {"response": response_text}

@router.post("/factcheck")
async def fact_check(request: ChatRequest):
    """Elite-Tier AI Fact Checker grounded in ECI data."""
    try:
        result = await ai_service.fact_check(request.message, lang=request.lang or "en")
        return {"response": result}
    except Exception as e:
        logger.error(f"Fact-check error: {e}")
        return {"response": "⚠️ Fact-check service temporarily unavailable. Verify at [eci.gov.in](https://eci.gov.in)"}
