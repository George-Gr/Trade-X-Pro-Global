import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { useEffect, useRef } from 'react';

// Debug flag for realtime logging - ensures no debug code in production bundles
const DEBUG_REALTIME = process.env.NODE_ENV === 'development';

/**
 * Custom hook for managing Supabase realtime subscriptions for leads table
 * @param callback - Function to call when leads change
 * @param deps - Optional dependency array for when to trigger subscription
 */
export const useRealtimeLeads = (
  callback: () => void,
  deps: unknown[] = []
) => {
  // Use ref to store channel reference for proper lifecycle cleanup
  const channelRef = useRef<
    import('@supabase/supabase-js').RealtimeChannel | null
  >(null);
  // Use ref to store callback to prevent subscription recreation
  const callbackRef = useRef<() => void>(callback);

  // Update callback ref when callback changes (sync effect)
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    callbackRef.current();

    // Subscribe to leads changes and store in ref
    channelRef.current = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload: Record<string, unknown>) => {
          // Debug logging only in development - no debug in production
          if (DEBUG_REALTIME) {
            logger.debug('Lead change', {
              metadata: {
                event: payload.event,
                table: payload.table,
                schema: payload.schema,
                // Intentionally excluding sensitive payload data
              },
            });
          }
          callbackRef.current();
        }
      )
      .subscribe();

    return () => {
      // Use ref for cleanup with proper type safety
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);
};
