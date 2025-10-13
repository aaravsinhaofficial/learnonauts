// Google Gemini AI service for Learnonaut
// This service handles communication with the Google Gemini API

// Backend proxy endpoint (do not expose keys in frontend)
const BACKEND_ENDPOINT = '/api/gemini';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeminiResponse {
  text: string;
  done: boolean;
  error?: string;
}

class GeminiAIService {
  private apiKey: string; // unused when backend proxy is configured
  private history: ChatMessage[] = [];

  constructor(apiKey: string = '') {
    this.apiKey = apiKey;
  }

  // Set or update the API key
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    console.log('Gemini API key updated');
  }

  // Clear conversation history
  clearHistory() {
    this.history = [];
    console.log('Conversation history cleared');
  }

  // Get the current conversation history
  getHistory(): ChatMessage[] {
    return [...this.history];
  }

  // Add a message to the history
  addToHistory(message: ChatMessage) {
    this.history.push(message);
  }

  // Send a message to Gemini and get a response
  async sendMessage(message: string): Promise<GeminiResponse> {
    try {
      // Add user message to history
      this.addToHistory({ role: 'user', content: message });

      // Prepare the request body
      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };

      // Try backend proxy first (recommended in production)
      try {
        const resp = await fetch(BACKEND_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, history: this.history })
        });
        if (resp.ok) {
          const data = await resp.json();
          const text = data?.text || '';
          const reply: GeminiResponse = { text, done: true };
          this.addToHistory({ role: 'assistant', content: text });
          return reply;
        }
      } catch (_) {
        // fall through to mock/local behaviour
      }

      /* Optional direct call (only for trusted environments). In production,
         use the backend proxy to avoid exposing API keys. Enable by setting
         an API key via setApiKey and uncommenting. 

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response from Gemini');
      }

      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Add assistant response to history
      this.addToHistory({ role: 'assistant', content: responseText });
      
      return {
        text: responseText,
        done: true
      };
      */

      // Mock fallback (offline/local)
      const mockResponse = this.getMockResponse(message);
      this.addToHistory({ role: 'assistant', content: mockResponse.text });
      return mockResponse;
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      return {
        text: '',
        done: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get a mock response for testing (remove this in production)
  private getMockResponse(message: string): GeminiResponse {
    // Simple mock response for testing
    const responses = [
      "I understand what you're asking about. Let me help with that.",
      "That's an interesting question! Here's what I know about it.",
      "I can help you learn more about this topic.",
      "Let me explain how this concept works in a way that's easy to understand.",
      "I'd be happy to guide you through this step by step."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      text: `${randomResponse} (This is a placeholder response. When the API key is configured, you'll get real responses from Google Gemini)`,
      done: true
    };
  }
}

// Export singleton instance
export const geminiAI = new GeminiAIService();
