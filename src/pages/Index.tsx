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
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { AutoBreadcrumb } from "@/components/ui/breadcrumb";
import { HeroTradingSection, GlobalMarketsSection, SecuritySection } from "@/components/common/OptimizedHeroSection";
import { SectionHeader } from "@/components/common";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-6 py-4">
        <AutoBreadcrumb />
      </div>

      {/* Hero Section */}
      <HeroTradingSection aria-label="Hero section with professional trading platform background showing financial charts and market data">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in">
            Master CFD Trading
            <span className="block mt-2 bg-gradient-to-r from-background to-primary-glow bg-clip-text text-transparent">
              Without the Risk
            </span>
          </h1>
          
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Practice trading across 5 asset classes with $50,000 in virtual funds. 
            Professional trading terminal with real-time data and zero risk.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/register">
              <Button size="lg" className="px-8 py-6 focus-visible:ring-2 focus-visible:ring-offset-2 bg-background text-primary text-lg hover:bg-background/90 focus-visible:ring-offset-primary" aria-label="Start trading free - Sign up now">
                Start Trading Free
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="px-8 py-6 focus-visible:ring-2 focus-visible:ring-offset-2 border-primary-foreground text-primary-foreground text-lg hover:bg-primary-foreground/10 focus-visible:ring-primary-foreground" aria-label="View platform demo">
                View Platform
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-primary-foreground/90">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <span>$50,000 Virtual Capital</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <span>Real-Time Market Data</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <span>5 Asset Classes</span>
            </div>
          </div>
        </div>
      </HeroTradingSection>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Everything You Need to"
              subtitle="Become a Better Trader"
              description="Professional-grade tools and features designed for serious traders"
            />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <Card key={index} className="border-border hover:shadow-lg transition-all duration-150 hover:-translate-y-1 bg-card backdrop-blur-sm focus-within:ring-2 focus-within:ring-primary">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
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
            <SectionHeader
              title="Why Choose"
              subtitle="TradeX Pro?"
            />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 items-center">
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
                <div key={index} className="flex gap-4 group">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center group-focus-within:ring-2 group-focus-within:ring-primary transition-all duration-150">
                      <advantage.icon className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{advantage.title}</h3>
                    <p className="text-muted-foreground">{advantage.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Card className="p-6 bg-gradient-to-br from-card to-muted border-border">
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

      {/* Global Markets Section */}
      <GlobalMarketsSection aria-label="Global markets section with world map background showing international trading access">
        <SectionHeader
          title="Trade Global Markets"
          subtitle="Across 5 Asset Classes"
          description="Access 500+ instruments across forex, stocks, indices, commodities, and cryptocurrencies"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              {
                title: "Forex",
                description: "Major, minor & exotic currency pairs",
                instruments: "50+ Pairs",
                icon: Globe
              },
              {
                title: "Stocks",
                description: "Global equities from major exchanges",
                instruments: "200+ Stocks",
                icon: TrendingUp
              },
              {
                title: "Indices",
                description: "Major stock market indices worldwide",
                instruments: "20+ Indices",
                icon: BarChart3
              },
              {
                title: "Commodities",
                description: "Precious metals, energy & agriculture",
                instruments: "30+ Commodities",
                icon: LineChart
              },
              {
                title: "Crypto",
                description: "Major cryptocurrencies & tokens",
                instruments: "50+ Cryptos",
                icon: Zap
              }
            ].map((asset, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-all duration-150 hover:-translate-y-1 bg-card/80 backdrop-blur-sm focus-within:ring-2 focus-within:ring-primary">
                <CardContent className="p-6 text-center">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
                    <asset.icon className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{asset.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{asset.description}</p>
                  <div className="text-sm font-semibold text-primary">{asset.instruments}</div>
                </CardContent>
              </Card>
            ))}
          </div>
      </GlobalMarketsSection>

      {/* Trust & Security Section */}
      <SecuritySection aria-label="Security and trust section with encrypted data background showing platform security features">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Your Security is Our"
              subtitle="Top Priority"
              description="Enterprise-grade security protecting your data and trading activity"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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
                <Card key={index} className="bg-background/10 backdrop-blur-md border-foreground/10 hover:shadow-lg transition-all duration-150 hover:-translate-y-1\">
                  <CardContent className="p-6 text-center">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-8 w-8 text-primary-foreground" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-primary-foreground">{item.title}</h3>
                    <p className="text-primary-foreground/80">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </SecuritySection>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-glow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Start Your Trading Journey?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Join thousands of traders mastering CFD trading with zero risk. 
              Get $50,000 in virtual capital instantly upon KYC verification.
            </p>
            
            <Link to="/register">
              <Button size="lg" className="px-8 py-6 focus-visible:ring-2 focus-visible:ring-offset-2 bg-background text-primary text-lg hover:bg-background/90 focus-visible:ring-offset-primary" aria-label="Create free account now">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>

            <p className="text-primary-foreground/70 mt-6 text-sm">
              No credit card required • Setup in 2 minutes • Start trading immediately
            </p>
          </div>
        </div>
      </section>

      {/* Our Partners Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Our"
              subtitle="Partners"
              description="Trusted integrations powering your trading experience"
            />

          <div className="max-w-6xl mx-auto">
            {/* Payment Partners */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-center mb-6 text-muted-foreground">Payment Methods</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                {[
                    { name: "Visa", icon: "💳", color: "from-blue-600 to-blue-700" },
                    { name: "Mastercard", icon: "💳", color: "from-orange-600 to-red-600" },
                    { name: "Google Pay", icon: "📱", color: "from-blue-500 to-green-500" },
                    { name: "PhonePe", icon: "📱", color: "from-purple-600 to-purple-700" },
                    { name: "UPI", icon: "💸", color: "from-blue-600 to-teal-600" },
                    { name: "NowPayments", icon: "🔐", color: "from-indigo-600 to-purple-600" }
                ].map((partner, index) => (
                    <Card key={index} className="border-border hover:shadow-md transition-all duration-150 hover:-translate-y-1 bg-card focus-within:ring-2 focus-within:ring-primary">
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[120px]">
                        <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${partner.color} flex items-center justify-center text-2xl mb-2 text-primary-foreground`}>
                          <span role="img" aria-label={partner.name}>{partner.icon}</span>
                        </div>
                      <p className="text-sm font-semibold text-center">{partner.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Crypto Partners */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-center mb-6 text-muted-foreground">Cryptocurrency</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto">
                {[
                    { name: "Bitcoin", icon: "₿", color: "from-orange-500 to-orange-600", description: "BTC" },
                    { name: "Ethereum", icon: "Ξ", color: "from-blue-500 to-purple-600", description: "ETH" },
                    { name: "Tether", icon: "₮", color: "from-green-500 to-green-600", description: "USDT" }
                ].map((partner, index) => (
                    <Card key={index} className="border-border hover:shadow-md transition-all duration-150 hover:-translate-y-1 bg-card focus-within:ring-2 focus-within:ring-primary">
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[120px]">
                        <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${partner.color} flex items-center justify-center text-2xl font-bold text-primary-foreground mb-2`}>
                          <span role="img" aria-label={partner.name}>{partner.icon}</span>
                      </div>
                      <p className="text-sm font-semibold text-center">{partner.name}</p>
                        <p className="text-xs text-muted-foreground">{partner.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Trading Platforms */}
            <div>
              <h3 className="text-lg font-semibold text-center mb-6 text-muted-foreground">Trading Platforms</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
                {[
                    { name: "TradingView", icon: LineChart, description: "Advanced charting & analysis", color: "from-indigo-600 to-indigo-700" },
                    { name: "MetaTrader", icon: BarChart3, description: "Professional trading platform", color: "from-slate-700 to-slate-800" }
                ].map((partner, index) => (
                    <Card key={index} className="border-border hover:shadow-md transition-all duration-150 hover:-translate-y-1 bg-card focus-within:ring-2 focus-within:ring-primary">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className={`h-14 w-14 rounded-lg bg-gradient-to-br ${partner.color} flex items-center justify-center flex-shrink-0`}>
                          <partner.icon className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{partner.name}</p>
                        <p className="text-sm text-muted-foreground">{partner.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reusable footer component (single source of truth) */}
      <PublicFooter />
    </div>
  );
}
