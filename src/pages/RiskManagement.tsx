import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatToastError } from "@/lib/errorMessageService";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { RiskAlerts } from "@/components/risk/RiskAlerts";
import { MarginLevelIndicator } from "@/components/risk/MarginLevelIndicator";
import { RiskSettingsForm } from "@/components/risk/RiskSettingsForm";
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

  const fetchSettings = useCallback(async () => {
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
    } catch (err: unknown) {
      const actionableError = formatToastError(err, 'data_fetching');
      toast({
        ...actionableError,
        variant: actionableError.variant === "destructive" ? "destructive" : "default",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchSettings();
  }, [user, fetchSettings]);

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
    } catch (err: unknown) {
      const actionableError = formatToastError(err, 'form_validation');
      toast({
        ...actionableError,
        variant: actionableError.variant === "destructive" ? "destructive" : "default",
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
      <div className="h-full overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="typography-h1 tracking-tight">Risk Management</h1>
              <p className="text-muted-foreground">
                Monitor and configure your trading risk parameters
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-2 pb-4">
                <CardTitle className="text-sm font-medium">Margin Level</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <MarginLevelIndicator />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-2 pb-4">
                <CardTitle className="text-sm font-medium">Daily P&L</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0.00</div>
                <p className="text-xs text-muted-foreground">
                  Limit: ${settings.daily_loss_limit.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-2 pb-4">
                <CardTitle className="text-sm font-medium">Max Positions</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 / {settings.max_positions}</div>
                <p className="text-xs text-muted-foreground">
                  Open positions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-2 pb-4">
                <CardTitle className="text-sm font-medium">Stop Loss</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {settings.enforce_stop_loss ? "Required" : "Optional"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Protection status
                </p>
              </CardContent>
            </Card>
          </div>

          <RiskAlerts />

          <RiskSettingsForm />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
