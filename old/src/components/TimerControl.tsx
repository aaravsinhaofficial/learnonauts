import React, { useState, useEffect, useRef } from 'react';
import type { AccessibilitySettings } from './AccessibilityPanel';

interface TimerControlProps {
  settings: AccessibilitySettings;
  durationMinutes?: number;
  onComplete?: () => void;
  onTimerStart?: () => void;
  onTimerPause?: () => void;
  autoStart?: boolean;
}

export const TimerControl: React.FC<TimerControlProps> = ({
  settings,
  durationMinutes = 25,
  onComplete,
  onTimerStart,
  onTimerPause,
  autoStart = false
}) => {
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showVisualTimer, setShowVisualTimer] = useState(true);
  const timerRef = useRef<number | null>(null);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progressPercentage = ((durationMinutes * 60 - timeRemaining) / (durationMinutes * 60)) * 100;
  
  // Determine color based on time remaining
  const getTimerColor = () => {
    if (timeRemaining > durationMinutes * 60 * 0.66) return '#10b981'; // Green
    if (timeRemaining > durationMinutes * 60 * 0.33) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  // Start timer
  const startTimer = () => {
    if (!isRunning && !isComplete) {
      setIsRunning(true);
      if (onTimerStart) onTimerStart();
    }
  };
  
  // Pause timer
  const pauseTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      if (onTimerPause) onTimerPause();
    }
  };
  
  // Reset timer
  const resetTimer = () => {
    pauseTimer();
    setTimeRemaining(durationMinutes * 60);
    setIsComplete(false);
  };
  
  // Add time
  const addTime = (minutes: number) => {
    setTimeRemaining(prev => prev + minutes * 60);
  };
  
  // Reduce time
  const reduceTime = (minutes: number) => {
    setTimeRemaining(prev => Math.max(prev - minutes * 60, 0));
  };
  
  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(prev => !prev);
  };
  
  // Toggle visual timer
  const toggleVisualTimer = () => {
    setShowVisualTimer(prev => !prev);
  };

  // Timer effect
  useEffect(() => {
    if (isRunning && !isComplete) {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsComplete(true);
            if (onComplete) onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isComplete, onComplete]);

  // Apply accessibility settings
  useEffect(() => {
    // Hide if timers are disabled in settings
    if (!settings.visibleTimers) {
      setShowVisualTimer(false);
    }
    
    // Reset visibility based on settings changes
    if (settings.visibleTimers) {
      setShowVisualTimer(true);
    }
    
    // Simplify UI in simplified mode
    if (settings.simplifiedUI) {
      setShowControls(false);
    }
  }, [settings.visibleTimers, settings.simplifiedUI]);

  // Container styles
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    right: '20px',
    bottom: '80px',
    zIndex: 100,
    backgroundColor: settings.darkMode ? '#1e293b' : '#ffffff',
    borderRadius: '12px',
    padding: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid',
    borderColor: settings.darkMode ? '#334155' : '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: showControls ? '200px' : '100px',
    transition: settings.reducedMotion ? 'none' : 'all 0.3s ease'
  };
  
  // Timer display styles
  const timerDisplayStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '600',
    color: settings.darkMode ? '#f1f5f9' : '#1e293b',
    marginBottom: '8px',
    fontFamily: settings.colorTheme === 'dyslexia-friendly' 
      ? 'OpenDyslexic, sans-serif' 
      : 'system-ui, sans-serif'
  };
  
  // Progress bar container styles
  const progressContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '8px',
    backgroundColor: settings.darkMode ? '#334155' : '#e2e8f0',
    borderRadius: '4px',
    marginBottom: '12px',
    overflow: 'hidden'
  };
  
  // Progress bar styles
  const progressBarStyle: React.CSSProperties = {
    height: '100%',
    width: `${progressPercentage}%`,
    backgroundColor: getTimerColor(),
    borderRadius: '4px',
    transition: settings.reducedMotion ? 'none' : 'width 1s linear'
  };
  
  // Button container styles
  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  };
  
  // Control button styles
  const controlButtonStyle: React.CSSProperties = {
    backgroundColor: settings.darkMode ? '#334155' : '#f1f5f9',
    color: settings.darkMode ? '#f1f5f9' : '#1e293b',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  
  // Toggle button styles
  const toggleButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: settings.darkMode ? '#94a3b8' : '#64748b',
    border: 'none',
    padding: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // Skip rendering if timers are not enabled in settings
  if (!settings.focusSessions) {
    return null;
  }

  return (
    <div style={containerStyle} className="timer-control">
      {showVisualTimer && (
        <>
          <div style={timerDisplayStyle}>
            {formatTime(timeRemaining)}
          </div>
          <div style={progressContainerStyle}>
            <div style={progressBarStyle}></div>
          </div>
        </>
      )}
      
      {showControls && (
        <div style={buttonContainerStyle}>
          {!isRunning ? (
            <button style={controlButtonStyle} onClick={startTimer} disabled={isComplete}>
              ▶️ Start
            </button>
          ) : (
            <button style={controlButtonStyle} onClick={pauseTimer}>
              ⏸️ Pause
            </button>
          )}
          
          <button style={controlButtonStyle} onClick={resetTimer}>
            🔄 Reset
          </button>
          
          <button style={controlButtonStyle} onClick={() => addTime(5)}>
            +5min
          </button>
          
          <button style={controlButtonStyle} onClick={() => reduceTime(5)}>
            -5min
          </button>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button style={toggleButtonStyle} onClick={toggleControls}>
          {showControls ? '⬆️ Hide' : '⬇️ Controls'}
        </button>
        
        <button style={toggleButtonStyle} onClick={toggleVisualTimer}>
          {showVisualTimer ? '🕒 Hide' : '🕒 Show'}
        </button>
      </div>
    </div>
  );
};
