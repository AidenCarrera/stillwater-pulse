# Stillwater Pulse

A Next.js 16 application that displays the latest Instagram posts from multiple accounts using RSS feeds. Posts are fetched server-side, sorted chronologically, and displayed using Instagram's official embed script.

## Project Structure

```
stillwater-pulse/
├── frontend/              # Next.js 16 application
│   ├── app/               # App Router directory
│   ├── components/        # React components
│   ├── lib/               # RSS parsing utilities
│   └── data/              # Configuration files
│       └── feeds.json     # Instagram account RSS feeds
└── backend/               # (Optional) FastAPI backend (not used in main flow)
```

## Setup Instructions

### Installation

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

## Features

- **Server-side RSS Fetching:** Posts are fetched at request time using Next.js server components
- **Chronological Sorting:** All posts are sorted by publication date (newest first)
- **Latest 5 per Account:** Displays the 5 most recent posts from each configured account
- **Instagram Embeds:** Uses Instagram's official embed script for proper post rendering
- **Real-time Updates:** Fresh data on every page load

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **RSS Parsing:** rss-parser
- **Instagram Embeds:** Official Instagram embed.js script

