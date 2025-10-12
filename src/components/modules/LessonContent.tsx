import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Brain, Lightbulb, Code, PlayCircle, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import type { AccessibilitySettings } from '../AccessibilityPanel';
import { useAuth } from '../../context/AuthContext';
import { speechManager } from '../../utils/speechSynthesis';

interface LessonSection {
  id: string;
  title: string;
  content: string;
  examples?: Array<{
    title: string;
    description: string;
    code?: string;
  }>;
  quiz?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  interactive?: React.ReactNode;
}

interface LessonContentProps {
  lessonId: string;
  onComplete: () => void;
  accessibilitySettings?: AccessibilitySettings;
}

const lessons: Record<string, { title: string; icon: string; sections: LessonSection[] }> = {
  'ai-fundamentals': {
    title: 'AI Fundamentals: Understanding Artificial Intelligence',
    icon: '🧠',
    sections: [
      {
        id: 'what-is-ai',
        title: 'What is Artificial Intelligence?',
        content: `Artificial Intelligence (AI) is the simulation of human intelligence by machines. Think of it as teaching computers to think, learn, and make decisions like humans do!

**Key Concepts:**
• **Learning**: AI systems learn from experience, just like you learn from practice
• **Pattern Recognition**: AI can spot patterns in data that humans might miss
• **Decision Making**: AI uses learned patterns to make informed choices
• **Adaptation**: Good AI systems improve over time with more data

**Real-World Example:**
When you watch videos on YouTube, AI learns what you like and recommends similar content. It noticed patterns in your viewing history - maybe you watch lots of gaming videos or cooking tutorials - and uses that to predict what you'll enjoy next.`,
        examples: [
          {
            title: 'Voice Assistants',
            description: 'Siri, Alexa, and Google Assistant use AI to understand your voice commands and respond helpfully.'
          },
          {
            title: 'Face Recognition',
            description: 'Your phone uses AI to recognize your face and unlock, even in different lighting conditions!'
          },
          {
            title: 'Recommendation Systems',
            description: 'Netflix, Spotify, and TikTok use AI to suggest content you\'ll probably love based on your history.'
          }
        ],
        quiz: {
          question: 'Which of these is NOT an example of AI learning?',
          options: [
            'Netflix recommending shows based on what you watched',
            'A calculator solving 2 + 2',
            'Spotify creating a playlist based on your listening habits',
            'Your phone autocorrecting your typos'
          ],
          correctAnswer: 1,
          explanation: 'A calculator performs fixed calculations without learning from experience. AI systems learn and adapt from data, like Netflix learning your preferences or Spotify understanding your music taste!'
        }
      },
      {
        id: 'how-ai-learns',
        title: 'How Does AI Actually Learn?',
        content: `AI learns through a process called Machine Learning. Instead of being explicitly programmed for every scenario, AI learns from examples!

**The Learning Process:**

1. **Data Collection**: Gather lots of examples (like thousands of cat pictures)
2. **Pattern Finding**: The AI looks for common features (pointy ears, whiskers, fur patterns)
3. **Training**: The AI practices identifying cats, getting feedback when it's right or wrong
4. **Testing**: We check if the AI can recognize cats it's never seen before
5. **Improvement**: The AI adjusts based on mistakes to get better

**Types of Learning:**

**Supervised Learning** (Learning with a Teacher)
The AI learns from labeled examples. Like showing it pictures labeled "cat" or "dog."
• Example: Email spam filters learn from emails you mark as spam

**Unsupervised Learning** (Self-Discovery)
The AI finds patterns without labels. Like grouping similar items together.
• Example: Customer segmentation - finding groups of similar shoppers

**Reinforcement Learning** (Learning from Experience)
The AI learns by trial and error, getting rewards for good actions.
• Example: AI learning to play chess by playing millions of games`,
        examples: [
          {
            title: 'Image Recognition',
            description: 'An AI sees 10,000 labeled images of cats and dogs. It learns that cats have pointy ears, whiskers, and specific eye shapes. After training, it can identify cats it has never seen!',
          },
          {
            title: 'Game Playing AI',
            description: 'DeepMind\'s AlphaGo learned to play the ancient game Go by playing millions of games against itself. It discovered strategies that even grandmasters hadn\'t thought of!'
          },
          {
            title: 'Language Models',
            description: 'ChatGPT learned from billions of text examples to understand and generate human-like responses. It learned grammar, facts, and conversation patterns from books, websites, and articles.'
          }
        ],
        quiz: {
          question: 'In supervised learning, what does the AI need to learn effectively?',
          options: [
            'Just raw data with no context',
            'Labeled examples showing the correct answers',
            'Complete silence and darkness',
            'A physical robot body'
          ],
          correctAnswer: 1,
          explanation: 'Supervised learning requires labeled examples - data with correct answers attached. This is like having a teacher who tells you if your answer is right or wrong, helping you learn the correct patterns!'
        }
      },
      {
        id: 'neural-networks',
        title: 'Neural Networks: The Brain of AI',
        content: `Neural networks are inspired by how your brain works! Just like your brain has billions of connected neurons, artificial neural networks have layers of connected "artificial neurons."

**How Neural Networks Work:**

**Input Layer**: Receives information (like pixels from an image)
↓
**Hidden Layers**: Process information through connections
↓
**Output Layer**: Produces the final answer

Each connection has a "weight" that determines how important it is. During learning, these weights adjust to make better predictions!

**Real Example - Recognizing Handwritten Digits:**

1. Input: An image of a handwritten "7"
2. First Layer: Detects simple features (edges, curves)
3. Middle Layers: Combines features (top horizontal line, diagonal stroke)
4. Output Layer: Says "This is a 7!" with 95% confidence

**Deep Learning:**
When neural networks have many hidden layers (sometimes hundreds!), we call it "deep learning." Each layer learns increasingly complex patterns:

• Layer 1: Edges and simple shapes
• Layer 2: Curves and textures
• Layer 3: Parts of objects (eyes, wheels, corners)
• Layer 4: Complete objects (faces, cars, buildings)`,
        examples: [
          {
            title: 'Self-Driving Cars',
            description: 'Deep neural networks process camera images to identify pedestrians, traffic signs, lane markings, and other vehicles - all in real-time!',
          },
          {
            title: 'Medical Diagnosis',
            description: 'Neural networks analyze X-rays and MRI scans to help doctors detect diseases early, sometimes spotting subtle patterns human eyes might miss.'
          },
          {
            title: 'Language Translation',
            description: 'Google Translate uses neural networks to understand context and provide natural translations between over 100 languages.'
          }
        ],
        quiz: {
          question: 'What happens during the training process of a neural network?',
          options: [
            'The network memorizes all training examples exactly',
            'The weights of connections adjust to improve predictions',
            'The network deletes incorrect data',
            'Programmers manually fix every mistake'
          ],
          correctAnswer: 1,
          explanation: 'During training, a neural network adjusts the weights of its connections to minimize errors. It\'s like tuning a radio - you adjust the dial (weights) until you get a clear signal (accurate predictions)!'
        }
      },
      {
        id: 'ai-ethics',
        title: 'AI Ethics: Using AI Responsibly',
        content: `As AI becomes more powerful, we must use it responsibly and ethically. Here are important considerations:

**Key Ethical Principles:**

**1. Fairness and Bias**
AI systems can inherit biases from their training data. If we train an AI mostly on data from one group, it might not work well for others.
• Example: Face recognition that works better for some skin tones than others

**2. Privacy and Data Protection**
AI often needs lots of data to learn, but we must respect people's privacy.
• Example: Should companies use your personal data without permission?

**3. Transparency and Explainability**
People should understand how AI makes decisions, especially for important choices.
• Example: If AI denies a loan application, the person deserves to know why

**4. Safety and Control**
We must ensure AI systems are safe and humans maintain control.
• Example: Self-driving cars need extensive safety testing

**5. Job Impact**
AI automation might change jobs, so we need to help people adapt.
• Example: Training programs for new skills as some jobs evolve

**Questions to Ask:**
• Who benefits from this AI system?
• Could it harm anyone?
• Is it treating everyone fairly?
• Can we explain its decisions?
• What happens if it makes a mistake?`,
        examples: [
          {
            title: 'Healthcare AI',
            description: 'AI can help diagnose diseases, but doctors must verify results. The AI assists, but human doctors make final decisions about patient care.'
          },
          {
            title: 'Social Media Algorithms',
            description: 'AI recommends content, but must balance engagement with user wellbeing. Should it promote controversial content just because it gets clicks?'
          },
          {
            title: 'Hiring AI',
            description: 'Some companies use AI to screen resumes, but must ensure it doesn\'t discriminate based on gender, race, or age.'
          }
        ],
        quiz: {
          question: 'Why is it important for AI systems to be transparent and explainable?',
          options: [
            'To make the AI run faster',
            'So people can understand and trust important decisions',
            'To reduce the cost of the AI',
            'To make programming easier'
          ],
          correctAnswer: 1,
          explanation: 'Transparency helps people understand, trust, and verify AI decisions. This is especially crucial for important decisions affecting people\'s lives, like loan applications, medical diagnoses, or job applications!'
        }
      }
    ]
  }
};

