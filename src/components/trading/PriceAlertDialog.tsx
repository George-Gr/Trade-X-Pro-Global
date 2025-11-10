import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PriceAlertDialogProps {
  symbol: string;
  currentPrice: number;
  onAlertCreated?: () => void;
}

export const PriceAlertDialog = ({ symbol, currentPrice, onAlertCreated }: PriceAlertDialogProps) => {
  const [open, setOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCreateAlert = async () => {
    try {
      setIsSubmitting(true);
      const price = parseFloat(targetPrice);

      if (isNaN(price) || price <= 0) {
        toast({
          title: "Invalid price",
          description: "Please enter a valid target price.",
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("price_alerts")
        .insert({
          user_id: user.id,
          symbol,
          target_price: price,
          condition,
        });

      if (error) throw error;

      toast({
        title: "Price alert created",
        description: `You'll be notified when ${symbol} ${condition === "above" ? "rises above" : "falls below"} ${price.toFixed(5)}.`,
      });

      setOpen(false);
      setTargetPrice("");
      if (onAlertCreated) onAlertCreated();
    } catch (error: any) {
      toast({
        title: "Error creating alert",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Price Alert for {symbol}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Price</Label>
            <Input value={currentPrice.toFixed(5)} disabled />
          </div>
          <div className="space-y-2">
            <Label>Condition</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v as "above" | "below")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Price rises above</SelectItem>
                <SelectItem value="below">Price falls below</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Target Price</Label>
            <Input
              type="number"
              step="0.00001"
              placeholder="Enter target price"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateAlert} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create Alert"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
