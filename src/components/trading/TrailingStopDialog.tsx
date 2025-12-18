import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabaseBrowserClient";
import { useToast } from "@/hooks/use-toast";

interface TrailingStopDialogProps {
  positionId: string;
  symbol: string;
  side: "buy" | "sell";
  currentPrice: number;
  trailingStopEnabled?: boolean;
  trailingStopDistance?: number;
}

export const TrailingStopDialog = ({
  positionId,
  symbol,
  side,
  currentPrice,
  trailingStopEnabled = false,
  trailingStopDistance,
}: TrailingStopDialogProps) => {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(trailingStopEnabled);
  const [distance, setDistance] = useState(
    trailingStopDistance?.toString() || "0.0010",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const distanceValue = parseFloat(distance);

      if (enabled && (isNaN(distanceValue) || distanceValue <= 0)) {
        toast({
          title: "Invalid distance",
          description: "Please enter a valid trailing stop distance.",
          variant: "destructive",
        });
        return;
      }

      const updates: {
        trailing_stop_enabled: boolean;
        trailing_stop_distance: number | null;
        highest_price?: number | null;
        lowest_price?: number | null;
        trailing_stop_price?: number | null;
      } = {
        trailing_stop_enabled: enabled,
        trailing_stop_distance: enabled ? distanceValue : null,
      };

      // Initialize tracking prices if enabling for the first time
      if (enabled && !trailingStopEnabled) {
        updates.highest_price = side === "buy" ? currentPrice : null;
        updates.lowest_price = side === "sell" ? currentPrice : null;
        updates.trailing_stop_price =
          side === "buy"
            ? currentPrice - distanceValue
            : currentPrice + distanceValue;
      }

      const { error } = await supabase
        .from("positions")
        .update(updates)
        .eq("id", positionId);

      if (error) throw error;

      toast({
        title: enabled ? "Trailing stop activated" : "Trailing stop disabled",
        description: enabled
          ? `Trailing stop will follow price at ${distanceValue.toFixed(5)} distance.`
          : "Trailing stop has been disabled.",
      });

      setOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error updating trailing stop",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          Trailing SL
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trailing Stop Loss - {symbol}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="trailing-enabled" className="text-base">
              Enable Trailing Stop
            </Label>
            <Switch
              id="trailing-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {enabled && (
            <>
              <div className="space-y-2">
                <Label>Current Price</Label>
                <Input value={currentPrice.toFixed(5)} disabled />
              </div>

              <div className="space-y-2">
                <Label>Trailing Distance (pips)</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="0.0010"
                />
                <p className="text-xs text-muted-foreground">
                  Stop loss will automatically adjust to maintain this distance
                  as price moves in your favor
                </p>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4 text-sm space-y-2">
                <div className="font-semibold">How it works:</div>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    {side === "buy"
                      ? "As price rises, stop loss moves up to lock in profits"
                      : "As price falls, stop loss moves down to lock in profits"}
                  </li>
                  <li>Stop loss never moves against you</li>
                  <li>Updates automatically with real-time prices</li>
                </ul>
              </div>
            </>
          )}

          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
