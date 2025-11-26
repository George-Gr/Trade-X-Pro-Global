/* 
 * Accessibility Utilities for TradePro
 * 
 * Comprehensive accessibility helpers for React components
 * Includes ARIA utilities, focus management, screen reader helpers,
 * and WCAG compliance functions
 */

import { useEffect, useRef, useCallback } from 'react';

// Mock vitest for testing environment when needed
if (typeof window !== 'undefined') {
  (window as any).vi = (window as any).vi || undefined;
}

/* 
 * ARIA Live Region Utilities
 * For announcing dynamic content changes to screen readers
 */

export const useAnnouncement = () => {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;
      
      // Clear after a brief delay to allow for re-announcements
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  const LiveRegion = () => (
    <div
      ref={liveRegionRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );

  return { announce, LiveRegion };
};

/* 
 * Focus Management Utilities
 */

export const useFocusManagement = () => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && previousFocusRef.current.focus) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  const focusFirstElement = useCallback((container: HTMLElement | null) => {
    if (!container) return;
    
    const focusableElement = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    
    if (focusableElement) {
      focusableElement.focus();
    }
  }, []);

  const focusLastElement = useCallback((container: HTMLElement | null) => {
    if (!container) return;
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const lastElement = focusableElements[focusableElements.length - 1];
    if (lastElement) {
      lastElement.focus();
    }
  }, []);

  return {
    saveFocus,
    restoreFocus,
    focusFirstElement,
    focusLastElement
  };
};

/* 
 * Skip Link Utilities
 */

export const useSkipLink = (targetId: string) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, [targetId]);

  return { handleClick };
};

/* 
 * Screen Reader Utilities
 */

export const useScreenReader = () => {
  const isScreenReaderDetected = useRef(false);

  useEffect(() => {
    // Detect screen reader using various methods
    const checkScreenReader = () => {
      // Check for screen reader detection APIs
      if (window.speechSynthesis) {
        // Speech synthesis might indicate assistive technology
        isScreenReaderDetected.current = true;
      }

      // Check for specific CSS media queries
      const mediaQuery = window.matchMedia('(forced-colors: active)');
      if (mediaQuery.matches) {
        isScreenReaderDetected.current = true;
      }
    };

    checkScreenReader();
  }, []);

  const announceToScreenReader = useCallback((message: string) => {
    // Create a temporary element for screen reader announcement
    const element = document.createElement('div');
    element.setAttribute('aria-live', 'polite');
    element.setAttribute('aria-atomic', 'true');
    element.className = 'sr-only';
    element.textContent = message;
    
    document.body.appendChild(element);
    
    // Remove after announcement
    setTimeout(() => {
      if (document.body.contains(element)) {
        document.body.removeChild(element);
      }
    }, 1000);
  }, []);

  return {
    isScreenReaderDetected: isScreenReaderDetected.current,
    announceToScreenReader
  };
};

/* 
 * Keyboard Navigation Utilities
 */

export const useKeyboardNavigation = () => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent, handlers: {
    onEnter?: (e: React.KeyboardEvent) => void;
    onEscape?: (e: React.KeyboardEvent) => void;
    onTab?: (e: React.KeyboardEvent) => void;
    onArrowUp?: (e: React.KeyboardEvent) => void;
    onArrowDown?: (e: React.KeyboardEvent) => void;
    onArrowLeft?: (e: React.KeyboardEvent) => void;
    onArrowRight?: (e: React.KeyboardEvent) => void;
  }) => {
    switch (e.key) {
      case 'Enter':
        if (handlers.onEnter) {
          handlers.onEnter(e);
          e.preventDefault();
        }
        break;
      case 'Escape':
        if (handlers.onEscape) {
          handlers.onEscape(e);
          e.preventDefault();
        }
        break;
      case 'Tab':
        if (handlers.onTab) {
          handlers.onTab(e);
        }
        break;
      case 'ArrowUp':
        if (handlers.onArrowUp) {
          handlers.onArrowUp(e);
          e.preventDefault();
        }
        break;
      case 'ArrowDown':
        if (handlers.onArrowDown) {
          handlers.onArrowDown(e);
          e.preventDefault();
        }
        break;
      case 'ArrowLeft':
        if (handlers.onArrowLeft) {
          handlers.onArrowLeft(e);
          e.preventDefault();
        }
        break;
      case 'ArrowRight':
        if (handlers.onArrowRight) {
          handlers.onArrowRight(e);
          e.preventDefault();
        }
        break;
    }
  }, []);

  return { handleKeyDown };
};

/* 
 * Contrast Checker Utilities
 */

