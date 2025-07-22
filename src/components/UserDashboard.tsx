import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  Trophy, 
  BarChart3, 
  Calendar, 
  Target, 
  Clock,
  Zap,
  Award,
  TrendingUp,
  LogOut,
  ChevronDown,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserDashboard({ isOpen, onClose }: UserDashboardProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'achievements' | 'settings'>('overview');

  if (!user || !isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  const completedModules = Object.values(user.progress.moduleProgress).filter(p => p.completed);
  const totalModules = 4; // Total number of modules available
  const progressPercentage = (completedModules.length / totalModules) * 100;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: '56rem',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(to right, #7c3aed, #3b82f6)',
            color: 'white',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  {user.avatar || '🚀'}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{user.displayName}</h2>
                  <p style={{ color: 'rgba(147, 197, 253, 1)', margin: '0.25rem 0' }}>@{user.username}</p>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    marginTop: '0.5rem', 
                    fontSize: '0.875rem' 
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} />
                      Joined {user.createdAt.toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Zap size={14} />
                      {user.progress.currentStreak} day streak
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    color: 'white',
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={18} />
                  <span style={{ display: window.innerWidth >= 640 ? 'inline' : 'none' }}>Sign Out</span>
                </button>
                <button
                  onClick={onClose}
                  style={{
                    color: 'white',
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    fontSize: '1.25rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'progress', label: 'Progress', icon: TrendingUp },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 p-4 text-center font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === id
                    ? 'text-purple-600 bg-white border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{completedModules.length}</div>
                    <div className="text-sm text-blue-800">Modules Completed</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{user.progress.overallScore}%</div>
                    <div className="text-sm text-green-800">Overall Score</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{formatTime(user.progress.totalTimeSpent)}</div>
                    <div className="text-sm text-purple-800">Time Spent</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{user.achievements.length}</div>
                    <div className="text-sm text-orange-800">Achievements</div>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Learning Progress</h3>
                    <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(user.progress.moduleProgress).map(([moduleId, progress]) => (
                      <div key={moduleId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                            progress.completed ? 'bg-green-500' : 'bg-gray-400'
                          }`}>
                            {progress.completed ? '✓' : moduleId.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium capitalize">{moduleId.replace('-', ' ')}</div>
                            <div className="text-sm text-gray-600">
                              Best: {progress.bestScore}% • {progress.attempts} attempts
                            </div>
                          </div>
                        </div>
                        {progress.completed && <Star className="text-yellow-500" size={20} />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {Object.entries(user.progress.moduleProgress)
                      .sort(([,a], [,b]) => new Date(b.lastAttemptAt).getTime() - new Date(a.lastAttemptAt).getTime())
                      .slice(0, 3)
                      .map(([moduleId, progress]) => (
                        <div key={moduleId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <span className="font-medium">Completed {moduleId.replace('-', ' ')}</span>
                            <div className="text-sm text-gray-600">
                              {new Date(progress.lastAttemptAt).toLocaleDateString()} • Score: {progress.bestScore}%
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.entries(user.progress.moduleProgress).map(([moduleId, progress]) => (
                    <div key={moduleId} className="bg-white border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800 capitalize flex items-center gap-2">
                          {progress.completed && <Star className="text-yellow-500" size={18} />}
                          {moduleId.replace('-', ' ')}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          progress.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {progress.completed ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Best Score</span>
                          <span className="font-medium">{progress.bestScore}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Average Score</span>
                          <span className="font-medium">{progress.averageScore}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Attempts</span>
                          <span className="font-medium">{progress.attempts}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Time Spent</span>
                          <span className="font-medium">{formatTime(progress.timeSpent)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Perfect Scores</span>
                          <span className="font-medium">{progress.perfectScores}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Attempt</span>
                          <span className="font-medium">{new Date(progress.lastAttemptAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Achievements</h3>
                  <p className="text-gray-600">You've unlocked {user.achievements.length} achievement{user.achievements.length !== 1 ? 's' : ''}!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.achievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4 text-center"
                    >
                      <div className="text-3xl mb-2">🏆</div>
                      <h4 className="font-bold text-gray-800 mb-1 capitalize">{achievement.id.replace('-', ' ')}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Unlocked on {achievement.unlockedAt.toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {user.achievements.length === 0 && (
                  <div className="text-center py-8">
                    <Trophy className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No achievements yet</h3>
                    <p className="text-gray-500">Complete modules and reach milestones to unlock achievements!</p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Display Name</span>
                      <span className="font-medium">{user.displayName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Username</span>
                      <span className="font-medium">@{user.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-medium">{user.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Achievement Notifications</span>
                      <button className={`relative w-12 h-6 rounded-full transition-colors ${
                        user.preferences.notifications.achievements ? 'bg-purple-600' : 'bg-gray-300'
                      }`}>
                        <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                          user.preferences.notifications.achievements ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Daily Reminders</span>
                      <button className={`relative w-12 h-6 rounded-full transition-colors ${
                        user.preferences.notifications.dailyReminders ? 'bg-purple-600' : 'bg-gray-300'
                      }`}>
                        <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                          user.preferences.notifications.dailyReminders ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Weekly Progress Reports</span>
                      <button className={`relative w-12 h-6 rounded-full transition-colors ${
                        user.preferences.notifications.weeklyProgress ? 'bg-purple-600' : 'bg-gray-300'
                      }`}>
                        <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                          user.preferences.notifications.weeklyProgress ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
