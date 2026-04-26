import os
import json
import re
from typing import Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

load_dotenv()

FACT_CHECK_SYSTEM_PROMPT = """
You are the VoteWise AI Elite Fact-Checker, a high-precision tool for the Indian electoral context.
Your mission: Identify misinformation, deepfakes, and legal violations related to the Representation of the People Act, 1951.

Languages supported: English (en), Hindi (hi), Marathi (mr), Tamil (ta), Bengali (bn), Telugu (te).
Always respond in the language specified by the user.

Strict Rules:
1. VERDICT FIRST: Start every response with one of these labels in bold: [VERIFIED], [FAKE], [MISLEADING], or [ILLEGAL].
2. LEGAL CITATION: Cite specific sections of the 'Representation of the People Act, 1950/1951' for violations.
3. ECI GUIDELINES: Always prioritize official ECI data.
4. RESPONSE FORMAT: Use markdown with bold headers. Keep under 150 words.
5. SOURCE: End every response with: **Source:** Official ECI Guidelines (eci.gov.in)
"""

LANG_MAP: dict[str, str] = {
    "en": "English",
    "hi": "Hindi (Devanagari script)",
    "mr": "Marathi (Devanagari script)",
    "ta": "Tamil (Tamil script)",
    "bn": "Bengali (Bengali script)",
    "te": "Telugu (Telugu script)",
}

