import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, Users, FileCheck, DollarSign, LogOut, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface KYCSubmission {
  id: string;
  name: string;
  email: string;
  country: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  balance: number;
  equity: number;
  status: "active" | "suspended";
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@example.com",
      country: "United States",
      submittedAt: "2025-10-30 14:32",
      status: "pending",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      country: "United Kingdom",
      submittedAt: "2025-10-30 11:15",
      status: "pending",
    },
    {
      id: "3",
      name: "Michael Chen",
      email: "m.chen@example.com",
      country: "Canada",
      submittedAt: "2025-10-29 16:45",
      status: "approved",
    },
  ]);

  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([
    {
      id: "3",
      name: "Michael Chen",
      email: "m.chen@example.com",
      balance: 50000,
      equity: 50234.5,
      status: "active",
    },
  ]);

  const handleKYCAction = (id: string, action: "approve" | "reject") => {
    setKycSubmissions((prev) =>
      prev.map((submission) =>
        submission.id === id
          ? { ...submission, status: action === "approve" ? "approved" : "rejected" }
          : submission
      )
    );

    if (action === "approve") {
      const submission = kycSubmissions.find((s) => s.id === id);
      if (submission) {
        setUserAccounts((prev) => [
          ...prev,
          {
            id: submission.id,
            name: submission.name,
            email: submission.email,
            balance: 50000,
            equity: 50000,
            status: "active",
          },
        ]);
      }
    }

    toast({
      title: action === "approve" ? "KYC Approved" : "KYC Rejected",
      description: `Application ${action}d successfully`,
    });
  };

  const handleFundAccount = (id: string) => {
    const amount = prompt("Enter amount to add (e.g., 10000):");
    if (amount && !isNaN(Number(amount))) {
      setUserAccounts((prev) =>
        prev.map((account) =>
          account.id === id
            ? {
                ...account,
                balance: account.balance + Number(amount),
                equity: account.equity + Number(amount),
              }
            : account
        )
      );
      toast({
        title: "Account Funded",
        description: `Added $${amount} to account`,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="font-bold">TradeX Pro</span>
          <Badge variant="outline" className="ml-2 text-xs">Admin</Badge>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage KYC submissions and user accounts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending KYC</p>
                <p className="text-2xl font-bold">
                  {kycSubmissions.filter((s) => s.status === "pending").length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{userAccounts.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
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
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-profit/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-profit" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Approved Today</p>
                <p className="text-2xl font-bold">
                  {kycSubmissions.filter((s) => s.status === "approved").length}
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
                <h2 className="text-lg font-semibold mb-4">Pending KYC Verifications</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kycSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {submission.email}
                        </TableCell>
                        <TableCell>{submission.country}</TableCell>
                        <TableCell className="text-sm">{submission.submittedAt}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              submission.status === "approved"
                                ? "default"
                                : submission.status === "rejected"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {submission.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {submission.status === "pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleKYCAction(submission.id, "reject")}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleKYCAction(submission.id, "approve")}
                              >
                                Approve
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {submission.status === "approved" ? "Approved" : "Rejected"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* User Accounts */}
          <TabsContent value="accounts">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Active User Accounts</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Equity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.name}</TableCell>
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
                          <Badge variant={account.status === "active" ? "default" : "outline"}>
                            {account.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFundAccount(account.id)}
                            >
                              <DollarSign className="h-3 w-3 mr-1" />
                              Fund
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