export function LessonContent({ lessonId, onComplete, accessibilitySettings }: LessonContentProps) {
  const lesson = lessons[lessonId] || lessons['ai-fundamentals'];
  const { isAuthenticated, adjustHearts } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);

  const section = lesson.sections[currentSection];
  const isLastSection = currentSection === lesson.sections.length - 1;

  const handleQuizSubmit = () => {
    setShowQuizResult(true);
    if (section.quiz && quizAnswer === section.quiz.correctAnswer) {
      setCompletedSections(prev => new Set([...prev, currentSection]));
    } else if (section.quiz && quizAnswer !== null) {
      // gently decrement a heart on incorrect submission for authenticated users
      if (isAuthenticated) {
        adjustHearts(-1).catch(() => {});
      }
    }
  };

  const handleNext = () => {
    if (isLastSection) {
      onComplete();
    } else {
      setCurrentSection(prev => prev + 1);
      setQuizAnswer(null);
      setShowQuizResult(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      setQuizAnswer(null);
      setShowQuizResult(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      {/* Progress Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
            Section {currentSection + 1} of {lesson.sections.length}
          </span>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {Math.round(((currentSection + 1) / lesson.sections.length) * 100)}% Complete
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${((currentSection + 1) / lesson.sections.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Lesson Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '3rem' }}>{lesson.icon}</span>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                {section.title}
              </h1>
              <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                {lesson.title}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => {
                const parts: string[] = [];
                parts.push(section.title);
                if (section.content) parts.push(section.content.replace(/\*\*|\•/g, ''));
                if (section.quiz) {
                  parts.push('Question: ' + section.quiz.question);
                  section.quiz.options.forEach((opt, i) => parts.push(`Option ${i + 1}: ${opt}`));
                }
                const text = parts.join('. ');
                try {
                  speechManager.speak(text);
                } catch (e) {
                  console.warn('Speech error', e);
                }
              }}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
              aria-label="Read aloud this section"
              title="Read Aloud"
            >
              🔊 Read Aloud
            </button>
            <button
              onClick={() => speechManager.cancel()}
              style={{
                backgroundColor: 'white',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                fontWeight: 500
              }}
              aria-label="Stop reading"
              title="Stop"
            >
              ⏹ Stop
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={section.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Content Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
          }}>
            <div style={{
              color: '#374151',
              lineHeight: '1.8',
              fontSize: '1.125rem',
              whiteSpace: 'pre-line'
            }}>
              {section.content}
            </div>
          </div>

          {/* Examples Section */}
          {section.examples && section.examples.length > 0 && (
            <div style={{
              backgroundColor: '#eff6ff',
              borderRadius: '1rem',
              padding: '2rem',
              marginBottom: '2rem',
              borderLeft: '4px solid #3b82f6'
            }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '1.5rem'
              }}>
                <Lightbulb style={{ width: '1.5rem', height: '1.5rem' }} />
                Real-World Examples
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {section.examples.map((example, idx) => (
                  <div key={idx} style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <h4 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1e40af',
                      marginBottom: '0.5rem'
                    }}>
                      {example.title}
                    </h4>
                    <p style={{ color: '#374151', lineHeight: '1.6', margin: 0 }}>
                      {example.description}
                    </p>
                    {example.code && (
                      <pre style={{
                        backgroundColor: '#1f2937',
                        color: '#e5e7eb',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        overflow: 'auto',
                        marginTop: '1rem',
                        fontSize: '0.875rem'
                      }}>
                        <code>{example.code}</code>
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz Section */}
          {section.quiz && (
            <div style={{
              backgroundColor: '#fef3c7',
              borderRadius: '1rem',
              padding: '2rem',
              marginBottom: '2rem',
              borderLeft: '4px solid #f59e0b'
            }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '1.5rem'
              }}>
                <Brain style={{ width: '1.5rem', height: '1.5rem' }} />
                Knowledge Check
              </h3>
              <p style={{
                fontSize: '1.125rem',
                fontWeight: '500',
                color: '#78350f',
                marginBottom: '1rem'
              }}>
                {section.quiz.question}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {section.quiz.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => !showQuizResult && setQuizAnswer(idx)}
                    disabled={showQuizResult}
                    style={{
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: '2px solid',
                      borderColor: showQuizResult
                        ? idx === section.quiz!.correctAnswer
                          ? '#10b981'
                          : idx === quizAnswer
                          ? '#ef4444'
                          : '#d1d5db'
                        : quizAnswer === idx
                        ? '#f59e0b'
                        : '#d1d5db',
                      backgroundColor: showQuizResult
                        ? idx === section.quiz!.correctAnswer
                          ? '#d1fae5'
                          : idx === quizAnswer
                          ? '#fee2e2'
                          : 'white'
                        : quizAnswer === idx
                        ? '#fef3c7'
                        : 'white',
                      color: '#111827',
                      textAlign: 'left',
                      cursor: showQuizResult ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '1rem'
                    }}
                  >
                    {option}
                    {showQuizResult && idx === section.quiz!.correctAnswer && ' ✓'}
                  </button>
                ))}
              </div>
              {!showQuizResult && quizAnswer !== null && (
                <button
                  onClick={handleQuizSubmit}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Submit Answer
                </button>
              )}
              {showQuizResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: quizAnswer === section.quiz.correctAnswer ? '#d1fae5' : '#fee2e2',
                    borderRadius: '0.5rem',
                    border: '2px solid',
                    borderColor: quizAnswer === section.quiz.correctAnswer ? '#10b981' : '#ef4444'
                  }}
                >
                  <p style={{
                    fontWeight: '600',
                    color: quizAnswer === section.quiz.correctAnswer ? '#065f46' : '#991b1b',
                    marginBottom: '0.5rem'
                  }}>
                    {quizAnswer === section.quiz.correctAnswer ? '🎉 Correct!' : '❌ Not quite right'}
                  </p>
                  <p style={{ color: '#374151', margin: 0 }}>
                    {section.quiz.explanation}
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '2rem'
      }}>
        <button
          onClick={handlePrevious}
          disabled={currentSection === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: currentSection === 0 ? '#e5e7eb' : 'white',
            color: currentSection === 0 ? '#9ca3af' : '#374151',
            border: '2px solid #d1d5db',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: currentSection === 0 ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          <ChevronLeft style={{ width: '1.25rem', height: '1.25rem' }} />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={section.quiz && !completedSections.has(currentSection) && !showQuizResult}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: (section.quiz && !completedSections.has(currentSection) && !showQuizResult) ? '#e5e7eb' : '#8b5cf6',
            color: (section.quiz && !completedSections.has(currentSection) && !showQuizResult) ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: (section.quiz && !completedSections.has(currentSection) && !showQuizResult) ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {isLastSection ? 'Complete Lesson' : 'Next'}
          <ChevronRight style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>
      </div>
    </div>
  );
}
