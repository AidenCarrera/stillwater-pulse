# Stillwater Pulse Backend

FastAPI backend for fetching Instagram posts via RSS feeds.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
   - Create a `.env` file in the `backend` directory
   - Add your Google Gemini API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Health check
- `GET /accounts` - Returns list of available usernames
- `GET /posts?username={username}` - Returns latest 5 posts for the given username

## Utility Functions

### Gemini Text Summarization

The backend includes a utility function for summarizing Instagram post descriptions using the Google Gemini API.

**Location**: `utils/gemini.py`

**Function**: `summarize_instagram_post(description: str, max_length: int = 150) -> Optional[str]`

**Usage Example**:
```python
from utils.gemini import summarize_instagram_post

# Summarize an Instagram post description
description = "This is a long Instagram post description that needs to be summarized..."
summary = summarize_instagram_post(description, max_length=150)
print(summary)
```

**Parameters**:
- `description` (str): The Instagram post description text to summarize
- `max_length` (int): Maximum length of the summary in characters (default: 150)

**Returns**:
- `str`: A summarized version of the description
- `None`: If an error occurs (raises exception instead)

**Requirements**:
- `GEMINI_API_KEY` must be set in your `.env` file
- Google Gemini API access is required

