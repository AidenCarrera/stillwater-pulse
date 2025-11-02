"""
Stillwater Pulse API - Main application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Apply Python 3.13 CGI fix before importing feedparser
from utils.cgi_fix import apply_cgi_fix
apply_cgi_fix()

# Import configuration and routers
from config.settings import settings
from routers import posts, chat, tts
from models.schemas import HealthResponse

# -------------------------------------------------------------------
# FastAPI Application
# -------------------------------------------------------------------

app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.API_VERSION,
    description="API for aggregating Instagram posts from Stillwater, Oklahoma"
)

# -------------------------------------------------------------------
# CORS Middleware
# -------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# Include Routers
# -------------------------------------------------------------------

app.include_router(posts.router)
app.include_router(chat.router)
app.include_router(tts.router)

# -------------------------------------------------------------------
# Health Check
# -------------------------------------------------------------------

@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        message="Stillwater Pulse API",
        status="running",
        version=settings.API_VERSION
    )


# -------------------------------------------------------------------
# Application Startup
# -------------------------------------------------------------------

@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    print(f"🚀 {settings.APP_TITLE} v{settings.API_VERSION}")
    print(f"📍 Serving on http://127.0.0.1:8000")
    print(f"📖 API docs: http://127.0.0.1:8000/docs")
    
    # Validate configuration
    try:
        settings.validate()
        print("✅ Configuration validated")
    except ValueError as e:
        print(f"⚠️  Configuration warning: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    print("👋 Shutting down Stillwater Pulse API")