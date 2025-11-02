"""
Service for fetching and parsing RSS feeds.
"""

import feedparser
from datetime import datetime
from typing import List, Dict
from config.settings import INSTAGRAM_FEEDS, settings


class RSSService:
    """Service for handling RSS feed operations."""
    
    @staticmethod
    def get_account_names() -> List[str]:
        """Get list of all available Instagram account names."""
        return list(INSTAGRAM_FEEDS.keys())
    
    @staticmethod
    def validate_account(username: str) -> bool:
        """Check if an account exists in the feeds."""
        return username in INSTAGRAM_FEEDS
    
    @staticmethod
    def get_feed_url(username: str) -> str:
        """Get RSS feed URL for a given username."""
        return INSTAGRAM_FEEDS.get(username, "")
    
    @staticmethod
    def fetch_posts(username: str) -> List[Dict[str, str]]:
        """
        Fetch latest posts from a username's RSS feed.
        
        Args:
            username: Instagram account username
            
        Returns:
            List of post dictionaries with title, link, image, and published date
            
        Raises:
            ValueError: If username not found
            Exception: If RSS feed fetch fails
        """
        if not RSSService.validate_account(username):
            raise ValueError(
                f"Username '{username}' not found. "
                f"Available accounts: {RSSService.get_account_names()}"
            )
        
        rss_url = RSSService.get_feed_url(username)
        
        try:
            feed = feedparser.parse(rss_url)
            posts = []
            
            max_posts = settings.MAX_POSTS_PER_ACCOUNT
            for entry in feed.entries[:max_posts]:
                # Extract image from various possible fields
                image = RSSService._extract_image(entry)
                
                # Extract published date
                published = RSSService._extract_published_date(entry)
                
                posts.append({
                    "title": entry.get("title", ""),
                    "link": entry.get("link", ""),
                    "image": image,
                    "published": published,
                })
            
            return posts
            
        except Exception as e:
            raise Exception(f"Error fetching RSS feed for {username}: {str(e)}")
    
    @staticmethod
    def _extract_image(entry) -> str:
        """Extract image URL from feed entry."""
        if "media_content" in entry and entry.media_content:
            return entry.media_content[0].get("url", "")
        elif "media_thumbnail" in entry and entry.media_thumbnail:
            return entry.media_thumbnail[0].get("url", "")
        elif "image" in entry:
            return entry.image.get("href", "")
        return ""
    
    @staticmethod
    def _extract_published_date(entry) -> str:
        """Extract published date from feed entry."""
        if hasattr(entry, "published"):
            return entry.published
        elif hasattr(entry, "published_parsed") and entry.published_parsed:
            return datetime(*entry.published_parsed[:6]).isoformat()
        return ""