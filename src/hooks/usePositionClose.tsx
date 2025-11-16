import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  const closePosition = async (request: ClosePositionRequest): Promise<ClosePositionResult | null> => {
    setIsClosing(true);

    try {
      // Generate idempotency key
      const idempotencyKey = `close_${Date.now()}_${Math.random().toString(36).substring(7)}`;

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

      // Call edge function
      const { data, error } = await supabase.functions.invoke('close-position', {
        body: {
          ...request,
          idempotency_key: idempotencyKey,
        },
      });

      if (error) {
        toast({
          title: "Close Failed",
          description: error.message || "Failed to close position",
          variant: "destructive",
        });
        return null;
      }

      if (data.error) {
        toast({
          title: "Close Failed",
          description: data.error,
          variant: "destructive",
        });
        return null;
      }

      const result = data.data as ClosePositionResult;
      const pnlText = result.realized_pnl >= 0 
        ? `+$${result.realized_pnl.toFixed(2)}` 
        : `-$${Math.abs(result.realized_pnl).toFixed(2)}`;

      toast({
        title: "Position Closed",
        description: `Closed ${result.closed_quantity} lots at ${result.close_price}. P&L: ${pnlText}`,
        variant: result.realized_pnl >= 0 ? "default" : "destructive",
      });

      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsClosing(false);
    }
  };

  return {
    closePosition,
    isClosing,
  };
};