import { useState, useRef } from "react";
import EnhancedWatchlist from "@/components/trading/EnhancedWatchlist";
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
import { useToast } from "@/hooks/use-toast";

const Trade = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");
  const [activeTab, setActiveTab] = useState("trade");
  const tradingPanelRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleQuickTrade = (symbol: string, side: "buy" | "sell") => {
    setSelectedSymbol(symbol);
    setActiveTab("trade");
    
    // Scroll to trading panel
    setTimeout(() => {
      tradingPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);

    toast({
      title: "Symbol selected",
      description: `${symbol} is ready for ${side === "buy" ? "buying" : "selling"}`,
    });
  };

  return (
    <AuthenticatedLayout>
      <div className="flex-1 flex overflow-hidden h-full">
        {/* Left Sidebar - Enhanced Watchlist (hidden on mobile) */}
        <div className="hidden lg:block w-80 border-r border-border flex-shrink-0 overflow-hidden">
          <EnhancedWatchlist 
            onSelectSymbol={setSelectedSymbol} 
            onQuickTrade={handleQuickTrade}
          />
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

        {/* Right Sidebar - Analysis Tools & Trading Panel (hidden on mobile/tablet) */}
        <div className="hidden md:flex w-96 border-l border-border flex-col flex-shrink-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full">
              <TabsTrigger value="trade" className="flex-1">Trade</TabsTrigger>
              <TabsTrigger value="analysis" className="flex-1">Analysis</TabsTrigger>
              <TabsTrigger value="markets" className="flex-1">Markets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trade" className="flex-1 flex flex-col overflow-hidden mt-0">
              <div className="flex-1 overflow-auto">
                <AssetTree onSelectSymbol={setSelectedSymbol} selectedSymbol={selectedSymbol} />
              </div>
              <div ref={tradingPanelRef} className="border-t border-border">
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
