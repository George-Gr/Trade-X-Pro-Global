/**
 * Hook: useKycNotifications
 *
 * Purpose: Listen for KYC status changes and send notifications
 * Task: TASK 1.3.3 - KYC Notification System
 *
 * Features:
 * - Toast notifications on approval/rejection
 * - In-app notification center integration
 * - Email notification placeholders
 * - Clear action messages
 */

import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { supabase } from '@/lib/supabaseBrowserClient';

interface NotificationPayload {
  kyc_status?: string;
  kyc_rejection_reason?: string;
  kyc_approved_at?: string;
  kyc_rejected_at?: string;
}

export const useKycNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const lastStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Get initial KYC status
    const getInitialStatus = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('kyc_status')
        .eq('id', user.id)
        .single();

      if (data) {
        lastStatusRef.current = data.kyc_status;
      }
    };

    getInitialStatus();

    // Subscribe to profile changes
    const subscription = supabase
      .channel(`kyc-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newData = payload.new as NotificationPayload;
          const oldStatus = lastStatusRef.current;
          const newStatus = newData.kyc_status;

          // Only process if status changed
          if (newStatus && newStatus !== oldStatus) {
            lastStatusRef.current = newStatus;

            // Send appropriate notification based on new status
            if (newStatus === 'approved') {
              toast({
                title: '✅ KYC Approved!',
                description: 'Your identity has been verified. You can now trade with full access.',
                duration: 5000,
              });

              // Create in-app notification (store in notifications table)
              createKycNotification(user.id, 'KYC Approved', 'Your account is now fully verified and trading is enabled.', 'approval');
            } else if (newStatus === 'rejected' || newStatus === 'requires_resubmit') {
              const reason = newData.kyc_rejection_reason || 'Document verification failed';
              toast({
                title: '❌ KYC Rejected',
                description: reason,
                variant: 'destructive',
                duration: 5000,
              });

              // Create in-app notification
              createKycNotification(
                user.id,
                'KYC Rejected',
                `Your submission was not approved. Reason: ${reason}. You can resubmit after 7 days.`,
                'rejection'
              );
            } else if (newStatus === 'submitted' || newStatus === 'under_review') {
              toast({
                title: '⏳ Under Review',
                description: 'Your KYC documents have been received and are under review.',
                duration: 5000,
              });

              // Create in-app notification
              createKycNotification(
                user.id,
                'KYC Under Review',
                'Your documents are being reviewed. This typically takes 24-48 hours.',
                'info'
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, toast]);
};

/**
 * Create an in-app notification via edge function
 */
async function createKycNotification(
  userId: string,
  title: string,
  message: string,
  type: 'approval' | 'rejection' | 'info'
) {
  try {
    await supabase.functions.invoke('send-notification', {
      body: {
        user_id: userId,
        title,
        message,
        type: `kyc_${type}`,
      }
    });
  } catch (err) {
    console.error('Failed to create KYC notification:', err);
  }
}
