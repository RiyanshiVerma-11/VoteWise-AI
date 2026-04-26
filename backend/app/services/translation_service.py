import os
import requests as http_requests
from deep_translator import GoogleTranslator
from ..core.config import get_settings
from ..utils.logger import logger

settings = get_settings()


class TranslationService:
    """
    Hybrid Translation Service.
    Primary: Google Cloud Translation API v2.
    Secondary Fallback: deep-translator (Free Library).
    """

    SUPPORTED_LANGS = {"en", "hi", "mr", "ta", "bn", "te"}
    API_URL = "https://translation.googleapis.com/language/translate/v2"

    def __init__(self):
        """Initialize with Google Translate API key."""
        self.api_key = os.getenv("GOOGLE_TRANSLATE_API_KEY", "")

    def translate(self, text: str, target_lang: str, source_lang: str = "en") -> str:
        """
        Translate text using Google Cloud API or deep-translator fallback.

        Args:
            text: The source text to translate.
            target_lang: BCP-47 language code.
            source_lang: Source language code.

        Returns:
            Translated string, or original text on total failure.
        """
        if target_lang == source_lang:
            return text

        if target_lang not in self.SUPPORTED_LANGS:
            return text

        # 1. Try Official Google Cloud API if key exists
        if self.api_key:
            try:
                response = http_requests.post(
                    self.API_URL,
                    params={"key": self.api_key},
                    json={
                        "q": text,
                        "source": source_lang,
                        "target": target_lang,
                        "format": "text"
                    },
                    timeout=5
                )
                response.raise_for_status()
                data = response.json()
                return data["data"]["translations"][0]["translatedText"]
            except Exception as e:
                logger.error(f"Google Cloud Translate Error: {e}")
                # Fall through to deep-translator fallback

        # 2. Try Free deep-translator fallback
        try:
            translated = GoogleTranslator(source=source_lang, target=target_lang).translate(text)
            return translated
        except Exception as e:
            logger.error(f"deep-translator Fallback Error: {e}")
            return text

    def detect_language(self, text: str) -> str:
        """Detect language using Google Cloud API (No easy free fallback for detection in deep-translator)."""
        if self.api_key:
            try:
                response = http_requests.post(
                    f"{self.API_URL}/detect",
                    params={"key": self.api_key},
                    json={"q": text},
                    timeout=5
                )
                response.raise_for_status()
                data = response.json()
                return data["data"]["detections"][0][0]["language"]
            except Exception as e:
                logger.error(f"Google Cloud Detect Error: {e}")

        # Basic fallback detection logic could be added here if needed
        return "en"


translation_service = TranslationService()
