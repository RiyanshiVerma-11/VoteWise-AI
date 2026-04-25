from typing import List
from ..core.db import db_cache
from .ai_service import ai_service
from ..models.schemas import ChatRequest

class SimulationService:
    def __init__(self):
        pass

    async def simulate(self, request: ChatRequest) -> str:
        # Fetch from SQLite Cache for Zero-Latency
        scenarios = db_cache.get("scenarios") or {}
        
        target_lang = request.lang if request.lang in ["en", "hi", "mr", "ta", "bn", "te"] else "en"
        q_low = request.message.lower()
        
        # Fuzzy Keyword Matching Logic from DB Cache
        if request.step and request.step in scenarios:
            for key, val in scenarios[request.step].items():
                keywords = key.split()
                if all(word in q_low for word in keywords):
                    return val.get(target_lang, "")

        # Final AI Fallback
        return await ai_service.get_election_guidance(
            request.message, 
            request.step,
            lang=request.lang or "en"
        )

simulation_service = SimulationService()
