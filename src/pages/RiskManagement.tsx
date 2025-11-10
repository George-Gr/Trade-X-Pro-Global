import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { RiskAlerts } from "@/components/risk/RiskAlerts";
import { MarginLevelIndicator } from "@/components/risk/MarginLevelIndicator";
import { Shield, TrendingDown, Lock, AlertTriangle } from "lucide-react";

interface RiskSettings {
  margin_call_level: number;
  stop_out_level: number;
  max_position_size: number;
  max_total_exposure: number;
  max_positions: number;
  daily_loss_limit: number;
  daily_trade_limit: number;
  enforce_stop_loss: boolean;
  min_stop_loss_distance: number;
}

export default function RiskManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<RiskSettings>({
    margin_call_level: 50,
    stop_out_level: 20,
    max_position_size: 10,
    max_total_exposure: 100000,
    max_positions: 10,
    daily_loss_limit: 5000,
    daily_trade_limit: 50,
    enforce_stop_loss: true,
    min_stop_loss_distance: 10,
  });

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('risk_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          margin_call_level: data.margin_call_level,
          stop_out_level: data.stop_out_level,
          max_position_size: data.max_position_size,
          max_total_exposure: data.max_total_exposure,
          max_positions: data.max_positions,
          daily_loss_limit: data.daily_loss_limit,
          daily_trade_limit: data.daily_trade_limit,
          enforce_stop_loss: data.enforce_stop_loss,
          min_stop_loss_distance: data.min_stop_loss_distance,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('risk_settings')
        .update(settings)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Your risk management settings have been updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Risk Management</h1>
            <p className="text-muted-foreground">Configure automated risk controls to protect your account</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <MarginLevelIndicator />
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RiskAlerts />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Margin Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Margin Management
              </CardTitle>
              <CardDescription>Set margin call and stop-out levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="margin_call">Margin Call Level (%)</Label>
                <Input
                  id="margin_call"
                  type="number"
                  value={settings.margin_call_level}
                  onChange={(e) => setSettings({ ...settings, margin_call_level: Number(e.target.value) })}
                  min="0"
                  max="100"
                />
                <p className="text-xs text-muted-foreground">Alert when margin level falls below this percentage</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stop_out">Stop-Out Level (%)</Label>
                <Input
                  id="stop_out"
                  type="number"
                  value={settings.stop_out_level}
                  onChange={(e) => setSettings({ ...settings, stop_out_level: Number(e.target.value) })}
                  min="0"
                  max="100"
                />
                <p className="text-xs text-muted-foreground">Automatically close positions when margin level falls below this</p>
              </div>
            </CardContent>
          </Card>

          {/* Position Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Position Limits
              </CardTitle>
              <CardDescription>Control position sizes and exposure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max_position">Max Position Size (lots)</Label>
                <Input
                  id="max_position"
                  type="number"
                  value={settings.max_position_size}
                  onChange={(e) => setSettings({ ...settings, max_position_size: Number(e.target.value) })}
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_positions">Max Open Positions</Label>
                <Input
                  id="max_positions"
                  type="number"
                  value={settings.max_positions}
                  onChange={(e) => setSettings({ ...settings, max_positions: Number(e.target.value) })}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_exposure">Max Total Exposure ($)</Label>
                <Input
                  id="max_exposure"
                  type="number"
                  value={settings.max_total_exposure}
                  onChange={(e) => setSettings({ ...settings, max_total_exposure: Number(e.target.value) })}
                  min="0"
                  step="1000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Daily Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Limits</CardTitle>
              <CardDescription>Protect against excessive losses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="daily_loss">Daily Loss Limit ($)</Label>
                <Input
                  id="daily_loss"
                  type="number"
                  value={settings.daily_loss_limit}
                  onChange={(e) => setSettings({ ...settings, daily_loss_limit: Number(e.target.value) })}
                  min="0"
                  step="100"
                />
                <p className="text-xs text-muted-foreground">Trading will be suspended if daily loss exceeds this amount</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily_trades">Daily Trade Limit</Label>
                <Input
                  id="daily_trades"
                  type="number"
                  value={settings.daily_trade_limit}
                  onChange={(e) => setSettings({ ...settings, daily_trade_limit: Number(e.target.value) })}
                  min="1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stop-Loss Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Stop-Loss Settings</CardTitle>
              <CardDescription>Automated stop-loss enforcement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enforce_sl">Enforce Stop-Loss</Label>
                <Switch
                  id="enforce_sl"
                  checked={settings.enforce_stop_loss}
                  onCheckedChange={(checked) => setSettings({ ...settings, enforce_stop_loss: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_sl_distance">Min Stop-Loss Distance (pips)</Label>
                <Input
                  id="min_sl_distance"
                  type="number"
                  value={settings.min_stop_loss_distance}
                  onChange={(e) => setSettings({ ...settings, min_stop_loss_distance: Number(e.target.value) })}
                  min="1"
                  disabled={!settings.enforce_stop_loss}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
