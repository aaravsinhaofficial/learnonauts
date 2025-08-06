import React, { useState } from 'react';
import type { AccessibilitySettings } from '../components/AccessibilityPanel';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskBreakdownProps {
  settings: AccessibilitySettings;
  mainTask: string;
  suggestedSubTasks?: string[];
  onAllComplete?: () => void;
}

export const TaskBreakdown: React.FC<TaskBreakdownProps> = ({
  settings,
  mainTask,
  suggestedSubTasks = [],
  onAllComplete
}) => {
  const [subTasks, setSubTasks] = useState<SubTask[]>(
    suggestedSubTasks.map((task, index) => ({
      id: `task-${index}`,
      title: task,
      completed: false
    }))
  );
  
  const [newTaskText, setNewTaskText] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // Check if all tasks are completed
  const allCompleted = subTasks.length > 0 && subTasks.every(task => task.completed);

  // Toggle a task's completion status
  const toggleTask = (taskId: string) => {
    const updatedTasks = subTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setSubTasks(updatedTasks);
    
    // Call onAllComplete if all tasks are now completed
    if (updatedTasks.every(task => task.completed) && onAllComplete) {
      onAllComplete();
    }
  };

  // Add a new task
  const addTask = () => {
    if (newTaskText.trim()) {
      setSubTasks([
        ...subTasks,
        {
          id: `task-${Date.now()}`,
          title: newTaskText.trim(),
          completed: false
        }
      ]);
      setNewTaskText('');
    }
  };

  // Delete a task
  const deleteTask = (taskId: string) => {
    setSubTasks(subTasks.filter(task => task.id !== taskId));
  };

  // Move a task up in the list
  const moveTaskUp = (index: number) => {
    if (index === 0) return;
    const newTasks = [...subTasks];
    [newTasks[index], newTasks[index - 1]] = [newTasks[index - 1], newTasks[index]];
    setSubTasks(newTasks);
  };

  // Move a task down in the list
  const moveTaskDown = (index: number) => {
    if (index === subTasks.length - 1) return;
    const newTasks = [...subTasks];
    [newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]];
    setSubTasks(newTasks);
  };

  // Container styles
  const containerStyle: React.CSSProperties = {
    backgroundColor: settings.darkMode ? '#1e293b' : '#ffffff',
    borderRadius: '0.75rem',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '1.5rem',
    border: '1px solid',
    borderColor: settings.darkMode ? '#334155' : '#e2e8f0',
    maxWidth: '800px',
    margin: '0 auto'
  };

  // Header styles
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '1px solid',
    borderColor: settings.darkMode ? '#334155' : '#e2e8f0',
    paddingBottom: '0.5rem'
  };

  // Main task styles
  const mainTaskStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: settings.darkMode ? '#f1f5f9' : '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  // Toggle button styles
  const toggleButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: settings.darkMode ? '#94a3b8' : '#64748b',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.25rem'
  };

  // Task list styles
  const taskListStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: isExpanded ? 'block' : 'none'
  };

  // Task item styles
  const taskItemStyle = (isCompleted: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    borderRadius: '0.375rem',
    backgroundColor: isCompleted 
      ? (settings.darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)')
      : (settings.darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'),
    borderLeft: '3px solid',
    borderLeftColor: isCompleted ? '#10b981' : '#3b82f6'
  });

  // Checkbox styles
  const checkboxStyle = (isCompleted: boolean): React.CSSProperties => ({
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: '2px solid',
    borderColor: isCompleted ? '#10b981' : '#3b82f6',
    backgroundColor: isCompleted ? '#10b981' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '0.75rem',
    color: 'white',
    cursor: 'pointer',
    flexShrink: 0
  });

  // Task text styles
  const taskTextStyle = (isCompleted: boolean): React.CSSProperties => ({
    flex: 1,
    fontSize: '1rem',
    color: settings.darkMode ? '#f1f5f9' : '#1e293b',
    textDecoration: isCompleted ? 'line-through' : 'none',
    opacity: isCompleted ? 0.7 : 1
  });

  // Action button styles
  const actionButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: settings.darkMode ? '#94a3b8' : '#64748b',
    padding: '0.25rem',
    fontSize: '1rem',
    margin: '0 0.125rem'
  };

  // Action buttons container styles
  const actionButtonsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center'
  };

  // Input container styles
  const inputContainerStyle: React.CSSProperties = {
    display: isExpanded ? 'flex' : 'none',
    marginTop: '1rem',
    gap: '0.5rem'
  };

  // Input styles
  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid',
    borderColor: settings.darkMode ? '#334155' : '#d1d5db',
    backgroundColor: settings.darkMode ? '#1e293b' : '#ffffff',
    color: settings.darkMode ? '#f1f5f9' : '#1e293b',
    fontSize: '0.875rem'
  };

  // Add button styles
  const addButtonStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  };

  // Progress bar container styles
  const progressContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '6px',
    backgroundColor: settings.darkMode ? '#334155' : '#e2e8f0',
    borderRadius: '3px',
    marginTop: '1rem',
    marginBottom: '0.5rem',
    overflow: 'hidden',
    display: isExpanded ? 'block' : 'none'
  };

  // Progress bar styles
  const progressBarStyle: React.CSSProperties = {
    height: '100%',
    width: `${subTasks.length ? (subTasks.filter(t => t.completed).length / subTasks.length) * 100 : 0}%`,
    backgroundColor: '#10b981',
    borderRadius: '3px',
    transition: settings.reducedMotion ? 'none' : 'width 0.3s ease'
  };

  // Progress text styles
  const progressTextStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: settings.darkMode ? '#94a3b8' : '#64748b',
    textAlign: 'center',
    marginBottom: '1rem',
    display: isExpanded && subTasks.length > 0 ? 'block' : 'none'
  };

  // Don't render if task sequencing is disabled
  if (!settings.taskSequencing) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={mainTaskStyle}>
          <span>📋</span>
          <span>{mainTask}</span>
        </div>
        <button
          style={toggleButtonStyle}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse task breakdown' : 'Expand task breakdown'}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      <div style={progressContainerStyle}>
        <div style={progressBarStyle}></div>
      </div>

      <div style={progressTextStyle}>
        {subTasks.filter(t => t.completed).length} of {subTasks.length} completed
        {allCompleted && subTasks.length > 0 && ' ✅'}
      </div>

      <ul style={taskListStyle}>
        {subTasks.map((task, index) => (
          <li key={task.id} style={taskItemStyle(task.completed)}>
            <div
              style={checkboxStyle(task.completed)}
              onClick={() => toggleTask(task.id)}
              role="checkbox"
              aria-checked={task.completed}
            >
              {task.completed && '✓'}
            </div>
            <span style={taskTextStyle(task.completed)}>{task.title}</span>
            <div style={actionButtonsStyle}>
              <button
                style={actionButtonStyle}
                onClick={() => moveTaskUp(index)}
                disabled={index === 0}
                aria-label="Move task up"
              >
                ↑
              </button>
              <button
                style={actionButtonStyle}
                onClick={() => moveTaskDown(index)}
                disabled={index === subTasks.length - 1}
                aria-label="Move task down"
              >
                ↓
              </button>
              <button
                style={actionButtonStyle}
                onClick={() => deleteTask(task.id)}
                aria-label="Delete task"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div style={inputContainerStyle}>
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a new step..."
          style={inputStyle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addTask();
            }
          }}
        />
        <button style={addButtonStyle} onClick={addTask}>
          Add
        </button>
      </div>
    </div>
  );
};
