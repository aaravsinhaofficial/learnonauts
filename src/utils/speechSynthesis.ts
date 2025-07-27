// Speech synthesis utility for neurodivergent-friendly features
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

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  setDefaultRate(rate: number) {
    this.defaultOptions.rate = rate;
  }

  async speak(text: string, options?: SpeechOptions): Promise<void> {
    if (!this.isEnabled || !('speechSynthesis' in window)) {
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply options
      const finalOptions = { ...this.defaultOptions, ...options };
      utterance.rate = finalOptions.rate || 1.0;
      utterance.pitch = finalOptions.pitch || 1.0;
      utterance.volume = finalOptions.volume || 0.8;
      utterance.lang = finalOptions.lang || 'en-US';

      if (finalOptions.voice) {
        utterance.voice = finalOptions.voice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);

      speechSynthesis.speak(utterance);
    });
  }

  pause() {
    if ('speechSynthesis' in window) {
      speechSynthesis.pause();
    }
  }

  resume() {
    if ('speechSynthesis' in window) {
      speechSynthesis.resume();
    }
  }

  cancel() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!('speechSynthesis' in window)) {
      return [];
    }
    return speechSynthesis.getVoices();
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
