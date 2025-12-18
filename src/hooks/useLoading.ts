import { useState, useCallback, useRef, useEffect } from "react";

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: unknown;
}

interface UseLoadingOptions {
  initialLoading?: boolean;
  debounceMs?: number;
  optimisticUpdate?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

export function useLoading<T = unknown>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  options: UseLoadingOptions = {},
) {
  const {
    initialLoading = false,
    debounceMs = 300,
    optimisticUpdate = false,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    error: null,
    data: null,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const abortControllerRef = useRef<AbortController>();

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      // Cancel previous request if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Debounce the request
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        await new Promise((resolve) => {
          timeoutRef.current = setTimeout(resolve, debounceMs);
        });

        // Check if request was cancelled
        if (abortControllerRef.current.signal.aborted) {
          throw new Error("Request cancelled");
        }

        const result = await asyncFunction(...args);

        // Check if request was cancelled after async function completed
        if (abortControllerRef.current.signal.aborted) {
          return null;
        }

        setState({
          isLoading: false,
          error: null,
          data: result,
        });

        onSuccess?.(result);
        return result;
      } catch (error) {
        if (abortControllerRef.current.signal.aborted) {
          return null;
        }

        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setState({
          isLoading: false,
          error: errorMessage,
          data: null,
        });

        onError?.(errorMessage);
        return null;
      }
    },
    [asyncFunction, debounceMs, onSuccess, onError],
  );

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      isLoading: false,
      error: null,
      data: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    clearError,
    // Convenience methods for optimistic updates
    startOptimistic: () => setState((prev) => ({ ...prev, isLoading: true })),
    finishOptimistic: (data?: unknown) =>
      setState((prev) => ({
        ...prev,
        isLoading: false,
        data: data || prev.data,
        error: null,
      })),
    failOptimistic: (error: string) =>
      setState((prev) => ({ ...prev, isLoading: false, error })),
  };
}

// Hook for progressive loading states
export function useProgressiveLoading() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const startLoading = useCallback((steps?: number) => {
    setProgress(0);
    setIsComplete(false);

    if (steps) {
      const stepProgress = 100 / steps;
      let currentStep = 0;

      return {
        nextStep: () => {
          currentStep++;
          setProgress(Math.min(currentStep * stepProgress, 90));
          return currentStep >= steps;
        },
        complete: () => {
          setProgress(100);
          setTimeout(() => setIsComplete(true), 200);
        },
      };
    }

    return {
      nextStep: () => false,
      complete: () => {
        setProgress(100);
        setTimeout(() => setIsComplete(true), 200);
      },
    };
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setIsComplete(false);
  }, []);

  return {
    progress,
    isComplete,
    startLoading,
    reset,
  };
}

// Hook for skeleton screen timing
export function useSkeletonTiming(minimumDisplayTime = 1000) {
  const [shouldShowSkeleton, setShouldShowSkeleton] = useState(true);
  const startTimeRef = useRef<number>();

  const startSkeleton = useCallback(() => {
    startTimeRef.current = Date.now();
    setShouldShowSkeleton(true);
  }, []);

  const stopSkeleton = useCallback(() => {
    const elapsed = Date.now() - (startTimeRef.current || Date.now());
    const remainingTime = Math.max(0, minimumDisplayTime - elapsed);

    setTimeout(() => {
      setShouldShowSkeleton(false);
    }, remainingTime);
  }, [minimumDisplayTime]);

  return {
    shouldShowSkeleton,
    startSkeleton,
    stopSkeleton,
  };
}

// Hook for shimmer effect management
export function useShimmer() {
  const [isShimmering, setIsShimmering] = useState(false);

  const startShimmer = useCallback(() => {
    setIsShimmering(true);
  }, []);

  const stopShimmer = useCallback(() => {
    setIsShimmering(false);
  }, []);

  return {
    isShimmering,
    startShimmer,
    stopShimmer,
  };
}
