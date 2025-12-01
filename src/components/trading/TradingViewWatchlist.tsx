import { useEffect, useRef, memo, useState, useCallback } from "react";
import { initTradingViewCompatibility } from "@/lib/tradingview-compatibility";
import { useDebouncedChartUpdate } from "@/hooks/useDebouncedChartUpdate";
import { ProgressiveDataLoader } from "@/lib/chartPerformance";

interface TradingViewConfig {
  width: string;
  height: string;
  symbolsGroups: Array<{
    name: string;
    originalName: string;
    symbols: Array<{
      name: string;
      displayName: string;
    }>;
  }>;
  showSymbolLogo: boolean;
  isTransparent: boolean;
  colorTheme: string;
  locale: string;
  backgroundColor: string;
}

const TradingViewWatchlist = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Define initializeTradingView first
  const initializeTradingView = useCallback(() => {
    if (!containerRef.current || !isVisible) return;

    setIsLoading(true);

    // Initialize TradingView compatibility fixes
    initTradingViewCompatibility();

    const container = containerRef.current;
    container.innerHTML = "";

    // Progressive loading configuration
    const config: TradingViewConfig = {
      width: "100%",
      height: "100%",
      symbolsGroups: [
        {
          name: "Forex",
          originalName: "Forex",
          symbols: [
            { name: "FX:EURUSD", displayName: "EUR/USD" },
            { name: "FX:GBPUSD", displayName: "GBP/USD" },
            { name: "FX:USDJPY", displayName: "USD/JPY" },
            { name: "FX:AUDUSD", displayName: "AUD/USD" }
          ]
        },
        {
          name: "Stocks",
          originalName: "Stocks",
          symbols: [
            { name: "NASDAQ:AAPL", displayName: "Apple" },
            { name: "NASDAQ:TSLA", displayName: "Tesla" },
            { name: "NASDAQ:GOOGL", displayName: "Alphabet" },
            { name: "NASDAQ:MSFT", displayName: "Microsoft" }
          ]
        },
        {
          name: "Crypto",
          originalName: "Crypto",
          symbols: [
            { name: "BINANCE:BTCUSDT", displayName: "Bitcoin" },
            { name: "BINANCE:ETHUSDT", displayName: "Ethereum" },
            { name: "BINANCE:BNBUSDT", displayName: "BNB" },
            { name: "BINANCE:SOLUSDT", displayName: "Solana" }
          ]
        }
      ],
      showSymbolLogo: true,
      isTransparent: false,
      colorTheme: "dark",
      locale: "en",
      backgroundColor: "hsl(var(--card))"
    };

    // Use progressive loading for symbols
    const loader = new ProgressiveDataLoader(
      config.symbolsGroups.flatMap(group => group.symbols),
      2, // Load 2 symbols at a time
      (chunk, isComplete) => {
        // Update progress
        if (isComplete) {
          setIsLoading(false);
        }
      }
    );

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js";
    script.async = true;
    script.defer = true; // Load after page is ready

    // Set script content with optimized config
    script.innerHTML = JSON.stringify({
      ...config,
      // Add performance optimizations
      autosize: true,
      details: true,
      // Reduce update frequency for better performance
      refreshRate: 5000, // 5 seconds instead of default
    });

    // Load script with progressive initialization
    script.onload = () => {
      loader.loadNextChunk();
    };

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = "";
      }
      loader.reset();
    };
  }, [isVisible]);

  // Use debounced updates for performance
  const [debouncedUpdate] = useDebouncedChartUpdate(
    useCallback(() => {
      initializeTradingView();
    }, [initializeTradingView]),
    { delay: 300 }
  );

  const checkVisibility = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      setIsVisible(isVisible);

      if (isVisible && isLoading) {
        debouncedUpdate();
      }
    }
  }, [debouncedUpdate, isLoading]);

  // Handle visibility changes and resize
  useEffect(() => {
    // Defer initial visibility check to avoid synchronous setState in effect
    Promise.resolve().then(checkVisibility);

    const handleScroll = () => checkVisibility();
    const handleResize = () => checkVisibility();

    // Use passive listeners for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Initial check (observer will also handle visibility changes)
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          debouncedUpdate();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [checkVisibility, debouncedUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    const container = containerRef.current;
    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container h-full relative">
      <div ref={containerRef} className="tradingview-widget-container__widget h-full" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-foreground">Loading market data...</p>
          </div>
        </div>
      )}

      {/* Placeholder when not visible */}
      {!isVisible && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Scroll to view market data</p>
        </div>
      )}
    </div>
  );
};

export default memo(TradingViewWatchlist);
