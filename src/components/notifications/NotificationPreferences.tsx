import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Preferences {
  email_enabled: boolean;
  toast_enabled: boolean;
  order_notifications: boolean;
  margin_notifications: boolean;
  pnl_notifications: boolean;
  kyc_notifications: boolean;
  price_alert_notifications: boolean;
  risk_notifications: boolean;
}

export function NotificationPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<Preferences>({
    email_enabled: true,
    toast_enabled: true,
    order_notifications: true,
    margin_notifications: true,
    pnl_notifications: true,
    kyc_notifications: true,
    price_alert_notifications: true,
    risk_notifications: true,
  });
  const [loading, setLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!error && data) {
      setPreferences(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchPreferences();
  }, [user, fetchPreferences]);

  const updatePreference = async (key: keyof Preferences, value: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from("notification_preferences")
      .update({ [key]: value })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    } else {
      setPreferences((prev) => ({ ...prev, [key]: value }));
      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
    }
  };

  if (loading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage how you receive notifications about your trading activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium">Delivery Methods</h4>
          <div className="flex items-center justify-between">
            <Label htmlFor="email_enabled" className="flex flex-col space-y-1">
              <span>Email Notifications</span>
              <span className="font-normal text-sm text-muted-foreground">
                Receive notifications via email
              </span>
            </Label>
            <Switch
              id="email_enabled"
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => updatePreference("email_enabled", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="toast_enabled" className="flex flex-col space-y-1">
              <span>In-App Notifications</span>
              <span className="font-normal text-sm text-muted-foreground">
                Show toast notifications in the app
              </span>
            </Label>
            <Switch
              id="toast_enabled"
              checked={preferences.toast_enabled}
              onCheckedChange={(checked) => updatePreference("toast_enabled", checked)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Notification Types</h4>
          <div className="flex items-center justify-between">
            <Label htmlFor="order_notifications" className="flex flex-col space-y-1">
              <span>Order & Position Updates</span>
              <span className="font-normal text-sm text-muted-foreground">
                Filled orders and position changes
              </span>
            </Label>
            <Switch
              id="order_notifications"
              checked={preferences.order_notifications}
              onCheckedChange={(checked) => updatePreference("order_notifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="margin_notifications" className="flex flex-col space-y-1">
              <span>Margin Alerts</span>
              <span className="font-normal text-sm text-muted-foreground">
                Margin calls and warnings
              </span>
            </Label>
            <Switch
              id="margin_notifications"
              checked={preferences.margin_notifications}
              onCheckedChange={(checked) => updatePreference("margin_notifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="pnl_notifications" className="flex flex-col space-y-1">
              <span>P&L Milestones</span>
              <span className="font-normal text-sm text-muted-foreground">
                Profit and loss achievements
              </span>
            </Label>
            <Switch
              id="pnl_notifications"
              checked={preferences.pnl_notifications}
              onCheckedChange={(checked) => updatePreference("pnl_notifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="kyc_notifications" className="flex flex-col space-y-1">
              <span>KYC Updates</span>
              <span className="font-normal text-sm text-muted-foreground">
                Document verification status
              </span>
            </Label>
            <Switch
              id="kyc_notifications"
              checked={preferences.kyc_notifications}
              onCheckedChange={(checked) => updatePreference("kyc_notifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="price_alert_notifications" className="flex flex-col space-y-1">
              <span>Price Alerts</span>
              <span className="font-normal text-sm text-muted-foreground">
                Custom price target notifications
              </span>
            </Label>
            <Switch
              id="price_alert_notifications"
              checked={preferences.price_alert_notifications}
              onCheckedChange={(checked) => updatePreference("price_alert_notifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="risk_notifications" className="flex flex-col space-y-1">
              <span>Risk Events</span>
              <span className="font-normal text-sm text-muted-foreground">
                Critical account and risk alerts
              </span>
            </Label>
            <Switch
              id="risk_notifications"
              checked={preferences.risk_notifications}
              onCheckedChange={(checked) => updatePreference("risk_notifications", checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}