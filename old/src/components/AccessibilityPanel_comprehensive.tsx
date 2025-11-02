import React, { useState, useEffect } from 'react';

interface AccessibilitySettings {
  // Visual Settings
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorTheme: 'default' | 'high-contrast' | 'dyslexia-friendly' | 'autism-friendly' | 'warm' | 'cool';
  darkMode: boolean;
  reducedMotion: boolean;
  enhancedFocusOutlines: boolean;
  
  // Audio Settings
  speechEnabled: boolean;
  speechInstructions: boolean;
  speechFeedback: boolean;
  speechSpeed: number;
  speechVolume: number;
  soundEnabled: boolean;
  
  // Reading Assistance
  readingGuide: boolean;
  letterSpacing: 'normal' | 'wide' | 'extra-wide';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  wordSpacing: 'normal' | 'wide' | 'extra-wide';
  colorOverlay: 'none' | 'blue' | 'yellow' | 'green' | 'pink';
  
  // Focus & Attention
  breakReminders: boolean;
  sensoryBreaks: boolean;
  visibleTimers: boolean;
  focusSessions: boolean;
  distractionReduction: boolean;
  simplifiedUI: boolean;
  minimalMode: boolean;
  cognitiveLoad: 'full' | 'reduced' | 'minimal';
  
  // Controls
  errorHandling: 'standard' | 'gentle' | 'encouraging';
  feedbackStyle: 'standard' | 'visual' | 'audio' | 'both';
}

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  settings: AccessibilitySettings;
  onSettingsChange: (settings: AccessibilitySettings) => void;
}

