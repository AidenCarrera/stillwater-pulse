# Stillwater Pulse

Stillwater Pulse is a Next.js 16 application that aggregates and displays the latest Instagram posts from multiple accounts using RSS feeds.
Posts are fetched server-side, sorted chronologically, and rendered using Instagram’s official embed script.

## Purpose

Stillwater Pulse was created to provide a central hub for the Stillwater community

The site automatically updates with the newest posts from Instagram, allowing users to see what’s happening around town at a glance.  

An integrated AI assistant enhances the experience by letting visitors ask questions like:
- “What events are happening this week?”
- “Show me recent food and restaurant posts.”
- “Any OSU game day updates?”

In addition to providing relevant and real-time information, the AI assistant includes **text-to-speech (TTS) audio playback**,
giving it a more engaging and lifelike personality that makes interacting with Stillwater Pulse both informative and enjoyable.

This project was originally developed as an entry for **Oklahoma State University’s Hackathon 2025**

## Tech Stack
### Frontend
- **Framework:** Next.js 16
- **Language:** TypeScript
- **Styling:** TailwindCSS v4
### Backend
- **Language:** Python
- **Framework:** FastAPI
- **Server:** Uvicorn
- **AI Integration**: Google Gemini, ElevenLabs (TTS)  
- **Other**: RSS feeds, Instagram embeds, REST API architecture  

## Features

- Server-side RSS Fetching: Fetches posts from multiple Instagram accounts at request time using RSS feeds.
- Chronological Sorting: Posts are sorted by publication date (newest first).
- Latest 5 per Account: Displays the 5 most recent posts from each account.
- Instagram Embeds: Uses Instagram's official embed.js for proper rendering.
- AI-Powered Chat: Ask questions about Stillwater events, restaurants, OSU updates, and more using Google Gemini AI.
- Text-to-Speech: Powered by ElevenLabs for AI voice responses.
- Real-time Updates: Fresh posts on every page load.
- Responsive UI: Built with TailwindCSS for a clean, mobile-first design.

## Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):

```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS / Linux
python3 -m venv venv
source venv/bin/activate

```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
CORS_ORIGINS=http://localhost:3000
```
You can get your Gemini API key from: [https://makersuite.google.com/app/apikey](https://aistudio.google.com/app/api-keys)

You can get your ElevenLabs API key from: [https://elevenlabs.io/](https://elevenlabs.io/developers)

CORS_ORIGINS should point to your frontend server’s URL (e.g., http://localhost:3000 during local development).

5. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

Your backend will now be available at:
http://localhost:8000

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env.local file

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

NEXT_PUBLIC_API_URL should point to your backend server’s URL (e.g., http://localhost:8000 during local development).

4. Run the development server:
```bash
npm run dev
```

Your frontend will now be available at:
http://localhost:3000

## API Endpoints Overview

| Method | Endpoint | Description |
|--------|-----------|-------------|
| `GET`  | `/` | Health check |
| `GET`  | `/accounts` | Get list of all available Instagram usernames |
| `GET`  | `/posts` | Get latest posts from a specific Instagram account |
| `POST` | `/chat` | Chat with AI about Stillwater events and posts |
| `POST` | `/tts` | Convert text to speech using ElevenLabs |
| `GET`  | `/tts/voices` | Get available ElevenLabs voices |

The app will be available at `http://localhost:3000`

## API Documentation
For full request/response schemas, visit:
http://localhost:8000/docs

## Configuration

Update the RSS feed URLs in `frontend/data/feeds.json`:

```json
{
  "visitstillwater": "https://rss.app/feeds/visitstillwater.xml",
  "stillwaterok": "https://rss.app/feeds/stillwaterok.xml",
  "osuathletics": "https://rss.app/feeds/osuathletics.xml"
}
```
