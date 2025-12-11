import { useEffect, useRef, memo } from "react";
import { Card } from "@/components/ui/card";
import { initTradingViewCompatibility } from "@/lib/tradingview-compatibility";

const EconomicCalendar = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize TradingView compatibility fixes
    initTradingViewCompatibility();
    
    const container = containerRef.current;
    if (!container) return;

    container.textContent = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.textContent = JSON.stringify({
      width: "100%",
      height: "100%",
      colorTheme: "dark",
      isTransparent: false,
      locale: "en",
      importanceFilter: "0,1",
      countryFilter: "us,eu,gb,jp,cn,ca,au"
    });

    container.appendChild(script);

    return () => {
      if (container) {
        container.textContent = "";
      }
    };
  }, []);

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Economic Calendar</h3>
      </div>
      <div className="tradingview-widget-container h-[400px]">
        <div ref={containerRef} className="tradingview-widget-container__widget h-full" />
      </div>
    </Card>
  );
};

export default memo(EconomicCalendar);
