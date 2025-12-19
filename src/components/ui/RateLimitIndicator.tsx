/**
 * Rate limit status indicator component
 * Shows queue status and rate limit warnings
 */

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRateLimitStatus } from '@/hooks/useRateLimitStatus';
import { cn } from '@/lib/utils';
import { AlertCircle, Clock, Loader2 } from 'lucide-react';

interface RateLimitIndicatorProps {
  endpoint?: string;
  className?: string;
  showAlways?: boolean;
}

export const RateLimitIndicator: React.FC<RateLimitIndicatorProps> = ({
  endpoint = 'order',
  className,
  showAlways = false,
}) => {
  const { queueLength, isProcessing, getRemainingRequests, getResetTime } =
    useRateLimitStatus({
      endpoint,
    });

  const remaining = getRemainingRequests(endpoint);
  const resetTime = getResetTime(endpoint);

  // Don't show if everything is fine and showAlways is false
  if (!showAlways && queueLength === 0 && remaining > 3) {
    return null;
  }

  const isWarning = remaining <= 3 && remaining > 0;
  const isBlocked = remaining === 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors',
              isBlocked && 'bg-destructive/10 text-destructive',
              isWarning && 'bg-warning/10 text-warning',
              !isBlocked && !isWarning && 'bg-muted text-muted-foreground',
              className
            )}
          >
            {isProcessing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isBlocked ? (
              <AlertCircle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}

            {queueLength > 0 && <span>Queue: {queueLength}</span>}

            {isBlocked && <span>Rate limited</span>}

            {isWarning && !isBlocked && <span>{remaining} left</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1 text-xs">
            <p>
              <strong>Requests remaining:</strong> {remaining}
            </p>
            {queueLength > 0 && (
              <p>
                <strong>Queued requests:</strong> {queueLength}
              </p>
            )}
            {resetTime > 0 && (
              <p>
                <strong>Resets in:</strong> {Math.ceil(resetTime / 1000)}s
              </p>
            )}
            {isBlocked && (
              <p className="text-destructive">
                Please wait before making more requests.
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RateLimitIndicator;
