import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseBrowserClient";
import { useToast } from "@/hooks/use-toast";
import { rateLimiter, checkRateLimit } from "@/lib/rateLimiter";
import { generateIdempotencyKey, executeWithIdempotency } from "@/lib/idempotency";
import { sanitizeText, sanitizeNumber } from "@/lib/sanitize";
import { logger } from "@/lib/logger";

export interface ClosePositionRequest {
  position_id: string;
  quantity?: number; // Optional - if not provided, closes entire position
}

export interface ClosePositionResult {
  order_id: string;
  fill_id: string;
  position_id: string;
  closed_quantity: number;
  close_price: number;
  realized_pnl: number;
  commission: number;
  margin_released: number;
  lots_closed: Array<{
    lot_id: string;
    quantity_closed: number;
    entry_price: number;
    exit_price: number;
    pnl: number;
  }>;
  position_status: 'closed' | 'partial';
}

export const usePositionClose = () => {
  const [isClosing, setIsClosing] = useState(false);
  const { toast } = useToast();

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

  // Get current rate limit status
  const getRateLimitStatus = useCallback(() => {
    return checkRateLimit('order');
  }, []);

  return {
    closePosition,
    isClosing,
    getRateLimitStatus,
  };
};