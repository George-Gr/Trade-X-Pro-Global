import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DocumentViewer from "@/components/kyc/DocumentViewer";
import { KYCMetrics } from './KYCMetrics';
import { KYCFiltersCard } from './KYCFiltersCard';
import { KYCDocumentsTable } from './KYCDocumentsTable';

export interface KYCDocument {
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
  isLoading
}) => {
  const [rejectionReason, setRejectionReason] = useState("");

  const handleSubmit = () => {
    if (!rejectionReason.trim()) return;
    onSubmit(rejectionReason);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setRejectionReason("");
        onClose();
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject KYC Document</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejection. This will be shown to the user.
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
              setRejectionReason("");
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState<{ open: boolean; docId: string | null }>({
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
        .from("kyc_documents")
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            country
          )
        `)
        .order(sortBy, { ascending: sortOrder === "asc" });

      if (data && !error) {
        setKycDocuments(data as KYCDocument[]);
      } else if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch KYC documents",
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
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
        .from("kyc_documents")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", docId);

      if (docError) throw docError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ kyc_status: "approved" })
        .eq("id", userId);

      if (profileError) throw profileError;

      toast({
        title: "KYC Approved",
        description: "Document has been approved successfully",
      });

      fetchKYCDocuments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
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
        .from("kyc_documents")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          rejection_reason: reason,
        })
        .eq("id", rejectionDialog.docId);

      if (docError) throw docError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ kyc_status: "rejected" })
        .eq("id", doc.user_id);

      if (profileError) throw profileError;

      toast({
        title: "KYC Rejected",
        description: "Document has been rejected",
      });

      setRejectionDialog({ open: false, docId: null });
      fetchKYCDocuments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const handleViewDocument = (filePath: string) => {
    setSelectedDocument(filePath);
    setViewerOpen(true);
  };

  const filteredDocuments = kycDocuments.filter(doc => {
    const matchesSearch = doc.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.profiles.full_name && doc.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType = documentTypeFilter === "all" || doc.document_type === documentTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === "profiles.full_name") {
      const nameA = a.profiles.full_name || "";
      const nameB = b.profiles.full_name || "";
      return sortOrder === "desc" ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
    }
    if (sortBy === "profiles.email") {
      return sortOrder === "desc"
        ? b.profiles.email.localeCompare(a.profiles.email)
        : a.profiles.email.localeCompare(b.profiles.email);
    }
    if (sortBy === "document_type") {
      return sortOrder === "desc"
        ? b.document_type.localeCompare(a.document_type)
        : a.document_type.localeCompare(b.document_type);
    }
    return 0;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "rejected": return "destructive";
      case "pending": return "outline";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-3 w-3" />;
      case "rejected": return <XCircle className="h-3 w-3" />;
      case "pending": return <Clock className="h-3 w-3" />;
      default: return null;
    }
  };

  const getStats = () => {
    const total = kycDocuments.length;
    const pending = kycDocuments.filter(d => d.status === "pending").length;
    const approved = kycDocuments.filter(d => d.status === "approved").length;
    const rejected = kycDocuments.filter(d => d.status === "rejected").length;

    return { total, pending, approved, rejected };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <KYCMetrics
        total={stats.total}
        pending={stats.pending}
        approved={stats.approved}
        rejected={stats.rejected}
      />

      {/* Filters */}
      <KYCFiltersCard
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        documentTypeFilter={documentTypeFilter}
        isLoading={isLoading}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onDocumentTypeChange={setDocumentTypeFilter}
        onRefresh={fetchKYCDocuments}
      />

      {/* Documents Table */}
      <KYCDocumentsTable
        documents={sortedDocuments}
        isLoading={isLoading}
        isApproving={isApproving}
        isRejecting={isRejecting}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(field) => {
          setSortBy(field);
          setSortOrder(sortOrder === "desc" && sortBy === field ? "asc" : "desc");
        }}
        onViewDocument={handleViewDocument}
        onApprove={handleApprove}
        onReject={(docId) => setRejectionDialog({ open: true, docId })}
      />

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