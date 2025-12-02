import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import KycUploader from "@/components/kyc/KycUploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KYCLoading } from "@/components/common/PageLoadingStates";
import type { Database } from "@/integrations/supabase/types";

interface KYCDocument {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  type?: string;
}

const KYC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState<"pending" | "approved" | "rejected" | "resubmitted">("pending");
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resubmitCountdown, setResubmitCountdown] = useState<number | null>(null);

  const fetchKYCStatus = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("kyc_status")
      .eq("id", user.id)
      .single();

    if (data && !error) {
      setKycStatus(data.kyc_status || 'pending');
    }
  }, [user]);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("kyc_documents")
        .select("id, document_type, status, created_at, reviewed_at, rejection_reason")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDocuments(data.map(doc => ({
          ...doc,
          type: doc.document_type,
        })) as KYCDocument[]);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchKYCStatus();
      fetchDocuments();

      // Subscribe to KYC status changes
      const subscription = supabase
        .channel(`kyc-status-${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
          (payload) => {
            const newProfile = payload.new as Record<string, unknown>;
            const status = newProfile?.kyc_status as "pending" | "approved" | "rejected" | "resubmitted";
            if (status) {
              setKycStatus(status);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user, fetchKYCStatus, fetchDocuments]);

  // Calculate resubmit countdown if rejected
  useEffect(() => {
    if (kycStatus === "rejected" && documents.length > 0) {
      const lastRejected = documents.find(d => d.status === "rejected");
      if (lastRejected?.reviewed_at) {
        const rejectedDate = new Date(lastRejected.reviewed_at).getTime();
        const sevenDaysLater = rejectedDate + 7 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((sevenDaysLater - now) / (1000 * 60 * 60 * 24)));
        setResubmitCountdown(remaining);
      }
    }
  }, [kycStatus, documents]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-profit" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-loss" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-profit">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "validated":
      case "submitted":
        return <Badge variant="outline">Under Review</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return <KYCLoading />;
  }

  return (
    <AuthenticatedLayout>
      <div className="h-full overflow-auto">
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
          <div>
            <h1 className="typography-h1 mb-2">KYC Verification</h1>
            <p className="text-muted-foreground">
              Submit your identity documents for verification. This is required to start trading.
            </p>
          </div>

          {/* Status Alerts */}
          {kycStatus === "approved" && (
            <Alert className="border-profit/20 bg-profit/5">
              <CheckCircle className="h-4 w-4 text-profit" />
              <AlertDescription>
                ✅ Your identity has been verified. You have full access to all trading features and a $10,000 starting balance.
              </AlertDescription>
            </Alert>
          )}

          {kycStatus === "rejected" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your KYC verification was rejected. {resubmitCountdown && resubmitCountdown > 0 
                  ? `You can resubmit in ${resubmitCountdown} days.`
                  : 'You can now resubmit new documents.'}
              </AlertDescription>
            </Alert>
          )}

          {kycStatus === "pending" && (
            <Alert className="border-amber-500/20 bg-amber-500/5">
              <Clock className="h-4 w-4 text-amber-500" />
              <AlertDescription>
                Your documents are under review. This typically takes 1-2 business days. You'll receive an email when the review is complete.
              </AlertDescription>
            </Alert>
          )}

          {kycStatus === "pending" && documents.length > 0 && (
            <Alert className="border-amber-500/20 bg-amber-500/5">
              <Clock className="h-4 w-4 text-amber-500" />
              <AlertDescription>
                Your documents are being processed. Please wait for review completion.
              </AlertDescription>
            </Alert>
          )}

          {/* KYC Upload Form */}
          {(kycStatus === "pending" || (kycStatus === "rejected" && resubmitCountdown === 0)) && (
            <KycUploader onSuccess={() => {
              fetchKYCStatus();
              fetchDocuments();
            }} />
          )}

          {/* Submitted Documents */}
          {documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Submitted Documents</CardTitle>
                <CardDescription>
                  Track the status of your submitted verification documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Type</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reviewed</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium capitalize">
                            {(doc.type || doc.document_type).replace(/_/g, " ")}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(doc.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              {getStatusIcon(doc.status)}
                              {getStatusBadge(doc.status)}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {doc.reviewed_at
                              ? new Date(doc.reviewed_at).toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {doc.rejection_reason || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What documents do you need?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-4">
                  <CheckCircle className="h-4 w-4 text-profit mt-2.5 shrink-0" />
                  <span>Valid government-issued ID (front and back)</span>
                </li>
                <li className="flex gap-4">
                  <CheckCircle className="h-4 w-4 text-profit mt-2.5 shrink-0" />
                  <span>Proof of address (utility bill or bank statement, less than 3 months old)</span>
                </li>
                <li className="flex gap-4">
                  <CheckCircle className="h-4 w-4 text-profit mt-2.5 shrink-0" />
                  <span>Selfie holding your ID document</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default KYC;
