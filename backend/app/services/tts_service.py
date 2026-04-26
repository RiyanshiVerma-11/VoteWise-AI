import os
import base64
import io
import requests as http_requests
from gtts import gTTS

from ..utils.logger import logger

class TTSService:
    """
    Hybrid Text-to-Speech Service.
    Primary: Google Cloud Text-to-Speech API.
    Secondary Fallback: gTTS (Standard free fallback).
    """

    API_URL = "https://texttospeech.googleapis.com/v1/text:synthesize"

    # Mapping for Google Cloud TTS
    LANG_VOICE_MAP = {
        "en": {"languageCode": "en-IN", "name": "en-IN-Wavenet-D"},
        "hi": {"languageCode": "hi-IN", "name": "hi-IN-Wavenet-D"},
        "mr": {"languageCode": "mr-IN", "name": "mr-IN-Wavenet-A"},
        "ta": {"languageCode": "ta-IN", "name": "ta-IN-Wavenet-D"},
        "bn": {"languageCode": "bn-IN", "name": "bn-IN-Wavenet-B"},
        "te": {"languageCode": "te-IN", "name": "te-IN-Wavenet-D"},
    }

    def __init__(self):
        """Initialize with Google TTS API key from environment."""
        self.api_key = os.getenv("GOOGLE_TTS_API_KEY", "")

    async def synthesize(self, text: str, lang: str = "en") -> dict:
        """
        Convert text to speech audio using Google Cloud API or gTTS fallback.

        Args:
            text: The civic guidance text to synthesize.
            lang: BCP-47 language code.

        Returns:
            Dict with 'mode', 'audio_content' (base64), and metadata.
        """
        voice_config = self.LANG_VOICE_MAP.get(lang, self.LANG_VOICE_MAP["en"])

        # 1. Try Official Google Cloud API if key exists
        if self.api_key:
            try:
                payload = {
                    "input": {"text": text},
                    "voice": {
                        "languageCode": voice_config["languageCode"],
                        "name": voice_config["name"],
                        "ssmlGender": "NEUTRAL"
                    },
                    "audioConfig": {
                        "audioEncoding": "MP3",
                        "speakingRate": 0.9,
                        "pitch": 0.0
                    }
                }
                response = http_requests.post(
                    self.API_URL,
                    params={"key": self.api_key},
                    json=payload,
                    timeout=10
                )
                response.raise_for_status()
                audio_b64 = response.json().get("audioContent", "")
                return {
                    "mode": "google_cloud",
                    "audio_content": audio_b64,
                    "lang": voice_config["languageCode"],
                    "fallback": False
                }
            except Exception as e:
                logger.error(f"Google Cloud TTS Error: {e}")

        # 2. Try gTTS (Free Fallback)
        try:
            tts = gTTS(text=text, lang=lang)
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            audio_b64 = base64.b64encode(fp.read()).decode("utf-8")
            return {
                "mode": "gtts",
                "audio_content": audio_b64,
                "lang": voice_config["languageCode"],
                "fallback": False
            }
        except Exception as e:
            logger.error(f"gTTS Fallback Error: {e}")

        # 3. Final Fallback: Browser Speech API
        return {
            "mode": "browser_speech_api",
            "text": text,
            "lang": voice_config["languageCode"],
            "fallback": True
        }

    async def synthesize_announcement(self, text: str, lang: str = "en") -> str:
        """Convenience method returning only the base64 audio string."""
        result = await self.synthesize(text, lang)
        return result.get("audio_content", "")

tts_service = TTSService()
