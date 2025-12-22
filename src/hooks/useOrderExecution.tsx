import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatToastError } from '@/lib/errorMessageService';
import {
  executeWithIdempotency,
  generateIdempotencyKey,
} from '@/lib/idempotency';
import { logger } from '@/lib/logger';
import { checkRateLimit, rateLimiter } from '@/lib/rateLimiter';
import { sanitizeNumber, sanitizeSymbol } from '@/lib/sanitize';
import { orderSecurity } from '@/lib/security/orderSecurity';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

/**
 * Request payload for executing a trading order
 * @interface OrderRequest
 */
export interface OrderRequest {
  /** Trading symbol (e.g., 'EURUSD', 'AAPL') */
  symbol: string;
  /** Type of order to execute */
  order_type: 'market' | 'limit' | 'stop' | 'stop_limit';
  /** Direction of the trade */
  side: 'buy' | 'sell';
  /** Number of lots to trade */
  quantity: number;
  /** Price for limit/stop orders (optional for market orders) */
  price?: number | undefined;
  /** Stop loss price level */
  stop_loss?: number | undefined;
  /** Take profit price level */
  take_profit?: number | undefined;
}

/**
 * Result returned after successful order execution
 * @interface OrderResult
 */
export interface OrderResult {
  /** Unique identifier of the executed order */
  order_id: string;
  /** Unique identifier of the created position (if executed) */
  position_id?: string;
  /** Trading symbol */
  symbol: string;
  /** Trade direction */
  side: 'buy' | 'sell';
  /** Executed quantity in lots */
  quantity: number;
  /** Actual execution price */
  execution_price: number;
  /** Commission charged */
  commission: number;
  /** Total cost including commission */
  total_cost: number;
  /** Order status */
  status: string;
  /** Timestamp of execution */
  timestamp: string;
}

/**
 * Hook for executing trading orders with built-in rate limiting, idempotency, and error handling.
 *
 * @description
 * This hook provides a secure and reliable way to execute trading orders with:
 * - Rate limiting to prevent excessive order submissions
 * - Idempotency keys to prevent duplicate orders from retries
 * - Input sanitization for security
 * - Comprehensive error handling with user-friendly messages
 * - Automatic cache invalidation for positions and orders
 *
 * @example
 * ```tsx
 * const { executeOrder, isExecuting, getRateLimitStatus } = useOrderExecution();
 *
 * const handleBuy = async () => {
 *   const result = await executeOrder({
 *     symbol: 'EURUSD',
 *     order_type: 'market',
 *     side: 'buy',
 *     quantity: 0.1,
 *     stop_loss: 1.0800,
 *     take_profit: 1.0950
 *   });
 *
 *   if (result) {
 *     console.log('Order executed:', result.order_id);
 *   }
 * };
 * ```
 *
 * @returns {Object} Hook return object
 * @returns {Function} executeOrder - Function to execute an order
 * @returns {boolean} isExecuting - Whether an order is currently being executed
 * @returns {Function} getRateLimitStatus - Function to check current rate limit status
 */
