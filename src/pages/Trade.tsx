import { useState } from "react";
import MarketWatch from "@/components/trading/MarketWatch";
import AssetTree from "@/components/trading/AssetTree";
import TradingPanel from "@/components/trading/TradingPanel";
import PortfolioDashboard from "@/components/trading/PortfolioDashboard";
import ChartPanel from "@/components/trading/ChartPanel";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";

const Trade = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");

  return (
    <AuthenticatedLayout>
      {/* Main Trading Area */}
      <div className="flex-1 flex overflow-hidden h-full">
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
    </AuthenticatedLayout>
  );
};

export default Trade;
