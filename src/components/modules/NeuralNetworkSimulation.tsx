import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

interface Neuron {
  id: string;
  layer: number;
  position: { x: number; y: number };
  value: number;
  activation: number;
}

interface Connection {
  from: string;
  to: string;
  weight: number;
  active: boolean;
}

interface NeuralNetworkSimulationProps {
  onComplete: (score: number) => void;
}

export function NeuralNetworkSimulation({ onComplete }: NeuralNetworkSimulationProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [neurons] = useState<Neuron[]>([
    // Input layer
    { id: 'i1', layer: 0, position: { x: 100, y: 150 }, value: 0.8, activation: 0.8 },
    { id: 'i2', layer: 0, position: { x: 100, y: 250 }, value: 0.3, activation: 0.3 },
    { id: 'i3', layer: 0, position: { x: 100, y: 350 }, value: 0.9, activation: 0.9 },
    
    // Hidden layer
    { id: 'h1', layer: 1, position: { x: 300, y: 120 }, value: 0, activation: 0 },
    { id: 'h2', layer: 1, position: { x: 300, y: 220 }, value: 0, activation: 0 },
    { id: 'h3', layer: 1, position: { x: 300, y: 320 }, value: 0, activation: 0 },
    { id: 'h4', layer: 1, position: { x: 300, y: 420 }, value: 0, activation: 0 },
    
    // Output layer
    { id: 'o1', layer: 2, position: { x: 500, y: 200 }, value: 0, activation: 0 },
    { id: 'o2', layer: 2, position: { x: 500, y: 300 }, value: 0, activation: 0 }
  ]);

  const [connections] = useState<Connection[]>([
    // Input to hidden connections
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
    
    // Hidden to output connections
    { from: 'h1', to: 'o1', weight: 0.6, active: false },
    { from: 'h1', to: 'o2', weight: -0.3, active: false },
    { from: 'h2', to: 'o1', weight: 0.8, active: false },
    { from: 'h2', to: 'o2', weight: 0.4, active: false },
    { from: 'h3', to: 'o1', weight: -0.2, active: false },
    { from: 'h3', to: 'o2', weight: 0.9, active: false },
    { from: 'h4', to: 'o1', weight: 0.3, active: false },
    { from: 'h4', to: 'o2', weight: -0.1, active: false }
  ]);

  const [activeConnections, setActiveConnections] = useState<string[]>([]);
  const [neuronValues, setNeuronValues] = useState<Record<string, number>>({});

  function sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  function runSimulation() {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    setIsRunning(true);
    setStep(0);
    setActiveConnections([]);
    
    // Reset neuron values
    const initialValues: Record<string, number> = {};
    neurons.forEach(neuron => {
      if (neuron.layer === 0) {
        initialValues[neuron.id] = neuron.value;
      } else {
        initialValues[neuron.id] = 0;
      }
    });
    setNeuronValues(initialValues);

    // Simulate forward pass with delays
    setTimeout(() => processLayer1(), 500);
  }

  function processLayer1() {
    if (!isRunning) return;
    
    setStep(1);
    const newValues = { ...neuronValues };
    const newActiveConnections: string[] = [];

    // Calculate hidden layer values
    neurons.filter(n => n.layer === 1).forEach(hiddenNeuron => {
      let sum = 0;
      connections.forEach(conn => {
        if (conn.to === hiddenNeuron.id) {
          const inputValue = newValues[conn.from] || 0;
          sum += inputValue * conn.weight;
          newActiveConnections.push(`${conn.from}-${conn.to}`);
        }
      });
      newValues[hiddenNeuron.id] = sigmoid(sum);
    });

    setNeuronValues(newValues);
    setActiveConnections(newActiveConnections);

    setTimeout(() => processLayer2(), 1000);
  }

  function processLayer2() {
    if (!isRunning) return;
    
    setStep(2);
    const newValues = { ...neuronValues };
    const newActiveConnections: string[] = [];

    // Calculate output layer values
    neurons.filter(n => n.layer === 2).forEach(outputNeuron => {
      let sum = 0;
      connections.forEach(conn => {
        if (conn.to === outputNeuron.id) {
          const hiddenValue = newValues[conn.from] || 0;
          sum += hiddenValue * conn.weight;
          newActiveConnections.push(`${conn.from}-${conn.to}`);
        }
      });
      newValues[outputNeuron.id] = sigmoid(sum);
    });

    setNeuronValues(newValues);
    setActiveConnections(newActiveConnections);

    setTimeout(() => {
      setIsRunning(false);
      setStep(3);
      onComplete(85); // Completion score
    }, 1000);
  }

  function reset() {
    setIsRunning(false);
    setStep(0);
    setActiveConnections([]);
    setNeuronValues({});
  }

  function getNeuronColor(neuron: Neuron): string {
    const value = neuronValues[neuron.id] ?? (neuron.layer === 0 ? neuron.value : 0);
    if (neuron.layer === 0) return 'bg-blue-500';
    if (neuron.layer === 1) return 'bg-purple-500';
    return 'bg-green-500';
  }

  function getNeuronOpacity(neuron: Neuron): number {
    const value = neuronValues[neuron.id] ?? (neuron.layer === 0 ? neuron.value : 0);
    return Math.max(0.2, value);
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Neural Network Simulation
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Watch how information flows through a neural network! Each circle is a neuron, and the lines show connections between them.
        </p>
      </div>

      {/* Network Visualization */}
      <div className="card p-8">
        <svg width="600" height="500" className="mx-auto">
          {/* Connections */}
          {connections.map((conn) => {
            const fromNeuron = neurons.find(n => n.id === conn.from);
            const toNeuron = neurons.find(n => n.id === conn.to);
            if (!fromNeuron || !toNeuron) return null;

            const isActive = activeConnections.includes(`${conn.from}-${conn.to}`);
            const opacity = isActive ? 1 : 0.3;
            const strokeWidth = Math.abs(conn.weight) * 3 + 1;
            const color = conn.weight > 0 ? '#10b981' : '#ef4444';

            return (
              <motion.line
                key={`${conn.from}-${conn.to}`}
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
            );
          })}

          {/* Neurons */}
          {neurons.map((neuron) => {
            const value = neuronValues[neuron.id] ?? (neuron.layer === 0 ? neuron.value : 0);
            
            return (
              <g key={neuron.id}>
                <motion.circle
                  cx={neuron.position.x}
                  cy={neuron.position.y}
                  r="25"
                  className={getNeuronColor(neuron)}
                  opacity={getNeuronOpacity(neuron)}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: 1,
                    opacity: getNeuronOpacity(neuron)
                  }}
                  transition={{ duration: 0.3 }}
                />
                <text
                  x={neuron.position.x}
                  y={neuron.position.y + 5}
                  textAnchor="middle"
                  className="text-white font-semibold text-sm"
                >
                  {value.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Layer Labels */}
          <text x="100" y="50" textAnchor="middle" className="text-lg font-semibold text-gray-700">
            Input Layer
          </text>
          <text x="300" y="50" textAnchor="middle" className="text-lg font-semibold text-gray-700">
            Hidden Layer
          </text>
          <text x="500" y="50" textAnchor="middle" className="text-lg font-semibold text-gray-700">
            Output Layer
          </text>
        </svg>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <motion.button
          onClick={runSimulation}
          className="btn-primary flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isRunning && step < 3}
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isRunning ? 'Running...' : 'Run Simulation'}</span>
        </motion.button>

        <motion.button
          onClick={reset}
          className="btn-outline flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </motion.button>
      </div>

      {/* Step Information */}
      <div className="card p-6 max-w-2xl mx-auto">
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-semibold text-gray-900">
            {step === 0 && 'Ready to start simulation'}
            {step === 1 && 'Processing hidden layer...'}
            {step === 2 && 'Processing output layer...'}
            {step === 3 && 'Simulation complete!'}
          </h3>
        </div>
        
        <div className="space-y-2 text-gray-600">
          {step === 0 && (
            <p>Click "Run Simulation" to see how data flows through the network. Input values will be processed through hidden neurons to produce final outputs.</p>
          )}
          {step === 1 && (
            <p>Each hidden neuron is calculating a weighted sum of the input values, then applying an activation function to determine its output.</p>
          )}
          {step === 2 && (
            <p>The output neurons are now processing the hidden layer results to produce the final network outputs.</p>
          )}
          {step === 3 && (
            <div>
              <p className="mb-2">🎉 Great! You've seen how a neural network processes information:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Input data flows forward through the network</li>
                <li>Each connection has a weight that affects the signal strength</li>
                <li>Neurons combine inputs and apply activation functions</li>
                <li>The final outputs represent the network's "decision"</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
