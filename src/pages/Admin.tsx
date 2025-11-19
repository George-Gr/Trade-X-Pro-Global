import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
import { TrendingUp, Users, FileCheck, DollarSign, LogOut, Eye, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import DocumentViewer from "@/components/kyc/DocumentViewer";

interface KYCDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_path: string;
  status: string;
  created_at: string;
  rejection_reason: string | null;
  profiles: {
    full_name: string | null;
    email: string;
    country: string | null;
  };
}

interface UserAccount {
  id: string;
  full_name: string | null;
  email: string;
  balance: number;
  equity: number;
  account_status: string;
  kyc_status: string;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, signOut } = useAuth();

  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState<{ open: boolean; docId: string | null }>({
    open: false,
    docId: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [fundDialog, setFundDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  });
  const [fundAmount, setFundAmount] = useState("");
  const [isApproving, setIsApproving] = useState<string | null>(null); // Track approval loading by document ID
  const [isRejecting, setIsRejecting] = useState(false);
  const [isFunding, setIsFunding] = useState(false);

  const fetchKYCDocuments = useCallback(async () => {
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
      .order("created_at", { ascending: false });

    if (data && !error) {
      setKycDocuments(data as KYCDocument[]);
    }
  }, []);

  const fetchUserAccounts = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setUserAccounts(data);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchKYCDocuments(), fetchUserAccounts()]);
    setIsLoading(false);
  }, [fetchKYCDocuments, fetchUserAccounts]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    fetchData();
  }, [user, isAdmin, fetchData, navigate]);

  const handleApprove = async (docId: string, userId: string) => {
    try {
      setIsApproving(docId);
      
      const { error: docError } = await supabase
        .from("kyc_documents")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
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

      fetchData();
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

  const handleReject = async () => {
    if (!rejectionDialog.docId || !rejectionReason.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

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
          rejection_reason: rejectionReason,
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
      setRejectionReason("");
      fetchData();
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

  const handleFundAccount = async () => {
    if (!fundDialog.userId || !fundAmount || isNaN(Number(fundAmount))) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }

    const amount = Number(fundAmount);
    
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Amount must be positive",
        variant: "destructive",
      });
      return;
    }

    if (amount > 100000) {
      toast({
        title: "Amount too large",
        description: "Maximum funding amount is $100,000 per operation",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsFunding(true);
      
      // Call secure edge function instead of direct database access
      const { data, error } = await supabase.functions.invoke('admin-fund-account', {
        body: {
          user_id: fundDialog.userId,
          amount: amount,
          description: 'Admin manual funding'
        }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Account Funded",
        description: `Added $${amount.toFixed(2)} to account`,
      });

      setFundDialog({ open: false, userId: null });
      setFundAmount("");
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error",
        description: message || "Failed to fund account",
        variant: "destructive",
      });
    } finally {
      setIsFunding(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleViewDocument = (filePath: string) => {
    setSelectedDocument(filePath);
    setViewerOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="font-bold">TradeX Pro</span>
          <Badge variant="outline" className="ml-2 text-xs">
            Admin
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage KYC submissions and user accounts</p>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending KYC</p>
                    <p className="text-2xl font-bold">
                      {kycDocuments.filter((d) => d.status === "pending").length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{userAccounts.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Virtual Capital</p>
                    <p className="text-2xl font-bold">
                      ${userAccounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-profit/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-profit" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Approved KYC</p>
                    <p className="text-2xl font-bold">
                      {kycDocuments.filter((d) => d.status === "approved").length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="kyc" className="space-y-4">
              <TabsList>
                <TabsTrigger value="kyc">KYC Submissions</TabsTrigger>
                <TabsTrigger value="accounts">User Accounts</TabsTrigger>
              </TabsList>

              {/* KYC Submissions */}
              <TabsContent value="kyc">
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">KYC Document Submissions</h2>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Document Type</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kycDocuments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                              No KYC submissions yet
                            </TableCell>
                          </TableRow>
                        ) : (
                          kycDocuments.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell className="font-medium">
                                {doc.profiles.full_name || "N/A"}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {doc.profiles.email}
                              </TableCell>
                              <TableCell className="capitalize">
                                {doc.document_type.replace(/_/g, " ")}
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(doc.created_at).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    doc.status === "approved"
                                      ? "default"
                                      : doc.status === "rejected"
                                      ? "destructive"
                                      : "outline"
                                  }
                                >
                                  {doc.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewDocument(doc.file_path)}
                                  >
                                    <Eye className="h-3 w-3 mr-2" />
                                    View
                                  </Button>
                                  {doc.status === "pending" && (
                                    <>
                                      <LoadingButton
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          setRejectionDialog({ open: true, docId: doc.id })
                                        }
                                        isLoading={isRejecting}
                                        loadingText="Rejecting..."
                                      >
                                        Reject
                                      </LoadingButton>
                                      <LoadingButton
                                        size="sm"
                                        onClick={() => handleApprove(doc.id, doc.user_id)}
                                        isLoading={isApproving === doc.id}
                                        loadingText="Approving..."
                                      >
                                        Approve
                                      </LoadingButton>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>

              {/* User Accounts */}
              <TabsContent value="accounts">
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">User Accounts</h2>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Equity</TableHead>
                          <TableHead>KYC Status</TableHead>
                          <TableHead>Account Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userAccounts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              No user accounts yet
                            </TableCell>
                          </TableRow>
                        ) : (
                          userAccounts.map((account) => (
                            <TableRow key={account.id}>
                              <TableCell className="font-medium">
                                {account.full_name || "N/A"}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {account.email}
                              </TableCell>
                              <TableCell className="font-mono">
                                ${account.balance.toLocaleString()}
                              </TableCell>
                              <TableCell className="font-mono">
                                ${account.equity.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    account.kyc_status === "approved"
                                      ? "default"
                                      : account.kyc_status === "rejected"
                                      ? "destructive"
                                      : "outline"
                                  }
                                >
                                  {account.kyc_status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    account.account_status === "active" ? "default" : "outline"
                                  }
                                >
                                  {account.account_status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setFundDialog({ open: true, userId: account.id })}
                                >
                                  <DollarSign className="h-3 w-3 mr-2" />
                                  Fund
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Document Viewer Dialog */}
      {selectedDocument && (
        <DocumentViewer
          filePath={selectedDocument}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}

      {/* Rejection Dialog */}
      <Dialog
        open={rejectionDialog.open}
        onOpenChange={(open) => setRejectionDialog({ open, docId: null })}
      >
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectionDialog({ open: false, docId: null })}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={handleReject}
              isLoading={isRejecting}
              loadingText="Rejecting..."
            >
              Reject Document
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fund Account Dialog */}
      <Dialog
        open={fundDialog.open}
        onOpenChange={(open) => setFundDialog({ open, userId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fund User Account</DialogTitle>
            <DialogDescription>
              Add virtual funds to the user's trading account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fund-amount">Amount (USD)</Label>
              <Input
                id="fund-amount"
                type="number"
                placeholder="Enter amount..."
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                min="0"
                step="100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFundDialog({ open: false, userId: null })}>
              Cancel
            </Button>
            <LoadingButton onClick={handleFundAccount} isLoading={isFunding} loadingText="Adding Funds...">
  Add Funds
</LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
