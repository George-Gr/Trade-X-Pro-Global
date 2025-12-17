import { useEffect, useRef, memo } from "react";
import { initTradingViewCompatibility } from "@/lib/tradingview-compatibility";

interface TradingViewAdvancedChartProps {
  symbol: string;
}

const TradingViewAdvancedChart = ({ symbol }: TradingViewAdvancedChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize TradingView compatibility fixes
    initTradingViewCompatibility();

    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.textContent = "";

    const script: HTMLScriptElement = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      // Add extra safety checks and delay to ensure TradingView is fully loaded
      setTimeout(() => {
        try {
          const TradingViewGlobal = (window as unknown as Record<string, unknown>).TradingView as any | undefined;
          const WidgetCtor = TradingViewGlobal?.widget;
          if (WidgetCtor && containerRef.current) {
            // Use a local reference to the constructor to satisfy TS and runtime checks
             
            new (WidgetCtor as any)({
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
        } catch (error) {
          // keep as console.error here for diagnostics
           
          console.error('TradingView widget initialization error:', error);
        }
      }, 100);
    };
    
    script.onerror = (error) => {
      console.error('Failed to load TradingView script:', error);
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
    TradingView?: {
      widget?: new (opts: Record<string, unknown>) => void;
    };
  }
}
