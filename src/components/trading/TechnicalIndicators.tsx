import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMemo } from "react";

interface TechnicalIndicatorsProps {
  symbol: string;
}

const TechnicalIndicators = ({ symbol }: TechnicalIndicatorsProps) => {
  // Generate mock indicator data based on symbol
  const indicators = useMemo(() => {
    const hash = symbol
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280;

    return [
      {
        name: "RSI (14)",
        value: Math.floor(random(hash) * 40 + 30),
        signal:
          random(hash) > 0.5 ? "buy" : random(hash) > 0.3 ? "neutral" : "sell",
      },
      {
        name: "MACD (12,26,9)",
        value: (random(hash + 1) - 0.5) * 0.002,
        signal:
          random(hash + 1) > 0.55
            ? "buy"
            : random(hash + 1) > 0.45
              ? "neutral"
              : "sell",
      },
      {
        name: "Stochastic (14,3,3)",
        value: Math.floor(random(hash + 2) * 40 + 30),
        signal:
          random(hash + 2) > 0.6
            ? "buy"
            : random(hash + 2) > 0.4
              ? "neutral"
              : "sell",
      },
      {
        name: "ADX (14)",
        value: Math.floor(random(hash + 3) * 30 + 20),
        signal:
          random(hash + 3) > 0.6
            ? "buy"
            : random(hash + 3) > 0.4
              ? "neutral"
              : "sell",
      },
      {
        name: "CCI (20)",
        value: Math.floor((random(hash + 4) - 0.5) * 200),
        signal:
          random(hash + 4) > 0.55
            ? "buy"
            : random(hash + 4) > 0.45
              ? "neutral"
              : "sell",
      },
      {
        name: "Williams %R (14)",
        value: -Math.floor(random(hash + 5) * 40 + 30),
        signal:
          random(hash + 5) > 0.5
            ? "buy"
            : random(hash + 5) > 0.3
              ? "neutral"
              : "sell",
      },
    ];
  }, [symbol]);

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case "buy":
        return <TrendingUp className="h-4 w-4" />;
      case "sell":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "buy":
        return "default";
      case "sell":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold text-sm">Technical Indicators</h3>
      <div className="space-y-2">
        {indicators.map((indicator, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-4 border-b border-border last:border-0"
          >
            <div className="flex-1">
              <p className="text-xs font-medium">{indicator.name}</p>
              <p className="text-xs text-muted-foreground">
                {indicator.value.toFixed(2)}
              </p>
            </div>
            <Badge
              variant={getSignalColor(indicator.signal)}
              className="flex items-center gap-4"
            >
              {getSignalIcon(indicator.signal)}
              {indicator.signal}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TechnicalIndicators;