type TabType = 'visual' | 'audio' | 'reading' | 'focus' | 'controls';

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  isOpen,
  onClose,
  onOpen,
  settings,
  onSettingsChange,
}) => {
  const [localSettings, setLocalSettings] = useState<AccessibilitySettings>(settings);
  const [activeTab, setActiveTab] = useState<TabType>('visual');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingChange = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      // Visual Settings
      fontSize: 'medium',
      colorTheme: 'default',
      darkMode: false,
      reducedMotion: false,
      enhancedFocusOutlines: false,
      
      // Audio Settings
      speechEnabled: false,
      speechInstructions: false,
      speechFeedback: false,
      speechSpeed: 1.0,
      speechVolume: 0.8,
      soundEnabled: true,
      
      // Reading Assistance
      readingGuide: false,
      letterSpacing: 'normal',
      lineHeight: 'normal',
      wordSpacing: 'normal',
      colorOverlay: 'none',
      
      // Focus & Attention
      breakReminders: false,
      sensoryBreaks: false,
      visibleTimers: false,
      focusSessions: false,
      distractionReduction: false,
      simplifiedUI: false,
      minimalMode: false,
      cognitiveLoad: 'full',
      
      // Controls
      errorHandling: 'standard',
      feedbackStyle: 'standard',
    };
    setLocalSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  // Styles
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: isOpen ? 'block' : 'none',
  };

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '0',
    maxWidth: '700px',
    width: '90%',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    zIndex: 1001,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 24px 0 24px',
    marginBottom: '20px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '8px',
    borderRadius: '6px',
    transition: 'all 0.2s',
  };

  const tabContainerStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '20px',
    overflowX: 'auto',
  };

  const tabStyle: React.CSSProperties = {
    padding: '12px 20px',
    border: 'none',
    background: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
  };

  const activeTabStyle: React.CSSProperties = {
    ...tabStyle,
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
  };

  const contentStyle: React.CSSProperties = {
    padding: '0 24px 24px 24px',
  };

  const settingGroupStyle: React.CSSProperties = {
    marginBottom: '24px',
  };

  const settingLabelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  };

  const settingDescStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '12px',
    lineHeight: '1.5',
  };

  const switchContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  };

  const switchStyle: React.CSSProperties = {
    position: 'relative',
    width: '44px',
    height: '24px',
    backgroundColor: '#d1d5db',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const switchActiveStyle: React.CSSProperties = {
    ...switchStyle,
    backgroundColor: '#3b82f6',
  };

  const switchToggleStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    backgroundColor: 'white',
    borderRadius: '50%',
    transition: 'transform 0.2s',
    transform: 'translateX(0px)',
  };

  const switchToggleActiveStyle: React.CSSProperties = {
    ...switchToggleStyle,
    transform: 'translateX(20px)',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    fontSize: '14px',
    cursor: 'pointer',
  };

  const sliderContainerStyle: React.CSSProperties = {
    marginBottom: '8px',
  };

  const sliderStyle: React.CSSProperties = {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    backgroundColor: '#d1d5db',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
  };

  const floatingButtonStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    background: 'white',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: 'white',
    border: '1px solid #3b82f6',
  };

  // Tab Icons
  const tabIcons = {
    visual: '👁️',
    audio: '🔊',
    reading: '📖',
    focus: '🧠',
    controls: '⚙️',
  };

  // Quick settings for specific conditions
  const quickSettings = {
    adhd: () => {
      handleSettingChange('breakReminders', true);
      handleSettingChange('visibleTimers', true);
      handleSettingChange('focusSessions', true);
      handleSettingChange('simplifiedUI', true);
      handleSettingChange('sensoryBreaks', true);
    },
    autism: () => {
      handleSettingChange('colorTheme', 'autism-friendly');
      handleSettingChange('simplifiedUI', true);
      handleSettingChange('errorHandling', 'gentle');
      handleSettingChange('reducedMotion', true);
    },
    dyslexia: () => {
      handleSettingChange('colorTheme', 'dyslexia-friendly');
      handleSettingChange('readingGuide', true);
      handleSettingChange('letterSpacing', 'wide');
      handleSettingChange('lineHeight', 'relaxed');
      handleSettingChange('fontSize', 'large');
    },
    visualProcessing: () => {
      handleSettingChange('colorTheme', 'high-contrast');
      handleSettingChange('colorOverlay', 'blue');
      handleSettingChange('enhancedFocusOutlines', true);
      handleSettingChange('simplifiedUI', true);
      handleSettingChange('reducedMotion', true);
    },
    auditoryProcessing: () => {
      handleSettingChange('speechEnabled', true);
      handleSettingChange('speechInstructions', true);
      handleSettingChange('feedbackStyle', 'visual');
      handleSettingChange('readingGuide', true);
    },
  };

  // Render switch component
  const renderSwitch = (
    value: boolean,
    onChange: (value: boolean) => void,
    label: string
  ) => (
    <div style={switchContainerStyle}>
      <button
        style={value ? switchActiveStyle : switchStyle}
        onClick={() => onChange(!value)}
        aria-label={`${label} ${value ? 'enabled' : 'disabled'}`}
      >
        <div style={value ? switchToggleActiveStyle : switchToggleStyle} />
      </button>
      <span style={{ fontSize: '14px', color: '#374151' }}>
        {value ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  );

  // Render select component
  const renderSelect = <T extends string>(
    value: T,
    options: Array<{ value: T; label: string }>,
    onChange: (value: T) => void
  ) => (
    <select
      style={selectStyle}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  // Render slider component
  const renderSlider = (
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (value: number) => void,
    label: string
  ) => (
    <div style={sliderContainerStyle}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={sliderStyle}
        aria-label={label}
      />
      <div style={{ marginTop: '4px', fontSize: '14px', color: '#6b7280' }}>
        Current: {value}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'visual':
        return (
          <>
            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Font Size</label>
              <p style={settingDescStyle}>Choose text size for comfortable reading</p>
              {renderSelect(
                localSettings.fontSize,
                [
                  { value: 'small', label: 'Small - Compact text' },
                  { value: 'medium', label: 'Medium - Standard size (default)' },
                  { value: 'large', label: 'Large - Easier to read' },
                  { value: 'extra-large', label: 'Extra Large - Maximum readability' },
                ],
                (value) => handleSettingChange('fontSize', value)
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Color Theme</label>
              <p style={settingDescStyle}>Select a color scheme that works best for you</p>
              {renderSelect(
                localSettings.colorTheme,
                [
                  { value: 'default', label: 'Default - Standard colors' },
                  { value: 'high-contrast', label: 'High Contrast - Black and white' },
                  { value: 'dyslexia-friendly', label: 'Dyslexia-Friendly - Cream background' },
                  { value: 'autism-friendly', label: 'Autism-Friendly - Calming blues' },
                  { value: 'warm', label: 'Warm - Soft yellows and oranges' },
                  { value: 'cool', label: 'Cool - Blues and greens' },
                ],
                (value) => handleSettingChange('colorTheme', value)
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Dark Mode</label>
              <p style={settingDescStyle}>Easier on eyes in low light conditions</p>
              {renderSwitch(
                localSettings.darkMode,
                (value) => handleSettingChange('darkMode', value),
                'Dark mode'
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Reduced Motion</label>
              <p style={settingDescStyle}>Minimize animations for vestibular sensitivity</p>
              {renderSwitch(
                localSettings.reducedMotion,
                (value) => handleSettingChange('reducedMotion', value),
                'Reduced motion'
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Enhanced Focus Outlines</label>
              <p style={settingDescStyle}>Clearer keyboard navigation indicators</p>
              {renderSwitch(
                localSettings.enhancedFocusOutlines,
                (value) => handleSettingChange('enhancedFocusOutlines', value),
                'Enhanced focus outlines'
              )}
            </div>
          </>
        );

      case 'audio':
        return (
          <>
            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Speech Synthesis</label>
              <p style={settingDescStyle}>Enable text-to-speech for content</p>
              {renderSwitch(
                localSettings.speechEnabled,
                (value) => handleSettingChange('speechEnabled', value),
                'Speech synthesis'
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Instructions Read Aloud</label>
              <p style={settingDescStyle}>Hear explanations and instructions</p>
              {renderSwitch(
                localSettings.speechInstructions,
                (value) => handleSettingChange('speechInstructions', value),
                'Instructions read aloud'
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Audio Feedback</label>
              <p style={settingDescStyle}>Audio confirmation of actions</p>
              {renderSwitch(
                localSettings.speechFeedback,
                (value) => handleSettingChange('speechFeedback', value),
                'Audio feedback'
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Speech Speed</label>
              <p style={settingDescStyle}>Adjust narration speed from 0.5x to 2x</p>
              {renderSlider(
                localSettings.speechSpeed,
                0.5,
                2.0,
                0.1,
                (value) => handleSettingChange('speechSpeed', value),
                'Speech speed'
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Speech Volume</label>
              <p style={settingDescStyle}>Comfortable listening level</p>
              {renderSlider(
                localSettings.speechVolume,
                0.0,
                1.0,
                0.1,
                (value) => handleSettingChange('speechVolume', value),
                'Speech volume'
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Sound Effects</label>
              <p style={settingDescStyle}>Enable interface sounds and notifications</p>
              {renderSwitch(
                localSettings.soundEnabled,
                (value) => handleSettingChange('soundEnabled', value),
                'Sound effects'
              )}
            </div>
          </>
        );

      case 'reading':
        return (
          <>
            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Reading Guide</label>
              <p style={settingDescStyle}>Moving highlight line that follows as you scroll</p>
              {renderSwitch(
                localSettings.readingGuide,
                (value) => handleSettingChange('readingGuide', value),
                'Reading guide'
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Letter Spacing</label>
              <p style={settingDescStyle}>Adjust spacing between letters</p>
              {renderSelect(
                localSettings.letterSpacing,
                [
                  { value: 'normal', label: 'Normal' },
                  { value: 'wide', label: 'Wide' },
                  { value: 'extra-wide', label: 'Extra Wide' },
                ],
                (value) => handleSettingChange('letterSpacing', value)
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Line Height</label>
              <p style={settingDescStyle}>Adjust spacing between lines</p>
              {renderSelect(
                localSettings.lineHeight,
                [
                  { value: 'normal', label: 'Normal' },
                  { value: 'relaxed', label: 'Relaxed' },
                  { value: 'loose', label: 'Loose' },
                ],
                (value) => handleSettingChange('lineHeight', value)
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Word Spacing</label>
              <p style={settingDescStyle}>Adjust spacing between words</p>
              {renderSelect(
                localSettings.wordSpacing,
                [
                  { value: 'normal', label: 'Normal' },
                  { value: 'wide', label: 'Wide' },
                  { value: 'extra-wide', label: 'Extra Wide' },
                ],
                (value) => handleSettingChange('wordSpacing', value)
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Color Overlay</label>
              <p style={settingDescStyle}>Colored transparent layer to reduce visual stress</p>
              {renderSelect(
                localSettings.colorOverlay,
                [
                  { value: 'none', label: 'None' },
                  { value: 'blue', label: 'Blue - Calming, reduces eye strain' },
                  { value: 'yellow', label: 'Yellow - Improves contrast' },
                  { value: 'green', label: 'Green - Soothing for light sensitivity' },
                  { value: 'pink', label: 'Pink - Helps with visual processing' },
                ],
                (value) => handleSettingChange('colorOverlay', value)
              )}
            </div>
          </>
        );

      case 'focus':
        return (
          <>
            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Break Reminders</label>
              <p style={settingDescStyle}>Gentle notifications every 20 minutes</p>
              {renderSwitch(
                localSettings.breakReminders,
                (value) => handleSettingChange('breakReminders', value),
                'Break reminders'
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Sensory Breaks</label>
              <p style={settingDescStyle}>Guided breathing, stretching, and hydration prompts</p>
              {renderSwitch(
                localSettings.sensoryBreaks,
                (value) => handleSettingChange('sensoryBreaks', value),
                'Sensory breaks'
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Visible Timers</label>
              <p style={settingDescStyle}>See time remaining on activities</p>
              {renderSwitch(
                localSettings.visibleTimers,
                (value) => handleSettingChange('visibleTimers', value),
                'Visible timers'
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Focus Sessions</label>
              <p style={settingDescStyle}>25-minute concentration periods (Pomodoro)</p>
              {renderSwitch(
                localSettings.focusSessions,
                (value) => handleSettingChange('focusSessions', value),
                'Focus sessions'
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Distraction Reduction</label>
              <p style={settingDescStyle}>Remove unnecessary visual elements</p>
              {renderSwitch(
                localSettings.distractionReduction,
                (value) => handleSettingChange('distractionReduction', value),
                'Distraction reduction'
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Simplified UI</label>
              <p style={settingDescStyle}>Show only essential interface elements</p>
              {renderSwitch(
                localSettings.simplifiedUI,
                (value) => handleSettingChange('simplifiedUI', value),
                'Simplified UI'
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Minimal Mode</label>
              <p style={settingDescStyle}>Ultra-clean interface with minimal distractions</p>
              {renderSwitch(
                localSettings.minimalMode,
                (value) => handleSettingChange('minimalMode', value),
                'Minimal mode'
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Cognitive Load</label>
              <p style={settingDescStyle}>Adjust amount of information displayed</p>
              {renderSelect(
                localSettings.cognitiveLoad,
                [
                  { value: 'full', label: 'Full - All information displayed' },
                  { value: 'reduced', label: 'Reduced - Important info only' },
                  { value: 'minimal', label: 'Minimal - Essential content only' },
                ],
                (value) => handleSettingChange('cognitiveLoad', value)
              )}
            </div>
          </>
        );

      case 'controls':
        return (
          <>
            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Error Handling Style</label>
              <p style={settingDescStyle}>Choose how error messages are presented</p>
              {renderSelect(
                localSettings.errorHandling,
                [
                  { value: 'standard', label: 'Standard - Direct, clear messages' },
                  { value: 'gentle', label: 'Gentle - "Don\'t worry! Let\'s try again together."' },
                  { value: 'encouraging', label: 'Encouraging - "Great effort! Here\'s a tip..."' },
                ],
                (value) => handleSettingChange('errorHandling', value)
              )}
            </div>

            <div style={settingGroupStyle}>
              <label style={settingLabelStyle}>Feedback Style</label>
              <p style={settingDescStyle}>How you receive feedback and confirmations</p>
              {renderSelect(
                localSettings.feedbackStyle,
                [
                  { value: 'standard', label: 'Standard - Mixed visual and audio' },
                  { value: 'visual', label: 'Visual - Text and icons only' },
                  { value: 'audio', label: 'Audio - Sounds and speech' },
                  { value: 'both', label: 'Both - All feedback types' },
                ],
                (value) => handleSettingChange('feedbackStyle', value)
              )}
            </div>

            <div style={{ ...settingGroupStyle, borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
              <label style={settingLabelStyle}>Quick Setup for Specific Conditions</label>
              <p style={settingDescStyle}>Apply recommended settings for common neurodivergent needs</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <button
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    fontSize: '13px',
                    padding: '8px 12px',
                  }}
                  onClick={quickSettings.adhd}
                >
                  ✅ ADHD Setup
                </button>
                <button
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    fontSize: '13px',
                    padding: '8px 12px',
                  }}
                  onClick={quickSettings.autism}
                >
                  ✅ Autism Setup
                </button>
                <button
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    fontSize: '13px',
                    padding: '8px 12px',
                  }}
                  onClick={quickSettings.dyslexia}
                >
                  ✅ Dyslexia Setup
                </button>
                <button
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    fontSize: '13px',
                    padding: '8px 12px',
                  }}
                  onClick={quickSettings.visualProcessing}
                >
                  ✅ Visual Processing
                </button>
              </div>
              
              <button
                style={{
                  ...buttonStyle,
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  padding: '8px 12px',
                  width: '100%',
                  marginTop: '12px',
                }}
                onClick={quickSettings.auditoryProcessing}
              >
                ✅ Auditory Processing Setup
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (!isOpen) {
    return (
      <button
        style={floatingButtonStyle}
        onClick={() => {
          console.log('Floating accessibility button clicked');
          onOpen?.();
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.backgroundColor = '#2563eb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = '#3b82f6';
        }}
        aria-label="Open accessibility panel"
        title="🔧 Accessibility Settings - Customize your learning experience!"
      >
        🔧
      </button>
    );
  }

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={panelStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            🧠 Accessibility Control Center
          </h2>
          <button
            style={closeButtonStyle}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#374151';
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Close accessibility panel"
          >
            ✕
          </button>
        </div>

        <div style={tabContainerStyle}>
          {(['visual', 'audio', 'reading', 'focus', 'controls'] as const).map((tab) => (
            <button
              key={tab}
              style={activeTab === tab ? activeTabStyle : tabStyle}
              onClick={() => setActiveTab(tab)}
            >
              {tabIcons[tab]} {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={contentStyle}>
          {renderTabContent()}

          <div style={buttonContainerStyle}>
            <button
              style={buttonStyle}
              onClick={resetSettings}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              Reset to Default
            </button>
            <button
              style={primaryButtonStyle}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }}
            >
              Apply Settings ✨
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export const defaultAccessibilitySettings: AccessibilitySettings = {
  // Visual Settings
  fontSize: 'medium',
  colorTheme: 'default',
  darkMode: false,
  reducedMotion: false,
  enhancedFocusOutlines: false,
  
  // Audio Settings
  speechEnabled: false,
  speechInstructions: false,
  speechFeedback: false,
  speechSpeed: 1.0,
  speechVolume: 0.8,
  soundEnabled: true,
  
  // Reading Assistance
  readingGuide: false,
  letterSpacing: 'normal',
  lineHeight: 'normal',
  wordSpacing: 'normal',
  colorOverlay: 'none',
  
  // Focus & Attention
  breakReminders: false,
  sensoryBreaks: false,
  visibleTimers: false,
  focusSessions: false,
  distractionReduction: false,
  simplifiedUI: false,
  minimalMode: false,
  cognitiveLoad: 'full',
  
  // Controls
  errorHandling: 'standard',
  feedbackStyle: 'standard',
};

export type { AccessibilitySettings };

export default AccessibilityPanel;
