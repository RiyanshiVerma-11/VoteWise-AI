from pydantic import BaseModel, Field
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str = Field(..., example="How do I register to vote?")
    step: Optional[str] = Field(None, example="registration")
    lang: Optional[str] = Field("en", example="hi")
    context: Optional[dict] = None

class ChatResponse(BaseModel):
    response: str
    suggestions: List[str] = []

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_answer: int
    explanation: str

class QuizResult(BaseModel):
    score: int
    total: int
    feedback: str

class AuthRequest(BaseModel):
    token: str
