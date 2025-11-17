import { useState, useRef } from "react";
import EnhancedWatchlist from "@/components/trading/EnhancedWatchlist";
import AssetTree from "@/components/trading/AssetTree";
import TradingPanel from "@/components/trading/TradingPanel";
import EnhancedPortfolioDashboard from "@/components/trading/EnhancedPortfolioDashboard";
import ChartPanel from "@/components/trading/ChartPanel";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import TradingViewMarketsWidget from "@/components/trading/TradingViewMarketsWidget";
import TechnicalIndicators from "@/components/trading/TechnicalIndicators";
import MarketSentiment from "@/components/trading/MarketSentiment";
import TradingSignals from "@/components/trading/TradingSignals";
import EconomicCalendar from "@/components/trading/EconomicCalendar";
import { KYCStatusBanner } from "@/components/trading/KYCStatusBanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import TradingViewErrorBoundary from "@/components/TradingViewErrorBoundary";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Trade = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");
  const [activeTab, setActiveTab] = useState("trade");
  const [showWatchlistDrawer, setShowWatchlistDrawer] = useState(false);
  const [showTradingDrawer, setShowTradingDrawer] = useState(false);
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
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/* KYC Status Banner */}
        <div className="flex-shrink-0 px-4 pt-4">
          <KYCStatusBanner />
        </div>

        {/* Mobile-first layout: stack vertically on mobile, 2-col on tablet, 3-col on desktop */}
        <div className="flex-1 flex flex-col md:flex-row lg:flex-row overflow-hidden gap-0">
          {/* Left Sidebar - Enhanced Watchlist */}
          {/* Hidden on mobile, shown as drawer trigger */}
          {/* Visible on tablet+ */}
          <div className="hidden lg:flex w-80 border-r border-border flex-shrink-0 overflow-hidden">
            <EnhancedWatchlist 
              onSelectSymbol={setSelectedSymbol} 
              onQuickTrade={handleQuickTrade}
            />
          </div>

          {/* Center - Chart & Trading (primary content) */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Mobile Watchlist/Trading Controls */}
            <div className="lg:hidden flex gap-2 px-4 py-2 border-b border-border flex-shrink-0">
              <Drawer open={showWatchlistDrawer} onOpenChange={setShowWatchlistDrawer}>
                <DrawerTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-10 min-h-[44px]"
                  >
                    <Menu className="w-4 h-4 mr-2" />
                    Watchlist
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[80vh]">
                  <DrawerHeader>
                    <DrawerTitle>Watchlist</DrawerTitle>
                  </DrawerHeader>
                  <div className="overflow-auto px-4 pb-4">
                    <EnhancedWatchlist 
                      onSelectSymbol={(symbol) => {
                        setSelectedSymbol(symbol);
                        setShowWatchlistDrawer(false);
                      }} 
                      onQuickTrade={(symbol, side) => {
                        handleQuickTrade(symbol, side);
                        setShowWatchlistDrawer(false);
                      }}
                    />
                  </div>
                </DrawerContent>
              </Drawer>

              <Drawer open={showTradingDrawer} onOpenChange={setShowTradingDrawer}>
                <DrawerTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-10 min-h-[44px]"
                  >
                    <Menu className="w-4 h-4 mr-2" />
                    Trade
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[80vh]">
                  <DrawerHeader>
                    <DrawerTitle>Trading Panel</DrawerTitle>
                  </DrawerHeader>
                  <div className="overflow-auto px-4 pb-4">
                    <div className="space-y-4">
                      <AssetTree onSelectSymbol={setSelectedSymbol} selectedSymbol={selectedSymbol} />
                      <div ref={tradingPanelRef} className="border-t border-border pt-4">
                        <TradingPanel symbol={selectedSymbol} />
                      </div>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>

            {/* Chart */}
            <div className="flex-1 overflow-hidden min-h-0">
              <ChartPanel symbol={selectedSymbol} />
            </div>

            {/* Portfolio Dashboard */}
            <div className="h-96 border-t border-border flex-shrink-0 overflow-hidden">
              <EnhancedPortfolioDashboard />
            </div>
          </div>

          {/* Right Sidebar - Analysis Tools & Trading Panel (hidden on mobile/tablet) */}
          <div className="hidden md:flex lg:flex w-96 border-l border-border flex-col flex-shrink-0 overflow-hidden max-w-[min(100%,384px)]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="w-full">
                <TabsTrigger value="trade" className="flex-1">Trade</TabsTrigger>
                <TabsTrigger value="analysis" className="flex-1">Analysis</TabsTrigger>
                <TabsTrigger value="markets" className="flex-1">Markets</TabsTrigger>
              </TabsList>
              
              <TabsContent value="trade" className="flex-1 flex flex-col overflow-hidden mt-2">
                <div className="flex-1 overflow-auto">
                  <AssetTree onSelectSymbol={setSelectedSymbol} selectedSymbol={selectedSymbol} />
                </div>
                <div ref={tradingPanelRef} className="border-t border-border">
                  <TradingPanel symbol={selectedSymbol} />
                </div>
              </TabsContent>
              
              <TabsContent value="analysis" className="flex-1 overflow-auto mt-2 p-4 space-y-4">
                <TechnicalIndicators symbol={selectedSymbol} />
                <MarketSentiment symbol={selectedSymbol} />
                <TradingSignals symbol={selectedSymbol} />
                <TradingViewErrorBoundary widgetType="Economic Calendar">
                  <EconomicCalendar />
                </TradingViewErrorBoundary>
              </TabsContent>
              
              <TabsContent value="markets" className="flex-1 overflow-hidden mt-2">
                <TradingViewErrorBoundary widgetType="Markets Widget">
                  <TradingViewMarketsWidget />
                </TradingViewErrorBoundary>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Trade;
