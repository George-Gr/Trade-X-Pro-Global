import React, { useState, useEffect } from "react";

/**
 * Hook to detect prefers-reduced-motion setting
 * Returns true if user has requested reduced motion
 */
export const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = "(prefers-reduced-motion: reduce)";
    const mq = window.matchMedia(mediaQuery);

    const updateMotionPreference = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    // Set initial value
    setReducedMotion(mq.matches);

    // Listen for changes
    mq.addEventListener("change", updateMotionPreference);

    return () => {
      mq.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  return reducedMotion;
};

/**
 * Hook to get appropriate animation classes based on user preferences
 */
export const useAnimationClasses = (
  animationClasses: string,
  reducedMotionClasses: string = "",
): string => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return reducedMotionClasses;
  }

  return animationClasses;
};

/**
 * Utility function to check if animations should be disabled
 */
export const shouldReduceMotion = (): boolean => {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Higher-order component to wrap components with reduced motion support
 */
export const withReducedMotion = <P extends object>(
  Component: React.ComponentType<P>,
  fallbackProps?: Partial<P>,
): React.FC<P> => {
  return (props: P) => {
    const reducedMotion = useReducedMotion();

    if (reducedMotion && fallbackProps) {
      return React.createElement(Component, {
        ...props,
        ...fallbackProps,
      } as P);
    }

    return React.createElement(Component, props as P);
  };
};
