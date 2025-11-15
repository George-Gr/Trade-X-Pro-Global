import type { SupabaseClient } from '@supabase/supabase-js';

export type AdminReviewParams = {
  supabaseClient: SupabaseClient;
  actorId: string;
  kycRequestId: string;
  statusAfter: string;
  action: string;
  notes?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function performAdminReview(params: AdminReviewParams) {
  const { supabaseClient, actorId, kycRequestId, statusAfter, action, notes, ipAddress, userAgent } = params;

  // Fetch current request to capture statusBefore and basic validation
  const { data: current, error: fetchErr } = await supabaseClient
    .from('kyc_requests')
    .select('id, status, user_id')
    .eq('id', kycRequestId)
    .single();

  if (fetchErr || !current) {
    throw new Error('KYC request not found');
  }

  const statusBefore = current.status as string;

  // Start a transaction-like sequence (note: Supabase JS doesn't support multi-statement transactions client-side; rely on DB constraints in prod)
  const { error: updateErr } = await supabaseClient
    .from('kyc_requests')
    .update({ status: statusAfter, updated_at: new Date().toISOString() })
    .eq('id', kycRequestId);

  if (updateErr) {
    throw new Error('Failed to update KYC request status');
  }

  const auditPayload = {
    kyc_request_id: kycRequestId,
    actor_user_id: actorId,
    action,
    status_before: statusBefore,
    status_after: statusAfter,
    notes: notes ?? null,
    ip_address: ipAddress ?? null,
    user_agent: userAgent ?? null,
    created_at: new Date().toISOString()
  };

  const { error: auditErr } = await supabaseClient.from('kyc_audit').insert(auditPayload);

  if (auditErr) {
    // Log the audit failure but don't roll back the status change (we try to preserve the admin action)
    console.error('Failed to write audit entry', auditErr);
  }

  return {
    success: true,
    kycRequestId,
    statusBefore,
    statusAfter
  };
}

export default performAdminReview;
