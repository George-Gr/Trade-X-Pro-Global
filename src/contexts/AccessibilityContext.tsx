import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { useColorContrastVerification, useColorBlindMode, useVisualAccessibilityPreferences } from '@/lib/colorContrastVerification';
import { useTradingKeyboardShortcuts } from '@/lib/tradingKeyboardNavigation';

/**
 * Key binding configuration for keyboard shortcuts
 */
export interface KeyBinding {
  key: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey?: boolean;
}

/**
 * Map of accessibility actions to their key bindings
 */
export interface KeyBindingsMap {
  toggleHighContrast: KeyBinding;
  toggleReduceMotion: KeyBinding;
  toggleScreenReader: KeyBinding;
  toggleAccessibilityDashboard: KeyBinding;
}

/**
 * Default safe key bindings using Alt+Shift to avoid browser/OS conflicts
 */
export const defaultKeyBindings: KeyBindingsMap = {
  toggleHighContrast: { key: 'h', ctrlKey: false, altKey: true, shiftKey: true },
  toggleReduceMotion: { key: 'm', ctrlKey: false, altKey: true, shiftKey: true },
  toggleScreenReader: { key: 'r', ctrlKey: false, altKey: true, shiftKey: true },
  toggleAccessibilityDashboard: { key: 'a', ctrlKey: false, altKey: true, shiftKey: true }
};

/**
 * Utility function to check if a keyboard event matches a key binding
 */
const eventMatchesBinding = (event: KeyboardEvent, binding: KeyBinding): boolean => {
  return (
    event.key.toLowerCase() === binding.key.toLowerCase() &&
    event.ctrlKey === binding.ctrlKey &&
    event.altKey === binding.altKey &&
    event.shiftKey === binding.shiftKey &&
    (binding.metaKey === undefined || event.metaKey === binding.metaKey)
  );
};

interface AccessibilityContextType {
  // Visual Preferences
  visualPreferences: ReturnType<typeof useVisualAccessibilityPreferences>;
  colorBlindMode: ReturnType<typeof useColorBlindMode>;
  
  // Keyboard Navigation
  keyboardShortcuts: ReturnType<typeof useTradingKeyboardShortcuts>;
  
  // Color Contrast
  colorContrast: ReturnType<typeof useColorContrastVerification>;
  
  // Screen Reader
  screenReaderEnabled: boolean;
  setScreenReaderEnabled: (enabled: boolean) => void;
  
  // Global Accessibility State
  accessibilityEnabled: boolean;
  setAccessibilityEnabled: (enabled: boolean) => void;
  
  // Quick Actions
  toggleHighContrast: () => void;
  toggleReduceMotion: () => void;
  toggleColorBlindMode: (mode: string) => void;
  
  // Compliance Score
  complianceScore: number;
  updateComplianceScore: (score: number) => void;
  
