import { useState } from "react";
import { TrendingUp } from "lucide-react";
import MarketWatch from "@/components/trading/MarketWatch";
import AssetTree from "@/components/trading/AssetTree";
import TradingPanel from "@/components/trading/TradingPanel";
import PortfolioDashboard from "@/components/trading/PortfolioDashboard";
import ChartPanel from "@/components/trading/ChartPanel";

const Trade = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="font-bold">TradeX Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Account:</span>
            <span className="ml-2 font-semibold">Demo #12345</span>
          </div>
          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">JD</span>
          </div>
        </div>
      </div>

      {/* Main Trading Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Market Watch */}
        <div className="w-80 border-r border-border flex-shrink-0 overflow-hidden">
          <MarketWatch onSelectSymbol={setSelectedSymbol} selectedSymbol={selectedSymbol} />
        </div>

        {/* Center - Chart & Trading */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chart */}
          <div className="flex-1 overflow-hidden">
            <ChartPanel symbol={selectedSymbol} />
          </div>

          {/* Portfolio Dashboard */}
          <div className="h-24 border-t border-border flex-shrink-0">
            <PortfolioDashboard />
          </div>
        </div>

        {/* Right Sidebar - Asset Tree & Trading Panel */}
        <div className="w-96 border-l border-border flex flex-col flex-shrink-0 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <AssetTree onSelectSymbol={setSelectedSymbol} selectedSymbol={selectedSymbol} />
          </div>
          <div className="border-t border-border">
            <TradingPanel symbol={selectedSymbol} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
