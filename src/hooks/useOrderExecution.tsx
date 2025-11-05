import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  position_id: string;
  fill_id: string;
  fill_price: number;
  slippage: number;
  commission: number;
  margin_required: number;
  status: string;
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

      console.log('Executing order:', orderRequest);

      // Call edge function
      const { data, error } = await supabase.functions.invoke('execute-order', {
        body: {
          ...orderRequest,
          idempotency_key: idempotencyKey,
        },
      });

      if (error) {
        console.error('Order execution error:', error);
        toast({
          title: "Order Failed",
          description: error.message || "Failed to execute order",
          variant: "destructive",
        });
        return null;
      }

      if (data.error) {
        console.error('Order execution error from server:', data.error);
        toast({
          title: "Order Failed",
          description: data.error,
          variant: "destructive",
        });
        return null;
      }

      console.log('Order executed successfully:', data.data);

      toast({
        title: "Order Executed",
        description: `${orderRequest.side.toUpperCase()} ${orderRequest.quantity} ${orderRequest.symbol} at ${data.data.fill_price}`,
      });

      return data.data as OrderResult;
    } catch (error) {
      console.error('Unexpected error executing order:', error);
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
