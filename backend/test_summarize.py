"""
Terminal script to test Instagram post summarization using Google Gemini API.

This script fetches Instagram posts and summarizes their descriptions.
It demonstrates how the summarization utility can be used and is designed
to be compatible with future chatbot integration.

Usage:
    python test_summarize.py [username] [--all]
    
Examples:
    python test_summarize.py okstate
    python test_summarize.py releaseradar
    python test_summarize.py --all
"""

import sys
import feedparser
from datetime import datetime
from utils.gemini import summarize_instagram_post

# Instagram RSS feeds (same as in main.py)
INSTAGRAM_FEEDS = {
    "okstate": "https://rss.app/feeds/NBgetWsYeAxjiJ7N.xml",
    "releaseradar": "https://rss.app/feeds/pwgOKTLwxlfH6MQV.xml",
}


def fetch_posts(username: str) -> list:
    """Fetch posts from the RSS feed for a given username."""
    if username not in INSTAGRAM_FEEDS:
        print(f"Error: Username '{username}' not found.")
        print(f"Available accounts: {list(INSTAGRAM_FEEDS.keys())}")
        return []
    
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
                "description": entry.get("title", ""),  # Title often contains the post description
                "link": entry.get("link", ""),
                "image": image,
                "published": published,
            })
        
        return posts
    
    except Exception as e:
        print(f"Error fetching RSS feed: {str(e)}")
        return []


def print_post_summary(post: dict, summary: str, index: int):
    """Print a formatted post summary."""
    print("\n" + "="*80)
    print(f"Post #{index + 1} - {post.get('published', 'Unknown date')}")
    print("="*80)
    print(f"\nOriginal Description:")
    print(f"{post.get('description', 'No description')[:200]}...")
    print(f"\n📝 Summary:")
    print(f"{summary}")
    print(f"\n🔗 Link: {post.get('link', 'N/A')}")
    print("-"*80)


def main():
    """Main function to run the summarization test."""
    # Check if API key is set
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    if not os.getenv("GEMINI_API_KEY"):
        print("❌ Error: GEMINI_API_KEY not found in environment variables.")
        print("\nPlease create a .env file in the backend directory with:")
        print("GEMINI_API_KEY=your_api_key_here")
        print("\nGet your API key from: https://makersuite.google.com/app/apikey")
        sys.exit(1)
    
    # Parse command line arguments
    if len(sys.argv) < 2:
        print("Usage: python test_summarize.py [username] [--all]")
        print(f"Available accounts: {list(INSTAGRAM_FEEDS.keys())}")
        print("Use --all to summarize posts from all accounts")
        sys.exit(1)
    
    username = sys.argv[1]
    summarize_all = username == "--all"
    
    if summarize_all:
        accounts = list(INSTAGRAM_FEEDS.keys())
    else:
        if username not in INSTAGRAM_FEEDS:
            print(f"Error: Username '{username}' not found.")
            print(f"Available accounts: {list(INSTAGRAM_FEEDS.keys())}")
            sys.exit(1)
        accounts = [username]
    
    print("🚀 Starting Instagram Post Summarization Test")
    print("="*80)
    
    total_posts = 0
    total_summarized = 0
    
    for account in accounts:
        print(f"\n📱 Fetching posts from: @{account}")
        posts = fetch_posts(account)
        
        if not posts:
            print(f"  ⚠️  No posts found for @{account}")
            continue
        
        print(f"  ✓ Found {len(posts)} posts")
        
        for idx, post in enumerate(posts):
            description = post.get("description", "")
            if not description or len(description.strip()) < 10:
                print(f"\n  ⏭️  Skipping post #{idx + 1} (no description)")
                continue
            
            try:
                print(f"\n  🔄 Summarizing post #{idx + 1}...")
                summary = summarize_instagram_post(description, max_length=150)
                
                if summary:
                    print_post_summary(post, summary, idx)
                    total_summarized += 1
                else:
                    print(f"  ⚠️  Failed to generate summary for post #{idx + 1}")
            
            except Exception as e:
                print(f"  ❌ Error summarizing post #{idx + 1}: {str(e)}")
            
            total_posts += 1
    
    print("\n" + "="*80)
    print(f"📊 Summary Statistics:")
    print(f"   Total posts processed: {total_posts}")
    print(f"   Successfully summarized: {total_summarized}")
    print("="*80)
    print("\n✅ Test completed!")


if __name__ == "__main__":
    main()

