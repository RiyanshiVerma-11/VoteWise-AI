import json
import os
from typing import List

from pydantic import BaseModel

from ..core.db import db_cache
from ..utils.logger import logger


class ElectionStep(BaseModel):
    """Represents a single step in the election roadmap."""

    id: str
    title: str
    description: str
    icon: str


class ChecklistItem(BaseModel):
    """Represents a document checklist item for voter preparation."""

    title: str
    description: str
    icon: str


class QuizQuestion(BaseModel):
    """Represents a quiz question for a given election step."""

    id: int
    question: str
    options: List[str]
    correct_answer: int
    explanation: str


class TimelineItem(BaseModel):
    """Represents a milestone in the election timeline."""

    phase: str
    title: str
    description: str
    status: str


class ElectionEngine:
    """
    Core engine for managing electoral metadata, quizzes, and timelines.
    Utilizes a high-performance SQLite cache for zero-latency lookups.
    """

    def __init__(self):
        """Initialize the Election Engine and load static data."""
        self.load_data()

    def load_data(self) -> None:
        """
        Load election configuration and scenarios into the SQLite Cache.
        Validates data structure using Pydantic models.
        """
        try:
            base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            config_path = os.path.join(base_path, "data", "election_config.json")
            scenarios_path = os.path.join(base_path, "data", "scenarios.json")

            with open(config_path, 'r', encoding='utf-8') as f:
                raw_data = json.load(f)

            try:
                if os.path.exists(scenarios_path):
                    with open(scenarios_path, 'r', encoding='utf-8') as sf:
                        db_cache.set("scenarios", json.load(sf))
                else:
                    db_cache.set("scenarios", {})
            except Exception:
                db_cache.set("scenarios", {})

            data_cache = {}
            for lang in raw_data:
                data_cache[lang] = {
                    "steps": [
                        ElectionStep(**s).model_dump()
                        for s in raw_data[lang].get("steps", [])
                    ],
                    "quizzes": {
                        step_id: [QuizQuestion(**q).model_dump() for q in questions]
                        for step_id, questions in raw_data[lang].get("quizzes", {}).items()
                    },
                    "checklist": [
                        ChecklistItem(**c).model_dump()
                        for c in raw_data[lang].get("checklist", [])
                    ],
                    "timeline": [
                        TimelineItem(**t).model_dump()
                        for t in raw_data[lang].get("timeline", [])
                    ],
                }
            db_cache.set("election_data", data_cache)
        except Exception as e:
            logger.error(f"Error loading election config: {e}")
            db_cache.set(
                "election_data",
                {"en": {"steps": [], "quizzes": {}, "checklist": [], "timeline": []}}
            )

    def get_steps(self, lang: str = "en") -> List[ElectionStep]:
        """Return the localized election roadmap steps."""
        data = db_cache.get("election_data")
        return [ElectionStep(**s) for s in data.get(lang, data.get("en", {}))["steps"]]

    def get_quiz(self, step_id: str, lang: str = "en") -> List[QuizQuestion]:
        """Return the localized quiz questions for a specific step."""
        data = db_cache.get("election_data")
        lang_data = data.get(lang, data.get("en", {}))
        return [QuizQuestion(**q) for q in lang_data["quizzes"].get(step_id, [])]

    def get_checklist(self, lang: str = "en") -> List[ChecklistItem]:
        """Return the localized document checklist."""
        data = db_cache.get("election_data")
        return [
            ChecklistItem(**c)
            for c in data.get(lang, data.get("en", {})).get("checklist", [])
        ]

    def get_timeline(self, lang: str = "en") -> List[TimelineItem]:
        """Return the localized election timeline milestones."""
        data = db_cache.get("election_data")
        return [
            TimelineItem(**t)
            for t in data.get(lang, data.get("en", {})).get("timeline", [])
        ]


election_engine = ElectionEngine()
