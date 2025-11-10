import { useEffect, useRef, memo } from "react";

const TradingViewWatchlist = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
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
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container h-full">
      <div ref={containerRef} className="tradingview-widget-container__widget h-full" />
    </div>
  );
};

export default memo(TradingViewWatchlist);
