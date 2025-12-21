import { WalletLoading } from '@/components/common/PageLoadingStates';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { DepositCryptoDialog } from '@/components/wallet/DepositCryptoDialog';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';
import { WithdrawalDialog } from '@/components/wallet/WithdrawalDialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Plus,
  RefreshCw,
  TrendingUp,
  Wallet as WalletIcon,
} from 'lucide-react';
import { useState } from 'react';

const Wallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('deposits');

  // Feature flag for withdrawals (can be replaced with actual permission check)
  const IS_WITHDRAWALS_ENABLED = false;

  // Fetch user profile
  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch crypto transactions
  const {
    data: transactions,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ['crypto_transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crypto_transactions')
        .select('*')
        .eq('user_id', user?.id!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Show loading skeleton while data is being fetched
  if (profileLoading || transactionsLoading) {
    return <WalletLoading />;
  }

  // TODO: Add withdrawal requests functionality - see issue #1234
  // Implement withdrawal request form, validation, and processing workflow

  const pendingTransactions =
    transactions?.filter((t) => ['pending', 'confirming'].includes(t.status))
      .length || 0;

  const handleRefresh = () => {
    refetchProfile();
    refetchTransactions();
  };

  return (
    <AuthenticatedLayout>
      <div className="h-full overflow-auto">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="typography-h1 gradient-text mb-2">
                Crypto Wallet
              </h1>
              <p className="text-muted-foreground">
                Manage your cryptocurrency deposits and withdrawals
              </p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Balance
                </CardTitle>
                <WalletIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gradient-text">
                  ${profile?.balance?.toFixed(2) || '0.00'}
                </div>
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
                <div className="text-3xl font-bold gradient-text">
                  ${(0).toFixed(2)}
                </div>
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
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-4"
                    >
                      <ArrowDownLeft className="h-3 w-3" />
                      {transactionsLoading ? '...' : pendingTransactions}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Deposits
                    </p>
                  </div>
                  <div>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-4"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      {0}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Withdrawals (disabled)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deposit & Withdrawal Forms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {/* Deposit Section */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-4">
                      <ArrowDownLeft className="h-4 w-4 text-buy" />
                      Deposit Crypto
                    </CardTitle>
                    <CardDescription>
                      Add cryptocurrency to your account
                    </CardDescription>
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
                      <ArrowUpRight className="h-4 w-4 text-sell" />
                      Withdraw Crypto
                    </CardTitle>
                    <CardDescription>
                      Withdraw to external wallet
                    </CardDescription>
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
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="deposits">Recent Deposits</TabsTrigger>
                  <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                  <TabsTrigger value="all">Transaction History</TabsTrigger>
                </TabsList>

                <TabsContent value="deposits" className="mt-6">
                  <TransactionHistory
                    transactions={
                      transactions
                        ?.filter((t) => t.transaction_type === 'deposit')
                        .map((t) => ({
                          ...t,
                          confirmations: t.confirmations ?? 0,
                        })) || []
                    }
                    isLoading={transactionsLoading}
                  />
                </TabsContent>

                <TabsContent value="withdrawals" className="mt-6">
                  <div className="space-y-4">
                    <p className="text-center text-muted-foreground py-8">
                      Withdrawals feature temporarily disabled
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="all" className="mt-6">
                  <TransactionHistory
                    transactions={
                      transactions?.map((t) => ({
                        ...t,
                        confirmations: t.confirmations ?? 0,
                      })) || []
                    }
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

          {IS_WITHDRAWALS_ENABLED && (
            <WithdrawalDialog
              open={withdrawalDialogOpen}
              onOpenChange={setWithdrawalDialogOpen}
              onSuccess={() => {
                toast({
                  title: 'Withdrawal Request Submitted',
                  description:
                    'Your withdrawal request has been submitted for processing.',
                });
                setWithdrawalDialogOpen(false);
                refetchProfile();
                refetchTransactions();
              }}
              balance={profile?.balance || 0}
            />
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Wallet;
