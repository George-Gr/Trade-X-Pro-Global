import heroImage from "@/assets/hero-trading-professional.webp";
import ComparisonSection from "@/components/landing/ComparisonSection";
import EducationalSection from "@/components/landing/EducationalSection";
import FAQSection from "@/components/landing/FAQSection";
import ProfitCalculator from "@/components/landing/ProfitCalculator";
import SecuritySection from "@/components/landing/SecuritySection";
import StatsBanner from "@/components/landing/StatsBanner";
import TeamSection from "@/components/landing/TeamSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import TrustBadgesSection from "@/components/landing/TrustBadgesSection";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import RegulatorySection from "@/components/legal/RegulatorySection";
import RiskDisclosure from "@/components/legal/RiskDisclosure";
import { ParallaxAuroraLayout } from "@/components/ParallaxAuroraLayout";
import Seo from "@/components/seo/Seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Award,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock,
  Globe,
  GraduationCap,
  LineChart,
  Shield,
  Smartphone,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://tradexprocinemx.com/#organization",
        "name": "TradeX Pro Global",
        "url": "https://tradexprocinemx.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://tradexprocinemx.com/logo.png"
        },
        "sameAs": [
          "https://twitter.com/TradeXProApp"
        ]
      },
      {
        "@type": "FinancialService",
        "@id": "https://tradexprocinemx.com/#service",
        "name": "TradeX Pro CFD Trading Platform",
        "description": "Professional multi-asset CFD trading platform with virtual capital for risk-free practice trading across forex, stocks, indices, commodities, and cryptocurrencies.",
        "provider": {
          "@id": "https://tradexprocinemx.com/#organization"
        },
        "areaServed": "Worldwide",
        "serviceType": "CFD Trading Simulation"
      },
      {
        "@type": "WebSite",
        "@id": "https://tradexprocinemx.com/#website",
        "url": "https://tradexprocinemx.com",
        "name": "TradeX Pro",
        "publisher": {
          "@id": "https://tradexprocinemx.com/#organization"
        }
      }
    ]
  };

  return (
    <ParallaxAuroraLayout sections={6}>
      <Seo
        title="TradeX Pro - #1 Multi Asset CFD Trading Platform | Trusted Broker"
        description="Practice CFD trading risk-free with TradeX Pro. Trade forex, stocks, indices, commodities, and crypto with $50,000 virtual funds on a professional platform."
        canonical="https://tradexprocinemx.com/"
        openGraph={{
          title: "TradeX Pro - Master CFD Trading Risk-Free",
          description: "Professional trading platform with $50,000 virtual capital. Trade 500+ instruments across 5 asset classes.",
          image: "https://tradexprocinemx.com/social-preview.png",
          type: "website"
        }}
        structuredData={structuredData}
      />
      <PublicHeader />

      {/* Hero Section - Luxury Brand Aesthetic: Simple yet Elegant */}
      <section className="relative overflow-hidden py-32 md:py-40" style={{
        background: 'linear-gradient(180deg, #0A1628 0%, #1a2d42 100%)'
      }}>
        {/* Remove particles - too busy for luxury aesthetic */}

        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Professional trading desk"
            className="h-full w-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary-glow/90 to-accent/85"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-6 py-3 text-sm font-semibold" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700', color: '#FFD700' }}>
              <Award className="mr-2 h-5 w-5" />
              Trusted by 50,000+ Traders Worldwide
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" style={{ color: '#FFFFFF', fontWeight: 700, letterSpacing: '-0.02em' }}>
              <span className="block mb-4 tracking-tight" style={{ fontSize: '4.5rem', color: '#FFFFFF', fontWeight: 700, letterSpacing: '-0.03em' }}>
                Trade with Confidence
              </span>
              <span className="block mt-4 tracking-tight" style={{ fontSize: '2.5rem', color: '#FFD700', fontWeight: 600, letterSpacing: '-0.01em' }}>
                Master CFD Trading Risk-Free
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed" style={{ color: '#F5F5DC' }}>
              <span className="font-light tracking-tight" style={{ fontSize: '1.5rem', color: '#F5F5DC' }}>
                Professional trading platform with <span className="font-semibold" style={{ color: '#FFD700' }}>$50,000 virtual capital</span>.<br />
                Practice across 5 asset classes with real-time market data and zero risk.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link to="/register">
                <Button size="xl" className="px-16 py-8 text-xl font-semibold shadow-2xl rounded-xl transition-all duration-300 hover:shadow-[#FFD700]/30 hover:scale-105 focus:ring-2 focus:ring-[#FFD700]" style={{ background: '#FFD700', color: '#0A1628', border: 'none' }}>
                  Start Trading Free
                  <ArrowRight className="ml-2 h-7 w-7" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="xl" variant="outline" className="px-16 py-8 text-xl font-semibold rounded-xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-[#FFD700]" style={{ background: 'transparent', border: '2px solid #F5F5DC', color: '#F5F5DC' }}>
                  View Platform Demo
                </Button>
              </Link>
            </div>

            {/* Statistics - Minimal, elegant - Gold used sparingly (10% rule) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto" style={{ color: '#FFFFFF' }}>
              <div className="flex flex-col items-center group">
                <div className="text-5xl font-bold mb-2 transition-transform group-hover:scale-110 group-hover:text-[#FFD700]" style={{ color: '#FFD700', textShadow: '0 2px 12px #FFD70022' }}>$50,000</div>
                <div className="text-base font-medium tracking-tight" style={{ color: '#F5F5DC' }}>Virtual Capital</div>
              </div>
              <div className="flex flex-col items-center group">
                <div className="text-5xl font-bold mb-2 transition-transform group-hover:scale-110 group-hover:text-[#FFD700]" style={{ color: '#FFFFFF', textShadow: '0 2px 12px #FFD70022' }}>500+</div>
                <div className="text-base font-medium tracking-tight" style={{ color: '#F5F5DC' }}>Trading Instruments</div>
              </div>
              <div className="flex flex-col items-center group">
                <div className="text-5xl font-bold mb-2 transition-transform group-hover:scale-110 group-hover:text-[#FFD700]" style={{ color: '#FFD700', textShadow: '0 2px 12px #FFD70022' }}>5</div>
                <div className="text-base font-medium tracking-tight" style={{ color: '#F5F5DC' }}>Asset Classes</div>
              </div>
              <div className="flex flex-col items-center group">
                <div className="text-5xl font-bold mb-2 transition-transform group-hover:scale-110 group-hover:text-[#FFD700]" style={{ color: '#FFFFFF', textShadow: '0 2px 12px #FFD70022' }}>24/7</div>
                <div className="text-base font-medium tracking-tight" style={{ color: '#F5F5DC' }}>Market Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Stats Section - Luxury Minimalist */}
      <section className="py-24 border-t border-[#FFD700]/10" style={{ backgroundColor: '#F5F5DC', borderColor: 'rgba(10, 22, 40, 0.1)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="rounded-xl p-12 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl" style={{ background: '#1a2d42', border: '1px solid rgba(245, 245, 220, 0.1)' }}>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700' }}>
                    <Shield className="h-8 w-8" style={{ color: '#FFD700', filter: 'drop-shadow(0 2px 8px #FFD70044)' }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#FFFFFF' }}>Bank-Level Security</h3>
                  <p className="leading-relaxed" style={{ color: '#F5F5DC' }}>SSL encryption & secure authentication protect your data</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-12 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl" style={{ background: '#1a2d42', border: '1px solid rgba(245, 245, 220, 0.1)' }}>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700' }}>
                    <Award className="h-8 w-8" style={{ color: '#FFD700', filter: 'drop-shadow(0 2px 8px #FFD70044)' }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#FFFFFF' }}>Regulated Platform</h3>
                  <p className="leading-relaxed" style={{ color: '#F5F5DC' }}>Compliant with international trading standards</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-12 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl" style={{ background: '#1a2d42', border: '1px solid rgba(245, 245, 220, 0.1)' }}>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700' }}>
                    <Users className="h-8 w-8" style={{ color: '#FFD700', filter: 'drop-shadow(0 2px 8px #FFD70044)' }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#FFFFFF' }}>50,000+ Active Traders</h3>
                  <p className="leading-relaxed" style={{ color: '#F5F5DC' }}>Join a thriving community of successful traders</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Services Showcase - Luxury Refined */}
      <section id="services" className="py-24" style={{ background: '#0A1628' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 px-4 py-2" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700', color: '#FFD700' }}>
              Our Services
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
              Everything You Need to
              <span className="block mt-3" style={{ color: '#FFD700' }}>
                Succeed in Trading
              </span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#F5F5DC' }}>
              Professional-grade tools and features designed for serious traders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: LineChart,
                title: "Advanced Charting",
                description: "TradingView integration with 100+ technical indicators, drawing tools, and multi-timeframe analysis",
                useGold: true
              },
              {
                icon: Zap,
                title: "One-Click Trading",
                description: "Execute trades instantly with predefined volumes for faster order placement and risk management",
                useGold: false
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                description: "Live portfolio tracking with P&L calculations, margin monitoring, and performance metrics",
                useGold: false
              },
              {
                icon: Shield,
                title: "Risk Management",
                description: "Automated stop-loss, take-profit, trailing stops, and comprehensive margin call protection",
                useGold: false
              },
              {
                icon: Smartphone,
                title: "Mobile Trading",
                description: "Trade seamlessly across desktop, tablet, and mobile devices with optimized responsive layouts",
                useGold: true
              },
              {
                icon: Briefcase,
                title: "Order Templates",
                description: "Save and reuse your favorite trading setups for consistent execution and strategy management",
                useGold: false
              }
            ].map((feature, index) => (
              <div key={index} className="rounded-lg p-10 transition-all duration-300 hover:scale-102" style={{ background: '#1a2d42', border: '1px solid rgba(245, 245, 220, 0.1)' }}>
                <div className={`h-20 w-20 rounded-xl flex items-center justify-center mb-6`} style={feature.useGold ? { background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700' } : { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(245, 245, 220, 0.1)' }}>
                  <feature.icon className="h-10 w-10" style={{ color: feature.useGold ? '#FFD700' : '#FFFFFF' }} />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#FFFFFF' }}>{feature.title}</h3>
                <p className="leading-relaxed" style={{ color: '#F5F5DC' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      < section id="how-it-works" className="py-20 bg-muted/30" >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700', color: '#FFD700' }}>
              Getting Started
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
              Start Trading in
              <span className="block mt-2" style={{ color: '#FFD700' }}>
                3 Simple Steps
              </span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#F5F5DC' }}>
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
                useGold: false
              },
              {
                step: "02",
                icon: Shield,
                title: "Verify KYC",
                description: "Complete quick identity verification for security. Get instant approval and $50,000 virtual capital.",
                useGold: true
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Start Trading",
                description: "Access 500+ instruments across 5 asset classes. Trade with real-time data and zero risk.",
                useGold: false
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full hover:shadow-xl transition-all duration-300" style={{ background: '#1a2d42', border: '1px solid rgba(245, 245, 220, 0.1)' }}>
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl font-bold mb-6 opacity-20" style={{ color: step.useGold ? '#FFD700' : '#FFFFFF' }}>{step.step}</div>
                    <div className="h-16 w-16 rounded-lg flex items-center justify-center mx-auto mb-6" style={step.useGold ? { background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700' } : { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(245, 245, 220, 0.1)' }}>
                      <step.icon className="h-8 w-8" style={{ color: step.useGold ? '#FFD700' : '#FFFFFF' }} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4" style={{ color: '#FFFFFF' }}>{step.title}</h3>
                    <p className="leading-relaxed" style={{ color: '#F5F5DC' }}>{step.description}</p>
                  </CardContent>
                </Card>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8" style={{ color: '#FFD700' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Asset Classes Section - Enhanced */}
      < section id="markets" className="py-24 bg-background" >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 px-4 py-2" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700', color: '#FFD700' }}>
              Global Markets
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
              Trade Across
              <span className="block mt-3" style={{ color: '#FFD700' }}>
                5 Major Asset Classes
              </span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#F5F5DC' }}>
              Access 500+ instruments across global markets with institutional-grade execution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                title: "Forex",
                icon: Globe,
                instruments: "50+ Currency Pairs",
                description: "Major, minor & exotic pairs with tight spreads",
                useGold: true
              },
              {
                title: "Stocks",
                icon: TrendingUp,
                instruments: "200+ Global Stocks",
                description: "Blue-chip companies from major exchanges",
                useGold: false
              },
              {
                title: "Indices",
                icon: BarChart3,
                instruments: "20+ Market Indices",
                description: "Trade major stock market indices worldwide",
                useGold: false
              },
              {
                title: "Commodities",
                icon: LineChart,
                instruments: "30+ Commodities",
                description: "Precious metals, energy & agriculture",
                useGold: true
              },
              {
                title: "Crypto",
                icon: Zap,
                instruments: "50+ Cryptocurrencies",
                description: "Major cryptocurrencies and DeFi tokens",
                useGold: false
              }
            ].map((asset, index) => (
              <Card key={index} style={{ background: '#1a2d42', border: '1px solid rgba(245, 245, 220, 0.1)' }} className="rounded-lg premium-card-hover group">
                <CardContent className="p-8 text-center">
                  <div className="h-20 w-20 rounded-xl flex items-center justify-center mx-auto mb-6" style={asset.useGold ? { background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700' } : { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(245, 245, 220, 0.1)' }}>
                    <asset.icon className="h-10 w-10" style={{ color: asset.useGold ? '#FFD700' : '#FFFFFF' }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: '#FFFFFF' }}>{asset.title}</h3>
                  <div className="text-sm font-bold mb-4" style={{ color: '#FFD700' }}>{asset.instruments}</div>
                  <p className="text-sm leading-relaxed" style={{ color: '#F5F5DC' }}>{asset.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section >

      {/* Why Choose Us Section */}
      <section className="py-20" style={{ background: '#0A1628', color: '#FFFFFF' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 px-4 py-2" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700', color: '#FFD700' }}>
                Why TradeX Pro
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
                The Smart Choice for
                <span className="block mt-2" style={{ color: '#FFD700' }}>Aspiring Traders</span>
              </h2>
              <p className="text-xl mb-8 leading-relaxed" style={{ color: '#F5F5DC' }}>
                Join thousands of traders who've chosen TradeX Pro as their trusted platform for risk-free CFD trading education and practice.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: GraduationCap,
                    title: "Learn Without Risk",
                    description: "Master trading strategies with virtual capital before risking real money",
                    useGold: true
                  },
                  {
                    icon: Clock,
                    title: "24/7 Market Access",
                    description: "Trade global markets around the clock with real-time data feeds",
                    useGold: false
                  },
                  {
                    icon: Target,
                    title: "Professional Tools",
                    description: "Access the same advanced tools used by professional traders",
                    useGold: false
                  },
                  {
                    icon: Star,
                    title: "No Hidden Costs",
                    description: "Completely free platform with no subscriptions or trading fees",
                    useGold: true
                  }
                ].map((benefit, index) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={benefit.useGold ? { background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700' } : { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(245, 245, 220, 0.1)' }}>
                        <benefit.icon className="h-6 w-6" style={{ color: benefit.useGold ? '#FFD700' : '#FFFFFF' }} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>{benefit.title}</h3>
                      <p className="leading-relaxed" style={{ color: '#F5F5DC' }}>{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card style={{ background: '#1a2d42', border: '1px solid rgba(245, 245, 220, 0.1)' }} className="rounded-lg">
              <CardContent className="p-10">
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                      <span className="text-lg" style={{ color: '#F5F5DC' }}>Starting Balance</span>
                      <span className="text-3xl font-bold" style={{ color: '#FFD700' }}>$50,000</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                      <span className="text-lg" style={{ color: '#F5F5DC' }}>Trading Instruments</span>
                      <span className="text-3xl font-bold" style={{ color: '#FFD700' }}>500+</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                      <span className="text-lg" style={{ color: '#F5F5DC' }}>Setup Time</span>
                      <span className="text-3xl font-bold" style={{ color: '#FFD700' }}>2 min</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg" style={{ color: '#F5F5DC' }}>Monthly Cost</span>
                      <span className="text-3xl font-bold" style={{ color: '#FFD700' }}>$0</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <Link to="/register" className="block">
                    <Button size="lg" className="w-full py-6 text-lg font-semibold shadow-xl" style={{ background: '#FFD700', color: '#0A1628', border: 'none' }}>
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section >

      {/* Final CTA Section - Luxury Elegance */}
      < section className="relative py-32 overflow-hidden" style={{
        background: 'linear-gradient(180deg, #1a2d42 0%, #0A1628 100%)'
      }
      }>
        {/* Remove particles - luxury aesthetic */}

        < div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8" >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-8" style={{ color: '#FFFFFF', fontWeight: 700 }}>
              Ready to Start Your
              <span className="block mt-3" style={{ color: '#FFD700' }}>Trading Journey?</span>
            </h2>
            <p className="text-xl md:text-2xl mb-12 leading-relaxed" style={{ color: '#F5F5DC' }}>
              Join 50,000+ traders mastering CFD trading with zero risk.
              Get <span className="font-semibold" style={{ color: '#FFD700' }}>$50,000 in virtual capital</span> instantly upon KYC verification.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link to="/register">
                <Button size="xl" className="px-16 py-8 text-xl font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105" style={{ background: '#FFD700', color: '#0A1628', border: 'none' }}>
                  Create Free Account
                  <ArrowRight className="ml-3 h-7 w-7" />
                </Button>
              </Link>
              <Link to="/company/contact">
                <Button size="xl" variant="outline" className="px-16 py-8 text-xl font-semibold transition-all duration-300" style={{ borderColor: '#F5F5DC', borderWidth: '2px', color: '#F5F5DC', background: 'transparent' }}>
                  Contact Sales
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-10 text-base" style={{ color: '#F5F5DC' }}>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6" style={{ color: '#FFD700' }} />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6" style={{ color: '#FFD700' }} />
                <span className="font-medium">Setup in 2 minutes</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6" style={{ color: '#FFD700' }} />
                <span className="font-medium">Start trading immediately</span>
              </div>
            </div>
          </div>
        </div >
      </section >

      {/* Stats Banner - Key Metrics */}
      <StatsBanner />

      {/* Customer Testimonials */}
      <TestimonialsSection />

      {/* Security & Certifications */}
      <SecuritySection />

      {/* Awards & Trust Badges */}
      <TrustBadgesSection />

      {/* Educational Resources */}
      <EducationalSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Platform Comparison */}
      <ComparisonSection />

      {/* Interactive Profit Calculator */}
      <ProfitCalculator />

      {/* Leadership Team */}
      <TeamSection />

      {/* Regulatory & Trust Section */}
      <RegulatorySection />

      {/* Risk Disclosure - Required for Financial Services */}
      <RiskDisclosure />

      <PublicFooter />
    </ParallaxAuroraLayout>
  );
}
