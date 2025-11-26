import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseBrowserClient';
import { useToast } from './use-toast';
import { type Database } from '@/integrations/supabase/types';

export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
export type OrderSide = 'buy' | 'sell';

export interface OrderTableItem {
  id: string;
  user_id?: string;
  symbol: string;
  type: OrderType;
  side: OrderSide;
  quantity: number;
  filled_quantity: number;
  price?: number | null;
  limit_price?: number | null;
  stop_price?: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  average_fill_price?: number | null;
  commission?: number | null;
  slippage?: number | null;
  realized_pnl?: number | null;
}

// Database order interface
interface DatabaseOrder {
  id: string | number;
  user_id: string | number;
  symbol: string;
  order_type: OrderType;
  side: OrderSide;
  quantity: number | string;
  price?: number | string | null;
  status: string;
  created_at: string;
  fill_price?: number | string | null;
  commission?: number | string | null;
  filled_at?: string | null;
  stop_loss?: number | string | null;
  take_profit?: number | string | null;
  idempotency_key?: string;
}

export interface UseOrdersTableOptions {
  initialStatus?: string | 'all';
}

export const useOrdersTable = (options?: UseOrdersTableOptions) => {
  const [orders, setOrders] = useState<OrderTableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Map database orders to OrderTableItem format
      const mappedOrders: OrderTableItem[] = (data || []).map((order: Database["public"]["Tables"]["orders"]["Row"]) => ({
        id: typeof order.id === 'string' ? order.id : String(order.id ?? ''),
        user_id: typeof order.user_id === 'string' ? order.user_id : String(order.user_id ?? ''),
        symbol: typeof order.symbol === 'string' ? order.symbol : String(order.symbol ?? ''),
        type: order.order_type as OrderType,
        side: order.side as OrderSide,
        quantity: typeof order.quantity === 'number' ? order.quantity : Number(order.quantity ?? 0),
        filled_quantity: 0, // TODO: Calculate from fills table
        price: typeof order.price === 'number' ? order.price : null,
        limit_price: typeof order.price === 'number' ? order.price : null,
        stop_price: typeof order.price === 'number' ? order.price : null,
        status: typeof order.status === 'string' ? order.status : String(order.status ?? ''),
        created_at: typeof order.created_at === 'string' ? order.created_at : String(order.created_at ?? ''),
        updated_at: typeof order.updated_at === 'string' ? order.updated_at : String(order.updated_at ?? ''),
        average_fill_price: typeof order.fill_price === 'number' ? order.fill_price : null,
        commission: typeof order.commission === 'number' ? order.commission : null,
        slippage: null,
        realized_pnl: null,
      }));

      setOrders(mappedOrders);
    } catch (err) {
       setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
     } finally {
       setLoading(false);
     }
   }, []);  const cancelOrder = useCallback(async (orderId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-order', {
        body: { order_id: orderId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: 'Order cancelled', description: 'Order cancelled successfully' });
      await fetchOrders();
      return true;
     } catch (err) {
       // Cancel error silently handled
       toast({
         title: 'Cancellation failed',
         description: err instanceof Error ? err.message : 'Failed to cancel order',
         variant: 'destructive',
       });
       return false;
     }
   }, [fetchOrders, toast]);  const modifyOrder = useCallback(async (orderId: string, updates: Record<string, unknown>) => {
    try {
      const { data, error } = await supabase.functions.invoke('modify-order', {
        body: { order_id: orderId, ...updates },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: 'Order modified', description: 'Order updated successfully' });
      await fetchOrders();
      return true;
     } catch (err) {
       // Modify error silently handled
       toast({
         title: 'Modification failed',
         description: err instanceof Error ? err.message : 'Failed to modify order',
         variant: 'destructive',
       });
       return false;
     }
   }, [fetchOrders, toast]);  useEffect(() => {
    fetchOrders();

    // subscribe to real-time changes on orders for current user
    const channel = supabase
      .channel('orders-table-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        // simple approach: refetch on any change
        void fetchOrders();
      })
      .subscribe();

    return () => {
      // Properly unsubscribe from channel before removing to prevent memory leaks
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders,
    cancelOrder,
    modifyOrder,
  } as const;
};

export default useOrdersTable;
