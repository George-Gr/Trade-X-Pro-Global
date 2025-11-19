import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Bell, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { PriceAlertDialog } from "./PriceAlertDialog";

interface PriceAlert {
  id: string;
  symbol: string;
  target_price: number;
  condition: string;
  triggered: boolean;
  created_at: string;
  triggered_at?: string;
}

export const PriceAlertsManager = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error loading alerts",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleDeleteAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setAlerts(alerts.filter((a) => a.id !== id));
      toast({
        title: "Alert deleted",
        description: "Price alert has been removed.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error deleting alert",
        description: message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("price_alerts_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "price_alerts",
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAlerts]);

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
          <PriceAlertDialog symbol="EURUSD" currentPrice={1.0856} onAlertCreated={fetchAlerts} />
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No price alerts set</p>
            <p className="text-sm">Create alerts to get notified when prices reach your target</p>
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
                    {alert.condition === "above" ? (
                      <TrendingUp className="h-4 w-4 text-profit" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-loss" />
                    )}
                    <Badge variant={alert.triggered ? "secondary" : "default"}>
                      {alert.triggered ? "Triggered" : "Active"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Alert when price {alert.condition === "above" ? "rises above" : "falls below"}{" "}
                    <span className="font-mono font-semibold">{alert.target_price.toFixed(5)}</span>
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
