import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef, useState } from 'react';

export interface RiskEvent {
  id: string;
  event_type: string;
  severity: string;
  description: string;
  details?: unknown;
  resolved: boolean;
  created_at: string;
}

export const useRiskEvents = (limit = 5) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('risk_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        const { logger } = await import('@/lib/logger');
        logger.error('Failed to fetch risk events', error, {
          component: 'useRiskEvents',
          action: 'fetch_events',
          metadata: { userId: user.id },
        });
        if (mounted) setEvents([]);
      } else {
        if (mounted) setEvents((data as RiskEvent[]) || []);
      }
      if (mounted) setLoading(false);
    };

    fetchEvents();

    channelRef.current = supabase
      .channel(`risk-events:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'risk_events',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { new: RiskEvent; old?: RiskEvent | null }) => {
          setEvents((prev) =>
            [payload.new as RiskEvent, ...prev].slice(0, limit)
          );
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      try {
        channelRef.current?.unsubscribe();
        channelRef.current = null;
      } catch (err) {
        // ignore
      }
    };
  }, [user, limit]);

  return { events, loading };
};

export default useRiskEvents;
