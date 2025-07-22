// Core types for the Learnonauts platform

export interface User {
  id: string;
  name: string;
  avatar?: string;
  badges: Badge[];
  progress: ModuleProgress[];
  preferences: UserPreferences;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'classification' | 'regression' | 'clustering' | 'neural-networks' | 'general';
}

export interface ModuleProgress {
  moduleId: string;
  completed: boolean;
  score: number;
  timeSpent: number;
  lastAccessed: Date;
}

export interface UserPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  soundEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorTheme: 'default' | 'warm' | 'cool';
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  prerequisites: string[];
  activities: Activity[];
}

export interface Activity {
  id: string;
  type: 'drag-drop' | 'quiz' | 'simulation' | 'game';
  title: string;
  instructions: string;
  content: any;
  maxScore: number;
}

export interface DragDropItem {
  id: string;
  content: string;
  category: string;
  position: { x: number; y: number };
  isCorrect?: boolean;
}

export interface DropZone {
  id: string;
  label: string;
  acceptedCategories: string[];
  items: DragDropItem[];
}

export interface ClassificationData {
  items: DragDropItem[];
  zones: DropZone[];
  feedback: string;
}

export interface RegressionData {
  points: { x: number; y: number }[];
  userLine?: { slope: number; intercept: number };
  targetLine: { slope: number; intercept: number };
}

export interface NeuralNode {
  id: string;
  layer: number;
  value: number;
  position: { x: number; y: number };
  activation: 'relu' | 'sigmoid' | 'linear';
}

export interface NeuralConnection {
  from: string;
  to: string;
  weight: number;
  active: boolean;
}
