import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseBrowserClient";
import { useToast } from "@/hooks/use-toast";
import { rateLimiter, checkRateLimit } from "@/lib/rateLimiter";
import { generateIdempotencyKey, executeWithIdempotency } from "@/lib/idempotency";
import { sanitizeText, sanitizeNumber } from "@/lib/sanitize";
import { logger } from "@/lib/logger";

/**
 * Request payload for closing a position
 * @interface ClosePositionRequest
 */
export interface ClosePositionRequest {
  /** UUID of the position to close */
  position_id: string;
  /** Quantity to close (optional - if not provided, closes entire position) */
  quantity?: number;
}

/**
 * Result returned after successfully closing a position
 * @interface ClosePositionResult
 */
export interface ClosePositionResult {
  /** ID of the closing order */
  order_id: string;
  /** ID of the fill record */
  fill_id: string;
  /** ID of the closed position */
  position_id: string;
  /** Quantity that was closed */
  closed_quantity: number;
  /** Price at which position was closed */
  close_price: number;
  /** Profit/loss realized from closing */
  realized_pnl: number;
  /** Commission charged for closing */
  commission: number;
  /** Margin returned to account */
  margin_released: number;
  /** Details of individual lots closed (FIFO) */
  lots_closed: Array<{
    lot_id: string;
    quantity_closed: number;
    entry_price: number;
    exit_price: number;
    pnl: number;
  }>;
  /** Final position status after closing */
  position_status: 'closed' | 'partial';
}

/**
 * Hook for closing trading positions with built-in rate limiting and idempotency.
 * 
 * @description
 * This hook provides a secure and reliable way to close positions with:
 * - Rate limiting to prevent excessive close requests
 * - Idempotency keys to prevent duplicate closures from retries
 * - Input sanitization for security
 * - Support for partial position closing
 * - FIFO lot matching for accurate P&L calculation
 * 
 * @example
 * ```tsx
 * const { closePosition, isClosing } = usePositionClose();
 * 
 * // Close entire position
 * const handleCloseAll = async (positionId: string) => {
 *   const result = await closePosition({ position_id: positionId });
 *   if (result) {
 *     console.log('P&L:', result.realized_pnl);
 *   }
 * };
 * 
 * // Partial close
 * const handlePartialClose = async (positionId: string) => {
 *   const result = await closePosition({ 
 *     position_id: positionId,
 *     quantity: 0.5 // Close half
 *   });
 * };
 * ```
 * 
 * @returns {Object} Hook return object
 * @returns {Function} closePosition - Function to close a position
 * @returns {boolean} isClosing - Whether a close operation is in progress
 * @returns {Function} getRateLimitStatus - Function to check current rate limit status
 */
export const usePositionClose = () => {
  const [isClosing, setIsClosing] = useState(false);
  const { toast } = useToast();

  /**
   * Close a trading position (fully or partially)
   * @param request - The close request containing position ID and optional quantity
   * @returns Promise resolving to ClosePositionResult on success, null on failure
   */
  const closePosition = useCallback(async (request: ClosePositionRequest): Promise<ClosePositionResult | null> => {
    // Check rate limit before proceeding
    const rateCheck = checkRateLimit('order');
    if (!rateCheck.allowed) {
      toast({
        title: "Rate Limit Exceeded",
        description: `Please wait ${Math.ceil(rateCheck.resetIn / 1000)} seconds before closing another position.`,
        variant: "destructive",
      });
      logger.warn('Close position rate limit exceeded', { 
        metadata: { remaining: rateCheck.remaining, resetIn: rateCheck.resetIn } 
      });
      return null;
    }

    setIsClosing(true);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to close positions",
          variant: "destructive",
        });
        return null;
      }

      // Sanitize inputs
      const sanitizedRequest = {
        position_id: sanitizeText(request.position_id),
        quantity: request.quantity ? sanitizeNumber(request.quantity) : undefined,
      };

      // Generate idempotency key
      const idempotencyKey = generateIdempotencyKey(
        session.user.id,
        'close_position',
        {
          position_id: sanitizedRequest.position_id,
          quantity: sanitizedRequest.quantity,
        }
      );

      // Execute with rate limiting and idempotency protection
      const result = await rateLimiter.execute(
        'order',
        async () => {
          return executeWithIdempotency(
            idempotencyKey,
            'close-position',
            async () => {
              const { data, error } = await supabase.functions.invoke('close-position', {
                body: {
                  ...sanitizedRequest,
                  idempotency_key: idempotencyKey,
                },
              });

              if (error) {
                throw error;
              }

              if (data.error) {
                throw new Error(data.error);
              }

              return data;
            }
          );
        },
        10 // High priority for position close
      );

      const closeResult = result.data as ClosePositionResult;
      const pnlText = closeResult.realized_pnl >= 0 
        ? `+$${closeResult.realized_pnl.toFixed(2)}` 
        : `-$${Math.abs(closeResult.realized_pnl).toFixed(2)}`;

      toast({
        title: "Position Closed",
        description: `Closed ${closeResult.closed_quantity} lots at ${closeResult.close_price}. P&L: ${pnlText}`,
        variant: closeResult.realized_pnl >= 0 ? "default" : "destructive",
      });

      logger.info('Position closed successfully', {
        metadata: {
          positionId: closeResult.position_id,
          realizedPnl: closeResult.realized_pnl,
          status: closeResult.position_status,
        },
      });

      return closeResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Check for duplicate request error
      if (errorMessage.includes('already being processed')) {
        toast({
          title: "Duplicate Request",
          description: "This close request is already being processed. Please wait.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Close Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      logger.error('Close position failed', error);
      return null;
    } finally {
      setIsClosing(false);
    }
  }, [toast]);

  /**
   * Get the current rate limit status for position operations
   * @returns Rate limit status including remaining requests and reset time
   */
  const getRateLimitStatus = useCallback(() => {
    return checkRateLimit('order');
  }, []);

  return {
    /** Close a position (fully or partially) */
    closePosition,
    /** Whether a close operation is in progress */
    isClosing,
    /** Check current rate limit status */
    getRateLimitStatus,
  };
};
