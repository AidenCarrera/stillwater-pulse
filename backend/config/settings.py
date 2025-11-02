"""
Configuration and settings management for Stillwater Pulse API.
"""

import os
import json
from pathlib import Path
from typing import Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Settings:
    """Application settings and configuration."""
    
    # API Configuration
    APP_TITLE = "Stillwater Pulse API"
    API_VERSION = "1.0.0"
    
    # CORS Settings
    CORS_ORIGINS = ["http://localhost:3000"]
    
    # API Keys
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
    
    # Gemini Configuration
    GEMINI_MODEL = "gemini-2.0-flash"
    GEMINI_TEMPERATURE = 0.7
    GEMINI_TOP_P = 0.95
    GEMINI_TOP_K = 40
    GEMINI_MAX_TOKENS = 1024
    
    # TTS Configuration
    DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel voice
    TTS_MODEL = "eleven_turbo_v2_5"
    TTS_OUTPUT_FORMAT = "mp3_44100_128"
    
    # Posts Configuration
    MAX_POSTS_PER_ACCOUNT = 5
    MAX_POSTS_FOR_CONTEXT = 40
    
    # System Prompt
    SYSTEM_PROMPT = """You are a helpful AI assistant for Stillwater Pulse, a platform that aggregates Instagram posts from local Stillwater, Oklahoma organizations and businesses.

Your role is to help users discover information about:
- Local events happening in Stillwater
- Food and restaurant recommendations
- Oklahoma State University (OSU) related news and games
- Downtown Stillwater businesses and announcements
- Community events and local news

Be friendly, concise, and focused on helping users find relevant information from the recent Instagram posts."""

    @classmethod
    def validate(cls):
        """Validate required environment variables."""
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        if not cls.ELEVENLABS_API_KEY:
            raise ValueError("ELEVENLABS_API_KEY environment variable is not set")


def load_instagram_feeds() -> Dict[str, str]:
    """Load Instagram RSS feeds from feeds.json."""
    # Try multiple possible locations
    possible_paths = [
        Path(__file__).parent.parent.parent / "frontend" / "data" / "feeds.json",
        Path(__file__).parent.parent / "data" / "feeds.json",
        Path("frontend/data/feeds.json"),
    ]
    
    for feeds_path in possible_paths:
        if feeds_path.exists():
            try:
                with open(feeds_path, "r") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading feeds from {feeds_path}: {e}")
                continue
    
    # Fallback to hardcoded feeds
    print("Warning: feeds.json not found, using fallback feeds")
    return {
        "okstate": "https://rss.app/feeds/NBgetWsYeAxjiJ7N.xml",
        "releaseradar": "https://rss.app/feeds/pwgOKTLwxlfH6MQV.xml",
    }


# Global settings instance
settings = Settings()
INSTAGRAM_FEEDS = load_instagram_feeds()