import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';

/**
 * Hook for real-time profile updates
 * Subscribes to profile changes and calls the provided callback
 *
 * @param userId - User ID to filter profiles
 * @param onProfileChange - Callback to execute when profile changes (must be memoized with useCallback)
 */
export const useRealtimeProfile = (
  userId: string | undefined,
  onProfileChange: () => void
) => {
  const callbackRef = useRef(onProfileChange);

  useEffect(() => {
    callbackRef.current = onProfileChange;
  });

  useEffect(() => {
    if (!userId) return;

    // Set up real-time subscription for profile changes
    const profileChannel = supabase
      .channel(`trading-profile-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        () => {
          callbackRef.current();
        }
      )
      .subscribe();

    return () => {
      profileChannel.unsubscribe();
      supabase.removeChannel(profileChannel);
    };
  }, [userId]);
};
