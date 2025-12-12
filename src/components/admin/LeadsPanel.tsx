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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Eye, Loader2, Search, FileCheck, User, Briefcase, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  user_id: string;
  lead_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  trading_experience: string;
  occupation: string;
  financial_capability: string;
  reason_for_joining: string;
  trading_goals: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  balance: number;
  equity: number;
  kyc_status: string;
  account_status: string;
}

interface KYCDocument {
  id: string;
  document_type: string;
  file_path: string;
  status: string;
  created_at: string;
  rejection_reason: string | null;
}

interface LeadsPanelProps {
  refreshTrigger?: number;
}

const LeadsPanel: React.FC<LeadsPanelProps> = ({ refreshTrigger }) => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedKYCDocs, setSelectedKYCDocs] = useState<KYCDocument[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [fundDialog, setFundDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  });
  const [fundAmount, setFundAmount] = useState("");
  const [isFunding, setIsFunding] = useState(false);

  const fetchLeads = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && !error) {
        setLeads(data);
      } else if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch leads",
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
  }, [isAdmin, toast]);

  // Real-time subscription for leads
  useEffect(() => {
    fetchLeads();

    // Subscribe to leads changes
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          console.log('Lead change:', payload);
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeads, refreshTrigger]);

  const openLeadDetails = async (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);

    // Fetch profile data
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", lead.user_id)
      .single();

    if (profileData) {
      setSelectedProfile(profileData);
    }

    // Fetch KYC documents
    const { data: kycData } = await supabase
      .from("kyc_documents")
      .select("*")
      .eq("user_id", lead.user_id)
      .order("created_at", { ascending: false });

    if (kycData) {
      setSelectedKYCDocs(kycData);
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

    try {
      setIsFunding(true);

      const { data, error } = await supabase.functions.invoke('admin-fund-account', {
        body: {
          user_id: fundDialog.userId,
          amount: amount,
          description: 'Initial account funding via Lead Management'
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

      setFundAmount("");
      setFundDialog({ open: false, userId: null });
      
      // Refresh profile data if viewing lead details
      if (selectedLead && selectedLead.user_id === fundDialog.userId) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", fundDialog.userId)
          .single();

        if (profileData) {
          setSelectedProfile(profileData);
        }
      }
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

  const handleKYCAction = async (docId: string, action: 'approved' | 'rejected', reason?: string) => {
    try {
      const { error } = await supabase
        .from("kyc_documents")
        .update({
          status: action,
          rejection_reason: action === 'rejected' ? reason : null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", docId);

      if (error) throw error;

      toast({
        title: "KYC Updated",
        description: `Document ${action}`,
      });

      // Refresh KYC docs
      if (selectedLead) {
        const { data: kycData } = await supabase
          .from("kyc_documents")
          .select("*")
          .eq("user_id", selectedLead.user_id)
          .order("created_at", { ascending: false });

        if (kycData) {
          setSelectedKYCDocs(kycData);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.lead_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500";
      case "contacted": return "bg-yellow-500";
      case "qualified": return "bg-green-500";
      case "converted": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getKycColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500";
      case "rejected": return "bg-red-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getExperienceLabel = (exp: string) => {
    const labels: Record<string, string> = {
      'none': 'No Experience',
      'beginner': 'Beginner (< 1 year)',
      'intermediate': 'Intermediate (1-3 years)',
      'experienced': 'Experienced (3-5 years)',
      'expert': 'Expert (5+ years)',
    };
    return labels[exp] || exp;
  };

  const getFinancialLabel = (fin: string) => {
    const labels: Record<string, string> = {
      'under-1000': 'Under $1,000',
      '1000-5000': '$1,000 - $5,000',
      '5000-25000': '$5,000 - $25,000',
      '25000-100000': '$25,000 - $100,000',
      'over-100000': 'Over $100,000',
    };
    return labels[fin] || fin;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Lead Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage new registrations, fund accounts, and review KYC
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Total leads: {leads.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by lead number, name or email..."
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
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Leads Table */}
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
                  Showing {filteredLeads.length} of {leads.length} leads
                </span>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead #</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm font-medium text-primary">
                          {lead.lead_number}
                        </TableCell>
                        <TableCell className="font-medium">
                          {lead.first_name} {lead.last_name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lead.email}
                        </TableCell>
                        <TableCell className="text-sm">
                          {getExperienceLabel(lead.trading_experience)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {getFinancialLabel(lead.financial_capability)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getStatusColor(lead.status)}`} />
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openLeadDetails(lead)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setFundDialog({ open: true, userId: lead.user_id })}
                              className="flex items-center gap-1"
                            >
                              <DollarSign className="h-3 w-3" />
                              Fund
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredLeads.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No leads found matching your criteria.
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Lead Details Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Lead Details</SheetTitle>
            <SheetDescription>
              {selectedLead?.lead_number}
            </SheetDescription>
          </SheetHeader>

          {selectedLead && (
            <div className="mt-6 space-y-6">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="trading">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Trading
                  </TabsTrigger>
                  <TabsTrigger value="kyc">
                    <FileCheck className="h-4 w-4 mr-2" />
                    KYC
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">First Name</Label>
                      <p className="font-medium">{selectedLead.first_name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Last Name</Label>
                      <p className="font-medium">{selectedLead.last_name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{selectedLead.email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium">{selectedLead.phone || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Address</Label>
                      <p className="font-medium">{selectedLead.address || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Account Info */}
                  {selectedProfile && (
                    <Card className="p-4 mt-4">
                      <h4 className="font-semibold mb-3">Account Status</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Balance</Label>
                          <p className="font-mono text-lg font-bold text-green-500">
                            {formatCurrency(selectedProfile.balance)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Equity</Label>
                          <p className="font-mono text-lg">
                            {formatCurrency(selectedProfile.equity)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">KYC Status</Label>
                          <Badge variant="outline" className="capitalize mt-1">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getKycColor(selectedProfile.kyc_status)}`} />
                            {selectedProfile.kyc_status}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Account Status</Label>
                          <Badge variant="outline" className="capitalize mt-1">
                            {selectedProfile.account_status}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        className="w-full mt-4"
                        onClick={() => setFundDialog({ open: true, userId: selectedLead.user_id })}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Add Funds
                      </Button>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="trading" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Trading Experience</Label>
                      <p className="font-medium">{getExperienceLabel(selectedLead.trading_experience)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Occupation</Label>
                      <p className="font-medium capitalize">{selectedLead.occupation.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Financial Capability</Label>
                      <p className="font-medium">{getFinancialLabel(selectedLead.financial_capability)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Reason for Joining</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{selectedLead.reason_for_joining}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Trading Goals</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{selectedLead.trading_goals}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="kyc" className="space-y-4 mt-4">
                  {selectedKYCDocs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No KYC documents submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedKYCDocs.map((doc) => (
                        <Card key={doc.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium capitalize">{doc.document_type.replace('_', ' ')}</span>
                            <Badge variant="outline" className="capitalize">
                              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getKycColor(doc.status)}`} />
                              {doc.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Submitted: {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                          {doc.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="flex-1"
                                onClick={() => handleKYCAction(doc.id, 'approved')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                                onClick={() => handleKYCAction(doc.id, 'rejected', 'Document not valid')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {doc.rejection_reason && (
                            <p className="text-sm text-red-500 mt-2">
                              Rejection reason: {doc.rejection_reason}
                            </p>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Fund Account Dialog */}
      <Dialog open={fundDialog.open} onOpenChange={() => setFundDialog({ open: false, userId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fund User Account</DialogTitle>
            <DialogDescription>
              Add funds to the user's trading account.
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
                disabled={isFunding}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFundDialog({ open: false, userId: null })} disabled={isFunding}>
              Cancel
            </Button>
            <LoadingButton
              onClick={handleFundAccount}
              isLoading={isFunding}
              loadingText="Adding Funds..."
              disabled={!fundAmount || isNaN(Number(fundAmount)) || Number(fundAmount) <= 0}
            >
              Add Funds
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsPanel;
