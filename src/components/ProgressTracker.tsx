import { motion } from 'framer-motion';
import { CheckCircle, Circle, Star, Award } from 'lucide-react';

interface ProgressTrackerProps {
  completedModules: string[];
  scores: Record<string, number>;
  className?: string;
}

const modules = [
  { id: 'classification', name: 'Sorting Things', icon: '🎯', color: 'blue' },
  { id: 'clustering', name: 'Pattern Detective', icon: '🔍', color: 'purple' },
  { id: 'regression', name: 'Prediction Explorer', icon: '📈', color: 'green' },
  { id: 'neural-network', name: 'Neural Network Lab', icon: '⚡', color: 'red' }
];

export function ProgressTracker({ completedModules, scores, className = '' }: ProgressTrackerProps) {
  const progress = (completedModules.length / modules.length) * 100;
  const averageScore = completedModules.length > 0 
    ? Math.round(completedModules.reduce((sum, moduleId) => sum + (scores[moduleId] || 0), 0) / completedModules.length)
    : 0;

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Star className="text-yellow-500" size={24} />
          Your Learning Journey
        </h3>
        <div className="text-right">
          <div className="text-sm text-gray-600">Progress</div>
          <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Getting Started</span>
          <span>AI Expert!</span>
        </div>
      </div>

      {/* Module List */}
      <div className="space-y-3 mb-6">
        {modules.map((module, index) => {
          const isCompleted = completedModules.includes(module.id);
          const score = scores[module.id];
          
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isCompleted ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : (
                  <Circle className="text-gray-400" size={24} />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{module.icon}</span>
                  <span className={`font-medium ${isCompleted ? 'text-green-800' : 'text-gray-700'}`}>
                    {module.name}
                  </span>
                </div>
                {isCompleted && score && (
                  <div className="text-sm text-green-600">
                    Best Score: {score}%
                    {score >= 90 && <span className="ml-2">🌟</span>}
                    {score === 100 && <span className="ml-1">✨</span>}
                  </div>
                )}
              </div>
              
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-500"
                >
                  ✓
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Stats */}
      {completedModules.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{completedModules.length}</div>
              <div className="text-sm text-blue-800">Modules Completed</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600">{averageScore}%</div>
              <div className="text-sm text-purple-800">Average Score</div>
            </div>
          </div>
        </div>
      )}

      {/* Encouragement Message */}
      <div className="mt-4 text-center">
        {completedModules.length === 0 && (
          <p className="text-gray-600 text-sm">
            🚀 Ready to start your AI adventure? Pick your first module above!
          </p>
        )}
        {completedModules.length > 0 && completedModules.length < modules.length && (
          <p className="text-blue-600 text-sm">
            🎉 Great progress! Keep going to become an AI expert!
          </p>
        )}
        {completedModules.length === modules.length && (
          <div className="text-center">
            <div className="text-2xl mb-2">🎓</div>
            <p className="text-green-600 font-medium">
              Congratulations! You've mastered all AI modules!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
