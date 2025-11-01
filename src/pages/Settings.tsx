import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { CheckCircle2 } from "lucide-react";

const Settings = () => {
  const userEmail = localStorage.getItem("userEmail") || "user@tradexpro.com";

  return (
    <AuthenticatedLayout>
      <div className="h-full overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
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
                  <p className="font-medium">{userEmail}</p>
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
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-profit" />
                <div>
                  <p className="font-medium">Verified</p>
                  <p className="text-sm text-muted-foreground">Your identity has been verified</p>
                </div>
              </div>
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
