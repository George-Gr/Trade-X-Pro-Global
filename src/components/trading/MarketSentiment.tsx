import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Users } from "lucide-react";
import { useMemo } from "react";

interface MarketSentimentProps {
  symbol: string;
}

const MarketSentiment = ({ symbol }: MarketSentimentProps) => {
  // Generate mock sentiment data based on symbol
  const sentimentData = useMemo(() => {
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280;
    
    const bullish = Math.floor(random(hash) * 40 + 30);
    const bearish = 100 - bullish;
    
    return {
      bullish,
      bearish,
      volume: Math.floor(random(hash + 1) * 5000 + 1000),
      sentiment: bullish > 55 ? "bullish" : bullish < 45 ? "bearish" : "neutral"
    };
  }, [symbol]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Market Sentiment</h3>
        <Users className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-primary" />
            Bullish
          </span>
          <span className="font-semibold">{sentimentData.bullish}%</span>
        </div>
        <Progress value={sentimentData.bullish} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-destructive" />
            Bearish
          </span>
          <span className="font-semibold">{sentimentData.bearish}%</span>
        </div>
        <Progress value={sentimentData.bearish} className="h-2" />
      </div>

      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Active Traders</span>
          <span className="font-semibold">{sentimentData.volume.toLocaleString()}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Overall Sentiment</span>
          <span className={`font-semibold capitalize ${
            sentimentData.sentiment === "bullish" ? "text-primary" :
            sentimentData.sentiment === "bearish" ? "text-destructive" :
            "text-muted-foreground"
          }`}>
            {sentimentData.sentiment}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default MarketSentiment;