export const useOrderExecution = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize CSRF token
  useEffect(() => {
    const initializeCSRF = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Generate CSRF token for order operations
          const token = orderSecurity.generateCSRFToken({
            userId: session.user.id,
            sessionId: session.access_token,
            orderContext: 'order_execution',
          });
          setCsrfToken(token);
        }
      } catch (error) {
        logger.error('Failed to initialize CSRF token:', error);
      }
    };

    initializeCSRF();
  }, []);

  /**
   * Execute a trading order
   * @param orderRequest - The order parameters
   * @returns Promise resolving to OrderResult on success, null on failure
   */
  const executeOrder = useCallback(
    async (orderRequest: OrderRequest): Promise<OrderResult | null> => {
      // Check rate limit before proceeding
      const rateCheck = checkRateLimit('order');
      if (!rateCheck.allowed) {
        toast({
          title: 'Rate Limit Exceeded',
          description: `Please wait ${Math.ceil(
            rateCheck.resetIn / 1000
          )} seconds before placing another order.`,
          variant: 'destructive',
        });
        logger.warn('Order rate limit exceeded', {
          metadata: {
            remaining: rateCheck.remaining,
            resetIn: rateCheck.resetIn,
          },
        });
        return null;
      }

      setIsExecuting(true);

      try {
        // Get current session first
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast({
            title: 'Authentication Required',
            description: 'Please log in to place orders',
            variant: 'destructive',
          });
          return null;
        }

        // Sanitize inputs
        const sanitizedRequest = {
          ...orderRequest,
          symbol: sanitizeSymbol(orderRequest.symbol),
          quantity: sanitizeNumber(orderRequest.quantity) ?? 0,
          price: orderRequest.price
            ? sanitizeNumber(orderRequest.price)
            : undefined,
          stop_loss: orderRequest.stop_loss
            ? sanitizeNumber(orderRequest.stop_loss)
            : undefined,
          take_profit: orderRequest.take_profit
            ? sanitizeNumber(orderRequest.take_profit)
            : undefined,
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
            price: sanitizedRequest.price,
            stop_loss: sanitizedRequest.stop_loss,
            take_profit: sanitizedRequest.take_profit,
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
                const { data, error } = await supabase.functions.invoke(
                  'execute-order',
                  {
                    body: {
                      ...sanitizedRequest,
                      idempotency_key: idempotencyKey,
                      csrf_token: csrfToken,
                    },
                  }
                );

                if (error) {
                  throw error;
                }

                if (!data.success) {
                  // Pass the structured error directly
                  throw data.error;
                }

                return data;
              }
            );
          },
          10 // High priority for order execution
        );

        // Extract order data from edge function response
        const responseData = result.data;
        const executionResult = responseData.data;

        if (!executionResult || !executionResult.execution_details) {
          throw new Error('Invalid response structure from order execution');
        }

        toast({
          title:
            executionResult.status === 'executed'
              ? 'Order Executed'
              : 'Order Pending',
          description: `${orderRequest.side.toUpperCase()} ${
            orderRequest.quantity
          } ${orderRequest.symbol} at ${
            executionResult.execution_details.execution_price
          }`,
        });

        logger.info('Order executed successfully', {
          metadata: {
            orderId: executionResult.order_id,
            symbol: orderRequest.symbol,
            side: orderRequest.side,
            status: executionResult.status,
          },
        });

        // Invalidate queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ['positions'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });

        return {
          order_id: executionResult.order_id,
          position_id: executionResult.position_id,
          symbol: orderRequest.symbol,
          side: orderRequest.side,
          quantity: orderRequest.quantity,
          execution_price: parseFloat(
            executionResult.execution_details.execution_price
          ),
          commission: parseFloat(executionResult.execution_details.commission),
          total_cost: parseFloat(executionResult.execution_details.total_cost),
          status: executionResult.status,
          timestamp: executionResult.execution_details.timestamp,
        } as OrderResult;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred';

        // Check for duplicate request error
        if (errorMessage.includes('already being processed')) {
          toast({
            title: 'Duplicate Request',
            description: 'This order is already being processed. Please wait.',
            variant: 'destructive',
          });
        } else {
          // Use our enhanced error message service
          const actionableError = formatToastError(error, 'order_submission');
          toast({
            title: actionableError.title,
            description: actionableError.description,
            variant: actionableError.variant,
          });
        }

        logger.error('Order execution failed', error);
        return null;
      } finally {
        setIsExecuting(false);
      }
    },
    [toast, queryClient, csrfToken]
  );

  /**
   * Get the current rate limit status for order submissions
   * @returns Rate limit status including remaining requests and reset time
   */
  const getRateLimitStatus = useCallback(() => {
    return checkRateLimit('order');
  }, []);

  return {
    /** Execute a trading order with full validation and protection */
    executeOrder,
    /** Whether an order is currently being processed */
    isExecuting,
    /** Check current rate limit status */
    getRateLimitStatus,
  };
};
