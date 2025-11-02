"""
Router for Instagram posts endpoints.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List
from models.schemas import PostResponse
from services.rss_service import RSSService

router = APIRouter(prefix="", tags=["posts"])


@router.get("/accounts", response_model=List[str])
async def get_accounts():
    """
    Get list of all available Instagram account usernames.
    
    Returns:
        List of account names
    """
    return RSSService.get_account_names()


@router.get("/posts", response_model=List[PostResponse])
async def get_posts(
    username: str = Query(..., description="Instagram username")
):
    """
    Fetch latest posts from a specific Instagram account.
    
    Args:
        username: Instagram account username
        
    Returns:
        List of recent posts (title, link, image, published date)
        
    Raises:
        HTTPException: 404 if username not found, 500 if fetch fails
    """
    try:
        posts = RSSService.fetch_posts(username)
        return posts
        
    except ValueError as e:
        # Username not found
        raise HTTPException(status_code=404, detail=str(e))
        
    except Exception as e:
        # RSS feed fetch error
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching RSS feed: {str(e)}"
        )