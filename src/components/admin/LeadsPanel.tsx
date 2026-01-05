import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeLeads } from '@/hooks/useRealtimeLeads';
import { supabase } from '@/integrations/supabase/client';
import React, { useCallback, useState } from 'react';
import FundAccountDialog from './FundAccountDialog';
import LeadDetailSheet from './LeadDetailSheet';
import LeadsTable from './LeadsTable';

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

  // State for leads data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // State for lead details
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedKYCDocs, setSelectedKYCDocs] = useState<KYCDocument[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // State for fund dialog
  const [fundDialog, setFundDialog] = useState<{
    open: boolean;
    userId: string | null;
  }>({
    open: false,
    userId: null,
  });
  const [fundAmount, setFundAmount] = useState('');
  const [isFunding, setIsFunding] = useState(false);

  // Fetch leads data
  const fetchLeads = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        setLeads(data as unknown as Lead[]);
      } else if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch leads',
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
  }, [isAdmin, toast]);

  // Use the realtime leads hook
  useRealtimeLeads(fetchLeads, [refreshTrigger]);

  // Open lead details
  const openLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);

    // Fetch profile data
    supabase
      .from('profiles')
      .select('*')
      .eq('id', lead.user_id)
      .single()
      .then(({ data: profileData }: { data: Profile | null }) => {
        if (profileData) {
          setSelectedProfile(profileData);
        }
      });

    // Fetch KYC documents
    supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', lead.user_id)
      .order('created_at', { ascending: false })
      .then(({ data: kycData }: { data: KYCDocument[] | null }) => {
        if (kycData) {
          setSelectedKYCDocs(kycData);
        }
      });
  };

  // Handle fund account
  const handleFundAccount = async () => {
    if (!fundDialog.userId || !fundAmount || isNaN(Number(fundAmount))) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid number',
        variant: 'destructive',
      });
      return;
    }

    const amount = Number(fundAmount);

    if (amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Amount must be positive',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsFunding(true);

      const { data, error } = await supabase.functions.invoke(
        'admin-fund-account',
        {
          body: {
            user_id: fundDialog.userId,
            amount: amount,
            description: 'Initial account funding via Lead Management',
          },
        }
      );

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: 'Account Funded',
        description: `Added $${amount.toFixed(2)} to account`,
      });

      setFundAmount('');
      setFundDialog({ open: false, userId: null });

      // Refresh profile data if viewing lead details
      if (selectedLead && selectedLead.user_id === fundDialog.userId) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', fundDialog.userId)
          .single();

        if (profileData) {
          setSelectedProfile(profileData as unknown as Profile);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Error',
        description: message || 'Failed to fund account',
        variant: 'destructive',
      });
    } finally {
      setIsFunding(false);
    }
  };

  // Handle KYC actions
  const handleKYCAction = async (
    docId: string,
    action: 'approved' | 'rejected',
    reason?: string
  ) => {
    try {
      const { error } = await supabase
        .from('kyc_documents')
        .update({
          status: action as 'pending' | 'approved' | 'rejected' | 'resubmitted',
          rejection_reason: action === 'rejected' ? reason || null : null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id' as const, docId as string);

      if (error) throw error;

      toast({
        title: 'KYC Updated',
        description: `Document ${action}`,
      });

      // Refresh KYC docs
      if (selectedLead) {
        const { data: kycData } = await supabase
          .from('kyc_documents')
          .select('*')
          .eq('user_id', selectedLead.user_id)
          .order('created_at', { ascending: false });

        if (kycData) {
          setSelectedKYCDocs(kycData as unknown as KYCDocument[]);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  // Filter leads based on search and status
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.lead_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${lead.first_name} ${lead.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handler for opening fund dialog
  const handleOpenFundDialog = (userId: string) => {
    setFundDialog({ open: true, userId });
  };

  // Handler for closing fund dialog
  const handleCloseFundDialog = () => {
    setFundDialog({ open: false, userId: null });
    setFundAmount('');
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

      {/* Leads Table */}
      <LeadsTable
        leads={leads}
        filteredLeads={filteredLeads}
        isLoading={isLoading}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchTermChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onOpenDetails={openLeadDetails}
        onOpenFundDialog={handleOpenFundDialog}
      />

      {/* Lead Details Sheet */}
      <LeadDetailSheet
        selectedLead={selectedLead}
        selectedProfile={selectedProfile}
        selectedKYCDocs={selectedKYCDocs}
        isDetailOpen={isDetailOpen}
        setIsDetailOpen={setIsDetailOpen}
        onKYCAction={handleKYCAction}
        onOpenFundDialog={handleOpenFundDialog}
      />

      {/* Fund Account Dialog */}
      <FundAccountDialog
        open={fundDialog.open}
        fundAmount={fundAmount}
        isFunding={isFunding}
        onOpenChange={handleCloseFundDialog}
        onFundAmountChange={setFundAmount}
        onFundAccount={handleFundAccount}
      />
    </div>
  );
};

export default LeadsPanel;
