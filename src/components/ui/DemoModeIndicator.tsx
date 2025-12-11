/**
 * Demo Mode Indicator Component (TASK-036)
 * 
 * Persistent banner indicating demo mode to prevent user confusion.
 * Shows clear distinction between virtual and real funds.
 */
import * as React from 'react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DemoModeIndicatorProps {
  /** Whether demo mode is active */
  isDemoMode?: boolean;
  /** Virtual balance amount */
  virtualBalance?: number;
  /** Whether the indicator can be dismissed temporarily */
  dismissible?: boolean;
  /** Custom class name */
  className?: string;
  /** Variant style */
  variant?: 'banner' | 'badge' | 'minimal';
}

const DISMISS_STORAGE_KEY = 'demo-mode-indicator-dismissed';
const DISMISS_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export const DemoModeIndicator: React.FC<DemoModeIndicatorProps> = ({
  isDemoMode = true,
  virtualBalance,
  dismissible = true,
  className,
  variant = 'banner'
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if was previously dismissed (with expiration)
  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (dismissedAt) {
      const dismissTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      if (now - dismissTime < DISMISS_DURATION_MS) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem(DISMISS_STORAGE_KEY);
      }
    }
  }, []);

  const handleDismiss = () => {
    if (dismissible) {
      localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString());
      setIsDismissed(true);
    }
  };

  // Don't show if not in demo mode or dismissed
  if (!isDemoMode || isDismissed) {
    return null;
  }

  // Format virtual balance
  const formattedBalance = virtualBalance
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(virtualBalance)
    : null;

  if (variant === 'badge') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
          'bg-warning/20 text-warning border border-warning/30',
          'text-xs font-medium',
          className
        )}
        role="status"
        aria-label="Demo mode active"
      >
        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
        <span>Demo Mode</span>
        {formattedBalance && (
          <span className="text-warning/80">({formattedBalance})</span>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5',
          'bg-warning/10 border-l-4 border-warning',
          'text-sm text-warning',
          className
        )}
        role="status"
        aria-label="Demo mode active"
      >
        <Info className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span className="font-medium">Practice Account</span>
        {formattedBalance && (
          <span className="text-warning/70">• {formattedBalance} virtual</span>
        )}
      </div>
    );
  }

  // Default: banner variant
  return (
    <div
      className={cn(
        'relative flex items-center justify-center gap-3 px-4 py-2',
        'bg-gradient-to-r from-warning/20 via-warning/15 to-warning/20',
        'border-b border-warning/30',
        'text-warning',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="font-semibold">Demo Mode Active</span>
        <span className="hidden sm:inline text-warning/80">•</span>
        <span className="text-warning/80 hidden sm:inline">
          Trading with virtual funds - no real money at risk
        </span>
        {formattedBalance && (
          <>
            <span className="text-warning/80">•</span>
            <span className="font-medium">
              Virtual Balance: {formattedBalance}
            </span>
          </>
        )}
      </div>

      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-warning/70 hover:text-warning hover:bg-warning/10"
          onClick={handleDismiss}
          aria-label="Dismiss demo mode notice (reappears in 30 minutes)"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

/**
 * Hook to check if currently in demo mode
 * In a real implementation, this would check user account type
 */
export const useDemoMode = () => {
  // For now, always return true since this is a demo trading platform
  // In production, this would check the user's account type from the database
  const isDemoMode = true;
  const virtualBalance = 100000; // Default demo balance

  return {
    isDemoMode,
    virtualBalance
  };
};

export default DemoModeIndicator;
