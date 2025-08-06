// filepath: /Users/aaravsinha/learnonaut/src/components/AccessibilityDemo.tsx
import { motion } from 'framer-motion';
import type { AccessibilitySettings } from './AccessibilityPanel';
import { useAccessibilityAwareError } from './AccessibilityAwareError';
import { speechManager } from '../utils/speechSynthesis';

interface AccessibilityDemoProps {
  settings: AccessibilitySettings;
}

export function AccessibilityDemo({ settings }: AccessibilityDemoProps) {
  const { error, showError, clearError } = useAccessibilityAwareError();

  const handleDemoError = () => {
    const messages: Record<string, string> = {
      standard: "This is a standard error message for testing.",
      gentle: "Don't worry! This is just a gentle test message to show how errors can be more comforting.",
      encouraging: "Great job testing! This encouraging error shows how we can make mistakes feel less scary."
    };
    showError(messages[settings.errorHandling]);
  };

  const handleDemoSpeech = () => {
    if (settings.speechEnabled) {
      speechManager.speakInstruction("Welcome to the neurodivergent-friendly Learnonauts platform! This demo shows how all accessibility features work together.");
    } else {
      alert("Speech is currently disabled. Enable it in the Accessibility Panel under the Audio tab to hear this message.");
    }
  };

  const testSpeechSynthesis = () => {
    if (!settings.speechEnabled) {
      alert("Speech is disabled. Enable it in the Accessibility Panel under the Audio tab to test speech synthesis.");
      return;
    }
    
    // First check if speech synthesis is available
    if (!window.speechSynthesis) {
      alert("Your browser doesn't support speech synthesis. Please try a different browser.");
      return;
    }
    
    // Test with different options to help diagnose issues
    try {
      console.log("Testing speech synthesis with settings:", {
        speed: settings.speechSpeed,
        volume: settings.speechVolume
      });
      
      speechManager.speak(
        "This is a test of speech synthesis at speed " + settings.speechSpeed + 
        " and volume " + settings.speechVolume + 
        ". If you can hear this, speech synthesis is working correctly.",
        {
          rate: settings.speechSpeed,
          volume: settings.speechVolume,
          pitch: 1.0
        }
      ).catch((error: Error) => {
        console.error("Speech synthesis error:", error);
        alert("Speech synthesis failed. See console for error details.");
      });
    } catch (error: unknown) {
      console.error("Speech synthesis exception:", error);
      alert("Failed to initialize speech synthesis. See console for details.");
    }
  };

  const handleDemoBreak = () => {
    if (settings.speechEnabled) {
      speechManager.speakBreakReminder();
    } else {
      alert("Speech is disabled. Enable it in the Accessibility Panel under the Audio tab.");
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Quick Tour Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: '#f0f9ff',
          border: '2px solid #0ea5e9',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          color: '#0c4a6e',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          🚀 Quick Tour: How to Use Accessibility Features
        </h2>
        
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleDemoSpeech}
            style={{
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginRight: '10px'
            }}
          >
            🔊 Hear Tour Guide
          </button>
          
          <button
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={testSpeechSynthesis}
          >
            🎤 Test Speech Synthesis
          </button>
        </div>
      </motion.div>
      
      {/* Test Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          color: '#0c4a6e', 
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          🧪 Test Accessibility Features
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem' 
        }}>
          <div style={{ 
            backgroundColor: '#f9fafb', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#0369a1', 
              marginBottom: '0.75rem' 
            }}>
              🗣️ Speech Features
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Test different speech styles and encouragement modes.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  onClick={handleDemoSpeech}
                  style={{
                    backgroundColor: '#e0f2fe',
                    color: '#0c4a6e',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Hear Instructions
                </button>
                
                <button 
                  onClick={() => settings.speechEnabled && speechManager.speakEncouragement()}
                  style={{
                    backgroundColor: '#f0fdf4',
                    color: '#166534',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Hear Encouragement
                </button>
                
                <button 
                  onClick={handleDemoBreak}
                  style={{
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Hear Break Reminder
                </button>
              </div>
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: '#f9fafb', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#4f46e5', 
              marginBottom: '0.75rem' 
            }}>
              ⚠️ Error Handling
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Experience how we make errors less stressful.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  onClick={handleDemoError}
                  style={{
                    backgroundColor: '#ede9fe',
                    color: '#5b21b6',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Show Sample Error
                </button>
              </div>
            </div>
            
            {error && (
              <div style={{
                backgroundColor: settings.errorHandling === 'standard' ? '#fee2e2' : 
                                settings.errorHandling === 'gentle' ? '#e0f2fe' : '#f0fdf4',
                color: settings.errorHandling === 'standard' ? '#b91c1c' : 
                      settings.errorHandling === 'gentle' ? '#0c4a6e' : '#166534',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                marginTop: '0.5rem',
                fontSize: '0.875rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    {settings.errorHandling === 'standard' && <span>❌ </span>}
                    {settings.errorHandling === 'gentle' && <span>ℹ️ </span>}
                    {settings.errorHandling === 'encouraging' && <span>💡 </span>}
                    {error && error.message ? error.message : String(error)}
                  </div>
                  <button 
                    onClick={clearError}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: '0.25rem'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Current Settings Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          backgroundColor: '#f8fafc', 
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          color: '#0c4a6e', 
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          🔍 Your Current Settings
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '1rem' 
        }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0369a1', marginBottom: '0.5rem' }}>
              Visual
            </h3>
            <ul style={{ fontSize: '0.875rem', color: '#6b7280', paddingLeft: '1.5rem' }}>
              <li>Theme: {settings.colorTheme}</li>
              <li>Font Size: {settings.fontSize}</li>
              <li>Reduced Motion: {settings.reducedMotion ? 'On' : 'Off'}</li>
              <li>Dark Mode: {settings.darkMode ? 'On' : 'Off'}</li>
            </ul>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0369a1', marginBottom: '0.5rem' }}>
              Audio
            </h3>
            <ul style={{ fontSize: '0.875rem', color: '#6b7280', paddingLeft: '1.5rem' }}>
              <li>Speech: {settings.speechEnabled ? 'Enabled' : 'Disabled'}</li>
              <li>Speech Speed: {settings.speechSpeed}</li>
              <li>Speech Volume: {settings.speechVolume}</li>
              <li>Sound Effects: {settings.soundEnabled ? 'Enabled' : 'Disabled'}</li>
            </ul>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0369a1', marginBottom: '0.5rem' }}>
              Interaction
            </h3>
            <ul style={{ fontSize: '0.875rem', color: '#6b7280', paddingLeft: '1.5rem' }}>
              <li>Break Reminders: {settings.breakReminders ? 'On' : 'Off'}</li>
              <li>Error Style: {settings.errorHandling}</li>
              <li>Focus Timer: {settings.visibleTimers ? 'Visible' : 'Hidden'}</li>
              <li>Sensory Breaks: {settings.sensoryBreaks ? 'Enabled' : 'Disabled'}</li>
            </ul>
          </div>
        </div>
      </motion.div>
      
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => {
            console.log('Opening accessibility panel');
            // This would normally trigger the panel to open
            alert('Click the gear ⚙️ icon in the top-right corner to open the Accessibility Panel and customize your settings');
          }}
          style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          ⚙️ Open Accessibility Settings Panel
        </button>
      </div>
    </div>
  );
}
