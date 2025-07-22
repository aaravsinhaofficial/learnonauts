import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { User, UserPreferences, Badge, ModuleProgress } from '../types';

interface AppState {
  user: User | null;
  currentModule: string | null;
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'ADD_BADGE'; payload: Badge }
  | { type: 'UPDATE_PROGRESS'; payload: ModuleProgress }
  | { type: 'SET_MODULE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialState: AppState = {
  user: {
    id: 'demo-user',
    name: 'AI Explorer',
    badges: [],
    progress: [],
    preferences: {
      reducedMotion: false,
      highContrast: false,
      soundEnabled: true,
      fontSize: 'medium',
      colorTheme: 'default'
    }
  },
  currentModule: null,
  isLoading: false,
  error: null
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          preferences: { ...state.user.preferences, ...action.payload }
        } : null
      };
    
    case 'ADD_BADGE':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          badges: [...state.user.badges, action.payload]
        } : null
      };
    
    case 'UPDATE_PROGRESS':
      const updatedProgress = state.user?.progress.filter(p => p.moduleId !== action.payload.moduleId) || [];
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          progress: [...updatedProgress, action.payload]
        } : null
      };
    
    case 'SET_MODULE':
      return { ...state, currentModule: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
