import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import Watchlist from "@/components/trading/Watchlist";

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
      change: "Active trades",
      icon: Activity,
      trend: "neutral" as const,
    },
  ];

  const recentActivity = [
    { time: "Today", action: "Account Created", status: "Approved" },
    { time: "Today", action: "KYC Submitted", status: "Approved" },
    { time: "Today", action: "Virtual Balance Assigned", status: "$50,000" },
  ];

  return (
    <AuthenticatedLayout>
      <div className="h-full overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back to your trading account</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button onClick={() => navigate("/trade")} className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Start Trading
              </Button>
              <Button variant="outline" onClick={() => navigate("/portfolio")} className="gap-2">
                <Activity className="h-4 w-4" />
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

            {/* Watchlist */}
            <div className="lg:col-span-1">
              <Watchlist />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
