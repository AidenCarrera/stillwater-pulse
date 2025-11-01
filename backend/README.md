# Stillwater Pulse Backend

FastAPI backend for fetching Instagram posts via RSS feeds.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Health check
- `GET /accounts` - Returns list of available usernames
- `GET /posts?username={username}` - Returns latest 5 posts for the given username

