import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';
import { trackCustomMetric } from './useWebVitalsEnhanced';

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  transform3d?: boolean;
  willChange?: string;
  hardwareAcceleration?: boolean;
  touchOptimized?: boolean;
}

export interface TouchGestureConfig {
  enableSwipe?: boolean;
  enablePinch?: boolean;
  enableTap?: boolean;
  enableLongPress?: boolean;
  swipeThreshold?: number;
  longPressDelay?: number;
}

export interface PerformanceTier {
  level: 'high' | 'medium' | 'low';
  deviceMemory?: number;
  hardwareConcurrency?: number;
  connectionType?: string;
  reducedMotion?: boolean;
}

export interface NetworkInformation {
  effectiveType: string;
}

/**
 * Hook for creating optimized animations based on device performance and user preferences.
 * Automatically adapts animation quality, duration, and effects based on device capabilities,
 * network conditions, and reduced motion preferences.
 *
 * @param config Animation configuration options
 * @param config.duration Animation duration in milliseconds (default: 300)
 * @param config.easing CSS easing function (default: 'cubic-bezier(0.4, 0, 0.2, 1)')
 * @param config.transform3d Enable 3D transforms for hardware acceleration (default: true)
 * @param config.willChange CSS will-change property value (default: 'auto')
 * @param config.hardwareAcceleration Enable GPU acceleration hints (default: true)
 * @param config.touchOptimized Optimize animations for touch devices (default: true)
 * @returns Object containing:
 *   - isSupported: Whether animations are supported on this device
 *   - performanceTier: Detected performance tier (high/medium/low) with device metrics
 *   - createOptimizedAnimation: Function to create optimized CSS animations
 *   - animate: Function to create optimized keyframe animations
 *   - staggerAnimations: Function to create staggered animations with delays
 *   - optimizeForMobile: Function to apply mobile-specific optimizations
 *   - reducedMotion: Boolean indicating if reduced motion is preferred
 */
