// filepath: /Users/aaravsinha/learnonaut/src/utils/speechSynthesis.ts
// Speech synthesis utility for neurodivergent-friendly features
import { initSpeechSynthesis, getVoicesWithRetry } from './speechAdapter';

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
  lang?: string;
}

class SpeechManager {
  private isEnabled: boolean = true;
  private defaultOptions: SpeechOptions = {
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
    lang: 'en-US'
  };
  private pendingSpeech: string | null = null;
  private isSpeaking: boolean = false;

  constructor() {
    // Initialize speech synthesis when the manager is created
    if (typeof window !== 'undefined') {
      // Initialize speech synthesis with our adapter
      initSpeechSynthesis();
      
      // Load voices with retry mechanism
      getVoicesWithRetry().then(voices => {
        if (voices.length > 0 && this.pendingSpeech) {
          const textToSpeak = this.pendingSpeech;
          this.pendingSpeech = null;
          this.speak(textToSpeak).catch(err => console.error('Failed to speak pending text:', err));
        }
      });
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    console.log(`Speech synthesis ${enabled ? 'enabled' : 'disabled'}`);
  }

  setDefaultRate(rate: number) {
    this.defaultOptions.rate = rate;
    console.log(`Speech rate set to ${rate}`);
  }
  
  setDefaultVolume(volume: number) {
    this.defaultOptions.volume = volume;
    console.log(`Speech volume set to ${volume}`);
  }

  async speak(text: string, options?: SpeechOptions): Promise<void> {
    if (!this.isEnabled) {
      console.log('Speech is disabled, not speaking');
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    console.log(`Speaking text: "${text}"`);

    // Cancel any ongoing speech
    this.cancel();

    // Store as pending in case voices aren't loaded yet
    this.pendingSpeech = text;
    this.isSpeaking = true;

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply options
        const finalOptions = { ...this.defaultOptions, ...options };
        utterance.rate = finalOptions.rate || 1.0;
        utterance.pitch = finalOptions.pitch || 1.0;
        utterance.volume = finalOptions.volume || 0.8;
        utterance.lang = finalOptions.lang || 'en-US';

        // Get available voices
        const voices = window.speechSynthesis.getVoices();
        console.log(`Available voices: ${voices.length}`);
        
        if (finalOptions.voice) {
          utterance.voice = finalOptions.voice;
        } else if (voices.length > 0) {
          // Use default voice if available
          const defaultVoice = voices.find((voice) => voice.default) || voices[0];
          utterance.voice = defaultVoice;
        }

        utterance.onend = () => {
          this.isSpeaking = false;
          this.pendingSpeech = null;
          console.log('Speech ended successfully');
          resolve();
        };
        
        utterance.onerror = (event) => {
          this.isSpeaking = false;
          console.error('Speech synthesis error:', event);
          reject(event.error);
        };

        // Reset speech synthesis if it gets stuck
        setTimeout(() => {
          if (this.isSpeaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10000);

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        this.isSpeaking = false;
        console.error('Failed to initialize speech:', error);
        reject(error);
      }
    });
  }

  pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  cancel() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return [];
    }
    
    // Some browsers (like Chrome) need time to load voices
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length === 0) {
      // Try to force load voices again
      window.speechSynthesis.cancel();
    }
    
    return voices;
  }

  // Neurodivergent-friendly preset messages
  async speakInstruction(instruction: string): Promise<void> {
    await this.speak(`Here's what to do: ${instruction}`, {
      rate: this.defaultOptions.rate || 0.9,
      pitch: 1.1
    });
  }

  async speakEncouragement(message: string = "Great job! Keep going!"): Promise<void> {
    await this.speak(message, {
      rate: this.defaultOptions.rate || 1.0,
      pitch: 1.2,
      volume: 0.7
    });
  }

  async speakError(error: string, style: 'standard' | 'gentle' | 'encouraging' = 'standard'): Promise<void> {
    let prefix = "";
    let options: SpeechOptions = {};

    switch (style) {
      case 'gentle':
        prefix = "It's okay, let's try a different approach. ";
        options = { rate: 0.8, pitch: 0.9 };
        break;
      case 'encouraging':
        prefix = "That's a great attempt! Here's a hint: ";
        options = { rate: 0.9, pitch: 1.1 };
        break;
      default:
        prefix = "Error: ";
        options = { rate: 1.0, pitch: 1.0 };
    }

    await this.speak(prefix + error, options);
  }

  async speakBreakReminder(): Promise<void> {
    await this.speak("It's time for a break! Taking breaks helps your brain process information better.", {
      rate: 0.8,
      pitch: 1.0,
      volume: 0.6
    });
  }

  async speakFocusComplete(sessionType: string): Promise<void> {
    const messages = {
      focus: "Focus session complete! Great concentration!",
      break: "Break time is over. Ready to focus again?",
      longBreak: "Long break complete! You're refreshed and ready to learn!"
    };

    await this.speak(messages[sessionType as keyof typeof messages] || messages.focus, {
      rate: 0.9,
      pitch: 1.2
    });
  }

  async speakProgress(progress: number, total: number): Promise<void> {
    const percentage = Math.round((progress / total) * 100);
    await this.speak(`You're ${percentage}% complete. Keep up the excellent work!`, {
      rate: 0.9,
      pitch: 1.1
    });
  }
}

// Export singleton instance
export const speechManager = new SpeechManager();

// Convenience functions
export const speak = (text: string, options?: SpeechOptions) => speechManager.speak(text, options);
export const speakInstruction = (instruction: string) => speechManager.speakInstruction(instruction);
export const speakEncouragement = (message?: string) => speechManager.speakEncouragement(message);
export const speakError = (error: string, style?: 'standard' | 'gentle' | 'encouraging') => speechManager.speakError(error, style);
export const speakBreakReminder = () => speechManager.speakBreakReminder();
export const speakFocusComplete = (sessionType: string) => speechManager.speakFocusComplete(sessionType);
export const speakProgress = (progress: number, total: number) => speechManager.speakProgress(progress, total);

// Add new exports for learning pattern speech functions
export const speakVisualConcept = (concept: string) => speechManager.speakVisualConcept(concept);
export const speakAuditoryExplanation = (explanation: string) => speechManager.speakAuditoryExplanation(explanation);
export const speakKinestheticPrompt = (action: string) => speechManager.speakKinestheticPrompt(action);
export const speakInformationChunk = (chunk: string, chunkNumber: number, totalChunks: number) => 
  speechManager.speakInformationChunk(chunk, chunkNumber, totalChunks);
export const speakConceptRelationship = (concept1: string, relationship: string, concept2: string) => 
  speechManager.speakConceptRelationship(concept1, relationship, concept2);
