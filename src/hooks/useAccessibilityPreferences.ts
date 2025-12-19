import { useState, useEffect, useCallback } from 'react';
import {
  wcagAAAEnhancer,
  type AccessibilityPreferences,
} from '../components/accessibility/WCAGAAAEnhancer';

export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(
    wcagAAAEnhancer.getPreferences()
  );

  useEffect(() => {
    const handlePreferenceChange = (event: CustomEvent) => {
      setPreferences(event.detail.preferences);
    };

    document.addEventListener(
      'accessibilityPreferenceChanged',
      handlePreferenceChange as EventListener
    );

    return () => {
      document.removeEventListener(
        'accessibilityPreferenceChanged',
        handlePreferenceChange as EventListener
      );
    };
  }, []);

  const updatePreference = useCallback(
    <K extends keyof AccessibilityPreferences>(
      key: K,
      value: AccessibilityPreferences[K]
    ) => {
      wcagAAAEnhancer.updatePreference(key, value);
      setPreferences((prev: AccessibilityPreferences) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  return {
    preferences,
    updatePreference,
    currentPalette: wcagAAAEnhancer.getCurrentColorPalette(),
  };
}