export function useOptimizedAnimations(config: AnimationConfig = {}) {
  const [isSupported, setIsSupported] = useState(true);
  const [performanceTier, setPerformanceTier] = useState<PerformanceTier>({
    level: 'high',
  });
  const animationFrameRef = useRef<number>();
  const reducedMotion = useReducedMotion();

  const {
    duration = 300,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    transform3d = true,
    willChange = 'auto',
    hardwareAcceleration = true,
    touchOptimized = true,
  } = config;

  const detectPerformanceCapabilities = useCallback(() => {
    const capabilities: PerformanceTier = {
      level: 'high',
    };

    // Check device memory (if available)
    if ('deviceMemory' in navigator) {
      const memory = (navigator as Navigator & { deviceMemory?: number })
        .deviceMemory;
      if (memory !== undefined) {
        capabilities.deviceMemory = memory;
        if (memory < 4) capabilities.level = 'low';
        else if (memory < 8) capabilities.level = 'medium';
      }
    }

    // Check hardware concurrency
    const cores = navigator.hardwareConcurrency;
    if (cores) {
      capabilities.hardwareConcurrency = cores;
      if (cores < 4) {
        if (capabilities.level === 'high') capabilities.level = 'medium';
      }
    }

    // Check connection type
    if ('connection' in navigator) {
      const connection = (
        navigator as Navigator & { connection?: NetworkInformation }
      ).connection;
      if (connection) {
        capabilities.connectionType = connection.effectiveType;
        if (
          connection.effectiveType === '2g' ||
          connection.effectiveType === 'slow-2g'
        ) {
          capabilities.level = 'low';
        } else if (connection.effectiveType === '3g') {
          if (capabilities.level === 'high') capabilities.level = 'medium';
        }
      }
    }

    // Check for reduced motion preference
    if (reducedMotion) {
      capabilities.reducedMotion = true;
      capabilities.level = 'low';
    }

    setPerformanceTier(capabilities);
  }, [reducedMotion]);

  const checkAnimationSupport = useCallback(() => {
    // Check for transform3d support
    const testElement = document.createElement('div');
    const transform3dSupported =
      'WebKitCSSMatrix' in window || 'MSCSSMatrix' in window;

    // Check for will-change support
    const willChangeSupported = testElement.style.willChange !== undefined;

    // Check for hardware acceleration hints
    const gpuAcceleration = testElement.style.transform !== undefined;

    setIsSupported(
      transform3dSupported && willChangeSupported && gpuAcceleration
    );
  }, []);

  const setupPerformanceMonitoring = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure' && entry.name.includes('animation')) {
          trackCustomMetric(
            'animation_duration',
            entry.duration,
            'Performance'
          );

          // Alert if animation is too slow
          if (entry.duration > 100) {
            console.warn(
              `Slow animation detected: ${entry.name} took ${entry.duration}ms`
            );
          }
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });
  }, []);

  useEffect(() => {
    // Detect performance capabilities
    detectPerformanceCapabilities();

    // Check for animation support
    checkAnimationSupport();

    // Setup performance monitoring
    setupPerformanceMonitoring();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    checkAnimationSupport,
    detectPerformanceCapabilities,
    setupPerformanceMonitoring,
  ]);

  const createOptimizedAnimation = useCallback(
    (
      element: HTMLElement,
      animation: string,
      config: Partial<AnimationConfig> = {}
    ) => {
      const finalConfig = { ...config };
      const {
        duration: animDuration,
        easing: animEasing,
        hardwareAcceleration: hwAccel,
      } = finalConfig;

      // Use requestAnimationFrame for smooth animations
      const animate = () => {
        performance.mark(`animation-start-${animation}`);

        // Apply hardware acceleration hints
        if (hwAccel && performanceTier.level === 'high') {
          element.style.transform = 'translateZ(0)';
          element.style.backfaceVisibility = 'hidden';
          element.style.perspective = '1000px';
        }

        // Apply optimized animation styles
        element.style.transition = `all ${animDuration}ms ${animEasing}`;
        element.style.willChange = willChange;

        // Use transform3d for better performance
        if (transform3d && performanceTier.level !== 'low') {
          element.style.transform = 'translate3d(0, 0, 0)';
        }

        // Execute animation
        element.classList.add(animation);

        // Track completion
        setTimeout(() => {
          performance.mark(`animation-end-${animation}`);
          performance.measure(
            `animation-${animation}`,
            `animation-start-${animation}`,
            `animation-end-${animation}`
          );

          trackCustomMetric(
            `animation_${animation}`,
            animDuration || 0,
            'User Experience'
          );
        }, animDuration);
      };

      if (performanceTier.level === 'low' || reducedMotion) {
        // Simplified animation for low-performance devices
        element.style.transition = 'opacity 0.2s ease';
        element.classList.add(animation);
      } else {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    },
    [performanceTier, reducedMotion, transform3d, willChange]
  );

  const animate = useCallback(
    (
      element: HTMLElement,
      keyframes: Keyframe[] | PropertyIndexedKeyframes,
      options?: KeyframeAnimationOptions & {
        duration?: number;
        easing?: string;
        hardwareAcceleration?: boolean;
      }
    ) => {
      if (performanceTier.level === 'low' || reducedMotion) {
        // Skip animations for low-performance or reduced motion users
        return;
      }

      const animationOptions: KeyframeAnimationOptions = {
        duration: options?.duration || duration,
        easing: options?.easing || easing,
        fill: 'forwards',
        ...options,
      };

      // Apply performance optimizations
      element.style.willChange = willChange;
      if (hardwareAcceleration && performanceTier.level === 'high') {
        element.style.transform = 'translateZ(0)';
      }

      // Create and play animation
      const animation = element.animate(keyframes, animationOptions);

      // Track animation performance
      animation.addEventListener('finish', () => {
        trackCustomMetric(
          'keyframe_animation',
          Number(animationOptions.duration) || duration,
          'Performance'
        );

        // Clean up will-change after animation
        setTimeout(() => {
          element.style.willChange = 'auto';
        }, 100);
      });

      return animation;
    },
    [
      performanceTier,
      reducedMotion,
      duration,
      easing,
      willChange,
      hardwareAcceleration,
    ]
  );

  const staggerAnimations = useCallback(
    (
      elements: NodeListOf<Element> | HTMLElement[],
      animationFn: (element: HTMLElement, index: number) => void,
      staggerDelay: number = 50
    ) => {
      if (performanceTier.level === 'low' || reducedMotion) {
        // Apply immediately for low-performance devices
        elements.forEach((element, index) => {
          animationFn(element as HTMLElement, index);
        });
        return;
      }

      elements.forEach((element, index) => {
        setTimeout(() => {
          animationFn(element as HTMLElement, index);
        }, index * staggerDelay);
      });
    },
    [performanceTier, reducedMotion]
  );

  const optimizeForMobile = useCallback(
    (element: HTMLElement) => {
      if (!touchOptimized || performanceTier.level === 'low') return;

      // Add touch-friendly styles
      element.style.touchAction = 'manipulation';
      element.style.userSelect = 'none';
      (
        element.style as CSSStyleDeclaration & {
          webkitTapHighlightColor?: string;
        }
      ).webkitTapHighlightColor = 'transparent';

      // Optimize for mobile GPUs
      if (performanceTier.level === 'high') {
        element.style.transform = 'translateZ(0)';
        element.style.webkitTransform = 'translateZ(0)';
      }
    },
    [touchOptimized, performanceTier]
  );

  return {
    isSupported,
    performanceTier,
    createOptimizedAnimation,
    animate,
    staggerAnimations,
    optimizeForMobile,
    reducedMotion: performanceTier.reducedMotion || reducedMotion,
  };
}

