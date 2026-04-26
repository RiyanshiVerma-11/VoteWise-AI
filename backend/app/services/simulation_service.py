from ..core.db import db_cache
from ..models.schemas import ChatRequest
from .ai_service import ai_service


class SimulationService:
    """Handles civic scenario simulations using local ECI data and AI fallback."""

    def __init__(self):
        """Initialize the SimulationService."""
        pass

    async def simulate(self, request: ChatRequest) -> str:
        """
        Run a civic scenario simulation.
        First checks the SQLite scenario cache, then falls back to the AI service.
        """
        scenarios = db_cache.get("scenarios") or {}

        target_lang = (
            request.lang
            if request.lang in ["en", "hi", "mr", "ta", "bn", "te"]
            else "en"
        )
        q_low = request.message.lower()

        if request.step and request.step in scenarios:
            for key, val in scenarios[request.step].items():
                keywords = key.split()
                if all(word in q_low for word in keywords):
                    return val.get(target_lang, "")

        return await ai_service.get_election_guidance(
            request.message,
            request.step,
            lang=request.lang or "en"
        )


simulation_service = SimulationService()
