import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface AIBuilderProps {
  onComplete: (score: number) => void;
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

export function AIBuilder({ onComplete }: AIBuilderProps) {
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

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

  const handleBuildStart = (model: AIModel) => {
    setSelectedModel(model);
    setIsBuilding(true);
    setBuildStep(1);
    
    // Simulate building process
    setTimeout(() => setBuildStep(2), 1500);
    setTimeout(() => setBuildStep(3), 3000);
    setTimeout(() => {
      setBuildStep(4);
      setIsComplete(true);
      onComplete(90);
    }, 4500);
  };

  const handleReset = () => {
    setSelectedModel(null);
    setIsBuilding(false);
    setBuildStep(0);
    setIsComplete(false);
  };

  if (isComplete && selectedModel) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
            maxWidth: '32rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
            AI Model Complete!
          </h2>
          <p style={{ color: '#4b5563', marginBottom: '2rem', fontSize: '1.125rem' }}>
            Congratulations! You've successfully built your {selectedModel.name}! 
            {selectedModel.icon} Your AI is now ready to help users.
          </p>
          
          <div style={{
            backgroundColor: '#f3f4f6',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              🎯 What You Built:
            </h3>
            <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
              {selectedModel.description} Your AI can now process inputs like{' '}
              <strong>{selectedModel.inputs.join(', ')}</strong> and provide outputs like{' '}
              <strong>{selectedModel.outputs.join(', ')}</strong>.
            </p>
          </div>

          <div style={{
            backgroundColor: '#dbeafe',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <p style={{ color: '#1e40af', fontWeight: '500' }}>
              💡 Fun Fact: Real companies use AI models just like this to power their apps and services!
            </p>
          </div>

          <button
            onClick={handleReset}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              fontWeight: '600',
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              marginRight: '1rem'
            }}
          >
            Build Another AI
          </button>
          
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem' }}>
            Returning to modules in 3 seconds...
          </div>
        </motion.div>
      </div>
    );
  }

  if (isBuilding && selectedModel) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
            maxWidth: '40rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{selectedModel.icon}</div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
            Building Your {selectedModel.name}
          </h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              backgroundColor: '#f3f4f6',
              height: '0.5rem',
              borderRadius: '0.25rem',
              marginBottom: '1rem'
            }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${(buildStep / 4) * 100}%` }}
                style={{
                  backgroundColor: '#8b5cf6',
                  height: '100%',
                  borderRadius: '0.25rem'
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            <p style={{ color: '#4b5563', fontSize: '1.125rem' }}>
              {buildStep === 1 && '🔧 Setting up neural network architecture...'}
              {buildStep === 2 && '🧠 Training AI with example data...'}
              {buildStep === 3 && '⚡ Optimizing model performance...'}
              {buildStep === 4 && '✨ AI model ready for deployment!'}
            </p>
          </div>

          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
              Real-Time Stats:
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: '#6b7280' }}>Accuracy:</span>
                <span style={{ color: '#059669', fontWeight: '600', marginLeft: '0.5rem' }}>
                  {buildStep * 22}%
                </span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Learning Rate:</span>
                <span style={{ color: '#dc2626', fontWeight: '600', marginLeft: '0.5rem' }}>
                  {(buildStep * 0.15).toFixed(2)}
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
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
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
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
          Create Your Own AI! 
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#4b5563', 
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
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
              border: '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#8b5cf6';
              e.currentTarget.style.boxShadow = '0 20px 40px -5px rgba(139, 92, 246, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
            }}
            onClick={() => handleBuildStart(model)}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{model.icon}</div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                {model.name}
              </h3>
              <span style={{
                backgroundColor: model.difficulty === 'Easy' ? '#dcfce7' : model.difficulty === 'Medium' ? '#fef3c7' : '#fecaca',
                color: model.difficulty === 'Easy' ? '#166534' : model.difficulty === 'Medium' ? '#92400e' : '#dc2626',
                fontSize: '0.75rem',
                fontWeight: '500',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px'
              }}>
                {model.difficulty}
              </span>
            </div>
            
            <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              {model.description}
            </p>
            
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                <strong>Example:</strong> {model.example}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{ flex: 1 }}>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>Inputs:</span>
                <ul style={{ color: '#4b5563', listStyleType: 'disc', paddingLeft: '1rem', marginTop: '0.25rem' }}>
                  {model.inputs.map((input, i) => (
                    <li key={i}>{input}</li>
                  ))}
                </ul>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>Outputs:</span>
                <ul style={{ color: '#4b5563', listStyleType: 'disc', paddingLeft: '1rem', marginTop: '0.25rem' }}>
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
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}
      >
        <Brain style={{ width: '3rem', height: '3rem', color: '#8b5cf6', margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
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
            <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Choose Goal</h4>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Pick what you want your AI to do - recognize images, make recommendations, or chat with users
            </p>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧠</div>
            <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Design Network</h4>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Set up the neural network architecture with the right inputs, hidden layers, and outputs
            </p>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
            <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Train Model</h4>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Feed your AI lots of examples so it can learn patterns and make accurate predictions
            </p>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
            <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Deploy AI</h4>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Launch your trained AI so it can start helping real users with their problems
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
