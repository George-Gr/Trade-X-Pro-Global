import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, Clock, AlertCircle, ArrowRight, Wallet, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import TradingViewWatchlist from "@/components/trading/TradingViewWatchlist";
import { RiskAlerts } from "@/components/risk/RiskAlerts";
import { MarginLevelIndicator } from "@/components/risk/MarginLevelIndicator";
import TradingViewErrorBoundary from "@/components/TradingViewErrorBoundary";

const Dashboard = () => {
  const navigate = useNavigate();
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  type StatTrend = "up" | "down" | "neutral";

  // Fixed: Removed redundant Account Balance duplicate
  // Fixed: Standardized icon usage across all cards
  // Fixed: Added time context labels (All-time)
  // Fixed: Clarified metric labels and removed redundant subtitles
  const stats = [
    {
      title: "Total Equity",
      value: "$50,000.00",
      change: "0%",
      timeContext: "Current Balance",
      icon: Wallet,
      trend: "neutral" as StatTrend,
    },
    {
      title: "Profit/Loss",
      value: "$0.00",
      change: "0%",
      timeContext: "All-time",
      icon: TrendingDown,
      trend: "neutral" as StatTrend,
    },
    {
      title: "Available Margin",
      value: "$50,000.00",
      change: "100% Used",
      timeContext: "Ready to Trade",
      icon: Zap,
      trend: "neutral" as StatTrend,
    },
    {
      title: "Open Positions",
      value: "0",
      change: "No active trades",
      icon: Activity,
      trend: "neutral" as StatTrend,
      empty: true,
    },
  ];

  const recentActivity = [
    { time: "Today", action: "Account Created", status: "Approved" },
    { time: "Today", action: "KYC Submitted", status: "Approved" },
    { time: "Today", action: "Virtual Balance Assigned", status: "$50,000" },
  ];

  return (
    <AuthenticatedLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your trading account</p>
      </div>

      {/* Stats Grid - Fixed: Standardized typography and improved structure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8" style={{ gridAutoRows: 'minmax(auto, 1fr)' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isEmptyState = (stat as any).empty;
          const isNeutral = stat.trend === "neutral" && !stat.change.includes("+") && !stat.change.includes("-");
          
          return (
            <Card key={stat.title} className="rounded-lg border-border/70 focus-within:ring-2 focus-within:ring-offset-2 hover:shadow-lg focus-within:ring-primary transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                <div className="flex-1">
                  <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide">
                    {stat.title}
                  </CardTitle>
                  {stat.timeContext && (
                    <p className="text-xs text-muted-foreground/70 mt-2">{stat.timeContext}</p>
                  )}
                </div>
                <Icon className="h-5 w-5 text-primary flex-shrink-0 ml-4" aria-hidden="true" />
              </CardHeader>
              <CardContent className="space-y-2" role="article" aria-label={`${stat.title}: ${stat.value}`}>
                <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
                {isEmptyState ? (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      {stat.change}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You haven't opened any positions yet. Start trading to see them here.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    {stat.change.includes("+") ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <p className="text-xs font-medium text-green-600">{stat.change}</p>
                      </>
                    ) : stat.change.includes("-") && !stat.change.includes("0%") ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <p className="text-xs font-medium text-red-600">{stat.change}</p>
                      </>
                    ) : (
                      <p className="text-xs font-medium text-muted-foreground">{stat.change}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Risk Management Section - Fixed: Added placeholder content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Margin Level</CardTitle>
          </CardHeader>
          <CardContent>
            <MarginLevelIndicator />
            {/* Empty state when no positions */}
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">No Active Margin</p>
              <p className="text-xs text-muted-foreground mt-1">
                Open a position with leverage to see your margin level
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Risk Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskAlerts />
            {/* Empty state when no alerts */}
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-3">
                <AlertCircle className="h-6 w-6 text-green-600 dark:text-green-500" />
              </div>
              <p className="text-sm font-medium text-foreground">No Risk Alerts</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your account is in excellent standing. All positions within safe limits.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-primary/20 mb-8 transition-colors hover:border-primary/40">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <Button 
            onClick={() => navigate("/trade")} 
            className="gap-3 h-12 px-8 font-medium text-base hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 transition-all duration-200"
          >
            <TrendingUp className="h-5 w-5" />
            Start Trading
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/portfolio")} 
            className="gap-3 h-12 px-8 font-medium text-base hover:scale-105 active:scale-95 hover:border-primary/50 transition-all duration-200"
          >
            <Activity className="h-5 w-5" />
            View Portfolio
          </Button>
        </CardContent>
      </Card>

      {/* Empty State Card for Open Positions - Fixed #15: Added prominent button */}
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5 mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Ready to Start Trading?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base text-foreground">
            You currently have <strong>no open positions</strong>. Your account is fully funded and ready for trading.
          </p>
          <div className="bg-white/50 dark:bg-slate-900/50 rounded-lg p-4 border border-primary/20 space-y-3">
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Choose Your Instrument</p>
                <p className="text-xs text-muted-foreground">Forex, stocks, commodities, crypto, indices, ETFs, or bonds</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Set Your Trade Parameters</p>
                <p className="text-xs text-muted-foreground">Entry price, position size, stop loss, and take profit</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Execute Your Trade</p>
                <p className="text-xs text-muted-foreground">Review and confirm your position in real-time</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => navigate("/trade")} 
            className="w-full h-12 gap-3 font-semibold text-base bg-primary hover:bg-primary/90"
            size="lg"
          >
            <TrendingUp className="h-5 w-5" />
            Open Your First Position
          </Button>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                  <span className="text-sm font-medium text-profit">{activity.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Watchlist */}
        <Card className="lg:col-span-1 border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Market Watch</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <TradingViewErrorBoundary widgetType="Watchlist">
              <TradingViewWatchlist />
            </TradingViewErrorBoundary>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
