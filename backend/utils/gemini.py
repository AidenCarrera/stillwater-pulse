"""
Utility function for summarizing text using Google Gemini API.
Designed for summarizing Instagram post descriptions and can be integrated
with chatbot functionality in the future.
"""

import os
import google.generativeai as genai
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def summarize_text(text: str, max_length: int = 150, temperature: float = 0.7) -> Optional[str]:
    """
    Summarize text using Google Gemini API.
    
    This function is designed to be reusable across different contexts:
    - Instagram post descriptions
    - Chatbot responses
    - General text summarization
    
    Args:
        text: The text to summarize
        max_length: Maximum length of the summary in characters (default: 150)
        temperature: Controls randomness in generation (0.0-1.0, default: 0.7)
    
    Returns:
        A summarized version of the text, or None if an error occurs
    
    Raises:
        ValueError: If GEMINI_API_KEY is not set in environment variables
        Exception: If the API call fails
    """
    # Get API key from environment
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY environment variable is not set. "
            "Please set it in your .env file in the backend directory."
        )
    
    # Configure the Gemini API
    genai.configure(api_key=api_key)
    
    # Initialize the model (using gemini-2.0-flash for reliable generation)
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    # Create a prompt for summarization
    prompt = f"""Summarize the following text in approximately {max_length} characters or less. 
Keep the summary concise, engaging, and preserve the key message and tone of the original text.
Focus on the main points and remove any unnecessary details.

Text to summarize:
{text}

Summary:"""
    
    try:
        # Configure generation parameters
        generation_config = {
            "temperature": temperature,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": max_length // 2,  # Rough token estimate (1 token ≈ 2 chars)
        }
        
        # Generate the summary
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        # Extract the summary text - handle potential response formats
        if hasattr(response, 'text') and response.text:
            summary = response.text.strip()
        elif hasattr(response, 'candidates') and response.candidates:
            # Alternative response format
            summary = response.candidates[0].content.parts[0].text.strip()
        else:
            raise Exception("Unexpected response format from Gemini API")
        
        # Ensure the summary doesn't exceed max_length
        if len(summary) > max_length:
            summary = summary[:max_length].rsplit(' ', 1)[0] + "..."
        
        return summary
    
    except Exception as e:
        # Log the error (in production, use proper logging)
        print(f"Error summarizing text with Gemini API: {str(e)}")
        raise Exception(f"Failed to generate summary: {str(e)}")


def summarize_instagram_post(description: str, max_length: int = 150) -> Optional[str]:
    """
    Summarize an Instagram post description using Google Gemini API.
    
    This is a convenience wrapper around summarize_text() specifically for Instagram posts.
    Designed for easy integration with existing post fetching logic.
    
    Args:
        description: The Instagram post description text to summarize
        max_length: Maximum length of the summary in characters (default: 150)
    
    Returns:
        A summarized version of the description, or None if an error occurs
    
    Raises:
        ValueError: If GEMINI_API_KEY is not set in environment variables
        Exception: If the API call fails
    """
    return summarize_text(description, max_length=max_length, temperature=0.7)

