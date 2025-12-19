import React from 'react';
import { cn } from '@/lib/utils';
import { ShimmerEffect } from '@/components/ui/LoadingSkeleton';

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  shimmer?: boolean;
  fadeDuration?: number;
}

export function LoadingOverlay({
  isLoading,
  children,
  className,
  overlayClassName,
  shimmer = true,
  fadeDuration = 300,
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}

      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center',
            `transition-all duration-${fadeDuration} ease-in-out`,
            overlayClassName
          )}
        >
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="h-12 w-12 mx-auto bg-primary/20 rounded-full animate-pulse-slow">
                {shimmer && (
                  <ShimmerEffect className="absolute inset-0 rounded-full" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-primary-contrast">
                <span className="animate-pulse">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProgressLoadingOverlayProps {
  progress: number;
  children: React.ReactNode;
  className?: string;
  showPercentage?: boolean;
  showText?: boolean;
  text?: string;
}

export function ProgressLoadingOverlay({
  progress,
  children,
  className,
  showPercentage = true,
  showText = true,
  text = 'Loading...',
}: ProgressLoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}

      <div className="absolute inset-0 bg-background/90 backdrop-blur-md z-10">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="h-16 w-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-muted/50"></div>
                <div
                  className="absolute inset-0 rounded-full border-2 border-primary border-t-primary animate-spin"
                  style={{
                    transform: `rotate(${progress * 3.6}deg)`,
                    transition: 'transform 0.3s ease-out',
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              {showText && (
                <div className="text-sm font-medium text-primary-contrast">
                  {text}
                </div>
              )}

              {showPercentage && (
                <div className="text-xs text-secondary-contrast">
                  {Math.round(progress)}%
                </div>
              )}

              <div className="w-32 mx-auto bg-muted/50 rounded-full h-2">
                <div
                  className="h-2 bg-primary rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SkeletonOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  shimmer?: boolean;
}

export function SkeletonOverlay({
  isLoading,
  children,
  className,
  shimmer = true,
}: SkeletonOverlayProps) {
  if (!isLoading) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 bg-muted/50 rounded animate-pulse-slow">
        {shimmer && <ShimmerEffect className="absolute inset-0 rounded" />}
      </div>

      <div className="relative opacity-0 pointer-events-none">{children}</div>
    </div>
  );
}

interface OptimisticLoadingProps {
  isOptimistic: boolean;
  children: React.ReactNode;
  className?: string;
  successDuration?: number;
  onOptimisticComplete?: () => void;
}

export function OptimisticLoading({
  isOptimistic,
  children,
  className,
  successDuration = 2000,
  onOptimisticComplete,
}: OptimisticLoadingProps) {
  React.useEffect(() => {
    if (isOptimistic) {
      const timer = setTimeout(() => {
        onOptimisticComplete?.();
      }, successDuration);

      return () => clearTimeout(timer);
    }
  }, [isOptimistic, successDuration, onOptimisticComplete]);

  return (
    <div
      className={cn(
        className,
        isOptimistic && 'optimistic-loading',
        isOptimistic && 'animate-pulse-slow'
      )}
    >
      {children}
    </div>
  );
}
