import React from 'react';
import { AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { speakError } from '../utils/speechSynthesis';

interface AccessibilityAwareErrorProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  errorHandling?: 'standard' | 'gentle' | 'encouraging';
  soundEnabled?: boolean;
  autoSpeak?: boolean;
  onDismiss?: () => void;
}

export function AccessibilityAwareError({ 
  message, 
  errorHandling = 'standard',
  soundEnabled = false,
  autoSpeak = true,
  onDismiss 
}: AccessibilityAwareErrorProps) {
  
  // Speak error message automatically when component mounts
  React.useEffect(() => {
    if (autoSpeak && soundEnabled) {
      speakError(message, errorHandling);
    }
  }, [message, errorHandling, soundEnabled, autoSpeak]);

  // Get styling based on error handling preference
  const getErrorStyles = () => {
    const baseStyles = "rounded-lg p-4 border-l-4 mb-4 flex items-start gap-3";
    
    switch (errorHandling) {
      case 'gentle':
        return {
          container: `${baseStyles} bg-amber-50 border-amber-400 text-amber-800`,
          icon: 'text-amber-500',
          title: 'Let\'s try a different approach',
          prefix: 'It\'s okay! '
        };
      case 'encouraging':
        return {
          container: `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`,
          icon: 'text-blue-500',
          title: 'Great attempt!',
          prefix: 'You\'re doing well! Here\'s a hint: '
        };
      default:
        return {
          container: `${baseStyles} bg-red-50 border-red-400 text-red-800`,
          icon: 'text-red-500',
          title: 'Error',
          prefix: ''
        };
    }
  };

  const getIcon = () => {
    if (errorHandling === 'encouraging') return CheckCircle2;
    if (errorHandling === 'gentle') return Info;
    return AlertCircle;
  };

  const styles = getErrorStyles();
  const Icon = getIcon();

  return (
    <div className={styles.container} role="alert" aria-live="polite">
      <Icon className={styles.icon} size={20} />
      <div className="flex-1">
        <h4 className="font-medium mb-1">{styles.title}</h4>
        <p className="text-sm">
          {styles.prefix}{message}
        </p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="mt-2 text-xs underline opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

// Convenience hook for showing errors with accessibility support
export function useAccessibilityAwareError() {
  const [error, setError] = React.useState<{
    message: string;
    type?: 'error' | 'warning' | 'info';
  } | null>(null);

  const showError = React.useCallback((message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    setError({ message, type });
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    showError,
    clearError
  };
}
