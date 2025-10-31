import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketWatchProps {
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string;
}

interface MarketData {
  symbol: string;
  name: string;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
}

const MarketWatch = ({ onSelectSymbol, selectedSymbol }: MarketWatchProps) => {
  const [marketData, setMarketData] = useState<MarketData[]>([
    { symbol: "EURUSD", name: "Euro vs US Dollar", bid: 1.0856, ask: 1.0858, change: 0.0012, changePercent: 0.11 },
    { symbol: "GBPUSD", name: "British Pound vs US Dollar", bid: 1.2634, ask: 1.2636, change: -0.0008, changePercent: -0.06 },
    { symbol: "USDJPY", name: "US Dollar vs Japanese Yen", bid: 149.45, ask: 149.47, change: 0.23, changePercent: 0.15 },
    { symbol: "XAUUSD", name: "Gold vs US Dollar", bid: 2028.50, ask: 2029.20, change: 5.80, changePercent: 0.29 },
    { symbol: "BTCUSD", name: "Bitcoin vs US Dollar", bid: 43250.00, ask: 43280.00, change: -120.50, changePercent: -0.28 },
    { symbol: "US500", name: "S&P 500 Index", bid: 4582.23, ask: 4582.75, change: 12.34, changePercent: 0.27 },
    { symbol: "AAPL", name: "Apple Inc", bid: 178.42, ask: 178.45, change: 1.23, changePercent: 0.69 },
    { symbol: "TSLA", name: "Tesla Inc", bid: 242.18, ask: 242.25, change: -3.45, changePercent: -1.40 },
  ]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData((prev) =>
        prev.map((item) => {
          const variation = (Math.random() - 0.5) * 0.002;
          const newBid = item.bid * (1 + variation);
          const newAsk = newBid + (item.ask - item.bid);
          const newChange = newBid - (item.bid - item.change);
          const newChangePercent = (newChange / (newBid - newChange)) * 100;

          return {
            ...item,
            bid: parseFloat(newBid.toFixed(item.symbol.includes("JPY") ? 2 : 4)),
            ask: parseFloat(newAsk.toFixed(item.symbol.includes("JPY") ? 2 : 4)),
            change: parseFloat(newChange.toFixed(4)),
            changePercent: parseFloat(newChangePercent.toFixed(2)),
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold">Market Watch</h2>
        <p className="text-xs text-muted-foreground mt-1">Real-time quotes</p>
      </div>
      <div className="flex-1 overflow-auto">
        {marketData.map((data) => (
          <button
            key={data.symbol}
            onClick={() => onSelectSymbol(data.symbol)}
            className={`w-full p-3 border-b border-border hover:bg-secondary/50 transition-colors text-left ${
              selectedSymbol === data.symbol ? "bg-primary/10 border-l-2 border-l-primary" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="font-semibold text-sm">{data.symbol}</div>
                <div className="text-xs text-muted-foreground truncate">{data.name}</div>
              </div>
              <div className={`flex items-center gap-1 text-xs ${data.change >= 0 ? "text-profit" : "text-loss"}`}>
                {data.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{data.changePercent >= 0 ? "+" : ""}{data.changePercent}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Bid</div>
                  <div className="text-sm font-mono font-semibold">{data.bid.toFixed(data.symbol.includes("JPY") ? 2 : 4)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Ask</div>
                  <div className="text-sm font-mono font-semibold">{data.ask.toFixed(data.symbol.includes("JPY") ? 2 : 4)}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Spread: {((data.ask - data.bid) * 10000).toFixed(1)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MarketWatch;
