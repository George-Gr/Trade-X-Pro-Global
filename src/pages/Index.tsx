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
  Lock,
  Award,
  LineChart,
  Globe,
  CheckCircle2,
  ArrowRight,
  Users,
  Clock,
  Target,
  TrendingDown,
  Briefcase,
  GraduationCap,
  Star
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import heroImage from "@/assets/hero-trading-professional.jpg";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section - Professional & Trust-Building */}
      <section className="relative overflow-hidden bg-primary py-20 md:py-28">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Professional trading desk" 
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/90"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gold text-gold-foreground hover:bg-gold-hover px-4 py-2 text-sm font-semibold">
              <Award className="mr-2 h-4 w-4" />
              Trusted by 50,000+ Traders Worldwide
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in leading-tight typography-h1">
              Trade with Confidence
              <span className="block mt-2 bg-gradient-to-r from-gold to-accent bg-clip-text text-transparent">
                Master CFD Trading Risk-Free
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Professional trading platform with $50,000 virtual capital. 
              Practice across 5 asset classes with real-time market data and zero risk.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/register">
                <Button size="xl" className="bg-gold text-gold-foreground hover:bg-gold-hover px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  Start Trading Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="xl" variant="outline" className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 px-10 py-6 text-lg font-semibold">
                  View Platform Demo
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-primary-foreground/90 max-w-4xl mx-auto">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-gold mb-1">$50,000</div>
                <div className="text-sm">Virtual Capital</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-accent mb-1">500+</div>
                <div className="text-sm">Trading Instruments</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-gold mb-1">5</div>
                <div className="text-sm">Asset Classes</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-accent mb-1">24/7</div>
                <div className="text-sm">Market Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Stats Section */}
      <section className="py-16 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h3 className="typography-h4 mb-1">Bank-Level Security</h3>
                <p className="text-muted-foreground">SSL encryption & secure authentication protect your data</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gold to-gold-hover flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h3 className="typography-h4 mb-1">Regulated Platform</h3>
                <p className="text-muted-foreground">Compliant with international trading standards</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
              <div>
                <h3 className="typography-h4 mb-1">50,000+ Active Traders</h3>
                <p className="text-muted-foreground">Join a thriving community of successful traders</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Services Showcase */}
      <section id="services" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
              Our Services
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 typography-h2">
              Everything You Need to
              <span className="block mt-2 bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
                Succeed in Trading
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional-grade tools and features designed for serious traders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: LineChart,
                title: "Advanced Charting",
                description: "TradingView integration with 100+ technical indicators, drawing tools, and multi-timeframe analysis",
                gradient: "from-primary to-primary-glow"
              },
              {
                icon: Zap,
                title: "One-Click Trading",
                description: "Execute trades instantly with predefined volumes for faster order placement and risk management",
                gradient: "from-gold to-gold-hover"
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                description: "Live portfolio tracking with P&L calculations, margin monitoring, and performance metrics",
                gradient: "from-accent to-accent/80"
              },
              {
                icon: Shield,
                title: "Risk Management",
                description: "Automated stop-loss, take-profit, trailing stops, and comprehensive margin call protection",
                gradient: "from-primary to-primary-glow"
              },
              {
                icon: Smartphone,
                title: "Mobile Trading",
                description: "Trade seamlessly across desktop, tablet, and mobile devices with optimized responsive layouts",
                gradient: "from-gold to-gold-hover"
              },
              {
                icon: Briefcase,
                title: "Order Templates",
                description: "Save and reuse your favorite trading setups for consistent execution and strategy management",
                gradient: "from-accent to-accent/80"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border bg-card">
                <CardContent className="p-8">
                  <div className={`h-16 w-16 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="typography-h3 mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20">
              Getting Started
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Start Trading in
              <span className="block mt-2 bg-gradient-to-r from-accent to-gold bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started with professional CFD trading in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "01",
                icon: Users,
                title: "Create Account",
                description: "Sign up in 2 minutes with your email. No credit card required, completely free to start.",
                color: "text-primary"
              },
              {
                step: "02",
                icon: Shield,
                title: "Verify KYC",
                description: "Complete quick identity verification for security. Get instant approval and $50,000 virtual capital.",
                color: "text-gold"
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Start Trading",
                description: "Access 500+ instruments across 5 asset classes. Trade with real-time data and zero risk.",
                color: "text-accent"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-border bg-card">
                  <CardContent className="p-8 text-center">
                    <div className={`text-6xl font-bold ${step.color} mb-6 opacity-20`}>{step.step}</div>
                    <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-gold flex items-center justify-center mx-auto mb-6">
                      <step.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
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
        </div>
      </section>

      {/* Asset Classes Section */}
      <section id="markets" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gold/10 text-gold hover:bg-gold/20 border border-gold/20">
              Global Markets
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Trade Across
              <span className="block mt-2 bg-gradient-to-r from-gold to-accent bg-clip-text text-transparent">
                5 Major Asset Classes
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access 500+ instruments across global markets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                title: "Forex",
                icon: Globe,
                instruments: "50+ Currency Pairs",
                description: "Major, minor & exotic pairs with tight spreads",
                gradient: "from-primary to-primary-glow"
              },
              {
                title: "Stocks",
                icon: TrendingUp,
                instruments: "200+ Global Stocks",
                description: "Blue-chip companies from major exchanges",
                gradient: "from-gold to-gold-hover"
              },
              {
                title: "Indices",
                icon: BarChart3,
                instruments: "20+ Market Indices",
                description: "Trade major stock market indices worldwide",
                gradient: "from-accent to-accent/80"
              },
              {
                title: "Commodities",
                icon: LineChart,
                instruments: "30+ Commodities",
                description: "Precious metals, energy & agriculture",
                gradient: "from-primary to-gold"
              },
              {
                title: "Crypto",
                icon: Zap,
                instruments: "50+ Cryptocurrencies",
                description: "Major cryptocurrencies and DeFi tokens",
                gradient: "from-gold to-accent"
              }
            ].map((asset, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border bg-card">
                <CardContent className="p-6 text-center">
                  <div className={`h-16 w-16 rounded-lg bg-gradient-to-br ${asset.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <asset.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{asset.title}</h3>
                  <div className="text-sm font-semibold text-gold mb-3">{asset.instruments}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{asset.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-gold text-gold-foreground hover:bg-gold-hover">
                Why TradeX Pro
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                The Smart Choice for
                <span className="block mt-2 text-gold">Aspiring Traders</span>
              </h2>
              <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
                Join thousands of traders who've chosen TradeX Pro as their trusted platform for risk-free CFD trading education and practice.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: GraduationCap,
                    title: "Learn Without Risk",
                    description: "Master trading strategies with virtual capital before risking real money"
                  },
                  {
                    icon: Clock,
                    title: "24/7 Market Access",
                    description: "Trade global markets around the clock with real-time data feeds"
                  },
                  {
                    icon: Target,
                    title: "Professional Tools",
                    description: "Access the same advanced tools used by professional traders"
                  },
                  {
                    icon: Star,
                    title: "No Hidden Costs",
                    description: "Completely free platform with no subscriptions or trading fees"
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
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                      <span className="text-muted-foreground text-lg">Starting Balance</span>
                      <span className="text-3xl font-bold text-gold">$50,000</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                      <span className="text-muted-foreground text-lg">Trading Instruments</span>
                      <span className="text-3xl font-bold text-accent">500+</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                      <span className="text-muted-foreground text-lg">Setup Time</span>
                      <span className="text-3xl font-bold text-primary">2 min</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-lg">Monthly Cost</span>
                      <span className="text-3xl font-bold text-accent">$0</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <Link to="/register" className="block">
                    <Button size="lg" className="w-full bg-gradient-to-r from-gold to-gold-hover text-primary hover:opacity-90 py-6 text-lg font-semibold shadow-xl">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary-glow to-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Start Your
              <span className="block mt-2 text-gold">Trading Journey?</span>
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-10 leading-relaxed">
              Join 50,000+ traders mastering CFD trading with zero risk. 
              Get $50,000 in virtual capital instantly upon KYC verification.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/register">
                <Button size="xl" className="bg-gold text-gold-foreground hover:bg-gold-hover px-12 py-7 text-xl font-bold shadow-2xl hover:scale-105 transition-all duration-300">
                  Create Free Account
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link to="/company/contact">
                <Button size="xl" variant="outline" className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 px-12 py-7 text-xl font-bold">
                  Contact Sales
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
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
