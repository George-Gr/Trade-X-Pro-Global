import { useState } from "react";
import MarketWatch from "@/components/trading/MarketWatch";
import AssetTree from "@/components/trading/AssetTree";
import TradingPanel from "@/components/trading/TradingPanel";
import PortfolioDashboard from "@/components/trading/PortfolioDashboard";
import ChartPanel from "@/components/trading/ChartPanel";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import TradingViewMarketsWidget from "@/components/trading/TradingViewMarketsWidget";
import TechnicalIndicators from "@/components/trading/TechnicalIndicators";
import MarketSentiment from "@/components/trading/MarketSentiment";
import TradingSignals from "@/components/trading/TradingSignals";
import EconomicCalendar from "@/components/trading/EconomicCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

        {/* Right Sidebar - Analysis Tools & Trading Panel */}
        <div className="w-96 border-l border-border flex flex-col flex-shrink-0 overflow-hidden">
          <Tabs defaultValue="trade" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full">
              <TabsTrigger value="trade" className="flex-1">Trade</TabsTrigger>
              <TabsTrigger value="analysis" className="flex-1">Analysis</TabsTrigger>
              <TabsTrigger value="markets" className="flex-1">Markets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trade" className="flex-1 flex flex-col overflow-hidden mt-0">
              <div className="flex-1 overflow-auto">
                <AssetTree onSelectSymbol={setSelectedSymbol} selectedSymbol={selectedSymbol} />
              </div>
              <div className="border-t border-border">
                <TradingPanel symbol={selectedSymbol} />
              </div>
            </TabsContent>
            
            <TabsContent value="analysis" className="flex-1 overflow-auto mt-0 p-4 space-y-4">
              <TechnicalIndicators symbol={selectedSymbol} />
              <MarketSentiment symbol={selectedSymbol} />
              <TradingSignals symbol={selectedSymbol} />
              <EconomicCalendar />
            </TabsContent>
            
            <TabsContent value="markets" className="flex-1 overflow-hidden mt-0">
              <TradingViewMarketsWidget />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Trade;
