import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseBrowserClient';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileCheck,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Loader2,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DocumentViewer from '@/components/kyc/DocumentViewer';

interface KYCDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_path: string;
  status: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string | null;
  profiles: {
    full_name: string | null;
    email: string;
    country: string | null;
  };
}

interface RejectionDialogProps {
  open: boolean;
  docId: string | null;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isLoading: boolean;
}

const RejectionDialog: React.FC<RejectionDialogProps> = ({
  open,
  docId,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = () => {
    if (!rejectionReason.trim()) return;
    onSubmit(rejectionReason);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setRejectionReason('');
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject KYC Document</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejection. This will be shown to the
            user.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setRejectionReason('');
              onClose();
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="destructive"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Rejecting..."
            disabled={!rejectionReason.trim() || isLoading}
          >
            Reject Document
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface KYCPanelProps {
  refreshTrigger?: number;
}

const KYCPanel: React.FC<KYCPanelProps> = ({ refreshTrigger }) => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState<{
    open: boolean;
    docId: string | null;
  }>({
    open: false,
    docId: null,
  });
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchKYCDocuments = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('kyc_documents')
        .select(
          `
          *,
          profiles:user_id (
            full_name,
            email,
            country
          )
        `
        )
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (data && !error) {
        setKycDocuments(data as unknown as KYCDocument[]);
      } else if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch KYC documents',
          variant: 'destructive',
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchKYCDocuments();
  }, [fetchKYCDocuments, refreshTrigger]);

  const handleApprove = async (docId: string, userId: string) => {
    if (!user) return;

    try {
      setIsApproving(docId);

      const { error: docError } = await supabase
        .from('kyc_documents')
        .update({
          status: 'approved' as const,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        } as {
          status: 'pending' | 'approved' | 'rejected' | 'resubmitted';
          reviewed_at: string;
          reviewed_by: string;
        })
        .eq('id' as const, docId as string);

      if (docError) throw docError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ kyc_status: 'approved' as const } as {
          kyc_status: 'pending' | 'approved' | 'rejected' | 'resubmitted';
        })
        .eq('id' as const, userId as string);

      if (profileError) throw profileError;

      toast({
        title: 'KYC Approved',
        description: 'Document has been approved successfully',
      });

      fetchKYCDocuments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsApproving(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectionDialog.docId || !reason.trim()) return;

    try {
      setIsRejecting(true);

      const doc = kycDocuments.find((d) => d.id === rejectionDialog.docId);
      if (!doc) return;

      const { error: docError } = await supabase
        .from('kyc_documents')
        .update({
          status: 'rejected' as const,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          rejection_reason: reason,
        } as {
          status: 'pending' | 'approved' | 'rejected' | 'resubmitted';
          reviewed_at: string;
          reviewed_by: string | undefined;
          rejection_reason: string;
        })
        .eq('id' as const, rejectionDialog.docId as string);

      if (docError) throw docError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ kyc_status: 'rejected' as const } as {
          kyc_status: 'pending' | 'approved' | 'rejected' | 'resubmitted';
        })
        .eq('id' as const, doc.user_id as string);

      if (profileError) throw profileError;

      toast({
        title: 'KYC Rejected',
        description: 'Document has been rejected',
      });

      setRejectionDialog({ open: false, docId: null });
      fetchKYCDocuments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const handleViewDocument = (filePath: string) => {
    setSelectedDocument(filePath);
    setViewerOpen(true);
  };

  const filteredDocuments = kycDocuments.filter((doc) => {
    const matchesSearch =
      doc.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.profiles.full_name &&
        doc.profiles.full_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesType =
      documentTypeFilter === 'all' || doc.document_type === documentTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === 'profiles.full_name') {
      const nameA = a.profiles.full_name || '';
      const nameB = b.profiles.full_name || '';
      return sortOrder === 'desc'
        ? nameB.localeCompare(nameA)
        : nameA.localeCompare(nameB);
    }
    if (sortBy === 'profiles.email') {
      return sortOrder === 'desc'
        ? b.profiles.email.localeCompare(a.profiles.email)
        : a.profiles.email.localeCompare(b.profiles.email);
    }
    if (sortBy === 'document_type') {
      return sortOrder === 'desc'
        ? b.document_type.localeCompare(a.document_type)
        : a.document_type.localeCompare(b.document_type);
    }
    return 0;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-3 w-3" />;
      case 'rejected':
        return <XCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStats = () => {
    const total = kycDocuments.length;
    const pending = kycDocuments.filter((d) => d.status === 'pending').length;
    const approved = kycDocuments.filter((d) => d.status === 'approved').length;
    const rejected = kycDocuments.filter((d) => d.status === 'rejected').length;

    return { total, pending, approved, rejected };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileCheck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Submissions</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-500">
                {stats.pending}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-green-500">
                {stats.approved}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-red-500">
                {stats.rejected}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={documentTypeFilter}
                onChange={(e) => setDocumentTypeFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="identity_card">Identity Card</option>
                <option value="passport">Passport</option>
                <option value="utility_bill">Utility Bill</option>
                <option value="driver_license">Driver's License</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchKYCDocuments}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Documents Table */}
      <Card>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="mb-4">
                <span className="text-sm text-muted-foreground">
                  Showing {sortedDocuments.length} of {kycDocuments.length}{' '}
                  documents
                </span>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSortBy('profiles.full_name');
                          setSortOrder(
                            sortOrder === 'desc' &&
                              sortBy === 'profiles.full_name'
                              ? 'asc'
                              : 'desc'
                          );
                        }}
                      >
                        Name
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSortBy('profiles.email');
                          setSortOrder(
                            sortOrder === 'desc' && sortBy === 'profiles.email'
                              ? 'asc'
                              : 'desc'
                          );
                        }}
                      >
                        Email
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSortBy('document_type');
                          setSortOrder(
                            sortOrder === 'desc' && sortBy === 'document_type'
                              ? 'asc'
                              : 'desc'
                          );
                        }}
                      >
                        Document Type
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSortBy('created_at');
                          setSortOrder(
                            sortOrder === 'desc' && sortBy === 'created_at'
                              ? 'asc'
                              : 'desc'
                          );
                        }}
                      >
                        Submitted
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSortBy('status');
                          setSortOrder(
                            sortOrder === 'desc' && sortBy === 'status'
                              ? 'asc'
                              : 'desc'
                          );
                        }}
                      >
                        Status
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDocuments.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {doc.profiles.full_name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {doc.profiles.email}
                        </TableCell>
                        <TableCell className="capitalize">
                          {doc.document_type.replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(doc.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(doc.status)}
                            className="flex items-center gap-1 capitalize"
                          >
                            {getStatusIcon(doc.status)}
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDocument(doc.file_path)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            {doc.status === 'pending' && (
                              <>
                                <LoadingButton
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setRejectionDialog({
                                      open: true,
                                      docId: doc.id,
                                    })
                                  }
                                  isLoading={isRejecting}
                                  loadingText="Rejecting..."
                                  className="flex items-center gap-1"
                                >
                                  <XCircle className="h-3 w-3" />
                                  Reject
                                </LoadingButton>
                                <LoadingButton
                                  size="sm"
                                  onClick={() =>
                                    handleApprove(doc.id, doc.user_id)
                                  }
                                  isLoading={isApproving === doc.id}
                                  loadingText="Approving..."
                                  className="flex items-center gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Approve
                                </LoadingButton>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {sortedDocuments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No KYC documents found matching your criteria.
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Document Viewer Dialog */}
      {selectedDocument && (
        <DocumentViewer
          filePath={selectedDocument}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}

      {/* Rejection Dialog */}
      <RejectionDialog
        open={rejectionDialog.open}
        docId={rejectionDialog.docId}
        onClose={() => setRejectionDialog({ open: false, docId: null })}
        onSubmit={handleReject}
        isLoading={isRejecting}
      />
    </div>
  );
};

export default KYCPanel;
