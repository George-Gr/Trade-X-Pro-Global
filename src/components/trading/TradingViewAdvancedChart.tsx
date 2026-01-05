import { logger } from '@/lib/logger';
import type React from 'react';
import { memo, useEffect, useRef } from 'react';

/**
 * Minimal compatibility initializer for the TradingView widget script.
 * Keeps behavior local to this component to avoid a missing-module error.
 */
function initTradingViewCompatibility(): void {
  if (typeof window === 'undefined') return;

  // Ensure a safe placeholder for TradingView to avoid runtime errors
  // when the external script probes window.TradingView before it's ready.
  if (!window.TradingView) {
    window.TradingView = {};
  }

  // Additional polyfills or DOM tweaks can be added here if needed.
}

interface TradingViewAdvancedChartProps {
  symbol: string;
}

/**
 * Renders an embedded TradingView advanced chart with technical indicators and
 * dynamically loads the TradingView library.
 *
 * @param props - The component props
 * @param props.symbol - The trading symbol to display (e.g., "NASDAQ:AAPL")
 * @returns JSX.Element - A chart container div
 */
const TradingViewAdvancedChart: React.FC<TradingViewAdvancedChartProps> = ({
  symbol,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize TradingView compatibility fixes
    initTradingViewCompatibility();

    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.textContent = '';

    const script: HTMLScriptElement = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      // Add extra safety checks and delay to ensure TradingView is fully loaded
      setTimeout(() => {
        try {
          const TradingViewGlobal = window.TradingView as
            | { widget: new (config: Record<string, unknown>) => void }
            | undefined;
          const WidgetCtor = TradingViewGlobal?.widget;
          if (WidgetCtor && containerRef.current) {
            // Use a local reference to the constructor to satisfy TS and runtime checks

            new (WidgetCtor as new (config: Record<string, unknown>) => void)({
              autosize: true,
              symbol: symbol,
              interval: '15',
              timezone: 'Etc/UTC',
              theme: 'dark',
              style: '1',
              locale: 'en',
              toolbar_bg: 'hsl(var(--card))',
              enable_publishing: false,
              withdateranges: true,
              hide_side_toolbar: false,
              allow_symbol_change: false,
              save_image: false,
              container_id: containerRef.current.id,
              studies: ['STD;SMA', 'STD;MACD', 'STD;RSI', 'STD;Volume'],
              disabled_features: ['use_localstorage_for_settings'],
              enabled_features: ['study_templates'],
            });
          }
        } catch (error) {
          logger.error('TradingView widget initialization error', error, {
            component: 'TradingViewAdvancedChart',
            action: 'init_widget',
            metadata: { symbol },
          });
        }
      }, 100);
    };

    script.onerror = (error) => {
      logger.error(
        'Failed to load TradingView script',
        typeof error === 'string'
          ? new Error(error)
          : new Error('Script load failed'),
        {
          component: 'TradingViewAdvancedChart',
          action: 'load_script',
          metadata: { src: script.src },
        }
      );
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
