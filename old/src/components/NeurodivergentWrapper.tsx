import React, { useEffect, useRef } from 'react';
import type { AccessibilitySettings } from './AccessibilityPanel';

interface NeurodivergentWrapperProps {
  children: React.ReactNode;
  settings: AccessibilitySettings;
  className?: string;
}

export function NeurodivergentWrapper({ children, settings, className = '' }: NeurodivergentWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Track active elements for focus management
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const focusHistoryRef = useRef<HTMLElement[]>([]);

  // Focus management helper to support executive function
  const trackFocus = () => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== previouslyFocusedRef.current && activeElement !== document.body) {
      previouslyFocusedRef.current = activeElement;
      focusHistoryRef.current.push(activeElement);
      
      // Keep a limited history
      if (focusHistoryRef.current.length > 10) {
        focusHistoryRef.current.shift();
      }
    }
  };

  // Set up focus tracking
  useEffect(() => {
    if (settings.enhancedFocusOutlines) {
      document.addEventListener('focusin', trackFocus);
      return () => document.removeEventListener('focusin', trackFocus);
    }
  }, [settings.enhancedFocusOutlines]);

  // Apply reading guide
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Apply reading guide
    if (settings.readingGuide) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reading-focus');
          } else {
            entry.target.classList.remove('reading-focus');
          }
        });
      }, { threshold: 0.5 });

      wrapper.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6').forEach((el: Element) => {
        observer.observe(el);
      });

      return () => observer.disconnect();
    }
  }, [settings.readingGuide]);

  // We need to apply theme changes in a specific order to prevent conflicts
  useEffect(() => {
    // Force a redraw of the theme by briefly adding and removing a dummy class
    document.documentElement.classList.add('theme-transition');
    
    // First remove all theme classes to start fresh
    document.documentElement.classList.remove(
      'dark-mode',
      'high-contrast', 
      'dyslexia-friendly', 
      'autism-friendly', 
      'warm', 
      'cool'
    );
    
    // First apply the color theme
    if (settings.colorTheme !== 'default') {
      document.documentElement.classList.add(settings.colorTheme);
    }
    
    // Then apply dark mode if it's enabled (this will override some theme colors)
    if (settings.darkMode) {
      document.documentElement.classList.add('dark-mode');
      
      // Apply these styles to the body and html elements as well for full coverage
      document.body.style.backgroundColor = 'var(--bg-primary)';
      document.body.style.color = 'var(--text-primary)';
      document.documentElement.style.backgroundColor = 'var(--bg-primary)';
      document.documentElement.style.color = 'var(--text-primary)';
    } else {
      // Reset to default if dark mode is disabled
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      document.documentElement.style.backgroundColor = '';
      document.documentElement.style.color = '';
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    
    // Force a repaint to ensure variables are recalculated
    // This forces the browser to recalculate styles before proceeding
    document.documentElement.offsetHeight;
    
    // Remove transition class after a slight delay to ensure CSS transitions work
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 50);

    // Add dynamic styles to document head
    const styleId = 'neurodivergent-styles';
    let existingStyle = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!existingStyle) {
      existingStyle = document.createElement('style');
      existingStyle.id = styleId;
      document.head.appendChild(existingStyle);
    }

    // Font size mappings
    const fontSizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '22px'
    };

    existingStyle.textContent = `
      /* Base font size */
      .neurodivergent-wrapper {
        font-size: ${fontSizeMap[settings.fontSize as keyof typeof fontSizeMap]} !important;
        line-height: 1.6 !important;
      }
      
      /* High contrast theme */
      .high-contrast {
        filter: contrast(150%) !important;
        background: #ffffff !important;
        color: #000000 !important;
      }
      
      .high-contrast button, .high-contrast input, .high-contrast select {
        border: 3px solid #000000 !important;
        background: #ffffff !important;
        color: #000000 !important;
      }
      
      .high-contrast button:hover {
        background: #000000 !important;
        color: #ffffff !important;
      }
      
      /* Reduced motion */
      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        transform: none !important;
      }
      
      /* Enhanced focus outlines */
      .enhanced-focus *:focus {
        outline: 4px solid #3b82f6 !important;
        outline-offset: 3px !important;
        border-radius: 6px !important;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3) !important;
      }
      
      /* Focus history - for executive function support */
      .enhanced-focus .focus-history-back-button {
        transform: scale(1);
        transition: all 0.2s ease;
      }
      
      .enhanced-focus .focus-history-back-button:hover,
      .enhanced-focus .focus-history-back-button:focus {
        transform: scale(1.05);
      }
      
      /* Cognitive load management */
      .minimal-content-density {
        line-height: 2.2 !important;
        letter-spacing: 0.05em !important;
      }
      
      .minimal-content-density p, 
      .minimal-content-density li, 
      .minimal-content-density h1, 
      .minimal-content-density h2, 
      .minimal-content-density h3 {
        margin-bottom: 1.5em !important;
      }
      
      .reduced-content-density {
        line-height: 1.8 !important;
        letter-spacing: 0.03em !important;
      }
      
      /* Distraction reduction */
      .distraction-reduced .decoration, 
      .distraction-reduced .optional-ui, 
      .distraction-reduced .secondary-content {
        display: none !important;
      }
      
      /* Minimal UI mode */
      .minimal-ui img:not(.essential-image) {
        filter: grayscale(50%) !important;
        opacity: 0.8 !important;
      }
      
      .minimal-ui .navigation-secondary,
      .minimal-ui .widget-optional,
      .minimal-ui .feedback-optional {
        display: none !important;
      }
      
      /* Dark mode */
      .dark-mode {
        background: #1a202c !important;
        color: #f7fafc !important;
      }
      
      /* Dyslexia friendly */
      .dyslexia-friendly {
        font-family: 'OpenDyslexic', 'Comic Sans MS', Helvetica, Arial, sans-serif !important;
        font-weight: bold !important;
        letter-spacing: 0.12em !important;
        word-spacing: 0.16em !important;
      }
      
      /* Autism friendly */
      .autism-friendly {
        background-color: #f4f7f9 !important;
        color: #2d3748 !important;
      }
      
      .autism-friendly button, 
      .autism-friendly input,
      .autism-friendly select {
        border-radius: 4px !important;
        transition: none !important;
      }
      
      .autism-friendly h1, 
      .autism-friendly h2, 
      .autism-friendly h3 {
        color: #2c5282 !important;
        font-weight: 600 !important;
        border-bottom: 1px solid #e2e8f0 !important;
        padding-bottom: 0.5rem !important;
      }
      
      /* Reading guide */
      .reading-focus {
        background: rgba(255, 255, 0, 0.2) !important;
        padding: 0.25rem !important;
        margin: 0.25rem 0 !important;
        border-left: 4px solid #fbbf24 !important;
      }
      
      /* Color overlays */
      .color-overlay-blue {
        background-color: rgba(59, 130, 246, 0.1) !important;
      }
      
      .color-overlay-yellow {
        background-color: rgba(251, 191, 36, 0.1) !important;
      }
      
      .color-overlay-green {
        background-color: rgba(16, 185, 129, 0.1) !important;
      }
      
      .color-overlay-pink {
        background-color: rgba(236, 72, 153, 0.1) !important;
      }
      
      .overlay-blue {
        background-color: rgba(59, 130, 246, 0.2);
      }
      
      .overlay-yellow {
        background-color: rgba(251, 191, 36, 0.2);
      }
      
      .overlay-green {
        background-color: rgba(16, 185, 129, 0.2);
      }
      
      .overlay-pink {
        background-color: rgba(236, 72, 153, 0.2);
      }
      
      /* Text spacing */
      .text-spacing-wide {
        letter-spacing: 0.1em !important;
      }
      
      .text-spacing-extra-wide {
        letter-spacing: 0.15em !important;
      }
      
      /* Word spacing */
      .word-spacing-wide {
        word-spacing: 0.1em !important;
      }
      
      .word-spacing-extra-wide {
        word-spacing: 0.15em !important;
      }
      
      /* Line height */
      .line-height-relaxed {
        line-height: 1.75 !important;
      }
      
      .line-height-loose {
        line-height: 2.0 !important;
      }
      
      /* Color overlays */
      .color-overlay-blue {
        background-color: rgba(173, 216, 230, 0.3) !important;
      }
      
      .color-overlay-yellow {
        background-color: rgba(255, 255, 224, 0.5) !important;
      }
      
      .color-overlay-green {
        background-color: rgba(144, 238, 144, 0.3) !important;
      }
      
      .color-overlay-pink {
        background-color: rgba(255, 192, 203, 0.3) !important;
      }
      
      /* Cognitive load styles */
      .cognitive-load-minimal {
        background: #ffffff !important;
        border: none !important;
        box-shadow: none !important;
      }
      
      .cognitive-load-reduced {
        background: #f9fafb !important;
        border: 1px solid #e5e7eb !important;
      }
      
      /* Simplified UI */
      .simplified-ui button,
      .simplified-ui input,
      .simplified-ui select {
        border-radius: 8px !important;
        padding: 12px 16px !important;
        font-size: 16px !important;
        border: 2px solid #d1d5db !important;
      }
      
      /* Distraction reduction */
      .distraction-reduction {
        background: var(--card-background) !important;
        border: none !important;
        box-shadow: none !important;
      }
      
      /* Timer display */
      .timer-display {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        background: rgba(0, 0, 0, 0.8) !important;
        color: white !important;
        padding: 8px 12px !important;
        border-radius: 6px !important;
        z-index: 9999 !important;
      }
      
      /* Error handling styles */
      .error-handling-gentle .error {
        background: #fef2f2 !important;
        color: #991b1b !important;
        border: 1px solid #fca5a5 !important;
        border-radius: 6px !important;
        padding: 8px 12px !important;
      }
      
      .error-handling-encouraging .error {
        background: #eff6ff !important;
        color: #1e40af !important;
        border: 1px solid #93c5fd !important;
        border-radius: 6px !important;
        padding: 8px 12px !important;
      }
      
      /* Learning patterns styles */
      .visual-learning-mode .text-content {
        display: flex !important;
        flex-direction: column !important;
      }
      
      .visual-learning-mode .text-content::before {
        content: "";
        display: block !important;
        height: 4px !important;
        background: linear-gradient(to right, #3b82f6, #8b5cf6) !important;
        margin-bottom: 12px !important;
        border-radius: 2px !important;
      }
      
      .visual-learning-mode .key-concept {
        background-color: rgba(59, 130, 246, 0.1) !important;
        border-left: 4px solid #3b82f6 !important;
        padding: 12px !important;
        margin: 16px 0 !important;
        border-radius: 4px !important;
      }
      
      .auditory-learning-mode .text-paragraph::before {
        content: "🔊" !important;
        display: inline-block !important;
        margin-right: 8px !important;
        opacity: 0.5 !important;
      }
      
      .kinesthetic-learning-mode .interactive-element {
        transform: scale(1.05) !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
      }
      
      .kinesthetic-learning-mode .interactive-element:hover {
        transform: scale(1.1) !important;
      }
      
      .information-chunking p {
        max-width: 650px !important;
        margin-bottom: 1.5rem !important;
        line-height: 1.8 !important;
      }
      
      .information-chunking h2, 
      .information-chunking h3 {
        border-bottom: 1px solid #e5e7eb !important;
        padding-bottom: 0.5rem !important;
        margin-top: 2rem !important;
      }
      
      .concept-mapping-support .concept-map {
        display: flex !important;
        flex-direction: column !important;
        gap: 16px !important;
        margin: 24px 0 !important;
        padding: 16px !important;
        background-color: #f9fafb !important;
        border-radius: 8px !important;
      }
      
      .concept-mapping-support .concept-node {
        padding: 12px !important;
        background-color: #ffffff !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 6px !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
      }
      
      .multi-modal-learning .content-block {
        display: flex !important;
        flex-direction: column !important;
        gap: 16px !important;
      }
      
      .multi-modal-learning .visual-cue {
        display: inline-block !important;
        width: 24px !important;
        height: 24px !important;
        margin-right: 8px !important;
        vertical-align: middle !important;
      }
      
      .repetition-preference .key-point {
        position: relative !important;
        background-color: rgba(16, 185, 129, 0.1) !important;
        padding: 12px !important;
        margin: 16px 0 !important;
        border-radius: 4px !important;
      }
      
      .repetition-preference .key-point::before {
        content: "Review Point" !important;
        position: absolute !important;
        top: -10px !important;
        left: 12px !important;
        background-color: #10b981 !important;
        color: white !important;
        font-size: 12px !important;
        padding: 2px 8px !important;
        border-radius: 4px !important;
      }
      
      .pattern-recognition .pattern-highlight {
        background-color: rgba(139, 92, 246, 0.1) !important;
        border: 1px dashed #8b5cf6 !important;
        padding: 8px !important;
        border-radius: 4px !important;
      }
      
      /* Interaction styles */
      .interaction-step-by-step .step {
        counter-increment: step-counter !important;
      }
      
      .interaction-step-by-step .step::before {
        content: counter(step-counter) !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 28px !important;
        height: 28px !important;
        background-color: #3b82f6 !important;
        color: white !important;
        border-radius: 50% !important;
        margin-right: 12px !important;
        font-weight: bold !important;
      }
      
      .interaction-guided .instruction {
        background-color: #eff6ff !important;
        border-left: 4px solid #3b82f6 !important;
        padding: 12px !important;
        margin: 16px 0 !important;
        border-radius: 0 4px 4px 0 !important;
      }
      
      .interaction-freestyle .control {
        transform: scale(1) !important;
        transition: all 0.2s ease !important;
      }
      
      .interaction-freestyle .control:hover {
        transform: scale(1.05) !important;
      }
    `;
  }, [
    settings.colorTheme, 
    settings.darkMode, 
    settings.reducedMotion,
    settings.enhancedFocusOutlines,
    settings.fontSize,
    settings.letterSpacing,
    settings.lineHeight,
    settings.wordSpacing,
    settings.colorOverlay
  ]);

  // Cognitive load management with dynamic content visibility
  useEffect(() => {
    if (!wrapperRef.current) return;

    const wrapper = wrapperRef.current;
    const nonEssentialElements = wrapper.querySelectorAll('.non-essential, .decoration, .optional-content');
    
    if (settings.cognitiveLoad === 'minimal') {
      // Hide all non-essential elements
      nonEssentialElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
      
      // Add extra whitespace
      wrapper.classList.add('minimal-content-density');
    } else if (settings.cognitiveLoad === 'reduced') {
      // Show some non-essential elements with reduced opacity
      nonEssentialElements.forEach(el => {
        (el as HTMLElement).style.display = 'block';
        (el as HTMLElement).style.opacity = '0.7';
      });
      
      // Add moderate whitespace
      wrapper.classList.add('reduced-content-density');
      wrapper.classList.remove('minimal-content-density');
    } else {
      // Show all elements normally
      nonEssentialElements.forEach(el => {
        (el as HTMLElement).style.display = '';
        (el as HTMLElement).style.opacity = '';
      });
      
      // Use normal spacing
      wrapper.classList.remove('minimal-content-density', 'reduced-content-density');
    }
  }, [settings.cognitiveLoad]);

  // Learning patterns management
  useEffect(() => {
    if (!wrapperRef.current) return;
    
    const wrapper = wrapperRef.current;
    
    // Apply learning pattern specific classes
    const classes = [
      settings.multiModalLearning ? 'multi-modal-learning' : '',
      settings.conceptMappingSupport ? 'concept-mapping-support' : '',
      settings.informationChunking ? 'information-chunking' : '',
      settings.visualLearningMode ? 'visual-learning-mode' : '',
      settings.auditoryLearningMode ? 'auditory-learning-mode' : '',
      settings.kinestheticLearningMode ? 'kinesthetic-learning-mode' : '',
      settings.repetitionPreference ? 'repetition-preference' : '',
      settings.patternRecognition ? 'pattern-recognition' : '',
      `interaction-${settings.interactionStyle}`
    ].filter(Boolean);
    
    // Add classes to wrapper
    classes.forEach(cls => {
      if (cls) wrapper.classList.add(cls);
    });
    
    // Apply multimodal learning features
    if (settings.multiModalLearning) {
      // Add visual indicators for audio content
      wrapper.querySelectorAll('audio').forEach(audio => {
        const parent = audio.parentElement;
        if (parent && !parent.querySelector('.audio-visual-indicator')) {
          const indicator = document.createElement('div');
          indicator.className = 'audio-visual-indicator';
          indicator.innerHTML = '🔊 Audio Content Available';
          indicator.style.backgroundColor = '#e0f2fe';
          indicator.style.padding = '8px 12px';
          indicator.style.borderRadius = '4px';
          indicator.style.marginBottom = '10px';
          indicator.style.fontSize = '14px';
          parent.insertBefore(indicator, audio);
        }
      });
    }
    
    // Information chunking support
    if (settings.informationChunking) {
      wrapper.querySelectorAll('p').forEach(p => {
        if (p.textContent && p.textContent.length > 200 && !p.classList.contains('chunked')) {
          p.classList.add('chunked');
          (p as HTMLElement).style.maxWidth = '650px';
          (p as HTMLElement).style.lineHeight = '1.8';
          (p as HTMLElement).style.marginBottom = '1.5rem';
        }
      });
      
      // Add visual separators between sections
      wrapper.querySelectorAll('h2, h3').forEach(heading => {
        if (!heading.classList.contains('chunked-heading')) {
          heading.classList.add('chunked-heading');
          (heading as HTMLElement).style.borderBottom = '1px solid #e5e7eb';
          (heading as HTMLElement).style.paddingBottom = '0.5rem';
          (heading as HTMLElement).style.marginTop = '2rem';
        }
      });
    }
    
    // Clean up on unmount or settings change
    return () => {
      classes.forEach(cls => {
        if (cls) wrapper.classList.remove(cls);
      });
    };
  }, [
    settings.multiModalLearning,
    settings.conceptMappingSupport,
    settings.informationChunking,
    settings.visualLearningMode,
    settings.auditoryLearningMode,
    settings.kinestheticLearningMode,
    settings.repetitionPreference,
    settings.patternRecognition,
    settings.interactionStyle
  ]);

  // Create class names based on settings
  const getClassNames = () => {
    const classes = [
      'neurodivergent-wrapper',
      className || '',
      settings.enhancedFocusOutlines ? 'enhanced-focus' : '',
      settings.letterSpacing !== 'normal' ? `text-spacing-${settings.letterSpacing}` : '',
      settings.wordSpacing !== 'normal' ? `word-spacing-${settings.wordSpacing}` : '',
      settings.lineHeight !== 'normal' ? `line-height-${settings.lineHeight}` : '',
      settings.colorOverlay !== 'none' ? `color-overlay-${settings.colorOverlay}` : '',
      settings.distractionReduction ? 'distraction-reduced' : '',
      settings.simplifiedUI ? 'simplified-ui' : '',
      settings.minimalMode ? 'minimal-ui' : '',
      settings.visualLearningMode ? 'visual-learning-mode' : '',
      settings.auditoryLearningMode ? 'auditory-learning-mode' : '',
      settings.kinestheticLearningMode ? 'kinesthetic-learning-mode' : '',
      settings.multiModalLearning ? 'multi-modal-learning' : '',
      settings.conceptMappingSupport ? 'concept-mapping-support' : '',
      settings.informationChunking ? 'information-chunking' : '',
      settings.repetitionPreference ? 'repetition-preference' : '',
      settings.patternRecognition ? 'pattern-recognition' : '',
      `interaction-${settings.interactionStyle}`
    ].filter(Boolean).join(' ');

    return classes;
  };

  return (
    <div ref={wrapperRef} className={getClassNames()}>
      {settings.colorOverlay !== 'none' && (
        <div 
          className={`color-overlay overlay-${settings.colorOverlay}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 9999,
            mixBlendMode: 'multiply',
            opacity: 0.15
          }}
        />
      )}
      
      {children}
      
      {/* Add back button for executive function support */}
      {settings.enhancedFocusOutlines && focusHistoryRef.current.length > 1 && (
        <button
          className="focus-history-back-button"
          onClick={() => {
            const previousElement = focusHistoryRef.current[focusHistoryRef.current.length - 2];
            if (previousElement) {
              previousElement.focus();
              focusHistoryRef.current.pop();
            }
          }}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 1000,
            padding: '8px 12px',
            backgroundColor: settings.darkMode ? '#1e40af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontSize: '14px',
            cursor: 'pointer',
            display: settings.distractionReduction ? 'none' : 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>←</span> Previous Focus
        </button>
      )}
    </div>
  );
}
