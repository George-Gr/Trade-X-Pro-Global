import { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
}

// Inline type definitions to avoid any top-level reference to lightweight-charts.
// The library is dynamically imported inside useEffect.
// Use number for arithmetic operations; lightweight-charts accepts both number and string
type Time = number;

// Chart and series are dynamically created from lightweight-charts module
// We use minimal interfaces to avoid compile-time dependency on the library
interface ChartInstance {
  addCandlestickSeries: (options: Record<string, unknown>) => CandlestickSeries;
  applyOptions: (options: { width: number; height: number }) => void;
  timeScale: () => { fitContent: () => void };
  remove: () => void;
  _cleanup?: () => void;
}

interface CandlestickSeries {
  setData: (data: CandleData[]) => void;
  update: (candle: CandleData) => void;
}

interface CandleData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

const TradingViewChart = ({ symbol }: TradingViewChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let mounted = true;
    let chart: ChartInstance | null = null;
    let candlestickSeries: CandlestickSeries | null = null;
    let initialData: CandleData[] = [];

    // Dynamically import lightweight-charts to avoid bundling it in the initial chunk
    import('lightweight-charts')
      .then((lc) => {
        if (!mounted) return;

        // Create chart - using type assertion due to lightweight-charts complex type definitions
        chart = lc.createChart(chartContainerRef.current!, {
          layout: {
            background: { type: lc.ColorType.Solid, color: 'transparent' },
            textColor: 'hsl(var(--foreground) / 0.85)',
          },
          grid: {
            vertLines: { color: 'hsl(var(--foreground) / 0.05)' },
            horzLines: { color: 'hsl(var(--foreground) / 0.05)' },
          },
          width: chartContainerRef.current!.clientWidth,
          height: chartContainerRef.current!.clientHeight,
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
            borderColor: 'hsl(var(--foreground) / 0.1)',
          },
          rightPriceScale: {
            borderColor: 'hsl(var(--foreground) / 0.1)',
          },
          crosshair: {
            mode: 0,
          },
        }) as unknown as ChartInstance;

        // Add candlestick series using the provided helper
        candlestickSeries = chart.addCandlestickSeries({
          upColor: 'hsl(var(--buy))',
          downColor: 'hsl(var(--destructive))',
          borderUpColor: 'hsl(var(--buy))',
          borderDownColor: 'hsl(var(--destructive))',
          wickUpColor: 'hsl(var(--buy))',
          wickDownColor: 'hsl(var(--destructive))',
        });

        // Generate realistic candlestick data
        const generateData = () => {
          const data: CandleData[] = [];
          const basePrice = symbol.includes('USD')
            ? 1.0856
            : symbol.includes('BTC')
            ? 43250
            : 178.42;
          const now = Math.floor(Date.now() / 1000);
          const interval = 900; // 15 minutes

          for (let i = 100; i >= 0; i--) {
            const time = now - i * interval;
            const open = basePrice + (Math.random() - 0.5) * (basePrice * 0.01);
            const close = open + (Math.random() - 0.5) * (basePrice * 0.005);
            const high =
              Math.max(open, close) + Math.random() * (basePrice * 0.003);
            const low =
              Math.min(open, close) - Math.random() * (basePrice * 0.003);

            data.push({
              time: time as Time,
              open: parseFloat(open.toFixed(4)),
              high: parseFloat(high.toFixed(4)),
              low: parseFloat(low.toFixed(4)),
              close: parseFloat(close.toFixed(4)),
            });
          }

          return data;
        };

        initialData = generateData();
        candlestickSeries.setData(initialData);

        // Fit content
        chart.timeScale().fitContent();

        // Handle resize
        const handleResize = () => {
          if (chartContainerRef.current && chart) {
            chart.applyOptions({
              width: chartContainerRef.current.clientWidth,
              height: chartContainerRef.current.clientHeight,
            });
          }
        };

        window.addEventListener('resize', handleResize);

        // Simulate real-time updates
        const updateInterval = setInterval(() => {
          if (!initialData.length) return;
          const lastData = initialData[initialData.length - 1];
          if (!lastData) return;
          const now = Math.floor(Date.now() / 1000);
          const interval = 900;

          // Only update if we're in a new candle period
          if (now - lastData.time >= interval) {
            const newClose =
              lastData.close + (Math.random() - 0.5) * (lastData.close * 0.002);
            const newHigh =
              Math.max(lastData.close, newClose) +
              Math.random() * (lastData.close * 0.001);
            const newLow =
              Math.min(lastData.close, newClose) -
              Math.random() * (lastData.close * 0.001);

            const newCandle = {
              time: now as Time,
              open: parseFloat(lastData.close.toFixed(4)),
              high: parseFloat(newHigh.toFixed(4)),
              low: parseFloat(newLow.toFixed(4)),
              close: parseFloat(newClose.toFixed(4)),
            };

            initialData.push(newCandle);
            if (candlestickSeries) {
              candlestickSeries.update(newCandle);
            }
          }
        }, 2000);

        // Store cleanup closure
        (chart as unknown as Record<string, unknown>)._cleanup = () => {
          window.removeEventListener('resize', handleResize);
          clearInterval(updateInterval);
          if (chart) chart.remove();
        };
      })
      .catch(console.error);

    return () => {
      mounted = false;
      if (chart?._cleanup) {
        chart._cleanup();
      }
    };
  }, [symbol]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};

export default TradingViewChart;
