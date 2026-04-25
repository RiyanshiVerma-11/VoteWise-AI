from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    GOOGLE_CLIENT_ID: str = ""
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:8000",
        "https://votewise-ai.onrender.com",
        "https://riyanshiverma-11.github.io"
    ]
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

@lru_cache
def get_settings() -> Settings:
    return Settings()
