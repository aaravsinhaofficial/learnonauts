import { motion } from 'framer-motion';
import { CheckCircle, Circle, Star } from 'lucide-react';

interface ProgressTrackerProps {
  completedModules: string[];
  scores: Record<string, number>;
  className?: string;
}

const modules = [
  { id: 'introduction', name: 'AI Introduction', icon: '📘', color: 'indigo' },
  { id: 'clustering', name: 'Pattern Detective', icon: '🔍', color: 'purple' },
  { id: 'regression', name: 'Prediction Explorer', icon: '📈', color: 'green' },
  { id: 'neural-network', name: 'Neural Network Lab', icon: '⚡', color: 'red' },
  { id: 'training-lab', name: 'AI Training Lab', icon: '🤖', color: 'teal' },
  { id: 'image-classifier', name: 'Image Classifier', icon: '🖼️', color: 'rose' }
];

export function ProgressTracker({ completedModules, scores, className = '' }: ProgressTrackerProps) {
  const progress = (completedModules.length / modules.length) * 100;
  const averageScore = completedModules.length > 0 
    ? Math.round(completedModules.reduce((sum, moduleId) => sum + (scores[moduleId] || 0), 0) / completedModules.length)
    : 0;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem'
    }} className={className}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '700', 
          color: '#1f2937', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          margin: 0
        }}>
          <Star style={{ color: '#eab308' }} size={24} />
          Your Learning Journey
        </h3>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>Progress</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563eb' }}>{Math.round(progress)}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ 
          width: '100%', 
          backgroundColor: '#e5e7eb', 
          borderRadius: '9999px', 
          height: '0.75rem' 
        }}>
          <motion.div
            style={{
              background: 'linear-gradient(to right, #3b82f6, #7c3aed)',
              height: '0.75rem',
              borderRadius: '9999px'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '0.5rem', 
          fontSize: '0.875rem', 
          color: '#4b5563' 
        }}>
          <span>Getting Started</span>
          <span>AI Expert!</span>
        </div>
      </div>

      {/* Module List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {modules.map((module, index) => {
          const isCompleted = completedModules.includes(module.id);
          const score = scores[module.id];
          
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: isCompleted ? '#f0fdf4' : '#f9fafb',
                border: isCompleted ? '1px solid #bbf7d0' : 'none',
                transition: 'colors 0.2s'
              }}
            >
              <div style={{ flexShrink: 0 }}>
                {isCompleted ? (
                  <CheckCircle style={{ color: '#10b981' }} size={24} />
                ) : (
                  <Circle style={{ color: '#9ca3af' }} size={24} />
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.125rem' }}>{module.icon}</span>
                  <span style={{ 
                    fontWeight: '500', 
                    color: isCompleted ? '#166534' : '#374151'
                  }}>
                    {module.name}
                  </span>
                </div>
                {isCompleted && score && (
                  <div style={{ fontSize: '0.875rem', color: '#059669' }}>
                    Best Score: {score}%
                    {score >= 90 && <span style={{ marginLeft: '0.5rem' }}>🌟</span>}
                    {score === 100 && <span style={{ marginLeft: '0.25rem' }}>✨</span>}
                  </div>
                )}
              </div>
              
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ color: '#10b981' }}
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
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1rem', 
            textAlign: 'center' 
          }}>
            <div style={{ 
              backgroundColor: '#eff6ff', 
              borderRadius: '0.5rem', 
              padding: '0.75rem' 
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#2563eb' 
              }}>
                {completedModules.length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                Modules Completed
              </div>
            </div>
            <div style={{ 
              backgroundColor: '#faf5ff', 
              borderRadius: '0.5rem', 
              padding: '0.75rem' 
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#7c3aed' 
              }}>
                {averageScore}%
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b21a8' }}>
                Average Score
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Encouragement Message */}
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        {completedModules.length === 0 && (
          <p style={{ color: '#4b5563', fontSize: '0.875rem', margin: 0 }}>
            🚀 Ready to start your AI adventure? Pick your first module above!
          </p>
        )}
        {completedModules.length > 0 && completedModules.length < modules.length && (
          <p style={{ color: '#2563eb', fontSize: '0.875rem', margin: 0 }}>
            🎉 Great progress! Keep going to become an AI expert!
          </p>
        )}
        {completedModules.length === modules.length && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎓</div>
            <p style={{ color: '#059669', fontWeight: '500', margin: 0 }}>
              Congratulations! You've mastered all AI modules!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
