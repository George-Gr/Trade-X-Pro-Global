import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Maximize2 } from "lucide-react";

interface ChartPanelProps {
  symbol: string;
}

const ChartPanel = ({ symbol }: ChartPanelProps) => {
  return (
    <div className="h-full bg-card flex flex-col">
      <div className="h-12 px-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="font-semibold">{symbol}</div>
          <div className="flex items-center gap-2 text-sm">
            <Button variant="ghost" size="sm" className="h-7 px-2">
              1m
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              5m
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 bg-primary/10">
              15m
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              1h
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              4h
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              1d
            </Button>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 relative overflow-hidden">
        {/* Placeholder for TradingView chart */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 800 400">
            <path
              d="M0,200 Q200,150 400,180 T800,160"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
            />
          </svg>
        </div>
        
        <div className="relative text-center space-y-3 z-10">
          <div className="h-16 w-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">TradingView Chart</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Interactive charts will be integrated using TradingView Lightweight Charts library
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Live data streaming</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPanel;
