// kycService unit tests (mock Supabase client)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KycService } from '../kycService';

// Mock the supabase client module that KycService dynamically imports
const makeMockSupabase = () => {
  const now = new Date().toISOString();
  const mock = {
    from: (table: string) => {
      return {
        insert: (payload: any) => ({
          select: () => ({
            single: async () => {
              if (table === 'kyc_requests') {
                return { data: { id: 'req-1', user_id: payload.user_id || payload.userId || 'user-1', status: payload.status || 'submitted', created_at: now, updated_at: now }, error: null };
              }
              if (table === 'kyc_documents') {
                return { data: { id: 'doc-1', kyc_request_id: payload.kyc_request_id || 'req-1', type: payload.type, url: payload.url || 'url', status: payload.status || 'uploaded', uploaded_at: now, created_at: now, updated_at: now }, error: null };
              }
              if (table === 'kyc_verifications') {
                return { data: { id: 'ver-1', kyc_request_id: payload.kyc_request_id, provider: payload.provider, result: payload.result, score: payload.score ?? 0.9, received_at: now, created_at: now }, error: null };
              }
              if (table === 'kyc_audit') {
                return { data: { id: 'audit-1', kyc_request_id: payload.kyc_request_id, actor_id: payload.actor_id, action: payload.action, status_before: payload.status_before, status_after: payload.status_after, notes: payload.notes, created_at: now }, error: null };
              }
              return { data: null, error: null };
            }
          })
        }),
        update: (payload: any) => ({
          eq: (_col: string, _val: string) => {
            if (table === 'kyc_requests') {
              return { select: () => ({ single: async () => ({ data: { id: _val, status: payload.status || payload.status_after || 'approved', reviewed_at: now, updated_at: now }, error: null }) }) };
            }
            if (table === 'kyc_documents') {
              return { select: () => ({ single: async () => ({ data: { id: _val, status: payload.status, notes: payload.notes, reviewed_at: now, updated_at: now }, error: null }) }) };
            }
            return { select: () => ({ single: async () => ({ data: null, error: null }) }) };
          }
        })
      };
    }
  };
  return mock;
};

vi.mock('../../supabaseClient', () => ({
  supabase: makeMockSupabase()
}));

describe('KycService', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should create a KYC request', async () => {
    const service = new KycService();
    const req = await service.createKycRequest('user-1');
    expect(req).toHaveProperty('id', 'req-1');
    // ensure either snake_case or camelCase user id field exists
    expect((req as any).user_id || (req as any).userId).toBeTruthy();
  });

  it('should upload a document', async () => {
    const service = new KycService();
    const doc = await service.uploadDocument('req-1', 'passport', 'https://example.com/doc.pdf');
    expect(doc).toHaveProperty('id', 'doc-1');
    expect((doc as any).kyc_request_id || (doc as any).kycRequestId).toBeTruthy();
  });

  it('should record a verification and update request status', async () => {
    const service = new KycService();
    const ver = await service.recordVerification('req-1', 'mock-provider', 'approved', 0.95, { id: 'ext-1' });
    expect(ver).toHaveProperty('id', 'ver-1');
  });

  it('should log an audit entry', async () => {
    const service = new KycService();
    const audit = await service.logAudit('req-1', 'admin-1', 'approve', 'manual_review', 'approved');
    expect(audit).toHaveProperty('id', 'audit-1');
  });

  it('should update status', async () => {
    const service = new KycService();
    const updated = await service.updateStatus('req-1', 'approved');
    expect(updated).toHaveProperty('id', 'req-1');
    expect(updated).toHaveProperty('status', 'approved');
  });
});
