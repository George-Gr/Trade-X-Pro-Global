import { describe, it, expect, vi } from 'vitest';
import performAdminReview from '../adminReview';

function makeMockSupabase({ requestExists = true, updateSucceeds = true, auditSucceeds = true } = {}) {
  const rows: Record<string, any> = {};
  if (requestExists) {
    rows['kyc_requests'] = { id: 'req-1', status: 'manual_review', user_id: 'user-1' };
  }

  return {
    from: (table: string) => ({
      select: (_cols: string) => ({
        eq: (_col: string, _val: string) => ({
          single: async () => {
            if (table === 'kyc_requests') {
              if (!requestExists) return { data: null, error: { message: 'not found' } };
              return { data: rows['kyc_requests'], error: null };
            }
            if (table === 'kyc_audit') {
              return { data: null, error: auditSucceeds ? null : { message: 'insert failed' } };
            }
            if (table === 'user_roles') {
              return { data: { role: 'admin' }, error: null };
            }
            return { data: null, error: null };
          }
        })
      }),
      update: (_payload: any) => ({
        eq: async (_col: string, _val: string) => {
          if (!updateSucceeds) return { error: { message: 'update failed' } };
          return { error: null };
        }
      }),
      insert: async (_payload: any) => {
        if (!auditSucceeds) return { error: { message: 'insert failed' } };
        return { error: null };
      }
    })
  };
}

describe('performAdminReview', () => {
  it('updates status and writes audit on success', async () => {
    const supabase = makeMockSupabase({ requestExists: true, updateSucceeds: true, auditSucceeds: true });

    const res = await performAdminReview({
      supabaseClient: supabase as any,
      actorId: 'admin-1',
      kycRequestId: 'req-1',
      statusAfter: 'approved',
      action: 'approve',
      notes: 'Looks good'
    });

    expect(res).toHaveProperty('success', true);
    expect(res).toHaveProperty('kycRequestId', 'req-1');
    expect(res).toHaveProperty('statusBefore', 'manual_review');
    expect(res).toHaveProperty('statusAfter', 'approved');
  });

  it('throws when kyc request not found', async () => {
    const supabase = makeMockSupabase({ requestExists: false });

    await expect(
      performAdminReview({
        supabaseClient: supabase as any,
        actorId: 'admin-1',
        kycRequestId: 'req-unknown',
        statusAfter: 'approved',
        action: 'approve'
      })
    ).rejects.toThrow('KYC request not found');
  });

  it('throws when update fails', async () => {
    const supabase = makeMockSupabase({ requestExists: true, updateSucceeds: false });

    await expect(
      performAdminReview({
        supabaseClient: supabase as any,
        actorId: 'admin-1',
        kycRequestId: 'req-1',
        statusAfter: 'rejected',
        action: 'reject'
      })
    ).rejects.toThrow('Failed to update KYC request status');
  });
});
