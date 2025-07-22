import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/user';
import { authService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (signupData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProgress: (moduleId: string, score: number, timeSpent: number) => Promise<void>;
  updatePreferences: (preferences: any) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on load
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login({ email, password });
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const signup = async (signupData: any) => {
    const result = await authService.signup(signupData);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProgress = async (moduleId: string, score: number, timeSpent: number) => {
    await authService.updateProgress(moduleId, score, timeSpent);
    // Refresh user data
    const updatedUser = authService.getCurrentUser();
    setUser(updatedUser);
  };

  const updatePreferences = async (preferences: any) => {
    await authService.updatePreferences(preferences);
    // Refresh user data
    const updatedUser = authService.getCurrentUser();
    setUser(updatedUser);
  };

  const unlockAchievement = async (achievementId: string) => {
    await authService.unlockAchievement(achievementId);
    // Refresh user data
    const updatedUser = authService.getCurrentUser();
    setUser(updatedUser);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    updateProgress,
    updatePreferences,
    unlockAchievement,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
