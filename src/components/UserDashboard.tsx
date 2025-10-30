import { useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Calendar, Clock, LogOut, Settings, Star, Target, TrendingUp, Trophy, User, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'overview' | 'progress' | 'achievements' | 'settings';

const tabs: Array<{ id: TabId; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const statCards = (data: {
  completedModules: number;
  overallScore: number;
  timeSpent: string;
  achievements: number;
}) => [
  { label: 'Modules Completed', value: data.completedModules, accent: '#3b82f6' },
  { label: 'Overall Score', value: `${data.overallScore}%`, accent: '#22c55e' },
  { label: 'Time Spent', value: data.timeSpent, accent: '#8b5cf6' },
  { label: 'Achievements', value: data.achievements, accent: '#f97316' }
];

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '1rem',
  padding: '1.5rem',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)'
} as const;

export function UserDashboard({ isOpen, onClose }: UserDashboardProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  if (!user || !isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  const ALL_MODULE_IDS = [
    'introduction',
    'classification',
    'clustering',
    'regression',
    'neural-network',
    'training-lab',
    'image-classifier'
  ];

  const progressData = user.progress ?? {
    totalModulesCompleted: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: new Date(),
    moduleProgress: {}
  };
  const moduleProgressEntries = Object.entries(progressData.moduleProgress ?? {});
  const achievements = user.achievements ?? [];

  const completedModules = ALL_MODULE_IDS.filter((id) => progressData.moduleProgress?.[id]?.completed);
  const totalModules = ALL_MODULE_IDS.length;
  const progressPercentage = totalModules
    ? Math.round((completedModules.length / totalModules) * 100)
    : 0;

  const toDisplayDate = (value: unknown): string => {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value as any);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
  };

  const overviewContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem'
        }}
      >
        {statCards({
          completedModules: completedModules.length,
          overallScore: progressData.overallScore ?? 0,
          timeSpent: formatTime(progressData.totalTimeSpent ?? 0),
          achievements: achievements.length
        }).map(({ label, value, accent }) => (
          <div
            key={label}
            style={{
              borderRadius: '0.9rem',
              padding: '1.25rem',
              textAlign: 'center',
              backgroundColor: `${accent}12`,
              border: `1px solid ${accent}33`
            }}
          >
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: accent }}>{value}</div>
            <div style={{ marginTop: '0.35rem', fontSize: '0.9rem', color: accent }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Progress Overview */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>Learning Progress</h3>
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>{progressPercentage}% complete</span>
        </div>
        <div style={{ width: '100%', height: '0.75rem', backgroundColor: '#e5e7eb', borderRadius: '9999px', marginBottom: '1.25rem' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: '9999px',
              background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)'
            }}
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem'
          }}
        >
          {moduleProgressEntries.map(([moduleId, progress]) => (
            <div
              key={moduleId}
              style={{
                borderRadius: '0.9rem',
                backgroundColor: '#f8fafc',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '9999px',
                    backgroundColor: progress.completed ? '#22c55e' : '#9ca3af',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600
                  }}
                  aria-hidden
                >
                  {progress.completed ? '✓' : moduleId[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, textTransform: 'capitalize', color: '#1f2937' }}>
                    {moduleId.replace('-', ' ')}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                    Best: {progress.bestScore}% • {progress.attempts} attempts
                  </div>
                </div>
              </div>
              {progress.completed && <Star size={18} style={{ color: '#f59e0b' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={cardStyle}>
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', marginBottom: '1rem' }}>
          Recent Activity
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {moduleProgressEntries
            .sort(([, a], [, b]) => new Date(b.lastAttemptAt ?? '').getTime() - new Date(a.lastAttemptAt ?? '').getTime())
            .slice(0, 3)
            .map(([moduleId, progress]) => (
              <div
                key={moduleId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  padding: '0.85rem',
                  borderRadius: '0.75rem'
                }}
              >
                <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', backgroundColor: '#3b82f6' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#111827', textTransform: 'capitalize' }}>
                    {moduleId.replace('-', ' ')}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                    {toDisplayDate(progress.lastAttemptAt)} • Score: {progress.bestScore ?? 0}%
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const progressContent = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
      {moduleProgressEntries.map(([moduleId, progress]) => (
        <div key={moduleId} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'capitalize', fontWeight: 600 }}>
              {progress.completed && <Star size={18} style={{ color: '#f59e0b' }} />}
              {moduleId.replace('-', ' ')}
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.35rem 0.6rem',
                borderRadius: '9999px',
                backgroundColor: progress.completed ? '#dcfce7' : '#f3f4f6',
                color: progress.completed ? '#166534' : '#4b5563'
              }}
            >
              {progress.completed ? 'Completed' : 'In Progress'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#374151' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Best Score</span>
            <strong>{progress.bestScore ?? 0}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Average Score</span>
            <strong>{progress.averageScore ?? 0}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Attempts</span>
            <strong>{progress.attempts ?? 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Last Attempt</span>
              <strong>{toDisplayDate(progress.lastAttemptAt)}</strong>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const achievementsContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'stretch' }}>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#1f2937' }}>Your Achievements</h3>
        <p style={{ marginTop: '0.5rem', color: '#4b5563' }}>
          You&apos;ve unlocked {achievements.length} achievement{achievements.length === 1 ? '' : 's'}!
        </p>
      </div>

      {achievements.length === 0 ? (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            <Trophy size={48} style={{ marginBottom: '1rem', color: '#d1d5db' }} />
            <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No achievements yet</h4>
            <p style={{ fontSize: '0.95rem' }}>
              Keep exploring modules and completing challenges to start earning shiny trophies!
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}
        >
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                borderRadius: '1rem',
                padding: '1.25rem',
                background: 'linear-gradient(145deg, #fef3c7, #fde68a)',
                border: '1px solid #facc15',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
              <h4 style={{ margin: 0, fontWeight: 700, textTransform: 'capitalize', color: '#7c2d12' }}>
                {achievement.id.replace('-', ' ')}
              </h4>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#92400e' }}>
                Unlocked on {toDisplayDate(achievement.unlockedAt)}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const settingsContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={cardStyle}>
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', marginBottom: '1rem' }}>
          Account Information
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.95rem', color: '#374151' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Display Name</span>
            <strong>{user.displayName}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Username</span>
            <strong>@{user.username}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Member Since</span>
            <strong>{toDisplayDate(user.createdAt)}</strong>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', marginBottom: '1rem' }}>
          Learning Stats
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#4b5563', fontSize: '0.95rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Target size={20} style={{ color: '#7c3aed' }} />
            <span>XP today: {progressData.xpToday ?? 0} / {progressData.dailyGoal ?? 30} xp goal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={20} style={{ color: '#2563eb' }} />
            <span>Total XP earned: {progressData.xp ?? 0}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User size={20} style={{ color: '#16a34a' }} />
            <span>
              Hearts: {progressData.hearts ?? progressData.maxHearts ?? 5} / {progressData.maxHearts ?? 5} available
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<TabId, ReactNode> = {
    overview: overviewContent,
    progress: progressContent,
    achievements: achievementsContent,
    settings: settingsContent
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          style={{
            width: '100%',
            maxWidth: '58rem',
            maxHeight: '92vh',
            backgroundColor: 'white',
            borderRadius: '1.25rem',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(120deg, #7c3aed, #3b82f6)',
              color: 'white',
              padding: '1.25rem 1.75rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '4.25rem',
                    height: '4.25rem',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem'
                  }}
                  aria-hidden
                >
                  {user.avatar || '🚀'}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>{user.displayName}</h2>
                  <p style={{ margin: '0.25rem 0 0', color: 'rgba(191, 219, 254, 0.9)' }}>@{user.username}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={16} />
                      Joined {toDisplayDate(user.createdAt)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Zap size={16} />
                      {user.progress.currentStreak} day streak
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.35)',
                    backgroundColor: 'transparent',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
                <button
                  onClick={onClose}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'white',
                    fontSize: '1.35rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                  aria-label="Close profile"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Tab navigation */}
          <nav
            style={{
              display: 'flex',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e5e7eb'
            }}
          >
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    flex: 1,
                    padding: '1rem 1.25rem',
                    border: 'none',
                    backgroundColor: active ? '#ffffff' : '#f8fafc',
                    color: active ? '#7c3aed' : '#4b5563',
                    borderBottom: `3px solid ${active ? '#7c3aed' : 'transparent'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s, color 0.2s'
                  }}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Tab content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              backgroundColor: '#f9fafb',
              padding: '1.75rem'
            }}
          >
            {tabContent[activeTab]}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default UserDashboard;
