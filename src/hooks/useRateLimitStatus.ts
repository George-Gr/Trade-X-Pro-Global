/**
 * Hook for monitoring rate limit status with UI feedback
 */

import { useState, useEffect, useCallback } from 'react';
import { rateLimiter, RateLimitStatus, checkRateLimit } from '@/lib/rateLimiter';
import { toast } from 'sonner';

interface UseRateLimitStatusOptions {
  endpoint?: string;
  warnThreshold?: number; // Percentage of limit remaining to show warning (default: 20%)
  showWarnings?: boolean;
}

export function useRateLimitStatus(options: UseRateLimitStatusOptions = {}) {
  const { 
    endpoint, 
    warnThreshold = 20, 
    showWarnings = true 
  } = options;

  const [status, setStatus] = useState<RateLimitStatus>(rateLimiter.getStatus());
  const [hasWarned, setHasWarned] = useState(false);

  useEffect(() => {
    const unsubscribe = rateLimiter.subscribe(newStatus => {
      setStatus(newStatus);

      // Check if we should warn user about approaching limits
      if (showWarnings && endpoint && !hasWarned) {
        const endpointStatus = newStatus.endpoints[endpoint];
        if (endpointStatus) {
          const percentRemaining = (endpointStatus.remaining / 10) * 100; // Assuming max 10 for orders
          
          if (percentRemaining <= warnThreshold && percentRemaining > 0) {
            toast.warning('Rate limit warning', {
              description: `You have ${endpointStatus.remaining} requests remaining. Slow down to avoid being blocked.`,
            });
            setHasWarned(true);

            // Reset warning after limit resets
            setTimeout(() => setHasWarned(false), endpointStatus.resetIn);
          }
        }
      }
    });

    return unsubscribe;
  }, [endpoint, warnThreshold, showWarnings, hasWarned]);

  const canMakeRequest = useCallback((ep?: string): boolean => {
    const targetEndpoint = ep || endpoint || 'default';
    return checkRateLimit(targetEndpoint).allowed;
  }, [endpoint]);

  const getRemainingRequests = useCallback((ep?: string): number => {
    const targetEndpoint = ep || endpoint || 'default';
    return checkRateLimit(targetEndpoint).remaining;
  }, [endpoint]);

  const getResetTime = useCallback((ep?: string): number => {
    const targetEndpoint = ep || endpoint || 'default';
    return checkRateLimit(targetEndpoint).resetIn;
  }, [endpoint]);

  return {
    status,
    queueLength: status.queueLength,
    isProcessing: status.isProcessing,
    canMakeRequest,
    getRemainingRequests,
    getResetTime,
  };
}

export default useRateLimitStatus;
