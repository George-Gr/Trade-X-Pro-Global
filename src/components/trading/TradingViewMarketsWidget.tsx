import { useEffect, useRef, memo } from "react";
import { initTradingViewCompatibility } from "@/lib/tradingViewCompatibility";

const TradingViewMarketsWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize TradingView compatibility fixes
    initTradingViewCompatibility();

    const container = containerRef.current;
    if (!container) return;

    container.textContent = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.async = true;
    script.textContent = JSON.stringify({
      colorTheme: "dark",
      dateRange: "12M",
      showChart: true,
      locale: "en",
      width: "100%",
      height: "100%",
      largeChartUrl: "",
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      plotLineColorGrowing: "hsl(var(--primary))",
      plotLineColorFalling: "hsl(var(--destructive))",
      gridLineColor: "hsl(var(--border))",
      scaleFontColor: "hsl(var(--muted-foreground))",
      belowLineFillColorGrowing: "hsla(var(--primary), 0.12)",
      belowLineFillColorFalling: "hsla(var(--destructive), 0.12)",
      belowLineFillColorGrowingBottom: "hsla(var(--primary), 0)",
      belowLineFillColorFallingBottom: "hsla(var(--destructive), 0)",
      symbolActiveColor: "hsl(var(--primary))",
      tabs: [
        {
          title: "Forex",
          symbols: [
            { s: "FX:EURUSD", d: "EUR/USD" },
            { s: "FX:GBPUSD", d: "GBP/USD" },
            { s: "FX:USDJPY", d: "USD/JPY" },
            { s: "FX:USDCHF", d: "USD/CHF" },
            { s: "FX:AUDUSD", d: "AUD/USD" },
            { s: "FX:USDCAD", d: "USD/CAD" },
          ],
          originalTitle: "Forex",
        },
        {
          title: "Stocks",
          symbols: [
            { s: "NASDAQ:AAPL", d: "Apple" },
            { s: "NASDAQ:GOOGL", d: "Alphabet" },
            { s: "NASDAQ:MSFT", d: "Microsoft" },
            { s: "NASDAQ:TSLA", d: "Tesla" },
            { s: "NASDAQ:NVDA", d: "NVIDIA" },
            { s: "NYSE:JPM", d: "JPMorgan" },
          ],
          originalTitle: "Stocks",
        },
        {
          title: "Crypto",
          symbols: [
            { s: "BINANCE:BTCUSDT", d: "Bitcoin" },
            { s: "BINANCE:ETHUSDT", d: "Ethereum" },
            { s: "BINANCE:BNBUSDT", d: "BNB" },
            { s: "BINANCE:SOLUSDT", d: "Solana" },
            { s: "BINANCE:ADAUSDT", d: "Cardano" },
            { s: "BINANCE:XRPUSDT", d: "Ripple" },
          ],
          originalTitle: "Crypto",
        },
        {
          title: "Indices",
          symbols: [
            { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
            { s: "FOREXCOM:NSXUSD", d: "US 100" },
            { s: "FOREXCOM:DJI", d: "Dow 30" },
            { s: "INDEX:NKY", d: "Nikkei 225" },
            { s: "INDEX:DEU40", d: "DAX" },
            { s: "FOREXCOM:UKXGBP", d: "FTSE 100" },
          ],
          originalTitle: "Indices",
        },
        {
          title: "Commodities",
          symbols: [
            { s: "OANDA:XAUUSD", d: "Gold" },
            { s: "OANDA:XAGUSD", d: "Silver" },
            { s: "TVC:USOIL", d: "Crude Oil" },
            { s: "TVC:UKOIL", d: "Brent Oil" },
            { s: "COMEX:GC1!", d: "Gold Futures" },
            { s: "NYMEX:CL1!", d: "Crude Futures" },
          ],
          originalTitle: "Commodities",
        },
      ],
    });

    container.appendChild(script);

    return () => {
      if (container) {
        container.textContent = "";
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container h-full">
      <div
        ref={containerRef}
        className="tradingview-widget-container__widget h-full"
      />
    </div>
  );
};

export default memo(TradingViewMarketsWidget);
