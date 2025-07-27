import { motion } from 'framer-motion';
import type { AccessibilitySettings } from './AccessibilityPanel';
import { AccessibilityAwareError, useAccessibilityAwareError } from './AccessibilityAwareError';
import { speechManager } from '../utils/speechSynthesis';

interface AccessibilityDemoProps {
  settings: AccessibilitySettings;
}

export function AccessibilityDemo({ settings }: AccessibilityDemoProps) {
  const { error, showError, clearError } = useAccessibilityAwareError();

  const handleDemoError = () => {
    const messages = {
      standard: "This is a standard error message for testing.",
      gentle: "Don't worry! This is just a gentle test message to show how errors can be more comforting.",
      encouraging: "Great job testing! This encouraging error shows how we can make mistakes feel less scary."
    };
    showError(messages[settings.errorHandling]);
  };

  const handleDemoSpeech = () => {
    if (settings.soundEnabled) {
      speechManager.speakInstruction("Welcome to the neurodivergent-friendly Learnonauts platform! This demo shows how all accessibility features work together.");
    }
  };

  const handleDemoBreak = () => {
    if (settings.soundEnabled) {
      speechManager.speakBreakReminder();
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
        
        <div style={{ 
          display: 'grid', 
          gap: '1rem', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          marginBottom: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #bae6fd'
          }}>
            <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
              🔧 Step 1: Open Settings
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#3730a3', margin: 0 }}>
              Look for the 🔧 button in the top-right corner of any page and click it to open the accessibility panel with 5 tabs of customization options.
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #bae6fd'
          }}>
            <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
              🎨 Step 2: Customize Visual
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#3730a3', margin: 0 }}>
              Try different color themes, font sizes, and visual settings to make the content easier to read and more comfortable for your eyes.
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #bae6fd'
          }}>
            <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
              🔊 Step 3: Try Audio
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#3730a3', margin: 0 }}>
              Enable sound and adjust speech speed to hear instructions and feedback. Perfect for auditory learners!
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #bae6fd'
          }}>
            <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
              📖 Step 4: Reading Help
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#3730a3', margin: 0 }}>
              Turn on reading guides, adjust letter spacing, and try color overlays to reduce visual stress while reading.
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #bae6fd'
          }}>
            <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
              🧠 Step 5: Focus Support
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#3730a3', margin: 0 }}>
              Enable break reminders, simplified UI, and timers to help with attention and concentration.
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #bae6fd'
          }}>
            <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
              ⚙️ Step 6: Your Way
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#3730a3', margin: 0 }}>
              All settings save automatically! Your preferences will be remembered every time you visit.
            </p>
          </div>
        </div>

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
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0284c7';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0ea5e9';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🔊 Hear This Tour Guide
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e5e7eb'
        }}
      >
        <h2 style={{ 
          fontSize: '1.875rem', 
          fontWeight: '700', 
          color: '#1f2937', 
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          🧠 Accessibility Features Demo
        </h2>

        <div style={{ 
          display: 'grid', 
          gap: '1rem', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          marginBottom: '2rem'
        }}>
          {/* Current Settings Display */}
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              Current Settings:
            </h3>
            <ul style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0, paddingLeft: '1rem' }}>
              <li>Font: {settings.fontSize}</li>
              <li>Theme: {settings.colorTheme}</li>
              <li>Sound: {settings.soundEnabled ? 'On' : 'Off'}</li>
              <li>Errors: {settings.errorHandling}</li>
              <li>Motion: {settings.reducedMotion ? 'Reduced' : 'Normal'}</li>
              <li>Reading Guide: {settings.readingGuide ? 'On' : 'Off'}</li>
            </ul>
          </div>

          {/* Test Buttons */}
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              Test Features:
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={handleDemoError}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Test Error Style
              </button>
              <button
                onClick={handleDemoSpeech}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Test Speech
              </button>
              <button
                onClick={handleDemoBreak}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Demo Break Reminder
              </button>
            </div>
          </div>

          {/* Quick Access Neurodivergent Features Panel */}
          <div style={{
            backgroundColor: '#fef7ff',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e879f9'
          }}>
            <h3 style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#86198f' }}>
              🧠 Active Neurodivergent Features:
            </h3>
            <div style={{ 
              display: 'grid', 
              gap: '0.5rem', 
              gridTemplateColumns: 'repeat(2, 1fr)',
              fontSize: '0.75rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ color: settings.readingGuide ? '#059669' : '#dc2626' }}>
                  {settings.readingGuide ? '✅' : '❌'}
                </span>
                <span style={{ color: '#581c87' }}>Reading Guide</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ color: settings.distractionReduction ? '#059669' : '#dc2626' }}>
                  {settings.distractionReduction ? '✅' : '❌'}
                </span>
                <span style={{ color: '#581c87' }}>Distraction Reduction</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ color: settings.breakReminders ? '#059669' : '#dc2626' }}>
                  {settings.breakReminders ? '✅' : '❌'}
                </span>
                <span style={{ color: '#581c87' }}>Break Reminders</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ color: settings.sensoryBreaks ? '#059669' : '#dc2626' }}>
                  {settings.sensoryBreaks ? '✅' : '❌'}
                </span>
                <span style={{ color: '#581c87' }}>Sensory Breaks</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ color: settings.visibleTimers ? '#059669' : '#dc2626' }}>
                  {settings.visibleTimers ? '✅' : '❌'}
                </span>
                <span style={{ color: '#581c87' }}>Visible Timer</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ color: settings.simplifiedUI ? '#059669' : '#dc2626' }}>
                  {settings.simplifiedUI ? '✅' : '❌'}
                </span>
                <span style={{ color: '#581c87' }}>Simplified UI</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ color: settings.colorTheme !== 'default' ? '#059669' : '#dc2626' }}>
                  {settings.colorTheme !== 'default' ? '✅' : '❌'}
                </span>
                <span style={{ color: '#581c87' }}>Special Theme</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ color: settings.colorOverlay !== 'none' ? '#059669' : '#dc2626' }}>
                  {settings.colorOverlay !== 'none' ? '✅' : '❌'}
                </span>
                <span style={{ color: '#581c87' }}>Color Overlay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Content with Reading Support */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          marginBottom: '1rem'
        }}>
          <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            Sample Content (Test Reading Features):
          </h3>
          <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '0.75rem' }}>
            This is sample text to demonstrate reading assistance features. Try enabling the reading guide 
            in the accessibility panel to see how it highlights text as you scroll.
          </p>
          <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '0.75rem' }}>
            You can also test different letter spacing, line spacing, and color overlays to see how they 
            affect readability. These features are especially helpful for users with dyslexia.
          </p>
          <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '0' }}>
            The autism-friendly color theme provides calming colors, while the simplified UI reduces 
            visual clutter for better focus. ADHD users can benefit from break reminders and timers.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <AccessibilityAwareError
            message={error.message}
            errorHandling={settings.errorHandling}
            soundEnabled={settings.soundEnabled}
            onDismiss={clearError}
          />
        )}

        {/* Feature Status */}
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #22c55e',
          borderRadius: '0.5rem',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>✅</span>
            <h4 style={{ fontWeight: '600', color: '#166534', margin: 0 }}>
              Neurodivergent Features Active!
            </h4>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#15803d', margin: 0 }}>
            All accessibility features are loaded and ready. Use the 🔧 button to customize your experience.
            Try different settings to see how they change the interface in real-time!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
