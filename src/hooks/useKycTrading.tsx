/**
 * Hook: useKycTrading
 *
 * Purpose: Check KYC status and determine if user can trade
 * Task: TASK 1.3.1 - KYC Approval Workflow Integration
 *
 * Features:
 * - Real-time KYC status monitoring
 * - Trading eligibility checks
 * - Approved/rejected/pending status detection
 * - Resubmission eligibility after 7-day waiting period
 * - Recommended actions based on KYC status
 *
 * Returns:
 * {
 *   kycStatus: 'pending' | 'approved' | 'rejected' | 'under_review',
 *   canTrade: boolean,
 *   isApproved: boolean,
 *   isRejected: boolean,
 *   isPending: boolean,
 *   isUnderReview: boolean,
 *   canResubmit: boolean,
 *   daysUntilResubmit: number | null,
 *   rejectionReason: string | null,
 *   rejectedAt: string | null,
 *   approvedAt: string | null,
 *   isLoading: boolean,
 *   error: string | null,
 * }
 */

import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

interface ProfileKycData {
  kyc_status: string | null;
  kyc_rejected_at: string | null;
  kyc_approved_at: string | null;
  kyc_rejection_reason: string | null;
}

// Type guard to validate the payload shape
const isValidProfileKycPayload = (
  payload: unknown
): payload is ProfileKycData => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const obj = payload as Record<string, unknown>;
  const kycStatus = obj.kyc_status;
  const kycRejectedAt = obj.kyc_rejected_at;
  const kycApprovedAt = obj.kyc_approved_at;
  const kycRejectionReason = obj.kyc_rejection_reason;

  return (
    (kycStatus === null || typeof kycStatus === 'string') &&
    (kycRejectedAt === null || typeof kycRejectedAt === 'string') &&
    (kycApprovedAt === null || typeof kycApprovedAt === 'string') &&
    (kycRejectionReason === null || typeof kycRejectionReason === 'string')
  );
};

/**
 * Helper function to calculate resubmit status based on rejection status and date
 */
const calculateResubmitStatus = (
  isRejected: boolean,
  rejectedAt: string | null
): { canResubmit: boolean; daysUntilResubmit: number | null } => {
  let canResubmit = false;
  let daysUntilResubmit: number | null = null;

  if (isRejected && rejectedAt) {
    const rejectedDate = new Date(rejectedAt);
    const resubmitDate = new Date(
      rejectedDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    const now = new Date();

    if (now >= resubmitDate) {
      canResubmit = true;
    } else {
      const daysRemaining = Math.ceil(
        (resubmitDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );
      daysUntilResubmit = daysRemaining;
    }
  }

  return { canResubmit, daysUntilResubmit };
};

interface KycTradingState {
  kycStatus:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'under_review'
    | 'requires_resubmit'
    | 'submitted';
  canTrade: boolean;
  isApproved: boolean;
  isRejected: boolean;
  isPending: boolean;
  isUnderReview: boolean;
  canResubmit: boolean;
  daysUntilResubmit: number | null;
  rejectionReason: string | null;
  rejectedAt: string | null;
  approvedAt: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useKycTrading = (): KycTradingState => {
  const { user } = useAuth();
  const [state, setState] = useState<KycTradingState>({
    kycStatus: 'pending',
    canTrade: false,
    isApproved: false,
    isRejected: false,
    isPending: true,
    isUnderReview: false,
    canResubmit: false,
    daysUntilResubmit: null,
    rejectionReason: null,
    rejectedAt: null,
    approvedAt: null,
    isLoading: true,
    error: null,
  });

  const fetchKycStatus = useCallback(async () => {
    if (!user?.id) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(
          'kyc_status, kyc_rejected_at, kyc_approved_at, kyc_rejection_reason'
        )
        .eq('id', user.id)
        .single();

      if (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to fetch KYC status',
        }));
        return;
      }

      if (!profile) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Profile not found',
        }));
        return;
      }

      // Type-safe mapping from Supabase result to ProfileKycData
      const profileData: ProfileKycData = {
        kyc_status: profile.kyc_status || null,
        kyc_rejected_at: profile.kyc_rejected_at || null,
        kyc_approved_at: profile.kyc_approved_at || null,
        kyc_rejection_reason: profile.kyc_rejection_reason || null,
      };

      // Defensive: Only access properties if profile is not an error
      const kycStatus = profileData.kyc_status || 'pending';
      const isApproved = kycStatus === 'approved';
      const isRejected =
        kycStatus === 'rejected' || kycStatus === 'requires_resubmit';
      const isUnderReview =
        kycStatus === 'under_review' || kycStatus === 'submitted';
      const isPending = kycStatus === 'pending';

      // Calculate days until resubmit allowed (7 days after rejection)
      const { canResubmit, daysUntilResubmit } = calculateResubmitStatus(
        isRejected,
        profileData.kyc_rejected_at
      );

      setState({
        kycStatus: kycStatus as KycTradingState['kycStatus'],
        canTrade: isApproved,
        isApproved,
        isRejected,
        isPending,
        isUnderReview,
        canResubmit,
        daysUntilResubmit,
        rejectionReason: profileData.kyc_rejection_reason || null,
        rejectedAt: profileData.kyc_rejected_at || null,
        approvedAt: profileData.kyc_approved_at || null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, [user?.id]);

  useEffect(() => {
    fetchKycStatus();

    if (!user?.id) return;

    // Subscribe to KYC status changes
    const subscription = supabase
      .channel(`kyc-trading-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload: { new: ProfileKycData; old: ProfileKycData }) => {
          // Validate the payload before treating it as ProfileKycData
          if (!isValidProfileKycPayload(payload.new)) {
            import('@/lib/logger').then(({ logger }) => {
              logger.warn('Invalid KYC payload received', {
                component: 'useKycTrading',
                action: 'realtime_update',
                metadata: { payload: payload.new },
              });
            });
            return;
          }

          const {
            kyc_status,
            kyc_rejected_at,
            kyc_approved_at,
            kyc_rejection_reason,
          } = payload.new;

          if (kyc_status) {
            const status = kyc_status as KycTradingState['kycStatus'];
            const isApproved = status === 'approved';
            const isRejected =
              status === 'rejected' || status === 'requires_resubmit';
            const isUnderReview =
              status === 'under_review' || status === 'submitted';
            const isPending = status === 'pending';

            // Calculate days until resubmit allowed
            const { canResubmit, daysUntilResubmit } = calculateResubmitStatus(
              isRejected,
              kyc_rejected_at
            );

            setState({
              kycStatus: status,
              canTrade: isApproved,
              isApproved,
              isRejected,
              isPending,
              isUnderReview,
              canResubmit,
              daysUntilResubmit,
              rejectionReason: kyc_rejection_reason || null,
              rejectedAt: kyc_rejected_at || null,
              approvedAt: kyc_approved_at || null,
              isLoading: false,
              error: null,
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, fetchKycStatus]);

  return state;
};
