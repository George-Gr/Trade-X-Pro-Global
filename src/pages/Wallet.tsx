import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet as WalletIcon, TrendingUp, History, Plus, RefreshCw, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DepositCryptoDialog } from "@/components/wallet/DepositCryptoDialog";
import { WithdrawalDialog } from "@/components/wallet/WithdrawalDialog";
import { TransactionHistory } from "@/components/wallet/TransactionHistory";
import { Skeleton } from "@/components/ui/skeleton";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { useAuth } from "@/hooks/useAuth";

const Wallet = () => {
  const { user } = useAuth();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("deposits");

  // Fetch user profile
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch crypto transactions
  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ['crypto_transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crypto_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch withdrawal requests
  // Withdrawal requests - feature disabled (table does not exist in current schema)
  // const { data: withdrawals, isLoading: withdrawalsLoading, refetch: refetchWithdrawals } = useQuery({
  //   queryKey: ['withdrawal_requests', user?.id],
  //   queryFn: async () => {
  //     const { data, error } = await supabase
  //       .from('withdrawal_requests')
  //       .select('*')
  //       .eq('user_id', user?.id)
  //       .order('created_at', { ascending: false });
  //     
  //     if (error) throw error;
  //     return data;
  //   },
  //   enabled: !!user?.id,
  // });

  const pendingTransactions = transactions?.filter(t => 
    ['pending', 'confirming'].includes(t.status)
  ).length || 0;

  // const pendingWithdrawals = withdrawals?.filter((w: any) => 
  //   ['pending', 'approved', 'processing'].includes(w.status)
  // ).length || 0;

  const handleRefresh = () => {
    refetchProfile();
    refetchTransactions();
    // refetchWithdrawals(); // Feature disabled
  };

  return (
    <AuthenticatedLayout>
      <div className="h-full overflow-auto">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Crypto Wallet</h1>
              <p className="text-muted-foreground">Manage your cryptocurrency deposits and withdrawals</p>
            </div>
            <div className="flex gap-4">
              <Button 
                variant="outline"
                onClick={handleRefresh}
                className="gap-4"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => setDepositDialogOpen(true)}
                className="gap-4"
              >
                <Plus className="h-4 w-4" />
                Deposit
              </Button>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Balance
                </CardTitle>
                <WalletIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <Skeleton className="h-10 w-48" />
                ) : (
                  <div className="text-3xl font-bold gradient-text">
                    ${profile?.balance?.toFixed(2) || '0.00'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Held Balance
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <Skeleton className="h-10 w-48" />
                ) : (
                  <div className="text-3xl font-bold gradient-text">
                    ${(0).toFixed(2)}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">In pending withdrawals (feature disabled)</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Operations
                </CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div>
                    <Badge variant="secondary" className="flex items-center gap-4">
                      <ArrowDownLeft className="h-3 w-3" />
                      {transactionsLoading ? '...' : pendingTransactions}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">Deposits</p>
                  </div>
                  <div>
                    <Badge variant="secondary" className="flex items-center gap-4">
                      <ArrowUpRight className="h-3 w-3" />
                      {0}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">Withdrawals (disabled)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deposit & Withdrawal Forms */}
          <div className="grid gap-6 mb-8 lg:grid-cols-2">
            {/* Deposit Section */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-4">
                      <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      Deposit Crypto
                    </CardTitle>
                    <CardDescription>Add cryptocurrency to your account</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setDepositDialogOpen(true)}
                    size="default"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Deposit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Supported cryptocurrencies: BTC, ETH, USDT, USDC, LTC, BNB
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Minimum deposit: $10 USD
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Deposits confirmed within 15-30 minutes
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Withdrawal Section */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-4">
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                      Withdraw Crypto
                    </CardTitle>
                    <CardDescription>Withdraw to external wallet</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setWithdrawalDialogOpen(true)}
                    size="default"
                    variant="outline"
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Daily limit: $10,000 USD
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Per-transaction limit: $5,000 USD
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Network fees may apply
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Forms and History */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Manage Funds</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="deposits">Recent Deposits</TabsTrigger>
                  <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                  <TabsTrigger value="all">Transaction History</TabsTrigger>
                </TabsList>

                <TabsContent value="deposits" className="mt-6">
                  <TransactionHistory 
                    transactions={transactions?.filter(t => t.transaction_type === 'deposit') || []} 
                    isLoading={transactionsLoading}
                  />
                </TabsContent>

                <TabsContent value="withdrawals" className="mt-6">
                  <div className="space-y-4">
                    <p className="text-center text-muted-foreground py-8">Withdrawals feature temporarily disabled</p>
                  </div>
                </TabsContent>

                <TabsContent value="all" className="mt-6">
                  <TransactionHistory 
                    transactions={transactions || []} 
                    isLoading={transactionsLoading}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <DepositCryptoDialog 
            open={depositDialogOpen}
            onOpenChange={setDepositDialogOpen}
            onSuccess={() => refetchTransactions()}
          />

          <WithdrawalDialog
            open={withdrawalDialogOpen}
            onOpenChange={setWithdrawalDialogOpen}
            onSuccess={() => { /* Feature disabled */ }}
            balance={profile?.balance || 0}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Wallet;
