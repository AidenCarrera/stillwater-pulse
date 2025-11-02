"""
Service for text-to-speech using ElevenLabs.
"""

import re
import io
from elevenlabs import ElevenLabs
from typing import Optional, List, Dict, BinaryIO
from config.settings import settings


class TTSService:
    """Service for handling text-to-speech operations."""
    
    _instance: Optional['TTSService'] = None
    _client = None
    
    def __new__(cls):
        """Singleton pattern to reuse client instance."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize ElevenLabs client (only once)."""
        if self._client is None:
            settings.validate()
            self._client = ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)
    
    @staticmethod
    def strip_markdown(text: str) -> str:
        """
        Remove markdown formatting for cleaner TTS output.
        
        Args:
            text: Text with markdown formatting
            
        Returns:
            Clean text without markdown
        """
        # Remove bold (**text** or __text__)
        text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
        text = re.sub(r'__(.+?)__', r'\1', text)
        
        # Remove italic (*text* or _text_)
        text = re.sub(r'\*(.+?)\*', r'\1', text)
        text = re.sub(r'_(.+?)_', r'\1', text)
        
        # Remove links [text](url)
        text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
        
        # Remove headers (# text)
        text = re.sub(r'#+\s+', '', text)
        
        return text
    
    def generate_speech(
        self, 
        text: str, 
        voice_id: str = None
    ) -> BinaryIO:
        """
        Convert text to speech audio.
        
        Args:
            text: Text to convert
            voice_id: ElevenLabs voice ID (optional)
            
        Returns:
            Binary audio stream (MP3)
            
        Raises:
            Exception: If TTS generation fails
        """
        if voice_id is None:
            voice_id = settings.DEFAULT_VOICE_ID
        
        # Clean text for TTS
        clean_text = self.strip_markdown(text)
        
        try:
            # Generate audio
            audio_generator = self._client.text_to_speech.convert(
                voice_id=voice_id,
                text=clean_text,
                model_id=settings.TTS_MODEL,
                output_format=settings.TTS_OUTPUT_FORMAT
            )
            
            # Collect chunks into bytes
            audio_bytes = io.BytesIO()
            for chunk in audio_generator:
                if chunk:
                    audio_bytes.write(chunk)
            
            audio_bytes.seek(0)
            return audio_bytes
            
        except Exception as e:
            raise Exception(f"Error generating speech: {str(e)}")
    
    def get_available_voices(self) -> List[Dict[str, str]]:
        """
        Get list of available ElevenLabs voices.
        
        Returns:
            List of voice dictionaries with id, name, and category
            
        Raises:
            Exception: If fetching voices fails
        """
        try:
            voices = self._client.voices.get_all()
            
            return [
                {
                    "voice_id": voice.voice_id,
                    "name": voice.name,
                    "category": voice.category if hasattr(voice, 'category') else None
                }
                for voice in voices.voices
            ]
            
        except Exception as e:
            raise Exception(f"Error fetching voices: {str(e)}")