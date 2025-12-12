import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseBrowserClient";
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
import { DollarSign, Eye, Loader2, Search, User, UserPlus, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserAccount {
  id: string;
  full_name: string | null;
  email: string;
  balance: number;
  equity: number;
  account_status: string;
  kyc_status: string;
  created_at: string;
  last_login?: string;
}

interface FundDialogProps {
  open: boolean;
  userId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const FundAccountDialog: React.FC<FundDialogProps> = ({ open, userId, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isFunding, setIsFunding] = useState(false);

  const handleFundAccount = async () => {
    if (!userId || !amount || isNaN(Number(amount))) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }

    const fundAmount = Number(amount);

    if (fundAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Amount must be positive",
        variant: "destructive",
      });
      return;
    }

    if (fundAmount > 100000) {
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
          user_id: userId,
          amount: fundAmount,
          description: 'Admin manual funding'
        }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Account Funded",
        description: `Added $${fundAmount.toFixed(2)} to account`,
      });

      setAmount("");
      onSuccess();
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="100"
              disabled={isFunding}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isFunding}>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleFundAccount}
            isLoading={isFunding}
            loadingText="Adding Funds..."
            disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0}
          >
            Add Funds
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface UsersPanelProps {
  refreshTrigger?: number;
}

const UsersPanel: React.FC<UsersPanelProps> = ({ refreshTrigger }) => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [fundDialog, setFundDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  });

  const fetchUserAccounts = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order(sortBy, { ascending: sortOrder === "asc" });

      if (data && !error) {
        setUserAccounts(data as typeof userAccounts);
      } else if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user accounts",
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
  fetchUserAccounts();
}, [fetchUserAccounts, refreshTrigger]);

const handleLogoutAllDevices = async (userId: string) => {
  try {
    const { error } = await supabase.auth.admin.signOut(userId);

    if (error) throw error;

    toast({
      title: "Success",
      description: "User logged out from all devices",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  }
};

const filteredUsers = userAccounts.filter(user => {
  const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

  const matchesStatus = statusFilter === "all" || user.account_status === statusFilter;
  const matchesKyc = kycFilter === "all" || user.kyc_status === kycFilter;

  return matchesSearch && matchesStatus && matchesKyc;
});

const sortedUsers = [...filteredUsers].sort((a, b) => {
  if (sortBy === "balance") {
    return sortOrder === "desc" ? b.balance - a.balance : a.balance - b.balance;
  }
  if (sortBy === "equity") {
    return sortOrder === "desc" ? b.equity - a.equity : a.equity - b.equity;
  }
  return 0;
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
    case "active": return "bg-green-500";
    case "inactive": return "bg-gray-500";
    case "suspended": return "bg-red-500";
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

return (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">User Management</h2>
        <p className="text-sm text-muted-foreground">
          Manage user accounts and virtual funding
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Total users: {userAccounts.length}
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
                placeholder="Search users..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All KYC</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
    </Card>

    {/* Users Table */}
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
                Showing {sortedUsers.length} of {userAccounts.length} users
              </span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSortBy("full_name");
                        setSortOrder(sortOrder === "desc" && sortBy === "full_name" ? "asc" : "desc");
                      }}
                    >
                      Name
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSortBy("email");
                        setSortOrder(sortOrder === "desc" && sortBy === "email" ? "asc" : "desc");
                      }}
                    >
                      Email
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 text-right"
                      onClick={() => {
                        setSortBy("balance");
                        setSortOrder(sortOrder === "desc" && sortBy === "balance" ? "asc" : "desc");
                      }}
                    >
                      Balance
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 text-right"
                      onClick={() => {
                        setSortBy("equity");
                        setSortOrder(sortOrder === "desc" && sortBy === "equity" ? "asc" : "desc");
                      }}
                    >
                      Equity
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSortBy("created_at");
                        setSortOrder(sortOrder === "desc" && sortBy === "created_at" ? "asc" : "desc");
                      }}
                    >
                      Created
                    </TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Account Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((account) => (
                    <TableRow key={account.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {account.full_name || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {account.email}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(account.balance)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(account.equity)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(account.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getKycColor(account.kyc_status)}`} />
                          {account.kyc_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getStatusColor(account.account_status)}`} />
                          {account.account_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setFundDialog({ open: true, userId: account.id })}
                            className="flex items-center gap-1"
                          >
                            <DollarSign className="h-3 w-3" />
                            Fund
                          </Button>
                          {account.account_status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLogoutAllDevices(account.id)}
                              className="flex items-center gap-1"
                            >
                              <User className="h-3 w-3" />
                              Logout
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {sortedUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your criteria.
              </div>
            )}
          </>
        )}
      </div>
    </Card>

    <FundAccountDialog
      open={fundDialog.open}
      userId={fundDialog.userId}
      onClose={() => setFundDialog({ open: false, userId: null })}
      onSuccess={() => {
        setFundDialog({ open: false, userId: null });
        fetchUserAccounts();
      }}
    />
  </div>
);
};

export default UsersPanel;