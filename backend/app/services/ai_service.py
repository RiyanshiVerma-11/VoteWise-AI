import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            self.client = genai.Client(api_key=api_key)
        else:
            self.client = None
        
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
        except Exception as e:
            print(f"Error loading cache: {e}")
            self.cache = {}
            self.faq_cache = {}

    async def get_election_guidance(self, query: str, step: str = None, lang: str = "en") -> str:
        """
        India-First Civic AI Guide.
        """
        target_lang = "hi" if lang == "hi" else "en"
        q_lower = query.lower().strip()
        
        # Check FAQ fallback first
        for key, val in self.faq_cache.items():
            if key == q_lower or key in q_lower:
                return val.get(target_lang, val.get("en", ""))
        
        scenario_keywords = ["what if", "lost", "problem", "scenario", "issue", "stolen", "wrong", "india"]
        is_scenario = any(word in q_lower for word in scenario_keywords)

        if step and step.lower() in self.cache and not is_scenario:
            info_keywords = ["explain", "deep-dive", "tell me", "what is", "guide", "info", "overview"]
            if any(word in q_lower for word in info_keywords) or len(query) < 30:
                return self.cache[step.lower()].get(target_lang, self.cache[step.lower()].get("en", ""))

        if not self.client:
            return "Mode: Offline. Expert data for India is limited in this view."

        try:
            # STRICT SYSTEM PROMPT: INDIA ONLY
            system_instruction = (
                "You are the VoteWise Guide for the INDIAN ELECTION PROCESS. "
                "CRITICAL: Only provide information relevant to the Election Commission of India (ECI). "
                "Use terms like EPIC Card, Form 6, BLO (Booth Level Officer), and Indian Constituencies. "
                "NEVER mention US laws, SSN, or other countries. "
                "Current User Language: " + lang + ". "
                "If asked about losing an ID, explain the process for getting a duplicate EPIC card in India."
            )

            prompt = f"{system_instruction}\n\nContext: {step}\nUser Question: {query}"
            
            response = self.client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt
            )
            return response.text
        except Exception as e:
            print(f"Gemini Error: {e}")
            # Robust Fallback to local data
            if step and step.lower() in self.cache:
                return self.cache[step.lower()].get(target_lang, self.cache[step.lower()].get("en", "")) + "\n\n*(Note: Displaying offline guide due to high traffic)*"
            
            return "The Guide is currently busy. Please check the Indian Voter Service Portal (voters.eci.gov.in) for verified information."


ai_service = AIService()
