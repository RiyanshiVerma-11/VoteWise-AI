import os
import json
from typing import List, Dict
from pydantic import BaseModel

class ElectionStep(BaseModel):
    id: str
    title: str
    description: str
    icon: str

class ChecklistItem(BaseModel):
    title: str
    description: str
    icon: str

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_answer: int
    explanation: str

class TimelineItem(BaseModel):
    phase: str
    title: str
    description: str
    status: str

from ..core.db import db_cache

class ElectionEngine:
    def __init__(self):
        self.load_data()

    def load_data(self):
        """Loads election configuration into SQLite Cache."""
        try:
            base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            config_path = os.path.join(base_path, "data", "election_config.json")
            scenarios_path = os.path.join(base_path, "data", "scenarios.json")
            
            with open(config_path, 'r', encoding='utf-8') as f:
                raw_data = json.load(f)
            
            # Load Scenarios
            try:
                with open(scenarios_path, 'r', encoding='utf-8') as sf:
                    scenarios_data = json.load(sf)
                    db_cache.set("scenarios", scenarios_data)
            except Exception as e:
                db_cache.set("scenarios", {})

            data_cache = {}
            # Convert raw dicts to Pydantic models for type safety and validation
            for lang in raw_data:
                data_cache[lang] = {
                    "steps": [ElectionStep(**s).model_dump() for s in raw_data[lang].get("steps", [])],
                    "quizzes": {
                        step_id: [QuizQuestion(**q).model_dump() for q in questions]
                        for step_id, questions in raw_data[lang].get("quizzes", {}).items()
                    },
                    "checklist": [ChecklistItem(**c).model_dump() for c in raw_data[lang].get("checklist", [])],
                    "timeline": [TimelineItem(**t).model_dump() for t in raw_data[lang].get("timeline", [])]
                }
            db_cache.set("election_data", data_cache)
        except Exception as e:
            print(f"Error loading election config: {e}")
            db_cache.set("election_data", {"en": {"steps": [], "quizzes": {}, "checklist": [], "timeline": []}})

    def get_steps(self, lang: str = "en") -> List[ElectionStep]:
        data = db_cache.get("election_data")
        return [ElectionStep(**s) for s in data.get(lang, data.get("en", {}))["steps"]]

    def get_quiz(self, step_id: str, lang: str = "en") -> List[QuizQuestion]:
        data = db_cache.get("election_data")
        lang_data = data.get(lang, data.get("en", {}))
        return [QuizQuestion(**q) for q in lang_data["quizzes"].get(step_id, [])]

    def get_checklist(self, lang: str = "en") -> List[ChecklistItem]:
        data = db_cache.get("election_data")
        return [ChecklistItem(**c) for c in data.get(lang, data.get("en", {})).get("checklist", [])]

    def get_timeline(self, lang: str = "en") -> List[TimelineItem]:
        data = db_cache.get("election_data")
        return [TimelineItem(**t) for t in data.get(lang, data.get("en", {})).get("timeline", [])]

election_engine = ElectionEngine()


