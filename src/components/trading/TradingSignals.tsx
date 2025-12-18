import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, Target } from "lucide-react";
import { useMemo } from "react";

interface TradingSignalsProps {
  symbol: string;
}

const TradingSignals = ({ symbol }: TradingSignalsProps) => {
  // Generate mock signals based on symbol
  const signals = useMemo(() => {
    const hash = symbol
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280;

    const basePrice = symbol.includes("USD")
      ? 1.0856
      : symbol.includes("BTC")
        ? 43250
        : 178.42;

    return [
      {
        type: random(hash) > 0.5 ? "buy" : "sell",
        timeframe: "15M",
        strength:
          random(hash) > 0.7
            ? "strong"
            : random(hash) > 0.4
              ? "moderate"
              : "weak",
        entry: (basePrice * (1 + (random(hash) - 0.5) * 0.01)).toFixed(4),
        target: (basePrice * (1 + (random(hash) - 0.5) * 0.02)).toFixed(4),
        stopLoss: (basePrice * (1 + (random(hash) - 0.5) * 0.005)).toFixed(4),
        time: "5 min ago",
      },
      {
        type: random(hash + 1) > 0.5 ? "buy" : "sell",
        timeframe: "1H",
        strength:
          random(hash + 1) > 0.7
            ? "strong"
            : random(hash + 1) > 0.4
              ? "moderate"
              : "weak",
        entry: (basePrice * (1 + (random(hash + 1) - 0.5) * 0.015)).toFixed(4),
        target: (basePrice * (1 + (random(hash + 1) - 0.5) * 0.03)).toFixed(4),
        stopLoss: (basePrice * (1 + (random(hash + 1) - 0.5) * 0.007)).toFixed(
          4,
        ),
        time: "15 min ago",
      },
      {
        type: random(hash + 2) > 0.5 ? "buy" : "sell",
        timeframe: "4H",
        strength:
          random(hash + 2) > 0.7
            ? "strong"
            : random(hash + 2) > 0.4
              ? "moderate"
              : "weak",
        entry: (basePrice * (1 + (random(hash + 2) - 0.5) * 0.02)).toFixed(4),
        target: (basePrice * (1 + (random(hash + 2) - 0.5) * 0.04)).toFixed(4),
        stopLoss: (basePrice * (1 + (random(hash + 2) - 0.5) * 0.01)).toFixed(
          4,
        ),
        time: "1 hour ago",
      },
    ];
  }, [symbol]);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "strong":
        return "default";
      case "moderate":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold text-sm">Trading Signals</h3>
      <div className="space-y-4">
        {signals.map((signal, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-border space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {signal.type === "buy" ? (
                  <TrendingUp className="h-4 w-4 text-primary" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={`text-sm font-semibold uppercase ${
                    signal.type === "buy" ? "text-primary" : "text-destructive"
                  }`}
                >
                  {signal.type}
                </span>
                <Badge variant="outline" className="text-xs">
                  {signal.timeframe}
                </Badge>
              </div>
              <Badge
                variant={getStrengthColor(signal.strength)}
                className="text-xs"
              >
                {signal.strength}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground">Entry</p>
                <p className="font-semibold">{signal.entry}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-4">
                  <Target className="h-3 w-3" />
                  Target
                </p>
                <p className="font-semibold text-primary">{signal.target}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Stop Loss</p>
                <p className="font-semibold text-destructive">
                  {signal.stopLoss}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {signal.time}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TradingSignals;
