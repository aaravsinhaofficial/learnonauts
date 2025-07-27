import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface FocusTimerProps {
  visible: boolean;
  onComplete?: () => void;
}

export function FocusTimer({ visible, onComplete }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'short-break' | 'long-break'>('focus');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const sessionTimes = {
    focus: 25 * 60,
    'short-break': 5 * 60,
    'long-break': 15 * 60
  };

  useEffect(() => {
    let interval: number;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    if (sessionType === 'focus') {
      setSessionsCompleted(prev => prev + 1);
      const nextSession = (sessionsCompleted + 1) % 4 === 0 ? 'long-break' : 'short-break';
      setSessionType(nextSession);
      setTimeLeft(sessionTimes[nextSession]);
      if (onComplete) onComplete();
    } else {
      setSessionType('focus');
      setTimeLeft(sessionTimes.focus);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(sessionTimes[sessionType]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case 'focus': return '#3b82f6';
      case 'short-break': return '#10b981';
      case 'long-break': return '#8b5cf6';
      default: return '#3b82f6';
    }
  };

  const getSessionEmoji = () => {
    switch (sessionType) {
      case 'focus': return '🎯';
      case 'short-break': return '☕';
      case 'long-break': return '🌟';
      default: return '🎯';
    }
  };

  const getSessionTitle = () => {
    switch (sessionType) {
      case 'focus': return 'Focus Time';
      case 'short-break': return 'Short Break';
      case 'long-break': return 'Long Break';
      default: return 'Focus Time';
    }
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        minWidth: '200px',
        zIndex: 30
      }}
    >
      {/* Session Type Indicator */}
      <div style={{
        textAlign: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          {getSessionEmoji()}
        </div>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: getSessionColor()
        }}>
          {getSessionTitle()}
        </div>
      </div>

      {/* Timer Display */}
      <div style={{
        textAlign: 'center',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#111827',
          fontFamily: 'monospace'
        }}>
          {formatTime(timeLeft)}
        </div>
        
        {/* Progress Circle */}
        <div style={{
          position: 'relative',
          width: '60px',
          height: '60px',
          margin: '1rem auto'
        }}>
          <svg
            width="60"
            height="60"
            style={{ transform: 'rotate(-90deg)' }}
          >
            <circle
              cx="30"
              cy="30"
              r="25"
              stroke="#e5e7eb"
              strokeWidth="4"
              fill="none"
            />
            <motion.circle
              cx="30"
              cy="30"
              r="25"
              stroke={getSessionColor()}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 25}`}
              strokeDashoffset={`${2 * Math.PI * 25 * (1 - (sessionTimes[sessionType] - timeLeft) / sessionTimes[sessionType])}`}
              transition={{ duration: 0.5 }}
            />
          </svg>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <button
          onClick={toggleTimer}
          style={{
            padding: '0.5rem',
            backgroundColor: getSessionColor(),
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
        </button>
        
        <button
          onClick={resetTimer}
          style={{
            padding: '0.5rem',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Session Counter */}
      <div style={{
        textAlign: 'center',
        fontSize: '0.75rem',
        color: '#6b7280'
      }}>
        Sessions completed: {sessionsCompleted}
      </div>

      {/* Preset buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        marginTop: '1rem'
      }}>
        {Object.entries(sessionTimes).map(([type, time]) => (
          <button
            key={type}
            onClick={() => {
              setSessionType(type as any);
              setTimeLeft(time);
              setIsRunning(false);
            }}
            style={{
              padding: '0.5rem',
              fontSize: '0.75rem',
              backgroundColor: sessionType === type ? getSessionColor() : '#f3f4f6',
              color: sessionType === type ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {type.replace('-', ' ')}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
