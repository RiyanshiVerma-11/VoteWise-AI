from typing import List, Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Schema for incoming chat/guidance requests."""

    message: str = Field(..., json_schema_extra={'example': "How do I register to vote?"})
    step: Optional[str] = Field(None, json_schema_extra={'example': "registration"})
    lang: Optional[str] = Field("en", json_schema_extra={'example': "hi"})
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    """Schema for AI guidance responses."""

    response: str
    suggestions: List[str] = []


class QuizQuestion(BaseModel):
    """Schema for a single quiz question."""

    id: int
    question: str
    options: List[str]
    correct_answer: int
    explanation: str


class QuizResult(BaseModel):
    """Schema for quiz result summary."""

    score: int
    total: int
    feedback: str


class AuthRequest(BaseModel):
    """Schema for Google OAuth token verification."""

    token: str
