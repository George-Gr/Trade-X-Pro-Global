import { useState, useRef, Suspense, lazy } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import TradingViewErrorBoundary from "@/components/TradingViewErrorBoundary";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Menu, X, HelpCircle } from "lucide-react";
import { TradeLoading } from "@/components/trading/TradeLoading";
import {
  OnboardingTour,
  useOnboardingTour,
} from "@/components/onboarding/OnboardingTour";
import { useViewModeSafe } from "@/contexts/ViewModeContext";
import { ViewModeToggle, ProModeOnly } from "@/components/ui/ViewModeToggle";

// Lazy load heavy components for better bundle splitting
const EnhancedWatchlist = lazy(
  () => import("@/components/trading/EnhancedWatchlist"),
);
const AssetTree = lazy(() => import("@/components/trading/AssetTree"));
const TradingPanel = lazy(() => import("@/components/trading/TradingPanel"));
const EnhancedPortfolioDashboard = lazy(
  () => import("@/components/trading/EnhancedPortfolioDashboard"),
);
const ChartPanel = lazy(() => import("@/components/trading/ChartPanel"));
const TradingViewMarketsWidget = lazy(
  () => import("@/components/trading/TradingViewMarketsWidget"),
);
const TechnicalIndicators = lazy(
  () => import("@/components/trading/TechnicalIndicators"),
);
const MarketSentiment = lazy(
  () => import("@/components/trading/MarketSentiment"),
);
const TradingSignals = lazy(
  () => import("@/components/trading/TradingSignals"),
);
const EconomicCalendar = lazy(
  () => import("@/components/trading/EconomicCalendar"),
);
const KYCStatusBanner = lazy(() =>
  import("@/components/trading/KYCStatusBanner").then((module) => ({
    default: module.KYCStatusBanner,
  })),
);

