# Stillwater Pulse Backend

FastAPI backend for fetching Instagram posts via RSS feeds.

## Setup

1. Create a virtual environment (recommended):

```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS / Linux
python3 -m venv venv
source venv/bin/activate

```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Health check
- `GET /accounts` - Returns list of available usernames
- `GET /posts?username={username}` - Returns latest 5 posts for the given username

# Deactivate virtual environment when done
deactivate