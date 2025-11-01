# -------------------------------------------------------------------
# Stillwater Pulse API — Backend
# -------------------------------------------------------------------

# ✅ Temporary fix for Python 3.13 (feedparser requires deprecated `cgi`)
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
import feedparser
from typing import List, Dict
from datetime import datetime
from dotenv import load_dotenv

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
INSTAGRAM_FEEDS = {
    "okstate": "https://rss.app/feeds/NBgetWsYeAxjiJ7N.xml",
    "releaseradar": "https://rss.app/feeds/pwgOKTLwxlfH6MQV.xml",
}


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
