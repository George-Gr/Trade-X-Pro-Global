import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';

/**
 * Hook for real-time order updates
 * Subscribes to order changes and calls the provided callback
 *
 * @param userId - User ID to filter orders
 * @param onOrderChange - Callback to execute when orders change (must be memoized with useCallback)
 */
export const useRealtimeOrders = (
  userId: string | undefined,
  onOrderChange: () => void
) => {
  const callbackRef = useRef(onOrderChange);

  useEffect(() => {
    callbackRef.current = onOrderChange;
  });

  useEffect(() => {
    if (!userId) return;

    // Set up real-time subscription for order changes
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          callbackRef.current();
        }
      )
      .subscribe();

    return () => {
      ordersChannel.unsubscribe();
      supabase.removeChannel(ordersChannel);
    };
  }, [userId]);
};
