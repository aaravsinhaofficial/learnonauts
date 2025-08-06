import { useEffect, useRef, useCallback, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrainingVisualizerProps {
  isTraining: boolean;
  epoch: number;
  accuracy: number;
  loss: number;
  trainingHistory: {
    epoch: number;
    accuracy: number;
    loss: number;
    validationAccuracy?: number;
    trainingAccuracy?: number;
  }[];
  modelType: string;
  accessibilitySettings?: any;
}

export function TrainingVisualizer({
  isTraining,
  epoch,
  accuracy,
  loss,
  trainingHistory,
  modelType,
  accessibilitySettings,
}: TrainingVisualizerProps) {
  const networkCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<{
    type: 'input' | 'hidden' | 'output';
    index: number;
    x: number;
    y: number;
  } | null>(null);

  // Prepare chart data
  const chartData = {
    labels: trainingHistory.map((record) => `Epoch ${record.epoch}`),
    datasets: [
      {
        label: 'Validation Accuracy',
        data: trainingHistory.map((record) => record.validationAccuracy || record.accuracy),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
        order: 1,
      },
      {
        label: 'Training Accuracy',
        data: trainingHistory.map((record) => record.trainingAccuracy || record.accuracy),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
        order: 2,
      },
      {
        label: 'Loss',
        data: trainingHistory.map((record) => record.loss),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
        order: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Training Progress',
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Accuracy (%)'
        },
        min: 0,
        max: 100,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Loss'
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: Math.max(1, ...trainingHistory.map(r => r.loss)),
      },
    },
    animation: {
      duration: accessibilitySettings?.reducedMotion ? 0 : 300,
    },
  };

  // Handle canvas mouse events for interactive neural network
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!networkCanvasRef.current) return;
    
    const canvas = networkCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate dimensions
    const width = canvas.width;
    const height = canvas.height;
    
    // Number of nodes in each layer
    const inputNodes = modelType === 'recommendation' ? 3 : 
                       modelType === 'image-classifier' ? 3 : 
                       modelType === 'chat-bot' ? 3 : 3;
    const hiddenNodes = 4;
    const outputNodes = 1;
    
    // Calculate node positions (same as in drawNeuralNetwork)
    const inputLayer = Array.from({ length: inputNodes }, (_, i) => ({
      x: width * 0.2,
      y: height * (0.2 + (i * 0.6 / (inputNodes - 1))),
    }));
    
    const hiddenLayer = Array.from({ length: hiddenNodes }, (_, i) => ({
      x: width * 0.5,
      y: height * (0.15 + (i * 0.7 / (hiddenNodes - 1))),
    }));
    
    const outputLayer = Array.from({ length: outputNodes }, (_, i) => ({
      x: width * 0.8,
      y: height * (0.3 + (i * 0.4 / (outputNodes - 1))),
    }));
    
    // Check if mouse is over any node
    // Input nodes
    for (let i = 0; i < inputLayer.length; i++) {
      const node = inputLayer[i];
      const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
      if (distance <= 10) {
        setHoveredNode({ type: 'input', index: i, x: node.x, y: node.y });
        return;
      }
    }
    
    // Hidden nodes
    for (let i = 0; i < hiddenLayer.length; i++) {
      const node = hiddenLayer[i];
      const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
      if (distance <= 8) {
        setHoveredNode({ type: 'hidden', index: i, x: node.x, y: node.y });
        return;
      }
    }
    
    // Output nodes
    for (let i = 0; i < outputLayer.length; i++) {
      const node = outputLayer[i];
      const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
      if (distance <= 12) {
        setHoveredNode({ type: 'output', index: i, x: node.x, y: node.y });
        return;
      }
    }
    
    setHoveredNode(null);
  }, [modelType]);
  
  const handleCanvasMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);
  
  // Get node tooltip content
  const getNodeTooltip = () => {
    if (!hoveredNode) return null;
    
    switch (hoveredNode.type) {
      case 'input':
        return (
          <div className="absolute z-10 bg-black text-white p-2 rounded text-xs" 
               style={{ left: hoveredNode.x + 15, top: hoveredNode.y - 10 }}>
            <p className="font-bold">Input Node {hoveredNode.index + 1}</p>
            <p>Feature: {getInputLabel(hoveredNode.index)}</p>
            <p>Connections: {4}</p>
          </div>
        );
      case 'hidden':
        return (
          <div className="absolute z-10 bg-black text-white p-2 rounded text-xs"
               style={{ left: hoveredNode.x + 15, top: hoveredNode.y - 10 }}>
            <p className="font-bold">Hidden Node {hoveredNode.index + 1}</p>
            <p>Activation: ReLU</p>
            <p>Activity: {(accuracy / 100 * (1 - hoveredNode.index * 0.1)).toFixed(2)}</p>
          </div>
        );
      case 'output':
        return (
          <div className="absolute z-10 bg-black text-white p-2 rounded text-xs"
               style={{ left: hoveredNode.x - 80, top: hoveredNode.y - 10 }}>
            <p className="font-bold">Output Node</p>
            <p>Prediction: {(accuracy / 100).toFixed(2)}</p>
            <p>Confidence: {accuracy.toFixed(1)}%</p>
            <p>Loss: {loss.toFixed(4)}</p>
          </div>
        );
      default:
        return null;
    }
  };
  
  // Helper function to get input label based on model type
  const getInputLabel = (index: number): string => {
    if (modelType === 'recommendation') {
      return ['Age', 'Genre Preference', 'Rating'][index] || `Input ${index + 1}`;
    } else if (modelType === 'image-classifier') {
      return ['Color', 'Shape', 'Texture'][index] || `Input ${index + 1}`;
    } else if (modelType === 'chat-bot') {
      return ['Intent', 'Sentiment', 'Context'][index] || `Input ${index + 1}`;
    }
    return `Input ${index + 1}`;
  };
  
  // Draw neural network visualization
  const drawNeuralNetwork = useCallback(() => {
    if (!networkCanvasRef.current) return;
    
    const ctx = networkCanvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, networkCanvasRef.current.width, networkCanvasRef.current.height);
    
    // Calculate dimensions
    const width = networkCanvasRef.current.width;
    const height = networkCanvasRef.current.height;
    
    // Number of nodes in each layer
    const inputNodes = modelType === 'recommendation' ? 3 : 
                       modelType === 'image-classifier' ? 3 : 
                       modelType === 'chat-bot' ? 3 : 3;
    const hiddenNodes = 4;
    const outputNodes = 1;
    
    // Calculate node positions
    const inputLayer = Array.from({ length: inputNodes }, (_, i) => ({
      x: width * 0.2,
      y: height * (0.2 + (i * 0.6 / (inputNodes - 1))),
    }));
    
    const hiddenLayer = Array.from({ length: hiddenNodes }, (_, i) => ({
      x: width * 0.5,
      y: height * (0.15 + (i * 0.7 / (hiddenNodes - 1))),
    }));
    
    const outputLayer = Array.from({ length: outputNodes }, (_, i) => ({
      x: width * 0.8,
      y: height * (0.3 + (i * 0.4 / (outputNodes - 1))),
    }));
    
    // Draw connections with animation based on training progress
    ctx.lineWidth = 1;
    
    // Input to hidden connections
    inputLayer.forEach(inputNode => {
      hiddenLayer.forEach(hiddenNode => {
        // Make connection opacity reflect training progress
        const opacity = Math.min(0.1 + (accuracy / 100) * 0.9, 1);
        ctx.strokeStyle = `rgba(75, 192, 192, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(inputNode.x, inputNode.y);
        ctx.lineTo(hiddenNode.x, hiddenNode.y);
        ctx.stroke();
      });
    });
    
    // Hidden to output connections
    hiddenLayer.forEach(hiddenNode => {
      outputLayer.forEach(outputNode => {
        // Make connection strength reflect training progress
        const opacity = Math.min(0.1 + (accuracy / 100) * 0.9, 1);
        const lineWidth = Math.max(1, (accuracy / 100) * 3);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = `rgba(153, 102, 255, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(hiddenNode.x, hiddenNode.y);
        ctx.lineTo(outputNode.x, outputNode.y);
        ctx.stroke();
      });
    });
    
    // Draw nodes
    // Input layer nodes
    inputLayer.forEach((node, i) => {
      ctx.fillStyle = '#4bc0c0';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Add labels
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`Input ${i+1}`, node.x - 15, node.y + 4);
    });
    
    // Hidden layer nodes with animation
    hiddenLayer.forEach((node, i) => {
      // Pulse effect for active nodes based on training progress
      const radius = isTraining ? 8 + Math.sin(Date.now() / 200 + i) * 2 : 8;
      ctx.fillStyle = '#9966ff';
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Output layer nodes
    outputLayer.forEach((node) => {
      // Color reflects accuracy
      const greenComponent = Math.floor(Math.min(255, 100 + (accuracy * 1.55)));
      ctx.fillStyle = `rgb(255, ${greenComponent}, 100)`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Add accuracy text
      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${accuracy.toFixed(1)}%`, node.x + 20, node.y + 4);
    });
  }, [networkCanvasRef, accuracy, isTraining, modelType]);
  
  // Update neural network visualization when training progress changes
  useEffect(() => {
    drawNeuralNetwork();
    
    // Redraw animation for active training
    let animationFrame: number;
    if (isTraining) {
      const animate = () => {
        drawNeuralNetwork();
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [drawNeuralNetwork, isTraining, accuracy, epoch]);
  
  return (
    <div className="training-visualizer">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg" style={{
        backgroundColor: 'var(--surface-color)',
        border: '1px solid var(--border-color)'
      }}>
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary-text)' }}>Training Progress</h3>
          <div style={{
            backgroundColor: 'var(--card-background)',
            padding: '1rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 12px var(--shadow-color)'
          }}>
            <Line data={chartData} options={chartOptions} />
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div style={{
              backgroundColor: 'var(--card-background)',
              padding: '1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 12px var(--shadow-color)'
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--secondary-text)' }}>Current Epoch</h4>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-text)' }}>{epoch}</div>
            </div>
            <div style={{
              backgroundColor: 'var(--card-background)',
              padding: '1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 12px var(--shadow-color)'
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--secondary-text)' }}>Accuracy</h4>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-text)' }}>{accuracy.toFixed(2)}%</div>
            </div>
            <div style={{
              backgroundColor: 'var(--card-background)',
              padding: '1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 12px var(--shadow-color)'
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--secondary-text)' }}>Loss</h4>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-text)' }}>{loss.toFixed(4)}</div>
            </div>
            <div style={{
              backgroundColor: 'var(--card-background)',
              padding: '1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 12px var(--shadow-color)'
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--secondary-text)' }}>Status</h4>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-text)', display: 'flex', alignItems: 'center' }}>
                {isTraining ? (
                  <>
                    <span style={{ 
                      height: '0.75rem', 
                      width: '0.75rem', 
                      backgroundColor: 'var(--success-color)', 
                      borderRadius: '9999px', 
                      marginRight: '0.5rem', 
                      animation: 'pulse 2s infinite'
                    }}></span>
                    Training
                  </>
                ) : epoch > 0 ? (
                  <>
                    <span style={{ 
                      height: '0.75rem', 
                      width: '0.75rem', 
                      backgroundColor: 'var(--accent-color)', 
                      borderRadius: '9999px', 
                      marginRight: '0.5rem' 
                    }}></span>
                    Trained
                  </>
                ) : (
                  <>
                    <span style={{ 
                      height: '0.75rem', 
                      width: '0.75rem', 
                      backgroundColor: 'var(--disabled-color)', 
                      borderRadius: '9999px', 
                      marginRight: '0.5rem' 
                    }}></span>
                    Not Started
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary-text)' }}>Neural Network Visualization</h3>
          <div style={{
            backgroundColor: 'var(--card-background)',
            padding: '1rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 12px var(--shadow-color)',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <canvas 
              ref={networkCanvasRef} 
              width={400} 
              height={300} 
              className="w-full h-full cursor-pointer"
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
            />
            {getNodeTooltip()}
          </div>
          
          <AnimatePresence>
            {isTraining && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                style={{
                  marginTop: '1rem',
                  backgroundColor: 'var(--card-background)',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 12px var(--shadow-color)'
                }}
              >
                <h4 style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: 'var(--secondary-text)',
                  marginBottom: '0.5rem'
                }}>Training Activity</h4>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  backgroundColor: 'var(--surface-color)',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  maxHeight: '8rem',
                  overflow: 'auto',
                  border: '1px solid var(--border-color)'
                }}>
                  {trainingHistory.slice(-10).map((record, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ marginBottom: '0.25rem' }}
                    >
                      <span style={{ color: 'var(--secondary-text)' }}>[Epoch {record.epoch}]</span>{' '}
                      <span style={{ color: 'var(--accent-color)' }}>Val: {record.validationAccuracy?.toFixed(2) || record.accuracy.toFixed(2)}%</span>{' '}
                      {record.trainingAccuracy && 
                        <span style={{ color: 'var(--success-color)' }}>Train: {record.trainingAccuracy.toFixed(2)}%</span>
                      }{' '}
                      <span style={{ color: 'var(--error-color)' }}>Loss: {record.loss.toFixed(4)}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
