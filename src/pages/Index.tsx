import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Sparkles, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TradeX Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
            <span className="text-primary text-sm font-medium">Risk-Free Paper Trading</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Master CFD Trading
            <br />
            <span className="text-primary">Without Risk</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Practice trading forex, stocks, indices, commodities, and crypto on a professional platform with virtual funds. Zero risk, real market experience.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Start Trading Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/trade">
              <Button size="lg" variant="outline">
                View Platform
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            No credit card required • Instant setup • $50,000 virtual capital
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-3 hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">5 Asset Classes</h3>
            <p className="text-sm text-muted-foreground">
              Trade forex, stocks, indices, commodities, and cryptocurrencies from one platform.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3 hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Risk-Free Trading</h3>
            <p className="text-sm text-muted-foreground">
              Practice with virtual funds. No real money at risk. Perfect for learning and strategy testing.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3 hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Real-Time Data</h3>
            <p className="text-sm text-muted-foreground">
              Live market prices and charts. Experience realistic trading conditions and execution.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3 hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Pro Terminal</h3>
            <p className="text-sm text-muted-foreground">
              IC Markets-inspired interface with advanced order types, leverage, and portfolio tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Trading Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Professional Trading Tools</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to trade like a professional
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold">Advanced Orders</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Market & Limit Orders</li>
              <li>• Stop Loss & Take Profit</li>
              <li>• Trailing Stops</li>
              <li>• Multiple Timeframes</li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold">Risk Management</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Flexible Leverage (1:30-1:500)</li>
              <li>• Margin Calculator</li>
              <li>• Real-Time P&L</li>
              <li>• Position Sizing</li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold">Market Analysis</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• TradingView Charts</li>
              <li>• Technical Indicators</li>
              <li>• Real-Time Quotes</li>
              <li>• Market Watch</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-12 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Trading?</h2>
          <p className="text-lg text-muted-foreground">
            Join hundreds of traders practicing on our platform. Complete KYC verification and receive $50,000 in virtual capital to start.
          </p>
          <Link to="/register">
            <Button size="lg" className="gap-2">
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-semibold">TradeX Pro</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2025 TradeX Pro. Simulated trading platform for educational purposes only.
            </p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> This is a paper trading simulation. No real funds are involved. Not affiliated with IC Markets or any financial institution.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
