export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
  preferences: UserPreferences;
  progress: UserProgress;
  achievements: Achievement[];
}

export interface UserPreferences {
  accessibility: {
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
  };
  notifications: {
    achievements: boolean;
    dailyReminders: boolean;
    weeklyProgress: boolean;
  };
}

export interface UserProgress {
  totalModulesCompleted: number;
  totalTimeSpent: number; // in minutes
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  moduleProgress: Record<string, ModuleProgress>;
  overallScore: number;
}

export interface ModuleProgress {
  moduleId: string;
  completed: boolean;
  bestScore: number;
  attempts: number;
  timeSpent: number; // in minutes
  firstCompletedAt?: Date;
  lastAttemptAt: Date;
  averageScore: number;
  perfectScores: number;
}

export interface Achievement {
  id: string;
  unlockedAt: Date;
  progress?: number; // for progressive achievements
}

export interface Session {
  token: string;
  user: User;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  username: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  age?: number;
  parentEmail?: string; // for users under 13
}
