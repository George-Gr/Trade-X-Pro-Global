// KycAdminDashboard: Admin UI for reviewing KYC requests
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type KycRequestRow = {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at?: string;
  metadata?: any;
};

const KycAdminDashboard: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const [requests, setRequests] = useState<KycRequestRow[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAdmin) {
      fetchRequests();
    }
  }, [loading, isAdmin]);

  const fetchRequests = async () => {
    setError(null);
    setLoadingRequests(true);
    try {
      const { data, error } = await supabase
        .from('kyc_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setRequests(data as KycRequestRow[]);
    } catch (err: any) {
      console.error('Failed to fetch kyc requests', err);
      setError(err?.message || 'Failed to fetch requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const performAction = async (kycRequestId: string, action: 'approve' | 'reject' | 'escalate') => {
    setError(null);
    setActionLoading(kycRequestId);
    try {
      if (!user) throw new Error('No user session');
      if (!isAdmin) throw new Error('Forbidden');

      const statusAfter = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'manual_review';

      // Get the user's access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        throw new Error('Failed to get user session token');
      }

      const resp = await fetch('/supabase/functions/admin/kyc-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ kycRequestId, action, statusAfter, notes: `Admin action: ${action}` }),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body?.error || 'Admin action failed');
      }

      // update local list
      setRequests((prev) => prev.map((r) => (r.id === kycRequestId ? { ...r, status: statusAfter } : r)));
    } catch (err: any) {
      console.error('Admin action error', err);
      setError(err?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div>Loading auth...</div>;
  if (!isAdmin) return <div>Access denied — admin only.</div>;

  return (
    <div>
      <h1>KYC Admin Dashboard</h1>
      {error && <div style={{ color: 'red' }}><strong>Error:</strong> {error}</div>}

      <div style={{ marginTop: 12 }}>
        <button onClick={fetchRequests} disabled={loadingRequests}>Refresh</button>
      </div>

      <div style={{ marginTop: 12 }}>
        {loadingRequests ? (
          <div>Loading requests…</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: 8 }}>{r.id}</td>
                  <td style={{ padding: 8 }}>{r.user_id}</td>
                  <td style={{ padding: 8 }}>{r.status}</td>
                  <td style={{ padding: 8 }}>{new Date(r.created_at).toLocaleString()}</td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => performAction(r.id, 'approve')} disabled={actionLoading === r.id}>Approve</button>
                    <button onClick={() => performAction(r.id, 'reject')} disabled={actionLoading === r.id} style={{ marginLeft: 8 }}>Reject</button>
                    <button onClick={() => performAction(r.id, 'escalate')} disabled={actionLoading === r.id} style={{ marginLeft: 8 }}>Escalate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default KycAdminDashboard;
