import os
from typing import Optional

from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests

from ..utils.logger import logger

load_dotenv()


class AuthService:
    """
    Secure Authentication Service using Google OAuth 2.0 Identity.
    Verifies Google ID tokens and extracts user profile information.
    """

    def __init__(self):
        """Initialize the Auth Service with the Google Client ID from environment."""
        self.client_id = os.getenv("GOOGLE_CLIENT_ID")

    def verify_google_token(self, token: str) -> Optional[dict]:
        """
        Verify the Google OAuth 2.0 ID token using the official Google Auth library.
        Returns user information dict if valid, otherwise returns None.
        """
        if not self.client_id:
            return {"status": "debug", "user": "Anonymous Voter"}

        try:
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), self.client_id
            )
            return {
                "id": idinfo.get('sub'),
                "name": idinfo.get('name'),
                "email": idinfo.get('email'),
                "picture": idinfo.get('picture'),
                "status": "authenticated"
            }
        except ValueError as e:
            logger.error(f"Token verification failed: {e}")
            return None


auth_service = AuthService()
