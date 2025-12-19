import { logger } from '@/lib/logger';
import { useCallback, useMemo, useState } from 'react';

/**
 * Haptic Feedback Hook for Mobile Interactions
 * Provides tactile feedback for trade execution and other important actions
 */

export interface HapticFeedbackConfig {
  enabled?: boolean;
  pattern?:
    | 'light'
    | 'medium'
    | 'heavy'
    | 'success'
    | 'warning'
    | 'error'
    | 'impact';
  duration?: number;
}

export interface HapticFeedbackReturn {
  trigger: (config?: HapticFeedbackConfig) => void;
  isSupported: boolean;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

/**
 * Standard haptic feedback patterns for different types of interactions
 */
export const HAPTIC_PATTERNS = {
  LIGHT: [50] as number[],
  MEDIUM: [100] as number[],
  HEAVY: [200] as number[],
  SUCCESS: [50, 100, 50] as number[],
  WARNING: [100, 50, 100] as number[],
  ERROR: [200, 100, 200] as number[],
  IMPACT: [30] as number[],
  TAP: [20] as number[],
  LONG_PRESS: [50, 200] as number[],
  DOUBLE_TAP: [20, 50, 20] as number[],
} as const;

export const useHapticFeedback = (
  defaultEnabled = true
): HapticFeedbackReturn => {
  const [isEnabled, setIsEnabled] = useState(defaultEnabled);

  const isSupported = useMemo(() => {
    // Check if we're in a browser environment with navigator
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }

    return (
      'vibrate' in navigator ||
      'vibration' in navigator ||
      Object.prototype.hasOwnProperty.call(window, 'TapticEngine') ||
      Object.prototype.hasOwnProperty.call(window, 'HapticFeedback')
    );
  }, []);

  const trigger = useCallback(
    (config: HapticFeedbackConfig = {}) => {
      if (!isEnabled || !isSupported) return;

      const { pattern = 'light', duration, enabled = true } = config;

      if (!enabled) return;

      try {
        let patternArray: number[];

        if (duration) {
          patternArray = [duration];
        } else {
          switch (pattern) {
            case 'light':
              patternArray = HAPTIC_PATTERNS.LIGHT;
              break;
            case 'medium':
              patternArray = HAPTIC_PATTERNS.MEDIUM;
              break;
            case 'heavy':
              patternArray = HAPTIC_PATTERNS.HEAVY;
              break;
            case 'success':
              patternArray = HAPTIC_PATTERNS.SUCCESS;
              break;
            case 'warning':
              patternArray = HAPTIC_PATTERNS.WARNING;
              break;
            case 'error':
              patternArray = HAPTIC_PATTERNS.ERROR;
              break;
            case 'impact':
              patternArray = HAPTIC_PATTERNS.IMPACT;
              break;
            default:
              patternArray = HAPTIC_PATTERNS.TAP;
          }
        }

        if ('vibrate' in navigator) {
          navigator.vibrate(patternArray);
        } else if (
          Object.prototype.hasOwnProperty.call(window, 'TapticEngine')
        ) {
          const taptic = (window as unknown as Record<string, unknown>)
            .TapticEngine as Record<string, unknown>;
          if (
            taptic &&
            (taptic as { notification: (p: unknown) => void }).notification
          ) {
            (taptic as { notification: (p: unknown) => void }).notification(
              pattern
            );
          }
        } else if (
          Object.prototype.hasOwnProperty.call(window, 'HapticFeedback')
        ) {
          const haptic = (window as unknown as Record<string, unknown>)
            .HapticFeedback as Record<string, unknown>;
          if (haptic && (haptic as { trigger: (p: unknown) => void }).trigger) {
            (haptic as { trigger: (p: unknown) => void }).trigger(pattern);
          }
        }
      } catch (error) {
        logger.warn('Haptic feedback failed', error);
      }
    },
    [isEnabled, isSupported]
  );

  return {
    trigger,
    isSupported,
    isEnabled,
    setEnabled: setIsEnabled,
  };
};
