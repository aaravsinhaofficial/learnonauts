import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, Target, Zap, Brain, Trophy, Medal, Crown } from 'lucide-react';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: {
    type: 'score' | 'completion' | 'streak' | 'perfect';
    threshold: number;
    module?: string;
  };
  earned: boolean;
  earnedAt?: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'bronze' | 'silver' | 'gold' | 'diamond';
  earned: boolean;
}

interface BadgeSystemProps {
  completedModules: string[];
  scores: Record<string, number>;
  children: React.ReactNode;
}

export function BadgeSystem({ completedModules, scores, children }: BadgeSystemProps) {
  const [badges, setBadges] = useState<Badge[]>([
    {
      id: 'first-steps',
      name: 'First Steps',
      description: 'Complete your first AI module!',
      icon: '👶',
      color: 'bg-green-500',
      requirement: { type: 'completion', threshold: 1 },
      earned: false
    },
    {
      id: 'lab-scientist',
      name: 'Lab Scientist',
      description: 'Score 90% or higher in the AI Training Lab',
      icon: '🧪',
      color: 'bg-blue-500',
      requirement: { type: 'score', threshold: 90, module: 'training-lab' },
      earned: false
    },
    {
      id: 'pattern-detective',
      name: 'Pattern Detective',
      description: 'Score 90% or higher in Clustering',
      icon: '🔍',
      color: 'bg-purple-500',
      requirement: { type: 'score', threshold: 90, module: 'clustering' },
      earned: false
    },
    {
      id: 'prediction-master',
      name: 'Prediction Master',
      description: 'Score 90% or higher in Regression',
      icon: '📈',
      color: 'bg-green-500',
      requirement: { type: 'score', threshold: 90, module: 'regression' },
      earned: false
    },
    {
      id: 'neural-explorer',
      name: 'Neural Explorer',
      description: 'Complete the Neural Network simulation',
      icon: '⚡',
      color: 'bg-red-500',
      requirement: { type: 'completion', threshold: 1, module: 'neural-network' },
      earned: false
    },
    {
      id: 'ai-scholar',
      name: 'AI Scholar',
      description: 'Complete all learning modules',
      icon: '🎓',
      color: 'bg-yellow-500',
      requirement: { type: 'completion', threshold: 4 },
      earned: false
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Score 100% in any module',
      icon: '💎',
      color: 'bg-gradient-to-r from-purple-400 to-pink-400',
      requirement: { type: 'perfect', threshold: 100 },
      earned: false
    }
  ]);

  const [recentBadge, setRecentBadge] = useState<Badge | null>(null);

  // Check for new badges
  useEffect(() => {
    setBadges(currentBadges => {
      return currentBadges.map(badge => {
        if (badge.earned) return badge;

        let shouldEarn = false;

        switch (badge.requirement.type) {
          case 'completion':
            if (badge.requirement.module) {
              shouldEarn = completedModules.includes(badge.requirement.module);
            } else {
              shouldEarn = completedModules.length >= badge.requirement.threshold;
            }
            break;
          case 'score':
            if (badge.requirement.module && scores[badge.requirement.module]) {
              shouldEarn = scores[badge.requirement.module] >= badge.requirement.threshold;
            }
            break;
          case 'perfect':
            shouldEarn = Object.values(scores).some(score => score === 100);
            break;
        }

        if (shouldEarn && !badge.earned) {
          const newBadge = { ...badge, earned: true, earnedAt: new Date() };
          setRecentBadge(newBadge);
          // Clear the notification after 4 seconds
          setTimeout(() => setRecentBadge(null), 4000);
          return newBadge;
        }

        return badge;
      });
    });
  }, [completedModules, scores]);

  const earnedBadges = badges.filter(b => b.earned);
  const totalPoints = earnedBadges.length * 10;

  return (
    <div className="relative">
      {children}

      {/* Badge Notification */}
      <AnimatePresence>
        {recentBadge && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-6 right-6 z-50 bg-white rounded-xl shadow-2xl p-6 max-w-sm border-2 border-yellow-400"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-4xl mb-2"
              >
                🎉
              </motion.div>
              <h3 className="font-bold text-lg text-gray-800 mb-1">Badge Earned!</h3>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">{recentBadge.icon}</span>
                <span className="font-semibold text-gray-700">{recentBadge.name}</span>
              </div>
              <p className="text-sm text-gray-600">{recentBadge.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Badge Counter */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-6 left-6 z-40 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-4 py-2 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <Trophy size={20} />
          <span className="font-bold">{earnedBadges.length}/{badges.length}</span>
        </div>
      </motion.div>
    </div>
  );
}

// Separate component for viewing all badges
interface BadgeCollectionProps {
  badges: Badge[];
  onClose: () => void;
}

export function BadgeCollection({ badges, onClose }: BadgeCollectionProps) {
  const earnedBadges = badges.filter(b => b.earned);
  const unearned = badges.filter(b => !b.earned);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Trophy size={28} />
              Your Badge Collection
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg"
            >
              ✕
            </button>
          </div>
          <p className="text-purple-100 mt-2">
            You've earned {earnedBadges.length} out of {badges.length} badges! Keep learning to unlock more! 🌟
          </p>
        </div>

        <div className="p-6">
          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="text-yellow-500" size={24} />
                Earned Badges ({earnedBadges.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {earnedBadges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4 text-center"
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <h4 className="font-bold text-gray-800 mb-1">{badge.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                    {badge.earnedAt && (
                      <p className="text-xs text-gray-500">
                        Earned {badge.earnedAt.toLocaleDateString()}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Badges */}
          {unearned.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="text-gray-500" size={24} />
                Locked Badges ({unearned.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unearned.map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-center opacity-60"
                  >
                    <div className="text-3xl mb-2 filter grayscale">🔒</div>
                    <h4 className="font-bold text-gray-600 mb-1">{badge.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{badge.description}</p>
                    <div className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-1 inline-block">
                      Keep learning to unlock!
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
