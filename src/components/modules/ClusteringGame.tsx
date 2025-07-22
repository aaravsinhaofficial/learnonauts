import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, RefreshCw, CheckCircle, Lightbulb, Palette } from 'lucide-react';

interface DataPoint {
  id: string;
  x: number;
  y: number;
  originalCluster: number;
  assignedCluster: number | null;
  color: string;
}

interface ClusteringGameProps {
  onComplete: (score: number) => void;
}

export function ClusteringGame({ onComplete }: ClusteringGameProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedTool, setSelectedTool] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [score, setScore] = useState(0);

  const clusterColors = [
    '#ef4444', // red
    '#3b82f6', // blue  
    '#10b981', // green
    '#f59e0b'  // yellow
  ];

  // Generate scattered data points that naturally form clusters
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    // Cluster 1 (top-left)
    { id: '1', x: 80, y: 80, originalCluster: 1, assignedCluster: null, color: '#6b7280' },
    { id: '2', x: 100, y: 70, originalCluster: 1, assignedCluster: null, color: '#6b7280' },
    { id: '3', x: 90, y: 100, originalCluster: 1, assignedCluster: null, color: '#6b7280' },
    { id: '4', x: 110, y: 90, originalCluster: 1, assignedCluster: null, color: '#6b7280' },
    { id: '5', x: 75, y: 110, originalCluster: 1, assignedCluster: null, color: '#6b7280' },
    
    // Cluster 2 (top-right)
    { id: '6', x: 280, y: 90, originalCluster: 2, assignedCluster: null, color: '#6b7280' },
    { id: '7', x: 300, y: 80, originalCluster: 2, assignedCluster: null, color: '#6b7280' },
    { id: '8', x: 290, y: 110, originalCluster: 2, assignedCluster: null, color: '#6b7280' },
    { id: '9', x: 320, y: 100, originalCluster: 2, assignedCluster: null, color: '#6b7280' },
    { id: '10', x: 275, y: 120, originalCluster: 2, assignedCluster: null, color: '#6b7280' },
    
    // Cluster 3 (bottom-center)
    { id: '11', x: 180, y: 200, originalCluster: 3, assignedCluster: null, color: '#6b7280' },
    { id: '12', x: 200, y: 190, originalCluster: 3, assignedCluster: null, color: '#6b7280' },
    { id: '13', x: 190, y: 220, originalCluster: 3, assignedCluster: null, color: '#6b7280' },
    { id: '14', x: 210, y: 210, originalCluster: 3, assignedCluster: null, color: '#6b7280' },
    { id: '15', x: 170, y: 230, originalCluster: 3, assignedCluster: null, color: '#6b7280' },
  ]);

  const handlePointClick = (pointId: string) => {
    setDataPoints(points => 
      points.map(point => 
        point.id === pointId 
          ? { 
              ...point, 
              assignedCluster: selectedTool,
              color: clusterColors[selectedTool - 1]
            }
          : point
      )
    );
  };

  const calculateScore = () => {
    const correctAssignments = dataPoints.filter(point => 
      point.assignedCluster === point.originalCluster
    ).length;
    return Math.round((correctAssignments / dataPoints.length) * 100);
  };

  const handleComplete = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setIsCompleted(true);
    onComplete(finalScore);
  };

  const resetGame = () => {
    setDataPoints(points => 
      points.map(point => ({
        ...point,
        assignedCluster: null,
        color: '#6b7280'
      }))
    );
    setSelectedTool(1);
    setIsCompleted(false);
    setShowHelp(true);
    setScore(0);
  };

  const allPointsAssigned = dataPoints.every(point => point.assignedCluster !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <Users className="text-purple-600" />
            Pattern Detective
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Can you spot the hidden groups? Look for patterns and group similar data points together - just like AI does!
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
              <Lightbulb className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-yellow-800">Detective Mission:</h3>
                <p className="text-yellow-700">
                  Look at the scattered dots and find natural groups! Select a color tool, then click on dots that seem to belong together. Try to find 3 groups of similar points.
                </p>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="mt-2 text-yellow-800 hover:text-yellow-900 underline text-sm"
                >
                  Start detecting! Hide this tip
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tools Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <Palette className="text-purple-600" size={20} />
                Color Tools
              </h3>
              
              <div className="space-y-3">
                {[1, 2, 3].map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool)}
                    className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
                      selectedTool === tool 
                        ? 'ring-2 ring-offset-2 ring-purple-500 shadow-md' 
                        : 'hover:bg-gray-50'
                    }`}
                    style={{ 
                      backgroundColor: selectedTool === tool ? clusterColors[tool - 1] + '20' : 'transparent',
                      border: `2px solid ${clusterColors[tool - 1]}`
                    }}
                  >
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: clusterColors[tool - 1] }}
                    />
                    <span className="font-medium">Group {tool}</span>
                    {selectedTool === tool && <span className="ml-auto text-sm">Selected</span>}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-2">Progress:</div>
                <div className="text-lg font-bold text-gray-800">
                  {dataPoints.filter(p => p.assignedCluster !== null).length} / {dataPoints.length} points grouped
                </div>
              </div>

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
                  disabled={!allPointsAssigned}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle size={16} />
                  Check
                </button>
              </div>
            </div>

            {/* Learning Info */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">🧠 AI Learning Tip:</h4>
              <p className="text-sm text-purple-700">
                Clustering helps AI find hidden patterns in data! It's used for customer segmentation, organizing content, and discovering new insights.
              </p>
            </div>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Data Canvas</h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <svg 
                  ref={svgRef}
                  width="100%" 
                  height="300" 
                  viewBox="0 0 400 300" 
                  className="bg-white rounded border"
                >
                  {/* Grid */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Data Points */}
                  {dataPoints.map((point, index) => (
                    <motion.circle
                      key={point.id}
                      cx={point.x}
                      cy={point.y}
                      r="8"
                      fill={point.color}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer drop-shadow-sm hover:drop-shadow-md"
                      onClick={() => handlePointClick(point.id)}
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: 1,
                        r: point.assignedCluster ? 10 : 8 
                      }}
                      transition={{ 
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 300
                      }}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}

                  {/* Selected tool indicator */}
                  <text x="10" y="25" className="text-sm font-medium fill-gray-600">
                    Selected: Group {selectedTool}
                  </text>
                  <circle 
                    cx="120" 
                    cy="20" 
                    r="6" 
                    fill={clusterColors[selectedTool - 1]}
                    stroke="white"
                    strokeWidth="2"
                  />
                </svg>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Click on the dots to group them by color. Look for points that are close together!
                  </p>
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
            <div className="text-6xl mb-4">
              {score >= 90 ? "🎉" : score >= 70 ? "🌟" : score >= 50 ? "👍" : "🤔"}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {score >= 90 ? "Amazing Detective Work!" : 
               score >= 70 ? "Great Pattern Recognition!" : 
               score >= 50 ? "Good Effort!" : "Keep Learning!"}
            </h3>
            <p className="text-gray-600 mb-4">
              You scored {score}%! You're learning how AI finds hidden patterns and groups in data.
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