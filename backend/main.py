# -------------------------------------------------------------------
# Stillwater Pulse API — Backend
# -------------------------------------------------------------------

# Temporary fix for Python 3.13 (feedparser requires deprecated `cgi`)
import sys, types
if "cgi" not in sys.modules:
    sys.modules["cgi"] = types.ModuleType("cgi")

# Define the missing parse_header function used by feedparser
def _fake_parse_header(value):
    """Minimal replacement for cgi.parse_header (removed in Python 3.13)."""
    parts = value.split(";")
    key = parts[0].strip().lower()
    pdict = {}
    for p in parts[1:]:
        if "=" in p:
            k, v = p.strip().split("=", 1)
            pdict[k.lower()] = v.strip('"')
    return key, pdict

sys.modules["cgi"].parse_header = _fake_parse_header

# -------------------------------------------------------------------
# Imports
# -------------------------------------------------------------------
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import feedparser
import json
from pathlib import Path
import json
from pathlib import Path
from typing import List, Dict
from datetime import datetime
import os
import google.generativeai as genai
from dotenv import load_dotenv
from elevenlabs import ElevenLabs
import io
import re

# Load environment variables
load_dotenv()

# -------------------------------------------------------------------
# App Configuration
# -------------------------------------------------------------------
app = FastAPI(title="Stillwater Pulse API")

# Enable CORS for frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Predefined Instagram RSS feeds
def load_feeds() -> Dict[str, str]:
    """Load Instagram RSS feeds from feeds.json."""
    feeds_path = Path(__file__).parent / "frontend" / "data" / "feeds.json"
    try:
        with open(feeds_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        # Fallback to hardcoded feeds if file not found
        print(f"Warning: feeds.json not found at {feeds_path}, using fallback feeds")
        return {
            "okstate": "https://rss.app/feeds/NBgetWsYeAxjiJ7N.xml",
            "releaseradar": "https://rss.app/feeds/pwgOKTLwxlfH6MQV.xml",
        }

INSTAGRAM_FEEDS = load_feeds()

# -------------------------------------------------------------------
# Gemini AI Configuration
# -------------------------------------------------------------------

# Global variable to cache the model
_gemini_model = None

def get_gemini_model():
    """Initialize and return Gemini model instance (cached)."""
    global _gemini_model
    if _gemini_model is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        genai.configure(api_key=api_key)
        # Use gemini-2.0-flash for reliable, fast responses
        _gemini_model = genai.GenerativeModel('gemini-2.0-flash')
    return _gemini_model

# -------------------------------------------------------------------
# ElevenLabs TTS Configuration
# -------------------------------------------------------------------

_elevenlabs_client = None

def get_elevenlabs_client():
    """Initialize and return ElevenLabs client instance (cached)."""
    global _elevenlabs_client
    if _elevenlabs_client is None:
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            raise ValueError("ELEVENLABS_API_KEY environment variable is not set")
        _elevenlabs_client = ElevenLabs(api_key=api_key)
    return _elevenlabs_client

def strip_markdown(text: str) -> str:
    """Remove markdown formatting for TTS (bold, italic, etc.)."""
    # Remove bold (**text**)
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    # Remove italic (*text*)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    return text

# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------

@app.get("/accounts")
async def get_accounts() -> List[str]:
    """Return all available usernames from INSTAGRAM_FEEDS."""
    return list(INSTAGRAM_FEEDS.keys())


@app.get("/posts")
async def get_posts(username: str = Query(..., description="Instagram username")) -> List[Dict[str, str]]:
    """Fetch the latest 5 posts from the given username's RSS feed."""
    if username not in INSTAGRAM_FEEDS:
        raise HTTPException(
            status_code=404,
            detail=f"Username '{username}' not found. Available accounts: {list(INSTAGRAM_FEEDS.keys())}",
        )

    rss_url = INSTAGRAM_FEEDS[username]

    try:
        feed = feedparser.parse(rss_url)
        posts = []

        for entry in feed.entries[:5]:
            image = ""
            if "media_content" in entry:
                image = entry.media_content[0]["url"] if entry.media_content else ""
            elif "media_thumbnail" in entry:
                image = entry.media_thumbnail[0]["url"] if entry.media_thumbnail else ""
            elif "image" in entry:
                image = entry.image.get("href", "")

            published = ""
            if hasattr(entry, "published"):
                published = entry.published
            elif hasattr(entry, "published_parsed"):
                published = datetime(*entry.published_parsed[:6]).isoformat()

            posts.append({
                "title": entry.get("title", ""),
                "link": entry.get("link", ""),
                "image": image,
                "published": published,
            })

        return posts

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching RSS feed: {str(e)}")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Stillwater Pulse API", "status": "running"}


