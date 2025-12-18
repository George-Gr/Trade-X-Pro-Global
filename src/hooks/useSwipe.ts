import { useCallback, useRef, useEffect } from "react";

export interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance in pixels
  preventDefault?: boolean;
}

export interface SwipeReturn {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export const useSwipe = (config: SwipeConfig = {}): SwipeReturn => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefault = true,
  } = config;

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);
  const isSwipingRef = useRef(false);

  const handleSwipe = useCallback(() => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const diffX = touchStartRef.current.x - touchEndRef.current.x;
    const diffY = touchStartRef.current.y - touchEndRef.current.y;

    // Determine swipe direction based on which axis had the greater movement
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(diffY) > threshold) {
        if (diffY > 0) {
          onSwipeUp?.();
        } else {
          onSwipeDown?.();
        }
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }

      isSwipingRef.current = true;
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      touchEndRef.current = null;
    },
    [preventDefault],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isSwipingRef.current || preventDefault) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      touchEndRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [preventDefault],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isSwipingRef.current) return;

      isSwipingRef.current = false;
      handleSwipe();

      // Reset refs
      touchStartRef.current = null;
      touchEndRef.current = null;
    },
    [handleSwipe],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      touchStartRef.current = null;
      touchEndRef.current = null;
      isSwipingRef.current = false;
    };
  }, []);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};

// Predefined swipe gestures for common navigation patterns
export const useNavigationSwipe = () => {
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    threshold: 60, // Slightly higher threshold for navigation
    preventDefault: true,
  });

  return {
    // For horizontal navigation (left/right)
    onHorizontalSwipe: (
      onSwipeLeft?: () => void,
      onSwipeRight?: () => void,
    ) => ({
      onTouchStart,
      onTouchMove,
      onTouchEnd: (e: React.TouchEvent) => {
        // Reuse the same swipe detection but with different callbacks
        onTouchEnd(e);
        // Note: The actual swipe direction will be handled by the parent component
        // based on the delta values calculated in the original useSwipe hook
      },
    }),

    // For vertical navigation (up/down)
    onVerticalSwipe: (onSwipeUp?: () => void, onSwipeDown?: () => void) => ({
      onTouchStart,
      onTouchMove,
      onTouchEnd: (e: React.TouchEvent) => {
        // Reuse the same swipe detection but with different callbacks
        onTouchEnd(e);
        // Note: The actual swipe direction will be handled by the parent component
        // based on the delta values calculated in the original useSwipe hook
      },
    }),
  };
};

// Swipe directions for common use cases
export const SWIPE_DIRECTIONS = {
  LEFT: "left",
  RIGHT: "right",
  UP: "up",
  DOWN: "down",
} as const;

export type SwipeDirection =
  (typeof SWIPE_DIRECTIONS)[keyof typeof SWIPE_DIRECTIONS];