const Trade = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");
  const [activeTab, setActiveTab] = useState("trade");
  const [showWatchlistDrawer, setShowWatchlistDrawer] = useState(false);
  const [showTradingDrawer, setShowTradingDrawer] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const tradingPanelRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { startTour } = useOnboardingTour();
  const { isProMode, isBasicMode } = useViewModeSafe();

  const handleQuickTrade = (symbol: string, side: "buy" | "sell") => {
    setSelectedSymbol(symbol);
    setActiveTab("trade");

    // Scroll to trading panel
    setTimeout(() => {
      tradingPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);

    toast({
      title: "Symbol selected",
      description: `${symbol} is ready for ${side === "buy" ? "buying" : "selling"}`,
    });
  };

  return (
    <AuthenticatedLayout>
      {/* Onboarding Tour */}
      <OnboardingTour
        page="trading"
        onComplete={() => setShowTour(false)}
        forceShow={showTour}
      />

      <div
        className="flex-1 flex flex-col overflow-hidden h-full"
        data-tour="trading-page"
      >
        {/* KYC Status Banner with View Mode Toggle and Help Button */}
        <div className="flex-shrink-0 px-4 pt-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <Suspense
              fallback={
                <div className="h-12 bg-muted/50 rounded animate-pulse" />
              }
            >
              <KYCStatusBanner />
            </Suspense>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <ViewModeToggle variant="compact" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowTour(true);
                startTour("trading");
              }}
              aria-label="Start tutorial"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Help</span>
            </Button>
          </div>
        </div>

        {/* Mobile-first layout: stack vertically on mobile, 2-col on tablet, 3-col on desktop */}
        <div className="flex-1 flex flex-col sm:flex-row md:flex-row lg:flex-row overflow-hidden gap-0">
          {/* Left Sidebar - Enhanced Watchlist */}
          <div
            className="hidden lg:flex w-80 border-r border-border flex-shrink-0 overflow-hidden"
            data-tour="watchlist"
          >
            <Suspense
              fallback={
                <div className="w-full h-full bg-muted/50 animate-pulse rounded" />
              }
            >
              <EnhancedWatchlist
                onSelectSymbol={setSelectedSymbol}
                onQuickTrade={handleQuickTrade}
              />
            </Suspense>
          </div>

          {/* Center - Chart & Trading (primary content) */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Mobile & Tablet Control Buttons (hidden on desktop lg+) */}
            <div className="lg:hidden flex gap-2 px-4 py-2.5 border-b border-border flex-shrink-0 bg-background/80 backdrop-blur-sm">
              <Drawer
                open={showWatchlistDrawer}
                onOpenChange={setShowWatchlistDrawer}
              >
                <DrawerTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-11 min-h-[44px] font-medium transition-all hover:bg-primary/10 active:scale-95"
                    tabIndex={0}
                    aria-label="Open watchlist"
                  >
                    <Menu className="w-4 h-4 mr-2" aria-hidden="true" />
                    Watchlist
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[80vh]">
                  <DrawerHeader className="border-b border-border">
                    <DrawerTitle className="text-lg font-bold">
                      Watchlist
                    </DrawerTitle>
                    <DrawerClose className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-md opacity-70 transition-opacity hover:opacity-100 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <X className="h-5 w-5" />
                    </DrawerClose>
                  </DrawerHeader>
                  <div className="overflow-auto px-4 pb-4">
                    <Suspense
                      fallback={
                        <div className="w-full h-full bg-muted/50 animate-pulse rounded" />
                      }
                    >
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

              <Drawer
                open={showTradingDrawer}
                onOpenChange={setShowTradingDrawer}
              >
                <DrawerTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-11 min-h-[44px] font-medium transition-all hover:bg-primary/10 active:scale-95"
                    tabIndex={0}
                    aria-label="Open trading panel"
                  >
                    <Menu className="w-4 h-4 mr-2" aria-hidden="true" />
                    Trade
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[90vh]">
                  <DrawerHeader className="border-b border-border">
                    <DrawerTitle className="text-lg font-bold">
                      Trading Panel
                    </DrawerTitle>
                    <DrawerClose className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-md opacity-70 transition-opacity hover:opacity-100 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <X className="h-5 w-5" />
                    </DrawerClose>
                  </DrawerHeader>
                  <div className="overflow-auto px-4 pb-4">
                    <div className="space-y-4">
                      <Suspense
                        fallback={
                          <div className="h-64 bg-muted/50 rounded animate-pulse" />
                        }
                      >
                        <AssetTree
                          onSelectSymbol={setSelectedSymbol}
                          selectedSymbol={selectedSymbol}
                        />
                      </Suspense>
                      <div
                        ref={tradingPanelRef}
                        className="border-t border-border pt-4"
                      >
                        <Suspense
                          fallback={
                            <div className="h-96 bg-muted/50 rounded animate-pulse" />
                          }
                        >
                          <TradingPanel symbol={selectedSymbol} />
                        </Suspense>
                      </div>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>

            {/* Chart - Responsive height based on screen size */}
            <div
              className="flex-1 overflow-hidden min-h-0 md:max-h-[calc(100vh-300px)] lg:max-h-none"
              data-tour="chart"
            >
              <Suspense
                fallback={
                  <div className="w-full h-full bg-muted/50 animate-pulse rounded" />
                }
              >
                <ChartPanel symbol={selectedSymbol} />
              </Suspense>
            </div>

            {/* Portfolio Dashboard - Responsive height */}
            <div className="h-64 md:h-80 lg:h-96 border-t border-border flex-shrink-0 overflow-hidden">
              <Suspense
                fallback={
                  <div className="w-full h-full bg-muted/50 animate-pulse rounded" />
                }
              >
                <EnhancedPortfolioDashboard />
              </Suspense>
            </div>
          </div>

          {/* Right Sidebar - Analysis Tools & Trading Panel */}
          {/* Shown on md+ but narrower on md, full width on lg */}
          <div className="hidden md:flex w-64 lg:w-96 border-l border-border flex-col flex-shrink-0 overflow-hidden max-w-[min(100%,384px)]">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <TabsList
                className="w-full"
                role="tablist"
                aria-label="Trading analysis tabs"
              >
                <TabsTrigger
                  value="trade"
                  className="flex-1 text-xs md:text-sm"
                  tabIndex={0}
                  role="tab"
                  aria-selected={activeTab === "trade"}
                  aria-controls="tab-content-trade"
                >
                  Trade
                </TabsTrigger>
                <TabsTrigger
                  value="analysis"
                  className="flex-1 text-xs md:text-sm"
                  tabIndex={0}
                  role="tab"
                  aria-selected={activeTab === "analysis"}
                  aria-controls="tab-content-analysis"
                >
                  Analysis
                </TabsTrigger>
                <TabsTrigger
                  value="markets"
                  className="flex-1 text-xs md:text-sm"
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
                className="flex-1 flex flex-col overflow-hidden mt-0 px-2 md:px-3"
                id="tab-content-trade"
                role="tabpanel"
                aria-labelledby="tab-trigger-trade"
              >
                <div className="flex-1 overflow-auto">
                  <Suspense
                    fallback={
                      <div className="w-full h-full bg-muted/50 animate-pulse rounded" />
                    }
                  >
                    <AssetTree
                      onSelectSymbol={setSelectedSymbol}
                      selectedSymbol={selectedSymbol}
                    />
                  </Suspense>
                </div>
                <div
                  ref={tradingPanelRef}
                  className="border-t border-border mt-2 pt-2"
                  data-tour="trading-panel"
                >
                  <Suspense
                    fallback={
                      <div className="w-full h-full bg-muted/50 animate-pulse rounded" />
                    }
                  >
                    <TradingPanel symbol={selectedSymbol} />
                  </Suspense>
                </div>
              </TabsContent>

              <TabsContent
                value="analysis"
                className="flex-1 overflow-auto mt-0 p-2 md:p-3 space-y-3"
                id="tab-content-analysis"
                role="tabpanel"
                aria-labelledby="tab-trigger-analysis"
              >
                {/* Always show market sentiment - essential for all users */}
                <Suspense
                  fallback={
                    <div className="h-48 bg-muted/50 rounded animate-pulse" />
                  }
                >
                  <MarketSentiment symbol={selectedSymbol} />
                </Suspense>

                {/* Pro Mode: Show advanced technical indicators */}
                <ProModeOnly>
                  <Suspense
                    fallback={
                      <div className="h-48 bg-muted/50 rounded animate-pulse" />
                    }
                  >
                    <TechnicalIndicators symbol={selectedSymbol} />
                  </Suspense>
                </ProModeOnly>

                {/* Pro Mode: Show trading signals */}
                <ProModeOnly>
                  <Suspense
                    fallback={
                      <div className="h-48 bg-muted/50 rounded animate-pulse" />
                    }
                  >
                    <TradingSignals symbol={selectedSymbol} />
                  </Suspense>
                </ProModeOnly>

                {/* Pro Mode: Show economic calendar */}
                <ProModeOnly>
                  <TradingViewErrorBoundary widgetType="Economic Calendar">
                    <Suspense
                      fallback={
                        <div className="h-64 bg-muted/50 rounded animate-pulse" />
                      }
                    >
                      <EconomicCalendar />
                    </Suspense>
                  </TradingViewErrorBoundary>
                </ProModeOnly>

                {/* Basic Mode: Show helpful tip */}
                {isBasicMode && (
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">
                      💡 Switch to <strong>Pro mode</strong> for advanced
                      technical indicators, trading signals, and economic
                      calendar.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="markets"
                className="flex-1 overflow-hidden mt-0"
                id="tab-content-markets"
                role="tabpanel"
                aria-labelledby="tab-trigger-markets"
              >
                <TradingViewErrorBoundary widgetType="Markets Widget">
                  <Suspense
                    fallback={
                      <div className="w-full h-full bg-muted/50 animate-pulse rounded" />
                    }
                  >
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
