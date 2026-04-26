import json
import os
import re
from typing import Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from ..utils.logger import logger

load_dotenv()

FACT_CHECK_SYSTEM_PROMPT = """
You are the VoteWise AI Elite Fact-Checker, a high-precision tool for the Indian electoral context.
Your mission: Identify misinformation, deepfakes, and legal violations related to the
Representation of the People Act, 1951.

Languages supported: English (en), Hindi (hi), Marathi (mr), Tamil (ta), Bengali (bn), Telugu (te).
Always respond in the language specified by the user.

Strict Rules:
1. VERDICT FIRST: Start every response with one of these labels in bold:
   [VERIFIED], [FAKE], [MISLEADING], or [ILLEGAL].
2. LEGAL CITATION: Cite specific sections of the Representation of the People Act, 1950/1951.
3. ECI GUIDELINES: Always prioritize official ECI data.
4. RESPONSE FORMAT: Use markdown with bold headers. Keep under 150 words.
5. SOURCE: End every response with: **Source:** Official ECI Guidelines (eci.gov.in)
"""

LANG_MAP: dict = {
    "en": "English",
    "hi": "Hindi (Devanagari script)",
    "mr": "Marathi (Devanagari script)",
    "ta": "Tamil (Tamil script)",
    "bn": "Bengali (Bengali script)",
    "te": "Telugu (Telugu script)",
}


