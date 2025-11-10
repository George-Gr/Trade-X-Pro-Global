import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3, 
  Smartphone, 
  Lock,
  Award,
  LineChart,
  Globe,
  CheckCircle2,
  ArrowRight,
  Users
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import heroImage from "@/assets/hero-trading.jpg";
import securityBg from "@/assets/security-bg.jpg";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                TradeX Pro
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#advantages" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Advantages
              </a>
              <a href="#security" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Security
              </a>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-gradient-to-r from-primary to-primary-glow">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary-glow/90 backdrop-blur-sm" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
              Master CFD Trading
              <span className="block mt-2 bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent">
                Without the Risk
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Practice trading across 5 asset classes with $50,000 in virtual funds. 
              Professional trading terminal with real-time data and zero risk.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
                  Start Trading Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                  View Platform
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <span>$50,000 Virtual Capital</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <span>Real-Time Market Data</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <span>5 Asset Classes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to
              <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Become a Better Trader
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional-grade tools and features designed for serious traders
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: LineChart,
                title: "Advanced Charting",
                description: "TradingView integration with technical indicators, drawing tools, and multi-timeframe analysis"
              },
              {
                icon: Zap,
                title: "One-Click Trading",
                description: "Execute trades instantly with predefined volumes for faster order placement"
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                description: "Live portfolio tracking with P&L calculations, margin monitoring, and performance metrics"
              },
              {
                icon: Shield,
                title: "Risk Management",
                description: "Automated stop-loss, take-profit, trailing stops, and margin call protection"
              },
              {
                icon: Smartphone,
                title: "Responsive Design",
                description: "Trade seamlessly across desktop, tablet, and mobile devices with optimized layouts"
              },
              {
                icon: Award,
                title: "Order Templates",
                description: "Save and reuse your favorite trading setups for consistent execution"
              }
            ].map((feature, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-all hover:-translate-y-1 bg-card backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trading Advantages */}
      <section id="advantages" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose
              <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                TradeX Pro?
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                {
                  icon: Globe,
                  title: "5 Asset Classes",
                  description: "Trade Forex, Stocks, Indices, Commodities, and Cryptocurrencies all in one platform"
                },
                {
                  icon: Users,
                  title: "Risk-Free Learning",
                  description: "Master trading strategies with virtual capital before risking real money"
                },
                {
                  icon: TrendingUp,
                  title: "Real Market Conditions",
                  description: "Experience actual market movements with real-time data feeds"
                },
                {
                  icon: Lock,
                  title: "No Hidden Costs",
                  description: "Completely free platform with no subscriptions or trading fees"
                }
              ].map((advantage, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                      <advantage.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{advantage.title}</h3>
                    <p className="text-muted-foreground">{advantage.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Card className="p-8 bg-gradient-to-br from-card to-muted border-border">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <span className="text-muted-foreground">Starting Balance</span>
                  <span className="text-2xl font-bold text-primary">$50,000</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <span className="text-muted-foreground">Available Assets</span>
                  <span className="text-2xl font-bold text-accent">500+</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <span className="text-muted-foreground">Order Types</span>
                  <span className="text-2xl font-bold">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Setup Time</span>
                  <span className="text-2xl font-bold text-accent">2 min</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section 
        id="security" 
        className="py-20 relative overflow-hidden"
        style={{
          backgroundImage: `url(${securityBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-foreground/95 backdrop-blur-sm" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4 text-background">
              Your Security is Our
              <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Top Priority
              </span>
            </h2>
            <p className="text-xl text-background/80 mb-12">
              Enterprise-grade security protecting your data and trading activity
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Lock,
                  title: "Encrypted Data",
                  description: "Bank-level encryption for all sensitive information"
                },
                {
                  icon: Shield,
                  title: "Secure Authentication",
                  description: "Multi-factor authentication and session management"
                },
                {
                  icon: Award,
                  title: "Educational Purpose",
                  description: "Safe environment for learning without financial risk"
                }
              ].map((item, index) => (
                <Card key={index} className="bg-background/10 backdrop-blur-md border-background/20">
                  <CardContent className="p-6 text-center">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-background">{item.title}</h3>
                    <p className="text-background/70">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-glow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Start Your Trading Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of traders mastering CFD trading with zero risk. 
              Get $50,000 in virtual capital instantly upon KYC verification.
            </p>
            
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <p className="text-white/70 mt-6 text-sm">
              No credit card required • Setup in 2 minutes • Start trading immediately
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                TradeX Pro
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              © 2024 TradeX Pro. All rights reserved.
            </p>

            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground text-center max-w-4xl mx-auto">
              <strong>Risk Disclaimer:</strong> TradeX Pro is a paper trading platform for educational purposes only. 
              All trading is simulated with virtual funds. Past performance does not guarantee future results. 
              CFD trading involves significant risk of loss. Please ensure you fully understand the risks before trading with real capital.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
