import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3, 
  Smartphone, 
  Award,
  LineChart,
  Globe,
  CheckCircle2,
  ArrowRight,
  Users,
  Clock,
  Target,
  Briefcase,
  GraduationCap,
  Star,
  Sparkles,
  Play
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { RiskDisclaimer, CompactRiskDisclaimer } from "@/components/landing/RiskDisclaimer";
import { LiveChatIndicator } from "@/components/landing/LiveChatIndicator";
import { PlatformPreview } from "@/components/landing/PlatformPreview";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import heroImage from "@/assets/hero-trading-professional.jpg";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Risk Disclaimer Banner */}
      <RiskDisclaimer />

      {/* Hero Section - Compelling & Benefit-Focused */}
      <section className="relative overflow-hidden bg-primary pt-16 pb-20 md:pt-20 md:pb-24">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Professional trading desk" 
            className="h-full w-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary-glow/90"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Badge className="bg-gold text-gold-foreground hover:bg-gold-hover px-4 py-2 text-sm font-semibold">
                <Sparkles className="mr-2 h-4 w-4" />
                #1 Virtual Trading Platform
              </Badge>
            </div>
            
            {/* Compelling Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in leading-[1.1]">
              Master Global Markets
              <span className="block mt-2 bg-gradient-to-r from-gold via-gold-hover to-accent bg-clip-text text-transparent">
                Without Risking a Penny
              </span>
            </h1>
            
            {/* Specific Value Proposition */}
            <p className="text-lg sm:text-xl md:text-2xl text-primary-foreground/90 mb-6 max-w-3xl mx-auto leading-relaxed">
              Trade 500+ instruments across Forex, Stocks, Indices, Commodities & Crypto 
              with <span className="text-gold font-semibold">$50,000 virtual capital</span> and 
              real-time market data.
            </p>

            {/* Urgency/Limited Offer */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="h-2 w-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-primary-foreground/80 text-sm">
                <span className="font-semibold text-accent">2,847 traders</span> started practicing this week
              </span>
            </div>

            {/* CTA Buttons with Clear Hierarchy */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-gold text-gold-foreground hover:bg-gold-hover px-10 py-7 text-lg font-bold shadow-2xl hover:shadow-gold/25 transition-all duration-300 hover:scale-105 w-full sm:w-auto group"
                >
                  Start Trading Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/60 px-8 py-7 text-lg font-semibold w-full sm:w-auto"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Quick Benefits */}
            <div className="flex flex-wrap justify-center gap-6 text-primary-foreground/80 text-sm mb-12">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                <span>Setup in 2 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                <span>100% risk-free</span>
              </div>
            </div>

            {/* Trust Metrics - Concrete Numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-primary-foreground/90 max-w-4xl mx-auto bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/10">
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-4xl font-bold text-gold mb-1">50K+</div>
                <div className="text-sm text-primary-foreground/70">Active Traders</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-4xl font-bold text-accent mb-1">$2B+</div>
                <div className="text-sm text-primary-foreground/70">Monthly Volume</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-4xl font-bold text-gold mb-1">500+</div>
                <div className="text-sm text-primary-foreground/70">Instruments</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-4xl font-bold text-accent mb-1">4.8★</div>
                <div className="text-sm text-primary-foreground/70">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Stats Section */}
      <section className="py-12 bg-card border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">256-bit SSL</h3>
                <p className="text-sm text-muted-foreground">Bank-level encryption</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gold to-gold-hover flex items-center justify-center flex-shrink-0">
                <Award className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Regulated</h3>
                <p className="text-sm text-muted-foreground">Compliant platform</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">50,000+</h3>
                <p className="text-sm text-muted-foreground">Active traders</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-gold flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">Always available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Services Showcase - Specific Descriptions */}
      <section id="services" className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
              Professional Trading Tools
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to
              <span className="block mt-2 bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
                Trade Like a Pro
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              The same institutional-grade tools used by professional traders, now available for free
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: LineChart,
                title: "TradingView Integration",
                description: "Access 100+ technical indicators, 50+ drawing tools, and multi-timeframe analysis with the world's most popular charting platform",
                gradient: "from-primary to-primary-glow"
              },
              {
                icon: Zap,
                title: "One-Click Execution",
                description: "Execute market orders in under 50ms with preset volumes. Perfect for scalping strategies and fast-moving markets",
                gradient: "from-gold to-gold-hover"
              },
              {
                icon: BarChart3,
                title: "Real-Time Portfolio Analytics",
                description: "Live P&L tracking, margin utilization monitoring, position heat maps, and performance metrics updated every second",
                gradient: "from-accent to-accent/80"
              },
              {
                icon: Shield,
                title: "Advanced Risk Management",
                description: "Automated stop-loss, take-profit, trailing stops with customizable triggers. Never lose more than you plan",
                gradient: "from-primary to-primary-glow"
              },
              {
                icon: Smartphone,
                title: "Trade Anywhere",
                description: "Fully responsive platform optimized for desktop, tablet, and mobile. Your portfolio syncs across all devices instantly",
                gradient: "from-gold to-gold-hover"
              },
              {
                icon: Briefcase,
                title: "Order Templates",
                description: "Save your favorite trading setups with preset SL/TP levels. Execute complex strategies with a single click",
                gradient: "from-accent to-accent/80"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border bg-card">
                <CardContent className="p-8">
                  <div className={`h-16 w-16 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Preview Section */}
      <PlatformPreview />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20">
              Getting Started
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Start Trading in
              <span className="block mt-2 bg-gradient-to-r from-accent to-gold bg-clip-text text-transparent">
                Under 3 Minutes
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              No complicated forms. No waiting. Just fast, simple setup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "01",
                icon: Users,
                title: "Create Account",
                description: "Sign up with your email in 30 seconds. No credit card, no commitments.",
                time: "30 sec",
                color: "text-primary"
              },
              {
                step: "02",
                icon: Shield,
                title: "Quick Verification",
                description: "Complete simple KYC verification. Get instant approval and $50,000 virtual capital.",
                time: "2 min",
                color: "text-gold"
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Start Trading",
                description: "Access 500+ instruments immediately. Practice with real market conditions, zero risk.",
                time: "Instant",
                color: "text-accent"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-border bg-card">
                  <CardContent className="p-8 text-center">
                    <div className={`text-6xl font-bold ${step.color} mb-4 opacity-20`}>{step.step}</div>
                    <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-gold flex items-center justify-center mx-auto mb-6">
                      <step.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <Badge className="mb-4 bg-muted text-muted-foreground">{step.time}</Badge>
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-gold" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/register">
              <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold-hover px-10 py-6 text-lg font-bold">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Asset Classes Section */}
      <section id="markets" className="py-20 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gold/10 text-gold hover:bg-gold/20 border border-gold/20">
              Global Markets
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Trade Across
              <span className="block mt-2 bg-gradient-to-r from-gold to-accent bg-clip-text text-transparent">
                5 Major Asset Classes
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Diversify your practice portfolio across global markets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                title: "Forex",
                icon: Globe,
                instruments: "50+ Pairs",
                spread: "From 0.1 pips",
                examples: "EUR/USD, GBP/JPY",
                gradient: "from-primary to-primary-glow"
              },
              {
                title: "Stocks",
                icon: TrendingUp,
                instruments: "200+ Stocks",
                spread: "From $0.01",
                examples: "AAPL, TSLA, AMZN",
                gradient: "from-gold to-gold-hover"
              },
              {
                title: "Indices",
                icon: BarChart3,
                instruments: "20+ Indices",
                spread: "From 0.4 pts",
                examples: "S&P500, NASDAQ",
                gradient: "from-accent to-accent/80"
              },
              {
                title: "Commodities",
                icon: LineChart,
                instruments: "30+ Assets",
                spread: "From 0.03",
                examples: "Gold, Oil, Silver",
                gradient: "from-primary to-gold"
              },
              {
                title: "Crypto",
                icon: Zap,
                instruments: "50+ Coins",
                spread: "From 0.1%",
                examples: "BTC, ETH, SOL",
                gradient: "from-gold to-accent"
              }
            ].map((asset, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border bg-card">
                <CardContent className="p-6 text-center">
                  <div className={`h-14 w-14 rounded-lg bg-gradient-to-br ${asset.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <asset.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{asset.title}</h3>
                  <div className="text-sm font-semibold text-gold mb-1">{asset.instruments}</div>
                  <div className="text-xs text-accent mb-2">{asset.spread}</div>
                  <p className="text-xs text-muted-foreground">{asset.examples}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <ComparisonTable />

      {/* Why Choose Us Section */}
      <section className="py-20 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-gold text-gold-foreground hover:bg-gold-hover">
                Why TradeX Pro
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                The Smart Choice for
                <span className="block mt-2 text-gold">Aspiring Traders</span>
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
                Join 50,000+ traders who've chosen TradeX Pro as their trusted platform 
                for mastering CFD trading without financial risk.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: GraduationCap,
                    title: "Learn Without Risk",
                    description: "Practice with $50,000 virtual capital. Make mistakes, learn lessons, without losing real money"
                  },
                  {
                    icon: Clock,
                    title: "Real Market Conditions",
                    description: "Trade with live prices from major exchanges. Experience actual market volatility and spreads"
                  },
                  {
                    icon: Target,
                    title: "Professional Tools",
                    description: "Access the same TradingView charts, risk management, and analytics used by hedge funds"
                  },
                  {
                    icon: Star,
                    title: "Completely Free Forever",
                    description: "No subscriptions, no hidden fees, no ads. 100% free professional trading education"
                  }
                ].map((benefit, index) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-gold flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                      <p className="text-primary-foreground/80 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-background/95 backdrop-blur-sm border-gold/20">
              <CardContent className="p-10">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">What You Get</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <span className="text-muted-foreground">Starting Capital</span>
                    <span className="text-2xl font-bold text-gold">$50,000</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <span className="text-muted-foreground">Trading Instruments</span>
                    <span className="text-2xl font-bold text-accent">500+</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <span className="text-muted-foreground">Technical Indicators</span>
                    <span className="text-2xl font-bold text-primary">100+</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <span className="text-muted-foreground">Setup Time</span>
                    <span className="text-2xl font-bold text-gold">2 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Monthly Cost</span>
                    <span className="text-2xl font-bold text-accent">$0</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Link to="/register" className="block">
                    <Button size="lg" className="w-full bg-gradient-to-r from-gold to-gold-hover text-primary hover:opacity-90 py-6 text-lg font-bold shadow-xl">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    No credit card required • Instant access
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-primary via-primary-glow to-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gold text-gold-foreground">
              Limited Time: Extra $10,000 Virtual Bonus
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Start Your
              <span className="block mt-2 text-gold">Trading Journey?</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-primary-foreground/90 mb-10 leading-relaxed">
              Join 50,000+ traders mastering CFD trading with zero risk. 
              Get $50,000 + $10,000 bonus virtual capital when you sign up today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/register">
                <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold-hover px-10 py-7 text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-300 w-full sm:w-auto group">
                  Claim Your $60,000 Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-primary-foreground/80 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gold" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gold" />
                <span>Setup in 2 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gold" />
                <span>Start trading immediately</span>
              </div>
            </div>

            <div className="mt-8">
              <CompactRiskDisclaimer />
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
      
      {/* Live Chat Indicator */}
      <LiveChatIndicator />
    </div>
  );
}
