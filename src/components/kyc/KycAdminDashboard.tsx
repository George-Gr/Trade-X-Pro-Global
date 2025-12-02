// KycAdminDashboard: Comprehensive admin UI for reviewing KYC requests
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseBrowserClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { KycStatistics } from './KycStatistics';
import { KycQueueControls, type FilterStatus } from './KycQueueControls';
import { KycQueueTable } from './KycQueueTable';
import { KycReviewDialog } from './KycReviewDialog';

export interface KycDocument {
  id: string;
  kyc_request_id: string;
  type: string;
  url: string;
  status: string;
  uploaded_at: string;
  reviewed_at?: string | null;
  notes?: string | null;
}

export interface KycRequest {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at?: string;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  provider?: string | null;
  notes?: string | null;
  kyc_documents?: KycDocument[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  kyc_status: string;
}

const KycAdminDashboard: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const [requests, setRequests] = useState<(KycRequest & { userProfile?: UserProfile; kycDocuments?: KycDocument[] })[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<(typeof requests)[0] | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch all KYC requests with related data
  const fetchRequests = useCallback(async () => {
    setError(null);
    setLoadingRequests(true);
    try {
      if (!user || !isAdmin) return;

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        throw new Error('Failed to get user session');
      }

      const { data: requestsData, error: requestsError } = await supabase
        .from('kyc_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (requestsError) throw requestsError;

      // Fetch user profiles for each request
      const enrichedRequests = await Promise.all(
        (requestsData || []).map(async (req) => {
          const r = req as Record<string, unknown>;
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, full_name, phone, kyc_status')
            .eq('id', String(r.user_id))
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
          }

          return {
            ...r,
            userProfile: profile,
            kycDocuments: (r.kyc_documents as KycDocument[]) || [],
          } as KycRequest & { userProfile?: UserProfile; kycDocuments?: KycDocument[] };
        })
      );

      setRequests(enrichedRequests);
    } catch (err: unknown) {
      console.error('Failed to fetch kyc requests', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Failed to fetch requests');
    } finally {
      setLoadingRequests(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!loading && isAdmin && user) {
      fetchRequests();
      // Refresh every 30 seconds
      const interval = setInterval(fetchRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [loading, isAdmin, user, fetchRequests]);

  // Perform admin action
  const performAdminAction = async (
    kycRequestId: string,
    action: 'approve' | 'reject' | 'request_more_info',
    notes?: string
  ) => {
    setError(null);
    setActionLoading(kycRequestId);

    try {
      if (!user || !isAdmin) throw new Error('Admin access required');

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        throw new Error('Failed to get user session token');
      }

      const statusMap = {
        approve: 'approved',
        reject: 'rejected',
        request_more_info: 'submitted',
      };

      const resp = await fetch('/supabase/functions/admin/kyc-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          kycRequestId,
          action,
          statusAfter: statusMap[action],
          notes: notes || `Admin action: ${action}`,
        }),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body?.error || 'Admin action failed');
      }

      // Update local state
      setRequests(prev =>
        prev.map(r =>
          r.id === kycRequestId
            ? { ...r, status: statusMap[action], updated_at: new Date().toISOString() }
            : r
        )
      );

      setSelectedRequest(null);
      setRejectionReason('');
      setAdminNotes('');
    } catch (err: unknown) {
      console.error('Admin action error', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch =
      r.userProfile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userProfile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // Get request statistics
  const stats = {
    pending: requests.filter(r => r.status === 'pending' || r.status === 'submitted').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    manual_review: requests.filter(r => r.status === 'manual_review' || r.status === 'escalated').length,
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!isAdmin) {
    return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>Access denied — admin only.</AlertDescription></Alert>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">KYC Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Review and manage user KYC submissions</p>
      </div>

      {/* Statistics */}
      <KycStatistics
        pending={stats.pending}
        approved={stats.approved}
        rejected={stats.rejected}
        manualReview={stats.manual_review}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* KYC Queue */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Queue</CardTitle>
          <CardDescription>Manage and review KYC submissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <KycQueueControls
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            stats={stats}
            loadingRequests={loadingRequests}
            totalRequests={requests.length}
            onSearchChange={setSearchTerm}
            onStatusChange={setFilterStatus}
            onRefresh={fetchRequests}
          />

          <KycQueueTable
            requests={filteredRequests}
            isLoading={loadingRequests}
            actionLoading={actionLoading}
            selectedRequest={selectedRequest}
            onRequestSelect={setSelectedRequest}
            onReview={setSelectedRequest}
            onApprove={(id, notes) => performAdminAction(id, 'approve', notes)}
            onReject={(id, reason) => performAdminAction(id, 'reject', reason)}
            onRequestMoreInfo={(id, notes) => performAdminAction(id, 'request_more_info', notes)}
          >
            <KycReviewDialog
              request={selectedRequest}
              actionLoading={actionLoading}
              adminNotes={adminNotes}
              rejectionReason={rejectionReason}
              onAdminNotesChange={setAdminNotes}
              onRejectionReasonChange={setRejectionReason}
              onApprove={(id, notes) => performAdminAction(id, 'approve', notes)}
              onReject={(id, reason) => performAdminAction(id, 'reject', reason)}
              onRequestMoreInfo={(id, notes) => performAdminAction(id, 'request_more_info', notes)}
              onPreviewDocument={setPreviewUrl}
            />
          </KycQueueTable>
        </CardContent>
      </Card>

      {/* Document Preview Modal */}
      {previewUrl && (
        <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-[90vw] md:max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Document Preview</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center items-center min-h-[400px] bg-muted rounded-lg">
              {previewUrl.endsWith('.pdf') ? (
                <embed src={previewUrl} type="application/pdf" width="100%" height="600" />
              ) : (
                <img src={previewUrl} alt="Document preview" className="max-w-full max-h-[60vh] object-contain" />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default KycAdminDashboard;
