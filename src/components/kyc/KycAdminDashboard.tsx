// KycAdminDashboard: Comprehensive admin UI for reviewing KYC requests
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseBrowserClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, ChevronDown, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';

interface KycDocument {
  id: string;
  kyc_request_id: string;
  type: string;
  url: string;
  status: string;
  uploaded_at: string;
  reviewed_at?: string | null;
  notes?: string | null;
}

interface KycRequest {
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

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  kyc_status: string;
}

type FilterStatus = 'all' | 'pending' | 'submitted' | 'approved' | 'rejected' | 'manual_review';

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
        .from('kyc_documents') // Change to a valid table name, e.g., 'kyc_documents'
        .select(`
          *,
          kyc_requests (*)
        `)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-profit">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'manual_review':
      case 'escalated':
        return <Badge variant="outline">Manual Review</Badge>;
      case 'submitted':
        return <Badge className="bg-amber-500">Under Review</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-profit" />;
      case 'rejected':
        return <X className="h-4 w-4 text-destructive" />;
      case 'submitted':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">KYC Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Review and manage user KYC submissions</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-2">Awaiting decision</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-profit">{stats.approved}</div>
            <p className="text-xs text-muted-foreground mt-2">Verified users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground mt-2">Resubmit allowed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">Manual Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.manual_review}</div>
            <p className="text-xs text-muted-foreground mt-2">Escalated</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Queue</CardTitle>
          <CardDescription>Manage and review KYC submissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <Input
            placeholder="Search by email, name, or request ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Status Filter Tabs */}
          <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
              <TabsTrigger value="manual_review">Manual ({stats.manual_review})</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Refresh Button */}
          <Button
            onClick={fetchRequests}
            disabled={loadingRequests}
            variant="outline"
            className="w-full"
          >
            {loadingRequests ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              'Refresh Queue'
            )}
          </Button>

          {/* Requests Table */}
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No KYC requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">
                        {req.userProfile?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {req.userProfile?.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          {getStatusIcon(req.status)}
                          {getStatusBadge(req.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {req.submitted_at
                          ? new Date(req.submitted_at).toLocaleDateString()
                          : new Date(req.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {req.kycDocuments?.length || 0} docs
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(req)}
                              disabled={actionLoading === req.id}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </DialogTrigger>
                          {selectedRequest?.id === req.id && (
                            <DialogContent className="w-[calc(100%-2rem)] max-w-[90vw] md:max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>KYC Review: {selectedRequest.userProfile?.full_name}</DialogTitle>
                                <DialogDescription>
                                  {selectedRequest.userProfile?.email}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-6">
                                {/* Documents */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold">Documents ({selectedRequest.kycDocuments?.length || 0})</h4>
                                  {selectedRequest.kycDocuments && selectedRequest.kycDocuments.length > 0 ? (
                                    <div className="space-y-2">
                                      {selectedRequest.kycDocuments.map((doc: KycDocument) => (
                                        <div key={doc.id} className="border rounded-lg p-4 flex items-center justify-between">
                                          <div>
                                            <p className="text-sm font-medium capitalize">{doc.type.replace(/_/g, ' ')}</p>
                                            <p className="text-xs text-muted-foreground">
                                              Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-4">
                                            <Badge variant="outline">{doc.status}</Badge>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => setPreviewUrl(doc.url)}
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No documents uploaded</p>
                                  )}
                                </div>

                                {/* Decision Form */}
                                <div className="space-y-4 border-t pt-4">
                                  <h4 className="font-semibold">Admin Decision</h4>

                                  {selectedRequest.status === 'rejected' && (
                                    <Alert variant="destructive">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>
                                        This request has been rejected.{' '}
                                        {selectedRequest.notes && `Reason: ${selectedRequest.notes}`}
                                      </AlertDescription>
                                    </Alert>
                                  )}

                                  {selectedRequest.status === 'approved' && (
                                    <Alert className="border-profit/20 bg-profit/5">
                                      <CheckCircle className="h-4 w-4 text-profit" />
                                      <AlertDescription>
                                        This request has been approved.
                                      </AlertDescription>
                                    </Alert>
                                  )}

                                  {!['approved', 'rejected'].includes(selectedRequest.status) && (
                                    <>
                                      <Textarea
                                        placeholder="Admin notes (optional)"
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        className="min-h-20"
                                      />

                                      {selectedRequest.status === 'rejected' && (
                                        <Textarea
                                          placeholder="Rejection reason (required)"
                                          value={rejectionReason}
                                          onChange={(e) => setRejectionReason(e.target.value)}
                                          className="min-h-20"
                                        />
                                      )}

                                      <div className="flex gap-4">
                                        <Button
                                          className="flex-1 bg-profit hover:bg-profit/90"
                                          onClick={() =>
                                            performAdminAction(selectedRequest.id, 'approve', adminNotes)
                                          }
                                          disabled={actionLoading === selectedRequest.id}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Approve
                                        </Button>
                                        <Button
                                          className="flex-1"
                                          variant="destructive"
                                          onClick={() =>
                                            performAdminAction(
                                              selectedRequest.id,
                                              'reject',
                                              rejectionReason || 'Document verification failed'
                                            )
                                          }
                                          disabled={actionLoading === selectedRequest.id}
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          Reject
                                        </Button>
                                        <Button
                                          className="flex-1"
                                          variant="outline"
                                          onClick={() =>
                                            performAdminAction(
                                              selectedRequest.id,
                                              'request_more_info',
                                              adminNotes
                                            )
                                          }
                                          disabled={actionLoading === selectedRequest.id}
                                        >
                                          <ChevronDown className="h-4 w-4 mr-2" />
                                          Request More Info
                                        </Button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
