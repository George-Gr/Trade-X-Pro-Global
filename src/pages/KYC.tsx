import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import KYCSubmission from "@/components/kyc/KYCSubmission";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface KYCDocument {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

const KYC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState<string>("pending");
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchKYCStatus();
      fetchDocuments();
    }
  }, [user]);

  const fetchKYCStatus = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("kyc_status")
      .eq("id", user.id)
      .single();

    if (data && !error) {
      setKycStatus(data.kyc_status);
    }
  };

  const fetchDocuments = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("kyc_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data && !error) {
      setDocuments(data);
    }
    setIsLoading(false);
  };

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
      case "resubmitted":
        return <Badge variant="outline">Resubmitted</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="h-full overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
            <p className="text-muted-foreground">
              Submit your identity documents for verification
            </p>
          </div>

          {/* Status Alert */}
          {kycStatus === "approved" && (
            <Alert className="border-profit/20 bg-profit/5">
              <CheckCircle className="h-4 w-4 text-profit" />
              <AlertDescription>
                Your identity has been verified. You have full access to all trading features.
              </AlertDescription>
            </Alert>
          )}

          {kycStatus === "rejected" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your KYC verification was rejected. Please review the feedback and submit new documents.
              </AlertDescription>
            </Alert>
          )}

          {kycStatus === "pending" && documents.length > 0 && (
            <Alert className="border-amber-500/20 bg-amber-500/5">
              <Clock className="h-4 w-4 text-amber-500" />
              <AlertDescription>
                Your documents are under review. This typically takes 1-2 business days.
              </AlertDescription>
            </Alert>
          )}

          {/* Submission Form */}
          <KYCSubmission onSuccess={() => {
            fetchKYCStatus();
            fetchDocuments();
          }} />

          {/* Submitted Documents */}
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
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No documents submitted yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reviewed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium capitalize">
                          {doc.document_type.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(doc.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(doc.status)}
                            {getStatusBadge(doc.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {doc.reviewed_at
                            ? new Date(doc.reviewed_at).toLocaleString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default KYC;