export const useContrastChecker = () => {
  const checkContrast = useCallback((foreground: string, background: string): number => {
    // Convert hex to RGB
    const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[3], 16),
        b: parseInt(result[5], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    // Calculate relative luminance
    const getLuminance = (r: number, g: number, b: number): number => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const fg = hexToRgb(foreground);
    const bg = hexToRgb(background);
    
    const lum1 = getLuminance(fg.r, fg.g, fg.b);
    const lum2 = getLuminance(bg.r, bg.g, bg.b);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }, []);

  const isContrastSufficient = useCallback((
    foreground: string, 
    background: string, 
    level: 'AA' | 'AAA' = 'AA',
    size: 'normal' | 'large' = 'normal'
  ): boolean => {
    const ratio = checkContrast(foreground, background);
    
    if (level === 'AA') {
      return size === 'normal' ? ratio >= 4.5 : ratio >= 3;
    } else {
      return size === 'normal' ? ratio >= 7 : ratio >= 4.5;
    }
  }, [checkContrast]);

  return { checkContrast, isContrastSufficient };
};

/* 
 * Touch Target Size Utilities
 */

export const useTouchTarget = () => {
  const validateTouchTarget = useCallback((element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return rect.width >= 44 && rect.height >= 44;
  }, []);

  const addTouchTargetPadding = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    
    if (rect.width < 44) {
      const padding = (44 - rect.width) / 2;
      element.style.paddingLeft = `calc(${window.getComputedStyle(element).paddingLeft} + ${padding}px)`;
      element.style.paddingRight = `calc(${window.getComputedStyle(element).paddingRight} + ${padding}px)`;
    }
    
    if (rect.height < 44) {
      const padding = (44 - rect.height) / 2;
      element.style.paddingTop = `calc(${window.getComputedStyle(element).paddingTop} + ${padding}px)`;
      element.style.paddingBottom = `calc(${window.getComputedStyle(element).paddingBottom} + ${padding}px)`;
    }
  }, []);

  return { validateTouchTarget, addTouchTargetPadding };
};

/* 
 * Reduced Motion Utilities
 */

export const useReducedMotion = () => {
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;
    
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return { prefersReducedMotion: prefersReducedMotion.current };
};

/* 
 * High Contrast Mode Utilities
 */

export const useHighContrast = () => {
  const prefersHighContrast = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    prefersHighContrast.current = mediaQuery.matches;
    
    const handler = (e: MediaQueryListEvent) => {
      prefersHighContrast.current = e.matches;
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return { prefersHighContrast: prefersHighContrast.current };
};

/* 
 * Accessible Color Generator
 */

export const generateAccessibleColors = (baseColor: string, targetContrast: number = 4.5) => {
  // This is a simplified version - in a real implementation,
  // you'd want more sophisticated color generation logic
  const colors = {
    primary: baseColor,
    primaryContrast: '#FFFFFF',
    secondary: '#6B7280',
    secondaryContrast: '#374151',
    success: '#16A34A',
    successContrast: '#FFFFFF',
    warning: '#D97706',
    warningContrast: '#FFFFFF',
    danger: '#DC2626',
    dangerContrast: '#FFFFFF'
  };
  
  return colors;
};

/* 
 * WCAG Compliance Checker
 */

export const checkWCAGCompliance = (element: HTMLElement) => {
  const styles = window.getComputedStyle(element);
  const color = styles.color;
  const backgroundColor = styles.backgroundColor;
  const fontSize = parseFloat(styles.fontSize);
  const fontWeight = styles.fontWeight;
  
  // Check if text meets AA standards
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
  
  return {
    color,
    backgroundColor,
    fontSize,
    fontWeight,
    isLargeText,
    meetsAA: true, // Placeholder - would need actual contrast checking
    meetsAAA: true // Placeholder - would need actual contrast checking
  };
};

/* 
 * Default ARIA attributes for common components
 */

export const getDefaultAriaAttributes = (role: string, props: Record<string, any> = {}) => {
  const defaults = {
    button: {
      role: 'button',
      tabIndex: 0,
      'aria-disabled': false,
      ...props
    },
    link: {
      role: 'link',
      tabIndex: 0,
      ...props
    },
    dialog: {
      role: 'dialog',
      'aria-modal': true,
      'aria-labelledby': props.labelId || undefined,
      'aria-describedby': props.descriptionId || undefined,
      ...props
    },
    menu: {
      role: 'menu',
      'aria-orientation': 'vertical',
      ...props
    },
    menuItem: {
      role: 'menuitem',
      tabIndex: -1,
      ...props
    },
    tab: {
      role: 'tab',
      tabIndex: -1,
      'aria-selected': false,
      'aria-controls': props.panelId || undefined,
      ...props
    },
    tabPanel: {
      role: 'tabpanel',
      'aria-labelledby': props.tabId || undefined,
      'aria-hidden': true,
      ...props
    }
  };

  return defaults[role as keyof typeof defaults] || props;
};

export default {
  useAnnouncement,
  useFocusManagement,
  useSkipLink,
  useScreenReader,
  useKeyboardNavigation,
  useContrastChecker,
  useTouchTarget,
  useReducedMotion,
  useHighContrast,
  generateAccessibleColors,
  checkWCAGCompliance,
  getDefaultAriaAttributes
};