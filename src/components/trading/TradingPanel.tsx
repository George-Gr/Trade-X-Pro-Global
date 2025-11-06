import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useOrderExecution } from "@/hooks/useOrderExecution";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface TradingPanelProps {
  symbol: string;
}

const TradingPanel = ({ symbol }: TradingPanelProps) => {
  const [volume, setVolume] = useState("0.01");
  const [leverage, setLeverage] = useState("100");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<{ side: "buy" | "sell" } | null>(null);
  
  const { toast } = useToast();
  const { executeOrder, isExecuting } = useOrderExecution();

  // Calculate margin required
  const marginRequired = useMemo(() => {
    const qty = parseFloat(volume) || 0;
    const lev = parseFloat(leverage) || 100;
    const contractSize = 100000; // Standard lot
    const estimatedPrice = 1.0856; // Placeholder - would be from live price
    
    if (qty <= 0 || lev <= 0) return 0;
    
    return (qty * contractSize * estimatedPrice) / lev;
  }, [volume, leverage]);

  // Calculate pip value
  const pipValue = useMemo(() => {
    const qty = parseFloat(volume) || 0;
    const pipSize = 0.0001;
    const contractSize = 100000;
    
    return qty * contractSize * pipSize;
  }, [volume]);

  const validateInputs = (): string | null => {
    const qty = parseFloat(volume);
    
    if (isNaN(qty) || qty <= 0) {
      return "Please enter a valid volume greater than 0";
    }
    
    if (qty < 0.01) {
      return "Minimum volume is 0.01 lots";
    }
    
    if (qty > 1000) {
      return "Maximum volume is 1000 lots";
    }
    
    if (stopLoss) {
      const sl = parseFloat(stopLoss);
      if (isNaN(sl) || sl <= 0) {
        return "Stop loss must be a valid price";
      }
    }
    
    if (takeProfit) {
      const tp = parseFloat(takeProfit);
      if (isNaN(tp) || tp <= 0) {
        return "Take profit must be a valid price";
      }
    }
    
    return null;
  };

  const handleTrade = (side: "buy" | "sell") => {
    const validationError = validateInputs();
    
    if (validationError) {
      toast({
        title: "Invalid Input",
        description: validationError,
        variant: "destructive",
      });
      return;
    }
    
    // Open confirmation dialog
    setPendingOrder({ side });
    setConfirmDialogOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (!pendingOrder) return;
    
    setConfirmDialogOpen(false);
    
    const result = await executeOrder({
      symbol,
      order_type: 'market',
      side: pendingOrder.side,
      quantity: parseFloat(volume),
      stop_loss: stopLoss ? parseFloat(stopLoss) : undefined,
      take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
    });
    
    if (result) {
      // Clear form on success
      setVolume("0.01");
      setStopLoss("");
      setTakeProfit("");
    }
    
    setPendingOrder(null);
  };

  const handleCancelOrder = () => {
    setConfirmDialogOpen(false);
    setPendingOrder(null);
  };

  return (
    <div className="bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold">Trade {symbol}</h2>
        <p className="text-xs text-muted-foreground mt-1">Place order</p>
      </div>

      <div className="p-4 space-y-4">
        <Tabs defaultValue="market" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="limit">Limit</TabsTrigger>
            <TabsTrigger value="stop">Stop</TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Volume (Lots)</Label>
              <Input
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                step="0.01"
                min="0.01"
                placeholder="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label>Leverage</Label>
              <Select value={leverage} onValueChange={setLeverage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">1:30</SelectItem>
                  <SelectItem value="50">1:50</SelectItem>
                  <SelectItem value="100">1:100</SelectItem>
                  <SelectItem value="200">1:200</SelectItem>
                  <SelectItem value="500">1:500</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Stop Loss</Label>
                <Input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="Optional"
                  step="0.0001"
                />
              </div>
              <div className="space-y-2">
                <Label>Take Profit</Label>
                <Input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder="Optional"
                  step="0.0001"
                />
              </div>
            </div>

            <div className="bg-secondary/30 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Margin Required:</span>
                <span className="font-semibold">${marginRequired.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pip Value:</span>
                <span className="font-semibold">${pipValue.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                onClick={() => handleTrade("sell")}
                disabled={isExecuting}
                className="bg-sell hover:bg-sell-hover text-sell-foreground h-12 font-semibold"
              >
                {isExecuting && pendingOrder?.side === "sell" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  "SELL"
                )}
              </Button>
              <Button
                onClick={() => handleTrade("buy")}
                disabled={isExecuting}
                className="bg-buy hover:bg-buy-hover text-buy-foreground h-12 font-semibold"
              >
                {isExecuting && pendingOrder?.side === "buy" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  "BUY"
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="limit" className="space-y-4 mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Limit order functionality</p>
              <p className="text-xs mt-1">Coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="stop" className="space-y-4 mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Stop order functionality</p>
              <p className="text-xs mt-1">Coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Order</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Please review your order details:</p>
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Symbol:</span>
                    <span className="font-semibold">{symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Side:</span>
                    <span className={`font-semibold ${pendingOrder?.side === 'buy' ? 'text-buy' : 'text-sell'}`}>
                      {pendingOrder?.side.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume:</span>
                    <span className="font-semibold">{volume} lots</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Type:</span>
                    <span className="font-semibold">Market</span>
                  </div>
                  {stopLoss && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stop Loss:</span>
                      <span className="font-semibold">{stopLoss}</span>
                    </div>
                  )}
                  {takeProfit && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Take Profit:</span>
                      <span className="font-semibold">{takeProfit}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-muted-foreground">Margin Required:</span>
                    <span className="font-semibold">${marginRequired.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  This order will be executed at the current market price. Are you sure you want to proceed?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelOrder}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmOrder}
              className={pendingOrder?.side === 'buy' ? 'bg-buy hover:bg-buy-hover' : 'bg-sell hover:bg-sell-hover'}
            >
              Confirm {pendingOrder?.side === 'buy' ? 'Buy' : 'Sell'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TradingPanel;
