/**
 * Hook to detect reduced motion preference
 */
export const useReducedMotion = () => {
  if (typeof window === "undefined") return false;
  
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};