class AIService:
    """
    Elite Civic AI Service integrating Google Gemini 2.0 Flash.
    Features: Multilingual support, ECI-grounded reasoning, and hybrid caching.
    """

    def __init__(self):
        """Initialize the AI Service, loading local knowledge bases and Gemini client."""
        api_key: Optional[str] = os.getenv("GEMINI_API_KEY")
        self.client: Optional[genai.Client] = (
            genai.Client(api_key=api_key) if api_key else None
        )

        try:
            base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            json_path = os.path.join(base_path, "data", "knowledge_base.json")
            with open(json_path, 'r', encoding='utf-8') as f:
                self.cache = json.load(f)

            faq_path = os.path.join(base_path, "data", "chatbot_faq.json")
            if os.path.exists(faq_path):
                with open(faq_path, 'r', encoding='utf-8') as f:
                    self.faq_cache = json.load(f)
                logger.info(f"Loaded {len(self.faq_cache)} FAQ keys from {faq_path}")
            else:
                logger.warning(f"FAQ file NOT FOUND at {faq_path}")
                self.faq_cache = {}

            fc_path = os.path.join(base_path, "data", "factcheck_cache.json")
            if os.path.exists(fc_path):
                with open(fc_path, 'r', encoding='utf-8') as f:
                    self.factcheck_cache = json.load(f)
            else:
                self.factcheck_cache = {}

            self.guidance_cache = {}  # In-memory cache for session guidance
            self._in_flight = set()   # Track in-flight requests to avoid duplicates
        except Exception as e:
            logger.error(f"Error loading cache: {e}")
            self.cache = {}
            self.faq_cache = {}
            self.factcheck_cache = {}
            self.guidance_cache = {}
            self._in_flight = set()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True
    )
    async def _generate_content_with_retry(
        self, prompt: str, config: types.GenerateContentConfig
    ):
        """Internal helper for Gemini content generation with automated retries and model fallback."""
        if not self.client:
            raise Exception("Gemini client not initialized")
        
        try:
            # Primary: Try Gemini 2.0 Flash (State of the art)
            return self.client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt,
                config=config
            )
        except Exception as e:
            logger.error(f"Gemini 2.0 Error, falling back to 1.5: {e}")
            # Secondary: Fallback to Gemini 1.5 Flash (More stable/available)
            return self.client.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt,
                config=config
            )

    def get_semantic_embedding(self, text: str) -> list[float]:
        """
        Generate a semantic embedding vector using Google Gemini Embeddings API.
        Uses model 'models/embedding-001' for sub-second semantic retrieval.
        Powers intent recognition and FAQ semantic matching.

        Args:
            text: The text to embed.

        Returns:
            List of float values representing the embedding vector.
        """
        if not self.client:
            return []
        try:
            result = self.client.models.embed_content(
                model="models/embedding-001",
                contents=text
            )
            if result and result.embeddings and result.embeddings[0].values:
                return [float(v) for v in result.embeddings[0].values]
            return []
        except Exception as e:
            logger.error(f"Gemini Embedding Error: {e}")
            return []

    async def get_election_guidance(
        self, query: str, step: Optional[str] = None, lang: str = "en"
    ) -> str:
        """
        Provide India-specific civic guidance based on user query and current step.
        Uses a hybrid approach: In-memory cache -> JSON Knowledge Base -> Gemini AI.
        """
        target_lang = lang if lang in LANG_MAP else "en"
        q_lower = query.lower().strip()

        # 1. Check in-memory session cache first
        step_lower = step.lower() if step else None
        cache_key = f"{target_lang}:{step_lower}:{q_lower}"
        if cache_key in self.guidance_cache:
            return self.guidance_cache[cache_key]

        # 2. Check FAQ fallback
        # Clean both query and keys: remove non-alphanumeric (except spaces) and lowercase
        clean_q = re.sub(r'[^a-z0-9\s]', '', q_lower).strip()
        query_words = set(clean_q.split())
        
        logger.info(f"FAQ Search: query='{query}', clean_q='{clean_q}'")

        for key, val in self.faq_cache.items():
            key_lower = key.lower()
            clean_key = re.sub(r'[^a-z0-9\s]', '', key_lower).strip()

            if clean_key == clean_q:
                logger.info(f"FAQ Hit: key='{key}'")
                res_obj = val
                # Resolve reference if it's a pointer to another key
                if isinstance(val, dict) and "ref" in val:
                    res_obj = self.faq_cache.get(val["ref"], val)
                
                res = res_obj.get(target_lang, res_obj.get("en", ""))
                if res:
                    self.guidance_cache[cache_key] = res
                    return res
        
        logger.warning(f"FAQ Miss for: {clean_q}")

        scenario_keywords = {
            "what if", "lost", "problem", "scenario",
            "issue", "stolen", "wrong", "india"
        }
        is_scenario = any(word in q_lower for word in scenario_keywords)

        # 3. Only use JSON cache if step exists in cache
        if (
            target_lang in LANG_MAP
            and step_lower
            and step_lower in self.cache
            and not is_scenario
        ):
            info_keywords = {"explain", "tell me", "what is", "guide", "info", "overview"}
            if any(word in q_lower for word in info_keywords):
                res = self.cache[step_lower].get(
                    target_lang, self.cache[step_lower].get("en", "")
                )
                if res:
                    self.guidance_cache[cache_key] = res
                    return res

        if not self.client:
            return "Mode: Offline. Expert data for India is limited in this view."

        try:
            lang_name = LANG_MAP.get(lang, "English")
            system_instruction = (
                f"You are the VoteWise Guide for the INDIAN ELECTION PROCESS. "
                f"IMPORTANT: You MUST respond ONLY in {lang_name}. "
                "CRITICAL: Only provide information relevant to the Election Commission "
                "of India (ECI). Use terms like EPIC Card, Form 6, BLO (Booth Level "
                "Officer), and Indian Constituencies. NEVER mention US laws, SSN, or "
                "other countries. If asked about losing an ID, explain the process for "
                "getting a duplicate EPIC card in India and list the 12 alternative "
                "documents ECI allows for voting."
            )

            prompt = f"{system_instruction}\n\nContext: {step}\nUser Question: {query}"

            lock_key = f"guide:{cache_key}"
            if lock_key in self._in_flight:
                return "Still processing your previous request..."
            self._in_flight.add(lock_key)

            try:
                response = await self._generate_content_with_retry(
                    prompt=prompt,
                    config=types.GenerateContentConfig(
                        automatic_function_calling=types.AutomaticFunctionCallingConfig(
                            disable=True
                        )
                    )
                )
                result = response.text or ""
                if result:
                    self.guidance_cache[cache_key] = result
                return result
            finally:
                self._in_flight.discard(lock_key)
        except Exception as e:
            import traceback
            logger.error(f"Gemini Error in get_election_guidance: {e}")
            traceback.print_exc()
            
            # Use multilingual fallback from JSON
            if lang in LANG_MAP and "fallback_busy" in self.faq_cache:
                return self.faq_cache["fallback_busy"].get(
                    lang, self.faq_cache["fallback_busy"]["en"]
                )
            
            return (
                "The Guide is currently busy. Please check the Indian Voter Service "
                "Portal (voters.eci.gov.in) for verified information."
            )

    async def fact_check(self, claim: str, lang: str = "en") -> str:
        """
        Elite Tier AI Fact Checker grounded in ECI data.
        Verifies electoral claims against local cache, then falls back to Gemini 2.0.
        """
        claim_lower = claim.lower().strip()
        claim_clean = re.sub(r'[^\w\s]', '', claim_lower)
        claim_words = set(claim_clean.split())

        for key, val in sorted(
            self.factcheck_cache.items(), key=lambda x: len(x[0]), reverse=True
        ):
            key_clean = re.sub(r'[^\w\s]', '', key.lower()).strip()
            key_words = set(key_clean.split())

            if not key_clean:
                continue

            if key_clean in claim_clean or (key_words and key_words.issubset(claim_words)):
                return f"{val['verdict']}\n\n{val['explanation']}"

        if not self.client:
            return "❌ **FACT-CHECK OFFLINE** — Please verify directly at [eci.gov.in](https://eci.gov.in)"

        try:
            lang_name = LANG_MAP.get(lang, "English")
            prompt = (
                f"{FACT_CHECK_SYSTEM_PROMPT}\n\n"
                f"Respond ONLY in {lang_name}.\n\n"
                f'User Claim to check: "{claim}"'
            )

            lock_key = f"fact:{claim_lower}"
            if lock_key in self._in_flight:
                return "🔍 Already checking this claim... please wait."
            self._in_flight.add(lock_key)

            try:
                response = await self._generate_content_with_retry(
                    prompt=prompt,
                    config=types.GenerateContentConfig(
                        automatic_function_calling=types.AutomaticFunctionCallingConfig(
                            disable=True
                        )
                    )
                )
                result = response.text or ""
            finally:
                self._in_flight.discard(lock_key)

            if result:
                self._cache_fact_check(claim_lower, result)

            return result
        except Exception as e:
            logger.error(f"Gemini Fact-Check Error: {e}")
            return (
                "⚠️ **AI Temporarily Unavailable (Rate Limit)**\n\n"
                "The AI fact-checker is on cooldown. General Rule: Your name on the "
                "Electoral Roll is sufficient to vote with 12 alternative IDs.\n\n"
                "**Source:** [eci.gov.in](https://eci.gov.in)"
            )

    def _cache_fact_check(self, claim: str, result: str):
        """Persist a fact-check result to local JSON storage."""
        try:
            self.factcheck_cache[claim] = {"verdict": "AI-Verified", "explanation": result}
            base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            fc_path = os.path.join(base_path, "data", "factcheck_cache.json")
            with open(fc_path, 'w', encoding='utf-8') as f:
                json.dump(self.factcheck_cache, f, ensure_ascii=False, indent=4)
        except Exception:
            pass


ai_service = AIService()
