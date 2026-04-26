import os
from google.oauth2 import id_token
from google.auth.transport import requests
from dotenv import load_dotenv

load_dotenv()

class AuthService:
    def __init__(self):
        self.client_id = os.getenv("GOOGLE_CLIENT_ID")

    def verify_google_token(self, token: str):
        """
        Verifies the Google OAuth 2.0 ID token.
        """
        if not self.client_id:
            return {"status": "debug", "user": "Anonymous Voter"}
            
        try:
            # Specify the CLIENT_ID of the app that accesses the backend:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), self.client_id)

            # ID token is valid. 
            # We return the full info which includes name, email, picture, and sub (user ID)
            return {
                "id": idinfo.get('sub'),
                "name": idinfo.get('name'),
                "email": idinfo.get('email'),
                "picture": idinfo.get('picture'),
                "status": "authenticated"
            }
        except ValueError as e:
            # Invalid token
            print(f"Token verification failed: {e}")
            return None

auth_service = AuthService()
