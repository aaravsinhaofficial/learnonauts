// Speech Synthesis Browser Adapter
// This utility helps ensure speech synthesis works across different browsers

// Check and initialize speech synthesis
export function initSpeechSynthesis() {
  if (typeof window === 'undefined') return false;
  
  if (!('speechSynthesis' in window)) {
    console.warn('Speech Synthesis not supported in this browser');
    return false;
  }
  
  try {
    // Force Chrome and other browsers to initialize voices
    window.speechSynthesis.getVoices();
    
    // Safari requires an initial speak call (will be canceled immediately)
    const testUtterance = new SpeechSynthesisUtterance('');
    testUtterance.volume = 0; // Mute it
    testUtterance.rate = 0;  // Super slow (essentially silent)
    testUtterance.onend = () => {}; // Empty callback
    testUtterance.onerror = () => {}; // Empty error handler
    
    window.speechSynthesis.speak(testUtterance);
    window.speechSynthesis.cancel(); // Cancel immediately
    
    return true;
  } catch (e) {
    console.error('Failed to initialize speech synthesis:', e);
    return false;
  }
}

// Get all available voices with a retry mechanism
export function getVoicesWithRetry(maxRetries = 3, interval = 500): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    let retries = 0;
    let voices = window.speechSynthesis?.getVoices() || [];
    
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    
    const checkVoices = () => {
      voices = window.speechSynthesis?.getVoices() || [];
      
      if (voices.length > 0) {
        resolve(voices);
        return;
      }
      
      retries++;
      if (retries < maxRetries) {
        setTimeout(checkVoices, interval);
      } else {
        console.warn('Failed to load voices after multiple attempts');
        resolve([]);
      }
    };
    
    // Start checking for voices
    setTimeout(checkVoices, interval);
    
    // Also set up the onvoiceschanged event
    if (window.speechSynthesis?.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };
    }
  });
}

// Workaround for Chrome's timeout bug
export function speakWithChromeWorkaround(utterance: SpeechSynthesisUtterance): Promise<void> {
  return new Promise((resolve, reject) => {
    // Store original callbacks
    const originalOnEnd = utterance.onend;
    const originalOnError = utterance.onerror;
    
    // Set up our callbacks
    utterance.onend = (event) => {
      if (originalOnEnd) originalOnEnd.call(utterance, event);
      resolve();
    };
    
    utterance.onerror = (event) => {
      if (originalOnError) originalOnError.call(utterance, event);
      reject(event.error);
    };
    
    // Chrome bug workaround: restart synthesis every 15 seconds
    const restartSpeechTimeout = 15000; // 15 seconds
    let timer: number | null = null;
    
    const restartSpeech = () => {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
      timer = window.setTimeout(restartSpeech, restartSpeechTimeout);
    };
    
    // Set up the timer
    timer = window.setTimeout(restartSpeech, restartSpeechTimeout);
    
    // Clean up the timer when done
    const cleanUp = () => {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    };
    
    utterance.onend = (event) => {
      cleanUp();
      if (originalOnEnd) originalOnEnd.call(utterance, event);
      resolve();
    };
    
    utterance.onerror = (event) => {
      cleanUp();
      if (originalOnError) originalOnError.call(utterance, event);
      reject(event.error);
    };
    
    // Start speaking
    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      cleanUp();
      reject(e);
    }
  });
}
