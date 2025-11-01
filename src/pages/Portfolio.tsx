import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";

const Portfolio = () => {
  const portfolioMetrics = [
    { label: "Balance", value: "$50,000.00" },
    { label: "Equity", value: "$50,000.00" },
    { label: "Margin Used", value: "$0.00" },
    { label: "Free Margin", value: "$50,000.00" },
    { label: "Margin Level", value: "∞" },
    { label: "Total P&L", value: "$0.00", color: "text-muted-foreground" },
  ];

  const positions = [
    // Mock data - will be populated with real trades
  ];

  return (
    <AuthenticatedLayout>
      <div className="h-full overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
            <p className="text-muted-foreground">Monitor your positions and account metrics</p>
          </div>

          {/* Account Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {portfolioMetrics.map((metric) => (
              <Card key={metric.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {metric.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-lg font-bold ${metric.color || ""}`}>
                    {metric.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Open Positions */}
          <Card>
            <CardHeader>
              <CardTitle>Open Positions</CardTitle>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg">No open positions</p>
                  <p className="text-sm mt-2">Start trading to see your positions here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Open Price</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>S/L</TableHead>
                      <TableHead>T/P</TableHead>
                      <TableHead>P&L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.map((position: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{position.symbol}</TableCell>
                        <TableCell>
                          <Badge variant={position.type === "BUY" ? "default" : "destructive"}>
                            {position.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{position.volume}</TableCell>
                        <TableCell>{position.openPrice}</TableCell>
                        <TableCell>{position.currentPrice}</TableCell>
                        <TableCell>{position.stopLoss || "-"}</TableCell>
                        <TableCell>{position.takeProfit || "-"}</TableCell>
                        <TableCell className={position.pnl >= 0 ? "text-profit" : "text-loss"}>
                          ${position.pnl.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Performance Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Performance chart will be displayed here
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Portfolio;
