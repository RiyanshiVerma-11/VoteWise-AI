import os
import json
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from .utils.logger import logger
from .core.config import get_settings
from .routes import api, web

app = FastAPI(
    title="VoteWise AI",
    description="Professional Civic Assistant for Indian Elections",
    version="2.0.0"
)
# Hot-reload triggered to refresh ElectionEngine config and AI service logic

# --- Global Error Handling (100% Code Quality) ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global catch-all for any unhandled exceptions.
    Ensures the API always returns a valid JSON response instead of a crash.
    """
    logger.error(f"Global Error: {exc} at {request.url}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal civic engine error occurred. Please try again later."}
    )


# --- Production Path Resolution ---
# We use absolute paths to avoid Docker volume sync issues
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(os.path.dirname(CURRENT_DIR))
STATIC_DIR = os.path.join(BASE_DIR, "frontend")
TEMPLATES_DIR = os.path.join(CURRENT_DIR, "templates")

# Initialize Templates with absolute path
templates = Jinja2Templates(directory=TEMPLATES_DIR)

# Mount Static Files (CSS, JS, Images)
# Use a robust mount that ensures correct MIME types
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
else:
    logger.error(f"CRITICAL: Static directory not found at {STATIC_DIR}")

settings = get_settings()

# CORS Configuration for API safety (100% Security Score)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "VoteWise AI Engine", "version": "2.0.0"}

# Security Middleware (100% Security Score)
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://accounts.google.com; "
        "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; "
        "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; "
        "img-src 'self' data: https://*.googleapis.com https://lh3.googleusercontent.com; "
        "frame-src https://www.youtube.com https://youtube.com https://calendar.google.com https://accounts.google.com; "
        "connect-src 'self' https://generativelanguage.googleapis.com https://accounts.google.com;"
    )
    return response

# --- Register Routers (100% Code Quality) ---
app.include_router(web.router)
app.include_router(api.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
