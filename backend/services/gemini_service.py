"""
Service for Gemini AI chat functionality.
"""

import google.generativeai as genai
from typing import List, Dict, Optional
from config.settings import settings


class GeminiService:
    """Service for handling Gemini AI operations."""
    
    _instance: Optional['GeminiService'] = None
    _model = None
    
    def __new__(cls):
        """Singleton pattern to reuse model instance."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize Gemini model (only once)."""
        if self._model is None:
            settings.validate()
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._model = genai.GenerativeModel(settings.GEMINI_MODEL)
    
    @staticmethod
    def build_posts_context(posts: List[Dict]) -> str:
        """
        Build context string from posts data.
        
        Args:
            posts: List of post dictionaries
            
        Returns:
            Formatted context string for the AI
        """
        if not posts:
            return ""
        
        context = "\n\nRecent Stillwater Instagram posts:\n"
        max_posts = settings.MAX_POSTS_FOR_CONTEXT
        
        for i, post in enumerate(posts[:max_posts], 1):
            title = post.get('title', 'Untitled')
            account = post.get('account', 'Unknown')
            snippet = post.get('contentSnippet', title)
            context += f"{i}. From @{account}: {title}\n   {snippet}\n"
        
        return context
    
    @staticmethod
    def build_prompt(user_message: str, posts_context: str) -> str:
        """
        Build complete prompt for Gemini.
        
        Args:
            user_message: User's question
            posts_context: Context from recent posts
            
        Returns:
            Complete prompt string
        """
        return f"""{settings.SYSTEM_PROMPT}

{posts_context}

User question: {user_message}

Please provide a helpful response based on the available information. If the information isn't in the recent posts, let the user know and offer general suggestions about how they might find what they're looking for."""
    
    def generate_response(self, message: str, posts: List[Dict] = None) -> str:
        """
        Generate AI response to user message.
        
        Args:
            message: User's message
            posts: Optional list of posts for context
            
        Returns:
            AI-generated response string
            
        Raises:
            Exception: If generation fails
        """
        if posts is None:
            posts = []
        
        # Build context and prompt
        posts_context = self.build_posts_context(posts)
        full_prompt = self.build_prompt(message, posts_context)
        
        # Configure generation parameters
        generation_config = {
            "temperature": settings.GEMINI_TEMPERATURE,
            "top_p": settings.GEMINI_TOP_P,
            "top_k": settings.GEMINI_TOP_K,
            "max_output_tokens": settings.GEMINI_MAX_TOKENS,
        }
        
        # Generate response
        response = self._model.generate_content(
            full_prompt,
            generation_config=generation_config
        )
        
        # Extract and return text
        return self._extract_response_text(response)
    
    @staticmethod
    def _extract_response_text(response) -> str:
        """
        Extract text from Gemini response object.
        
        Args:
            response: Gemini API response
            
        Returns:
            Extracted text string
            
        Raises:
            Exception: If response format is unexpected
        """
        if hasattr(response, 'text') and response.text:
            return response.text.strip()
        elif hasattr(response, 'candidates') and response.candidates:
            return response.candidates[0].content.parts[0].text.strip()
        else:
            raise Exception("Unexpected response format from Gemini API")