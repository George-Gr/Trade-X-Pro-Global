/**
 * Haptic Feedback Utility Hook (TASK-046)
 *
 * Provides standardized haptic feedback across the application.
 * Respects user's reduced motion settings.
 */

import { useCallback, useMemo } from "react";

/**
 * Haptic feedback intensity patterns
 */
export type HapticPattern =
  | "light" // Light tap - 10ms
  | "medium" // Medium tap - 30ms
  | "heavy" // Heavy tap - 50ms
  | "success" // Success pattern - double tap
  | "warning" // Warning pattern - longer vibration
  | "error" // Error pattern - three short taps
  | "selection" // Selection change - very light
  | "impact"; // Button press impact

/**
 * Vibration patterns for different feedback types
 */
const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 30,
  heavy: 50,
  success: [30, 50, 30], // tap-pause-tap
  warning: [100], // longer single vibration
  error: [50, 30, 50, 30, 50], // three taps
  selection: 5, // very light
  impact: 40, // standard button press
};

interface UseHapticFeedbackOptions {
  /** Force enable even if reduced motion is preferred */
  forceEnable?: boolean;
  /** Custom intensity multiplier (0.5 = half, 2 = double) */
  intensityMultiplier?: number;
}

interface HapticFeedbackReturn {
  /** Trigger haptic feedback with specified pattern */
  trigger: (pattern?: HapticPattern) => void;
  /** Check if haptic feedback is available */
  isAvailable: boolean;
  /** Check if haptic feedback is enabled (respects reduced motion) */
  isEnabled: boolean;
  /** Trigger light tap */
  lightTap: () => void;
  /** Trigger medium tap */
  mediumTap: () => void;
  /** Trigger heavy tap */
  heavyTap: () => void;
  /** Trigger success feedback */
  success: () => void;
  /** Trigger warning feedback */
  warning: () => void;
  /** Trigger error feedback */
  error: () => void;
  /** Trigger selection feedback */
  selection: () => void;
  /** Trigger button impact feedback */
  impact: () => void;
}

/**
 * Check if vibration API is available
 */
const checkVibrationSupport = (): boolean => {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
};

/**
 * Check if user prefers reduced motion
 */
const checkReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Apply intensity multiplier to pattern
 */
const applyIntensity = (
  pattern: number | number[],
  multiplier: number,
): number | number[] => {
  if (typeof pattern === "number") {
    return Math.round(pattern * multiplier);
  }
  return pattern.map((v) => Math.round(v * multiplier));
};

/**
 * Hook for standardized haptic feedback
 *
 * @example
 * ```tsx
 * const { trigger, success, error, isEnabled } = useHapticFeedback();
 *
 * // In button click handler
 * const handleClick = () => {
 *   trigger('impact');
 *   // ... do something
 * };
 *
 * // For success feedback
 * const handleSuccess = () => {
 *   success();
 * };
 *
 * // For error feedback
 * const handleError = () => {
 *   error();
 * };
 * ```
 */
export const useHapticFeedback = (
  options: UseHapticFeedbackOptions = {},
): HapticFeedbackReturn => {
  const { forceEnable = false, intensityMultiplier = 1 } = options;

  const isAvailable = useMemo(() => checkVibrationSupport(), []);

  const isEnabled = useMemo(() => {
    if (!isAvailable) return false;
    if (forceEnable) return true;
    return !checkReducedMotion();
  }, [isAvailable, forceEnable]);

  /**
   * Core trigger function
   */
  const trigger = useCallback(
    (pattern: HapticPattern = "medium") => {
      if (!isEnabled) return;

      try {
        const vibrationPattern = HAPTIC_PATTERNS[pattern];
        const adjustedPattern = applyIntensity(
          vibrationPattern,
          intensityMultiplier,
        );
        navigator.vibrate(adjustedPattern);
      } catch (e) {
        // Silently fail - haptic feedback is non-critical
      }
    },
    [isEnabled, intensityMultiplier],
  );

  // Convenience methods
  const lightTap = useCallback(() => trigger("light"), [trigger]);
  const mediumTap = useCallback(() => trigger("medium"), [trigger]);
  const heavyTap = useCallback(() => trigger("heavy"), [trigger]);
  const success = useCallback(() => trigger("success"), [trigger]);
  const warning = useCallback(() => trigger("warning"), [trigger]);
  const error = useCallback(() => trigger("error"), [trigger]);
  const selection = useCallback(() => trigger("selection"), [trigger]);
  const impact = useCallback(() => trigger("impact"), [trigger]);

  return {
    trigger,
    isAvailable,
    isEnabled,
    lightTap,
    mediumTap,
    heavyTap,
    success,
    warning,
    error,
    selection,
    impact,
  };
};

/**
 * Standalone haptic trigger for use outside React components
 */
export const triggerHaptic = (pattern: HapticPattern = "medium"): void => {
  if (!checkVibrationSupport()) return;
  if (checkReducedMotion()) return;

  try {
    const vibrationPattern = HAPTIC_PATTERNS[pattern];
    navigator.vibrate(vibrationPattern);
  } catch (e) {
    // Silently fail
  }
};

export default useHapticFeedback;
