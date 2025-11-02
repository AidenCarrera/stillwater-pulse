import { useEffect } from 'react';

/**
 * Custom hook to load and manage Instagram embed script
 * Prevents duplicate script loading and handles embed processing
 */
export function useInstagramEmbed(dependencies: any[] = []) {
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://www.instagram.com/embed.js"]');
    
    if (!existingScript) {
      // Create and load script only if it doesn't exist
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      };
    } else {
      // Script already exists, just process embeds
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    }
  }, dependencies);
}

// Extend Window interface for Instagram embed
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}