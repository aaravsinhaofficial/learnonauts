import type { AccessibilitySettings } from '../components/AccessibilityPanel';

// Default accessibility settings including advanced neurodivergent features
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
  
  // Executive Function Support
  taskSequencing: false,
  visualSchedule: false,
  focusRetention: false,
  
  // Learning Patterns
  repetitionPreference: false,
  patternRecognition: false,
  visualLearningMode: false,
  auditoryLearningMode: false,
  kinestheticLearningMode: false,
  multiModalLearning: false,
  conceptMappingSupport: false,
  informationChunking: false,
  
  // Controls
  errorHandling: 'standard',
  feedbackStyle: 'standard',
  interactionStyle: 'standard',
};

// ADHD optimized settings
export const adhdSettings: AccessibilitySettings = {
  ...defaultAccessibilitySettings,
  breakReminders: true,
  visibleTimers: true,
  focusSessions: true,
  distractionReduction: true,
  simplifiedUI: true,
  cognitiveLoad: 'reduced',
  errorHandling: 'encouraging',
  feedbackStyle: 'both',
  taskSequencing: true,
  focusRetention: true,
  informationChunking: true,
  kinestheticLearningMode: true,
  interactionStyle: 'step-by-step'
};

// Autism optimized settings
export const autismSettings: AccessibilitySettings = {
  ...defaultAccessibilitySettings,
  colorTheme: 'autism-friendly',
  reducedMotion: true,
  sensoryBreaks: true,
  minimalMode: true,
  simplifiedUI: true,
  cognitiveLoad: 'minimal',
  errorHandling: 'gentle',
  feedbackStyle: 'visual',
  visualSchedule: true,
  patternRecognition: true,
  conceptMappingSupport: true,
  interactionStyle: 'guided'
};

// Dyslexia optimized settings
export const dyslexiaSettings: AccessibilitySettings = {
  ...defaultAccessibilitySettings,
  colorTheme: 'dyslexia-friendly',
  fontSize: 'large',
  letterSpacing: 'wide',
  lineHeight: 'relaxed',
  wordSpacing: 'wide',
  readingGuide: true,
  speechEnabled: true,
  speechInstructions: true,
  visualLearningMode: true,
  auditoryLearningMode: true,
  multiModalLearning: true,
  informationChunking: true,
  interactionStyle: 'step-by-step'
};

// Visual processing optimized settings
export const visualProcessingSettings: AccessibilitySettings = {
  ...defaultAccessibilitySettings,
  colorTheme: 'high-contrast',
  colorOverlay: 'blue',
  reducedMotion: true,
  enhancedFocusOutlines: true,
  simplifiedUI: true,
  patternRecognition: true,
  visualLearningMode: true,
  informationChunking: true,
  conceptMappingSupport: true,
  interactionStyle: 'guided'
};

// Auditory processing optimized settings
export const auditoryProcessingSettings: AccessibilitySettings = {
  ...defaultAccessibilitySettings,
  speechEnabled: true,
  speechInstructions: true,
  speechFeedback: true,
  speechSpeed: 0.8,
  speechVolume: 1.0,
  readingGuide: true,
  visualSchedule: true,
  feedbackStyle: 'visual',
  visualLearningMode: true,
  auditoryLearningMode: true,
  multiModalLearning: true,
  interactionStyle: 'guided'
};

// Dyscalculia optimized settings
export const dyscalculiaSettings: AccessibilitySettings = {
  ...defaultAccessibilitySettings,
  fontSize: 'large',
  simplifiedUI: true,
  cognitiveLoad: 'reduced',
  errorHandling: 'gentle',
  taskSequencing: true,
  visualLearningMode: true,
  informationChunking: true,
  conceptMappingSupport: true,
  repetitionPreference: true,
  interactionStyle: 'step-by-step'
};

// Executive function disorder optimized settings
export const executiveFunctionSettings: AccessibilitySettings = {
  ...defaultAccessibilitySettings,
  breakReminders: true,
  visibleTimers: true,
  taskSequencing: true,
  visualSchedule: true,
  focusRetention: true,
  distractionReduction: true,
  cognitiveLoad: 'reduced',
  informationChunking: true,
  errorHandling: 'encouraging',
  interactionStyle: 'guided'
};

// Kinesthetic learner optimized settings
export const kinestheticLearnerSettings: AccessibilitySettings = {
  ...defaultAccessibilitySettings,
  kinestheticLearningMode: true,
  breakReminders: true,
  sensoryBreaks: true,
  taskSequencing: true,
  multiModalLearning: true,
  cognitiveLoad: 'reduced',
  interactionStyle: 'freestyle'
};
