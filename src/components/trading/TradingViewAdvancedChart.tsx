import { useEffect, useRef, memo } from "react";

interface TradingViewAdvancedChartProps {
  symbol: string;
}

const TradingViewAdvancedChart = ({ symbol }: TradingViewAdvancedChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== "undefined" && containerRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: "15",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "hsl(var(--card))",
          enable_publishing: false,
          withdateranges: true,
          hide_side_toolbar: false,
          allow_symbol_change: false,
          save_image: false,
          container_id: containerRef.current.id,
          studies: [
            "STD;SMA",
            "STD;MACD",
            "STD;RSI",
            "STD;Volume"
          ],
          disabled_features: ["use_localstorage_for_settings"],
          enabled_features: ["study_templates"],
        });
      }
    };

    const uniqueId = `tradingview_${Math.random().toString(36).substring(7)}`;
    containerRef.current.id = uniqueId;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default memo(TradingViewAdvancedChart);

declare global {
  interface Window {
    TradingView: any;
  }
}
