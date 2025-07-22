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
    soundEnabled: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    colorTheme: 'default' | 'high-contrast' | 'warm' | 'cool';
    narrationSpeed: number;
    focusIndicator: boolean;
    darkMode: boolean;
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
