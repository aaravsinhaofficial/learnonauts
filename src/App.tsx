import { useState } from 'react';
import { ClassificationGame } from './components/modules/ClassificationGame';
import { RegressionGame } from './components/modules/RegressionGame';
import { ClusteringGame } from './components/modules/ClusteringGame';
import { NeuralNetworkSimulation } from './components/modules/NeuralNetworkSimulation';
import { AIBuilder } from './components/modules/AIBuilder';
import { AccessibilityPanel, defaultAccessibilitySettings } from './components/AccessibilityPanel';
import type { AccessibilitySettings } from './components/AccessibilityPanel';
import { BadgeSystem } from './components/BadgeSystem';
import { ProgressTracker } from './components/ProgressTracker';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, isAuthenticated, login, signup, updateProgress } = useAuth();
  const [currentView, setCurrentView] = useState<'welcome' | 'modules' | 'classification' | 'regression' | 'clustering' | 'neural-network' | 'introduction' | 'ai-builder'>('welcome');
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(defaultAccessibilitySettings);
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);

  const handleModuleComplete = async (moduleId: string, score: number) => {
    console.log(`Module ${moduleId} completed with score: ${score}%`);
    
    // Update progress in authentication system if user is logged in
    if (isAuthenticated) {
      await updateProgress(moduleId, score, 10); // Assuming 10 minutes per module
    } else {
      // Add to local state if not logged in
      if (!completedModules.includes(moduleId)) {
        setCompletedModules(prev => [...prev, moduleId]);
      }
      setScores(prev => ({ ...prev, [moduleId]: score }));
    }
    
    // Show completion message and return to modules after a delay
    setTimeout(() => {
      setCurrentView('modules');
    }, 2000);
  };

  // Handle different module views
  if (currentView === 'classification') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <button 
            onClick={() => setCurrentView('modules')}
            style={{
              color: '#4b5563',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.5rem'
            }}
          >
            ← Back to Modules
          </button>
        </div>
        <ClassificationGame onComplete={(score) => handleModuleComplete('classification', score)} />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={login}
          onSignup={signup}
        />

        {/* User Dashboard */}
        <UserDashboard
          isOpen={isUserDashboardOpen}
          onClose={() => setIsUserDashboardOpen(false)}
        />
      </div>
    );
  }


  if (currentView === 'clustering') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <button 
            onClick={() => setCurrentView('modules')}
            style={{
              color: '#4b5563',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.5rem'
            }}
          >
            ← Back to Modules
          </button>
        </div>
        <ClusteringGame onComplete={(score) => handleModuleComplete('clustering', score)} />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={login}
          onSignup={signup}
        />

        {/* User Dashboard */}
        <UserDashboard
          isOpen={isUserDashboardOpen}
          onClose={() => setIsUserDashboardOpen(false)}
        />
      </div>
    );
  }

  if (currentView === 'neural-network') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <button 
            onClick={() => setCurrentView('modules')}
            style={{
              color: '#4b5563',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.5rem'
            }}
          >
            ← Back to Modules
          </button>
        </div>
        <NeuralNetworkSimulation onComplete={(score) => handleModuleComplete('neural-network', score)} />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={login}
          onSignup={signup}
        />

        {/* User Dashboard */}
        <UserDashboard
          isOpen={isUserDashboardOpen}
          onClose={() => setIsUserDashboardOpen(false)}
        />
      </div>
    );
  }

  if (currentView === 'ai-builder') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <button 
            onClick={() => setCurrentView('modules')}
            style={{
              color: '#4b5563',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.5rem'
            }}
          >
            ← Back to Modules
          </button>
        </div>
        <AIBuilder onComplete={(score) => handleModuleComplete('ai-builder', score)} />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={login}
          onSignup={signup}
        />

        {/* User Dashboard */}
        <UserDashboard
          isOpen={isUserDashboardOpen}
          onClose={() => setIsUserDashboardOpen(false)}
        />
      </div>
    );
  }

  if (currentView === 'introduction') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={() => setCurrentView('modules')}
            style={{
              color: '#4b5563',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ← Back to Modules
          </button>
        </div>
        
        <div style={{ maxWidth: '72rem', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '700', color: '#111827', marginBottom: '2rem' }}>
            Welcome to AI! 🤖
          </h1>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', 
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                What is AI?
              </h3>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                AI helps computers learn patterns and make decisions, just like how you learn to recognize faces or predict what song you'll like.
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                How does it learn?
              </h3>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                By looking at lots of examples! Just like how you learned to read by seeing many words and sentences.
              </p>
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              Ready to explore? 🚀
            </h3>
            <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
              AI is everywhere around us - from the recommendations you see on YouTube to the way your phone recognizes your voice. Let's discover how it works through fun activities!
            </p>
            <button 
              onClick={() => setCurrentView('modules')}
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                fontWeight: '600',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.1rem'
              }}
            >
              Let's Start Learning!
            </button>
          </div>
        </div>

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={login}
          onSignup={signup}
        />

        {/* User Dashboard */}
        <UserDashboard
          isOpen={isUserDashboardOpen}
          onClose={() => setIsUserDashboardOpen(false)}
        />
      </div>
    );
  }

  if (currentView === 'regression') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <button 
            onClick={() => setCurrentView('modules')}
            style={{
              color: '#4b5563',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.5rem'
            }}
          >
            ← Back to Modules
          </button>
        </div>
        <RegressionGame onComplete={(score) => handleModuleComplete('regression', score)} />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={login}
          onSignup={signup}
        />

        {/* User Dashboard */}
        <UserDashboard
          isOpen={isUserDashboardOpen}
          onClose={() => setIsUserDashboardOpen(false)}
        />
      </div>
    );
  }

  if (currentView === 'welcome') {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br flex items-center justify-center p-6"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #14b8a6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}
      >
        <div 
          className="max-w-2xl mx-auto text-center"
          style={{
            maxWidth: '42rem',
            margin: '0 auto',
            textAlign: 'center'
          }}
        >
          <div 
            className="w-24 h-24 mx-auto mb-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
            style={{
              width: '6rem',
              height: '6rem',
              margin: '0 auto 2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>✨</span>
          </div>
          
          <h1 
            className="text-6xl font-bold text-white mb-6"
            style={{
              fontSize: '3.75rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1.5rem',
              lineHeight: '1'
            }}
          >
            Welcome to{' '}
            <span 
              className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent"
              style={{
                background: 'linear-gradient(to right, #fde047, #fb923c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Learnonauts
            </span>
          </h1>
          
          <p 
            className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
            style={{
              fontSize: '1.25rem',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '2rem',
              maxWidth: '42rem',
              margin: '0 auto 2rem',
              lineHeight: '1.75'
            }}
          >
            Embark on an amazing journey to discover the magic of Artificial Intelligence! 
            Learn through games, puzzles, and hands-on activities designed just for you.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={() => setCurrentView('modules')}
              className="bg-white text-purple-600 font-bold text-xl px-12 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'white',
                color: '#7c3aed',
                fontWeight: '700',
                fontSize: '1.25rem',
                padding: '1rem 3rem',
                borderRadius: '1rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
            >
              Start Your AI Adventure! 🚀
            </button>
            
            {!isAuthenticated && (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                style={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 2rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                Login / Sign Up
              </button>
            )}

            {isAuthenticated && (
              <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: '500' }}>
                Welcome back, {user?.displayName}! 👋
              </div>
            )}
          </div>
        </div>

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={login}
          onSignup={signup}
        />

        {/* User Dashboard */}
        <UserDashboard
          isOpen={isUserDashboardOpen}
          onClose={() => setIsUserDashboardOpen(false)}
        />
      </div>
    );
  }

  return (
    <BadgeSystem 
      completedModules={isAuthenticated ? Object.keys(user?.progress.moduleProgress || {}).filter(moduleId => user?.progress.moduleProgress[moduleId]?.completed) : completedModules} 
      scores={isAuthenticated ? Object.fromEntries(Object.entries(user?.progress.moduleProgress || {}).map(([moduleId, progress]) => [moduleId, progress.bestScore])) : scores}
    >
      <div 
        className="min-h-screen bg-gray-50 p-6"
        style={{
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          padding: '1.5rem'
        }}
      >
      <div 
        className="max-w-6xl mx-auto"
        style={{
          maxWidth: '72rem',
          margin: '0 auto'
        }}
      >
        <header style={{ marginBottom: '2rem' }}>
          <div 
            className="flex items-center justify-between"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div 
              className="flex items-center space-x-3"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <div 
                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center"
                style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ color: 'white', fontSize: '1.5rem' }}>🧠</span>
              </div>
              <div>
                <h1 
                  className="text-3xl font-bold text-gray-900"
                  style={{
                    fontSize: '1.875rem',
                    fontWeight: '700',
                    color: '#111827',
                    margin: 0
                  }}
                >
                  Learnonauts
                </h1>
                <p 
                  className="text-gray-600"
                  style={{
                    color: '#4b5563',
                    margin: 0
                  }}
                >
                  {isAuthenticated ? `Welcome back, ${user?.displayName}!` : 'AI Adventure Awaits!'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={() => setIsUserDashboardOpen(true)}
                    style={{
                      color: '#7c3aed',
                      backgroundColor: 'transparent',
                      border: '1px solid #7c3aed',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    My Profile
                  </button>
                  <button 
                    onClick={() => setAccessibilitySettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                    style={{
                      color: '#4b5563',
                      backgroundColor: 'transparent',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    🔧
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    style={{
                      color: '#7c3aed',
                      backgroundColor: 'transparent',
                      border: '1px solid #7c3aed',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    Login / Sign Up
                  </button>
                  <button 
                    onClick={() => setAccessibilitySettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                    style={{
                      color: '#4b5563',
                      backgroundColor: 'transparent',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    🔧
                  </button>
                </>
              )}
              <button 
                onClick={() => setCurrentView('welcome')}
                className="text-gray-600 hover:text-gray-900"
                style={{
                  color: '#4b5563',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                ← Back to Welcome
              </button>
            </div>
          </div>
        </header>

        {/* Progress Tracker */}
        <ProgressTracker 
          completedModules={isAuthenticated ? Object.keys(user?.progress.moduleProgress || {}).filter(moduleId => user?.progress.moduleProgress[moduleId]?.completed) : completedModules} 
          scores={isAuthenticated ? Object.fromEntries(Object.entries(user?.progress.moduleProgress || {}).map(([moduleId, progress]) => [moduleId, progress.bestScore])) : scores} 
          className="mb-8"
        />

        <div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
            gap: '1.5rem'
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              transition: 'box-shadow 0.3s'
            }}
          >
            <div 
              className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center mb-4"
              style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: '#8b5cf6',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <span style={{ color: 'white', fontSize: '1.5rem' }}>🧠</span>
            </div>
            <h3 
              className="text-xl font-semibold text-gray-900 mb-2"
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '0.5rem'
              }}
            >
              What is AI?
            </h3>
            <p 
              className="text-gray-600 mb-4"
              style={{
                color: '#4b5563',
                marginBottom: '1rem'
              }}
            >
              Discover the magic of artificial intelligence
            </p>
            <button 
              className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={() => setCurrentView('introduction')}
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Explore
            </button>
          </div>

          <div 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              transition: 'box-shadow 0.3s',
              position: 'relative'
            }}
          >
            {(isAuthenticated ? user?.progress.moduleProgress['classification']?.completed : completedModules.includes('classification')) && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: '#10b981',
                color: 'white',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem'
              }}>
                ✓
              </div>
            )}
            <div 
              className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mb-4"
              style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: '#3b82f6',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <span style={{ color: 'white', fontSize: '1.5rem' }}>🎯</span>
            </div>
            <h3 
              className="text-xl font-semibold text-gray-900 mb-2"
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '0.5rem'
              }}
            >
              Sorting Things {(isAuthenticated ? user?.progress.moduleProgress['classification']?.completed : completedModules.includes('classification')) && '🏆'}
            </h3>
            <p 
              className="text-gray-600 mb-4"
              style={{
                color: '#4b5563',
                marginBottom: '1rem'
              }}
            >
              Learn how computers can sort and categorize
              {(isAuthenticated ? user?.progress.moduleProgress['classification']?.completed : completedModules.includes('classification')) && (
                <><br /><span style={{ color: '#10b981', fontWeight: '500' }}>
                  Best Score: {isAuthenticated ? user?.progress.moduleProgress['classification']?.bestScore : scores.classification}%
                </span></>
              )}
            </p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={() => setCurrentView('classification')}
              style={{
                backgroundColor: (isAuthenticated ? user?.progress.moduleProgress['classification']?.completed : completedModules.includes('classification')) ? '#10b981' : '#3b82f6',
                color: 'white',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {(isAuthenticated ? user?.progress.moduleProgress['classification']?.completed : completedModules.includes('classification')) ? 'Play Again' : 'Play Game'}
            </button>
          </div>

          <div 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              transition: 'box-shadow 0.3s',
              position: 'relative'
            }}
          >
            {(isAuthenticated ? user?.progress.moduleProgress['clustering']?.completed : completedModules.includes('clustering')) && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: '#10b981',
                color: 'white',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem'
              }}>
                ✓
              </div>
            )}
            <div 
              className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center mb-4"
              style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: '#8b5cf6',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <span style={{ color: 'white', fontSize: '1.5rem' }}>🔍</span>
            </div>
            <h3 
              className="text-xl font-semibold text-gray-900 mb-2"
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '0.5rem'
              }}
            >
              Pattern Detective {(isAuthenticated ? user?.progress.moduleProgress['clustering']?.completed : completedModules.includes('clustering')) && '🏆'}
            </h3>
            <p 
              className="text-gray-600 mb-4"
              style={{
                color: '#4b5563',
                marginBottom: '1rem'
              }}
            >
              Find hidden groups in data
              {(isAuthenticated ? user?.progress.moduleProgress['clustering']?.completed : completedModules.includes('clustering')) && (
                <><br /><span style={{ color: '#10b981', fontWeight: '500' }}>
                  Best Score: {isAuthenticated ? user?.progress.moduleProgress['clustering']?.bestScore : scores.clustering}%
                </span></>
              )}
            </p>
            <button 
              className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={() => setCurrentView('clustering')}
              style={{
                backgroundColor: (isAuthenticated ? user?.progress.moduleProgress['clustering']?.completed : completedModules.includes('clustering')) ? '#10b981' : '#8b5cf6',
                color: 'white',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {(isAuthenticated ? user?.progress.moduleProgress['clustering']?.completed : completedModules.includes('clustering')) ? 'Play Again' : 'Play Game'}
            </button>
          </div>

          <div 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              transition: 'box-shadow 0.3s',
              position: 'relative'
            }}
          >
            {(isAuthenticated ? user?.progress.moduleProgress['regression']?.completed : completedModules.includes('regression')) && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: '#10b981',
                color: 'white',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem'
              }}>
                ✓
              </div>
            )}
            <div 
              className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center mb-4"
              style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: '#10b981',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <span style={{ color: 'white', fontSize: '1.5rem' }}>📈</span>
            </div>
            <h3 
              className="text-xl font-semibold text-gray-900 mb-2"
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '0.5rem'
              }}
            >
              Prediction Explorer {(isAuthenticated ? user?.progress.moduleProgress['regression']?.completed : completedModules.includes('regression')) && '🏆'}
            </h3>
            <p 
              className="text-gray-600 mb-4"
              style={{
                color: '#4b5563',
                marginBottom: '1rem'
              }}
            >
              Learn to predict trends and patterns
              {(isAuthenticated ? user?.progress.moduleProgress['regression']?.completed : completedModules.includes('regression')) && (
                <><br /><span style={{ color: '#10b981', fontWeight: '500' }}>
                  Best Score: {isAuthenticated ? user?.progress.moduleProgress['regression']?.bestScore : scores.regression}%
                </span></>
              )}
            </p>
            <button 
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={() => setCurrentView('regression')}
              style={{
                backgroundColor: (isAuthenticated ? user?.progress.moduleProgress['regression']?.completed : completedModules.includes('regression')) ? '#10b981' : '#10b981',
                color: 'white',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {(isAuthenticated ? user?.progress.moduleProgress['regression']?.completed : completedModules.includes('regression')) ? 'Play Again' : 'Play Game'}
            </button>
          </div>

          <div 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              transition: 'box-shadow 0.3s',
              position: 'relative'
            }}
          >
            {(isAuthenticated ? user?.progress.moduleProgress['neural-network']?.completed : completedModules.includes('neural-network')) && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: '#10b981',
                color: 'white',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem'
              }}>
                ✓
              </div>
            )}
            <div 
              className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center mb-4"
              style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: '#ef4444',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <span style={{ color: 'white', fontSize: '1.5rem' }}>⚡</span>
            </div>
            <h3 
              className="text-xl font-semibold text-gray-900 mb-2"
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '0.5rem'
              }}
            >
              Neural Network Lab {(isAuthenticated ? user?.progress.moduleProgress['neural-network']?.completed : completedModules.includes('neural-network')) && '🏆'}
            </h3>
            <p 
              className="text-gray-600 mb-4"
              style={{
                color: '#4b5563',
                marginBottom: '1rem'
              }}
            >
              Watch AI neurons think and learn
              {(isAuthenticated ? user?.progress.moduleProgress['neural-network']?.completed : completedModules.includes('neural-network')) && (
                <><br /><span style={{ color: '#10b981', fontWeight: '500' }}>
                  Best Score: {isAuthenticated ? user?.progress.moduleProgress['neural-network']?.bestScore : scores['neural-network']}%
                </span></>
              )}
            </p>
            <button 
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={() => setCurrentView('neural-network')}
              style={{
                backgroundColor: (isAuthenticated ? user?.progress.moduleProgress['neural-network']?.completed : completedModules.includes('neural-network')) ? '#10b981' : '#ef4444',
                color: 'white',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {(isAuthenticated ? user?.progress.moduleProgress['neural-network']?.completed : completedModules.includes('neural-network')) ? 'Play Again' : 'Explore'}
            </button>
          </div>

          <div 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              transition: 'box-shadow 0.3s'
            }}
          >
            <div 
              className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center mb-4"
              style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: '#f59e0b',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <span style={{ color: 'white', fontSize: '1.5rem' }}>🔮</span>
            </div>
            <h3 
              className="text-xl font-semibold text-gray-900 mb-2"
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '0.5rem'
              }}
            >
              Create Your Own AI
            </h3>
            <p 
              className="text-gray-600 mb-4"
              style={{
                color: '#4b5563',
                marginBottom: '1rem'
              }}
            >
              Build your own mini AI models and watch them come to life!
            </p>
            <button 
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={() => setCurrentView('ai-builder')}
              style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d97706';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f59e0b';
              }}
            >
              Start Building!
            </button>
          </div>
        </div>
      </div>
      
      {/* Accessibility Panel */}
      <AccessibilityPanel
        settings={accessibilitySettings}
        onSettingsChange={setAccessibilitySettings}
        isOpen={isAccessibilityPanelOpen}
        onToggle={() => setIsAccessibilityPanelOpen(!isAccessibilityPanelOpen)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={login}
        onSignup={signup}
      />

      {/* User Dashboard */}
      <UserDashboard
        isOpen={isUserDashboardOpen}
        onClose={() => setIsUserDashboardOpen(false)}
      />
      </div>
    </BadgeSystem>
  );
}

export default App;
