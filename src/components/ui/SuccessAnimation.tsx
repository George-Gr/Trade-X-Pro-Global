import * as React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessAnimationProps {
  message?: string;
  onComplete?: () => void;
  duration?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * SuccessAnimation Component
 *
 * Displays an animated checkmark with optional message and auto-fade out.
 * Used for form submissions, confirmations, and successful actions.
 *
 * Usage:
 * <SuccessAnimation
 *   message="Saved successfully!"
 *   onComplete={() => setShowSuccess(false)}
 *   duration={2000}
 * />
 */
export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  message,
  onComplete,
  duration = 2000,
  className = '',
  size = 'md',
}) => {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [onComplete, duration]);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        className
      )}
    >
      <div
        className={cn(
          'rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center',
          'animate-success-check',
          sizeClasses[size]
        )}
      >
        <CheckCircle2
          className={cn(
            'text-green-600 dark:text-green-400 animate-success-check',
            size === 'sm' && 'h-6 w-6',
            size === 'md' && 'h-8 w-8',
            size === 'lg' && 'h-12 w-12'
          )}
        />
      </div>
      {message && (
        <p className="text-sm font-medium text-foreground animate-fade-in">
          {message}
        </p>
      )}
    </div>
  );
};

// Error Animation Component
interface ErrorAnimationProps {
  message?: string;
  onComplete?: () => void;
  duration?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ErrorAnimation: React.FC<ErrorAnimationProps> = ({
  message,
  onComplete,
  duration = 3000,
  className = '',
  size = 'md',
}) => {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [onComplete, duration]);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        className
      )}
    >
      <div
        className={cn(
          'rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center',
          sizeClasses[size]
        )}
      >
        <XCircle
          className={cn(
            'text red-600 dark:text-red-400 animate-error-shake',
            size === 'sm' && 'h-6 w-6',
            size === 'md' && 'h-8 w-8',
            size === 'lg' && 'h-12 w-12'
          )}
        />
      </div>
      {message && (
        <p className="text-sm font-medium text-foreground animate-fade-in">
          {message}
        </p>
      )}
    </div>
  );
};

// Warning Animation Component
interface WarningAnimationProps {
  message?: string;
  onComplete?: () => void;
  duration?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const WarningAnimation: React.FC<WarningAnimationProps> = ({
  message,
  onComplete,
  duration = 2500,
  className = '',
  size = 'md',
}) => {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [onComplete, duration]);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        className
      )}
    >
      <div
        className={cn(
          'rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center',
          sizeClasses[size]
        )}
      >
        <AlertTriangle
          className={cn(
            'text-amber-600 dark:text-amber-400',
            size === 'sm' && 'h-6 w-6',
            size === 'md' && 'h-8 w-8',
            size === 'lg' && 'h-12 w-12'
          )}
        />
      </div>
      {message && (
        <p className="text-sm font-medium text-foreground animate-fade-in">
          {message}
        </p>
      )}
    </div>
  );
};

// Info Animation Component
interface InfoAnimationProps {
  message?: string;
  onComplete?: () => void;
  duration?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const InfoAnimation: React.FC<InfoAnimationProps> = ({
  message,
  onComplete,
  duration = 2000,
  className = '',
  size = 'md',
}) => {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [onComplete, duration]);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        className
      )}
    >
      <div
        className={cn(
          'rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center',
          'animate-float',
          sizeClasses[size]
        )}
      >
        <Info
          className={cn(
            'text-blue-600 dark:text-blue-400',
            size === 'sm' && 'h-6 w-6',
            size === 'md' && 'h-8 w-8',
            size === 'lg' && 'h-12 w-12'
          )}
        />
      </div>
      {message && (
        <p className="text-sm font-medium text-foreground animate-fade-in">
          {message}
        </p>
      )}
    </div>
  );
};
