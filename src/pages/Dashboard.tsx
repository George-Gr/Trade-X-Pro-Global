import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
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

  const stats = [
    {
      title: "Account Balance",
      value: "$50,000.00",
      change: "+0%",
      icon: DollarSign,
      trend: "neutral" as const,
    },
    {
      title: "Total Equity",
      value: "$50,000.00",
      change: "+0%",
      icon: Activity,
      trend: "neutral" as const,
    },
    {
      title: "Total Profit/Loss",
      value: "$0.00",
      change: "0%",
      icon: TrendingUp,
      trend: "neutral" as const,
    },
    {
      title: "Open Positions",
      value: "0",
      change: "No active trades",
      icon: Activity,
      trend: "neutral" as const,
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
      <div className="h-full overflow-auto">
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back to your trading account</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const isTrendUp = stat.trend === "up" || stat.change.includes("+");
              const isTrendDown = stat.trend === "down" || stat.change.includes("-");
              const isEmptyState = (stat as any).empty;
              
              return (
                <Card key={stat.title} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {isEmptyState ? (
                      <div className="mt-2 space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">
                          {stat.change}
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          Ready to start trading? Head to the Trade page to open your first position.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        {isTrendUp && (
                          <TrendingUp className="h-4 w-4 text-buy animate-in fade-in slide-in-from-bottom-1 duration-500" />
                        )}
                        {isTrendDown && (
                          <TrendingDown className="h-4 w-4 text-sell animate-in fade-in slide-in-from-top-1 duration-500" />
                        )}
                        <p className={`text-xs font-medium ${
                          isTrendUp ? "text-buy" : isTrendDown ? "text-sell" : "text-muted-foreground"
                        }`}>
                          {stat.change}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Risk Management Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MarginLevelIndicator />
            <div>
              <RiskAlerts />
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4 flex-wrap">
              <Button 
                onClick={() => navigate("/trade")} 
                className="gap-2 h-11 px-6 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <TrendingUp className="h-5 w-5" />
                Start Trading
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/portfolio")} 
                className="gap-2 h-11 px-6 font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:border-primary/50"
              >
                <Activity className="h-5 w-5" />
                View Portfolio
              </Button>
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
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
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Market Watch</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px]">
                <TradingViewErrorBoundary widgetType="Watchlist">
                  <TradingViewWatchlist />
                </TradingViewErrorBoundary>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
