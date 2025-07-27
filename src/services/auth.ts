import type { User, Session, LoginCredentials, SignupData } from '../types/user';

// Simple in-memory storage for demo purposes
// In production, this would be replaced with a real backend API
class UserAuthService {
  private users: Map<string, User> = new Map();
  // Note: sessions could be used for persistent login sessions in the future
  private currentSession: Session | null = null;

  constructor() {
    // Load from localStorage on initialization
    this.loadFromStorage();
    
    // Create demo account for testing
    this.createDemoAccount();
  }

  private createDemoAccount() {
    if (!this.users.has('demo@learnonauts.com')) {
      const demoUser: User = {
        id: 'demo-user-123',
        email: 'demo@learnonauts.com',
        username: 'demo_learner',
        displayName: 'Demo Learner',
        avatar: '🚀',
        createdAt: new Date('2025-01-01'),
        lastLogin: new Date(),
        preferences: {
          accessibility: {
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
          },
          notifications: {
            achievements: true,
            dailyReminders: true,
            weeklyProgress: true,
          }
        },
        progress: {
          totalModulesCompleted: 2,
          totalTimeSpent: 45,
          currentStreak: 3,
          longestStreak: 7,
          lastActiveDate: new Date(),
          moduleProgress: {
            'classification': {
              moduleId: 'classification',
              completed: true,
              bestScore: 95,
              attempts: 3,
              timeSpent: 15,
              firstCompletedAt: new Date('2025-01-15'),
              lastAttemptAt: new Date('2025-01-20'),
              averageScore: 87,
              perfectScores: 1
            },
            'clustering': {
              moduleId: 'clustering',
              completed: true,
              bestScore: 88,
              attempts: 2,
              timeSpent: 12,
              firstCompletedAt: new Date('2025-01-18'),
              lastAttemptAt: new Date('2025-01-18'),
              averageScore: 85,
              perfectScores: 0
            }
          },
          overallScore: 91
        },
        achievements: [
          { id: 'first-steps', unlockedAt: new Date('2025-01-15') },
          { id: 'classifier-pro', unlockedAt: new Date('2025-01-20') }
        ]
      };
      
      this.users.set(demoUser.email, demoUser);
      this.saveToStorage();
    }
  }