// Touch gesture optimization hook
export function useTouchGestures(config: TouchGestureConfig = {}) {
  const [touchStart, setTouchStart] = useState<{
    x: number;
    y: number;
    time: number;
  } | null>(null);
  const [isGestureActive, setIsGestureActive] = useState(false);
  const gestureRef = useRef<{
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
  } | null>(null);

  const {
    enableSwipe = true,
    enablePinch = false,
    enableTap = true,
    enableLongPress = false,
    swipeThreshold = 50,
    longPressDelay = 500,
  } = config;

  // Define callback functions first
  const handleLongPress = useCallback((event: TouchEvent) => {
    const longPressEvent = new CustomEvent('longpress', {
      detail: {
        x: gestureRef.current?.lastX,
        y: gestureRef.current?.lastY,
        timestamp: Date.now(),
      },
    });
    document.dispatchEvent(longPressEvent);

    trackCustomMetric('longpress', 1, 'User Interaction');
  }, []);

  const handlePinch = useCallback((event: TouchEvent) => {
    if (event.touches.length !== 2) return;

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    if (!touch1 || !touch2) return;

    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );

    const pinchEvent = new CustomEvent('pinch', {
      detail: {
        distance,
        scale:
          distance /
          (gestureRef.current
            ? Math.sqrt(
                Math.pow(
                  gestureRef.current.lastX - gestureRef.current.startX,
                  2
                ) +
                  Math.pow(
                    gestureRef.current.lastY - gestureRef.current.startY,
                    2
                  )
              )
            : 1),
        timestamp: Date.now(),
      },
    });
    document.dispatchEvent(pinchEvent);

    trackCustomMetric('pinch', 1, 'User Interaction');
  }, []);

  const handleSwipe = useCallback(
    (deltaX: number, deltaY: number, distance: number) => {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const velocity = distance / (Date.now() - (touchStart?.time || 0));

      let direction: 'left' | 'right' | 'up' | 'down' = 'right';

      if (absX > absY) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      // Dispatch custom swipe event
      const swipeEvent = new CustomEvent('swipe', {
        detail: {
          direction,
          deltaX,
          deltaY,
          distance,
          velocity,
          timestamp: Date.now(),
        },
      });
      document.dispatchEvent(swipeEvent);

      trackCustomMetric(`swipe_${direction}`, 1, 'User Interaction');
    },
    [touchStart]
  );

  const handleTap = useCallback((event: TouchEvent) => {
    const tapEvent = new CustomEvent('tap', {
      detail: {
        x: gestureRef.current?.lastX,
        y: gestureRef.current?.lastY,
        timestamp: Date.now(),
      },
    });
    document.dispatchEvent(tapEvent);

    trackCustomMetric('tap', 1, 'User Interaction');
  }, []);

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      const start = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      setTouchStart(start);
      gestureRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        lastX: touch.clientX,
        lastY: touch.clientY,
      };
      setIsGestureActive(true);

      // Long press detection
      if (enableLongPress) {
        setTimeout(() => {
          if (isGestureActive && touchStart) {
            handleLongPress(event);
          }
        }, longPressDelay);
      }
    },
    [
      isGestureActive,
      touchStart,
      enableLongPress,
      longPressDelay,
      handleLongPress,
    ]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!gestureRef.current || !isGestureActive) return;

      const touch = event.touches[0];
      if (!touch) return;
      gestureRef.current.lastX = touch.clientX;
      gestureRef.current.lastY = touch.clientY;

      // Handle pinch gestures
      if (enablePinch && event.touches.length === 2) {
        handlePinch(event);
      }
    },
    [isGestureActive, enablePinch, handlePinch]
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (!gestureRef.current || !touchStart) return;

      const deltaX = gestureRef.current.lastX - gestureRef.current.startX;
      const deltaY = gestureRef.current.lastY - gestureRef.current.startY;
      const deltaTime = Date.now() - touchStart.time;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Handle swipe gestures
      if (enableSwipe && distance > swipeThreshold && deltaTime < 300) {
        handleSwipe(deltaX, deltaY, distance);
      }

      // Handle tap gestures
      if (enableTap && distance < 10 && deltaTime < 200) {
        handleTap(event);
      }

      setTouchStart(null);
      gestureRef.current = null;
      setIsGestureActive(false);
    },
    [enableSwipe, enableTap, swipeThreshold, touchStart, handleSwipe, handleTap]
  );

  const attachGestures = useCallback(
    (element: HTMLElement) => {
      element.addEventListener('touchstart', handleTouchStart, {
        passive: true,
      });
      element.addEventListener('touchmove', handleTouchMove, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });

      // Cleanup
      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    },
    [handleTouchStart, handleTouchMove, handleTouchEnd]
  );

  return {
    attachGestures,
    isGestureActive,
    performanceTier: { level: 'high' }, // Default tier for touch gestures
  };
}

// Hardware acceleration utilities
export function enableHardwareAcceleration(element: HTMLElement) {
  element.style.transform = 'translateZ(0)';
  element.style.webkitTransform = 'translateZ(0)';
  element.style.backfaceVisibility = 'hidden';
  element.style.perspective = '1000px';
}

export function disableHardwareAcceleration(element: HTMLElement) {
  element.style.transform = '';
  element.style.webkitTransform = '';
  element.style.backfaceVisibility = '';
  element.style.perspective = '';
}
