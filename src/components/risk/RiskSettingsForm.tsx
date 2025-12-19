import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseBrowserClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Shield, Save, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { validationRules } from '@/lib/validationRules';

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

export const RiskSettingsForm = () => {
  const queryClient = useQueryClient();
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

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      margin_call_level: 50,
      stop_out_level: 20,
      max_position_size: 10,
      max_total_exposure: 100000,
      max_positions: 10,
      daily_loss_limit: 5000,
      daily_trade_limit: 50,
      enforce_stop_loss: true,
      min_stop_loss_distance: 10,
    },
  });

  const {
    register,
    formState: { errors },
  } = form;

  const { data: userSettings, isLoading } = useQuery({
    queryKey: ['risk-settings'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (newSettings: RiskSettings) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('risk_settings')
        .update(newSettings)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Risk settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['risk-settings'] });
    },
    onError: (error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(settings);
  };

  if (isLoading) {
    return <div>Loading risk settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-4">
              <Shield className="h-4 w-4" />
              Risk Management Settings
            </CardTitle>
            <CardDescription>
              Configure your account risk parameters and limits
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Changes take effect immediately
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Margin Levels */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Margin Levels</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="margin_call_level">
                  Margin Call Level (%)
                  <span className="text-xs text-muted-foreground ml-2">
                    Warning threshold
                  </span>
                </Label>
                <Input
                  id="margin_call_level"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  {...register('margin_call_level', {
                    required: 'Margin call level is required',
                    min: { value: 0, message: 'Must be at least 0' },
                    validate: (value: number) =>
                      (!isNaN(value) && value >= 0) ||
                      'Please enter a valid amount',
                  })}
                  value={settings.margin_call_level}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      margin_call_level: parseFloat(e.target.value),
                    })
                  }
                />
                {errors.margin_call_level && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.margin_call_level.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  You'll be notified when margin level drops below this
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stop_out_level">
                  Stop Out Level (%)
                  <span className="text-xs text-muted-foreground ml-2">
                    Liquidation threshold
                  </span>
                </Label>
                <Input
                  id="stop_out_level"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  {...register('stop_out_level', {
                    required: 'Stop out level is required',
                    min: { value: 0, message: 'Must be at least 0' },
                    validate: (value: number) =>
                      (!isNaN(value) && value >= 0) ||
                      'Please enter a valid amount',
                  })}
                  value={settings.stop_out_level}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      stop_out_level: parseFloat(e.target.value),
                    })
                  }
                />
                {errors.stop_out_level && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.stop_out_level.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Automatic liquidation starts at this level
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Position Limits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Position Limits</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="max_position_size">
                  Max Position Size (lots)
                </Label>
                <Input
                  id="max_position_size"
                  type="number"
                  min="0.01"
                  step="0.01"
                  {...register('max_position_size', {
                    required: 'Max position size is required',
                    min: { value: 0.01, message: 'Must be at least 0.01' },
                    validate: (value: number) =>
                      (!isNaN(value) && value > 0) ||
                      'Please enter a valid amount',
                  })}
                  value={settings.max_position_size}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_position_size: parseFloat(e.target.value),
                    })
                  }
                />
                {errors.max_position_size && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.max_position_size.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_positions">Max Open Positions</Label>
                <Input
                  id="max_positions"
                  type="number"
                  min="1"
                  step="1"
                  {...register('max_positions', {
                    required: 'Max positions is required',
                    min: { value: 1, message: 'Must be at least 1' },
                    validate: (value: number) =>
                      (!isNaN(value) && value >= 1) ||
                      'Please enter a valid amount',
                  })}
                  value={settings.max_positions}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_positions: parseInt(e.target.value),
                    })
                  }
                />
                {errors.max_positions && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.max_positions.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_total_exposure">
                  Max Total Exposure ($)
                </Label>
                <Input
                  id="max_total_exposure"
                  type="number"
                  min="0"
                  step="1000"
                  {...register('max_total_exposure', {
                    required: 'Max total exposure is required',
                    min: { value: 0, message: 'Must be at least 0' },
                    validate: (value: number) =>
                      (!isNaN(value) && value >= 0) ||
                      'Please enter a valid amount',
                  })}
                  value={settings.max_total_exposure}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_total_exposure: parseFloat(e.target.value),
                    })
                  }
                />
                {errors.max_total_exposure && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.max_total_exposure.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Daily Limits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Daily Limits</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="daily_loss_limit">Daily Loss Limit ($)</Label>
                <Input
                  id="daily_loss_limit"
                  type="number"
                  min="0"
                  step="100"
                  {...register('daily_loss_limit', {
                    required: 'Daily loss limit is required',
                    min: { value: 0, message: 'Must be at least 0' },
                    validate: (value: number) =>
                      (!isNaN(value) && value >= 0) ||
                      'Please enter a valid amount',
                  })}
                  value={settings.daily_loss_limit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      daily_loss_limit: parseFloat(e.target.value),
                    })
                  }
                />
                {errors.daily_loss_limit && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.daily_loss_limit.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Trading stops when daily loss reaches this amount
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily_trade_limit">Daily Trade Limit</Label>
                <Input
                  id="daily_trade_limit"
                  type="number"
                  min="1"
                  step="1"
                  {...register('daily_trade_limit', {
                    required: 'Daily trade limit is required',
                    min: { value: 1, message: 'Must be at least 1' },
                    validate: (value: number) =>
                      (!isNaN(value) && value >= 1) ||
                      'Please enter a valid amount',
                  })}
                  value={settings.daily_trade_limit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      daily_trade_limit: parseInt(e.target.value),
                    })
                  }
                />
                {errors.daily_trade_limit && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.daily_trade_limit.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Maximum number of trades per day
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Stop Loss Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stop Loss Protection</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-2.5">
                <Label htmlFor="enforce_stop_loss">Enforce Stop Loss</Label>
                <p className="text-sm text-muted-foreground">
                  Require stop loss on all new positions
                </p>
              </div>
              <Switch
                id="enforce_stop_loss"
                checked={settings.enforce_stop_loss}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enforce_stop_loss: checked })
                }
              />
            </div>

            {settings.enforce_stop_loss && (
              <div className="space-y-2">
                <Label htmlFor="min_stop_loss_distance">
                  Minimum Stop Loss Distance (pips)
                </Label>
                <Input
                  id="min_stop_loss_distance"
                  type="number"
                  min="1"
                  step="1"
                  {...register('min_stop_loss_distance', {
                    required: 'Min stop loss distance is required',
                    min: { value: 1, message: 'Must be at least 1' },
                    validate: (value: number) =>
                      (!isNaN(value) && value >= 1) ||
                      'Please enter a valid amount',
                  })}
                  value={settings.min_stop_loss_distance}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      min_stop_loss_distance: parseFloat(e.target.value),
                    })
                  }
                />
                {errors.min_stop_loss_distance && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.min_stop_loss_distance.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="submit" disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
