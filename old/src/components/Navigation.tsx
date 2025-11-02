import React from 'react';
import { Brain, Zap, Users, Settings, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

interface NavigationProps {
  currentModule: string | null;
  onModuleSelect: (moduleId: string) => void;
  onSettingsClick: () => void;
}

const modules = [
  {
    id: 'introduction',
    title: 'What is AI?',
    icon: Brain,
    description: 'Discover the magic of artificial intelligence',
    color: 'bg-purple-500'
  },
  {
    id: 'regression',
    title: 'Predicting Numbers',
    icon: Zap,
    description: 'Make predictions about the future',
    color: 'bg-green-500'
  },
  {
    id: 'clustering',
    title: 'Finding Patterns',
    icon: Users,
    description: 'Discover hidden groups and patterns',
    color: 'bg-orange-500'
  }
];

export function Navigation({ currentModule, onModuleSelect, onSettingsClick }: NavigationProps) {
  const { state } = useApp();
  const { user } = state;

  const getModuleProgress = (moduleId: string) => {
    return user?.progress.find(p => p.moduleId === moduleId);
  };

  return (
    <nav 
      className="bg-white shadow-lg border-r border-gray-200 w-80 h-screen flex flex-col"
      role="navigation" 
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Brain className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Learnonauts</h1>
            <p className="text-sm text-gray-600">AI Adventure Awaits!</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.name.charAt(0) || 'A'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.name}</p>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">Badges:</span>
              <span className="text-sm font-semibold text-purple-600">
                {user?.badges.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Modules</h2>
        {modules.map((module) => {
          const progress = getModuleProgress(module.id);
          const isActive = currentModule === module.id;
          const isCompleted = progress?.completed || false;
          const Icon = module.icon;

          return (
            <motion.button
              key={module.id}
              onClick={() => onModuleSelect(module.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 focus-ring ${
                isActive 
                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-pressed={isActive}
              aria-describedby={`${module.id}-description`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{module.title}</h3>
                    {isCompleted && (
                      <motion.div
                        className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                  <p id={`${module.id}-description`} className="text-sm text-gray-600 mt-1">
                    {module.description}
                  </p>
                  {progress && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{progress.score}% complete</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <motion.button
            onClick={onSettingsClick}
            className="flex-1 flex items-center justify-center space-x-2 p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus-ring"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </motion.button>
          <motion.button
            className="flex items-center justify-center p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus-ring"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
