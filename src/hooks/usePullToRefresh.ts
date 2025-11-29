import { useCallback, useRef, useState, useEffect } from 'react';

export interface PullToRefreshConfig {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
  disabled?: boolean;
  className?: string;
}

export interface PullToRefreshReturn {
  containerProps: {
    ref: React.RefObject<HTMLDivElement>;
    onTouchStart: React.TouchEventHandler<HTMLDivElement>;
    onTouchMove: React.TouchEventHandler<HTMLDivElement>;
    onTouchEnd: React.TouchEventHandler<HTMLDivElement>;
    className: string;
  };
  isRefreshing: boolean;
  pullDistance: number;
  canRefresh: boolean;
}

export const usePullToRefresh = (config: PullToRefreshConfig): PullToRefreshReturn => {
  const {
    onRefresh,
    threshold = 80,
    resistance = 0.5,
    disabled = false,
    className = ''
  } = config;

  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [canRefresh, setCanRefresh] = useState(false);

  const resetState = useCallback(() => {
    setPullDistance(0);
    setCanRefresh(false);
    if (containerRef.current) {
      containerRef.current.style.transform = 'translateY(0px)';
      containerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.33, 0.66, 0.66, 1)';
    }
  }, []);

  const startRefresh = useCallback(async () => {
    if (disabled || isRefreshing || !canRefresh) return;

    setIsRefreshing(true);
    setPullDistance(threshold);
    
    if (containerRef.current) {
      containerRef.current.style.transform = `translateY(${threshold}px)`;
      containerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.33, 0.66, 0.66, 1)';
    }

    try {
      await onRefresh();
    } catch (error) {
      console.error('Pull to refresh failed:', error);
    } finally {
      // Wait a bit before resetting to show refresh complete
      setTimeout(() => {
        setIsRefreshing(false);
        resetState();
      }, 500);
    }
  }, [disabled, isRefreshing, canRefresh, onRefresh, threshold, resetState]);

  const onTouchStart = useCallback<React.TouchEventHandler<HTMLDivElement>>((e) => {
    if (disabled || isRefreshing) return;

    // Only allow pull-to-refresh when at the top of the content
    const target = e.currentTarget;
    if (target.scrollTop > 0) return;

    startYRef.current = e.touches[0].pageY;
    currentYRef.current = e.touches[0].pageY;
  }, [disabled, isRefreshing]);

  const onTouchMove = useCallback<React.TouchEventHandler<HTMLDivElement>>((e) => {
    if (disabled || isRefreshing || !containerRef.current) return;

    const target = e.currentTarget;
    if (target.scrollTop > 0) return;

    const currentY = e.touches[0].pageY;
    const deltaY = currentY - startYRef.current;

    // Only allow downward pull
    if (deltaY <= 0) return;

    e.preventDefault();
    
    currentYRef.current = currentY;
    const adjustedDeltaY = deltaY * resistance;
    
    setPullDistance(adjustedDeltaY);
    setCanRefresh(adjustedDeltaY > threshold);

    containerRef.current.style.transform = `translateY(${adjustedDeltaY}px)`;
    containerRef.current.style.transition = 'none';
    
    // Visual feedback for pull progress
    if (containerRef.current.firstChild && typeof containerRef.current.firstChild === 'object' && 'style' in containerRef.current.firstChild) {
      const firstChild = containerRef.current.firstChild as HTMLElement;
      const progress = Math.min(adjustedDeltaY / threshold, 1.5);
      firstChild.style.opacity = String(Math.max(0.3, 1 - (progress - 1) * 2));
    }
  }, [disabled, isRefreshing, resistance, threshold]);

  const onTouchEnd = useCallback<React.TouchEventHandler<HTMLDivElement>>((e) => {
    if (disabled || isRefreshing) return;

    const target = e.currentTarget;
    if (target.scrollTop > 0) return;

    const deltaY = currentYRef.current - startYRef.current;
    const adjustedDeltaY = deltaY * resistance;

    if (adjustedDeltaY > threshold) {
      startRefresh();
    } else {
      resetState();
    }
  }, [disabled, isRefreshing, resistance, threshold, startRefresh, resetState]);

  // Apply styles for the refresh indicator
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Add refresh indicator element if it doesn't exist
    let indicator = container.querySelector('.pull-to-refresh-indicator') as HTMLElement;
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'pull-to-refresh-indicator';
      indicator.innerHTML = `
        <div class="refresh-spinner">
          <div class="spinner-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      `;
      container.insertBefore(indicator, container.firstChild);
    }

    // Update indicator styles
    indicator.style.position = 'relative';
    indicator.style.transform = 'translateY(0)';
    indicator.style.transition = 'transform 0.3s ease';

    if (isRefreshing) {
      indicator.style.transform = `translateY(${threshold}px)`;
    } else if (pullDistance > 0) {
      indicator.style.transform = `translateY(${pullDistance}px)`;
    }

    // Show/hide spinner
    const spinner = indicator.querySelector('.refresh-spinner');
    if (spinner) {
      (spinner as HTMLElement).style.display = isRefreshing ? 'block' : 'none';
    }

  }, [isRefreshing, pullDistance, threshold]);

  const containerClassName = [
    'pull-to-refresh-container',
    isRefreshing ? 'is-refreshing' : '',
    canRefresh ? 'can-refresh' : '',
    className
  ].filter(Boolean).join(' ');

  return {
    containerProps: {
      ref: containerRef,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      className: containerClassName
    },
    isRefreshing,
    pullDistance,
    canRefresh
  };
};

// Hook for easy integration into specific screens
export const useDashboardPullToRefresh = (onRefresh: () => Promise<void> | void) => {
  return usePullToRefresh({
    onRefresh,
    threshold: 80,
    resistance: 0.6,
    disabled: false
  });
};

export const usePortfolioPullToRefresh = (onRefresh: () => Promise<void> | void) => {
  return usePullToRefresh({
    onRefresh,
    threshold: 70,
    resistance: 0.5,
    disabled: false
  });
};

export const useTradePullToRefresh = (onRefresh: () => Promise<void> | void) => {
  return usePullToRefresh({
    onRefresh,
    threshold: 60,
    resistance: 0.4,
    disabled: false
  });
};

// CSS for pull-to-refresh (can be imported separately)
export const pullToRefreshStyles = `
  .pull-to-refresh-container {
    position: relative;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .pull-to-refresh-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 10;
    background: transparent;
  }

  .refresh-spinner {
    display: none;
    width: 24px;
    height: 24px;
  }

  .spinner-ring {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .spinner-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 20px;
    height: 20px;
    margin: 2px;
    border: 3px solid hsl(var(--primary));
    border-radius: 50%;
    animation: spinner-rotate 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: hsl(var(--primary)) transparent transparent transparent;
  }

  .spinner-ring div:nth-child(1) {
    animation-delay: -0.48s;
  }

  .spinner-ring div:nth-child(2) {
    animation-delay: -0.36s;
  }

  .spinner-ring div:nth-child(3) {
    animation-delay: -0.24s;
  }

  .spinner-ring div:nth-child(4) {
    animation-delay: -0.12s;
  }

  @keyframes spinner-rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .pull-to-refresh-container.is-refreshing {
    pointer-events: none;
  }

  .pull-to-refresh-container.can-refresh .pull-to-refresh-indicator {
    opacity: 1;
  }
`;