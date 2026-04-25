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

            # ID token is valid. Get the user's Google Account ID from the decoded token.
            userid = idinfo['sub']
            return idinfo
        except ValueError:
            # Invalid token
            return None

auth_service = AuthService()