  private loadFromStorage() {
    try {
      const usersData = localStorage.getItem('learnonauts_users');
      const sessionData = localStorage.getItem('learnonauts_session');
      
      if (usersData) {
        const parsedUsers = JSON.parse(usersData);
        this.users = new Map(Object.entries(parsedUsers).map(([email, userData]: [string, any]) => [
          email,
          {
            ...userData,
            createdAt: new Date(userData.createdAt),
            lastLogin: new Date(userData.lastLogin),
            progress: {
              ...userData.progress,
              lastActiveDate: new Date(userData.progress.lastActiveDate),
              moduleProgress: Object.fromEntries(
                Object.entries(userData.progress.moduleProgress || {}).map(([moduleId, progress]: [string, any]) => [
                  moduleId,
                  {
                    ...progress,
                    firstCompletedAt: progress.firstCompletedAt ? new Date(progress.firstCompletedAt) : undefined,
                    lastAttemptAt: new Date(progress.lastAttemptAt)
                  }
                ])
              )
            },
            achievements: userData.achievements.map((achievement: any) => ({
              ...achievement,
              unlockedAt: new Date(achievement.unlockedAt)
            }))
          }
        ]));
      }
      
      if (sessionData) {
        const parsedSession = JSON.parse(sessionData);
        if (new Date(parsedSession.expiresAt) > new Date()) {
          this.currentSession = {
            ...parsedSession,
            expiresAt: new Date(parsedSession.expiresAt),
            user: {
              ...parsedSession.user,
              createdAt: new Date(parsedSession.user.createdAt),
              lastLogin: new Date(parsedSession.user.lastLogin),
              progress: {
                ...parsedSession.user.progress,
                lastActiveDate: new Date(parsedSession.user.progress.lastActiveDate)
              }
            }
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load user data from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const usersObject = Object.fromEntries(this.users.entries());
      localStorage.setItem('learnonauts_users', JSON.stringify(usersObject));
      
      if (this.currentSession) {
        localStorage.setItem('learnonauts_session', JSON.stringify(this.currentSession));
      }
    } catch (error) {
      console.warn('Failed to save user data to storage:', error);
    }
  }

  private generateToken(): string {
    return 'lrn_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters long' };
    }
    return { valid: true };
  }

  async signup(signupData: SignupData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Validation
      if (!this.validateEmail(signupData.email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      if (this.users.has(signupData.email)) {
        return { success: false, error: 'An account with this email already exists' };
      }

      if (signupData.password !== signupData.confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      const passwordValidation = this.validatePassword(signupData.password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.message };
      }

      if (signupData.username.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters long' };
      }

      // Check if username is taken
      for (const user of this.users.values()) {
        if (user.username.toLowerCase() === signupData.username.toLowerCase()) {
          return { success: false, error: 'Username is already taken' };
        }
      }

      // Create new user
      const newUser: User = {
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
        email: signupData.email.toLowerCase(),
        username: signupData.username,
        displayName: signupData.displayName,
        createdAt: new Date(),
        lastLogin: new Date(),
        preferences: {
          accessibility: {
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
          },
          notifications: {
            achievements: true,
            dailyReminders: true,
            weeklyProgress: true,
          }
        },
        progress: {
          totalModulesCompleted: 0,
          totalTimeSpent: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: new Date(),
          moduleProgress: {},
          overallScore: 0
        },
        achievements: []
      };

      this.users.set(newUser.email, newUser);
      this.saveToStorage();

      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: 'Failed to create account. Please try again.' };
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = this.users.get(credentials.email.toLowerCase());
      
      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // In a real app, you'd verify the hashed password here
      // For demo purposes, we'll accept any password for existing users
      // except for the demo account which has a specific password
      if (credentials.email === 'demo@learnonauts.com' && credentials.password !== 'demo123') {
        return { success: false, error: 'Invalid email or password' };
      }

      // Update last login
      user.lastLogin = new Date();
      this.users.set(user.email, user);

      // Create session
      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      this.currentSession = {
        token,
        user,
        expiresAt
      };

      this.saveToStorage();

      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  logout(): void {
    this.currentSession = null;
    localStorage.removeItem('learnonauts_session');
  }

  getCurrentUser(): User | null {
    if (this.currentSession && this.currentSession.expiresAt > new Date()) {
      return this.currentSession.user;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  async updateProgress(moduleId: string, score: number, timeSpent: number): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) return;

    const now = new Date();
    
    // Update or create module progress
    if (!user.progress.moduleProgress[moduleId]) {
      user.progress.moduleProgress[moduleId] = {
        moduleId,
        completed: false,
        bestScore: 0,
        attempts: 0,
        timeSpent: 0,
        lastAttemptAt: now,
        averageScore: 0,
        perfectScores: 0
      };
    }

    const moduleProgress = user.progress.moduleProgress[moduleId];
    
    // Update module stats
    moduleProgress.attempts += 1;
    moduleProgress.timeSpent += timeSpent;
    moduleProgress.lastAttemptAt = now;
    
    if (score > moduleProgress.bestScore) {
      moduleProgress.bestScore = score;
    }
    
    if (score === 100) {
      moduleProgress.perfectScores += 1;
    }
    
    // Calculate average score
    moduleProgress.averageScore = Math.round(
      ((moduleProgress.averageScore * (moduleProgress.attempts - 1)) + score) / moduleProgress.attempts
    );
    
    // Mark as completed if score >= 70
    if (score >= 70 && !moduleProgress.completed) {
      moduleProgress.completed = true;
      moduleProgress.firstCompletedAt = now;
      user.progress.totalModulesCompleted += 1;
    }

    // Update overall progress
    user.progress.totalTimeSpent += timeSpent;
    user.progress.lastActiveDate = now;
    
    // Calculate overall score
    const completedModules = Object.values(user.progress.moduleProgress).filter(p => p.completed);
    if (completedModules.length > 0) {
      user.progress.overallScore = Math.round(
        completedModules.reduce((sum, p) => sum + p.bestScore, 0) / completedModules.length
      );
    }

    // Update streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const lastActive = new Date(user.progress.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);
    
    if (lastActive.getTime() === yesterday.getTime()) {
      user.progress.currentStreak += 1;
    } else if (lastActive.getTime() < yesterday.getTime()) {
      user.progress.currentStreak = 1;
    }
    
    if (user.progress.currentStreak > user.progress.longestStreak) {
      user.progress.longestStreak = user.progress.currentStreak;
    }

    // Update user in storage
    this.users.set(user.email, user);
    if (this.currentSession) {
      this.currentSession.user = user;
    }
    this.saveToStorage();
  }

  async updatePreferences(preferences: Partial<User['preferences']>): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) return;

    user.preferences = { ...user.preferences, ...preferences };
    
    this.users.set(user.email, user);
    if (this.currentSession) {
      this.currentSession.user = user;
    }
    this.saveToStorage();
  }

  async unlockAchievement(achievementId: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) return;

    const alreadyUnlocked = user.achievements.find(a => a.id === achievementId);
    if (alreadyUnlocked) return;

    user.achievements.push({
      id: achievementId,
      unlockedAt: new Date()
    });

    this.users.set(user.email, user);
    if (this.currentSession) {
      this.currentSession.user = user;
    }
    this.saveToStorage();
  }

  // Get user statistics for dashboard
  getUserStats() {
    const user = this.getCurrentUser();
    if (!user) return null;

    const completedModules = Object.values(user.progress.moduleProgress).filter(p => p.completed);
    const totalAttempts = Object.values(user.progress.moduleProgress).reduce((sum, p) => sum + p.attempts, 0);
    const perfectScores = Object.values(user.progress.moduleProgress).reduce((sum, p) => sum + p.perfectScores, 0);

    return {
      user,
      stats: {
        completedModules: completedModules.length,
        totalAttempts,
        perfectScores,
        timeSpent: user.progress.totalTimeSpent,
        currentStreak: user.progress.currentStreak,
        achievements: user.achievements.length,
        overallScore: user.progress.overallScore
      }
    };
  }
}

// Export singleton instance
export const authService = new UserAuthService();