# -------------------------------------------------------------------
# Chat Endpoint
# -------------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str
    posts: List[Dict] = []

class ChatResponse(BaseModel):
    response: str


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat endpoint using Gemini AI."""
    try:
        # Get Gemini model
        model = get_gemini_model()
        
        # Build context from recent posts
        posts_context = ""
        if request.posts:
            posts_context = "\n\nRecent Stillwater Instagram posts:\n"
            for i, post in enumerate(request.posts[:10], 1):  # Limit to 10 most recent posts
                title = post.get('title', 'Untitled')
                account = post.get('account', 'Unknown')
                snippet = post.get('contentSnippet', title)
                posts_context += f"{i}. From @{account}: {title}\n   {snippet}\n"
        
        # Create system prompt for Stillwater-specific context
        system_prompt = """You are a helpful AI assistant for Stillwater Pulse, a platform that aggregates Instagram posts from local Stillwater, Oklahoma organizations and businesses.

Your role is to help users discover information about:
- Local events happening in Stillwater
- Food and restaurant recommendations
- Oklahoma State University (OSU) related news and games
- Downtown Stillwater businesses and announcements
- Community events and local news

Be friendly, concise, and focused on helping users find relevant information from the recent Instagram posts."""
        
        # Build the full prompt
        full_prompt = f"""{system_prompt}

{posts_context}

User question: {request.message}

Please provide a helpful response based on the available information. If the information isn't in the recent posts, let the user know and offer general suggestions about how they might find what they're looking for."""
        
        # Generate response
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 1024,
        }
        
        response = model.generate_content(
            full_prompt,
            generation_config=generation_config
        )
        
        # Extract response text
        if hasattr(response, 'text') and response.text:
            response_text = response.text.strip()
        elif hasattr(response, 'candidates') and response.candidates:
            response_text = response.candidates[0].content.parts[0].text.strip()
        else:
            raise Exception("Unexpected response format from Gemini API")
        
        return ChatResponse(response=response_text)
        
    except ValueError as e:
        print(f"ValueError in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except Exception as e:
        print(f"Exception in chat endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating chat response: {str(e)}")


# -------------------------------------------------------------------
# Text-to-Speech Endpoint
# -------------------------------------------------------------------

class TTSRequest(BaseModel):
    text: str
    voice_id: str = "21m00Tcm4TlvDq8ikWAM"  # Rachel voice (default)

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech using ElevenLabs API."""
    try:
        client = get_elevenlabs_client()
        
        # Strip markdown formatting from text for better TTS
        clean_text = strip_markdown(request.text)
        
        # Generate audio using ElevenLabs
        audio_generator = client.text_to_speech.convert(
            voice_id=request.voice_id,
            text=clean_text,
            model_id="eleven_turbo_v2_5",  # Fast, high-quality model
            output_format="mp3_44100_128"
        )
        
        # Collect audio chunks into bytes
        audio_bytes = io.BytesIO()
        for chunk in audio_generator:
            if chunk:
                audio_bytes.write(chunk)
        
        audio_bytes.seek(0)
        
        # Return audio as streaming response
        return StreamingResponse(
            audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3",
                "Cache-Control": "no-cache"
            }
        )
        
    except ValueError as e:
        print(f"ValueError in TTS endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except Exception as e:
        print(f"Exception in TTS endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")


@app.get("/tts/voices")
async def get_voices():
    """Get available ElevenLabs voices."""
    try:
        client = get_elevenlabs_client()
        voices = client.voices.get_all()
        
        return {
            "voices": [
                {
                    "voice_id": voice.voice_id,
                    "name": voice.name,
                    "category": voice.category if hasattr(voice, 'category') else None
                }
                for voice in voices.voices
            ]
        }
    except Exception as e:
        print(f"Error fetching voices: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching voices: {str(e)}")