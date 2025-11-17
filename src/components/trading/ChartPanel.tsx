import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import TradingViewAdvancedChart from "./TradingViewAdvancedChart";
import TradingViewErrorBoundary from "@/components/TradingViewErrorBoundary";

interface ChartPanelProps {
  symbol: string;
}

const ChartPanel = ({ symbol }: ChartPanelProps) => {
  return (
    <div className="h-full bg-card flex flex-col">
      <div className="h-12 px-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="font-semibold">{symbol}</div>
          <div className="flex items-center gap-4 text-sm">
            <Button variant="ghost" size="sm" className="h-7 px-4">
              1m
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-4">
              5m
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-4 bg-primary/10">
              15m
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-4">
              30m
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-4">
              1h
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-4">
              4h
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-4">
              1d
            </Button>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <TradingViewErrorBoundary widgetType="Advanced Chart">
          <TradingViewAdvancedChart symbol={symbol} />
        </TradingViewErrorBoundary>
      </div>
    </div>
  );
};

export default ChartPanel;