class AIService:
    def __init__(self):
        api_key: Optional[str] = os.getenv("GEMINI_API_KEY")
        self.client: Optional[genai.Client] = genai.Client(api_key=api_key) if api_key else None
        
        try:
            base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            json_path = os.path.join(base_path, "data", "knowledge_base.json")
            with open(json_path, 'r', encoding='utf-8') as f:
                self.cache = json.load(f)
            
            faq_path = os.path.join(base_path, "data", "chatbot_faq.json")
            if os.path.exists(faq_path):
                with open(faq_path, 'r', encoding='utf-8') as f:
                    self.faq_cache = json.load(f)
            else:
                self.faq_cache = {}

            fc_path = os.path.join(base_path, "data", "factcheck_cache.json")
            if os.path.exists(fc_path):
                with open(fc_path, 'r', encoding='utf-8') as f:
                    self.factcheck_cache = json.load(f)
            else:
                self.factcheck_cache = {}
            
            self.guidance_cache = {} # In-memory cache for session guidance
            self._in_flight = set() # Track current requests to avoid redundant calls
        except Exception as e:
            print(f"Error loading cache: {e}")
            self.cache = {}
            self.faq_cache = {}
            self.factcheck_cache = {}
            self.guidance_cache = {}
            self._in_flight = set()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((Exception)), # We'll refine this if needed
        reraise=True
    )
    async def _generate_content_with_retry(self, prompt, config):
        if not self.client:
            raise Exception("Gemini client not initialized")
        return self.client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=config
        )

    async def get_election_guidance(self, query: str, step: Optional[str] = None, lang: str = "en") -> str:
        """
        India-First Civic AI Guide — supports 6 Indian languages.
        """
        target_lang = lang if lang in LANG_MAP else "en"
        q_lower = query.lower().strip()
        
        # 1. Check in-memory session cache first
        step_lower = step.lower() if step else None
        cache_key = f"{target_lang}:{step_lower}:{q_lower}"
        if cache_key in self.guidance_cache:
            return self.guidance_cache[cache_key]

        # 2. Check FAQ fallback
        # Clean query for robust matching
        clean_q = q_lower.replace('?', '').replace('!', '').strip()
        query_words = set(clean_q.split())
        
        for key, val in self.faq_cache.items():
            key_lower = key.lower()
            key_words = set(key_lower.split())
            
            # Match if exact, or if all words in the FAQ key are present in the user query
            if key_lower == clean_q or (key_words and key_words.issubset(query_words)):
                res = val.get(target_lang, val.get("en", ""))
                if res:
                    self.guidance_cache[cache_key] = res
                    return res
        
        scenario_keywords = {"what if", "lost", "problem", "scenario", "issue", "stolen", "wrong", "india"}
        is_scenario = any(word in q_lower for word in scenario_keywords)

        # 3. Only use JSON cache if step exists in cache
        if target_lang in LANG_MAP and step_lower and step_lower in self.cache and not is_scenario:
            info_keywords = {"explain", "tell me", "what is", "guide", "info", "overview"}
            if any(word in q_lower for word in info_keywords) or len(query) < 35:
                res = self.cache[step_lower].get(target_lang, self.cache[step_lower].get("en", ""))
                if res:
                    self.guidance_cache[cache_key] = res
                    return res

        if not self.client:
            return "Mode: Offline. Expert data for India is limited in this view."

        try:
            lang_name = LANG_MAP.get(lang, "English")
            system_instruction = (
                f"You are the VoteWise Guide for the INDIAN ELECTION PROCESS. "
                f"IMPORTANT: You MUST respond ONLY in {lang_name}. Do not use any other language. "
                "CRITICAL: Only provide information relevant to the Election Commission of India (ECI). "
                "Use terms like EPIC Card, Form 6, BLO (Booth Level Officer), and Indian Constituencies. "
                "NEVER mention US laws, SSN, or other countries. "
                "If asked about losing an ID, explain the process for getting a duplicate EPIC card in India "
                "and list the 12 alternative documents ECI allows for voting."
            )

            prompt = f"{system_instruction}\n\nContext: {step}\nUser Question: {query}"
            
            # Use a lock-key for in-flight requests
            lock_key = f"guide:{cache_key}"
            if lock_key in self._in_flight:
                return "Still processing your previous request..."
            self._in_flight.add(lock_key)
            
            try:
                response = await self._generate_content_with_retry(
                    prompt=prompt,
                    config=types.GenerateContentConfig(
                        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
                    )
                )
                result = response.text or ""
                if result:
                    self.guidance_cache[cache_key] = result
                return result
            finally:
                self._in_flight.discard(lock_key)
        except Exception as e:
            print(f"Gemini Error: {e}")
            if lang in LANG_MAP and step and step.lower() in self.cache:
                target_lang = lang
                res = self.cache[step.lower()].get(target_lang, self.cache[step.lower()].get("en", "")) + "\n\n*(Note: Displaying offline guide due to high traffic)*"
                self.guidance_cache[cache_key] = res
                return res
            return "The Guide is currently busy. Please check the Indian Voter Service Portal (voters.eci.gov.in) for verified information."

    async def fact_check(self, claim: str, lang: str = "en") -> str:
        """
        Elite Tier AI Fact Checker — checks local cache first, then falls back to Gemini.
        """
        claim_lower = claim.lower().strip()
        # 1. Check local fact-check cache first
        claim_clean = re.sub(r'[^\w\s]', '', claim_lower)
        claim_words = set(claim_clean.split())

        # Sort by specificity (longer keys first)
        for key, val in sorted(self.factcheck_cache.items(), key=lambda x: len(x[0]), reverse=True):
            key_lower = key.lower()
            key_clean = re.sub(r'[^\w\s]', '', key_lower)
            key_words = set(key_clean.split())
            
            # Match if the cached claim words are a subset of the user claim words
            if key_clean in claim_clean or (key_words and key_words.issubset(claim_words)):
                return f"{val['verdict']}\n\n{val['explanation']}"

        # 2. Fall back to Gemini AI
        if not self.client:
            return "❌ **FACT-CHECK OFFLINE** — Please verify directly at [eci.gov.in](https://eci.gov.in)"

        try:
            lang_name = LANG_MAP.get(lang, "English")
            lang_instruction = f"Respond ONLY in {lang_name}."
            prompt = f"{FACT_CHECK_SYSTEM_PROMPT}\n\n{lang_instruction}\n\nUser Claim to check: \"{claim}\""
            
            # Backend-level request deduplication
            lock_key = f"fact:{claim_lower}"
            if lock_key in self._in_flight:
                return "🔍 Already checking this claim... please wait."
            self._in_flight.add(lock_key)

            try:
                response = await self._generate_content_with_retry(
                    prompt=prompt,
                    config=types.GenerateContentConfig(
                        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
                    )
                )
                result = response.text or ""
            finally:
                self._in_flight.discard(lock_key)

            # Save to local cache for future hardening
            try:
                if result:
                    self.factcheck_cache[claim_lower] = {
                        "verdict": "AI-Verified",
                        "explanation": result
                    }
                    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                    fc_path = os.path.join(base_path, "data", "factcheck_cache.json")
                    with open(fc_path, 'w', encoding='utf-8') as f:
                        json.dump(self.factcheck_cache, f, ensure_ascii=False, indent=4)
            except Exception: pass

            return result
        except Exception as e:
            print(f"Gemini Fact-Check Error: {e}")
            return (
                "⚠️ **AI Temporarily Unavailable (Rate Limit)**\n\n"
                "The AI fact-checker is on cooldown due to high usage. However, here is a key general rule:\n\n"
                "**You do NOT need your physical Voter ID to vote.** Your name on the Electoral Roll is sufficient. "
                "ECI accepts 12 alternative documents including Aadhaar, PAN Card, Driving License, and Passport.\n\n"
                "**Source:** [Election Commission of India — eci.gov.in](https://eci.gov.in)"
            )


ai_service = AIService()
