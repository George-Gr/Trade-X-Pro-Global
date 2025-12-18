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

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/lib/supabaseBrowserClient";

interface KycTradingState {
  kycStatus:
    | "pending"
    | "approved"
    | "rejected"
    | "under_review"
    | "requires_resubmit"
    | "submitted";
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
    kycStatus: "pending",
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
        .from("profiles")
        .select(
          "kyc_status, kyc_rejected_at, kyc_approved_at, kyc_rejection_reason",
        )
        .eq("id", user.id)
        .single();

      if (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || "Failed to fetch KYC status",
        }));
        return;
      }

      if (!profile) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Profile not found",
        }));
        return;
      }

      // Defensive: Only access properties if profile is not an error
      const kycStatus =
        (profile as unknown as Record<string, unknown>).kyc_status || "pending";
      const isApproved = kycStatus === "approved";
      const isRejected =
        kycStatus === "rejected" || kycStatus === "requires_resubmit";
      const isUnderReview =
        kycStatus === "under_review" || kycStatus === "submitted";
      const isPending = kycStatus === "pending";

      // Calculate days until resubmit allowed (7 days after rejection)
      let canResubmit = false;
      let daysUntilResubmit: number | null = null;

      if (
        isRejected &&
        (profile as unknown as Record<string, unknown>).kyc_rejected_at
      ) {
        const rejectedDate = new Date(
          (profile as unknown as Record<string, unknown>)
            .kyc_rejected_at as string,
        );
        const resubmitDate = new Date(
          rejectedDate.getTime() + 7 * 24 * 60 * 60 * 1000,
        );
        const now = new Date();

        if (now >= resubmitDate) {
          canResubmit = true;
        } else {
          const daysRemaining = Math.ceil(
            (resubmitDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
          );
          daysUntilResubmit = daysRemaining;
        }
      }

      setState({
        kycStatus: kycStatus as KycTradingState["kycStatus"],
        canTrade: isApproved,
        isApproved,
        isRejected,
        isPending,
        isUnderReview,
        canResubmit,
        daysUntilResubmit,
        rejectionReason:
          ((profile as unknown as Record<string, unknown>)
            .kyc_rejection_reason as string) || null,
        rejectedAt:
          ((profile as unknown as Record<string, unknown>)
            .kyc_rejected_at as string) || null,
        approvedAt:
          ((profile as unknown as Record<string, unknown>)
            .kyc_approved_at as string) || null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Unknown error",
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
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const {
            kyc_status,
            kyc_rejected_at,
            kyc_approved_at,
            kyc_rejection_reason,
          } = (payload.new as Record<string, unknown>) || {};

          if (kyc_status) {
            const status = kyc_status as KycTradingState["kycStatus"];
            const isApproved = status === "approved";
            const isRejected =
              status === "rejected" || status === "requires_resubmit";
            const isUnderReview =
              status === "under_review" || status === "submitted";
            const isPending = status === "pending";

            // Calculate days until resubmit allowed
            let canResubmit = false;
            let daysUntilResubmit: number | null = null;

            if (isRejected && kyc_rejected_at) {
              const rejectedDate = new Date(kyc_rejected_at as string);
              const resubmitDate = new Date(
                rejectedDate.getTime() + 7 * 24 * 60 * 60 * 1000,
              );
              const now = new Date();

              if (now >= resubmitDate) {
                canResubmit = true;
              } else {
                const daysRemaining = Math.ceil(
                  (resubmitDate.getTime() - now.getTime()) /
                    (24 * 60 * 60 * 1000),
                );
                daysUntilResubmit = daysRemaining;
              }
            }

            setState({
              kycStatus: status,
              canTrade: isApproved,
              isApproved,
              isRejected,
              isPending,
              isUnderReview,
              canResubmit,
              daysUntilResubmit,
              rejectionReason: (kyc_rejection_reason as string) || null,
              rejectedAt: (kyc_rejected_at as string) || null,
              approvedAt: (kyc_approved_at as string) || null,
              isLoading: false,
              error: null,
            });
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, fetchKycStatus]);

  return state;
};
