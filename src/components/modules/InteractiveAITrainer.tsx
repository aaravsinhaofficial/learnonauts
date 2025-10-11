import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Play, Brain, TestTube, Download, RotateCcw, AlertCircle } from 'lucide-react';
import type { AccessibilitySettings } from '../AccessibilityPanel';

interface TrainingExample {
  id: string;
  inputs: number[];
  output: number;
  label?: string;
}

interface TestResult {
  input: number[];
  predicted: number;
  confidence: number;
}

interface InteractiveAITrainerProps {
  onComplete?: (score: number) => void;
  accessibilitySettings?: AccessibilitySettings;
}

export function InteractiveAITrainer({ onComplete, accessibilitySettings }: InteractiveAITrainerProps) {
  // Model state
  const [modelType, setModelType] = useState<'classification' | 'regression'>('classification');
  const [numInputs, setNumInputs] = useState(2);
  const [trainingData, setTrainingData] = useState<TrainingExample[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [isTrained, setIsTrained] = useState(false);
  
  // Training results
  const [accuracy, setAccuracy] = useState(0);
  const [epochs, setEpochs] = useState(0);
  const [loss, setLoss] = useState(1.0);
  
  // Model parameters (simple neural network)
  const [weights, setWeights] = useState<[number[][], number[]] | []>([]);
  const [bias, setBias] = useState<[number[], number] | []>([]);
  
  // UI state
  const [currentView, setCurrentView] = useState<'setup' | 'train' | 'test'>('setup');
  const [testInputs, setTestInputs] = useState<number[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  // Input labels
  const [inputLabels, setInputLabels] = useState<string[]>(['Input 1', 'Input 2']);
  const [outputLabel, setOutputLabel] = useState('Output');
  
  // New example inputs
  const [newInputs, setNewInputs] = useState<number[]>([0, 0]);
  const [newOutput, setNewOutput] = useState(0);
  const [newLabel, setNewLabel] = useState('');

  // Initialize test inputs when switching to test view
  React.useEffect(() => {
    if (currentView === 'test' && testInputs.length === 0) {
      setTestInputs(new Array(numInputs).fill(0));
    }
  }, [currentView, numInputs, testInputs.length]);

  // Activation functions
  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
  const relu = (x: number) => Math.max(0, x);

  // Add training example
  const addTrainingExample = () => {
    if (newInputs.length !== numInputs) {
      alert('Please ensure all inputs are filled!');
      return;
    }

    const newExample: TrainingExample = {
      id: Date.now().toString(),
      inputs: [...newInputs],
      output: newOutput,
      label: newLabel || `Example ${trainingData.length + 1}`
    };

    setTrainingData([...trainingData, newExample]);
    
    // Reset inputs
    setNewInputs(new Array(numInputs).fill(0));
    setNewOutput(0);
    setNewLabel('');
  };

  // Remove training example
  const removeTrainingExample = (id: string) => {
    setTrainingData(trainingData.filter(ex => ex.id !== id));
  };

  // Train the model
  const trainModel = async () => {
    if (trainingData.length < 2) {
      alert('Please add at least 2 training examples!');
      return;
    }

    setIsTraining(true);
    setCurrentView('train');
    
    // Initialize weights and bias
    const hiddenSize = 4;
    let w1 = Array(numInputs).fill(0).map(() => 
      Array(hiddenSize).fill(0).map(() => Math.random() * 2 - 1)
    );
    let w2 = Array(hiddenSize).fill(0).map(() => Math.random() * 2 - 1);
    let b1 = Array(hiddenSize).fill(0).map(() => Math.random() * 2 - 1);
    let b2 = Math.random() * 2 - 1;
    
    const learningRate = 0.1;
    const maxEpochs = 100;
    
    // Training loop
    for (let epoch = 0; epoch < maxEpochs; epoch++) {
      let totalLoss = 0;
      
      // Shuffle training data
      const shuffled = [...trainingData].sort(() => Math.random() - 0.5);
      
      for (const example of shuffled) {
        // Forward pass
        // Hidden layer
        const hidden = [];
        for (let i = 0; i < hiddenSize; i++) {
          let sum = b1[i];
          for (let j = 0; j < numInputs; j++) {
            sum += example.inputs[j] * w1[j][i];
          }
          hidden.push(sigmoid(sum));
        }
        
        // Output layer
        let outputSum = b2;
        for (let i = 0; i < hiddenSize; i++) {
          outputSum += hidden[i] * w2[i];
        }
        const prediction = modelType === 'classification' ? sigmoid(outputSum) : outputSum;
        
        // Calculate error
        const error = example.output - prediction;
        totalLoss += error * error;
        
        // Backpropagation (simplified)
        const outputGrad = modelType === 'classification' 
          ? error * prediction * (1 - prediction)
          : error;
        
        // Update output layer weights
        for (let i = 0; i < hiddenSize; i++) {
          w2[i] += learningRate * outputGrad * hidden[i];
        }
        b2 += learningRate * outputGrad;
        
        // Update hidden layer weights
        for (let i = 0; i < hiddenSize; i++) {
          const hiddenGrad = outputGrad * w2[i] * hidden[i] * (1 - hidden[i]);
          for (let j = 0; j < numInputs; j++) {
            w1[j][i] += learningRate * hiddenGrad * example.inputs[j];
          }
          b1[i] += learningRate * hiddenGrad;
        }
      }
      
      // Calculate metrics
      const avgLoss = totalLoss / trainingData.length;
      let correct = 0;
      
      for (const example of trainingData) {
        const pred = predict(example.inputs, w1, w2, b1, b2);
        if (modelType === 'classification') {
          const predicted = pred > 0.5 ? 1 : 0;
          const actual = example.output > 0.5 ? 1 : 0;
          if (predicted === actual) correct++;
        } else {
          if (Math.abs(pred - example.output) < 0.3) correct++;
        }
      }
      
      const acc = (correct / trainingData.length) * 100;
      
      // Update UI
      setEpochs(epoch + 1);
      setLoss(avgLoss);
      setAccuracy(acc);
      
      // Delay for visualization
      await new Promise(resolve => setTimeout(resolve, accessibilitySettings?.reducedMotion ? 10 : 30));
      
      // Early stopping if accuracy is good
      if (acc >= 95 && avgLoss < 0.1) break;
    }
    
    // Save trained model
    setWeights([w1, w2]);
    setBias([b1, b2]);
    setIsTrained(true);
    setIsTraining(false);
  };

  // Predict function
  const predict = (inputs: number[], w1: number[][], w2: number[], b1: number[], b2: number): number => {
    const hiddenSize = w1[0].length;
    
    // Hidden layer
    const hidden = [];
    for (let i = 0; i < hiddenSize; i++) {
      let sum = b1[i];
      for (let j = 0; j < inputs.length; j++) {
        sum += inputs[j] * w1[j][i];
      }
      hidden.push(sigmoid(sum));
    }
    
    // Output layer
    let outputSum = b2;
    for (let i = 0; i < hiddenSize; i++) {
      outputSum += hidden[i] * w2[i];
    }
    
    return modelType === 'classification' ? sigmoid(outputSum) : outputSum;
  };

  // Test model with user input
  const testModel = () => {
    if (!isTrained) {
      alert('Please train the model first!');
      return;
    }

    const [w1, w2] = weights as [number[][], number[]];
    const [b1, b2] = bias as [number[], number];
    
    const prediction = predict(testInputs, w1, w2, b1, b2);
    const confidence = modelType === 'classification' 
      ? Math.max(prediction, 1 - prediction) * 100
      : 100 - Math.min(100, Math.abs(prediction - 0.5) * 100);
    
    const result: TestResult = {
      input: [...testInputs],
      predicted: prediction,
      confidence
    };
    
    setTestResults([result, ...testResults]);
  };

  // Reset everything
  const reset = () => {
    setTrainingData([]);
    setIsTrained(false);
    setIsTraining(false);
    setAccuracy(0);
    setEpochs(0);
    setLoss(1.0);
    setWeights([]);
    setBias([]);
    setTestResults([]);
    setCurrentView('setup');
  };

  // Download model
  const downloadModel = () => {
    const modelData = {
      type: modelType,
      numInputs,
      inputLabels,
      outputLabel,
      weights,
      bias,
      accuracy,
      epochs,
      trainingData: trainingData.length,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(modelData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my_ai_model_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Update number of inputs
  const updateNumInputs = (num: number) => {
    setNumInputs(num);
    setNewInputs(new Array(num).fill(0));
    setTestInputs(new Array(num).fill(0));
    setInputLabels(Array.from({ length: num }, (_, i) => `Input ${i + 1}`));
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
              Interactive AI Trainer
            </h1>
            <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
              Create your own training data and watch your AI learn in real-time!
            </p>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'center' }}>
            <button
              onClick={() => setCurrentView('setup')}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                backgroundColor: currentView === 'setup' ? '#667eea' : '#e5e7eb',
                color: currentView === 'setup' ? 'white' : '#374151',
                transition: 'all 0.2s'
              }}
            >
              📝 Setup & Data
            </button>
            <button
              onClick={() => trainingData.length >= 2 && setCurrentView('train')}
              disabled={trainingData.length < 2}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: trainingData.length >= 2 ? 'pointer' : 'not-allowed',
                fontWeight: '600',
                backgroundColor: currentView === 'train' ? '#667eea' : '#e5e7eb',
                color: currentView === 'train' ? 'white' : '#374151',
                opacity: trainingData.length < 2 ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              🧠 Train Model
            </button>
            <button
              onClick={() => isTrained && setCurrentView('test')}
              disabled={!isTrained}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: isTrained ? 'pointer' : 'not-allowed',
                fontWeight: '600',
                backgroundColor: currentView === 'test' ? '#667eea' : '#e5e7eb',
                color: currentView === 'test' ? 'white' : '#374151',
                opacity: !isTrained ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              🧪 Test Model
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Setup View */}
          {currentView === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              {/* Model Configuration */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
                  ⚙️ Model Configuration
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Model Type
                    </label>
                    <select
                      value={modelType}
                      onChange={(e) => setModelType(e.target.value as 'classification' | 'regression')}
                      disabled={trainingData.length > 0}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        cursor: trainingData.length > 0 ? 'not-allowed' : 'pointer',
                        opacity: trainingData.length > 0 ? 0.6 : 1
                      }}
                    >
                      <option value="classification">Classification (0 or 1)</option>
                      <option value="regression">Regression (Any number)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Number of Inputs
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={numInputs}
                      onChange={(e) => updateNumInputs(parseInt(e.target.value) || 1)}
                      disabled={trainingData.length > 0}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        cursor: trainingData.length > 0 ? 'not-allowed' : 'pointer',
                        opacity: trainingData.length > 0 ? 0.6 : 1
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Output Label
                    </label>
                    <input
                      type="text"
                      value={outputLabel}
                      onChange={(e) => setOutputLabel(e.target.value)}
                      placeholder="e.g., 'Spam', 'Price', 'Category'"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                {/* Input Labels */}
                <div style={{ marginTop: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                    Input Labels
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {inputLabels.map((label, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={label}
                        onChange={(e) => {
                          const newLabels = [...inputLabels];
                          newLabels[idx] = e.target.value;
                          setInputLabels(newLabels);
                        }}
                        placeholder={`Input ${idx + 1}`}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: '2px solid #e5e7eb',
                          fontSize: '0.875rem'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Add Training Data */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
                  📊 Add Training Examples
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  {newInputs.map((value, idx) => (
                    <div key={idx}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                        {inputLabels[idx]}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={value}
                        onChange={(e) => {
                          const newVals = [...newInputs];
                          newVals[idx] = parseFloat(e.target.value) || 0;
                          setNewInputs(newVals);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: '2px solid #e5e7eb',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  ))}
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      {outputLabel} {modelType === 'classification' && '(0 or 1)'}
                    </label>
                    <input
                      type="number"
                      step={modelType === 'classification' ? '1' : '0.1'}
                      min={modelType === 'classification' ? '0' : undefined}
                      max={modelType === 'classification' ? '1' : undefined}
                      value={newOutput}
                      onChange={(e) => setNewOutput(parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="e.g., 'Cat', 'High'"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={addTrainingExample}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                  <Plus size={20} />
                  Add Example
                </button>
              </div>

              {/* Training Data List */}
              {trainingData.length > 0 && (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  padding: '2rem',
                  boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                      📋 Training Data ({trainingData.length} examples)
                    </h2>
                    <button
                      onClick={trainModel}
                      disabled={trainingData.length < 2}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: trainingData.length >= 2 ? '#667eea' : '#e5e7eb',
                        color: trainingData.length >= 2 ? 'white' : '#9ca3af',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        cursor: trainingData.length >= 2 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (trainingData.length >= 2) {
                          e.currentTarget.style.backgroundColor = '#5a67d8';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (trainingData.length >= 2) {
                          e.currentTarget.style.backgroundColor = '#667eea';
                        }
                      }}
                    >
                      <Play size={20} />
                      Train AI Model
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                    {trainingData.map((example) => (
                      <div
                        key={example.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1rem',
                          backgroundColor: '#f9fafb',
                          borderRadius: '0.5rem',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                            {example.label}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Inputs: [{example.inputs.map(v => v.toFixed(2)).join(', ')}] → Output: {example.output.toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeTrainingExample(example.id)}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Training View */}
          {currentView === 'train' && (
            <motion.div
              key="train"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '3rem',
                boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                  {isTraining ? '🧠' : isTrained ? '✅' : '⚡'}
                </div>
                
                <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
                  {isTraining ? 'Training Your AI...' : isTrained ? 'Training Complete!' : 'Ready to Train'}
                </h2>

                {/* Training Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                  <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#eff6ff',
                    borderRadius: '0.75rem',
                    border: '2px solid #bfdbfe'
                  }}>
                    <div style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Epochs
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e3a8a' }}>
                      {epochs}
                    </div>
                  </div>

                  <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '0.75rem',
                    border: '2px solid #bbf7d0'
                  }}>
                    <div style={{ fontSize: '0.875rem', color: '#166534', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Accuracy
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#14532d' }}>
                      {accuracy.toFixed(1)}%
                    </div>
                  </div>

                  <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#fef3c7',
                    borderRadius: '0.75rem',
                    border: '2px solid #fde68a'
                  }}>
                    <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Loss
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#78350f' }}>
                      {loss.toFixed(4)}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {isTraining && (
                  <div style={{ marginTop: '2rem' }}>
                    <div style={{
                      width: '100%',
                      height: '1rem',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <motion.div
                        style={{
                          height: '100%',
                          background: 'linear-gradient(to right, #667eea, #764ba2)',
                          borderRadius: '9999px'
                        }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${(epochs / 100) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
                  {!isTraining && !isTrained && (
                    <button
                      onClick={trainModel}
                      style={{
                        padding: '1rem 2rem',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.75rem',
                        fontWeight: '600',
                        fontSize: '1.125rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Play size={24} />
                      Start Training
                    </button>
                  )}

                  {isTrained && (
                    <>
                      <button
                        onClick={() => setCurrentView('test')}
                        style={{
                          padding: '1rem 2rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.75rem',
                          fontWeight: '600',
                          fontSize: '1.125rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <TestTube size={24} />
                        Test Model
                      </button>
                      
                      <button
                        onClick={trainModel}
                        style={{
                          padding: '1rem 2rem',
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.75rem',
                          fontWeight: '600',
                          fontSize: '1.125rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <RotateCcw size={24} />
                        Retrain
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Test View */}
          {currentView === 'test' && (
            <motion.div
              key="test"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              {/* Test Input */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
                  🧪 Test Your AI Model
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {testInputs.map((value, idx) => (
                    <div key={idx}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                        {inputLabels[idx]}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={value}
                        onChange={(e) => {
                          const newInputs = [...testInputs];
                          newInputs[idx] = parseFloat(e.target.value) || 0;
                          setTestInputs(newInputs);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: '2px solid #e5e7eb',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={testModel}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    fontSize: '1.125rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a67d8'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
                >
                  <Brain size={24} />
                  Get Prediction
                </button>
              </div>

              {/* Test Results */}
              {testResults.length > 0 && (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  padding: '2rem',
                  boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
                    📊 Prediction Results
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {testResults.map((result, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          padding: '1.5rem',
                          backgroundColor: '#f0fdf4',
                          borderRadius: '0.75rem',
                          border: '2px solid #bbf7d0'
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#166534', fontWeight: '600', marginBottom: '0.5rem' }}>
                              Input: [{result.input.map(v => v.toFixed(2)).join(', ')}]
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#14532d' }}>
                              {modelType === 'classification' 
                                ? `Prediction: ${result.predicted > 0.5 ? '1 (Yes)' : '0 (No)'}`
                                : `Prediction: ${result.predicted.toFixed(3)}`
                              }
                            </div>
                          </div>
                          <div style={{
                            padding: '1rem',
                            backgroundColor: '#dcfce7',
                            borderRadius: '0.5rem',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '600' }}>
                              Confidence
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#14532d' }}>
                              {result.confidence.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
                  💾 Save Your Work
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <button
                    onClick={downloadModel}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                  >
                    <Download size={20} />
                    Download Model
                  </button>

                  <button
                    onClick={reset}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                  >
                    <RotateCcw size={20} />
                    Start Over
                  </button>

                  {onComplete && (
                    <button
                      onClick={() => onComplete(Math.round(accuracy))}
                      style={{
                        padding: '1rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                    >
                      ✓ Complete
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginTop: '2rem',
            border: '2px solid #f59e0b'
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
            <AlertCircle size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
                💡 Quick Tips
              </h3>
              <ul style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.6', paddingLeft: '1.25rem' }}>
                <li><strong>Classification:</strong> Use 0 or 1 for binary decisions (Yes/No, Spam/Not Spam)</li>
                <li><strong>Regression:</strong> Use any number for predictions (prices, temperatures, scores)</li>
                <li><strong>Training Data:</strong> Add at least 5-10 diverse examples for better accuracy</li>
                <li><strong>Testing:</strong> Try edge cases and values between your training examples</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
