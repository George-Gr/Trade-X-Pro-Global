import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { usePriceAlerts } from '@/hooks/usePriceAlerts';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Loader2, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { PriceAlertDialog } from './PriceAlertDialog';

export const PriceAlertsManager = () => {
  const { alerts, loading, refresh } = usePriceAlerts();
  const { toast } = useToast();

  const handleDeleteAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      refresh();
      toast({
        title: 'Alert deleted',
        description: 'Price alert has been removed.',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Error deleting alert',
        description: message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-4">
            <Bell className="h-4 w-4" />
            Price Alerts
          </CardTitle>
          <PriceAlertDialog
            symbol="EURUSD"
            currentPrice={1.0856}
            onAlertCreated={refresh}
          />
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No price alerts set</p>
            <p className="text-sm">
              Create alerts to get notified when prices reach your target
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-semibold">{alert.symbol}</span>
                    {alert.condition === 'above' ? (
                      <TrendingUp className="h-4 w-4 text-profit" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-loss" />
                    )}
                    <Badge variant={alert.triggered ? 'secondary' : 'default'}>
                      {alert.triggered ? 'Triggered' : 'Active'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Alert when price{' '}
                    {alert.condition === 'above'
                      ? 'rises above'
                      : 'falls below'}{' '}
                    <span className="font-mono font-semibold">
                      {alert.target_price.toFixed(5)}
                    </span>
                  </div>
                  {alert.triggered && alert.triggered_at && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Triggered {new Date(alert.triggered_at).toLocaleString()}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label={`Delete price alert for ${alert.symbol}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
