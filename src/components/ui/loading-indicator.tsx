import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * FE-010: Loading States System
 * Comprehensive loading indicator components for async operations
 */

interface LoadingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show the loading state */
  isLoading?: boolean;
  /** Optional label text */
  label?: string;
  /** Size variant: sm (16px), md (24px), lg (32px) */
  size?: 'sm' | 'md' | 'lg';
  /** Loading indicator style */
  variant?: 'spinner' | 'pulse' | 'dots';
}

/**
 * Basic loading spinner with optional label
 */
export function LoadingIndicator({
  isLoading = true,
  label,
  size = 'md',
  variant = 'spinner',
  className,
  ...props
}: LoadingIndicatorProps) {
  if (!isLoading) return null;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)} {...props}>
      {variant === 'spinner' && (
        <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      )}
      {variant === 'pulse' && (
        <div className={cn('rounded-full bg-primary animate-pulse', sizeClasses[size])} />
      )}
      {variant === 'dots' && (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn('rounded-full bg-primary', sizeClasses[size])}
              style={{ animation: `pulse 1.4s ease-in-out ${i * 0.16}s infinite` }}
            />
          ))}
        </div>
      )}
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** State: loading, success, or error */
  state: 'loading' | 'success' | 'error';
  /** Message to display */
  message?: string;
  /** Show icon */
  showIcon?: boolean;
}

/**
 * Loading state display with icon and message
 */
export function LoadingState({
  state,
  message,
  showIcon = true,
  className,
  ...props
}: LoadingStateProps) {
  const stateConfig = {
    loading: {
      icon: Loader2,
      color: 'text-primary',
      iconClass: 'animate-spin',
    },
    success: {
      icon: CheckCircle2,
      color: 'text-success',
      iconClass: '',
    },
    error: {
      icon: AlertCircle,
      color: 'text-destructive',
      iconClass: '',
    },
  };

  const { icon: Icon, color, iconClass } = stateConfig[state];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 py-8',
        className
      )}
      {...props}
    >
      {showIcon && (
        <Icon className={cn('h-8 w-8', color, iconClass)} />
      )}
      {message && (
        <p className="text-sm text-muted-foreground text-center">{message}</p>
      )}
    </div>
  );
}

interface LoadingBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Whether to show loading state */
  isLoading: boolean;
  /** Content to display when not loading */
  children: React.ReactNode;
}

/**
 * Loading badge for inline loading states
 */
export function LoadingBadge({
  isLoading,
  children,
  className,
  ...props
}: LoadingBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
        isLoading ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
      {children}
    </span>
  );
}

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether overlay is visible */
  isLoading: boolean;
  /** Optional message */
  message?: string;
  /** Opacity level: light, medium, heavy */
  opacity?: 'light' | 'medium' | 'heavy';
}

/**
 * Full loading overlay for sections or pages
 */
export function LoadingOverlay({
  isLoading,
  message,
  opacity = 'medium',
  className,
  children,
  ...props
}: LoadingOverlayProps) {
  const opacityClasses = {
    light: 'bg-background/30',
    medium: 'bg-background/50',
    heavy: 'bg-background/70',
  };

  return (
    <div className={cn('relative', className)} {...props}>
      {children}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-lg',
            'transition-opacity duration-200',
            opacityClasses[opacity],
            'backdrop-blur-sm z-50'
          )}
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            {message && (
              <p className="text-sm font-medium text-foreground">{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Minimal loading dots for inline use
 */
export function LoadingDots() {
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1 w-1 rounded-full bg-current"
          style={{ animation: `pulse 1.4s ease-in-out ${i * 0.16}s infinite` }}
        />
      ))}
    </span>
  );
}

/**
 * Progress bar for loading states
 */
interface LoadingProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Progress percentage 0-100 */
  progress: number;
  /** Show percentage label */
  showLabel?: boolean;
}

export function LoadingProgress({
  progress,
  showLabel = false,
  className,
  ...props
}: LoadingProgressProps) {
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn('w-full', className)} {...props}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full w-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${safeProgress}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-2 text-xs text-muted-foreground text-center">
          {safeProgress}%
        </p>
      )}
    </div>
  );
}
