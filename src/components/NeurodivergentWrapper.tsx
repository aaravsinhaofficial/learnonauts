import React, { useEffect, useRef } from 'react';
import type { AccessibilitySettings } from './AccessibilityPanel';

interface NeurodivergentWrapperProps {
  children: React.ReactNode;
  settings: AccessibilitySettings;
  className?: string;
}

export function NeurodivergentWrapper({ children, settings, className = '' }: NeurodivergentWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Apply dark mode to the entire document
    if (settings.darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }

    // Apply color theme to document
    document.documentElement.classList.remove(
      'high-contrast', 'dyslexia-friendly', 'autism-friendly', 'warm', 'cool'
    );
    if (settings.colorTheme !== 'default') {
      document.documentElement.classList.add(settings.colorTheme);
    }

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
      
      /* Reading guide */
      .reading-focus {
        background: rgba(255, 255, 0, 0.2) !important;
        padding: 0.25rem !important;
        margin: 0.25rem 0 !important;
        border-left: 4px solid #fbbf24 !important;
      }
      
      /* Color themes */
      .color-theme-autism-friendly {
        background: #f0f4f8 !important;
        color: #2d3748 !important;
      }
      
      .color-theme-dyslexia-friendly {
        background: #fffef7 !important;
        color: #1a202c !important;
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
    `;
  }, [settings]);

  const getWrapperStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    
    if (settings.colorOverlay !== 'none') {
      const overlays = {
        blue: 'rgba(173, 216, 230, 0.3)',
        yellow: 'rgba(255, 255, 224, 0.5)',
        green: 'rgba(144, 238, 144, 0.3)',
        pink: 'rgba(255, 192, 203, 0.3)'
      };
      styles.backgroundColor = overlays[settings.colorOverlay as keyof typeof overlays];
    }

    if (settings.letterSpacing !== 'normal') {
      const spacings = {
        normal: '0.05em',
        wide: '0.1em',
        'extra-wide': '0.15em'
      };
      styles.letterSpacing = spacings[settings.letterSpacing as keyof typeof spacings] ?? spacings.normal;
    }

    if (settings.lineHeight && settings.lineHeight !== 'normal') {
      const heights = {
        normal: '1.5',
        relaxed: '1.75',
        loose: '2.0'
      };
      styles.lineHeight = heights[settings.lineHeight as keyof typeof heights];
    }

    if (settings.wordSpacing !== 'normal') {
      const spacings = {
        normal: '0.05em',
        wide: '0.1em',
        'extra-wide': '0.15em'
      };
      styles.wordSpacing = spacings[settings.wordSpacing as keyof typeof spacings] ?? spacings.normal;
    }

    if (settings.simplifiedUI) {
      styles.fontFamily = 'system-ui, -apple-system, sans-serif';
    }

    if (settings.distractionReduction) {
      styles.background = settings.darkMode ? '#1f2937' : '#ffffff';
    }

    return styles;
  };

  const getCSSClasses = (): string => {
    let classes = className;

    if (settings.colorTheme === 'high-contrast') {
      classes += ' high-contrast';
    }

    if (settings.reducedMotion) {
      classes += ' reduced-motion';
    }

    if (settings.enhancedFocusOutlines) {
      classes += ' enhanced-focus';
    }

    if (settings.simplifiedUI) {
      classes += ' simplified-ui';
    }

    if (settings.distractionReduction) {
      classes += ' distraction-reduction';
    }

    if (settings.cognitiveLoad === 'minimal') {
      classes += ' cognitive-load-minimal';
    } else if (settings.cognitiveLoad === 'reduced') {
      classes += ' cognitive-load-reduced';
    }

    if (settings.colorTheme === 'dyslexia-friendly') {
      classes += ' color-theme-dyslexia-friendly';
    } else if (settings.colorTheme === 'autism-friendly') {
      classes += ' color-theme-autism-friendly';
    }

    if (settings.letterSpacing === 'wide') {
      classes += ' text-spacing-wide';
    } else if (settings.letterSpacing === 'extra-wide') {
      classes += ' text-spacing-extra-wide';
    }

    if (settings.wordSpacing === 'wide') {
      classes += ' word-spacing-wide';
    } else if (settings.wordSpacing === 'extra-wide') {
      classes += ' word-spacing-extra-wide';
    }

    if (settings.lineHeight === 'relaxed') {
      classes += ' line-height-relaxed';
    } else if (settings.lineHeight === 'loose') {
      classes += ' line-height-loose';
    }

    if (settings.colorOverlay !== 'none') {
      classes += ` color-overlay-${settings.colorOverlay}`;
    }

    if (settings.errorHandling === 'gentle') {
      classes += ' error-handling-gentle';
    } else if (settings.errorHandling === 'encouraging') {
      classes += ' error-handling-encouraging';
    }

    return classes;
  };

  return (
    <div
      ref={wrapperRef}
      className={`neurodivergent-wrapper ${getCSSClasses()}`}
      style={getWrapperStyles()}
    >
      {children}
    </div>
  );
}
