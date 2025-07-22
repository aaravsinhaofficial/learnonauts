import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Eye, Palette, Settings, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AccessibilitySettings {
  soundEnabled: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorTheme: 'default' | 'high-contrast' | 'warm' | 'cool';
  narrationSpeed: number;
  focusIndicator: boolean;
  darkMode: boolean;
}

interface AccessibilityPanelProps {
  settings: AccessibilitySettings;
  onSettingsChange: (settings: AccessibilitySettings) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function AccessibilityPanel({ settings, onSettingsChange, isOpen, onToggle }: AccessibilityPanelProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'audio' | 'interaction'>('visual');

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
    
    // Apply settings immediately
    if (key === 'darkMode') {
      document.documentElement.classList.toggle('dark', value as boolean);
    }
    if (key === 'reducedMotion') {
      document.documentElement.style.setProperty(
        '--motion-reduce', 
        value ? 'reduce' : 'no-preference'
      );
    }
    if (key === 'fontSize') {
      const sizes = { small: '14px', medium: '16px', large: '20px' };
      document.documentElement.style.fontSize = sizes[value as keyof typeof sizes];
    }
  };

  // Text-to-speech functionality
  const speak = (text: string) => {
    if (!settings.soundEnabled) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.narrationSpeed;
    utterance.volume = 0.7;
    speechSynthesis.speak(utterance);
  };

  return (
    <>
      {/* Floating Accessibility Button */}
      <motion.button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open accessibility settings"
      >
        <Settings size={24} />
      </motion.button>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={onToggle}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">🛠️ Make It Your Own!</h2>
                  <button
                    onClick={onToggle}
                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg"
                    aria-label="Close settings"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-blue-100 mt-2">
                  Customize Learnonauts to work best for you! Everyone learns differently. 🌟
                </p>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'visual', label: '👁️ Visual', icon: Eye },
                  { id: 'audio', label: '🔊 Audio', icon: Volume2 },
                  { id: 'interaction', label: '🖱️ Controls', icon: Settings }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex-1 p-4 text-center font-medium transition-colors ${
                      activeTab === id
                        ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Icon size={20} />
                      <span className="hidden sm:inline">{label}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Settings Content */}
              <div className="p-6 space-y-6">
                {/* Visual Settings */}
                {activeTab === 'visual' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Palette className="text-purple-500" size={20} />
                        Visual Comfort
                      </h3>
                      
                      {/* Dark Mode */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                            <div>
                              <label className="font-medium">Dark Mode</label>
                              <p className="text-sm text-gray-600">Easier on the eyes in low light</p>
                            </div>
                          </div>
                          <button
                            onClick={() => updateSetting('darkMode', !settings.darkMode)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              settings.darkMode ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                                settings.darkMode ? 'translate-x-6' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* High Contrast */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium">High Contrast Colors</label>
                            <p className="text-sm text-gray-600">Makes text and buttons more visible</p>
                          </div>
                          <button
                            onClick={() => updateSetting('highContrast', !settings.highContrast)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              settings.highContrast ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                                settings.highContrast ? 'translate-x-6' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Font Size */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="font-medium block mb-3">Text Size</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['small', 'medium', 'large'] as const).map((size) => (
                            <button
                              key={size}
                              onClick={() => updateSetting('fontSize', size)}
                              className={`p-3 rounded-lg border-2 transition-colors text-center ${
                                settings.fontSize === size
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className={`font-medium ${
                                size === 'small' ? 'text-sm' : 
                                size === 'medium' ? 'text-base' : 'text-lg'
                              }`}>
                                Aa
                              </div>
                              <div className="text-xs mt-1 capitalize">{size}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audio Settings */}
                {activeTab === 'audio' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Volume2 className="text-green-500" size={20} />
                      Audio Assistance
                    </h3>

                    {/* Sound Toggle */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                          <div>
                            <label className="font-medium">Sound Effects & Narration</label>
                            <p className="text-sm text-gray-600">Hear instructions and feedback</p>
                          </div>
                        </div>
                        <button
                          onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings.soundEnabled ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                              settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Narration Speed */}
                    {settings.soundEnabled && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="font-medium block mb-3">
                          Speech Speed: {settings.narrationSpeed.toFixed(1)}x
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={settings.narrationSpeed}
                          onChange={(e) => updateSetting('narrationSpeed', parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Slow</span>
                          <span>Fast</span>
                        </div>
                        <button
                          onClick={() => speak("This is how fast I will speak to help you learn!")}
                          className="mt-3 bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-lg text-sm"
                        >
                          🔊 Test Voice
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Interaction Settings */}
                {activeTab === 'interaction' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Settings className="text-orange-500" size={20} />
                      Interaction Preferences
                    </h3>

                    {/* Reduced Motion */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Reduce Animations</label>
                          <p className="text-sm text-gray-600">Less movement for better focus</p>
                        </div>
                        <button
                          onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings.reducedMotion ? 'bg-orange-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                              settings.reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Focus Indicator */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Enhanced Focus Outline</label>
                          <p className="text-sm text-gray-600">Clearer indication of selected items</p>
                        </div>
                        <button
                          onClick={() => updateSetting('focusIndicator', !settings.focusIndicator)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings.focusIndicator ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                              settings.focusIndicator ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 p-4 rounded-b-xl text-center">
                <p className="text-sm text-gray-600">
                  💡 Your settings are saved automatically and will be remembered next time!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Default settings
export const defaultAccessibilitySettings: AccessibilitySettings = {
  soundEnabled: true,
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  colorTheme: 'default',
  narrationSpeed: 1.0,
  focusIndicator: true,
  darkMode: false,
};
