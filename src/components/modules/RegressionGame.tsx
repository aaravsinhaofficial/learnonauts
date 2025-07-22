import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw, CheckCircle, Target, Zap, Brain, BarChart3 } from 'lucide-react';

interface DataPoint {
  x: number;
  y: number;
  id: string;
  label?: string;
}

interface Scenario {
  name: string;
  description: string;
  dataPoints: DataPoint[];
  targetSlope: number;
  targetIntercept: number;
  icon: string;
  context: string;
}

interface RegressionGameProps {
  onComplete: (score: number) => void;
}

export function RegressionGame({ onComplete }: RegressionGameProps) {
  const [slope, setSlope] = useState(1);
  const [intercept, setIntercept] = useState(50);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [level, setLevel] = useState(1);
  const [attempts, setAttempts] = useState(0);

  // Multiple engaging scenarios
  const scenarios: Scenario[] = [
    {
      name: "Pizza Sales Prediction",
      description: "Help Mario's Pizza predict sales based on temperature!",
      icon: "🍕",
      context: "Higher temperatures = more pizza sales!",
      targetSlope: 2,
      targetIntercept: 30,
      dataPoints: [
        { x: 10, y: 50, id: '1', label: 'Cold Day' },
        { x: 20, y: 70, id: '2', label: 'Cool' },
        { x: 30, y: 90, id: '3', label: 'Warm' },
        { x: 40, y: 110, id: '4', label: 'Hot' },
        { x: 50, y: 130, id: '5', label: 'Very Hot' }
      ]
    },
    {
      name: "Video Game Practice",
      description: "Predict gaming skill improvement with practice hours!",
      icon: "🎮",
      context: "More practice = higher skill level!",
      targetSlope: 1.5,
      targetIntercept: 20,
      dataPoints: [
        { x: 10, y: 35, id: '1', label: 'Beginner' },
        { x: 20, y: 50, id: '2', label: 'Learning' },
        { x: 30, y: 65, id: '3', label: 'Getting Good' },
        { x: 40, y: 80, id: '4', label: 'Skilled' },
        { x: 50, y: 95, id: '5', label: 'Expert' }
      ]
    },
    {
      name: "Plant Growth Study",
      description: "Predict plant height based on days of growth!",
      icon: "🌱",
      context: "Time helps plants grow taller!",
      targetSlope: 0.8,
      targetIntercept: 5,
      dataPoints: [
        { x: 10, y: 13, id: '1', label: 'Sprout' },
        { x: 20, y: 21, id: '2', label: 'Young' },
        { x: 30, y: 29, id: '3', label: 'Growing' },
        { x: 40, y: 37, id: '4', label: 'Mature' },
        { x: 50, y: 45, id: '5', label: 'Full Size' }
      ]
    }
  ];

  const currentData = scenarios[currentScenario];

  // Calculate predicted line
  const getPredictedY = (x: number) => slope * x + intercept;

  // Enhanced accuracy calculation
  useEffect(() => {
    const errors = currentData.dataPoints.map(point => {
      const predicted = getPredictedY(point.x);
      return Math.abs(point.y - predicted);
    });
    const averageError = errors.reduce((sum, error) => sum + error, 0) / errors.length;
    const maxPossibleError = Math.max(...currentData.dataPoints.map(p => p.y));
    const accuracy = Math.max(0, 100 - (averageError / maxPossibleError * 100));
    setScore(Math.round(accuracy));
  }, [slope, intercept, currentScenario]);

  const handleComplete = () => {
    if (score >= 70) {
      if (currentScenario < scenarios.length - 1) {
        setCurrentScenario(prev => prev + 1);
        setLevel(prev => prev + 1);
        setSlope(1);
        setIntercept(50);
        setAttempts(0);
        setShowHelp(true);
      } else {
        setIsCompleted(true);
        onComplete(score);
      }
    } else {
      setAttempts(prev => prev + 1);
    }
  };

  const resetGame = () => {
    setSlope(1);
    setIntercept(50);
    setIsCompleted(false);
    setShowHelp(true);
    setCurrentScenario(0);
    setLevel(1);
    setAttempts(0);
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return "🎉";
    if (score >= 80) return "🌟";
    if (score >= 70) return "👍";
    if (score >= 60) return "🤔";
    return "💪";
  };

  const getEncouragement = () => {
    if (attempts === 0) return "Find the perfect line!";
    if (attempts === 1) return "Getting closer! Try adjusting the slope.";
    if (attempts === 2) return "Almost there! Fine-tune the height.";
    return "You've got this! Look at the pattern carefully.";
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
      padding: '1.5rem'
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Enhanced Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.h1 
            style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              color: '#1e40af',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TrendingUp size={40} />
            Prediction Explorer
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1rem 2rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              display: 'inline-block',
              marginBottom: '1rem'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{currentData.icon}</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              Level {level}: {currentData.name}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1rem', margin: '0.5rem 0 0 0' }}>
              {currentData.description}
            </p>
          </motion.div>

          <p style={{ fontSize: '1.125rem', color: '#4b5563', maxWidth: '48rem', margin: '0 auto' }}>
            {currentData.context} Adjust the prediction line to match the data perfectly!
          </p>
        </div>

        {/* Enhanced Help Panel */}
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: '#fef3c7',
              border: '2px solid #f59e0b',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <Target style={{ color: '#d97706', marginTop: '0.25rem', flexShrink: 0 }} size={24} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: '600', color: '#92400e', fontSize: '1.125rem', margin: '0 0 0.5rem 0' }}>
                  Your Mission:
                </h3>
                <p style={{ color: '#b45309', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                  Draw a line that best predicts the pattern! Use the <strong>Steepness</strong> slider to control 
                  the line's angle and the <strong>Height</strong> slider to move it up or down. 
                  Get 70%+ accuracy to unlock the next level!
                </p>
                <button 
                  onClick={() => setShowHelp(false)}
                  style={{
                    color: '#92400e',
                    backgroundColor: 'transparent',
                    border: 'none',
                    textDecoration: 'underline',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Got it! Let's predict! 🚀
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Enhanced Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '1.5rem', 
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <BarChart3 style={{ color: '#3b82f6' }} size={20} />
                Prediction Controls
              </h3>
              
              {/* Enhanced Slope Control */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap style={{ color: '#f59e0b' }} size={16} />
                    Line Steepness (Slope): {slope.toFixed(1)}
                  </div>
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={slope}
                  onChange={(e) => setSlope(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    height: '0.75rem',
                    backgroundColor: '#dbeafe',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '0.75rem', 
                  color: '#6b7280', 
                  marginTop: '0.25rem' 
                }}>
                  <span>📉 Flat</span>
                  <span>📈 Steep</span>
                </div>
              </div>

              {/* Enhanced Intercept Control */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Brain style={{ color: '#10b981' }} size={16} />
                    Line Height (Intercept): {intercept}
                  </div>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={intercept}
                  onChange={(e) => setIntercept(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: '0.75rem',
                    backgroundColor: '#d1fae5',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '0.75rem', 
                  color: '#6b7280', 
                  marginTop: '0.25rem' 
                }}>
                  <span>⬇️ Low</span>
                  <span>⬆️ High</span>
                </div>
              </div>

              {/* Enhanced Score Display */}
              <motion.div 
                style={{
                  backgroundColor: score >= 90 ? '#f0fdf4' : score >= 70 ? '#fef3c7' : '#fef2f2',
                  border: `2px solid ${score >= 90 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#ef4444'}`,
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}
                animate={{ scale: score >= 90 ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {getScoreEmoji(score)}
                </div>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: score >= 90 ? '#166534' : score >= 70 ? '#92400e' : '#dc2626'
                }}>
                  Accuracy: {score}%
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: score >= 90 ? '#15803d' : score >= 70 ? '#b45309' : '#b91c1c',
                  marginTop: '0.5rem'
                }}>
                  {getEncouragement()}
                </div>
              </motion.div>

              {/* Enhanced Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                <button
                  onClick={resetGame}
                  style={{
                    flex: 1,
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
                >
                  <RefreshCw size={16} />
                  Reset
                </button>
                <button
                  onClick={handleComplete}
                  disabled={score < 50}
                  style={{
                    flex: 2,
                    backgroundColor: score >= 70 ? '#059669' : score >= 50 ? '#3b82f6' : '#d1d5db',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: score >= 50 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <CheckCircle size={16} />
                  {score >= 70 ? (currentScenario < scenarios.length - 1 ? 'Next Level!' : 'Complete!') : 
                   score >= 50 ? 'Try Again' : 'Need 50%+'}
                </button>
              </div>
            </div>

            {/* Enhanced Learning Info */}
            <motion.div 
              style={{
                backgroundColor: '#eef2ff',
                border: '2px solid #a5b4fc',
                borderRadius: '0.75rem',
                padding: '1.5rem'
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h4 style={{ 
                fontWeight: '600', 
                color: '#3730a3', 
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🧠 AI Learning Tip:
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#4338ca', lineHeight: '1.5', margin: 0 }}>
                This is how AI learns patterns! It starts with a random line, measures how wrong it is 
                (like your accuracy score), then adjusts bit by bit to get better. Real AI does this 
                thousands of times automatically!
              </p>
            </motion.div>

            {/* Progress Indicator */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '0.5rem' 
              }}>
                Progress: Level {level} of {scenarios.length}
              </div>
              <div style={{
                width: '100%',
                backgroundColor: '#e5e7eb',
                borderRadius: '9999px',
                height: '0.5rem'
              }}>
                <div style={{
                  width: `${((currentScenario + 1) / scenarios.length) * 100}%`,
                  backgroundColor: '#3b82f6',
                  height: '0.5rem',
                  borderRadius: '9999px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Enhanced Chart */}
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '1.5rem', 
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📊 Prediction Chart: {currentData.name}
              </h3>
              
              <div style={{ position: 'relative' }}>
                <svg 
                  width="100%" 
                  height="400" 
                  viewBox="0 0 500 350" 
                  style={{ 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '0.5rem',
                    backgroundColor: '#fafafa'
                  }}
                >
                  {/* Enhanced Grid lines */}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <g key={i}>
                      <line
                        x1={i * 50 + 50}
                        y1={50}
                        x2={i * 50 + 50}
                        y2={300}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                      <line
                        x1={50}
                        y1={i * 35 + 50}
                        x2={450}
                        y2={i * 35 + 50}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                    </g>
                  ))}

                  {/* Enhanced Axes */}
                  <line x1={50} y1={300} x2={450} y2={300} stroke="#1f2937" strokeWidth="3" />
                  <line x1={50} y1={50} x2={50} y2={300} stroke="#1f2937" strokeWidth="3" />

                  {/* Data points with enhanced styling */}
                  {currentData.dataPoints.map((point: DataPoint, index: number) => (
                    <g key={point.id}>
                      <motion.circle
                        cx={point.x * 6 + 50}
                        cy={300 - point.y * 1.8}
                        r="8"
                        fill="#3b82f6"
                        stroke="#ffffff"
                        strokeWidth="3"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                      />
                      {/* Point labels */}
                      <text 
                        x={point.x * 6 + 50} 
                        y={300 - point.y * 1.8 - 15} 
                        textAnchor="middle" 
                        style={{ 
                          fontSize: '0.75rem', 
                          fill: '#374151', 
                          fontWeight: '500'
                        }}
                      >
                        {point.label}
                      </text>
                    </g>
                  ))}

                  {/* Enhanced Prediction line */}
                  <motion.line
                    x1={50}
                    y1={300 - getPredictedY(0) * 1.8}
                    x2={450}
                    y2={300 - getPredictedY(66) * 1.8}
                    stroke="#ef4444"
                    strokeWidth="4"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
                    animate={{ 
                      x1: 50,
                      y1: 300 - getPredictedY(0) * 1.8,
                      x2: 450,
                      y2: 300 - getPredictedY(66) * 1.8
                    }}
                    transition={{ type: "spring", stiffness: 200 }}
                  />

                  {/* Axis labels */}
                  <text x="250" y="340" textAnchor="middle" style={{ fontSize: '0.875rem', fill: '#4b5563', fontWeight: '500' }}>
                    Input Value
                  </text>
                  <text x="20" y="175" textAnchor="middle" style={{ fontSize: '0.875rem', fill: '#4b5563', fontWeight: '500' }} transform="rotate(-90 20 175)">
                    Output Value
                  </text>
                </svg>

                {/* Enhanced Legend */}
                <div style={{ 
                  display: 'flex', 
                  gap: '2rem', 
                  marginTop: '1.5rem', 
                  justifyContent: 'center',
                  backgroundColor: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '1rem', height: '1rem', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
                    <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>Actual Data</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '1.5rem', height: '0.25rem', backgroundColor: '#ef4444' }}></div>
                    <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>Your Prediction</span>
                  </div>
                </div>

                {/* Real-time feedback */}
                <motion.div 
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: score >= 90 ? '#dcfce7' : score >= 70 ? '#fef3c7' : '#fee2e2',
                    color: score >= 90 ? '#166534' : score >= 70 ? '#92400e' : '#dc2626',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                  animate={{ scale: score >= 90 ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {score >= 90 ? '🎯 Perfect!' : score >= 70 ? '👍 Good!' : '🎯 Keep trying!'}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Success Modal */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2.5rem',
              maxWidth: '28rem',
              margin: '1rem',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <motion.div 
              style={{ fontSize: '4rem', marginBottom: '1rem' }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              🎉
            </motion.div>
            <h3 style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700', 
              color: '#1f2937', 
              marginBottom: '1rem' 
            }}>
              Amazing Work, Prediction Expert!
            </h3>
            <p style={{ 
              color: '#4b5563', 
              marginBottom: '1.5rem', 
              fontSize: '1.125rem',
              lineHeight: '1.6' 
            }}>
              You've mastered all {scenarios.length} prediction challenges! You scored {score}% 
              and learned how AI finds patterns in data to make predictions.
            </p>
            
            <div style={{
              backgroundColor: '#f0f9ff',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              border: '2px solid #0ea5e9'
            }}>
              <h4 style={{ 
                color: '#0c4a6e', 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                fontSize: '1rem'
              }}>
                🧠 What You Learned:
              </h4>
              <ul style={{ 
                color: '#075985', 
                fontSize: '0.875rem', 
                textAlign: 'left',
                lineHeight: '1.5',
                margin: 0,
                paddingLeft: '1rem'
              }}>
                <li>How AI learns from data patterns</li>
                <li>Linear regression and prediction lines</li>
                <li>Real-world applications in business and science</li>
                <li>The importance of accuracy in AI models</li>
              </ul>
            </div>
            
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Returning to modules in 3 seconds...
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}