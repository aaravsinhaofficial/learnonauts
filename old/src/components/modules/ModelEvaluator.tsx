import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, X, FileBarChart } from 'lucide-react';

interface ModelEvaluatorProps {
  modelType: string;
  isModelTrained: boolean;
  accuracy: number;
  predict: (inputs: number[]) => number[];
  testData: Array<{
    inputs: number[];
    output: number;
    label?: string;
  }>;
  inputLabels: string[];
  accessibilitySettings?: any;
}

export function ModelEvaluator({
  modelType,
  isModelTrained,
  accuracy,
  predict,
  testData,
  inputLabels,
  accessibilitySettings,
}: ModelEvaluatorProps) {
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [result, setResult] = useState<{
    prediction: number[];
    expected: number;
    isCorrect: boolean;
    confidence: number;
    interpretation: string;
  } | null>(null);
  const [evaluationLog, setEvaluationLog] = useState<Array<{
    inputs: number[];
    expected: number;
    prediction: number[];
    isCorrect: boolean;
    label?: string;
  }>>([]);
  const [confusionMatrix, setConfusionMatrix] = useState({
    truePositive: 0,
    falsePositive: 0,
    trueNegative: 0,
    falseNegative: 0,
  });
  
  // Helper function to interpret prediction
  const interpretPrediction = (modelType: string, prediction: number[]): string => {
    const confidence = Math.round(prediction[0] * 100);
    
    switch (modelType) {
      case 'recommendation':
        if (prediction[0] > 0.7) return `🎬 Highly Recommended! (${confidence}% confidence)`;
        if (prediction[0] > 0.4) return `👍 Good Match (${confidence}% confidence)`;
        return `👎 Not Recommended (${confidence}% confidence)`;
        
      case 'image-classifier':
        if (prediction[0] > 0.6) return `🐱 Cat detected! (${confidence}% confidence)`;
        return `🐕 Dog detected! (${100 - confidence}% confidence)`;
        
      case 'chat-bot':
        if (prediction[0] > 0.7) return `😊 Positive tone response (${confidence}% confidence)`;
        if (prediction[0] > 0.4) return `🤔 Neutral tone response (${confidence}% confidence)`;
        return `📚 Informative tone response (${100 - confidence}% confidence)`;
        
      default:
        return `Prediction: ${confidence}%`;
    }
  };
  
  // Run a single test
  const runTest = (testIndex: number) => {
    if (!isModelTrained || testIndex >= testData.length) return;
    
    setIsAnimating(true);
    const test = testData[testIndex];
    
    // Simulate processing time for better visualization
    setTimeout(() => {
      const prediction = predict(test.inputs);
      const confidence = prediction[0];
      const threshold = 0.5;
      const isCorrect = (test.output > threshold && confidence > threshold) || 
                        (test.output <= threshold && confidence <= threshold);
      
      // Update confusion matrix
      if (test.output > threshold && confidence > threshold) {
        setConfusionMatrix(prev => ({ ...prev, truePositive: prev.truePositive + 1 }));
      } else if (test.output <= threshold && confidence <= threshold) {
        setConfusionMatrix(prev => ({ ...prev, trueNegative: prev.trueNegative + 1 }));
      } else if (test.output <= threshold && confidence > threshold) {
        setConfusionMatrix(prev => ({ ...prev, falsePositive: prev.falsePositive + 1 }));
      } else {
        setConfusionMatrix(prev => ({ ...prev, falseNegative: prev.falseNegative + 1 }));
      }
      
      setResult({
        prediction,
        expected: test.output,
        isCorrect,
        confidence: confidence * 100,
        interpretation: interpretPrediction(modelType, prediction),
      });
      
      setEvaluationLog(prev => [...prev, {
        inputs: test.inputs,
        expected: test.output,
        prediction,
        isCorrect,
        label: test.label,
      }]);
      
      setIsAnimating(false);
    }, accessibilitySettings?.reducedMotion ? 100 : 1000);
  };
  
  // Run a test when current index changes
  useEffect(() => {
    if (currentTestIndex < testData.length) {
      runTest(currentTestIndex);
    }
  }, [currentTestIndex]);
  
  // Format input value for display
  const formatInputValue = (value: number, index: number): string => {
    // For recommendation engine
    if (modelType === 'recommendation') {
      if (index === 0) return `${Math.round(value * 100)}yrs`; // Age
      if (index === 1) return value > 0.7 ? 'High' : value > 0.3 ? 'Medium' : 'Low'; // Genre preference
      if (index === 2) return `${(value * 5).toFixed(1)}★`; // Ratings
    }
    
    // For image classifier
    if (modelType === 'image-classifier') {
      return value.toFixed(2);
    }
    
    return value.toFixed(2);
  };
  
  // Render confusion matrix with improved visualization
  const renderConfusionMatrix = useCallback(() => {
    const total = confusionMatrix.truePositive + confusionMatrix.falsePositive + 
                  confusionMatrix.trueNegative + confusionMatrix.falseNegative;
    
    if (total === 0) return null;
    
    const accuracy = ((confusionMatrix.truePositive + confusionMatrix.trueNegative) / total * 100).toFixed(1);
    
    return (
      <div style={{ marginTop: '1rem' }}>
        <h4 style={{ 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          color: 'var(--secondary-text)',
          marginBottom: '0.5rem'
        }}>
          Confusion Matrix
        </h4>
        <div style={{
          backgroundColor: 'var(--card-background)',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px var(--shadow-color)'
        }}>
          <div style={{
            marginBottom: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--secondary-text)',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Accuracy: {accuracy}%</span>
            <span>Total tests: {total}</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.25rem',
            fontSize: '0.875rem'
          }}>
            <div style={{
              backgroundColor: 'rgba(var(--success-rgb), 0.1)',
              padding: '0.5rem',
              textAlign: 'center',
              borderTopLeftRadius: '0.25rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--success-color)' }}>True Positive</div>
              <div style={{ fontWeight: '700', color: 'var(--primary-text)' }}>{confusionMatrix.truePositive}</div>
              {total > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--success-color)' }}>
                  {((confusionMatrix.truePositive / total) * 100).toFixed(0)}%
                </div>
              )}
            </div>
            <div style={{
              backgroundColor: 'rgba(var(--error-rgb), 0.1)',
              padding: '0.5rem',
              textAlign: 'center',
              borderTopRightRadius: '0.25rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--error-color)' }}>False Positive</div>
              <div style={{ fontWeight: '700', color: 'var(--primary-text)' }}>{confusionMatrix.falsePositive}</div>
              {total > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--error-color)' }}>
                  {((confusionMatrix.falsePositive / total) * 100).toFixed(0)}%
                </div>
              )}
            </div>
            <div style={{
              backgroundColor: 'rgba(var(--error-rgb), 0.1)',
              padding: '0.5rem',
              textAlign: 'center',
              borderBottomLeftRadius: '0.25rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--error-color)' }}>False Negative</div>
              <div style={{ fontWeight: '700', color: 'var(--primary-text)' }}>{confusionMatrix.falseNegative}</div>
              {total > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--error-color)' }}>
                  {((confusionMatrix.falseNegative / total) * 100).toFixed(0)}%
                </div>
              )}
            </div>
            <div style={{
              backgroundColor: 'rgba(var(--success-rgb), 0.1)',
              padding: '0.5rem',
              textAlign: 'center',
              borderBottomRightRadius: '0.25rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--success-color)' }}>True Negative</div>
              <div style={{ fontWeight: '700', color: 'var(--primary-text)' }}>{confusionMatrix.trueNegative}</div>
              {total > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--success-color)' }}>
                  {((confusionMatrix.trueNegative / total) * 100).toFixed(0)}%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }, [confusionMatrix]);
  
  return (
    <div className="model-evaluator mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div style={{
            backgroundColor: 'var(--card-background)',
            padding: '1rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 12px var(--shadow-color)'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: 'var(--primary-text)'
            }}>Model Evaluation</h3>
            
            {!isModelTrained ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                backgroundColor: 'var(--surface-color)',
                borderRadius: '0.5rem',
                color: 'var(--warning-color)'
              }}>
                <AlertCircle style={{ marginRight: '0.5rem' }} />
                <span>Train your model first to start evaluation</span>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--accent-color)',
                      color: 'var(--button-text)',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: isAnimating || currentTestIndex >= testData.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: isAnimating || currentTestIndex >= testData.length - 1 ? 0.7 : 1
                    }}
                    onClick={() => setCurrentTestIndex(prev => Math.min(prev + 1, testData.length - 1))}
                    disabled={isAnimating || currentTestIndex >= testData.length - 1}
                  >
                    Run Next Test
                  </button>
                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--success-color)',
                      color: 'var(--button-text)',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: isAnimating ? 'not-allowed' : 'pointer',
                      opacity: isAnimating ? 0.7 : 1
                    }}
                    onClick={() => {
                      setCurrentTestIndex(0);
                      setEvaluationLog([]);
                      setConfusionMatrix({
                        truePositive: 0,
                        falsePositive: 0,
                        trueNegative: 0,
                        falseNegative: 0,
                      });
                    }}
                    disabled={isAnimating}
                  >
                    Reset Tests
                  </button>
                </div>
                
                <div style={{
                  marginBottom: '1rem',
                  backgroundColor: 'var(--surface-color)',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--secondary-text)',
                    marginBottom: '0.5rem'
                  }}>
                    Test {currentTestIndex + 1} of {testData.length}
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    {testData[currentTestIndex]?.inputs.map((input, i) => (
                      <div key={i} style={{
                        backgroundColor: 'var(--card-background)',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        boxShadow: '0 1px 3px var(--shadow-color)'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                          {inputLabels[i] || `Input ${i+1}`}
                        </div>
                        <div style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '1.125rem',
                          color: 'var(--primary-text)'
                        }}>
                          {formatInputValue(input, i)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <AnimatePresence>
                    {isAnimating ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2rem'
                        }}
                      >
                        <div style={{
                          width: '3rem',
                          height: '3rem',
                          border: '4px solid var(--surface-color)',
                          borderTopColor: 'var(--accent-color)',
                          borderRadius: '50%',
                          animation: 'spin 1s infinite linear',
                          marginBottom: '1rem'
                        }}></div>
                        <div style={{ color: 'var(--accent-color)' }}>Processing...</div>
                      </motion.div>
                    ) : result ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                          backgroundColor: 'var(--card-background)',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          boxShadow: '0 1px 3px var(--shadow-color)'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ 
                            fontSize: '1.125rem', 
                            fontWeight: '600',
                            color: 'var(--primary-text)'
                          }}>
                            Prediction Result
                          </span>
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: result.isCorrect ? 'var(--success-color)' : 'var(--error-color)'
                          }}>
                            {result.isCorrect ? (
                              <><Check size={16} style={{ marginRight: '0.25rem' }} /> Correct</>
                            ) : (
                              <><X size={16} style={{ marginRight: '0.25rem' }} /> Incorrect</>
                            )}
                          </span>
                        </div>
                        
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ 
                            fontSize: '0.875rem', 
                            color: 'var(--secondary-text)',
                            marginBottom: '0.25rem'
                          }}>
                            Confidence
                          </div>
                          <div style={{
                            width: '100%',
                            backgroundColor: 'var(--surface-color)',
                            borderRadius: '9999px',
                            height: '0.5rem',
                            overflow: 'hidden'
                          }}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${result.confidence}%`,
                              }}
                              style={{
                                height: '100%',
                                backgroundColor: result.isCorrect ? 'var(--success-color)' : 'var(--error-color)'
                              }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.75rem',
                            marginTop: '0.25rem',
                            color: 'var(--secondary-text)'
                          }}>
                            <span>0%</span>
                            <span>{result.confidence.toFixed(1)}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                        
                        <div style={{
                          padding: '0.75rem',
                          backgroundColor: 'var(--surface-color)',
                          borderRadius: '0.5rem',
                          color: 'var(--primary-text)'
                        }}>
                          <div style={{ fontSize: '1.125rem', fontWeight: '500' }}>
                            {result.interpretation}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div>
          <div style={{
            backgroundColor: 'var(--card-background)',
            padding: '1rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 12px var(--shadow-color)',
            height: '100%'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: 'var(--primary-text)'
            }}>
              Evaluation Stats
            </h3>
            
            {evaluationLog.length === 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                backgroundColor: 'var(--surface-color)',
                borderRadius: '0.5rem',
                color: 'var(--accent-color)'
              }}>
                <FileBarChart style={{ marginRight: '0.5rem' }} />
                <span>No data yet. Run tests to see results.</span>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    backgroundColor: 'rgba(var(--accent-rgb), 0.1)',
                    padding: '0.75rem',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)' }}>Tests Run</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-text)' }}>
                      {evaluationLog.length}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(var(--success-rgb), 0.1)',
                    padding: '0.75rem',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success-color)' }}>Accuracy</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-text)' }}>
                      {(evaluationLog.filter(log => log.isCorrect).length / evaluationLog.length * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: 'rgba(var(--secondary-accent-rgb), 0.1)',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--secondary-accent)' }}>Model Accuracy</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-text)' }}>
                    {accuracy.toFixed(1)}%
                  </div>
                </div>
                
                {renderConfusionMatrix()}
                
                <div>
                  <h4 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: 'var(--secondary-text)',
                    marginBottom: '0.5rem'
                  }}>
                    Recent Results
                  </h4>
                  <div style={{
                    maxHeight: '12rem',
                    overflow: 'auto',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.25rem'
                  }}>
                    {evaluationLog.slice().reverse().map((log, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          padding: '0.5rem',
                          marginBottom: '0.25rem',
                          borderRadius: '0.25rem',
                          backgroundColor: log.isCorrect ? 
                            'rgba(var(--success-rgb), 0.1)' : 
                            'rgba(var(--error-rgb), 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ 
                          fontSize: '0.875rem', 
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          flexGrow: 1,
                          color: 'var(--primary-text)'
                        }}>
                          {log.label || `Test ${evaluationLog.length - i}`}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          color: log.isCorrect ? 'var(--success-color)' : 'var(--error-color)'
                        }}>
                          {log.isCorrect ? (
                            <Check size={16} />
                          ) : (
                            <X size={16} />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
