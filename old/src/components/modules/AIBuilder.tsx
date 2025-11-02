import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Brain, RotateCcw, Download } from 'lucide-react';
import { aiEngine } from '../../services/aiEngine';
import type { AIModel as EngineModel, Dataset } from '../../services/aiEngine';
import type { AccessibilitySettings } from '../AccessibilityPanel';
import { TrainingVisualizer } from './TrainingVisualizer';
import { ModelEvaluator } from './ModelEvaluator';

interface AIBuilderProps {
  onComplete: (score: number) => void;
  accessibilitySettings?: AccessibilitySettings;
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  inputs: string[];
  outputs: string[];
  example: string;
}

interface TrainingData {
  inputs: number[];
  output: number;
  label?: string;
}

interface ModelState {
  weights: number[][];
  bias: number[];
  accuracy: number;
  trained: boolean;
  epoch: number;
  loss: number;
}

interface TrainingHistoryRecord {
  epoch: number;
  accuracy: number;
  loss: number;
  validationAccuracy?: number;
  trainingAccuracy?: number;
}

export function AIBuilder({ onComplete, accessibilitySettings }: AIBuilderProps) {
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showInteractive, setShowInteractive] = useState(false);
  const [modelState, setModelState] = useState<ModelState>({
    weights: [],
    bias: [],
    accuracy: 0,
    trained: false,
    epoch: 0,
    loss: 1.0
  });
  
  // Just remove these unused functions as they're causing errors and not being used properly
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [trainingHistory, setTrainingHistory] = useState<TrainingHistoryRecord[]>([]);
  const [trainingEpochs, setTrainingEpochs] = useState(50);
  const [learningRate, setLearningRate] = useState(0.1);
  const [batchSize, setBatchSize] = useState(4);
  
  // Real AI Engine Integration
  const [realAIModel, setRealAIModel] = useState<EngineModel | null>(null);
  const [availableDatasets, setAvailableDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  // Initialize available datasets
  React.useEffect(() => {
    setAvailableDatasets(aiEngine.getAllDatasets());
  }, []);

  // AI Model Algorithms
  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
  
  const initializeModel = (inputSize: number, outputSize: number): ModelState => {
    const weights = Array(outputSize).fill(0).map(() => 
      Array(inputSize).fill(0).map(() => Math.random() * 2 - 1)
    );
    const bias = Array(outputSize).fill(0).map(() => Math.random() * 2 - 1);
    
    return {
      weights,
      bias,
      accuracy: 0,
      trained: false,
      epoch: 0,
      loss: 1.0
    };
  };

  const predict = useCallback((inputs: number[], model: ModelState): number[] => {
    return model.weights.map((weightRow, i) => {
      const sum = weightRow.reduce((acc, weight, j) => acc + weight * inputs[j], 0) + model.bias[i];
      return sigmoid(sum);
    });
  }, []);

  const trainModel = useCallback(async (data: TrainingData[], model: ModelState, epochs: number = 50, lr: number = 0.1, batch: number = 4) => {
    setIsTraining(true);
    setTrainingHistory([]);
    let currentModel = { ...model };
    const learningRate = lr;
    
    // Separate some data for validation during training
    const validationSplit = 0.2; // 20% for validation
    const shuffledFullData = [...data].sort(() => Math.random() - 0.5);
    const validationSize = Math.floor(shuffledFullData.length * validationSplit);
    const validationData = shuffledFullData.slice(0, validationSize);
    const trainingData = shuffledFullData.slice(validationSize);

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalError = 0;
      
      // Shuffle data for stochastic gradient descent
      const shuffledData = [...trainingData].sort(() => Math.random() - 0.5);
      
      // Process in batches
      for (let i = 0; i < shuffledData.length; i += batch) {
        const batchData = shuffledData.slice(i, i + batch);

        for (const sample of batchData) {
          const prediction = predict(sample.inputs, currentModel);
          const error = sample.output - prediction[0];
          totalError += error * error;

          // Update weights and bias (simplified gradient descent)
          for (let i = 0; i < currentModel.weights.length; i++) {
            for (let j = 0; j < currentModel.weights[i].length; j++) {
              currentModel.weights[i][j] += learningRate * error * sample.inputs[j];
            }
            currentModel.bias[i] += learningRate * error;
          }
        }
      }

      // Calculate training metrics
      const trainingLoss = totalError / trainingData.length;
      const trainingAccuracy = Math.max(0, 100 - (totalError / trainingData.length) * 100);
      
      // Calculate validation metrics
      let validationError = 0;
      let correctPredictions = 0;
      
      for (const sample of validationData) {
        const prediction = predict(sample.inputs, currentModel);
        const error = sample.output - prediction[0];
        validationError += error * error;
        
        // Count correct predictions (using threshold of 0.5)
        const predictedClass = prediction[0] > 0.5 ? 1 : 0;
        const actualClass = sample.output > 0.5 ? 1 : 0;
        if (predictedClass === actualClass) {
          correctPredictions++;
        }
      }
      
      const validationLoss = validationData.length > 0 ? validationError / validationData.length : 0;
      const validationAccuracy = validationData.length > 0 ? 
        (correctPredictions / validationData.length) * 100 : trainingAccuracy;
      
      // Update model with validation accuracy if available, otherwise use training accuracy
      currentModel.accuracy = Math.min(95, validationData.length > 0 ? validationAccuracy : trainingAccuracy);
      currentModel.epoch = epoch + 1;
      currentModel.loss = validationData.length > 0 ? validationLoss : trainingLoss;
      
      // Add to training history with both metrics
      setTrainingHistory(prev => [
        ...prev, 
        { 
          epoch: epoch + 1, 
          accuracy: currentModel.accuracy, 
          loss: currentModel.loss,
          validationAccuracy: validationData.length > 0 ? validationAccuracy : undefined,
          trainingAccuracy: trainingAccuracy
        }
      ]);
      
      setModelState({ ...currentModel });
      
      // Add delay for visual effect - slower for first 10 epochs for better visualization
      await new Promise(resolve => setTimeout(
        resolve, 
        epoch < 10 ? (accessibilitySettings?.reducedMotion ? 50 : 200) : (accessibilitySettings?.reducedMotion ? 20 : 50)
      ));
    }

    currentModel.trained = true;
    setModelState({ ...currentModel });
    setIsTraining(false);
  }, [predict, accessibilitySettings]);

  const generateTrainingData = (modelType: string): TrainingData[] => {
    switch (modelType) {
      case 'recommendation':
        return [
          { inputs: [25, 0.8, 4.2], output: 0.9, label: 'Action Movie' },
          { inputs: [35, 0.3, 3.1], output: 0.2, label: 'Romance Movie' },
          { inputs: [18, 0.9, 4.8], output: 0.95, label: 'Sci-Fi Movie' },
          { inputs: [45, 0.1, 2.5], output: 0.1, label: 'Documentary' },
          { inputs: [22, 0.7, 4.0], output: 0.8, label: 'Comedy Movie' },
          { inputs: [30, 0.5, 3.5], output: 0.6, label: 'Drama Movie' },
        ];
      case 'image-classifier':
        return [
          { inputs: [0.8, 0.2, 0.9], output: 0.9, label: 'Cat' },
          { inputs: [0.3, 0.7, 0.4], output: 0.1, label: 'Dog' },
          { inputs: [0.9, 0.1, 0.8], output: 0.95, label: 'Cat' },
          { inputs: [0.2, 0.8, 0.3], output: 0.05, label: 'Dog' },
          { inputs: [0.7, 0.3, 0.7], output: 0.8, label: 'Cat' },
          { inputs: [0.4, 0.6, 0.5], output: 0.3, label: 'Dog' },
        ];
      case 'chat-bot':
        return [
          { inputs: [0.9, 0.1, 0.8], output: 0.9, label: 'Friendly Response' },
          { inputs: [0.2, 0.8, 0.3], output: 0.1, label: 'Helpful Response' },
          { inputs: [0.7, 0.5, 0.6], output: 0.7, label: 'Informative Response' },
          { inputs: [0.1, 0.9, 0.2], output: 0.05, label: 'Question Response' },
          { inputs: [0.8, 0.3, 0.9], output: 0.85, label: 'Encouraging Response' },
          { inputs: [0.4, 0.7, 0.4], output: 0.4, label: 'Neutral Response' },
        ];
      default:
        return [];
    }
  };

  const interpretPrediction = (modelType: string, prediction: number[]): string => {
    const confidence = Math.round(prediction[0] * 100);
    
    switch (modelType) {
      case 'recommendation':
        if (prediction[0] > 0.7) return `🎬 Highly Recommended! (${confidence}% confidence) - Perfect match for your preferences!`;
        if (prediction[0] > 0.4) return `👍 Good Match (${confidence}% confidence) - You might enjoy this!`;
        return `👎 Not Recommended (${confidence}% confidence) - Probably not your style.`;
        
      case 'image-classifier':
        if (prediction[0] > 0.6) return `🐱 Cat detected! (${confidence}% confidence)`;
        return `🐕 Dog detected! (${100 - confidence}% confidence)`;
        
      case 'chat-bot':
        if (prediction[0] > 0.7) return `😊 Positive tone response (${confidence}% confidence) - "I'd be happy to help you with that!"`;
        if (prediction[0] > 0.4) return `🤔 Neutral tone response (${confidence}% confidence) - "Let me think about that question."`;
        return `📚 Informative tone response (${100 - confidence}% confidence) - "Here's what I found for you..."`;
        
      default:
        return `Prediction: ${confidence}%`;
    }
  };

  const aiModels: AIModel[] = [
    {
      id: 'recommendation',
      name: 'Recommendation Engine',
      description: 'Build an AI that suggests things you might like!',
      icon: '🎯',
      difficulty: 'Easy',
      inputs: ['Age', 'Favorite Genre', 'Previous Ratings'],
      outputs: ['Recommended Movie', 'Confidence Score'],
      example: 'Like Netflix suggesting movies you might enjoy'
    },
    {
      id: 'image-classifier',
      name: 'Image Classifier',
      description: 'Create an AI that can recognize objects in pictures!',
      icon: '📸',
      difficulty: 'Medium',
      inputs: ['Image Pixels', 'Color Patterns', 'Shape Features'],
      outputs: ['Object Type', 'Confidence Level'],
      example: 'Like your phone recognizing if a photo has a cat or dog'
    },
    {
      id: 'chat-bot',
      name: 'Smart Chatbot',
      description: 'Design an AI assistant that can have conversations!',
      icon: '💬',
      difficulty: 'Hard',
      inputs: ['User Message', 'Conversation History', 'Context'],
      outputs: ['Response Text', 'Emotion Tone'],
      example: 'Like talking to Siri or ChatGPT'
    }
  ];

  const handleBuildStart = async (model: AIModel) => {
    setSelectedModel(model);
    setIsBuilding(true);
    setBuildStep(1);
    
    // Create real AI model using the engine
    let modelType: 'recommendation' | 'classification' | 'regression' | 'chatbot';
    let datasetId: string;
    
    switch (model.id) {
      case 'recommendation':
        modelType = 'recommendation';
        datasetId = 'movie-recommendations';
        break;
      case 'image-classifier':
        modelType = 'classification';
        datasetId = 'email-classification';
        break;
      case 'chat-bot':
        modelType = 'chatbot';
        datasetId = 'chatbot-training';
        break;
      default:
        modelType = 'regression';
        datasetId = 'house-prices';
    }
    
    // Create and train real AI model
    const realModelId = aiEngine.createModel(modelType, model.name);
    const realModel = aiEngine.getModel(realModelId);
    const dataset = aiEngine.getDataset(datasetId);
    
    if (realModel && dataset) {
      setRealAIModel(realModel);
      setSelectedDataset(dataset);
    }
    
    // Initialize the simulated model for UI
    const newModel = initializeModel(model.inputs.length, model.outputs.length);
    setModelState(newModel);
    
    // Generate training data
    const data = generateTrainingData(model.id);
    setTrainingData(data);
    
    // Simulate building process with real training
    setTimeout(() => setBuildStep(2), 1500);
    setTimeout(async () => {
      setBuildStep(3);
      
      // Train the real AI model
      if (realModel && dataset) {
        try {
          await aiEngine.trainModel(realModelId, datasetId);
          setModelState(prev => ({
            ...prev,
            accuracy: realModel.accuracy,
            trained: true
          }));
        } catch (error) {
          console.error('Training failed:', error);
        }
      }
      
      // Also train the simulated model for UI
      if (showAdvancedOptions) {
        await trainModel(data, newModel, trainingEpochs, learningRate, batchSize);
      } else {
        await trainModel(data, newModel, 30);
      }
      
      setBuildStep(4);
      
      // Save a reference for the handleModelTest function
      if (data.length > 0) {
        handleModelTest(data[0].inputs);
      }
      
      setTimeout(() => {
        setIsComplete(true);
        setShowInteractive(true);
      }, 1000);
    }, 3000);
  };

  const handleReset = () => {
    setSelectedModel(null);
    setIsBuilding(false);
    setBuildStep(0);
    setIsComplete(false);
    setShowInteractive(false);
    setModelState({
      weights: [],
      bias: [],
      accuracy: 0,
      trained: false,
      epoch: 0,
      loss: 1.0
    });
    setTrainingHistory([]);
  };

  // Add a method to handle test case execution with ModelEvaluator
  const handleModelTest = (testInputs: number[]) => {
    if (!selectedModel || !modelState.trained) return;
    
    const result = predict(testInputs, modelState);
    const interpretation = interpretPrediction(selectedModel.id, result);
    
    // If real AI model is trained, use it
    if (realAIModel && realAIModel.isTrained) {
      let realResult;
      
      switch (selectedModel.id) {
        case 'recommendation':
          realResult = realAIModel.predict({ 
            userId: 'test_user',
            availableItems: ['Action Movie', 'Comedy Film', 'Drama Series']
          });
          setTestResult(realResult);
          break;
          
        case 'image-classifier':
          realResult = realAIModel.predict(testInputs);
          setTestResult(realResult);
          break;
          
        case 'chat-bot':
          realResult = realAIModel.predict('Hello, how are you?');
          setTestResult(realResult);
          break;
          
        default:
          realResult = realAIModel.predict(testInputs);
          setTestResult(realResult);
      }
    }
    
    return interpretation;
  };

  const handleDownloadModel = () => {
    if (!realAIModel || !selectedModel) return;
    
    const modelData = {
      name: selectedModel.name,
      type: selectedModel.id,
      accuracy: realAIModel.accuracy,
      exportedData: realAIModel.export(),
      createdAt: new Date().toISOString(),
      dataset: selectedDataset?.name || 'Unknown'
    };
    
    const blob = new Blob([JSON.stringify(modelData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedModel.name.replace(/\s+/g, '_')}_model.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getInputLabels = (modelType: string): string[] => {
    switch (modelType) {
      case 'recommendation':
        return ['Age', 'Genre Preference (0-1)', 'Average Rating (1-5)'];
      case 'image-classifier':
        return ['Red Channel (0-1)', 'Green Channel (0-1)', 'Blue Channel (0-1)'];
      case 'chat-bot':
        return ['Question Type (0-1)', 'Emotion Level (0-1)', 'Complexity (0-1)'];
      default:
        return [];
    }
  };

  // Add advanced training options UI
  const renderAdvancedOptions = () => {
    if (!showAdvancedOptions) return null;
    
    return (
      <div style={{
        backgroundColor: 'var(--surface-color)',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginTop: '1rem',
        marginBottom: '1rem',
        border: '1px solid var(--border-color)'
      }}>
        <h4 style={{ 
          fontWeight: '600', 
          fontSize: '0.875rem', 
          marginBottom: '0.75rem',
          color: 'var(--primary-text)'
        }}>
          Advanced Training Options
        </h4>
        
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '0.75rem', 
            color: 'var(--secondary-text)', 
            marginBottom: '0.25rem' 
          }}>
            Training Epochs: {trainingEpochs}
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={trainingEpochs}
            onChange={(e) => setTrainingEpochs(parseInt(e.target.value))}
            style={{ 
              width: '100%',
              accentColor: 'var(--accent-color)' 
            }}
          />
        </div>
        
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '0.75rem', 
            color: 'var(--secondary-text)', 
            marginBottom: '0.25rem' 
          }}>
            Learning Rate: {learningRate}
          </label>
          <input
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={learningRate}
            onChange={(e) => setLearningRate(parseFloat(e.target.value))}
            style={{ 
              width: '100%',
              accentColor: 'var(--accent-color)' 
            }}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.75rem', 
            color: 'var(--secondary-text)', 
            marginBottom: '0.25rem' 
          }}>
            Batch Size: {batchSize}
          </label>
          <input
            type="range"
            min="1"
            max="16"
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value))}
            style={{ 
              width: '100%',
              accentColor: 'var(--accent-color)' 
            }}
          />
        </div>
      </div>
    );
  };

  // Custom train button with advanced options
  const trainButtonSection = () => {
    if (buildStep !== 2 && buildStep !== 4) return null;
    
    return (
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <button
            onClick={() => {
              if (buildStep === 2 || (buildStep === 4 && !isTraining)) {
                setIsTraining(true);
                setBuildStep(3);
                trainModel(trainingData, modelState, trainingEpochs, learningRate, batchSize)
                  .then(() => setBuildStep(4));
              }
            }}
            disabled={isTraining}
            style={{
              backgroundColor: isTraining ? 'var(--disabled-color)' : 'var(--accent-color)',
              color: 'var(--button-text)',
              fontWeight: '600',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: isTraining ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background-color 0.2s'
            }}
          >
            {isTraining ? 'Training...' : buildStep === 4 ? 'Retrain Model' : 'Start Training'}
          </button>
          
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--secondary-text)',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            {showAdvancedOptions ? 'Hide Advanced' : 'Show Advanced'}
          </button>
        </div>
        
        {renderAdvancedOptions()}
      </div>
    );
  };

  if (isComplete && selectedModel && showInteractive) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--background)',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
              backgroundColor: 'var(--card-background)',
              borderRadius: '1rem',
              padding: '2rem',
              marginBottom: '2rem',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px var(--shadow-color)'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-text)', marginBottom: '1rem' }}>
              Your {selectedModel.name} is Ready!
            </h2>
            <p style={{ color: 'var(--secondary-text)', fontSize: '1.125rem', marginBottom: '1rem' }}>
              🎯 Accuracy: <strong>{Math.round(modelState.accuracy)}%</strong> | 
              ⚡ Training Epochs: <strong>{modelState.epoch}</strong>
            </p>
            <p style={{ color: 'var(--secondary-text)' }}>
              Your AI has been trained and is ready to make predictions! Test it below.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            {/* Model Evaluator Integration */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                backgroundColor: 'var(--card-background)',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 25px 50px -12px var(--shadow-color)'
              }}
            >
              <ModelEvaluator
                modelType={selectedModel.id}
                isModelTrained={modelState.trained}
                accuracy={modelState.accuracy}
                predict={(inputs) => {
                  // Use directly with the model predict function
                  const prediction = predict(inputs, modelState);
                  
                  // Use test inputs for real AI evaluation if available
                  if (realAIModel?.isTrained) {
                    handleModelTest(inputs);
                  }
                  
                  return prediction;
                }}
                testData={trainingData}
                inputLabels={getInputLabels(selectedModel.id)}
                accessibilitySettings={accessibilitySettings}
              />
            </motion.div>

            {/* Model Details */}
            <motion.div
              initial={{ x: 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                backgroundColor: 'var(--card-background)',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 25px 50px -12px var(--shadow-color)'
              }}
            >
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--primary-text)', marginBottom: '1.5rem' }}>
                📊 Model Details
              </h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  backgroundColor: 'var(--background)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <h4 style={{ fontWeight: '600', color: 'var(--primary-text)', marginBottom: '0.5rem' }}>
                    🧠 Architecture
                  </h4>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    • Input Layer: {selectedModel.inputs.length} neurons
                  </p>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    • Hidden Layer: 4 neurons
                  </p>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '0.875rem' }}>
                    • Output Layer: {selectedModel.outputs.length} neuron(s)
                  </p>
                </div>

                <div style={{
                  backgroundColor: '#f0f9ff',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                    📈 Training Results
                  </h4>
                  <p style={{ color: '#0369a1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    • Final Accuracy: {Math.round(modelState.accuracy)}%
                  </p>
                  <p style={{ color: '#0369a1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    • Training Epochs: {modelState.epoch}
                  </p>
                  <p style={{ color: '#0369a1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    • Training Samples: {trainingData.length}
                  </p>
                </div>

                <div style={{
                  backgroundColor: '#f0fdf4',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                    💡 How It Works
                  </h4>
                  <p style={{ color: '#166534', fontSize: '0.875rem', lineHeight: '1.5' }}>
                    Your AI uses a neural network with weighted connections. 
                    During training, it learned patterns from example data by 
                    adjusting these weights to minimize prediction errors.
                  </p>
                </div>

                {selectedDataset && (
                  <div style={{
                    backgroundColor: '#fef7ff',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                      📊 Training Dataset
                    </h4>
                    <p style={{ color: '#7c2d12', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      <strong>Dataset:</strong> {selectedDataset.name}
                    </p>
                    <p style={{ color: '#7c2d12', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      <strong>Samples:</strong> {selectedDataset.data.length} training examples
                    </p>
                    <p style={{ color: '#7c2d12', fontSize: '0.875rem' }}>
                      <strong>Features:</strong> {selectedDataset.features.join(', ')}
                    </p>
                  </div>
                )}

                {testResult && (
                  <div style={{
                    backgroundColor: '#f0f9ff',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                      🔬 Test Result
                    </h4>
                    <p style={{ color: '#0369a1', fontSize: '0.875rem' }}>
                      <strong>Raw Output:</strong> {JSON.stringify(testResult)}
                    </p>
                  </div>
                )}

                {availableDatasets.length > 0 && (
                  <div style={{
                    backgroundColor: '#fffbeb',
                    borderRadius: '0.5rem',
                    padding: '1rem'
                  }}>
                    <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                      🗂️ Available Datasets
                    </h4>
                    <p style={{ color: '#92400e', fontSize: '0.875rem' }}>
                      {availableDatasets.length} datasets ready for training
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleReset}
                  style={{
                    flex: 1,
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    fontWeight: '600',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <RotateCcw size={14} />
                  Build Another
                </button>
                
                {realAIModel && realAIModel.isTrained && (
                  <button
                    onClick={handleDownloadModel}
                    style={{
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      fontWeight: '600',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Download size={14} />
                    Export
                  </button>
                )}
                
                <button
                  onClick={() => onComplete(Math.round(modelState.accuracy))}
                  style={{
                    flex: 1,
                    backgroundColor: '#059669',
                    color: 'white',
                    fontWeight: '600',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Brain size={14} />
                  Complete
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (isBuilding && selectedModel) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            backgroundColor: 'var(--card-background)',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
            maxWidth: '60rem',
            width: '100%',
            boxShadow: '0 25px 50px -12px var(--shadow-color)'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{selectedModel.icon}</div>
          <h2 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700', 
            color: 'var(--primary-text)', 
            marginBottom: '1rem' 
          }}>
            Building Your {selectedModel.name}
          </h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              backgroundColor: 'var(--surface-color)',
              height: '0.5rem',
              borderRadius: '0.25rem',
              marginBottom: '1rem'
            }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${(buildStep / 4) * 100}%` }}
                style={{
                  backgroundColor: 'var(--accent-color)',
                  height: '100%',
                  borderRadius: '0.25rem'
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            <p style={{ 
              color: 'var(--secondary-text)', 
              fontSize: '1.125rem' 
            }}>
              {buildStep === 1 && '🔧 Setting up neural network architecture...'}
              {buildStep === 2 && '🧠 Training AI with example data...'}
              {buildStep === 3 && `⚡ Training in progress... (Epoch ${modelState.epoch}, Accuracy: ${Math.round(modelState.accuracy)}%)`}
              {buildStep === 4 && '✨ AI model ready for deployment!'}
            </p>
          </div>

          {/* Training Visualizer Integration */}
          {buildStep >= 2 && (
            <div style={{
              backgroundColor: 'var(--surface-color)',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              border: '1px solid var(--border-color)'
            }}>
              <TrainingVisualizer
                isTraining={isTraining || buildStep === 3}
                epoch={modelState.epoch}
                accuracy={modelState.accuracy}
                loss={modelState.loss || 0}
                trainingHistory={trainingHistory}
                modelType={selectedModel.id}
                accessibilitySettings={accessibilitySettings}
              />
              
              {trainButtonSection()}
            </div>
          )}

          {/* Model Information - Adapted from existing code */}
          <div style={{
            backgroundColor: 'var(--surface-color)',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ 
              fontWeight: '600', 
              color: 'var(--primary-text)', 
              marginBottom: '0.5rem' 
            }}>
              Real-Time Stats:
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '1rem', 
              fontSize: '0.875rem' 
            }}>
              <div>
                <span style={{ color: 'var(--secondary-text)' }}>Accuracy:</span>
                <span style={{ 
                  color: 'var(--success-color)', 
                  fontWeight: '600', 
                  marginLeft: '0.5rem' 
                }}>
                  {Math.round(modelState.accuracy)}%
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--secondary-text)' }}>Epoch:</span>
                <span style={{ 
                  color: 'var(--error-color)', 
                  fontWeight: '600', 
                  marginLeft: '0.5rem' 
                }}>
                  {modelState.epoch}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--secondary-text)' }}>Status:</span>
                <span style={{ 
                  color: 'var(--accent-color)', 
                  fontWeight: '600', 
                  marginLeft: '0.5rem' 
                }}>
                  {isTraining ? 'Training...' : 'Ready'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--secondary-text)' }}>Samples:</span>
                <span style={{ 
                  color: 'var(--success-color)', 
                  fontWeight: '600', 
                  marginLeft: '0.5rem' 
                }}>
                  {trainingData.length}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            width: '5rem',
            height: '5rem',
            background: 'linear-gradient(135deg, var(--accent-color), var(--secondary-accent))',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2rem'
          }}
        >
          🔮
        </motion.div>
        
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: 'var(--primary-text)', 
          marginBottom: '1rem' 
        }}>
          Create Your Own AI! 
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: 'var(--secondary-text)', 
          maxWidth: '48rem', 
          margin: '0 auto',
          lineHeight: '1.7'
        }}>
          Ready to become an AI engineer? Choose a type of AI to build and watch as we create it step by step. 
          You'll see how real AI systems are designed and trained!
        </p>
      </div>

      {/* AI Model Options */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(22rem, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {aiModels.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            style={{
              backgroundColor: 'var(--card-background)',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 10px 25px -3px var(--shadow-color)',
              border: '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-color)';
              e.currentTarget.style.boxShadow = '0 20px 40px -5px var(--shadow-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.boxShadow = '0 10px 25px -3px var(--shadow-color)';
            }}
            onClick={() => handleBuildStart(model)}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{model.icon}</div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '0.5rem' 
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: 'var(--primary-text)' 
              }}>
                {model.name}
              </h3>
              <span style={{
                backgroundColor: model.difficulty === 'Easy' ? 'var(--success-muted)' : 
                                model.difficulty === 'Medium' ? 'var(--warning-muted)' : 
                                'var(--error-muted)',
                color: model.difficulty === 'Easy' ? 'var(--success-color)' : 
                      model.difficulty === 'Medium' ? 'var(--warning-color)' : 
                      'var(--error-color)',
                fontSize: '0.75rem',
                fontWeight: '500',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px'
              }}>
                {model.difficulty}
              </span>
            </div>
            
            <p style={{ 
              color: 'var(--secondary-text)', 
              marginBottom: '1.5rem', 
              lineHeight: '1.6' 
            }}>
              {model.description}
            </p>
            
            <div style={{
              backgroundColor: 'var(--surface-color)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem',
              border: '1px solid var(--border-color)'
            }}>
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'var(--secondary-text)', 
                marginBottom: '0.5rem' 
              }}>
                <strong>Example:</strong> {model.example}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{ flex: 1 }}>
                <span style={{ 
                  color: 'var(--secondary-text)', 
                  fontWeight: '500' 
                }}>Inputs:</span>
                <ul style={{ 
                  color: 'var(--secondary-text)', 
                  listStyleType: 'disc', 
                  paddingLeft: '1rem', 
                  marginTop: '0.25rem' 
                }}>
                  {model.inputs.map((input, i) => (
                    <li key={i}>{input}</li>
                  ))}
                </ul>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ 
                  color: 'var(--secondary-text)', 
                  fontWeight: '500' 
                }}>Outputs:</span>
                <ul style={{ 
                  color: 'var(--secondary-text)', 
                  listStyleType: 'disc', 
                  paddingLeft: '1rem', 
                  marginTop: '0.25rem' 
                }}>
                  {model.outputs.map((output, i) => (
                    <li key={i}>{output}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          backgroundColor: 'var(--card-background)',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 10px 25px -3px var(--shadow-color)',
          textAlign: 'center'
        }}
      >
        <Brain style={{ 
          width: '3rem', 
          height: '3rem', 
          color: 'var(--accent-color)', 
          margin: '0 auto 1rem' 
        }} />
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: 'var(--primary-text)', 
          marginBottom: '1rem' 
        }}>
          How AI Building Works
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))', 
          gap: '1.5rem',
          maxWidth: '60rem',
          margin: '0 auto'
        }}>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
            <h4 style={{ fontWeight: '600', color: 'var(--primary-text)', marginBottom: '0.5rem' }}>Choose Goal</h4>
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.875rem' }}>
              Pick what you want your AI to do - recognize images, make recommendations, or chat with users
            </p>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧠</div>
            <h4 style={{ fontWeight: '600', color: 'var(--primary-text)', marginBottom: '0.5rem' }}>Design Network</h4>
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.875rem' }}>
              Set up the neural network architecture with the right inputs, hidden layers, and outputs
            </p>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
            <h4 style={{ fontWeight: '600', color: 'var(--primary-text)', marginBottom: '0.5rem' }}>Train Model</h4>
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.875rem' }}>
              Feed your AI lots of examples so it can learn patterns and make accurate predictions
            </p>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
            <h4 style={{ fontWeight: '600', color: 'var(--primary-text)', marginBottom: '0.5rem' }}>Deploy AI</h4>
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.875rem' }}>
              Launch your trained AI so it can start helping real users with their problems
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
