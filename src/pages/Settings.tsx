import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseBrowserClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { CheckCircle2, Clock, XCircle, Loader2, Bell } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState<string>("pending");
  const [isLoading, setIsLoading] = useState(true);

  const fetchKYCStatus = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("kyc_status")
      .eq("id", user.id)
      .single();

    if (data && !error) {
      setKycStatus(data.kyc_status);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchKYCStatus();
    }
  }, [user, fetchKYCStatus]);

  return (
    <AuthenticatedLayout>
      <div className="h-full overflow-auto">
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and information</p>
          </div>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal and account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{user?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="font-medium">Demo #12345</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <Badge variant="outline">Paper Trading</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <Badge className="bg-profit">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KYC Status */}
          <Card>
            <CardHeader>
              <CardTitle>KYC Verification</CardTitle>
              <CardDescription>Identity verification status</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading status...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {kycStatus === "approved" ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-profit" />
                          <div>
                            <p className="font-medium">Verified</p>
                            <p className="text-sm text-muted-foreground">
                              Your identity has been verified
                            </p>
                          </div>
                        </>
                      ) : kycStatus === "rejected" ? (
                        <>
                          <XCircle className="h-4 w-4 text-loss" />
                          <div>
                            <p className="font-medium">Rejected</p>
                            <p className="text-sm text-muted-foreground">
                              Please review and resubmit documents
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-amber-500" />
                          <div>
                            <p className="font-medium">Pending Verification</p>
                            <p className="text-sm text-muted-foreground">
                              Submit your documents to get verified
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    {kycStatus !== "approved" && (
                      <Button onClick={() => navigate("/kyc")}>
                        {kycStatus === "rejected" ? "Resubmit" : "Submit Documents"}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Trading Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Trading Preferences</CardTitle>
              <CardDescription>Configure your trading experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Default Leverage</p>
                <p className="font-medium">1:100</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Default Order Type</p>
                <p className="font-medium">Market</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Default Volume</p>
                <p className="font-medium">0.01 lots</p>
              </div>
            </CardContent>
          </Card>

          {/* Risk Management */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Management</CardTitle>
              <CardDescription>Your account risk settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Maximum Leverage</p>
                <p className="font-medium">1:500 (Varies by asset)</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Margin Call Level</p>
                <p className="font-medium">50%</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Stop Out Level</p>
                <p className="font-medium">20%</p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Advanced Risk Settings</p>
                  <p className="text-sm text-muted-foreground">
                    Configure position limits, daily loss limits, and more
                  </p>
                </div>
                <Button onClick={() => navigate("/risk-management")} variant="outline">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                <Bell className="h-4 w-4" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Manage Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Set up email and in-app notification preferences
                  </p>
                </div>
                <Button onClick={() => navigate("/notifications")} variant="outline">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Legal Disclaimer */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="text-amber-500">Important Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                TradeX Pro is a paper trading platform for educational and practice purposes only. 
                No real funds are involved. All trading activity is simulated. This platform is not 
                affiliated with IC Markets or any regulated financial institution.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Settings;
