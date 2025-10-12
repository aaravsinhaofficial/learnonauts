import { useState } from 'react';
import { ClassificationGame } from './components/modules/ClassificationGame';
import { RegressionGame } from './components/modules/RegressionGame';
import { ClusteringGame } from './components/modules/ClusteringGame';
import { NeuralNetworkSimulation } from './components/modules/NeuralNetworkSimulation';
// import { AIBuilder } from './components/modules/AIBuilder';
import { LessonContent } from './components/modules/LessonContent';
// import { InteractiveAITrainer } from './components/modules/InteractiveAITrainer';
import { ImageClassifier } from './components/modules/ImageClassifier';
import AccessibilityPanel, { defaultAccessibilitySettings } from './components/AccessibilityPanel';
import type { AccessibilitySettings } from './components/AccessibilityPanel';
import { BadgeSystem } from './components/BadgeSystem';
import { ProgressTracker } from './components/ProgressTracker';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { NeurodivergentWrapper } from './components/NeurodivergentWrapper';
import { BreakReminder } from './components/BreakReminder';
import { FocusTimer } from './components/FocusTimer';
import { AccessibilityDemo } from './components/AccessibilityDemo';
import { useAuth } from './context/AuthContext';
import { speechManager } from './utils/speechSynthesis';
import { TimerControl } from './components/TimerControl';
import { TaskBreakdown } from './components/TaskBreakdown';
import { TaskSequencer } from './components/TaskSequencer';
import { adhdSettings, autismSettings, dyslexiaSettings } from './utils/accessibilitySettings';
import PlacementTest from './components/PlacementTest';
import PracticeMode from './components/PracticeMode';

