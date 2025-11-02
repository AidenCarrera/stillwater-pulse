"""
Router for text-to-speech endpoints.
"""

import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.schemas import TTSRequest, VoicesResponse
from services.tts_service import TTSService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tts", tags=["tts"])


@router.post("")
async def text_to_speech(request: TTSRequest):
    """
    Convert text to speech using ElevenLabs.
    
    Args:
        request: TTSRequest with text and optional voice_id
        
    Returns:
        Audio stream (MP3)
        
    Raises:
        HTTPException: 500 if TTS generation fails
    """
    try:
        # Initialize TTS service
        tts = TTSService()
        
        # Generate audio
        audio_bytes = tts.generate_speech(
            text=request.text,
            voice_id=request.voice_id
        )
        
        # Return streaming response
        return StreamingResponse(
            audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3",
                "Cache-Control": "no-cache"
            }
        )
        
    except ValueError as e:
        # Configuration error
        logger.error(f"ValueError in TTS endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Configuration error: {str(e)}"
        )
        
    except Exception as e:
        # Any other error
        logger.error(f"Exception in TTS endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error generating speech: {str(e)}"
        )


@router.get("/voices", response_model=VoicesResponse)
async def get_voices():
    """
    Get available ElevenLabs voices.
    
    Returns:
        VoicesResponse with list of available voices
        
    Raises:
        HTTPException: 500 if fetching voices fails
    """
    try:
        tts = TTSService()
        voices = tts.get_available_voices()
        return VoicesResponse(voices=voices)
        
    except Exception as e:
        logger.error(f"Error fetching voices: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching voices: {str(e)}"
        )