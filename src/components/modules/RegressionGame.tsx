import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw, CheckCircle, Target } from 'lucide-react';

interface DataPoint {
  x: number;
  y: number;
  id: string;
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

  // Generate sample data points that follow a pattern
  const actualDataPoints: DataPoint[] = [
    { x: 10, y: 25, id: '1' },
    { x: 20, y: 45, id: '2' },
    { x: 30, y: 65, id: '3' },
    { x: 40, y: 85, id: '4' },
    { x: 50, y: 105, id: '5' },
    { x: 60, y: 125, id: '6' }
  ];

  // Calculate predicted line
  const getPredictedY = (x: number) => slope * x + intercept;

  // Calculate accuracy score
  useEffect(() => {
    const errors = actualDataPoints.map(point => {
      const predicted = getPredictedY(point.x);
      return Math.abs(point.y - predicted);
    });
    const averageError = errors.reduce((sum, error) => sum + error, 0) / errors.length;
    const accuracy = Math.max(0, 100 - (averageError / 2)); // Convert error to percentage
    setScore(Math.round(accuracy));
  }, [slope, intercept]);

  const handleComplete = () => {
    setIsCompleted(true);
    onComplete(score);
  };

  const resetGame = () => {
    setSlope(1);
    setIntercept(50);
    setIsCompleted(false);
    setShowHelp(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <TrendingUp className="text-blue-600" />
            Prediction Explorer
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help the AI learn to predict patterns! Adjust the line to match the data points and see how machine learning finds the best fit.
          </p>
        </div>

        {/* Help Panel */}
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <Target className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-yellow-800">Your Mission:</h3>
                <p className="text-yellow-700">
                  Draw a line that best fits through all the blue dots. Use the sliders to adjust the line's angle (slope) and height (intercept). Get as close as possible to score 100%!
                </p>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="mt-2 text-yellow-800 hover:text-yellow-900 underline text-sm"
                >
                  Got it! Hide this tip
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Control Panel</h3>
              
              {/* Slope Control */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Line Steepness (Slope): {slope.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={slope}
                  onChange={(e) => setSlope(parseFloat(e.target.value))}
                  className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Flat</span>
                  <span>Steep</span>
                </div>
              </div>

              {/* Intercept Control */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Line Height (Intercept): {intercept}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={intercept}
                  onChange={(e) => setIntercept(parseInt(e.target.value))}
                  className="w-full h-3 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              {/* Score Display */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">Accuracy: {score}%</div>
                <div className="text-sm text-gray-600 mt-1">
                  {score >= 90 ? "Excellent! 🎉" : 
                   score >= 70 ? "Good job! 👍" : 
                   score >= 50 ? "Getting closer! 🤔" : "Keep trying! 💪"}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={resetGame}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw size={16} />
                  Reset
                </button>
                <button
                  onClick={handleComplete}
                  disabled={score < 50}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle size={16} />
                  Complete
                </button>
              </div>
            </div>

            {/* Learning Info */}
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <h4 className="font-semibold text-indigo-800 mb-2">🧠 AI Learning Tip:</h4>
              <p className="text-sm text-indigo-700">
                This is exactly how AI learns patterns! It tries different lines (predictions) and measures how wrong it is, then adjusts to get better.
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Prediction Chart</h3>
              <div className="relative">
                <svg width="100%" height="400" viewBox="0 0 400 300" className="border border-gray-200 rounded">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4, 5, 6].map(i => (
                    <g key={i}>
                      <line
                        x1={i * 60 + 40}
                        y1={40}
                        x2={i * 60 + 40}
                        y2={260}
                        stroke="#f3f4f6"
                        strokeWidth="1"
                      />
                      <line
                        x1={40}
                        y1={i * 40 + 40}
                        x2={360}
                        y2={i * 40 + 40}
                        stroke="#f3f4f6"
                        strokeWidth="1"
                      />
                    </g>
                  ))}

                  {/* Axes */}
                  <line x1={40} y1={260} x2={360} y2={260} stroke="#374151" strokeWidth="2" />
                  <line x1={40} y1={40} x2={40} y2={260} stroke="#374151" strokeWidth="2" />

                  {/* Data points */}
                  {actualDataPoints.map((point, index) => (
                    <motion.circle
                      key={point.id}
                      cx={point.x * 5 + 40}
                      cy={260 - point.y * 1.5}
                      r="6"
                      fill="#3b82f6"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="drop-shadow-sm"
                    />
                  ))}

                  {/* Prediction line */}
                  <line
                    x1={40}
                    y1={260 - getPredictedY(0) * 1.5}
                    x2={360}
                    y2={260 - getPredictedY(64) * 1.5}
                    stroke="#ef4444"
                    strokeWidth="3"
                    className="drop-shadow-sm"
                  />

                  {/* Axis labels */}
                  <text x="200" y="290" textAnchor="middle" className="text-sm fill-gray-600">
                    Input Value
                  </text>
                  <text x="20" y="150" textAnchor="middle" className="text-sm fill-gray-600" transform="rotate(-90 20 150)">
                    Prediction
                  </text>
                </svg>

                {/* Legend */}
                <div className="flex gap-6 mt-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Actual Data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-red-500"></div>
                    <span className="text-sm text-gray-600">Your Prediction</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-8 max-w-md mx-4 text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Great Work!</h3>
            <p className="text-gray-600 mb-4">
              You scored {score}%! You're learning how AI makes predictions by finding patterns in data.
            </p>
            <div className="text-sm text-gray-500">
              Returning to modules...
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}