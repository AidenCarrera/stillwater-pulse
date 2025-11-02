"""
Pydantic models for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional


class PostResponse(BaseModel):
    """Response model for a single Instagram post."""
    title: str
    link: str
    image: str
    published: str


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str = Field(..., min_length=1, description="User's message")
    posts: List[Dict] = Field(default=[], description="Recent posts for context")


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    response: str = Field(..., description="AI assistant's response")


class TTSRequest(BaseModel):
    """Request model for text-to-speech endpoint."""
    text: str = Field(..., min_length=1, description="Text to convert to speech")
    voice_id: str = Field(default="21m00Tcm4TlvDq8ikWAM", description="ElevenLabs voice ID")


class VoiceInfo(BaseModel):
    """Information about an available voice."""
    voice_id: str
    name: str
    category: Optional[str] = None


class VoicesResponse(BaseModel):
    """Response model for available voices."""
    voices: List[VoiceInfo]


class HealthResponse(BaseModel):
    """Response model for health check."""
    message: str
    status: str
    version: Optional[str] = None