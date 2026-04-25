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

class ElectionEngine:
    def __init__(self):
        self.data = {}
        self.load_data()

    def load_data(self):
        """Loads election configuration from JSON file."""
        try:
            base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            config_path = os.path.join(base_path, "data", "election_config.json")
            
            with open(config_path, 'r', encoding='utf-8') as f:
                raw_data = json.load(f)
                
            # Convert raw dicts to Pydantic models for type safety and validation
            for lang in raw_data:
                self.data[lang] = {
                    "steps": [ElectionStep(**s) for s in raw_data[lang].get("steps", [])],
                    "quizzes": {
                        step_id: [QuizQuestion(**q) for q in questions]
                        for step_id, questions in raw_data[lang].get("quizzes", {}).items()
                    },
                    "checklist": [ChecklistItem(**c) for c in raw_data[lang].get("checklist", [])],
                    "timeline": [TimelineItem(**t) for t in raw_data[lang].get("timeline", [])]
                }
        except Exception as e:
            print(f"Error loading election config: {e}")
            # Fallback to empty structure to prevent crashes
            self.data = {"en": {"steps": [], "quizzes": {}, "checklist": [], "timeline": []}}

    def get_steps(self, lang: str = "en") -> List[ElectionStep]:
        return self.data.get(lang, self.data.get("en", {}))["steps"]

    def get_quiz(self, step_id: str, lang: str = "en") -> List[QuizQuestion]:
        lang_data = self.data.get(lang, self.data.get("en", {}))
        return lang_data["quizzes"].get(step_id, [])

    def get_checklist(self, lang: str = "en") -> List[ChecklistItem]:
        return self.data.get(lang, self.data.get("en", {})).get("checklist", [])

    def get_timeline(self, lang: str = "en") -> List[TimelineItem]:
        return self.data.get(lang, self.data.get("en", {})).get("timeline", [])

election_engine = ElectionEngine()


