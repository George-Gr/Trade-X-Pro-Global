import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, Clock, AlertCircle, ArrowRight, Wallet, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import TradingViewWatchlist from "@/components/trading/TradingViewWatchlist";
import MarginLevelCard from "@/components/dashboard/MarginLevelCard";
import RiskAlertsCard from "@/components/dashboard/RiskAlertsCard";
// removed incorrect RiskAlert import — use events returned from useRiskEvents instead
import ProfitLossCard from "@/components/dashboard/ProfitLossCard";
import { ErrorMessage, RealtimeErrorAlert } from "@/components/ui/ErrorUI";
import { useRiskMetrics } from "@/hooks/useRiskMetrics";
import useRiskEvents from "@/hooks/useRiskEvents";
import { useProfitLossData } from "@/hooks/useProfitLossData";
import TradingViewErrorBoundary from "@/components/TradingViewErrorBoundary";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import "@/components/dashboard/DashboardGrid.css";

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

  // Use real backend hooks for risk metrics & events (includes realtime subscriptions)
  const { riskMetrics, marginTrend, loading: riskLoading, error: riskError, refetch: refetchRiskMetrics } = useRiskMetrics();
  const { events: alertsData, loading: alertsLoading } = useRiskEvents(5);
  
  // Use profit/loss data hook for enhanced chart visualization
  const { 
    metrics: profitLossMetrics, 
    chartData: profitLossData, 
    loading: profitLossLoading, 
    error: profitLossError,
    refetch: refetchProfitLoss 
  } = useProfitLossData('7d');

  // Show loading skeleton while data is being fetched
  if (riskLoading || alertsLoading || profitLossLoading) {
    return <DashboardLoading />;
  }

  return (
    <AuthenticatedLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="typography-h1 mb-2">Dashboard</h1>
        <p className="typography-body text-secondary-contrast">Welcome back to your trading account</p>
      </div>

      {/* Stats Grid - Using CSS Grid for responsive layout */}
      <div className="dashboard-grid mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isEmptyState = 'empty' in stat && stat.empty;
          const isNeutral = stat.trend === "neutral" && !stat.change.includes("+") && !stat.change.includes("-");
          
          return (
            <Card 
              key={stat.title} 
              elevation="1" 
              variant="primary"
              className="rounded-lg border-border/70 focus-within:ring-2 focus-within:ring-offset-2 hover:shadow-lg focus-within:ring-primary transition-shadow duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                <div className="flex-1">
                  <CardTitle className="typography-label text-primary-contrast tracking-wide">
                    {stat.title}
                  </CardTitle>
                  {stat.timeContext && (
                    <p className="text-xs text-secondary-contrast mt-2">{stat.timeContext}</p>
                  )}
                </div>
                <Icon className="h-5 w-5 text-primary flex-shrink-0 ml-4" aria-hidden="true" />
              </CardHeader>
              <CardContent className="space-y-2" role="article" aria-label={`${stat.title}: ${stat.value}`}>
                <div className="text-3xl font-bold tracking-tight text-primary-contrast">{stat.value}</div>
                {isEmptyState ? (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-secondary-contrast font-medium">
                      {stat.change}
                    </p>
                    <p className="text-xs text-tertiary-contrast leading-relaxed">
                      You haven't opened any positions yet. Start trading to see them here.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    {stat.change.includes("+") ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-success-contrast flex-shrink-0" />
                        <p className="text-xs font-medium text-success-contrast">{stat.change}</p>
                      </>
                    ) : stat.change.includes("-") && !stat.change.includes("0%") ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-danger-contrast flex-shrink-0" />
                        <p className="text-xs font-medium text-danger-contrast">{stat.change}</p>
                      </>
                    ) : (
                      <p className="text-xs font-medium text-secondary-contrast">{stat.change}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Error Alerts for Connection Issues */}
      {riskError && (
        <RealtimeErrorAlert onRetry={refetchRiskMetrics} />
      )}

      {/* Risk Management Section - Using CSS Grid for responsive layout */}
      <div className="dashboard-grid mb-xl section-spacing">
        {/* Margin Level card - wired to real backend via useRiskMetrics */}
        <div>
          {riskError ? (
            <ErrorMessage
              error={riskError}
              title="Margin Data Unavailable"
              description="Unable to load margin metrics. Please check your connection."
              onRetry={refetchRiskMetrics}
            />
          ) : (
            <MarginLevelCard loading={riskLoading} marginLevel={riskMetrics?.currentMarginLevel ?? 0} trend={marginTrend} />
          )}
        </div>
        
        {/* Profit/Loss card - wired to real backend via useProfitLossData */}
        <div>
          {profitLossError ? (
            <ErrorMessage
              error={profitLossError}
              title="Profit/Loss Data Unavailable"
              description="Unable to load profit/loss data. Please check your connection."
              onRetry={refetchProfitLoss}
            />
          ) : (
            <ProfitLossCard 
              loading={profitLossLoading} 
              currentValue={profitLossMetrics?.currentEquity ?? 0}
              profitLossData={profitLossData}
              timeRange="7d"
            />
          )}
        </div>
        
        {/* Risk Alerts card - wired to real backend via useRiskEvents */}
        <div>
          {alertsLoading && !alertsData ? (
            <RiskAlertsCard loading={alertsLoading} alerts={[]} />
          ) : (
            <RiskAlertsCard
              loading={alertsLoading}
              alerts={alertsData?.map((e) => ({
                id: e.id,
                level: (e.severity === "critical" || e.severity === "danger") ? "critical" : e.severity === "warning" ? "warning" : "info",
                title: e.event_type ? String(e.event_type).replace(/_/g, " ") : (e.description || "Risk event"),
                details: e.description,
              }))}
            />
          )}
        </div>
      </div>

      {/* Market Watch - Full width component below Risk Management */}
      <Card elevation="2" variant="primary" className="border-border/70 mb-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-primary-contrast">Market Watch</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <TradingViewErrorBoundary widgetType="Watchlist">
            <TradingViewWatchlist />
          </TradingViewErrorBoundary>
        </CardContent>
      </Card>

      {/* Combined Actions Section - Quick Actions, Ready to Start Trading, and Recent Activity */}
      <Card elevation="1" variant="secondary" className="border-border/70 mb-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-primary-contrast">Trading Actions & Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-xl">
          {/* Quick Actions Section */}
          <div className="space-y-lg">
            <h3 className="text-sm font-semibold text-primary-contrast mb-md">Quick Actions</h3>
            <div className="flex gap-md flex-wrap">
              <Button 
                onClick={() => navigate("/trade")} 
                className="gap-md h-12 px-lg font-medium text-base hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 transition-all duration-200"
              >
                <TrendingUp className="h-5 w-5" />
                Start Trading
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/portfolio")} 
                className="gap-md h-12 px-lg font-medium text-base hover:scale-105 active:scale-95 hover:border-primary/50 transition-all duration-200"
              >
                <Activity className="h-5 w-5" />
                View Portfolio
              </Button>
            </div>
          </div>

          {/* Ready to Start Trading Section */}
          <div className="space-y-lg">
            <h3 className="text-sm font-semibold text-primary-contrast mb-md">Ready to Start Trading?</h3>
            <div className="space-y-lg">
              <p className="text-base text-primary-contrast">
                You currently have <strong>no open positions</strong>. Your account is fully funded and ready for trading.
              </p>
              <div className="bg-quick-actions/50 rounded-lg p-lg border border-primary/20 space-y-md">
                <div className="flex items-start gap-md">
                  <ArrowRight className="h-5 w-5 text-primary mt-sm flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-primary-contrast">Choose Your Instrument</p>
                    <p className="text-xs text-secondary-contrast">Forex, stocks, commodities, crypto, indices, ETFs, or bonds</p>
                  </div>
                </div>
<div className="flex items-start gap-md">
                  <ArrowRight className="h-5 w-5 text-primary mt-sm flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-primary-contrast">Set Your Trade Parameters</p>
                    <p className="text-xs text-secondary-contrast">Entry price, position size, stop loss, and take profit</p>
                  </div>
                </div>
                <div className="flex items-start gap-md">
                  <ArrowRight className="h-5 w-5 text-primary mt-sm flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-primary-contrast">Execute Your Trade</p>
                    <p className="text-xs text-secondary-contrast">Review and confirm your position in real-time</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/trade")} 
                className="w-full gap-md font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
                aria-label="Open your first trading position"
              >
                <TrendingUp className="h-5 w-5" />
                Open Your First Position
              </Button>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="space-y-lg">
            <h3 className="text-sm font-semibold text-primary-contrast mb-md">Recent Activity</h3>
            <div className="space-y-md">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b border-border/50 pb-md last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-primary-contrast">{activity.action}</p>
                    <p className="text-sm text-secondary-contrast">{activity.time}</p>
                  </div>
                  <span className="text-sm font-medium text-success-contrast">{activity.status}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      
    </AuthenticatedLayout>
  );
};

export default Dashboard;
