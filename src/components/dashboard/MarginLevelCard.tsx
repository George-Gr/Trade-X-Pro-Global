import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Placeholder } from "@/components/ui/Placeholder";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MarginLevelCardProps {
  loading?: boolean;
  marginLevel?: number;
  trend?: number[];
}

export const MarginLevelCard: React.FC<MarginLevelCardProps> = ({
  loading = false,
  marginLevel = 72,
  trend = [],
}) => {
  const [trendData, setTrendData] = React.useState({
    changePercentage: 0,
    changeDirection: "neutral" as "up" | "down" | "neutral",
  });

  React.useEffect(() => {
    if (trend && trend.length > 1) {
      const firstValue = trend[0];
      const lastValue = trend[trend.length - 1];
      const change = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;

      let direction: "up" | "down" | "neutral" = "neutral";
      if (change > 0.1) {
        direction = "up";
      } else if (change < -0.1) {
        direction = "down";
      }

      setTrendData({ changePercentage: change, changeDirection: direction });
    }
  }, [trend]);

  const getTrendIcon = () => {
    switch (trendData.changeDirection) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-warning-contrast" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-success-contrast" />;
      default:
        return <Minus className="h-4 w-4 text-secondary-contrast" />;
    }
  };

  const getChangeClassName = () => {
    switch (trendData.changeDirection) {
      case "up":
        return "text-warning-contrast font-medium";
      case "down":
        return "text-success-contrast font-medium";
      default:
        return "text-secondary-contrast font-medium";
    }
  };

  if (loading) {
    return (
      <Card elevation="1" className="min-h-[200px] p-6">
        <CardHeader className="space-y-2">
          <Skeleton variant="heading" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <Skeleton variant="heading" className="w-1/3" />
            <Skeleton variant="text" className="w-1/4" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="card" className="h-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trend || trend.length === 0) {
    return (
      <Card elevation="1" className="min-h-[200px] p-6">
        <CardHeader>
          <CardTitle className="typography-h4 text-primary-contrast">
            Margin Level
          </CardTitle>
          <CardDescription className="text-secondary-contrast">
            Shows your current margin usage and trend over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Placeholder
            title="Margin Level"
            description="When positions are open, this card will show your margin usage, a trend chart and actionable guidance."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation="1" className="min-h-[200px] p-6">
      <CardHeader>
        <CardTitle className="typography-h4 text-primary-contrast">
          Margin Level
        </CardTitle>
        <CardDescription className="text-secondary-contrast">
          Current margin usage and recent trend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold typography-body text-primary-contrast tracking-tight tabular-nums">
              {marginLevel}%
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={getChangeClassName()}>
                {trendData.changeDirection !== "neutral" && (
                  <>
                    {trendData.changeDirection === "up" ? "+" : ""}
                    {Math.abs(trendData.changePercentage).toFixed(1)}%
                  </>
                )}
                {trendData.changeDirection === "neutral" && "0.0%"}
              </span>
              <span className="text-xs text-secondary-contrast">
                vs period start
              </span>
            </div>
          </div>

          <div className="text-xs">
            {marginLevel > 80 ? (
              <span className="px-2 py-1 bg-danger-contrast/10 text-danger-contrast rounded-full">
                High Risk
              </span>
            ) : marginLevel > 60 ? (
              <span className="px-2 py-1 bg-warning-contrast/10 text-warning-contrast rounded-full">
                Medium Risk
              </span>
            ) : (
              <span className="px-2 py-1 bg-success-contrast/10 text-success-contrast rounded-full">
                Low Risk
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-secondary-contrast">
            <span>0% Used</span>
            <span>{Math.max(0, Math.min(100, marginLevel))}% Used</span>
            <span>100% Used</span>
          </div>
          <Progress
            value={Math.max(0, Math.min(100, marginLevel))}
            className="h-2"
          />
          {trend && trend.length > 0 && (
            <div className="mt-3">
              <svg
                width="100%"
                height="40"
                viewBox="0 0 100 30"
                preserveAspectRatio="none"
                aria-hidden
              >
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  points={(() => {
                    const values = trend.slice();
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    const range = max - min || 1;
                    const pts = values.map((v, i) => {
                      const x = Math.round(
                        (i / (values.length - 1 || 1)) * 100,
                      );
                      const y = Math.round((1 - (v - min) / range) * 30);
                      return `${x},${y}`;
                    });
                    return pts.join(" ");
                  })()}
                />
              </svg>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="text-center">
            <div className="text-tertiary-contrast">Current</div>
            <div className="font-medium text-primary-contrast">
              {marginLevel}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-tertiary-contrast">Average</div>
            <div className="font-medium text-primary-contrast">
              {(trend.reduce((sum, d) => sum + d, 0) / trend.length).toFixed(1)}
              %
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarginLevelCard;
