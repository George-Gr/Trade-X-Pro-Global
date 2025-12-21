import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect, useRef, useState } from 'react';

interface PriceAlert {
  id: string;
  symbol: string;
  target_price: number;
  condition: string;
  triggered: boolean;
  created_at: string;
  triggered_at: string | null;
}

interface UsePriceAlertsReturn {
  alerts: PriceAlert[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing price alerts with real-time updates
 *
 * Fetches and manages price alerts for the authenticated user with automatic
 * real-time updates through Supabase Realtime subscriptions. Provides
 * comprehensive alert management including fetching, refreshing, and error handling.
 *
 * @returns {UsePriceAlertsReturn} Object containing:
 *   - alerts: PriceAlert[] - Array of user's price alerts sorted by creation time
 *   - loading: boolean - Loading state during data fetch
 *   - error: string | null - Error message if data fetching fails
 *   - refresh: () => Promise<void> - Function to manually refresh alerts
 *
 * @example
 * ```tsx
 * const { alerts, loading, error, refresh } = usePriceAlerts();
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 *
 * return (
 *   <div>
 *     <h3>Active Alerts: {alerts.length}</h3>
 *     {alerts.map(alert => (
 *       <AlertCard key={alert.id} alert={alert} />
 *     ))}
 *     <button onClick={refresh}>Refresh Alerts</button>
 *   </div>
 * );
 * ```
 *
 * @sideEffects
 * - Automatically subscribes to Supabase Realtime channel for 'price_alerts' table
 * - Subscriptions are automatically cleaned up when component unmounts
 * - Real-time updates trigger automatic alert list refresh
 *
 * @see UsePriceAlertsReturn - Type definition for return object
 * @see PriceAlert - Alert interface definition
 */
export const usePriceAlerts = (): UsePriceAlertsReturn => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        setAlerts([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('price_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setAlerts(data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const channelRef = useRef<
    import('@supabase/supabase-js').RealtimeChannel | null
  >(null);

  useEffect(() => {
    // Get current user first
    const setupRealtimeSubscription = async () => {
      try {
        const {
          data: { user: currentUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !currentUser) {
          return;
        }

        fetchAlerts();

        // Subscribe to real-time updates scoped to current user
        channelRef.current = supabase
          .channel(`price_alerts_changes_${currentUser.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'price_alerts',
              filter: `user_id=eq.${currentUser.id}`,
            },
            () => {
              fetchAlerts();
            }
          );

        // Ensure the channel is subscribed
        try {
          if (
            channelRef.current &&
            typeof channelRef.current.subscribe === 'function'
          ) {
            channelRef.current.subscribe();
          }
        } catch (e) {
          // ignore subscribe errors
        }
      } catch (error) {
        // Handle setup errors silently
        console.error('Error setting up realtime subscription:', error);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        try {
          if (typeof channelRef.current.unsubscribe === 'function') {
            channelRef.current.unsubscribe();
          } else {
            supabase.removeChannel(channelRef.current);
          }
        } catch {
          try {
            supabase.removeChannel(channelRef.current);
          } catch {
            // no-op
          }
        }
        channelRef.current = null;
      }
    };
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    refresh: fetchAlerts,
  };
};
