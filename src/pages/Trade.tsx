import { useState, useRef, Suspense, lazy } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import TradingViewErrorBoundary from "@/components/TradingViewErrorBoundary";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

// Lazy load heavy components for better bundle splitting
const EnhancedWatchlist = lazy(() => import("@/components/trading/EnhancedWatchlist"));
const AssetTree = lazy(() => import("@/components/trading/AssetTree"));
const TradingPanel = lazy(() => import("@/components/trading/TradingPanel"));
const EnhancedPortfolioDashboard = lazy(() => import("@/components/trading/EnhancedPortfolioDashboard"));
const ChartPanel = lazy(() => import("@/components/trading/ChartPanel"));
const TradingViewMarketsWidget = lazy(() => import("@/components/trading/TradingViewMarketsWidget"));
const TechnicalIndicators = lazy(() => import("@/components/trading/TechnicalIndicators"));
const MarketSentiment = lazy(() => import("@/components/trading/MarketSentiment"));
const TradingSignals = lazy(() => import("@/components/trading/TradingSignals"));
const EconomicCalendar = lazy(() => import("@/components/trading/EconomicCalendar"));
const KYCStatusBanner = lazy(() => import("@/components/trading/KYCStatusBanner"));

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
          <Suspense fallback={<div className="h-12 bg-muted/50 rounded animate-pulse" />}>
            <KYCStatusBanner />
          </Suspense>
        </div>

        {/* Mobile-first layout: stack vertically on mobile, 2-col on tablet, 3-col on desktop */}
        <div className="flex-1 flex flex-col md:flex-row lg:flex-row overflow-hidden gap-0">
          {/* Left Sidebar - Enhanced Watchlist */}
          {/* Hidden on mobile, shown as drawer trigger */}
          {/* Visible on tablet+ */}
          <div className="hidden lg:flex w-80 border-r border-border flex-shrink-0 overflow-hidden">
            <Suspense fallback={<div className="w-full h-full bg-muted/50 animate-pulse rounded" />}>
              <EnhancedWatchlist 
                onSelectSymbol={setSelectedSymbol} 
                onQuickTrade={handleQuickTrade}
              />
            </Suspense>
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
                    tabIndex={0}
                    aria-label="Open watchlist drawer"
                  >
                    <Menu className="w-4 h-4 mr-2" aria-hidden="true" />
                    Watchlist
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[80vh]">
                  <DrawerHeader>
                    <DrawerTitle>Watchlist</DrawerTitle>
                  </DrawerHeader>
                  <div className="overflow-auto px-4 pb-4">
                    <Suspense fallback={<div className="w-full h-full bg-muted/50 animate-pulse rounded" />}>
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
                    </Suspense>
                  </div>
                </DrawerContent>
              </Drawer>

              <Drawer open={showTradingDrawer} onOpenChange={setShowTradingDrawer}>
                <DrawerTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-10 min-h-[44px]"
                    tabIndex={0}
                    aria-label="Open trading panel drawer"
                  >
                    <Menu className="w-4 h-4 mr-2" aria-hidden="true" />
                    Trade
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[80vh]">
                  <DrawerHeader>
                    <DrawerTitle>Trading Panel</DrawerTitle>
                  </DrawerHeader>
                  <div className="overflow-auto px-4 pb-4">
                    <div className="space-y-4">
                      <Suspense fallback={<div className="h-64 bg-muted/50 rounded animate-pulse" />}>
                        <AssetTree onSelectSymbol={setSelectedSymbol} selectedSymbol={selectedSymbol} />
                      </Suspense>
                      <div ref={tradingPanelRef} className="border-t border-border pt-4">
                        <Suspense fallback={<div className="h-96 bg-muted/50 rounded animate-pulse" />}>
                          <TradingPanel symbol={selectedSymbol} />
                        </Suspense>
                      </div>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>

            {/* Chart */}
            <div className="flex-1 overflow-hidden min-h-0">
              <Suspense fallback={<div className="w-full h-full bg-muted/50 animate-pulse rounded" />}>
                <ChartPanel symbol={selectedSymbol} />
              </Suspense>
            </div>

            {/* Portfolio Dashboard */}
            <div className="h-96 border-t border-border flex-shrink-0 overflow-hidden">
              <Suspense fallback={<div className="w-full h-full bg-muted/50 animate-pulse rounded" />}>
                <EnhancedPortfolioDashboard />
              </Suspense>
            </div>
          </div>

          {/* Right Sidebar - Analysis Tools & Trading Panel (hidden on mobile/tablet) */}
          <div className="hidden md:flex lg:flex w-96 border-l border-border flex-col flex-shrink-0 overflow-hidden max-w-[min(100%,384px)]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="w-full" role="tablist" aria-label="Trading analysis tabs">
                <TabsTrigger 
                  value="trade" 
                  className="flex-1" 
                  tabIndex={0}
                  role="tab"
                  aria-selected={activeTab === "trade"}
                  aria-controls="tab-content-trade"
                >
                  Trade
                </TabsTrigger>
                <TabsTrigger 
                  value="analysis" 
                  className="flex-1" 
                  tabIndex={0}
                  role="tab"
                  aria-selected={activeTab === "analysis"}
                  aria-controls="tab-content-analysis"
                >
                  Analysis
                </TabsTrigger>
                <TabsTrigger 
                  value="markets" 
                  className="flex-1" 
                  tabIndex={0}
                  role="tab"
                  aria-selected={activeTab === "markets"}
                  aria-controls="tab-content-markets"
                >
                  Markets
                </TabsTrigger>
              </TabsList>
              
              <TabsContent 
                value="trade" 
                className="flex-1 flex flex-col overflow-hidden mt-2"
                id="tab-content-trade"
                role="tabpanel"
                aria-labelledby="tab-trigger-trade"
              >
                <div className="flex-1 overflow-auto">
                  <Suspense fallback={<div className="w-full h-full bg-muted/50 animate-pulse rounded" />}>
                    <AssetTree onSelectSymbol={setSelectedSymbol} selectedSymbol={selectedSymbol} />
                  </Suspense>
                </div>
                <div ref={tradingPanelRef} className="border-t border-border">
                  <Suspense fallback={<div className="w-full h-full bg-muted/50 animate-pulse rounded" />}>
                    <TradingPanel symbol={selectedSymbol} />
                  </Suspense>
                </div>
              </TabsContent>
              
              <TabsContent 
                value="analysis" 
                className="flex-1 overflow-auto mt-2 p-4 space-y-4"
                id="tab-content-analysis"
                role="tabpanel"
                aria-labelledby="tab-trigger-analysis"
              >
                <Suspense fallback={<div className="h-48 bg-muted/50 rounded animate-pulse" />}>
                  <TechnicalIndicators symbol={selectedSymbol} />
                </Suspense>
                <Suspense fallback={<div className="h-48 bg-muted/50 rounded animate-pulse" />}>
                  <MarketSentiment symbol={selectedSymbol} />
                </Suspense>
                <Suspense fallback={<div className="h-48 bg-muted/50 rounded animate-pulse" />}>
                  <TradingSignals symbol={selectedSymbol} />
                </Suspense>
                <TradingViewErrorBoundary widgetType="Economic Calendar">
                  <Suspense fallback={<div className="h-64 bg-muted/50 rounded animate-pulse" />}>
                    <EconomicCalendar />
                  </Suspense>
                </TradingViewErrorBoundary>
              </TabsContent>
              
              <TabsContent 
                value="markets" 
                className="flex-1 overflow-hidden mt-2"
                id="tab-content-markets"
                role="tabpanel"
                aria-labelledby="tab-trigger-markets"
              >
                <TradingViewErrorBoundary widgetType="Markets Widget">
                  <Suspense fallback={<div className="w-full h-full bg-muted/50 animate-pulse rounded" />}>
                    <TradingViewMarketsWidget />
                  </Suspense>
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
