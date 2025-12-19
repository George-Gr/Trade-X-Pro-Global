import { useEffect } from 'react';
import {
  useOptimizedAnimations,
  useTouchGestures,
} from '../../hooks/useOptimizedAnimations';
import { WCAGAAAEnhancer } from '../accessibility/WCAGAAAEnhancer';

export function EnhancedAccessibilityFeatures() {
  const { performanceTier, optimizeForMobile } = useOptimizedAnimations();
  const { attachGestures } = useTouchGestures();
  const wcagEnhancer = WCAGAAAEnhancer.getInstance();

  useEffect(() => {
    // Add enhanced focus indicators
    const addFocusEnhancement = () => {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      focusableElements.forEach((element) => {
        const htmlElement = element as HTMLElement;

        // Add enhanced focus styles
        htmlElement.addEventListener('focus', () => {
          wcagEnhancer.createEnhancedFocus(htmlElement, {
            outlineWidth: '3px',
            outlineColor: '#3b82f6',
            ringWidth: '6px',
            ringColor: 'rgba(59, 130, 246, 0.3)',
          });
        });

        htmlElement.addEventListener('blur', () => {
          htmlElement.style.outline = '';
          htmlElement.style.boxShadow = '';
        });

        // Optimize for touch if on mobile
        if (performanceTier.level === 'high') {
          optimizeForMobile(htmlElement);
        }
      });
    };

    addFocusEnhancement();

    // Add keyboard navigation shortcuts
    const addKeyboardShortcuts = () => {
      document.addEventListener('keydown', (e) => {
        // Alt + S for settings
        if (e.altKey && e.key === 's') {
          e.preventDefault();
          const settingsButton = document.querySelector(
            '[aria-label="Toggle accessibility settings"]'
          ) as HTMLElement;
          if (settingsButton) {
            settingsButton.click();
          }
        }

        // Alt + H for help
        if (e.altKey && e.key === 'h') {
          e.preventDefault();
          // Could trigger help modal or navigation
        }

        // Escape to close modals
        if (e.key === 'Escape') {
          const modals = document.querySelectorAll('[role="dialog"]');
          modals.forEach((modal) => {
            if ((modal as HTMLElement).style.display !== 'none') {
              (modal as HTMLElement).style.display = 'none';
            }
          });
        }
      });
    };

    addKeyboardShortcuts();

    // Add screen reader optimizations
    const addScreenReaderOptimizations = () => {
      // Add aria-live regions for dynamic content
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = 'live-region';
      document.body.appendChild(liveRegion);

      // Monitor for changes and announce them
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            const addedContent = Array.from(mutation.addedNodes)
              .filter((node) => node.nodeType === Node.ELEMENT_NODE)
              .map((node) => (node as Element).textContent)
              .join(' ');

            if (addedContent.trim()) {
              liveRegion.textContent = addedContent;
              setTimeout(() => {
                liveRegion.textContent = '';
              }, 1000);
            }
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    };

    addScreenReaderOptimizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performanceTier.level, optimizeForMobile, attachGestures]);

  return null;
}
