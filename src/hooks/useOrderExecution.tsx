import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getActionableErrorMessage, formatToastError } from "@/lib/errorMessageService";

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

  const executeOrder = async (orderRequest: OrderRequest): Promise<OrderResult | null> => {
    setIsExecuting(true);

    try {
      // Generate idempotency key
      const idempotencyKey = `${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to place orders",
          variant: "destructive",
        });
        return null;
      }

      // Call edge function
      const { data, error } = await supabase.functions.invoke('execute-order', {
        body: {
          ...orderRequest,
          idempotency_key: idempotencyKey,
        },
      });

      if (error) {
        const actionableError = formatToastError(error, 'order_submission');
        toast({
          ...actionableError,
          variant: actionableError.variant as "default" | "destructive"
        });
        return null;
      }

      if (data.error) {
        const actionableError = formatToastError(data.error, 'order_submission');
        toast({
          ...actionableError,
          variant: actionableError.variant as "default" | "destructive"
        });
        return null;
      }

      // Extract order data from edge function response
      const orderData = data.data;
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
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    executeOrder,
    isExecuting,
  };
};
