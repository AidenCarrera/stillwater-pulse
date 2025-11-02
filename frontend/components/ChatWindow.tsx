'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Sparkles, Volume2, VolumeX, Loader2, Mic } from 'lucide-react';
import type { Post } from '@/lib/rss';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  posts?: Post[];
}

interface Voice {
  voice_id: string;
  name: string;
  category: string | null;
}

/**
 * Convert basic markdown formatting to React elements
 * Currently supports: **bold** and *italic*
 */
function renderMarkdown(text: string): JSX.Element {
  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, lineIndex) => {
        const parts: (string | JSX.Element)[] = [];
        let lastIndex = 0;
        let key = 0;

        const boldRegex = /\*\*(.+?)\*\*/g;
        const italicRegex = /\*(.+?)\*/g;

        let match;
        const matches: Array<{ start: number; end: number; type: 'bold' | 'italic'; text: string }> = [];

        while ((match = boldRegex.exec(line)) !== null) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            type: 'bold',
            text: match[1].trim() 
          });
        }

        while ((match = italicRegex.exec(line)) !== null) {
          const isInBold = matches.some(m =>
            match!.index >= m.start && match!.index < m.end
          );
          if (!isInBold) {
            matches.push({
              start: match.index,
              end: match.index + match[0].length,
              type: 'italic',
              text: match[1].trim()
            });
          }
        }

        matches.sort((a, b) => a.start - b.start);

        if (matches.length === 0) {
          parts.push(line);
        } else {
          for (const m of matches) {
            if (m.start > lastIndex) {
              parts.push(line.substring(lastIndex, m.start));
            }
            if (m.type === 'bold') {
              parts.push(<strong key={key++}>{m.text}</strong>);
            } else {
              parts.push(<em key={key++}>{m.text}</em>);
            }
            lastIndex = m.end;
          }

          if (lastIndex < line.length) {
            parts.push(line.substring(lastIndex));
          }
        }

        return (
          <span key={lineIndex}>
            {parts}
            {lineIndex < lines.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

export default function ChatWindow({ posts = [] }: ChatWindowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  
  // Voice selection state
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("nPczCjzI2devNBz1zQrb"); // Brian voice default
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const suggestedPrompts = [
    "What events are happening this week?",
    "Show me recent food and restaurant posts",
    "Any OSU game day updates?",
    "What's new in downtown Stillwater?",
    "Tell me about local business announcements"
  ];

  // Fetch available voices on mount
  useEffect(() => {
    const fetchVoices = async () => {
      setLoadingVoices(true);
      try {
        const API_URL = 'http://127.0.0.1:8000';
        const response = await fetch(`${API_URL}/tts/voices`);
        
        if (response.ok) {
          const data = await response.json();
           console.log('All available voices:', data.voices);
          // ADD FILTERING HERE - Define which voices to show
          const allowedVoices = [
            "nPczCjzI2devNBz1zQrb", // Brian
            "XrExE9yKIg1WjnnlVkGX", // Matilda
            "ruirxsoakN0GWmGNIo04", // John Morgan
            "2tTjAGX0n5ajDmazDcWk", // Ezekiel
            "1BfrkuYXmEwp8AWqSLWk"  // Declan
            // Add more voice IDs here
          ];

          // Filter to only allowed voices
          const filteredVoices = data.voices.filter((voice: Voice) => 
            allowedVoices.includes(voice.voice_id)
          );
          
          setVoices(filteredVoices); // Use filtered instead of data.voices
        }
      } catch (error) {
        console.error('Error fetching voices:', error);
      } finally {
        setLoadingVoices(false);
      }
    };

    fetchVoices();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const API_URL = 'http://127.0.0.1:8000';
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          posts: posts
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the AI. Please make sure the backend is running.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (messageId: string, text: string) => {
    if (playingMessageId === messageId) {
      stopAudio();
      return;
    }

    stopAudio();
    setLoadingAudioId(messageId);

    try {
      const API_URL = 'http://127.0.0.1:8000';
      const response = await fetch(`${API_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text,
          voice_id: selectedVoice // Use selected voice
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setPlayingMessageId(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        console.error('Error playing audio');
        setPlayingMessageId(null);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
      setPlayingMessageId(messageId);
      
    } catch (error) {
      console.error('Error playing audio:', error);
      alert('Failed to generate audio. Make sure the backend is running and ELEVENLABS_API_KEY is set.');
    } finally {
      setLoadingAudioId(null);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingMessageId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const getSelectedVoiceName = () => {
    const voice = voices.find(v => v.voice_id === selectedVoice);
    return voice ? voice.name : 'Select Voice';
  };

  return (
    <>
      {/* Floating toggle button when chat is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 z-50 flex items-center gap-2"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-sm font-medium pr-1">Ask AI</span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200 animate-slide-in-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <h2 className="font-semibold text-lg">Stillwater AI</h2>
                <p className="text-xs text-primary-100">Ask about local posts</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-700 rounded-full p-1 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Voice selector bar */}
          <div className="bg-white border-b border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Voice:</span>
              <div className="relative flex-1">
                <button
                  onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                  disabled={loadingVoices || voices.length === 0}
                  className="w-full text-left px-3 py-1.5 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingVoices ? 'Loading voices...' : getSelectedVoiceName()}
                </button>
                
                {/* Dropdown menu */}
                {showVoiceSelector && voices.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
                    {voices.map((voice) => (
                      <button
                        key={voice.voice_id}
                        onClick={() => {
                          setSelectedVoice(voice.voice_id);
                          setShowVoiceSelector(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-primary-50 transition-colors ${
                          selectedVoice === voice.voice_id ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{voice.name}</span>
                          {voice.category && (
                            <span className="text-xs text-gray-500">{voice.category}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <Sparkles className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Ask me anything!
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  I can help you discover what's happening in Stillwater based on recent Instagram posts.
                </p>
                
                {/* Suggested prompts */}
                <div className="w-full space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Try asking:
                  </p>
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="w-full text-left p-3 bg-white hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-lg text-sm text-gray-700 transition-all duration-200 hover:shadow-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          {message.role === 'assistant' ? (
                            <div className="text-sm whitespace-pre-wrap">
                              {renderMarkdown(message.content)}
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                        
                        {/* Audio button for assistant messages */}
                        {message.role === 'assistant' && (
                          <button
                            onClick={() => handlePlayAudio(message.id, message.content)}
                            disabled={loadingAudioId === message.id}
                            className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
                              playingMessageId === message.id
                                ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                            aria-label={playingMessageId === message.id ? 'Stop audio' : 'Play audio'}
                            title={playingMessageId === message.id ? 'Stop audio' : 'Play audio'}
                          >
                            {loadingAudioId === message.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : playingMessageId === message.id ? (
                              <VolumeX className="w-4 h-4" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                      
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about Stillwater posts..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-colors flex items-center justify-center"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}