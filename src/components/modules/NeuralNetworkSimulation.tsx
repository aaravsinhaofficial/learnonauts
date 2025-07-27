import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, Brain, TrendingUp } from 'lucide-react';
import type { AccessibilitySettings } from '../AccessibilityPanel';

interface Neuron {
  id: string;
  layer: number;
  position: { x: number; y: number };
  value: number;
  activation: number;
  bias: number;
  label?: string;
}

interface Connection {
  from: string;
  to: string;
  weight: number;
  active: boolean;
  signal?: number;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  inputs: { label: string; value: number; min: number; max: number }[];
  expectedOutput: string;
  context: string;
}

interface NeuralNetworkSimulationProps {
  onComplete: (score: number) => void;
  accessibilitySettings?: AccessibilitySettings;
}

export function NeuralNetworkSimulation({ onComplete, accessibilitySettings }: NeuralNetworkSimulationProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [step, setStep] = useState(0);
  const [selectedNeuron, setSelectedNeuron] = useState<string | null>(null);
  const [showWeights, setShowWeights] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [loss, setLoss] = useState(1.0);
  const [epoch, setEpoch] = useState(0);

  const scenarios: Scenario[] = [
    {
      id: 'house-price',
      name: 'House Price Predictor',
      description: 'Predict house prices based on size and location',
      icon: '🏠',
      inputs: [
        { label: 'House Size (sqft)', value: 1500, min: 500, max: 5000 },
        { label: 'Location Score', value: 8, min: 1, max: 10 },
        { label: 'Age (years)', value: 10, min: 0, max: 100 }
      ],
      expectedOutput: 'Predicted Price: $350,000',
      context: 'Real estate companies use AI to estimate property values'
    },
    {
      id: 'email-spam',
      name: 'Email Spam Detector',
      description: 'Detect if an email is spam or legitimate',
      icon: '📧',
      inputs: [
        { label: 'Suspicious Words', value: 3, min: 0, max: 10 },
        { label: 'Sender Reputation', value: 7, min: 0, max: 10 },
        { label: 'Link Count', value: 2, min: 0, max: 20 }
      ],
      expectedOutput: 'Classification: Legitimate Email',
      context: 'Email providers protect users by filtering spam automatically'
    },
    {
      id: 'weather',
      name: 'Weather Predictor',
      description: 'Predict tomorrow\'s weather conditions',
      icon: '🌤️',
      inputs: [
        { label: 'Temperature (°F)', value: 75, min: -20, max: 120 },
        { label: 'Humidity (%)', value: 60, min: 0, max: 100 },
        { label: 'Pressure (mb)', value: 1013, min: 980, max: 1050 }
      ],
      expectedOutput: 'Forecast: Partly Cloudy',
      context: 'Weather apps use AI to make accurate predictions'
    }
  ];

  const [inputValues, setInputValues] = useState(scenarios[0].inputs.map(input => input.value));

  const [neurons, setNeurons] = useState<Neuron[]>([
    // Input layer
    { id: 'i1', layer: 0, position: { x: 120, y: 120 }, value: 0.8, activation: 0.8, bias: 0, label: 'Input 1' },
    { id: 'i2', layer: 0, position: { x: 120, y: 200 }, value: 0.3, activation: 0.3, bias: 0, label: 'Input 2' },
    { id: 'i3', layer: 0, position: { x: 120, y: 280 }, value: 0.9, activation: 0.9, bias: 0, label: 'Input 3' },
    
    // Hidden layer 1
    { id: 'h1', layer: 1, position: { x: 280, y: 100 }, value: 0, activation: 0, bias: 0.1, label: 'Feature Det. 1' },
    { id: 'h2', layer: 1, position: { x: 280, y: 160 }, value: 0, activation: 0, bias: -0.2, label: 'Feature Det. 2' },
    { id: 'h3', layer: 1, position: { x: 280, y: 220 }, value: 0, activation: 0, bias: 0.3, label: 'Feature Det. 3' },
    { id: 'h4', layer: 1, position: { x: 280, y: 280 }, value: 0, activation: 0, bias: 0.0, label: 'Feature Det. 4' },
    
    // Hidden layer 2
    { id: 'h5', layer: 2, position: { x: 440, y: 130 }, value: 0, activation: 0, bias: 0.2, label: 'Combiner 1' },
    { id: 'h6', layer: 2, position: { x: 440, y: 190 }, value: 0, activation: 0, bias: -0.1, label: 'Combiner 2' },
    { id: 'h7', layer: 2, position: { x: 440, y: 250 }, value: 0, activation: 0, bias: 0.15, label: 'Combiner 3' },
    
    // Output layer
    { id: 'o1', layer: 3, position: { x: 600, y: 160 }, value: 0, activation: 0, bias: 0, label: 'Confidence' },
    { id: 'o2', layer: 3, position: { x: 600, y: 220 }, value: 0, activation: 0, bias: 0, label: 'Result' }
  ]);

  const [connections, setConnections] = useState<Connection[]>([
    // Input to hidden layer 1
    { from: 'i1', to: 'h1', weight: 0.8, active: false },
    { from: 'i1', to: 'h2', weight: -0.3, active: false },
    { from: 'i1', to: 'h3', weight: 0.6, active: false },
    { from: 'i1', to: 'h4', weight: 0.2, active: false },
    
    { from: 'i2', to: 'h1', weight: 0.4, active: false },
    { from: 'i2', to: 'h2', weight: 0.9, active: false },
    { from: 'i2', to: 'h3', weight: -0.2, active: false },
    { from: 'i2', to: 'h4', weight: 0.7, active: false },
    
    { from: 'i3', to: 'h1', weight: -0.1, active: false },
    { from: 'i3', to: 'h2', weight: 0.5, active: false },
    { from: 'i3', to: 'h3', weight: 0.8, active: false },
    { from: 'i3', to: 'h4', weight: -0.4, active: false },
    
    // Hidden layer 1 to hidden layer 2
    { from: 'h1', to: 'h5', weight: 0.7, active: false },
    { from: 'h1', to: 'h6', weight: -0.2, active: false },
    { from: 'h1', to: 'h7', weight: 0.4, active: false },
    
    { from: 'h2', to: 'h5', weight: 0.3, active: false },
    { from: 'h2', to: 'h6', weight: 0.8, active: false },
    { from: 'h2', to: 'h7', weight: -0.1, active: false },
    
    { from: 'h3', to: 'h5', weight: -0.4, active: false },
    { from: 'h3', to: 'h6', weight: 0.6, active: false },
    { from: 'h3', to: 'h7', weight: 0.9, active: false },
    
    { from: 'h4', to: 'h5', weight: 0.5, active: false },
    { from: 'h4', to: 'h6', weight: -0.3, active: false },
    { from: 'h4', to: 'h7', weight: 0.2, active: false },
    
    // Hidden layer 2 to output
    { from: 'h5', to: 'o1', weight: 0.8, active: false },
    { from: 'h5', to: 'o2', weight: -0.4, active: false },
    { from: 'h6', to: 'o1', weight: 0.6, active: false },
    { from: 'h6', to: 'o2', weight: 0.9, active: false },
    { from: 'h7', to: 'o1', weight: -0.2, active: false },
    { from: 'h7', to: 'o2', weight: 0.7, active: false }
  ]);

  const [activeConnections, setActiveConnections] = useState<string[]>([]);
  const [neuronValues, setNeuronValues] = useState<Record<string, number>>({});

  // Update input values when scenario changes
  useEffect(() => {
    setInputValues(scenarios[currentScenario].inputs.map(input => input.value));
  }, [currentScenario]);

  function sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  function relu(x: number): number {
    return Math.max(0, x);
  }

  function normalizeInput(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
  }

  function updateInputValues(index: number, value: number) {
    const newValues = [...inputValues];
    newValues[index] = value;
    setInputValues(newValues);
    
    // Update corresponding input neurons
    const normalizedValue = normalizeInput(
      value, 
      scenarios[currentScenario].inputs[index].min, 
      scenarios[currentScenario].inputs[index].max
    );
    
    const newNeuronValues = { ...neuronValues };
    newNeuronValues[`i${index + 1}`] = normalizedValue;
    setNeuronValues(newNeuronValues);
  }

  function runSimulation() {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    setIsRunning(true);
    setStep(0);
    setActiveConnections([]);
    
    // Initialize with current input values
    const initialValues: Record<string, number> = {};
    inputValues.forEach((value, index) => {
      const normalizedValue = normalizeInput(
        value,
        scenarios[currentScenario].inputs[index].min,
        scenarios[currentScenario].inputs[index].max
      );
      initialValues[`i${index + 1}`] = normalizedValue;
    });
    
    // Reset other layers
    neurons.forEach(neuron => {
      if (neuron.layer > 0) {
        initialValues[neuron.id] = 0;
      }
    });
    
    setNeuronValues(initialValues);

    // Start the forward pass
    setTimeout(() => processLayer(1), 800);
  }

  function processLayer(layerNum: number) {
    if (!isRunning) return;
    
    setStep(layerNum);
    const newValues = { ...neuronValues };
    const newActiveConnections: string[] = [];

    // Get neurons in the target layer
    const targetNeurons = neurons.filter(n => n.layer === layerNum);
    
    targetNeurons.forEach(targetNeuron => {
      let sum = 0;
      let connectionCount = 0;
      
      connections.forEach(conn => {
        if (conn.to === targetNeuron.id) {
          const inputValue = newValues[conn.from] || 0;
          const weightedInput = inputValue * conn.weight;
          sum += weightedInput;
          connectionCount++;
          
          // Store signal strength for visualization
          const updatedConnections = [...connections];
          const connIndex = updatedConnections.findIndex(c => c.from === conn.from && c.to === conn.to);
          if (connIndex !== -1) {
            updatedConnections[connIndex] = { ...conn, signal: Math.abs(weightedInput), active: true };
          }
          setConnections(updatedConnections);
          
          newActiveConnections.push(`${conn.from}-${conn.to}`);
        }
      });
      
      // Add bias and apply activation
      sum += targetNeuron.bias;
      newValues[targetNeuron.id] = layerNum === 3 ? sigmoid(sum) : relu(sum); // Output layer uses sigmoid, hidden uses ReLU
    });

    setNeuronValues(newValues);
    setActiveConnections(newActiveConnections);

    // Continue to next layer or finish
    if (layerNum < 3) {
      setTimeout(() => processLayer(layerNum + 1), 1200);
    } else {
      setTimeout(() => {
        setIsRunning(false);
        setStep(4);
        onComplete(90);
      }, 1500);
    }
  }

  function startTraining() {
    setIsTraining(true);
    setEpoch(0);
    setAccuracy(0);
    setLoss(1.0);
    
    // Simulate training process
    const trainStep = () => {
      setEpoch(prev => {
        const newEpoch = prev + 1;
        setAccuracy(Math.min(95, 20 + newEpoch * 2.5 + Math.random() * 5));
        setLoss(Math.max(0.05, 1.0 - newEpoch * 0.03 + Math.random() * 0.1));
        setTrainingProgress((newEpoch / 30) * 100);
        
        if (newEpoch < 30) {
          setTimeout(trainStep, 200);
        } else {
          setIsTraining(false);
          setTrainingProgress(100);
        }
        
        return newEpoch;
      });
    };
    
    trainStep();
  }

  function reset() {
    setIsRunning(false);
    setIsTraining(false);
    setStep(0);
    setActiveConnections([]);
    setNeuronValues({});
    setSelectedNeuron(null);
    setTrainingProgress(0);
    setAccuracy(0);
    setLoss(1.0);
    setEpoch(0);
  }

  function getNeuronColor(neuron: Neuron): string {
    if (neuron.layer === 0) return '#3b82f6'; // blue
    if (neuron.layer === 1) return '#8b5cf6'; // purple
    if (neuron.layer === 2) return '#f59e0b'; // orange
    return '#10b981'; // green
  }

  function getNeuronOpacity(neuron: Neuron): number {
    const value = neuronValues[neuron.id] ?? (neuron.layer === 0 ? neuron.value : 0);
    return Math.max(0.3, Math.min(1.0, value + 0.2));
  }

  function getConnectionOpacity(conn: Connection): number {
    return activeConnections.includes(`${conn.from}-${conn.to}`) ? 1 : 0.2;
  }

  function getConnectionWidth(conn: Connection): number {
    const baseWidth = Math.abs(conn.weight) * 3 + 1;
    const signal = conn.signal || 0;
    return Math.max(1, baseWidth + signal * 2);
  }

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            width: '4rem',
            height: '4rem',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '1.5rem'
          }}
        >
          🧠
        </motion.div>
        
        <h1 style={{ 
          fontSize: '2.25rem', 
          fontWeight: '700', 
          color: '#111827', 
          marginBottom: '0.5rem' 
        }}>
          Neural Network Lab
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#4b5563', 
          maxWidth: '48rem',
          margin: '0 auto'
        }}>
          Explore how AI makes decisions! Adjust inputs, watch the network process information, and see real-time predictions.
        </p>
      </div>

      {/* Scenario Selector */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem', textAlign: 'center' }}>
          Choose Your AI Challenge:
        </h3>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {scenarios.map((scenario, index) => (
            <motion.button
              key={scenario.id}
              onClick={() => setCurrentScenario(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: currentScenario === index ? '#8b5cf6' : 'white',
                color: currentScenario === index ? 'white' : '#374151',
                border: `2px solid ${currentScenario === index ? '#8b5cf6' : '#d1d5db'}`,
                borderRadius: '0.75rem',
                padding: '1rem 1.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                minWidth: '12rem',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{scenario.icon}</div>
              <div style={{ fontWeight: '600' }}>{scenario.name}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                {scenario.description}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Input Controls */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🎛️</span>
            Input Controls
          </h3>
          
          {scenarios[currentScenario].inputs.map((input, index) => (
            <div key={index} style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '0.5rem' 
              }}>
                {input.label}
              </label>
              <input
                type="range"
                min={input.min}
                max={input.max}
                value={inputValues[index]}
                onChange={(e) => updateInputValues(index, parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  height: '0.5rem',
                  borderRadius: '0.25rem',
                  background: '#e5e7eb',
                  outline: 'none',
                  marginBottom: '0.5rem'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280' }}>
                <span>{input.min}</span>
                <span style={{ fontWeight: '600', color: '#8b5cf6' }}>{inputValues[index]}</span>
                <span>{input.max}</span>
              </div>
            </div>
          ))}

          <div style={{
            backgroundColor: '#f3f4f6',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem' }}>
              <strong>Expected Output:</strong>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#059669', fontWeight: '500' }}>
              {scenarios[currentScenario].expectedOutput}
            </div>
          </div>

          <div style={{
            backgroundColor: '#dbeafe',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#1e40af' }}>
              💡 <strong>Real-world use:</strong> {scenarios[currentScenario].context}
            </div>
          </div>
        </div>

        {/* Network Visualization */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.75rem', 
          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)', 
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
              Network Architecture
            </h3>
            <button
              onClick={() => setShowWeights(!showWeights)}
              style={{
                backgroundColor: showWeights ? '#8b5cf6' : '#f3f4f6',
                color: showWeights ? 'white' : '#4b5563',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {showWeights ? 'Hide' : 'Show'} Weights
            </button>
          </div>

          <svg width="720" height="400" style={{ margin: '0 auto', display: 'block', backgroundColor: '#fafafa', borderRadius: '0.5rem' }}>
            {/* Background Grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Connections */}
            {connections.map((conn) => {
              const fromNeuron = neurons.find(n => n.id === conn.from);
              const toNeuron = neurons.find(n => n.id === conn.to);
              if (!fromNeuron || !toNeuron) return null;

              const isActive = activeConnections.includes(`${conn.from}-${conn.to}`);
              const opacity = getConnectionOpacity(conn);
              const strokeWidth = getConnectionWidth(conn);
              const color = conn.weight > 0 ? '#10b981' : '#ef4444';

              return (
                <g key={`${conn.from}-${conn.to}`}>
                  <motion.line
                    x1={fromNeuron.position.x}
                    y1={fromNeuron.position.y}
                    x2={toNeuron.position.x}
                    y2={toNeuron.position.y}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                    initial={{ pathLength: 0 }}
                    animate={{ 
                      pathLength: isActive ? 1 : 0.5,
                      opacity: opacity
                    }}
                    transition={{ duration: 0.5 }}
                  />
                  {showWeights && (
                    <text
                      x={(fromNeuron.position.x + toNeuron.position.x) / 2}
                      y={(fromNeuron.position.y + toNeuron.position.y) / 2}
                      textAnchor="middle"
                      fill="#374151"
                      fontSize="10"
                      fontWeight="500"
                    >
                      {conn.weight.toFixed(1)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Neurons */}
            {neurons.map((neuron) => {
              const value = neuronValues[neuron.id] ?? (neuron.layer === 0 ? neuron.value : 0);
              const isSelected = selectedNeuron === neuron.id;
              
              return (
                <g key={neuron.id}>
                  <motion.circle
                    cx={neuron.position.x}
                    cy={neuron.position.y}
                    r={isSelected ? "35" : "28"}
                    fill={getNeuronColor(neuron)}
                    opacity={getNeuronOpacity(neuron)}
                    stroke={isSelected ? "#fbbf24" : "white"}
                    strokeWidth={isSelected ? "3" : "2"}
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: 1,
                      opacity: getNeuronOpacity(neuron)
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedNeuron(selectedNeuron === neuron.id ? null : neuron.id)}
                    whileHover={{ scale: 1.1 }}
                  />
                  <text
                    x={neuron.position.x}
                    y={neuron.position.y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontWeight="600"
                    fontSize="12"
                    style={{ pointerEvents: 'none' }}
                  >
                    {value.toFixed(2)}
                  </text>
                  <text
                    x={neuron.position.x}
                    y={neuron.position.y + 45}
                    textAnchor="middle"
                    fill="#4b5563"
                    fontSize="10"
                    fontWeight="500"
                    style={{ pointerEvents: 'none' }}
                  >
                    {neuron.label}
                  </text>
                </g>
              );
            })}

            {/* Layer Labels */}
            <text x="120" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#374151">
              Input Layer
            </text>
            <text x="280" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#374151">
              Hidden Layer 1
            </text>
            <text x="440" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#374151">
              Hidden Layer 2
            </text>
            <text x="600" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#374151">
              Output Layer
            </text>
          </svg>

          {/* Neuron Details */}
          {selectedNeuron && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginTop: '1rem',
                border: '2px solid #fbbf24'
              }}
            >
              {(() => {
                const neuron = neurons.find(n => n.id === selectedNeuron);
                const value = neuronValues[selectedNeuron] ?? 0;
                return (
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                      {neuron?.label} Details
                    </h4>
                    <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                      <div><strong>Current Value:</strong> {value.toFixed(3)}</div>
                      <div><strong>Bias:</strong> {neuron?.bias.toFixed(3)}</div>
                      <div><strong>Layer:</strong> {neuron?.layer === 0 ? 'Input' : neuron?.layer === 3 ? 'Output' : `Hidden ${neuron?.layer}`}</div>
                      <div><strong>Activation:</strong> {neuron?.layer === 3 ? 'Sigmoid' : neuron?.layer === 0 ? 'Linear' : 'ReLU'}</div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </div>

        {/* Training & Results Panel */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp style={{ width: '1.25rem', height: '1.25rem', color: '#8b5cf6' }} />
            AI Performance
          </h3>

          {/* Training Stats */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Accuracy</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#059669' }}>{accuracy.toFixed(1)}%</span>
            </div>
            <div style={{ backgroundColor: '#e5e7eb', borderRadius: '0.25rem', height: '0.5rem' }}>
              <motion.div
                style={{
                  backgroundColor: '#10b981',
                  height: '100%',
                  borderRadius: '0.25rem'
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${accuracy}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Loss</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#dc2626' }}>{loss.toFixed(3)}</span>
            </div>
            <div style={{ backgroundColor: '#e5e7eb', borderRadius: '0.25rem', height: '0.5rem' }}>
              <motion.div
                style={{
                  backgroundColor: '#ef4444',
                  height: '100%',
                  borderRadius: '0.25rem'
                }}
                initial={{ width: '100%' }}
                animate={{ width: `${loss * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {trainingProgress > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Training Progress</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#8b5cf6' }}>Epoch {epoch}/30</span>
              </div>
              <div style={{ backgroundColor: '#e5e7eb', borderRadius: '0.25rem', height: '0.5rem' }}>
                <motion.div
                  style={{
                    backgroundColor: '#8b5cf6',
                    height: '100%',
                    borderRadius: '0.25rem'
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${trainingProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Current Prediction */}
          <div style={{
            backgroundColor: step === 4 ? '#ecfccb' : '#f8fafc',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem',
            border: step === 4 ? '2px solid #84cc16' : '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Current Prediction:
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: step === 4 ? '#365314' : '#4b5563' }}>
              {step === 4 ? (
                <>
                  {(neuronValues['o2'] || 0) > 0.5 ? '✅ ' : '❌ '}
                  Confidence: {((neuronValues['o1'] || 0) * 100).toFixed(1)}%
                </>
              ) : (
                'Run simulation to see prediction'
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <motion.button
              onClick={runSimulation}
              disabled={isTraining}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                backgroundColor: isRunning ? '#ef4444' : '#8b5cf6',
                color: 'white',
                fontWeight: '500',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: isTraining ? 'not-allowed' : 'pointer',
                opacity: isTraining ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              {isRunning ? <Pause style={{ width: '1rem', height: '1rem' }} /> : <Play style={{ width: '1rem', height: '1rem' }} />}
              {isRunning ? 'Stop' : 'Run Prediction'}
            </motion.button>

            <motion.button
              onClick={startTraining}
              disabled={isRunning || isTraining}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                backgroundColor: isTraining ? '#f59e0b' : '#10b981',
                color: 'white',
                fontWeight: '500',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: (isRunning || isTraining) ? 'not-allowed' : 'pointer',
                opacity: (isRunning || isTraining) ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              <Brain style={{ width: '1rem', height: '1rem' }} />
              {isTraining ? 'Training...' : 'Train Network'}
            </motion.button>

            <motion.button
              onClick={reset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                backgroundColor: 'transparent',
                color: '#6b7280',
                fontWeight: '500',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '2px solid #d1d5db',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              <RotateCcw style={{ width: '1rem', height: '1rem' }} />
              Reset
            </motion.button>
          </div>
        </div>
      </div>

      {/* Status Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          marginTop: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Zap style={{ width: '1.5rem', height: '1.5rem', color: '#eab308' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
            {step === 0 && 'Ready to explore neural networks!'}
            {step === 1 && '🔄 Processing first hidden layer...'}
            {step === 2 && '🔄 Processing second hidden layer...'}
            {step === 3 && '🔄 Generating final output...'}
            {step === 4 && '✅ Neural network prediction complete!'}
            {isTraining && '🧠 Training the neural network...'}
          </h3>
        </div>
        
        <div style={{ color: '#4b5563', lineHeight: '1.6' }}>
          {step === 0 && (
            <p>
              🎯 Choose a scenario above, adjust the input values using the sliders, then click "Run Prediction" to see how the neural network processes your data and makes decisions!
            </p>
          )}
          {step === 1 && (
            <p>
              The first hidden layer is extracting basic features from your inputs. Each neuron is learning to detect specific patterns by combining the input values with learned weights.
            </p>
          )}
          {step === 2 && (
            <p>
              The second hidden layer combines the features from the first layer to detect more complex patterns. This is where the "deep learning" magic happens!
            </p>
          )}
          {step === 3 && (
            <p>
              The output layer is making the final decision based on all the processed information. It's combining everything the network has learned to give you a prediction.
            </p>
          )}
          {step === 4 && (
            <div>
              <p style={{ marginBottom: '1rem' }}>
                🎉 Amazing! You've seen how a deep neural network processes real-world data step by step:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))', gap: '1rem' }}>
                <div style={{ backgroundColor: '#dbeafe', borderRadius: '0.5rem', padding: '1rem' }}>
                  <strong>📊 Data Processing:</strong> Your inputs were normalized and fed through multiple layers
                </div>
                <div style={{ backgroundColor: '#ecfccb', borderRadius: '0.5rem', padding: '1rem' }}>
                  <strong>🧠 Feature Learning:</strong> Each layer learned increasingly complex patterns
                </div>
                <div style={{ backgroundColor: '#fef3c7', borderRadius: '0.5rem', padding: '1rem' }}>
                  <strong>🎯 Prediction:</strong> The network made an intelligent decision based on your data
                </div>
                <div style={{ backgroundColor: '#fecaca', borderRadius: '0.5rem', padding: '1rem' }}>
                  <strong>📈 Real Impact:</strong> This is how AI powers apps and services you use every day!
                </div>
              </div>
            </div>
          )}
          {isTraining && (
            <p>
              🚀 The network is learning from examples! Watch as the accuracy improves and the loss decreases. This is how AI gets smarter over time.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
