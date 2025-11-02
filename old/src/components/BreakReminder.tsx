import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';

interface BreakReminderProps {
  enabled: boolean;
  interval: number; // minutes
  sensoryBreaks: boolean;
}

export function BreakReminder({ enabled, interval = 20, sensoryBreaks }: BreakReminderProps) {
  const [showReminder, setShowReminder] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(interval * 60); // seconds
  const [showSensoryBreak, setShowSensoryBreak] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setShowReminder(true);
          return interval * 60; // Reset timer
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [enabled, interval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBreakAccept = () => {
    setShowReminder(false);
    if (sensoryBreaks) {
      setShowSensoryBreak(true);
    }
  };

  const handleBreakSkip = () => {
    setShowReminder(false);
    setTimeRemaining(interval * 60);
  };

  const sensoryActivities = [
    {
      id: 'breathing',
      title: '🫁 Deep Breathing',
      description: 'Take 5 slow, deep breaths',
      color: 'bg-blue-100 border-blue-300',
      duration: 30
    },
    {
      id: 'stretch',
      title: '🤸 Quick Stretch',
      description: 'Stretch your arms and shoulders',
      color: 'bg-green-100 border-green-300',
      duration: 45
    },
    {
      id: 'hydrate',
      title: '💧 Hydration Break',
      description: 'Drink some water',
      color: 'bg-cyan-100 border-cyan-300',
      duration: 15
    },
    {
      id: 'eyes',
      title: '👀 Eye Rest',
      description: 'Look away from screen for 20 seconds',
      color: 'bg-purple-100 border-purple-300',
      duration: 20
    },
    {
      id: 'mindful',
      title: '🧘 Mindful Moment',
      description: 'Notice 3 things you can see, hear, and feel',
      color: 'bg-pink-100 border-pink-300',
      duration: 60
    }
  ];

  const [selectedActivity, setSelectedActivity] = useState(sensoryActivities[0]);
  const [activityTimer, setActivityTimer] = useState(0);
  const [activityInProgress, setActivityInProgress] = useState(false);

  const startActivity = (activity: typeof sensoryActivities[0]) => {
    setSelectedActivity(activity);
    setActivityTimer(activity.duration);
    setActivityInProgress(true);
  };

  useEffect(() => {
    if (activityInProgress && activityTimer > 0) {
      const timer = setTimeout(() => setActivityTimer(activityTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (activityTimer === 0 && activityInProgress) {
      setActivityInProgress(false);
      setShowSensoryBreak(false);
    }
  }, [activityTimer, activityInProgress]);

  return (
    <>
      {/* Timer Display (when enabled) */}
      {enabled && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          zIndex: 40
        }}>
          <Clock size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Next break: {formatTime(timeRemaining)}
        </div>
      )}

      {/* Break Reminder Modal */}
      <AnimatePresence>
        {showReminder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Time for a Break!
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                You've been learning for {interval} minutes. Taking breaks helps your brain process information better!
              </p>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleBreakSkip}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleBreakAccept}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Take Break
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sensory Break Activities */}
      <AnimatePresence>
        {showSensoryBreak && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              {!activityInProgress ? (
                <>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🌟</div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                    Choose a Calming Activity
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                    Pick an activity that feels good for you right now:
                  </p>
                  
                  <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                    {sensoryActivities.map((activity) => (
                      <button
                        key={activity.id}
                        onClick={() => startActivity(activity)}
                        style={{
                          padding: '1rem',
                          border: '2px solid',
                          borderRadius: '12px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        className={activity.color}
                      >
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                          {activity.title}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {activity.description} ({activity.duration}s)
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setShowSensoryBreak(false)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Skip Activities
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    {selectedActivity.id === 'breathing' ? '🫁' :
                     selectedActivity.id === 'stretch' ? '🤸' :
                     selectedActivity.id === 'hydrate' ? '💧' :
                     selectedActivity.id === 'eyes' ? '👀' : '🧘'}
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                    {selectedActivity.title}
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                    {selectedActivity.description}
                  </p>
                  
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: '700',
                    color: '#3b82f6',
                    marginBottom: '2rem'
                  }}>
                    {activityTimer}
                  </div>
                  
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <motion.div
                      style={{
                        height: '100%',
                        backgroundColor: '#3b82f6',
                        borderRadius: '4px'
                      }}
                      initial={{ width: '100%' }}
                      animate={{ width: `${(activityTimer / selectedActivity.duration) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  
                  <button
                    onClick={() => {
                      setActivityInProgress(false);
                      setShowSensoryBreak(false);
                    }}
                    style={{
                      marginTop: '2rem',
                      padding: '0.75rem 2rem',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Finish Early
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
