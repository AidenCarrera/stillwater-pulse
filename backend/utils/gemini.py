"""
Utility function for summarizing text using Google Gemini API.
Specifically designed for summarizing Instagram post descriptions.
"""

import os
import google.generativeai as genai
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def summarize_instagram_post(description: str, max_length: int = 150) -> Optional[str]:
    """
    Summarize an Instagram post description using Google Gemini API.
    
    Args:
        description: The Instagram post description text to summarize
        max_length: Maximum length of the summary in characters (default: 150)
    
    Returns:
        A summarized version of the description, or None if an error occurs
    
    Raises:
        ValueError: If GEMINI_API_KEY is not set in environment variables
        Exception: If the API call fails
    """
    # Get API key from environment
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY environment variable is not set. "
            "Please set it in your .env file."
        )
    
    # Configure the Gemini API
    genai.configure(api_key=api_key)
    
    # Initialize the model (using gemini-2.0-flash for reliable generation)
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    # Create a prompt for summarization
    prompt = f"""Summarize the following Instagram post description in approximately {max_length} characters or less. 
Keep the summary concise, engaging, and preserve the key message and tone of the original post.
Focus on the main points and remove any unnecessary details.

Post description:
{description}

Summary:"""
    
    try:
        # Configure generation parameters for better summary length control
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": max_length // 2,  # Rough token estimate (1 token ≈ 2 chars)
        }
        
        # Generate the summary
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        # Extract the summary text
        summary = response.text.strip()
        
        # Ensure the summary doesn't exceed max_length
        if len(summary) > max_length:
            summary = summary[:max_length].rsplit(' ', 1)[0] + "..."
        
        return summary
    
    except Exception as e:
        # Log the error (in production, use proper logging)
        print(f"Error summarizing text with Gemini API: {str(e)}")
        raise Exception(f"Failed to generate summary: {str(e)}")

