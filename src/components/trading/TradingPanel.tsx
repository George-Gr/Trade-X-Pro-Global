import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useOrderExecution } from "@/hooks/useOrderExecution";
import { usePriceUpdates } from "@/hooks/usePriceUpdates";
import { OrderTemplatesDialog } from "./OrderTemplatesDialog";
import { OrderTemplate } from "@/hooks/useOrderTemplates";
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
import { Loader2, TrendingUp, TrendingDown, Zap } from "lucide-react";

interface TradingPanelProps {
  symbol: string;
}

const TradingPanel = ({ symbol }: TradingPanelProps) => {
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop' | 'stop_limit'>('market');
  const [volume, setVolume] = useState("0.01");
  const [leverage, setLeverage] = useState("100");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [stopLimitPrice, setStopLimitPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<{ side: "buy" | "sell" } | null>(null);
  const [oneClickMode, setOneClickMode] = useState(false);
  const [quickVolumes] = useState([0.01, 0.1, 0.5, 1.0]);
  
  const { toast } = useToast();
  const { executeOrder, isExecuting } = useOrderExecution();
  
  // Get real-time price updates
  const { getPrice, isLoading: isPriceLoading } = usePriceUpdates({
    symbols: [symbol],
    intervalMs: 2000,
    enabled: true,
  });

  const priceData = getPrice(symbol);
  const currentPrice = priceData?.currentPrice || 1.0856;
  const bid = priceData?.bid || currentPrice * 0.9999;
  const ask = priceData?.ask || currentPrice * 1.0001;

  // Calculate margin required using real price
  const marginRequired = useMemo(() => {
    const qty = parseFloat(volume) || 0;
    const lev = parseFloat(leverage) || 100;
    const contractSize = 100000; // Standard lot
    
    if (qty <= 0 || lev <= 0) return 0;
    
    return (qty * contractSize * currentPrice) / lev;
  }, [volume, leverage, currentPrice]);

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
    
    // Validate limit price for limit orders
    if (orderType === 'limit') {
      const price = parseFloat(limitPrice);
      if (isNaN(price) || price <= 0) {
        return "Please enter a valid limit price";
      }
    }
    
    // Validate stop price for stop orders
    if (orderType === 'stop') {
      const price = parseFloat(stopPrice);
      if (isNaN(price) || price <= 0) {
        return "Please enter a valid stop price";
      }
    }
    
    // Validate stop limit order prices
    if (orderType === 'stop_limit') {
      const sPrice = parseFloat(stopPrice);
      const lPrice = parseFloat(stopLimitPrice);
      if (isNaN(sPrice) || sPrice <= 0) {
        return "Please enter a valid stop price";
      }
      if (isNaN(lPrice) || lPrice <= 0) {
        return "Please enter a valid limit price";
      }
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
    
    // In one-click mode, execute immediately
    if (oneClickMode) {
      handleConfirmOrder({ side });
    } else {
      // Open confirmation dialog
      setPendingOrder({ side });
      setConfirmDialogOpen(true);
    }
  };

  const handleQuickTrade = (side: "buy" | "sell", quickVolume: number) => {
    const tempVolume = volume;
    setVolume(quickVolume.toString());
    
    handleConfirmOrder({ side });
    
    // Restore original volume after trade
    setTimeout(() => setVolume(tempVolume), 100);
  };

  const handleApplyTemplate = (template: OrderTemplate) => {
    setVolume(template.volume.toString());
    setLeverage(template.leverage.toString());
    setOrderType(template.order_type);
    
    if (template.stop_loss) setStopLoss(template.stop_loss.toString());
    if (template.take_profit) setTakeProfit(template.take_profit.toString());
    
    toast({
      title: "Template applied",
      description: `"${template.name}" settings loaded.`,
    });
  };

  const handleConfirmOrder = async (order?: { side: "buy" | "sell" }) => {
    const orderToExecute = order || pendingOrder;
    if (!orderToExecute) return;
    
    setConfirmDialogOpen(false);
    
    // Determine price based on order type
    let orderPrice: number | undefined;
    if (orderType === 'limit') {
      orderPrice = parseFloat(limitPrice);
    } else if (orderType === 'stop') {
      orderPrice = parseFloat(stopPrice);
    } else if (orderType === 'stop_limit') {
      orderPrice = parseFloat(stopLimitPrice);
    }
    
    const result = await executeOrder({
      symbol,
      order_type: orderType,
      side: orderToExecute.side,
      quantity: parseFloat(volume),
      price: orderPrice,
      stop_loss: stopLoss ? parseFloat(stopLoss) : undefined,
      take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
    });
    
    if (result) {
      // Clear form on success
      setVolume("0.01");
      setLimitPrice("");
      setStopPrice("");
      setStopLimitPrice("");
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
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Trade {symbol}</h2>
            <p className="text-xs text-muted-foreground mt-1">Place order</p>
          </div>
          <OrderTemplatesDialog
            onApplyTemplate={handleApplyTemplate}
            currentValues={{
              symbol,
              order_type: orderType,
              volume,
              leverage,
              stopLoss,
              takeProfit,
            }}
          />
        </div>
        
        {/* One-Click Trading Toggle */}
        <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-semibold">One-Click Trading</div>
              <div className="text-xs text-muted-foreground">Execute instantly without confirmation</div>
            </div>
          </div>
          <Switch checked={oneClickMode} onCheckedChange={setOneClickMode} />
        </div>

        {/* Quick Volume Buttons - Only show in one-click mode */}
        {oneClickMode && (
          <div className="space-y-2">
            <Label className="text-xs">Quick Trade Volumes</Label>
            <div className="grid grid-cols-4 gap-2">
              {quickVolumes.map((vol) => (
                <div key={vol} className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickTrade("buy", vol)}
                    disabled={isExecuting}
                    className="w-full bg-buy/10 hover:bg-buy/20 text-buy border-buy/20"
                  >
                    {vol}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickTrade("sell", vol)}
                    disabled={isExecuting}
                    className="w-full bg-sell/10 hover:bg-sell/20 text-sell border-sell/20"
                  >
                    {vol}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        <Tabs defaultValue="market" className="w-full" onValueChange={(v) => setOrderType(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="limit">Limit</TabsTrigger>
            <TabsTrigger value="stop">Stop</TabsTrigger>
            <TabsTrigger value="stop_limit">Stop Limit</TabsTrigger>
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

            {/* Live Price Display */}
            <div className="bg-card border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Live Price</span>
                {isPriceLoading && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">BID</div>
                  <div className="text-lg font-mono font-semibold text-sell">
                    {bid.toFixed(5)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">ASK</div>
                  <div className="text-lg font-mono font-semibold text-buy">
                    {ask.toFixed(5)}
                  </div>
                </div>
              </div>

              {priceData && (
                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <span className="text-muted-foreground">Change:</span>
                  <div className={`flex items-center gap-1 font-semibold ${
                    priceData.change >= 0 ? 'text-profit' : 'text-loss'
                  }`}>
                    {priceData.change >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {priceData.change >= 0 ? '+' : ''}{priceData.change.toFixed(5)} ({priceData.changePercent.toFixed(2)}%)
                  </div>
                </div>
              )}
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
            <div className="space-y-2">
              <Label>Limit Price</Label>
              <Input
                type="number"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                step="0.0001"
                placeholder={`e.g., ${currentPrice.toFixed(5)}`}
              />
              <p className="text-xs text-muted-foreground">
                Order will execute when market reaches this price
              </p>
            </div>

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

            {/* Live Price Display */}
            <div className="bg-card border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Current Market Price</span>
                {isPriceLoading && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">BID</div>
                  <div className="text-lg font-mono font-semibold text-sell">
                    {bid.toFixed(5)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">ASK</div>
                  <div className="text-lg font-mono font-semibold text-buy">
                    {ask.toFixed(5)}
                  </div>
                </div>
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
                    Placing...
                  </>
                ) : (
                  "SELL LIMIT"
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
                    Placing...
                  </>
                ) : (
                  "BUY LIMIT"
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="stop" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Stop Price</Label>
              <Input
                type="number"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                step="0.0001"
                placeholder={`e.g., ${currentPrice.toFixed(5)}`}
              />
              <p className="text-xs text-muted-foreground">
                Market order triggers when price reaches this level
              </p>
            </div>

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

            {/* Live Price Display */}
            <div className="bg-card border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Current Market Price</span>
                {isPriceLoading && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">BID</div>
                  <div className="text-lg font-mono font-semibold text-sell">
                    {bid.toFixed(5)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">ASK</div>
                  <div className="text-lg font-mono font-semibold text-buy">
                    {ask.toFixed(5)}
                  </div>
                </div>
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
                    Placing...
                  </>
                ) : (
                  "SELL STOP"
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
                    Placing...
                  </>
                ) : (
                  "BUY STOP"
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="stop_limit" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Stop Price</Label>
              <Input
                type="number"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                step="0.0001"
                placeholder={`e.g., ${currentPrice.toFixed(5)}`}
              />
              <p className="text-xs text-muted-foreground">
                Limit order triggers when price reaches this level
              </p>
            </div>

            <div className="space-y-2">
              <Label>Limit Price</Label>
              <Input
                type="number"
                value={stopLimitPrice}
                onChange={(e) => setStopLimitPrice(e.target.value)}
                step="0.0001"
                placeholder={`e.g., ${currentPrice.toFixed(5)}`}
              />
              <p className="text-xs text-muted-foreground">
                Order executes at this price once triggered
              </p>
            </div>

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

            {/* Live Price Display */}
            <div className="bg-card border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Current Market Price</span>
                {isPriceLoading && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">BID</div>
                  <div className="text-lg font-mono font-semibold text-sell">
                    {bid.toFixed(5)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">ASK</div>
                  <div className="text-lg font-mono font-semibold text-buy">
                    {ask.toFixed(5)}
                  </div>
                </div>
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
                    Placing...
                  </>
                ) : (
                  "SELL STOP LIMIT"
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
                    Placing...
                  </>
                ) : (
                  "BUY STOP LIMIT"
                )}
              </Button>
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
                    <span className="font-semibold capitalize">{orderType.replace('_', ' ')}</span>
                  </div>
                  {orderType === 'limit' && limitPrice && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Limit Price:</span>
                      <span className="font-semibold">{limitPrice}</span>
                    </div>
                  )}
                  {orderType === 'stop' && stopPrice && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stop Price:</span>
                      <span className="font-semibold">{stopPrice}</span>
                    </div>
                  )}
                  {orderType === 'stop_limit' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stop Price:</span>
                        <span className="font-semibold">{stopPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Limit Price:</span>
                        <span className="font-semibold">{stopLimitPrice}</span>
                      </div>
                    </>
                  )}
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
                  {orderType === 'market' 
                    ? 'This order will be executed at the current market price.'
                    : orderType === 'limit'
                    ? 'This limit order will execute when the market reaches your specified price.'
                    : orderType === 'stop'
                    ? 'This stop order will trigger a market order when the stop price is reached.'
                    : 'This stop limit order will trigger a limit order when the stop price is reached.'}
                  {' '}Are you sure you want to proceed?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelOrder}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleConfirmOrder()}
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
