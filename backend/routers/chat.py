"""
Router for AI chat endpoint.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.gemini_service import GeminiService
import traceback

router = APIRouter(prefix="", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with AI about Stillwater Instagram posts.
    
    Args:
        request: ChatRequest with user message and optional posts context
        
    Returns:
        ChatResponse with AI-generated response
        
    Raises:
        HTTPException: 500 if AI generation fails
    """
    try:
        # Initialize Gemini service
        gemini = GeminiService()
        
        # Generate response
        response_text = gemini.generate_response(
            message=request.message,
            posts=request.posts
        )
        
        return ChatResponse(response=response_text)
        
    except ValueError as e:
        # Configuration error (missing API key, etc.)
        print(f"ValueError in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Configuration error: {str(e)}"
        )
        
    except Exception as e:
        # Any other error
        print(f"Exception in chat endpoint: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error generating chat response: {str(e)}"
        )