import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  BarChart3,
  AlertCircle,
  Calculator,
  Bell,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function TradingTools() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Advanced Trading Tools
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Maximize Your Trading Potential
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Powerful analysis, signals, and calculators to enhance your
                trading strategy
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[
              {
                icon: BarChart3,
                title: "Technical Analysis",
                description: "Comprehensive charting with 100+ indicators",
                features: [
                  "TradingView advanced charts",
                  "100+ technical indicators",
                  "Multi-timeframe analysis",
                  "Drawing tools and patterns",
                  "Custom chart templates",
                  "Historical data access",
                ],
              },
              {
                icon: TrendingUp,
                title: "Trading Signals",
                description: "AI-powered trading signals from expert analysts",
                features: [
                  "Real-time market signals",
                  "Professional recommendations",
                  "Signal strength indicators",
                  "Entry/Exit points",
                  "Risk level indicators",
                  "Performance tracking",
                ],
              },
              {
                icon: Calculator,
                title: "Trading Calculators",
                description: "Essential calculators for position sizing",
                features: [
                  "Pip value calculator",
                  "Position size calculator",
                  "Margin calculator",
                  "Profit/Loss calculator",
                  "Leverage calculator",
                  "Swap calculator",
                ],
              },
              {
                icon: Bell,
                title: "Price Alerts",
                description: "Customizable alerts for trading opportunities",
                features: [
                  "Price level alerts",
                  "Technical indicator alerts",
                  "News event alerts",
                  "Email notifications",
                  "SMS notifications",
                  "Push notifications",
                ],
              },
              {
                icon: AlertCircle,
                title: "Risk Management",
                description: "Tools to protect and manage your capital",
                features: [
                  "Stop-loss automation",
                  "Take-profit orders",
                  "Trailing stops",
                  "Breakeven stops",
                  "Risk/reward calculators",
                  "Margin alerts",
                ],
              },
              {
                icon: Zap,
                title: "One-Click Trading",
                description: "Fast execution with predefined order templates",
                features: [
                  "Preset order sizes",
                  "Quick entry/exit",
                  "Order templates",
                  "Hot keys support",
                  "Instant execution",
                  "Order history",
                ],
              },
            ].map((tool, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-150 hover:-translate-y-1"
              >
                <CardContent>
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                    <tool.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{tool.title}</h3>
                  <p className="text-muted-foreground mb-6">
                    {tool.description}
                  </p>

                  <ul className="space-y-2">
                    {tool.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-2.5" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tools Details Section */}
          <div className="space-y-6 mb-8">
            {/* Technical Analysis */}
            <Card>
              <CardContent>
                <h2 className="text-3xl font-bold mb-6">
                  Technical Analysis Tools
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Available Indicators
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        "Moving Averages",
                        "RSI",
                        "MACD",
                        "Bollinger Bands",
                        "Stochastic",
                        "ATR",
                        "CCI",
                        "ADX",
                        "Ichimoku",
                        "Fibonacci",
                        "Pivot Points",
                        "Volume Profile",
                      ].map((indicator, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 bg-muted/50 rounded"
                        >
                          <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                          <span className="text-sm">{indicator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Chart Timeframes
                    </h3>
                    <div className="space-y-4">
                      {[
                        { tf: "1M, 5M, 15M, 30M", type: "Scalping" },
                        { tf: "1H, 4H", type: "Day Trading" },
                        { tf: "1D, 1W, 1M", type: "Swing Trading" },
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-muted/50 rounded">
                          <p className="text-sm font-semibold">{item.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.tf}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trading Signals */}
            <Card>
              <CardContent>
                <h2 className="text-3xl font-bold mb-6">
                  AI-Powered Trading Signals
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      level: "Strong Buy",
                      strength: "90-100",
                      description:
                        "Highly confident buy signal from multiple indicators",
                    },
                    {
                      level: "Buy",
                      strength: "70-89",
                      description: "Good buy signal with positive indicators",
                    },
                    {
                      level: "Neutral",
                      strength: "40-69",
                      description: "Mixed signals, wait for confirmation",
                    },
                    {
                      level: "Sell",
                      strength: "11-39",
                      description: "Good sell signal with negative indicators",
                    },
                    {
                      level: "Strong Sell",
                      strength: "0-10",
                      description:
                        "Highly confident sell signal from multiple indicators",
                    },
                  ].map((signal, i) => (
                    <Card key={i} className="bg-muted/50 border-border">
                      <CardContent>
                        <p className="font-semibold text-lg mb-2">
                          {signal.level}
                        </p>
                        <p className="text-sm text-primary font-bold mb-2">
                          Strength: {signal.strength}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {signal.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calculators */}
            <Card>
              <CardContent>
                <h2 className="text-3xl font-bold mb-6">
                  Essential Calculators
                </h2>
                <p className="text-muted-foreground mb-6">
                  All our calculators are integrated into the trading platform
                  and are accessible with one click.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Position Size Calculator
                    </h3>
                    <div className="space-y-4 p-4 bg-muted/50 rounded">
                      <div className="flex justify-between text-sm">
                        <span>Account Balance</span>
                        <span>$10,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Risk per Trade</span>
                        <span>2%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Stop Loss Pips</span>
                        <span>50</span>
                      </div>
                      <div className="border-t border-border pt-4 flex justify-between font-semibold">
                        <span>Position Size</span>
                        <span className="text-primary hover:text-primary/80 transition-colors duration-150 cursor-pointer">
                          40 lots
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Pip Value Calculator
                    </h3>
                    <div className="space-y-4 p-4 bg-muted/50 rounded">
                      <div className="flex justify-between text-sm">
                        <span>Currency Pair</span>
                        <span>EUR/USD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Lot Size</span>
                        <span>1 Standard</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Account Currency</span>
                        <span>USD</span>
                      </div>
                      <div className="border-t border-border pt-4 flex justify-between font-semibold">
                        <span>Pip Value</span>
                        <span className="text-primary hover:text-primary/80 transition-colors duration-150 cursor-pointer">
                          $10
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">
                  Supercharge Your Trading
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Access all these powerful tools immediately upon account
                  opening
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/register">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-primary to-primary-glow transition-all hover:from-primary/90 hover:to-primary-glow/90 active:from-primary/80 active:to-primary-glow/80 active:scale-95"
                    >
                      Open Account
                    </Button>
                  </Link>
                  <Link to="/education/tutorials">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
