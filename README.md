# Stillwater Pulse

Stillwater Pulse is a Next.js 16 application that aggregates and displays the latest Instagram posts from multiple accounts using RSS feeds. Posts are fetched server-side, sorted chronologically, and rendered using Instagram’s official embed script.

# Features

- Server-side RSS Fetching: Fetches posts from multiple Instagram accounts at request time using RSS feeds.
- Chronological Sorting: Posts are sorted by publication date (newest first).
- Latest 5 per Account: Displays the 5 most recent posts from each account.
- Instagram Embeds: Uses Instagram's official embed.js for proper rendering.
- AI-Powered Chat: Ask questions about Stillwater events, restaurants, OSU updates, and more using Google Gemini AI.
- Real-time Updates: Fresh posts on every page load.
- Responsive UI: Built with TailwindCSS for a clean, mobile-first design.

## Setup Instructions

### Installation Backend

1. Create a virtual environment (recommended):

```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS / Linux
python3 -m venv venv
source venv/bin/activate

```

2. Create a `.env` file in the backend directory with your Gemini API key:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

You can get your API key from: https://makersuite.google.com/app/apikey

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`


### Installation Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

## API Endpoints

- `GET /` - Health check
- `GET /accounts` - Returns list of available usernames
- `GET /posts?username={username}` - Returns latest 5 posts for the given username
- `POST /chat` - AI-powered chat endpoint using Gemini
  - Request body: `{ "message": "Your question", "posts": [...] }`
  - Returns: `{ "response": "AI-generated answer" }`

The app will be available at `http://localhost:3000`

## Configuration

Update the RSS feed URLs in `frontend/data/feeds.json`:

```json
{
  "visitstillwater": "https://rss.app/feeds/visitstillwater.xml",
  "stillwaterok": "https://rss.app/feeds/stillwaterok.xml",
  "osuathletics": "https://rss.app/feeds/osuathletics.xml"
}
```