  // Category Scores
  categoryScores: {
    visual: number;
    keyboard: number;
    screenReader: number;
    forms: number;
  };
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children?: ReactNode;
  /**
   * Optional custom key bindings for accessibility shortcuts
   * Defaults to defaultKeyBindings if not provided
   */
  keyBindings?: Partial<KeyBindingsMap>;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children, keyBindings: customKeyBindings } = {}) => {
  // Merge custom bindings with defaults
  const keyBindings = useMemo(() => ({
    ...defaultKeyBindings,
    ...customKeyBindings
  }), [customKeyBindings]);

  // Initialize hooks - memoize to prevent unnecessary re-renders
  const visualPreferences = useVisualAccessibilityPreferences();
  const colorBlindMode = useColorBlindMode();
  const keyboardShortcuts = useTradingKeyboardShortcuts();
  const colorContrast = useColorContrastVerification();
  
  // State
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(true);
  const [complianceScore, setComplianceScore] = useState(85);

  // Memoize high contrast toggle to prevent infinite loops
  const toggleHighContrast = useCallback(() => {
    visualPreferences.updatePreference('highContrast', !visualPreferences.preferences.highContrast);
  }, [visualPreferences.updatePreference, visualPreferences.preferences.highContrast]);

  // Memoize reduce motion toggle
  const toggleReduceMotion = useCallback(() => {
    visualPreferences.updatePreference('reduceMotion', !visualPreferences.preferences.reduceMotion);
  }, [visualPreferences.updatePreference, visualPreferences.preferences.reduceMotion]);

  // Memoize color blind mode toggle
  const toggleColorBlindMode = useCallback((mode: string) => {
    const validModes = ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'] as const;
    const isValidMode = (m: string): m is typeof validModes[number] => validModes.includes(m as typeof validModes[number]);
    
    if (!isValidMode(mode)) {
      console.warn(`Invalid color blind mode: ${mode}`);
      return;
    }
    
    if (colorBlindMode.colorBlindMode.type === mode) {
      colorBlindMode.applyColorBlindSimulation({ type: 'none', intensity: 0 });
    } else {
      colorBlindMode.applyColorBlindSimulation({ type: mode, intensity: 1 });
    }
  }, [colorBlindMode.applyColorBlindSimulation, colorBlindMode.colorBlindMode]);

  // Compute category scores from available data
  const categoryScores = useMemo(() => {
    // Visual score: based on color contrast compliance
    const visualScore = colorContrast?.complianceReport?.aaCompliance ?? 0;
    
    // Keyboard score: based on available shortcuts (scaled to percentage)
    const keyboardScore = Math.min(
      100,
      ((keyboardShortcuts?.shortcuts?.length ?? 0) / 10) * 100
    ) || 0;
    
    // Screen Reader score: base score adjusted by enablement state
    const screenReaderScore = screenReaderEnabled ? 85 : 70;
    
    // Forms score: estimate based on compliance and shortcut availability
    const formsScore = Math.max(
      60,
      (visualScore * 0.5 + keyboardScore * 0.5)
    ) || 0;
    
    return {
      visual: Math.round(visualScore),
      keyboard: Math.round(keyboardScore),
      screenReader: screenReaderScore,
      forms: Math.round(formsScore)
    };
  }, [colorContrast?.complianceReport?.aaCompliance, keyboardShortcuts?.shortcuts?.length, screenReaderEnabled]);

  // Effect to apply visual preferences - depends only on specific values, not objects
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    if (visualPreferences.preferences.highContrast) {
      root.style.filter = 'contrast(1.5) brightness(1.1)';
    } else {
      root.style.filter = '';
    }
    
    // Reduce motion
    if (visualPreferences.preferences.reduceMotion) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
    }
    
    // Larger text
    if (visualPreferences.preferences.largerText) {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [
    visualPreferences.preferences.highContrast,
    visualPreferences.preferences.reduceMotion,
    visualPreferences.preferences.largerText
  ]);

  // Memoize applyColorBlindSimulation to ensure stable reference
  const applyColorBlindSimulation = useCallback((mode: typeof colorBlindMode.colorBlindMode) => {
    colorBlindMode.applyColorBlindSimulation(mode);
  }, [colorBlindMode.applyColorBlindSimulation]);

  // Effect to apply color blind mode - depends only on the type
  useEffect(() => {
    if (colorBlindMode.colorBlindMode.type !== 'none') {
      applyColorBlindSimulation(colorBlindMode.colorBlindMode);
    }
  }, [colorBlindMode.colorBlindMode, applyColorBlindSimulation]);

  // Keyboard shortcuts for accessibility - uses configurable bindings
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle high contrast
      if (eventMatchesBinding(event, keyBindings.toggleHighContrast)) {
        event.preventDefault();
        toggleHighContrast();
      }
      
      // Toggle reduce motion
      if (eventMatchesBinding(event, keyBindings.toggleReduceMotion)) {
        event.preventDefault();
        toggleReduceMotion();
      }
      
      // Toggle screen reader
      if (eventMatchesBinding(event, keyBindings.toggleScreenReader)) {
        event.preventDefault();
        setScreenReaderEnabled(prev => !prev);
      }
      
      // Toggle accessibility dashboard
      if (eventMatchesBinding(event, keyBindings.toggleAccessibilityDashboard)) {
        event.preventDefault();
        // Navigate to accessibility dashboard would be handled by parent
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleHighContrast, toggleReduceMotion, keyBindings]);

  // Add updateComplianceScore function
  const updateComplianceScore = useCallback((score: number) => {
    setComplianceScore(score);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const value: AccessibilityContextType = useMemo(() => ({
    visualPreferences,
    colorBlindMode,
    keyboardShortcuts,
    colorContrast,
    screenReaderEnabled,
    setScreenReaderEnabled,
    accessibilityEnabled,
    setAccessibilityEnabled,
    toggleHighContrast,
    toggleReduceMotion,
    toggleColorBlindMode,
    complianceScore,
    updateComplianceScore,
    categoryScores
  }), [
    visualPreferences,
    colorBlindMode,
    keyboardShortcuts,
    colorContrast,
    screenReaderEnabled,
    accessibilityEnabled,
    toggleHighContrast,
    toggleReduceMotion,
    toggleColorBlindMode,
    complianceScore,    updateComplianceScore,    categoryScores
  ]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
