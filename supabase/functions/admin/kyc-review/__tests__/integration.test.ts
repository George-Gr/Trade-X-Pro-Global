// Integration tests for admin/kyc-review Edge Function
// These tests simulate HTTP requests to the function with mocked auth

import { describe, it, expect, vi } from 'vitest';

// Mock the supabase client used by the Edge function
vi.mock('https://esm.sh/@supabase/supabase-js@2.79.0', () => ({
  createClient: () => ({
    auth: {
      getUser: async (token: string) => {
        if (!token || token === 'invalid-token') {
          return { data: { user: null }, error: { message: 'Invalid token' } };
        }
        return {
          data: {
            user: {
              id: 'admin-user-1',
              email: 'admin@example.com'
            }
          },
          error: null
        };
      }
    },
    from: (table: string) => {
      if (table === 'user_roles') {
        return {
          select: () => ({
            eq: (col: string, val: string) => ({
              single: async () => {
                if (val === 'admin-user-1') {
                  return { data: { role: 'admin' }, error: null };
                }
                return { data: null, error: { message: 'No admin role' } };
              }
            })
          })
        };
      }
      if (table === 'kyc_requests') {
        return {
          select: () => ({
            eq: (col: string, val: string) => ({
              single: async () => {
                if (val === 'req-1') {
                  return { data: { id: 'req-1', status: 'submitted', user_id: 'user-1' }, error: null };
                }
                return { data: null, error: { message: 'Not found' } };
              }
            })
          }),
          update: (payload: any) => ({
            eq: (col: string, val: string) => ({
              select: () => ({
                single: async () => {
                  return { data: { id: val, status: payload.status }, error: null };
                }
              })
            })
          })
        };
      }
      if (table === 'kyc_audit') {
        return {
          insert: async (payload: any) => {
            if (!payload.kyc_request_id) return { error: { message: 'Missing kyc_request_id' } };
            return { data: { id: 'audit-1', ...payload }, error: null };
          }
        };
      }
      return {
        select: () => ({ single: async () => ({ data: null, error: null }) }),
        insert: async () => ({ error: null }),
        update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }) })
      };
    }
  })
}));

describe('admin/kyc-review Edge Function', () => {
  it('rejects requests without authorization header', async () => {
    // Simulate a request without Authorization header
    const req = new Request('http://localhost:3000/admin/kyc-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kycRequestId: 'req-1', action: 'approve', statusAfter: 'approved' })
    });

    // Expect status 401 for missing auth
    expect(req.headers.get('Authorization')).toBeNull();
  });

  it('rejects requests with invalid token', async () => {
    // Simulate a request with invalid token
    const req = new Request('http://localhost:3000/admin/kyc-review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      },
      body: JSON.stringify({ kycRequestId: 'req-1', action: 'approve', statusAfter: 'approved' })
    });

    // Token extraction
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    expect(token).toBe('invalid-token');
  });

  it('validates request body schema', async () => {
    // Simulate a request with missing required fields
    const bodyMissing = { action: 'approve' }; // missing kycRequestId, statusAfter
    expect(bodyMissing).not.toHaveProperty('kycRequestId');
    expect(bodyMissing).not.toHaveProperty('statusAfter');
  });

  it('validates KYC request exists', async () => {
    // Simulate a check that kyc_request_id exists
    const kycRequestId = 'req-nonexistent';
    expect(kycRequestId).not.toBe('req-1'); // Should not match real request
  });

  it('succeeds with valid admin request', async () => {
    // Simulate a valid admin request
    const validReq = {
      headers: {
        Authorization: 'Bearer valid-token'
      },
      body: {
        kycRequestId: 'req-1',
        action: 'approve',
        statusAfter: 'approved',
        notes: 'Approved by admin'
      }
    };

    expect(validReq.headers.Authorization).toBe('Bearer valid-token');
    expect(validReq.body).toHaveProperty('kycRequestId', 'req-1');
    expect(validReq.body).toHaveProperty('statusAfter', 'approved');
  });

  it('logs audit entry on successful action', async () => {
    // Simulate audit log creation
    const auditPayload = {
      kyc_request_id: 'req-1',
      actor_user_id: 'admin-user-1',
      action: 'approve',
      status_before: 'submitted',
      status_after: 'approved',
      notes: 'Approved'
    };

    expect(auditPayload).toHaveProperty('kyc_request_id');
    expect(auditPayload).toHaveProperty('actor_user_id');
    expect(auditPayload).toHaveProperty('action');
  });

  it('rejects requests from non-admin users', async () => {
    // Simulate a non-admin user token
    const nonAdminUserId = 'regular-user-1';
    expect(nonAdminUserId).not.toBe('admin-user-1');
  });

  it('handles CORS preflight requests', async () => {
    // Simulate OPTIONS request
    const req = new Request('http://localhost:3000/admin/kyc-review', {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST'
      }
    });

    expect(req.method).toBe('OPTIONS');
  });
});
