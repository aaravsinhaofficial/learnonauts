import React, { useState, useEffect } from 'react';
import type { AccessibilitySettings } from './AccessibilityPanel';

interface Step {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface TaskSequencerProps {
  steps: Step[];
  settings: AccessibilitySettings;
  onStepComplete: (stepId: string) => void;
  onAllComplete?: () => void;
}

export const TaskSequencer: React.FC<TaskSequencerProps> = ({
  steps,
  settings,
  onStepComplete,
  onAllComplete
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  
  // Check if all steps are completed
  useEffect(() => {
    if (steps.every(step => step.completed) && onAllComplete) {
      onAllComplete();
    }
  }, [steps, onAllComplete]);

  // Auto-expand the active step based on settings
  useEffect(() => {
    if (settings.distractionReduction) {
      // In distraction reduction mode, only show the current step
      const newExpandedSteps: Record<string, boolean> = {};
      steps.forEach((step, index) => {
        newExpandedSteps[step.id] = index === activeStepIndex;
      });
      setExpandedSteps(newExpandedSteps);
    } else {
      // Otherwise, expand all steps
      const newExpandedSteps: Record<string, boolean> = {};
      steps.forEach(step => {
        newExpandedSteps[step.id] = true;
      });
      setExpandedSteps(newExpandedSteps);
    }
  }, [activeStepIndex, settings.distractionReduction, steps]);

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const markStepComplete = (stepId: string) => {
    onStepComplete(stepId);
    
    // Move to the next incomplete step if available
    const nextIncompleteIndex = steps.findIndex((step, index) => index > activeStepIndex && !step.completed);
    if (nextIncompleteIndex !== -1) {
      setActiveStepIndex(nextIncompleteIndex);
    }
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: settings.darkMode ? '#1e293b' : '#f8fafc',
    borderRadius: '0.75rem',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '1.5rem',
    border: settings.enhancedFocusOutlines ? '2px solid #3b82f6' : '1px solid #e2e8f0'
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: settings.darkMode ? '#f1f5f9' : '#1e293b',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const stepListStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  };

  const stepItemStyle = (isActive: boolean, isCompleted: boolean): React.CSSProperties => ({
    padding: '0.75rem',
    marginBottom: '0.75rem',
    borderRadius: '0.5rem',
    border: `1px solid ${isActive ? '#3b82f6' : isCompleted ? '#10b981' : '#e2e8f0'}`,
    backgroundColor: isActive 
      ? (settings.darkMode ? '#1e40af' : '#eff6ff') 
      : isCompleted 
        ? (settings.darkMode ? '#064e3b' : '#ecfdf5')
        : (settings.darkMode ? '#334155' : '#ffffff'),
    cursor: 'pointer',
    transition: settings.reducedMotion ? 'none' : 'all 0.2s'
  });

  const stepTitleStyle = (isCompleted: boolean): React.CSSProperties => ({
    fontSize: '1rem',
    fontWeight: '500',
    color: settings.darkMode 
      ? (isCompleted ? '#a7f3d0' : '#f1f5f9') 
      : (isCompleted ? '#059669' : '#1e293b'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem'
  });

  const stepDescriptionStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: settings.darkMode ? '#cbd5e1' : '#64748b',
    marginTop: '0.5rem',
    lineHeight: '1.5'
  };

  const buttonStyle = (isCompleted: boolean): React.CSSProperties => ({
    backgroundColor: isCompleted ? '#10b981' : '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.375rem 0.75rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: isCompleted ? 'default' : 'pointer',
    opacity: isCompleted ? 0.7 : 1
  });

  return (
    <div style={containerStyle}>
      <h3 style={headingStyle}>
        <span>📋</span> Task Sequence
      </h3>
      <ul style={stepListStyle}>
        {steps.map((step, index) => {
          const isActive = index === activeStepIndex;
          const isExpanded = expandedSteps[step.id] || false;
          
          return (
            <li 
              key={step.id} 
              style={stepItemStyle(isActive, step.completed)}
              onClick={() => toggleStep(step.id)}
            >
              <div style={stepTitleStyle(step.completed)}>
                <span>
                  {step.completed ? '✅ ' : `${index + 1}. `}
                  {step.title}
                </span>
                <button
                  style={buttonStyle(step.completed)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!step.completed) {
                      markStepComplete(step.id);
                    }
                  }}
                  disabled={step.completed}
                >
                  {step.completed ? 'Completed' : 'Mark Complete'}
                </button>
              </div>
              {isExpanded && (
                <div style={stepDescriptionStyle}>
                  {step.description}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
