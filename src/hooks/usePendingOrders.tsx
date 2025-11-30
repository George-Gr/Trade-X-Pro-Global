import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseBrowserClient";
import { useToast } from "@/hooks/use-toast";

export interface PendingOrder {
  id: string;
  symbol: string;
  order_type: 'market' | 'limit' | 'stop' | 'stop_limit';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  stop_loss?: number;
  take_profit?: number;
  status: string;
  created_at: string;
}

export const usePendingOrders = () => {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .in("order_type", ["limit", "stop", "stop_limit"])
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setOrders(data || []);
    } catch (err: unknown) {
      // Error fetching pending orders
      setError(err instanceof Error ? err.message : "Failed to fetch pending orders");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-order', {
        body: { order_id: orderId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully",
      });

      await fetchPendingOrders();
      return true;
    } catch (err) {
      // Error cancelling order
      toast({
        title: "Cancellation Failed",
        description: err instanceof Error ? err.message : "Failed to cancel order",
        variant: "destructive",
      });
      return false;
    }
  };

  const modifyOrder = async (orderId: string, updates: { quantity?: number; price?: number; stop_loss?: number; take_profit?: number }) => {
    try {
      const { data, error } = await supabase.functions.invoke('modify-order', {
        body: { order_id: orderId, ...updates },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Order Modified",
        description: "Your order has been updated successfully",
      });

      await fetchPendingOrders();
      return true;
    } catch (err) {
      // Error modifying order
      toast({
        title: "Modification Failed",
        description: err instanceof Error ? err.message : "Failed to modify order",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPendingOrders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('pending-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchPendingOrders();
        }
      )
      .subscribe();

    return () => {
      // Properly unsubscribe from channel before removing to prevent memory leaks
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    orders,
    loading,
    error,
    refresh: fetchPendingOrders,
    cancelOrder,
    modifyOrder,
  };
};