function App() {
  const { user, isAuthenticated, login, signup, updateProgress } = useAuth();
  const [currentView, setCurrentView] = useState<'welcome' | 'modules' | 'classification' | 'regression' | 'clustering' | 'neural-network' | 'introduction' | 'training-lab' | 'accessibility-demo' | 'image-classifier' | 'placement' | 'practice'>('welcome');
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(defaultAccessibilitySettings);
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);

  // Update speech manager when accessibility settings change
  const handleAccessibilitySettingsChange = (newSettings: AccessibilitySettings) => {
    setAccessibilitySettings(newSettings);
    
    // Debug logs to track speech settings
    console.log("Speech settings changed:", {
      speechEnabled: newSettings.speechEnabled,
      speechSpeed: newSettings.speechSpeed,
      speechVolume: newSettings.speechVolume
    });
    
    // Update speech manager with correct speech settings
    speechManager.setEnabled(newSettings.speechEnabled);
    
    // Only set these if speech is enabled to avoid unnecessary processing
    if (newSettings.speechEnabled) {
      speechManager.setDefaultRate(newSettings.speechSpeed);
      speechManager.setDefaultVolume(newSettings.speechVolume);
      
      // Test that speech is working after enabling
      if (newSettings.speechEnabled !== accessibilitySettings.speechEnabled) {
        console.log("Testing speech after enabling");
        try {
          speechManager.speak("Speech synthesis enabled.");
        } catch (error) {
          console.error("Failed to initialize speech synthesis:", error);
        }
      }
    }
  };

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
  if (currentView === 'placement') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <button onClick={() => setCurrentView('modules')} style={{ color: '#4b5563', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.5rem' }}>← Back to Modules</button>
        </div>
        <PlacementTest onComplete={(score) => handleModuleComplete('placement', score)} />
      </div>
    );
  }

  if (currentView === 'practice') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <button onClick={() => setCurrentView('modules')} style={{ color: '#4b5563', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.5rem' }}>← Back to Modules</button>
        </div>
        <PracticeMode onComplete={(score) => handleModuleComplete('practice', score)} />
      </div>
    );
  }
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
        <ClassificationGame 
          onComplete={(score) => handleModuleComplete('classification', score)} 
          accessibilitySettings={accessibilitySettings}
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
        <ClusteringGame 
          onComplete={(score) => handleModuleComplete('clustering', score)} 
          accessibilitySettings={accessibilitySettings}
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
        <NeuralNetworkSimulation 
          onComplete={(score) => handleModuleComplete('neural-network', score)} 
          accessibilitySettings={accessibilitySettings}
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
    );
  }

  if (currentView === 'training-lab') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white' }}>
          <button 
            onClick={() => setCurrentView('modules')}
            style={{ color: '#4b5563', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.5rem' }}
          >
            ← Back to Modules
          </button>
        </div>
        <AITrainingLab onComplete={(score) => handleModuleComplete('training-lab', score)} />

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

  if (currentView === 'image-classifier') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white' }}>
          <button 
            onClick={() => setCurrentView('modules')}
            style={{
              color: '#4b5563',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '500'
            }}
          >
            ← Back to Modules
          </button>
        </div>
        <ImageClassifier 
          onComplete={(score) => handleModuleComplete('image-classifier', score)} 
          accessibilitySettings={accessibilitySettings}
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
    );
  }

  if (currentView === 'accessibility-demo') {
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
        <AccessibilityDemo 
          settings={accessibilitySettings}
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
    );
  }

  if (currentView === 'introduction') {
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
        
        <LessonContent 
          lessonId="ai-fundamentals"
          onComplete={() => {
            handleModuleComplete('introduction', 100);
            setCurrentView('modules');
          }}
          accessibilitySettings={accessibilitySettings}
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
        <RegressionGame 
          onComplete={(score) => handleModuleComplete('regression', score)} 
          accessibilitySettings={accessibilitySettings}
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
      <NeurodivergentWrapper settings={accessibilitySettings}>
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
              {/* Streak + XP (authenticated users) */}
              {isAuthenticated && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginRight: '0.5rem' }}>
                  <div style={{
                    backgroundColor: '#fff7ed',
                    border: '1px solid #fed7aa',
                    color: '#9a3412',
                    padding: '6px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>🔥</span>
                    <span>Streak {user?.progress.currentStreak || 0}</span>
                  </div>
                  <div style={{
                    backgroundColor: '#eef2ff',
                    border: '1px solid #c7d2fe',
                    color: '#3730a3',
                    padding: '6px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>⭐</span>
                    <span>{user?.progress.xpToday || 0}/{user?.progress.dailyGoal || 50} XP</span>
                  </div>
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '6px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }} title="Hearts">
                    <span>❤️</span>
                    <span>{user?.progress.hearts ?? 5}</span>
                  </div>
                </div>
              )}
              {isAuthenticated ? (
                <>
                  {/* Child Mode quick toggle */}
                  <button
                    onClick={() => {
                      // child mode preset
                      handleAccessibilitySettingsChange({
                        ...accessibilitySettings,
                        fontSize: 'large',
                        reducedMotion: true,
                        simplifiedUI: true,
                        minimalMode: true,
                        speechEnabled: true,
                        speechInstructions: true,
                        colorTheme: 'warm'
                      });
                    }}
                    style={{
                      color: '#065f46',
                      backgroundColor: 'transparent',
                      border: '1px solid #34d399',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                    title="Enable Child Mode"
                  >
                    👶 Child Mode
                  </button>
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
                    onClick={() => {
                      console.log('🔧 Accessibility button clicked (authenticated)!');
                      setIsAccessibilityPanelOpen(true);
                    }}
                    style={{
                      color: '#4b5563',
                      backgroundColor: 'transparent',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                    title="Open Accessibility Settings"
                  >
                    🔧
                  </button>
                </>
              ) : (
                <>
                  {/* Child Mode quick toggle */}
                  <button
                    onClick={() => {
                      handleAccessibilitySettingsChange({
                        ...accessibilitySettings,
                        fontSize: 'large',
                        reducedMotion: true,
                        simplifiedUI: true,
                        minimalMode: true,
                        speechEnabled: true,
                        speechInstructions: true,
                        colorTheme: 'warm'
                      });
                    }}
                    style={{
                      color: '#065f46',
                      backgroundColor: 'transparent',
                      border: '1px solid #34d399',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                    title="Enable Child Mode"
                  >
                    👶 Child Mode
                  </button>
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
                    onClick={() => {
                      console.log('🔧 Accessibility button clicked (not authenticated)!');
                      setIsAccessibilityPanelOpen(true);
                    }}
                    style={{
                      color: '#4b5563',
                      backgroundColor: 'transparent',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                    title="Open Accessibility Settings"
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
          {/* Placement Test */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '1.5rem', transition: 'box-shadow 0.3s' }}
          >
            <div className="w-16 h-16 bg-indigo-500 rounded-lg flex items-center justify-center mb-4" style={{ width: '4rem', height: '4rem', backgroundColor: '#6366f1', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <span style={{ color: 'white', fontSize: '1.5rem' }}>📘</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Placement Test</h3>
            <p className="text-gray-600 mb-4" style={{ color: '#4b5563', marginBottom: '1rem' }}>Find your level and unlock the best path.</p>
            <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors" onClick={() => setCurrentView('placement')} style={{ backgroundColor: '#6366f1', color: 'white', fontWeight: 500, padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}>Start</button>
          </div>

          {/* Practice Mode */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '1.5rem', transition: 'box-shadow 0.3s' }}
          >
            <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center mb-4" style={{ width: '4rem', height: '4rem', backgroundColor: '#22c55e', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <span style={{ color: 'white', fontSize: '1.5rem' }}>🧩</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Practice</h3>
            <p className="text-gray-600 mb-4" style={{ color: '#4b5563', marginBottom: '1rem' }}>Review your weakest concepts and earn XP.</p>
            <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors" onClick={() => setCurrentView('practice')} style={{ backgroundColor: '#22c55e', color: 'white', fontWeight: 500, padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}>Practice</button>
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

          {/* AI Training Lab (Consolidated) */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '1.5rem', transition: 'box-shadow 0.3s' }}
          >
            <div className="w-16 h-16 bg-teal-500 rounded-lg flex items-center justify-center mb-4" style={{ width: '4rem', height: '4rem', backgroundColor: '#14b8a6', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <span style={{ color: 'white', fontSize: '1.5rem' }}>🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>AI Training Lab</h3>
            <p className="text-gray-600 mb-4" style={{ color: '#4b5563', marginBottom: '1rem' }}>Auto-train on built-in data or your own. See learning live!</p>
            <button className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-colors" onClick={() => setCurrentView('training-lab')} style={{ backgroundColor: '#14b8a6', color: 'white', fontWeight: 500, padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}>Open Lab</button>
          </div>

          {/* Image Classifier Module - NEW! */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              transition: 'box-shadow 0.3s',
              border: '3px solid #fbbf24'
            }}
          >
            <div 
              className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center mb-4"
              style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: '#fbbf24',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <span style={{ color: 'white', fontSize: '1.5rem' }}>📸</span>
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
              Upload & Analyze Photos ✨ NEW!
            </h3>
            <p 
              className="text-gray-600 mb-4"
              style={{
                color: '#4b5563',
                marginBottom: '1rem',
                fontSize: '0.95rem',
                lineHeight: '1.6'
              }}
            >
              Upload your own photos and let AI identify what's in them! Simple drag & drop interface perfect for everyone.
            </p>
            <button 
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={() => setCurrentView('image-classifier')}
              style={{
                backgroundColor: '#fbbf24',
                color: 'white',
                fontWeight: '600',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.95rem',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f59e0b';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fbbf24';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              📸 Upload Photos!
            </button>
          </div>

          {/* Accessibility Demo Module */}
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
              className="w-16 h-16 bg-indigo-500 rounded-lg flex items-center justify-center mb-4"
              style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: '#6366f1',
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
              Accessibility Features Demo 🌟
            </h3>
            <p 
              className="text-gray-600 mb-4"
              style={{
                color: '#4b5563',
                marginBottom: '1rem'
              }}
            >
              Test all neurodivergent-friendly features and customize your learning experience!
            </p>
            <button 
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={() => setCurrentView('accessibility-demo')}
              style={{
                backgroundColor: '#6366f1',
                color: 'white',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4f46e5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6366f1';
              }}
            >
              Try Features!
            </button>
          </div>
        </div>
      </div>
      
      {/* Break Reminder for ADHD Support */}
      <BreakReminder
        enabled={accessibilitySettings.breakReminders}
        interval={20}
        sensoryBreaks={accessibilitySettings.sensoryBreaks}
      />
      
      {/* Focus Timer for ADHD Support */}
      <FocusTimer
        visible={accessibilitySettings.visibleTimers}
        onComplete={() => {
          // Optional: trigger a gentle celebration using speech manager
          if (accessibilitySettings.soundEnabled) {
            speechManager.speakFocusComplete('focus');
          }
        }}
      />
      
      {/* Advanced Timer Control */}
      <TimerControl 
        settings={accessibilitySettings}
        durationMinutes={25}
        onComplete={() => {
          if (accessibilitySettings.speechEnabled) {
            speechManager.speak(
              "Great job completing your focus session! Time for a short break.",
              { rate: accessibilitySettings.speechSpeed, volume: accessibilitySettings.speechVolume }
            );
          }
        }}
      />
      
      {/* Accessibility Panel */}
      <AccessibilityPanel
        settings={accessibilitySettings}
        onSettingsChange={handleAccessibilitySettingsChange}
        isOpen={isAccessibilityPanelOpen}
        onClose={() => setIsAccessibilityPanelOpen(false)}
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
      </NeurodivergentWrapper>
    </BadgeSystem>
  );
}

export default App;
import { AITrainingLab } from './components/modules/AITrainingLab';
