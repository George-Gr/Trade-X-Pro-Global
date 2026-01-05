import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { useEffect } from 'react';

/**
 * Custom hook for managing Supabase realtime subscriptions for leads table
 * @param callback - Function to call when leads change
 * @param deps - Optional dependency array for when to trigger subscription
 */
export const useRealtimeLeads = (
  callback: () => void,
  deps: unknown[] = []
) => {
  useEffect(() => {
    callback();

    // Subscribe to leads changes
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload: Record<string, unknown>) => {
          logger.debug('Lead change', { metadata: payload });
          callback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...deps]);
};
