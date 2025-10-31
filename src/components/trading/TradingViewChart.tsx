import { useEffect, useRef } from "react";
import { createChart, ColorType } from "lightweight-charts";

interface TradingViewChartProps {
  symbol: string;
}

const TradingViewChart = ({ symbol }: TradingViewChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.05)" },
        horzLines: { color: "rgba(255, 255, 255, 0.05)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      crosshair: {
        mode: 0,
      },
    });

    // Add candlestick series
    // @ts-ignore - lightweight-charts type definitions may vary
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    // Generate realistic candlestick data
    const generateData = () => {
      const data = [];
      const basePrice = symbol.includes("USD") ? 1.0856 : symbol.includes("BTC") ? 43250 : 178.42;
      const now = Math.floor(Date.now() / 1000);
      const interval = 900; // 15 minutes

      for (let i = 100; i >= 0; i--) {
        const time = now - i * interval;
        const open = basePrice + (Math.random() - 0.5) * (basePrice * 0.01);
        const close = open + (Math.random() - 0.5) * (basePrice * 0.005);
        const high = Math.max(open, close) + Math.random() * (basePrice * 0.003);
        const low = Math.min(open, close) - Math.random() * (basePrice * 0.003);

        data.push({
          time,
          open: parseFloat(open.toFixed(4)),
          high: parseFloat(high.toFixed(4)),
          low: parseFloat(low.toFixed(4)),
          close: parseFloat(close.toFixed(4)),
        });
      }

      return data;
    };

    const initialData = generateData();
    candlestickSeries.setData(initialData);

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    // Simulate real-time updates
    const updateInterval = setInterval(() => {
      const lastData = initialData[initialData.length - 1];
      const now = Math.floor(Date.now() / 1000);
      const interval = 900;

      // Only update if we're in a new candle period
      if (now - lastData.time >= interval) {
        const newClose = lastData.close + (Math.random() - 0.5) * (lastData.close * 0.002);
        const newHigh = Math.max(lastData.close, newClose) + Math.random() * (lastData.close * 0.001);
        const newLow = Math.min(lastData.close, newClose) - Math.random() * (lastData.close * 0.001);

        const newCandle = {
          time: now,
          open: parseFloat(lastData.close.toFixed(4)),
          high: parseFloat(newHigh.toFixed(4)),
          low: parseFloat(newLow.toFixed(4)),
          close: parseFloat(newClose.toFixed(4)),
        };

        initialData.push(newCandle);
        candlestickSeries.update(newCandle);
      }
    }, 2000);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(updateInterval);
      chart.remove();
    };
  }, [symbol]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};

export default TradingViewChart;
