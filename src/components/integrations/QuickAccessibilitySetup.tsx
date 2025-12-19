import { WCAGAAAEnhancer } from '@/components/accessibility/WCAGAAAEnhancer';
import { useEffect } from 'react';

export function QuickAccessibilitySetup() {
  const wcagEnhancer = WCAGAAAEnhancer.getInstance();
  const preferences = wcagEnhancer.getPreferences();

  useEffect(() => {
    // Auto-enable accessibility features based on user preferences
    if (preferences.highContrast) {
      document.body.classList.add('high-contrast');
    }

    if (preferences.largeFonts) {
      document.body.classList.add('large-fonts');
    }

    if (preferences.reducedMotion) {
      document.body.classList.add('reduce-motion');
    }

    // Add accessibility classes to body
    document.body.classList.add('accessibility-enabled');

    // Setup reduced motion media query listener
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      wcagEnhancer.updatePreference('reducedMotion', e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [preferences, wcagEnhancer]);

  return null;
}
