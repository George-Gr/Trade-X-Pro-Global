import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseBrowserClient";
import { useToast } from "@/hooks/use-toast";
import { getActionableErrorMessage, formatToastError } from "@/lib/errorMessageService";
import { rateLimiter, checkRateLimit } from "@/lib/rateLimiter";
import { generateIdempotencyKey, executeWithIdempotency } from "@/lib/idempotency";
import { sanitizeSymbol, sanitizeNumber } from "@/lib/sanitize";
import { logger } from "@/lib/logger";

export interface OrderRequest {
  symbol: string;
  order_type: 'market' | 'limit' | 'stop' | 'stop_limit';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  stop_loss?: number;
  take_profit?: number;
}

export interface OrderResult {
  order_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  execution_price: number;
  fill_price: number;
  commission: number;
  margin_required: number;
  status: string;
  new_balance: number;
  new_margin_level: number;
}

export const useOrderExecution = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const executeOrder = useCallback(async (orderRequest: OrderRequest): Promise<OrderResult | null> => {
    // Check rate limit before proceeding
    const rateCheck = checkRateLimit('order');
    if (!rateCheck.allowed) {
      toast({
        title: "Rate Limit Exceeded",
        description: `Please wait ${Math.ceil(rateCheck.resetIn / 1000)} seconds before placing another order.`,
        variant: "destructive",
      });
      logger.warn('Order rate limit exceeded', { 
        metadata: { remaining: rateCheck.remaining, resetIn: rateCheck.resetIn } 
      });
      return null;
    }

    setIsExecuting(true);

    try {
      // Get current session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to place orders",
          variant: "destructive",
        });
        return null;
      }

      // Sanitize inputs
      const sanitizedRequest = {
        ...orderRequest,
        symbol: sanitizeSymbol(orderRequest.symbol),
        quantity: sanitizeNumber(orderRequest.quantity) ?? 0,
        price: orderRequest.price ? sanitizeNumber(orderRequest.price) : undefined,
        stop_loss: orderRequest.stop_loss ? sanitizeNumber(orderRequest.stop_loss) : undefined,
        take_profit: orderRequest.take_profit ? sanitizeNumber(orderRequest.take_profit) : undefined,
      };

      // Generate idempotency key based on order parameters
      const idempotencyKey = generateIdempotencyKey(
        session.user.id,
        'execute_order',
        {
          symbol: sanitizedRequest.symbol,
          side: sanitizedRequest.side,
          quantity: sanitizedRequest.quantity,
          order_type: sanitizedRequest.order_type,
        }
      );

      // Execute with rate limiting and idempotency protection
      const result = await rateLimiter.execute(
        'order',
        async () => {
          return executeWithIdempotency(
            idempotencyKey,
            'execute-order',
            async () => {
              const { data, error } = await supabase.functions.invoke('execute-order', {
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
        10 // High priority for order execution
      );

      // Extract order data from edge function response
      const orderData = result.data;
      if (!orderData || !orderData.success) {
        toast({
          title: "Order Failed",
          description: orderData?.error || "Order execution failed",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Order Executed",
        description: `${orderRequest.side.toUpperCase()} ${orderRequest.quantity} ${orderRequest.symbol} at ${orderData.execution_price.toFixed(4)}`,
      });

      logger.info('Order executed successfully', {
        metadata: {
          orderId: orderData.order_id,
          symbol: orderData.symbol,
          side: orderData.side,
        },
      });

      return {
        order_id: orderData.order_id,
        symbol: orderData.symbol,
        side: orderData.side,
        quantity: orderData.quantity,
        execution_price: parseFloat(orderData.execution_price),
        fill_price: parseFloat(orderData.fill_price),
        commission: parseFloat(orderData.commission),
        margin_required: parseFloat(orderData.margin_required),
        status: orderData.status,
        new_balance: parseFloat(orderData.new_balance),
        new_margin_level: parseFloat(orderData.new_margin_level),
      } as OrderResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Check for duplicate request error
      if (errorMessage.includes('already being processed')) {
        toast({
          title: "Duplicate Request",
          description: "This order is already being processed. Please wait.",
          variant: "destructive",
        });
      } else {
        const actionableError = formatToastError(error, 'order_submission');
        toast({
          ...actionableError,
          variant: actionableError.variant as "default" | "destructive"
        });
      }
      
      logger.error('Order execution failed', error);
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, [toast]);

  // Get current rate limit status
  const getRateLimitStatus = useCallback(() => {
    return checkRateLimit('order');
  }, []);

  return {
    executeOrder,
    isExecuting,
    getRateLimitStatus,
  };
};
