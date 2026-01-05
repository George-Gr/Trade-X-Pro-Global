import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AccessibilityPreferences,
  WCAGAAAEnhancer,
} from '../components/accessibility/WCAGAAAEnhancer';

// Singleton instance
export const wcagAAAEnhancer = WCAGAAAEnhancer.getInstance();

/**
 * Hook for syncing and updating WCAG AAA accessibility preferences.
 *
 * Manages AccessibilityPreferences state synchronized with WCAGAAAEnhancer singleton.
 * Listens for 'accessibilityPreferenceChanged' DOM events to reflect external updates.
 *
 * @returns Object containing:
 *   - preferences: Current AccessibilityPreferences state
 *   - updatePreference: Callback to update preference with generic key/value (K extends keyof AccessibilityPreferences)
 *   - currentPalette: Active color palette from WCAGAAAEnhancer
 *
 * @example
 * const { preferences, updatePreference, currentPalette } = useAccessibilityPreferences();
 * updatePreference('contrastLevel', 'high');
 */
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

  const currentPalette = useMemo(
    () => wcagAAAEnhancer.getCurrentColorPalette(),
    [preferences]
  );

  return {
    preferences,
    updatePreference,
    currentPalette,
  };
}
