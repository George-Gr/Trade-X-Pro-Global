import React, { useState, useEffect, useRef } from "react";
import { useTradingKeyboardShortcuts } from "@/lib/tradingKeyboardNavigation";
import { useColorContrastVerification } from "@/lib/colorContrastVerification";
import { useAccessibility } from "@/contexts/AccessibilityContext";

/**
 * Type definitions for market data
 */
export type MarketSymbol = "AAPL" | "MSFT" | "GOOGL" | "AMZN" | "TSLA";
export type MarketData = Record<
  MarketSymbol,
  { price: number; change: number; changePercent: number }
>;

/**
 * Accessible Trading Dashboard Component
 *
 * Comprehensive trading dashboard with full accessibility support.
 * Includes keyboard navigation, screen reader support, and real-time updates.
 */

export function TradingDashboard() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "positions" | "orders" | "charts"
  >("overview");
  const [selectedSymbol, setSelectedSymbol] = useState<MarketSymbol>("AAPL");
  const [isLive, setIsLive] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  const keyboardShortcuts = useTradingKeyboardShortcuts();
  const colorContrast = useColorContrastVerification();
  const { visualPreferences, complianceScore, screenReaderEnabled } =
    useAccessibility();

  // Mock data
  const portfolioData = {
    totalValue: 150000,
    dailyChange: 1250,
    positions: [
      {
        symbol: "AAPL",
        quantity: 100,
        avgPrice: 150.25,
        currentPrice: 150.75,
        value: 15075,
      },
      {
        symbol: "MSFT",
        quantity: 50,
        avgPrice: 300.0,
        currentPrice: 302.5,
        value: 15125,
      },
      {
        symbol: "GOOGL",
        quantity: 25,
        avgPrice: 2800.0,
        currentPrice: 2795.0,
        value: 69875,
      },
      {
        symbol: "AMZN",
        quantity: 30,
        avgPrice: 175.0,
        currentPrice: 177.5,
        value: 5325,
      },
      {
        symbol: "TSLA",
        quantity: 20,
        avgPrice: 250.0,
        currentPrice: 248.75,
        value: 4975,
      },
    ],
    recentOrders: [
      {
        id: "ORD001",
        symbol: "AAPL",
        type: "Buy",
        quantity: 100,
        price: 150.25,
        status: "Filled",
        time: "10:30 AM",
      },
      {
        id: "ORD002",
        symbol: "MSFT",
        type: "Sell",
        quantity: 50,
        price: 302.5,
        status: "Filled",
        time: "10:15 AM",
      },
      {
        id: "ORD003",
        symbol: "GOOGL",
        type: "Buy",
        quantity: 25,
        price: 2800.0,
        status: "Pending",
        time: "09:45 AM",
      },
    ],
  };

  const marketDataRef = useRef<MarketData>({
    AAPL: { price: 150.75, change: 0.5, changePercent: 0.33 },
    MSFT: { price: 302.5, change: 2.5, changePercent: 0.83 },
    GOOGL: { price: 2795.0, change: -5.0, changePercent: -0.18 },
    AMZN: { price: 177.5, change: 2.5, changePercent: 1.43 },
    TSLA: { price: 248.75, change: -1.25, changePercent: -0.5 },
  });

  // Live price updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Simulate price updates
      (Object.keys(marketDataRef.current) as MarketSymbol[]).forEach(
        (symbol) => {
          const change = (Math.random() - 0.5) * 2; // Random change between -1 and +1
          const curr = marketDataRef.current[symbol];
          const newPrice = Math.max(1, curr.price + change);
          curr.change = change;
          curr.changePercent = (change / (newPrice - change)) * 100;
          curr.price = newPrice;
        },
      );

      setRefreshCount((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  const getChangeArrow = (change: number) => {
    return change >= 0 ? "▲" : "▼";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Trading Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time portfolio and market data with full accessibility support
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
            Accessibility: {Math.round(complianceScore)}%
          </span>

          <button
            onClick={() => setIsLive((prev) => !prev)}
            className={`px-4 py-2 rounded-lg font-medium ${
              isLive ? "bg-green-500 text-white" : "bg-gray-500 text-white"
            }`}
            aria-pressed={isLive}
            aria-label={
              isLive ? "Live updates enabled" : "Live updates disabled"
            }
          >
            {isLive ? "Live: ON" : "Live: OFF"}
          </button>

          <button
            onClick={() => setRefreshCount((prev) => prev + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium"
            aria-label="Refresh data"
          >
            Refresh
          </button>

          <span className="text-sm text-muted-foreground">
            Last update: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Accessibility Status */}
      <div className="bg-card rounded-lg p-4 border">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                screenReaderEnabled
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {screenReaderEnabled ? "Screen Reader: ON" : "Screen Reader: OFF"}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                visualPreferences.preferences.highContrast
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {visualPreferences.preferences.highContrast
                ? "High Contrast: ON"
                : "High Contrast: OFF"}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                visualPreferences.preferences.largerText
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {visualPreferences.preferences.largerText
                ? "Larger Text: ON"
                : "Larger Text: OFF"}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Keyboard: Use Ctrl+Tab to switch tabs • Ctrl+R to refresh
          </div>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-sm text-muted-foreground mb-2">
            Total Portfolio Value
          </h3>
          <p className="text-3xl font-bold">
            {formatCurrency(portfolioData.totalValue)}
          </p>
          <p
            className={`text-sm mt-2 ${getChangeColor(portfolioData.dailyChange)}`}
          >
            {getChangeArrow(portfolioData.dailyChange)}{" "}
            {formatCurrency(portfolioData.dailyChange)} today
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-sm text-muted-foreground mb-2">Open Positions</h3>
          <p className="text-3xl font-bold">{portfolioData.positions.length}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Active trading positions
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-sm text-muted-foreground mb-2">
            Recent Activity
          </h3>
          <p className="text-3xl font-bold">
            {portfolioData.recentOrders.length}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Orders in last 24 hours
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <div className="flex space-x-8 overflow-x-auto">
          {[
            { key: "overview", label: "Overview", icon: "📊" },
            { key: "positions", label: "Positions", icon: "💼" },
            { key: "orders", label: "Orders", icon: "📋" },
            { key: "charts", label: "Charts", icon: "📈" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              aria-current={activeTab === tab.key ? "page" : undefined}
            >
              <span className="mr-2" aria-hidden="true">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Market Overview */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">Market Overview</h3>
              <div className="overflow-x-auto">
                <table
                  className="w-full border-collapse"
                  role="table"
                  aria-label="Market overview table"
                >
                  <thead>
                    <tr className="border-b">
                      <th className="text-left font-semibold py-2">Symbol</th>
                      <th className="text-right font-semibold py-2">Price</th>
                      <th className="text-right font-semibold py-2">Change</th>
                      <th className="text-right font-semibold py-2">
                        Change %
                      </th>
                      <th className="text-right font-semibold py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(marketDataRef.current).map(
                      ([symbol, data]) => (
                        <tr key={symbol} className="border-b">
                          <td className="py-3">
                            <div>
                              <div className="font-semibold">{symbol}</div>
                              <div className="text-sm text-muted-foreground">
                                {symbol === "AAPL"
                                  ? "Apple Inc."
                                  : symbol === "MSFT"
                                    ? "Microsoft Corporation"
                                    : symbol === "GOOGL"
                                      ? "Alphabet Inc."
                                      : symbol === "AMZN"
                                        ? "Amazon.com, Inc."
                                        : "Tesla, Inc."}
                              </div>
                            </div>
                          </td>
                          <td
                            className={`py-3 text-right font-semibold ${getChangeColor(data.change)}`}
                          >
                            {formatCurrency(data.price)}
                          </td>
                          <td
                            className={`py-3 text-right ${getChangeColor(data.change)}`}
                          >
                            {getChangeArrow(data.change)}{" "}
                            {formatCurrency(Math.abs(data.change))}
                          </td>
                          <td
                            className={`py-3 text-right ${getChangeColor(data.change)}`}
                          >
                            {getChangeArrow(data.change)}{" "}
                            {Math.abs(data.changePercent).toFixed(2)}%
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() =>
                                  setSelectedSymbol(symbol as MarketSymbol)
                                }
                                className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                                aria-label={`Buy ${symbol}`}
                              >
                                Buy
                              </button>
                              <button
                                onClick={() =>
                                  setSelectedSymbol(symbol as MarketSymbol)
                                }
                                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                                aria-label={`Sell ${symbol}`}
                              >
                                Sell
                              </button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  className="p-4 bg-blue-500 text-white rounded-lg font-medium"
                  aria-label="Create new buy order"
                >
                  New Buy Order
                </button>
                <button
                  className="p-4 bg-red-500 text-white rounded-lg font-medium"
                  aria-label="Create new sell order"
                >
                  New Sell Order
                </button>
                <button
                  className="p-4 bg-green-500 text-white rounded-lg font-medium"
                  aria-label="View portfolio performance"
                >
                  Portfolio Performance
                </button>
                <button
                  className="p-4 bg-purple-500 text-white rounded-lg font-medium"
                  aria-label="Market analysis"
                >
                  Market Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "positions" && (
          <div className="space-y-6">
            {/* Open Positions */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">Open Positions</h3>
              <div className="overflow-x-auto">
                <table
                  className="w-full border-collapse"
                  role="table"
                  aria-label="Open positions table"
                >
                  <thead>
                    <tr className="border-b">
                      <th className="text-left font-semibold py-2">Symbol</th>
                      <th className="text-right font-semibold py-2">
                        Quantity
                      </th>
                      <th className="text-right font-semibold py-2">
                        Avg Price
                      </th>
                      <th className="text-right font-semibold py-2">
                        Current Price
                      </th>
                      <th className="text-right font-semibold py-2">Value</th>
                      <th className="text-right font-semibold py-2">P&L</th>
                      <th className="text-right font-semibold py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioData.positions.map((position) => {
                      const pnl =
                        (position.currentPrice - position.avgPrice) *
                        position.quantity;
                      const pnlPercent =
                        ((position.currentPrice - position.avgPrice) /
                          position.avgPrice) *
                        100;
                      return (
                        <tr key={position.symbol} className="border-b">
                          <td className="py-3">
                            <div className="font-semibold">
                              {position.symbol}
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            {formatNumber(position.quantity)}
                          </td>
                          <td className="py-3 text-right">
                            {formatCurrency(position.avgPrice)}
                          </td>
                          <td className="py-3 text-right">
                            {formatCurrency(position.currentPrice)}
                          </td>
                          <td className="py-3 text-right font-semibold">
                            {formatCurrency(position.value)}
                          </td>
                          <td
                            className={`py-3 text-right ${pnl >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {pnl >= 0 ? "▲" : "▼"}{" "}
                            {formatCurrency(Math.abs(pnl))} (
                            {Math.abs(pnlPercent).toFixed(2)}%)
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                                aria-label={`Close ${position.symbol} position`}
                              >
                                Close
                              </button>
                              <button
                                className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                                aria-label={`Add to ${position.symbol} position`}
                              >
                                Add
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Recent Orders */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table
                  className="w-full border-collapse"
                  role="table"
                  aria-label="Recent orders table"
                >
                  <thead>
                    <tr className="border-b">
                      <th className="text-left font-semibold py-2">Order ID</th>
                      <th className="text-left font-semibold py-2">Symbol</th>
                      <th className="text-left font-semibold py-2">Type</th>
                      <th className="text-right font-semibold py-2">
                        Quantity
                      </th>
                      <th className="text-right font-semibold py-2">Price</th>
                      <th className="text-left font-semibold py-2">Status</th>
                      <th className="text-right font-semibold py-2">Time</th>
                      <th className="text-right font-semibold py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioData.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="py-3 font-mono">{order.id}</td>
                        <td className="py-3 font-semibold">{order.symbol}</td>
                        <td
                          className={`py-3 ${
                            order.type === "Buy"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {order.type}
                        </td>
                        <td className="py-3 text-right">
                          {formatNumber(order.quantity)}
                        </td>
                        <td className="py-3 text-right">
                          {formatCurrency(order.price)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              order.status === "Filled"
                                ? "bg-green-100 text-green-800"
                                : order.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">{order.time}</td>
                        <td className="py-3 text-right">
                          <button
                            className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                            aria-label={`View details for ${order.id}`}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "charts" && (
          <div className="space-y-6">
            {/* Chart Controls */}
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Market Charts</h3>
                <div className="flex space-x-4">
                  <select
                    value={selectedSymbol}
                    onChange={(e) =>
                      setSelectedSymbol(e.target.value as MarketSymbol)
                    }
                    className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    aria-label="Select symbol for chart"
                  >
                    {(Object.keys(marketDataRef.current) as MarketSymbol[]).map(
                      (symbol) => (
                        <option key={symbol} value={symbol}>
                          {symbol}
                        </option>
                      ),
                    )}
                  </select>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                    Refresh Chart
                  </button>
                </div>
              </div>

              {/* Simple Chart Visualization */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">
                      {selectedSymbol} Price Chart
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Last 24 hours
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(
                        marketDataRef.current[selectedSymbol].price,
                      )}
                    </p>
                    <p
                      className={`text-sm ${getChangeColor(marketDataRef.current[selectedSymbol].change)}`}
                    >
                      {getChangeArrow(
                        marketDataRef.current[selectedSymbol].change,
                      )}{" "}
                      {formatCurrency(
                        Math.abs(marketDataRef.current[selectedSymbol].change),
                      )}{" "}
                      (
                      {Math.abs(
                        marketDataRef.current[selectedSymbol].changePercent,
                      ).toFixed(2)}
                      %)
                    </p>
                  </div>
                </div>

                {/* ASCII-style chart */}
                <div className="space-y-1">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <span className="text-xs text-muted-foreground w-12">
                        {Math.round(
                          marketDataRef.current[selectedSymbol].price - 5 + i,
                        )}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.random() * 80 + 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  Note: This is a simplified chart for accessibility
                  demonstration. In production, use proper accessible charting
                  libraries.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="bg-card rounded-lg p-6 border">
        <h3 className="font-semibold mb-4">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {keyboardShortcuts.shortcuts.map((shortcut, index) => (
            <div key={index} className="p-4 border rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{shortcut.description}</span>
                <span className="px-2 py-1 bg-blue-600 text-white rounded text-sm font-mono">
                  {shortcut.key}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {shortcut.category}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TradingDashboard;
