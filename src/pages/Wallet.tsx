import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet as WalletIcon, TrendingUp, History, Plus, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DepositCryptoDialog } from "@/components/wallet/DepositCryptoDialog";
import { TransactionHistory } from "@/components/wallet/TransactionHistory";
import { Skeleton } from "@/components/ui/skeleton";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { useAuth } from "@/hooks/useAuth";

const Wallet = () => {
  const { user } = useAuth();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
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
  const { data: transactions, isLoading: transactionsLoading, refetch } = useQuery({
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

  const pendingTransactions = transactions?.filter(t => 
    ['pending', 'confirming'].includes(t.status)
  ).length || 0;

  return (
    <AuthenticatedLayout>
      <div className="h-full overflow-auto">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Crypto Wallet</h1>
              <p className="text-muted-foreground">Manage your cryptocurrency deposits and balance</p>
            </div>
            <Button 
              onClick={() => setDepositDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Deposit Crypto
            </Button>
          </div>

          {/* Balance Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Balance
                </CardTitle>
                <WalletIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="text-3xl font-bold gradient-text">
                    ${profile?.balance?.toFixed(2) || '0.00'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Equity
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="text-3xl font-bold gradient-text">
                    ${profile?.equity?.toFixed(2) || '0.00'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Deposits
                </CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {transactionsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <Badge variant={pendingTransactions > 0 ? "default" : "secondary"}>
                      {pendingTransactions}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View all your crypto deposits and withdrawals</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => refetch()}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="failed">Failed</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-6">
                  <TransactionHistory 
                    transactions={transactions || []} 
                    isLoading={transactionsLoading}
                  />
                </TabsContent>
                <TabsContent value="completed" className="mt-6">
                  <TransactionHistory 
                    transactions={transactions?.filter(t => t.status === 'completed') || []} 
                    isLoading={transactionsLoading}
                  />
                </TabsContent>
                <TabsContent value="pending" className="mt-6">
                  <TransactionHistory 
                    transactions={transactions?.filter(t => ['pending', 'confirming'].includes(t.status)) || []} 
                    isLoading={transactionsLoading}
                  />
                </TabsContent>
                <TabsContent value="failed" className="mt-6">
                  <TransactionHistory 
                    transactions={transactions?.filter(t => ['failed', 'expired'].includes(t.status)) || []} 
                    isLoading={transactionsLoading}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <DepositCryptoDialog 
            open={depositDialogOpen}
            onOpenChange={setDepositDialogOpen}
            onSuccess={() => refetch()}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Wallet;
