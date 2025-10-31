import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface TradingPanelProps {
  symbol: string;
}

const TradingPanel = ({ symbol }: TradingPanelProps) => {
  const [volume, setVolume] = useState("0.01");
  const [leverage, setLeverage] = useState("100");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const { toast } = useToast();

  const handleTrade = (type: "buy" | "sell") => {
    toast({
      title: `${type === "buy" ? "Buy" : "Sell"} Order Executed`,
      description: `${volume} lots of ${symbol} at ${type === "buy" ? "Ask" : "Bid"} price`,
    });
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
                <span className="font-semibold">$108.56</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pip Value:</span>
                <span className="font-semibold">$0.10</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                onClick={() => handleTrade("sell")}
                className="bg-sell hover:bg-sell-hover text-sell-foreground h-12 font-semibold"
              >
                SELL
              </Button>
              <Button
                onClick={() => handleTrade("buy")}
                className="bg-buy hover:bg-buy-hover text-buy-foreground h-12 font-semibold"
              >
                BUY
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
    </div>
  );
};

export default TradingPanel;
