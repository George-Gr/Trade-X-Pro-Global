import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Filter, RefreshCw } from "lucide-react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { useTradingHistory } from "@/hooks/useTradingHistory";
import TradeStatisticsCards from "@/components/history/TradeStatisticsCards";
import ExportButtons from "@/components/history/ExportButtons";

const History = () => {
  const [activeTab, setActiveTab] = useState("trades");
  const [searchQuery, setSearchQuery] = useState("");
  const [symbolFilter, setSymbolFilter] = useState<string>("all");
  const [sideFilter, setSideFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  const { closedPositions, orders, ledger, statistics, loading, refresh } = useTradingHistory();

  // Get unique symbols for filter
  const uniqueSymbols = useMemo(() => {
    const symbols = new Set(closedPositions.map((p) => p.symbol));
    return Array.from(symbols).sort();
  }, [closedPositions]);

  // Filter trades based on search and filters
  const filteredTrades = useMemo(() => {
    let filtered = [...closedPositions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((trade) =>
        trade.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Symbol filter
    if (symbolFilter !== "all") {
      filtered = filtered.filter((trade) => trade.symbol === symbolFilter);
    }

    // Side filter
    if (sideFilter !== "all") {
      filtered = filtered.filter((trade) => trade.side === sideFilter);
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter((trade) => new Date(trade.closed_at) >= filterDate);
    }

    return filtered;
  }, [closedPositions, searchQuery, symbolFilter, sideFilter, dateRange]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (searchQuery) {
      filtered = filtered.filter((order) =>
        order.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (symbolFilter !== "all") {
      filtered = filtered.filter((order) => order.symbol === symbolFilter);
    }

    return filtered;
  }, [orders, searchQuery, symbolFilter]);

  // Filter ledger entries
  const filteredLedger = useMemo(() => {
    let filtered = [...ledger];

    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.transaction_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [ledger, searchQuery]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPrice = (value: number, symbol: string) => {
    const isJpy = symbol.includes("JPY");
    return value.toFixed(isJpy ? 3 : 5);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <AuthenticatedLayout>
      <div className="h-full overflow-auto">
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="typography-h1 mb-2">Trading History & Reports</h1>
              <p className="text-muted-foreground">
                Comprehensive view of your trading activity with advanced analytics
              </p>
            </div>
            <Button variant="outline" onClick={refresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Statistics Cards */}
          {!loading && <TradeStatisticsCards statistics={statistics} />}

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-4">
                <Filter className="h-4 w-4" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-2 top-4.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by symbol..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <Select value={symbolFilter} onValueChange={setSymbolFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Symbols" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Symbols</SelectItem>
                    {uniqueSymbols.map((symbol) => (
                      <SelectItem key={symbol} value={symbol}>
                        {symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sideFilter} onValueChange={setSideFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Sides" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sides</SelectItem>
                    <SelectItem value="buy">Buy Only</SelectItem>
                    <SelectItem value="sell">Sell Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery("");
                    setSymbolFilter("all");
                    setSideFilter("all");
                    setDateRange("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Export Buttons */}
          <ExportButtons trades={filteredTrades} orders={filteredOrders} ledger={filteredLedger} />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="trades">Closed Positions</TabsTrigger>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="ledger">Account Ledger</TabsTrigger>
            </TabsList>

            {/* Closed Positions Tab */}
            <TabsContent value="trades" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Closed Positions ({filteredTrades.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredTrades.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-lg">No closed positions</p>
                      <p className="text-sm mt-2">
                        {closedPositions.length === 0
                          ? "Your closed trades will appear here"
                          : "No trades match your filters"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Closed At</TableHead>
                              <TableHead>Symbol</TableHead>
                              <TableHead>Side</TableHead>
                              <TableHead>Volume</TableHead>
                              <TableHead>Entry Price</TableHead>
                              <TableHead>Exit Price</TableHead>
                              <TableHead>P&L</TableHead>
                              <TableHead>Margin Used</TableHead>
                              <TableHead>Duration</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredTrades.map((trade) => {
                              const duration = Math.floor(
                                (new Date(trade.closed_at).getTime() -
                                  new Date(trade.opened_at).getTime()) /
                                  (1000 * 60)
                              );
                              return (
                                <TableRow key={trade.id}>
                                  <TableCell className="text-sm">
                                    {formatDateTime(trade.closed_at)}
                                  </TableCell>
                                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={trade.side === "buy" ? "default" : "destructive"}
                                    >
                                      {trade.side.toUpperCase()}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{trade.quantity.toFixed(2)}</TableCell>
                                  <TableCell>{formatPrice(trade.entry_price, trade.symbol)}</TableCell>
                                  <TableCell>{formatPrice(trade.exit_price, trade.symbol)}</TableCell>
                                  <TableCell
                                    className={`font-semibold ${
                                      trade.realized_pnl >= 0 ? "text-profit" : "text-loss"
                                    }`}
                                  >
                                    {trade.realized_pnl >= 0 ? "+" : ""}
                                    {formatCurrency(trade.realized_pnl)}
                                  </TableCell>
                                  <TableCell>{formatCurrency(trade.margin_used)}</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {duration < 60
                                      ? `${duration}m`
                                      : `${Math.floor(duration / 60)}h ${duration % 60}m`}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Card Layout */}
                      <div className="md:hidden space-y-4">
                        {filteredTrades.map((trade) => {
                          const duration = Math.floor(
                            (new Date(trade.closed_at).getTime() -
                              new Date(trade.opened_at).getTime()) /
                              (1000 * 60)
                          );
                          return (
                            <Card key={trade.id} className="p-4 border-l-4 border-l-primary hover:shadow-md transition-all duration-150 cursor-pointer">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="font-semibold text-lg">{trade.symbol}</h3>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDateTime(trade.closed_at)}
                                    </p>
                                  </div>
                                  <Badge
                                    variant={trade.side === "buy" ? "default" : "destructive"}
                                  >
                                    {trade.side.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Volume:</span>
                                    <p className="font-mono font-semibold">{trade.quantity.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Entry:</span>
                                    <p className="font-mono font-semibold">{formatPrice(trade.entry_price, trade.symbol)}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Exit:</span>
                                    <p className="font-mono font-semibold">{formatPrice(trade.exit_price, trade.symbol)}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Duration:</span>
                                    <p className="font-mono font-semibold">
                                      {duration < 60
                                        ? `${duration}m`
                                        : `${Math.floor(duration / 60)}h ${duration % 60}m`}
                                    </p>
                                  </div>
                                </div>
                                <div className="pt-2 border-t">
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">P&L:</span>
                                    <span className={`font-semibold ${
                                      trade.realized_pnl >= 0 ? "text-profit" : "text-loss"
                                    }`}>
                                      {trade.realized_pnl >= 0 ? "+" : ""}
                                      {formatCurrency(trade.realized_pnl)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-muted-foreground">Margin:</span>
                                    <span className="font-mono font-semibold">{formatCurrency(trade.margin_used)}</span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Order History Tab */}
            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-lg">No orders</p>
                      <p className="text-sm mt-2">Your order history will appear here</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Created At</TableHead>
                              <TableHead>Symbol</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Side</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Limit Price</TableHead>
                              <TableHead>Fill Price</TableHead>
                              <TableHead>Commission</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredOrders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell className="text-sm">
                                  {formatDateTime(order.created_at)}
                                </TableCell>
                                <TableCell className="font-medium">{order.symbol}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {order.order_type.toUpperCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={order.side === "buy" ? "default" : "destructive"}>
                                    {order.side.toUpperCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell>{order.quantity.toFixed(2)}</TableCell>
                                <TableCell>
                                  {order.price ? formatPrice(order.price, order.symbol) : "-"}
                                </TableCell>
                                <TableCell>
                                  {order.fill_price
                                    ? formatPrice(order.fill_price, order.symbol)
                                    : "-"}
                                </TableCell>
                                <TableCell>{formatCurrency(order.commission)}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      order.status === "filled"
                                        ? "default"
                                        : order.status === "cancelled"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                  >
                                    {order.status.toUpperCase()}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Card Layout */}
                      <div className="md:hidden space-y-4">
                        {filteredOrders.map((order) => (
                          <Card key={order.id} className="p-4 border-l-4 border-l-primary hover:shadow-md transition-all duration-150 cursor-pointer">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg">{order.symbol}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDateTime(order.created_at)}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Badge variant="outline">
                                    {order.order_type.toUpperCase()}
                                  </Badge>
                                  <Badge variant={order.side === "buy" ? "default" : "destructive"}>
                                    {order.side.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Qty:</span>
                                  <p className="font-mono font-semibold">{order.quantity.toFixed(2)}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Limit:</span>
                                  <p className="font-mono font-semibold">
                                    {order.price ? formatPrice(order.price, order.symbol) : "-"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Fill:</span>
                                  <p className="font-mono font-semibold">
                                    {order.fill_price
                                      ? formatPrice(order.fill_price, order.symbol)
                                      : "-"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Commission:</span>
                                  <p className="font-mono font-semibold">{formatCurrency(order.commission)}</p>
                                </div>
                              </div>
                              <div className="pt-2 border-t">
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Status:</span>
                                  <Badge
                                    variant={
                                      order.status === "filled"
                                        ? "default"
                                        : order.status === "cancelled"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                  >
                                    {order.status.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ledger Tab */}
            <TabsContent value="ledger" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Ledger ({filteredLedger.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredLedger.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-lg">No ledger entries</p>
                      <p className="text-sm mt-2">Account transactions will appear here</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date/Time</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Balance Before</TableHead>
                              <TableHead>Balance After</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredLedger.map((entry) => (
                              <TableRow key={entry.id}>
                                <TableCell className="text-sm">
                                  {formatDateTime(entry.created_at)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {entry.transaction_type.toUpperCase().replace("_", " ")}
                                  </Badge>
                                </TableCell>
                                <TableCell
                                  className={`font-semibold ${
                                    entry.amount >= 0 ? "text-profit" : "text-loss"
                                  }`}
                                >
                                  {entry.amount >= 0 ? "+" : ""}
                                  {formatCurrency(entry.amount)}
                                </TableCell>
                                <TableCell>{formatCurrency(entry.balance_before)}</TableCell>
                                <TableCell className="font-medium">
                                  {formatCurrency(entry.balance_after)}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {entry.description || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Card Layout */}
                      <div className="md:hidden space-y-4">
                        {filteredLedger.map((entry) => (
                          <Card key={entry.id} className="p-4 border-l-4 border-l-primary hover:shadow-md transition-all duration-150 cursor-pointer">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {entry.transaction_type.replace("_", " ").toUpperCase()}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDateTime(entry.created_at)}
                                  </p>
                                </div>
                                <span className={`font-semibold text-lg ${
                                  entry.amount >= 0 ? "text-profit" : "text-loss"
                                }`}>
                                  {entry.amount >= 0 ? "+" : ""}
                                  {formatCurrency(entry.amount)}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Before:</span>
                                  <p className="font-mono font-semibold">{formatCurrency(entry.balance_before)}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">After:</span>
                                  <p className="font-mono font-semibold">{formatCurrency(entry.balance_after)}</p>
                                </div>
                              </div>
                              {entry.description && (
                                <div className="pt-2 border-t">
                                  <p className="text-sm text-muted-foreground">{entry.description}</p>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default History;
