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
            // Add reading guide effect
            entry.target.classList.add('reading-focus');
          } else {
            entry.target.classList.remove('reading-focus');
          }
        });
      }, { threshold: 0.5 });

      wrapper.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6').forEach((el) => {
        observer.observe(el);
      });

      return () => observer.disconnect();
    }
  }, [settings.readingGuide]);

  useEffect(() => {
    // Add dynamic styles to document head
    const styleId = 'neurodivergent-styles';
    let existingStyle = document.getElementById(styleId);
    
    if (!existingStyle) {
      existingStyle = document.createElement('style');
      existingStyle.id = styleId;
      document.head.appendChild(existingStyle);
    }

    existingStyle.textContent = `
      .high-contrast {
        filter: contrast(150%);
      }
      
      .high-contrast button, .high-contrast input {
        border: 3px solid currentColor !important;
      }
      
      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      .enhanced-focus *:focus {
        outline: 4px solid #3b82f6 !important;
        outline-offset: 2px !important;
        border-radius: 4px !important;
      }
      
      .simplified-ui {
        background: ${settings.darkMode ? '#1f2937' : '#ffffff'} !important;
      }
      
      .simplified-ui * {
        box-shadow: none !important;
        border-radius: 4px !important;
        background-image: none !important;
      }
      
      .minimal-ui .secondary-info,
      .minimal-ui .decorative-element,
      .minimal-ui .extra-controls {
        display: none !important;
      }
      
      .reduced-ui .advanced-features {
        opacity: 0.6;
      }
      
      .reading-focus {
        background: rgba(59, 130, 246, 0.1) !important;
        border-left: 4px solid #3b82f6 !important;
        padding-left: 12px !important;
        margin-left: -16px !important;
        transition: all 0.2s ease !important;
      }
      
      ${settings.colorTheme === 'dyslexia-friendly' ? `
        * {
          font-family: 'OpenDyslexic', 'Comic Sans MS', 'Arial', sans-serif !important;
          font-weight: 500 !important;
        }
      ` : ''}
      
      ${settings.colorTheme === 'autism-friendly' ? `
        * {
          color: #2d3748 !important;
          background-color: #f7fafc !important;
        }
        
        button, input {
          background-color: #e2e8f0 !important;
          border-color: #a0aec0 !important;
        }
        
        button:hover {
          background-color: #cbd5e0 !important;
        }
      ` : ''}
    `;

    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    };
  }, [settings]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Apply reading guide
    if (settings.readingGuide) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add reading guide effect
            entry.target.classList.add('reading-focus');
          } else {
            entry.target.classList.remove('reading-focus');
          }
        });
      }, { threshold: 0.5 });

      wrapper.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6').forEach((el) => {
        observer.observe(el);
      });

      return () => observer.disconnect();
    }
  }, [settings.readingGuide]);

  const getWrapperStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    // Color overlay
    if (settings.colorOverlay !== 'none') {
      const overlays = {
        blue: 'rgba(59, 130, 246, 0.1)',
        yellow: 'rgba(251, 191, 36, 0.1)',
        green: 'rgba(34, 197, 94, 0.1)',
        pink: 'rgba(236, 72, 153, 0.1)'
      };
      styles.backgroundColor = overlays[settings.colorOverlay];
    }

    // Text spacing
    if (settings.textSpacing !== 'normal') {
      const spacings = { normal: '0', wide: '0.05em', 'extra-wide': '0.1em' };
      styles.letterSpacing = spacings[settings.textSpacing];
    }

    // Line height
    if (settings.lineHeight !== 'normal') {
      const heights = { normal: '1.5', relaxed: '1.75', loose: '2' };
      styles.lineHeight = heights[settings.lineHeight];
    }

    // Word spacing
    if (settings.wordSpacing !== 'normal') {
      const spacings = { normal: '0', wide: '0.1em', 'extra-wide': '0.2em' };
      styles.wordSpacing = spacings[settings.wordSpacing];
    }

    // Simplified UI
    if (settings.simplifiedUI) {
      styles.filter = 'none';
      styles.boxShadow = 'none';
    }

    // Distraction reduction
    if (settings.distractionReduction) {
      styles.background = settings.darkMode ? '#1f2937' : '#ffffff';
      styles.borderRadius = '0px';
    }

    return styles;
  };

  const getCSSClasses = (): string => {
    let classes = className;

    // High contrast
    if (settings.highContrast) {
      classes += ' high-contrast';
    }

    // Reduced motion
    if (settings.reducedMotion) {
      classes += ' reduced-motion';
    }

    // Enhanced focus
    if (settings.focusIndicator) {
      classes += ' enhanced-focus';
    }

    // Simplified UI
    if (settings.simplifiedUI) {
      classes += ' simplified-ui';
    }

    // Distraction reduction
    if (settings.distractionReduction) {
      classes += ' distraction-reduced';
    }

    // Cognitive load
    if (settings.cognitiveLoad === 'minimal') {
      classes += ' minimal-ui';
    } else if (settings.cognitiveLoad === 'reduced') {
      classes += ' reduced-ui';
    }

    // Color themes
    if (settings.colorTheme === 'dyslexia-friendly') {
      classes += ' dyslexia-friendly';
    } else if (settings.colorTheme === 'autism-friendly') {
      classes += ' autism-friendly';
    }

    // Text spacing
    if (settings.textSpacing === 'wide') {
      classes += ' text-spacing-wide';
    } else if (settings.textSpacing === 'extra-wide') {
      classes += ' text-spacing-extra-wide';
    }

    // Word spacing
    if (settings.wordSpacing === 'wide') {
      classes += ' word-spacing-wide';
    } else if (settings.wordSpacing === 'extra-wide') {
      classes += ' word-spacing-extra-wide';
    }

    // Line height
    if (settings.lineHeight === 'relaxed') {
      classes += ' line-height-relaxed';
    } else if (settings.lineHeight === 'loose') {
      classes += ' line-height-loose';
    }

    // Color overlay
    if (settings.colorOverlay !== 'none') {
      classes += ` color-overlay-${settings.colorOverlay}`;
    }

    // Timer visibility
    if (settings.timerDisplay) {
      classes += ' timer-visible';
    }

    // Error handling style
    if (settings.errorHandling === 'gentle') {
      classes += ' gentle-errors';
    } else if (settings.errorHandling === 'encouraging') {
      classes += ' encouraging-errors';
    }

    return classes;
  };

  return (
    <div
      ref={wrapperRef}
      className={getCSSClasses()}
      style={getWrapperStyles()}
    >
      {children}
    </div>
  );
}
