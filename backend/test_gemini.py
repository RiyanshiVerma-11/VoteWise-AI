import os
import sys

try:
    from google import genai
except ImportError:
    print("FAILURE: google-genai not installed")
    sys.exit(1)

def test_gemini():
    api_key = os.environ.get('GEMINI_API_KEY')
    print(f"DEBUG: Key exists: {api_key is not None}")
    if api_key:
        print(f"DEBUG: Key length: {len(api_key)}")
    
    try:
        print("DEBUG: Initializing client...")
        client = genai.Client(api_key=api_key)
        print("DEBUG: Sending request...")
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents='Hi'
        )
        print(f"SUCCESS: {response.text}")
    except Exception as e:
        print(f"FAILURE: {type(e).__name__}: {e}")

if __name__ == "__main__":
    test_gemini()
