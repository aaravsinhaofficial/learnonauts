import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, RefreshCw, CheckCircle, Lightbulb, Palette, Brain, Sparkles } from 'lucide-react';
import type { AccessibilitySettings } from '../AccessibilityPanel';

interface DataPoint {
  id: string;
  x: number;
  y: number;
  originalCluster: number;
  assignedCluster: number | null;
  color: string;
  label?: string;
}

interface Scenario {
  name: string;
  description: string;
  icon: string;
  context: string;
  dataPoints: DataPoint[];
}

interface ClusteringGameProps {
  onComplete: (score: number) => void;
  accessibilitySettings?: AccessibilitySettings;
}

export function ClusteringGame({ onComplete, accessibilitySettings }: ClusteringGameProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedTool, setSelectedTool] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [score, setScore] = useState(0);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [level, setLevel] = useState(1);
  const [attempts, setAttempts] = useState(0);

  const clusterColors = [
    '#ef4444', // red
    '#3b82f6', // blue  
    '#10b981', // green
    '#f59e0b'  // yellow
  ];

  // Multiple engaging scenarios
  const scenarios: Scenario[] = [
    {
      name: "Customer Groups",
      description: "Help a store find different types of customers!",
      icon: "🛍️",
      context: "Group customers by their shopping patterns",
      dataPoints: [
        // Frequent shoppers (top-left)
        { id: '1', x: 80, y: 80, originalCluster: 1, assignedCluster: null, color: '#6b7280', label: 'Daily' },
        { id: '2', x: 100, y: 70, originalCluster: 1, assignedCluster: null, color: '#6b7280', label: 'Regular' },
        { id: '3', x: 90, y: 100, originalCluster: 1, assignedCluster: null, color: '#6b7280', label: 'Often' },
        { id: '4', x: 110, y: 90, originalCluster: 1, assignedCluster: null, color: '#6b7280', label: 'Loyal' },
        { id: '5', x: 75, y: 110, originalCluster: 1, assignedCluster: null, color: '#6b7280', label: 'VIP' },
        
        // Occasional shoppers (top-right)
        { id: '6', x: 280, y: 90, originalCluster: 2, assignedCluster: null, color: '#6b7280', label: 'Weekend' },
        { id: '7', x: 300, y: 80, originalCluster: 2, assignedCluster: null, color: '#6b7280', label: 'Monthly' },
        { id: '8', x: 290, y: 110, originalCluster: 2, assignedCluster: null, color: '#6b7280', label: 'Holiday' },
        { id: '9', x: 320, y: 100, originalCluster: 2, assignedCluster: null, color: '#6b7280', label: 'Sale' },
        { id: '10', x: 275, y: 120, originalCluster: 2, assignedCluster: null, color: '#6b7280', label: 'Event' },
        
        // Rare shoppers (bottom-center)
        { id: '11', x: 180, y: 200, originalCluster: 3, assignedCluster: null, color: '#6b7280', label: 'Rare' },
        { id: '12', x: 200, y: 190, originalCluster: 3, assignedCluster: null, color: '#6b7280', label: 'Once' },
        { id: '13', x: 190, y: 220, originalCluster: 3, assignedCluster: null, color: '#6b7280', label: 'Annual' },
        { id: '14', x: 210, y: 210, originalCluster: 3, assignedCluster: null, color: '#6b7280', label: 'Special' },
        { id: '15', x: 170, y: 230, originalCluster: 3, assignedCluster: null, color: '#6b7280', label: 'Gift' },
      ]
    },
    {
      name: "Animal Species",
      description: "Classify animals by their characteristics!",
      icon: "🦁",
      context: "Group animals that are similar to each other",
      dataPoints: [
        // Big cats
        { id: '1', x: 90, y: 70, originalCluster: 1, assignedCluster: null, color: '#6b7280', label: 'Lion' },
        { id: '2', x: 110, y: 80, originalCluster: 1, assignedCluster: null, color: '#6b7280', label: 'Tiger' },
        { id: '3', x: 100, y: 100, originalCluster: 1, assignedCluster: null, color: '#6b7280', label: 'Leopard' },
        { id: '4', x: 85, y: 90, originalCluster: 1, assignedCluster: null, color: '#6b7280', label: 'Jaguar' },
        { id: '5', x: 115, y: 75, originalCluster: 1, assignedCluster: null, color: '#6b7280', label: 'Cheetah' },
        
        // Birds
        { id: '6', x: 290, y: 80, originalCluster: 2, assignedCluster: null, color: '#6b7280', label: 'Eagle' },
        { id: '7', x: 310, y: 90, originalCluster: 2, assignedCluster: null, color: '#6b7280', label: 'Hawk' },
        { id: '8', x: 285, y: 105, originalCluster: 2, assignedCluster: null, color: '#6b7280', label: 'Owl' },
        { id: '9', x: 305, y: 75, originalCluster: 2, assignedCluster: null, color: '#6b7280', label: 'Falcon' },
        { id: '10', x: 295, y: 110, originalCluster: 2, assignedCluster: null, color: '#6b7280', label: 'Robin' },
        
        // Ocean animals
        { id: '11', x: 190, y: 210, originalCluster: 3, assignedCluster: null, color: '#6b7280', label: 'Whale' },
        { id: '12', x: 210, y: 200, originalCluster: 3, assignedCluster: null, color: '#6b7280', label: 'Dolphin' },
        { id: '13', x: 185, y: 230, originalCluster: 3, assignedCluster: null, color: '#6b7280', label: 'Shark' },
        { id: '14', x: 205, y: 220, originalCluster: 3, assignedCluster: null, color: '#6b7280', label: 'Seal' },
        { id: '15', x: 195, y: 240, originalCluster: 3, assignedCluster: null, color: '#6b7280', label: 'Octopus' },
      ]
    },
    {
      name: "Music Genres",
      description: "Group songs by their musical style!",
      icon: "🎵",
      context: "Find patterns in different types of music",
      dataPoints: [
        // Rock music
        { id: '1', x: 85, y: 75, originalCluster: 1, assignedCluster: null, color: '#6b7280', label: 'Rock' },
        { id: '2', x: 105, y: 85, originalCluster: 1, assignedCluster: null, color: '#6b7280', label: 'Metal' },
        { id: '3', x: 95, y: 95, originalCluster: 1, assignedCluster: null, color: '#6b7280', label: 'Punk' },
        { id: '4', x: 90, y: 105, originalCluster: 1, assignedCluster: null, color: '#6b7280', label: 'Grunge' },
        { id: '5', x: 110, y: 75, originalCluster: 1, assignedCluster: null, color: '#6b7280', label: 'Alt' },
        
        // Electronic music
        { id: '6', x: 285, y: 85, originalCluster: 2, assignedCluster: null, color: '#6b7280', label: 'Techno' },
        { id: '7', x: 305, y: 95, originalCluster: 2, assignedCluster: null, color: '#6b7280', label: 'House' },
        { id: '8', x: 290, y: 105, originalCluster: 2, assignedCluster: null, color: '#6b7280', label: 'EDM' },
        { id: '9', x: 310, y: 80, originalCluster: 2, assignedCluster: null, color: '#6b7280', label: 'Trance' },
        { id: '10', x: 295, y: 115, originalCluster: 2, assignedCluster: null, color: '#6b7280', label: 'Dubstep' },
        
        // Classical music
        { id: '11', x: 185, y: 205, originalCluster: 3, assignedCluster: null, color: '#6b7280', label: 'Symphony' },
        { id: '12', x: 205, y: 215, originalCluster: 3, assignedCluster: null, color: '#6b7280', label: 'Opera' },
        { id: '13', x: 195, y: 225, originalCluster: 3, assignedCluster: null, color: '#6b7280', label: 'Chamber' },
        { id: '14', x: 190, y: 235, originalCluster: 3, assignedCluster: null, color: '#6b7280', label: 'Concerto' },
        { id: '15', x: 210, y: 195, originalCluster: 3, assignedCluster: null, color: '#6b7280', label: 'Ballet' },
      ]
    }
  ];

  const currentData = scenarios[currentScenario];
  const [dataPoints, setDataPoints] = useState<DataPoint[]>(currentData.dataPoints);

  // Update data points when scenario changes
  useEffect(() => {
    setDataPoints(currentData.dataPoints);
  }, [currentScenario]);

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
    
    if (finalScore >= 70) {
      if (currentScenario < scenarios.length - 1) {
        setCurrentScenario(prev => prev + 1);
        setLevel(prev => prev + 1);
        setSelectedTool(1);
        setAttempts(0);
        setShowHelp(true);
      } else {
        setIsCompleted(true);
        onComplete(finalScore);
      }
    } else {
      setAttempts(prev => prev + 1);
    }
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
    setAttempts(0);
    setCurrentScenario(0);
    setLevel(1);
  };

  const allPointsAssigned = dataPoints.every(point => point.assignedCluster !== null);

  const getEncouragement = () => {
    if (attempts === 0) return "Look for natural groups!";
    if (attempts === 1) return "Try grouping similar items together.";
    if (attempts === 2) return "Think about what makes items similar.";
    return "You're getting closer! Look for patterns.";
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f3e8ff 0%, #e879f9 50%, #c084fc 100%)',
      padding: '1.5rem'
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Enhanced Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.h1 
            style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              color: '#7c2d12',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Users size={40} />
            Pattern Detective
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
            {currentData.context} Find 3 groups of similar items!
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
              <Lightbulb style={{ color: '#d97706', marginTop: '0.25rem', flexShrink: 0 }} size={24} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: '600', color: '#92400e', fontSize: '1.125rem', margin: '0 0 0.5rem 0' }}>
                  Detective Mission:
                </h3>
                <p style={{ color: '#b45309', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                  Look at the scattered items and find natural groups! Select a color tool, then click on 
                  items that seem to belong together. Try to find <strong>3 groups</strong> of similar items. 
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
                  Start detecting patterns! 🕵️
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Enhanced Tools Panel */}
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
                <Palette style={{ color: '#8b5cf6' }} size={20} />
                Grouping Tools
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1, 2, 3].map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.2s',
                      backgroundColor: selectedTool === tool ? clusterColors[tool - 1] + '20' : 'transparent',
                      border: `2px solid ${clusterColors[tool - 1]}`,
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTool !== tool) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTool !== tool) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div 
                      style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        borderRadius: '50%',
                        backgroundColor: clusterColors[tool - 1]
                      }}
                    />
                    <span style={{ fontWeight: '500', color: '#1f2937' }}>Group {tool}</span>
                    {selectedTool === tool && (
                      <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: '#6b7280' }}>
                        ✓ Selected
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Progress:
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1f2937' }}>
                  {dataPoints.filter(p => p.assignedCluster !== null).length} / {dataPoints.length} items grouped
                </div>
                <div style={{ 
                  width: '100%', 
                  backgroundColor: '#e5e7eb', 
                  borderRadius: '9999px', 
                  height: '0.5rem',
                  marginTop: '0.5rem'
                }}>
                  <div style={{
                    width: `${(dataPoints.filter(p => p.assignedCluster !== null).length / dataPoints.length) * 100}%`,
                    backgroundColor: '#8b5cf6',
                    height: '0.5rem',
                    borderRadius: '9999px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
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
                  disabled={!allPointsAssigned}
                  style={{
                    flex: 2,
                    backgroundColor: allPointsAssigned ? '#8b5cf6' : '#d1d5db',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: allPointsAssigned ? 'pointer' : 'not-allowed',
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
                  {allPointsAssigned ? 'Analyze Groups!' : 'Group All Items'}
                </button>
              </div>
            </div>

            {/* Enhanced Learning Info */}
            <motion.div 
              style={{
                backgroundColor: '#f3e8ff',
                border: '2px solid #c084fc',
                borderRadius: '0.75rem',
                padding: '1.5rem'
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h4 style={{ 
                fontWeight: '600', 
                color: '#6b21a8', 
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Brain style={{ color: '#8b5cf6' }} size={16} />
                🧠 AI Learning Tip:
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#7c2d12', lineHeight: '1.5', margin: 0 }}>
                Clustering helps AI find hidden patterns in data! It's used everywhere - from organizing 
                your photos by faces to helping companies understand their customers better.
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
                Level Progress: {level} of {scenarios.length}
              </div>
              <div style={{
                width: '100%',
                backgroundColor: '#e5e7eb',
                borderRadius: '9999px',
                height: '0.5rem'
              }}>
                <div style={{
                  width: `${((currentScenario + 1) / scenarios.length) * 100}%`,
                  backgroundColor: '#8b5cf6',
                  height: '0.5rem',
                  borderRadius: '9999px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280', 
                marginTop: '0.5rem' 
              }}>
                {getEncouragement()}
              </div>
            </div>
          </div>

          {/* Enhanced Canvas */}
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
                <Sparkles style={{ color: '#8b5cf6' }} size={20} />
                Detection Canvas: {currentData.name}
              </h3>
              
              <div style={{ 
                border: '2px solid #e5e7eb', 
                borderRadius: '0.75rem', 
                padding: '1rem', 
                backgroundColor: '#fafafa' 
              }}>
                <svg 
                  ref={svgRef}
                  width="100%" 
                  height="300" 
                  viewBox="0 0 450 300" 
                  style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '0.5rem', 
                    border: '1px solid #d1d5db' 
                  }}
                >
                  {/* Enhanced Grid */}
                  <defs>
                    <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
                    </pattern>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Cluster regions (background) */}
                  {[1, 2, 3].map(cluster => {
                    const clusterPoints = dataPoints.filter(p => p.originalCluster === cluster);
                    if (clusterPoints.length === 0) return null;
                    
                    const avgX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
                    const avgY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
                    
                    return (
                      <circle
                        key={cluster}
                        cx={avgX}
                        cy={avgY}
                        r="60"
                        fill={clusterColors[cluster - 1] + '10'}
                        stroke={clusterColors[cluster - 1] + '30'}
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                    );
                  })}

                  {/* Enhanced Data Points */}
                  {dataPoints.map((point: DataPoint, index: number) => (
                    <g key={point.id}>
                      <motion.circle
                        cx={point.x}
                        cy={point.y}
                        r={point.assignedCluster ? "12" : "10"}
                        fill={point.color}
                        stroke="#ffffff"
                        strokeWidth="3"
                        style={{ 
                          cursor: 'pointer', 
                          filter: point.assignedCluster ? 'url(#glow)' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                        }}
                        onClick={() => handlePointClick(point.id)}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: 1,
                          opacity: 1,
                          r: point.assignedCluster ? 12 : 10 
                        }}
                        transition={{ 
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 300
                        }}
                        whileHover={{ scale: 1.3, r: 14 }}
                        whileTap={{ scale: 0.9 }}
                      />
                      
                      {/* Point labels */}
                      <text 
                        x={point.x} 
                        y={point.y - 20} 
                        textAnchor="middle" 
                        style={{ 
                          fontSize: '0.75rem', 
                          fill: '#374151', 
                          fontWeight: '500',
                          pointerEvents: 'none'
                        }}
                      >
                        {point.label}
                      </text>
                    </g>
                  ))}

                  {/* Selected tool indicator */}
                  <g>
                    <rect x="10" y="10" width="120" height="30" rx="15" fill="white" stroke="#e5e7eb" strokeWidth="1"/>
                    <text x="20" y="28" style={{ fontSize: '0.875rem', fontWeight: '500', fill: '#374151' }}>
                      Selected: Group {selectedTool}
                    </text>
                    <circle 
                      cx="110" 
                      cy="25" 
                      r="8" 
                      fill={clusterColors[selectedTool - 1]}
                      stroke="white"
                      strokeWidth="2"
                    />
                  </g>

                  {/* Instructions */}
                  <text x="225" y="290" textAnchor="middle" style={{ fontSize: '0.875rem', fill: '#6b7280' }}>
                    Click on items to group them by color. Look for similar patterns!
                  </text>
                </svg>

                {/* Real-time feedback */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: '1rem',
                  backgroundColor: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    {[1, 2, 3].map(cluster => (
                      <div key={cluster} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '1rem',
                          height: '1rem',
                          borderRadius: '50%',
                          backgroundColor: clusterColors[cluster - 1]
                        }} />
                        <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>
                          Group {cluster}: {dataPoints.filter(p => p.assignedCluster === cluster).length} items
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {allPointsAssigned && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}
                    >
                      🎯 Ready to analyze!
                    </motion.div>
                  )}
                </div>
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
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.6, repeat: 2 }}
            >
              {score >= 90 ? "🎉" : score >= 70 ? "🌟" : score >= 50 ? "👍" : "🤔"}
            </motion.div>
            
            <h3 style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700', 
              color: '#1f2937', 
              marginBottom: '1rem' 
            }}>
              {score >= 90 ? "Amazing Detective Work!" : 
               score >= 70 ? "Great Pattern Recognition!" : 
               score >= 50 ? "Good Effort!" : "Keep Learning!"}
            </h3>
            
            <p style={{ 
              color: '#4b5563', 
              marginBottom: '1.5rem', 
              fontSize: '1.125rem',
              lineHeight: '1.6' 
            }}>
              You've mastered all {scenarios.length} clustering challenges! You scored {score}% 
              and learned how AI discovers hidden patterns and groups in data.
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
                <li>How AI finds hidden patterns in data</li>
                <li>Clustering algorithms and unsupervised learning</li>
                <li>Real-world applications in customer segmentation</li>
                <li>Pattern recognition in different domains</li>
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
