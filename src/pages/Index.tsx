import { ComparisonTable } from '@/components/landing/ComparisonTable';
import { FAQSection } from '@/components/landing/FAQSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { LiveChatIndicator } from '@/components/landing/LiveChatIndicator';
import { PlatformPreview } from '@/components/landing/PlatformPreview';
import { CompactRiskDisclaimer } from '@/components/landing/RiskDisclaimer';
import {
  AnimatedSectionHeader,
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from '@/components/landing/ScrollReveal';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
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
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section - Asymmetric 60/40 Layout with Animated Background */}
      <HeroSection />

      {/* Trust & Security Stats Section */}
      <section className="py-12 bg-card border-b border-border/50 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer
            className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto"
            staggerDelay={0.15}
          >
            {[
              {
                icon: Shield,
                title: '256-bit SSL',
                desc: 'Bank-level encryption',
                gradient: 'from-primary to-primary-glow',
              },
              {
                icon: Award,
                title: 'Regulated',
                desc: 'Compliant platform',
                gradient: 'from-gold to-gold-hover',
              },
              {
                icon: Users,
                title: '50,000+',
                desc: 'Active traders',
                gradient: 'from-accent to-accent/80',
              },
              {
                icon: Clock,
                title: '24/7 Support',
                desc: 'Always available',
                gradient: 'from-primary to-gold',
              },
            ].map((stat, index) => (
              <StaggerItem key={index}>
                <motion.div
                  className="flex items-center gap-4 justify-center md:justify-start"
                  whileHover={{ scale: 1.05, x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center flex-shrink-0`}
                    whileHover={{ rotate: 5 }}
                  >
                    <stat.icon className="h-6 w-6 text-primary-foreground" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-foreground">{stat.title}</h3>
                    <p className="text-sm text-muted-foreground">{stat.desc}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Key Services Showcase - Specific Descriptions */}
      <section
        id="services"
        className="py-20 md:py-24 bg-background overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSectionHeader
            badge={
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
                Professional Trading Tools
              </Badge>
            }
            title="Everything You Need to"
            subtitle="Trade Like a Pro"
            description="The same institutional-grade tools used by professional traders, now available for free"
          />

          <StaggerContainer
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            staggerDelay={0.1}
          >
            {[
              {
                icon: LineChart,
                title: 'TradingView Integration',
                description:
                  "Access 100+ technical indicators, 50+ drawing tools, and multi-timeframe analysis with the world's most popular charting platform",
                gradient: 'from-primary to-primary-glow',
              },
              {
                icon: Zap,
                title: 'One-Click Execution',
                description:
                  'Execute market orders in under 50ms with preset volumes. Perfect for scalping strategies and fast-moving markets',
                gradient: 'from-gold to-gold-hover',
              },
              {
                icon: BarChart3,
                title: 'Real-Time Portfolio Analytics',
                description:
                  'Live P&L tracking, margin utilization monitoring, position heat maps, and performance metrics updated every second',
                gradient: 'from-accent to-accent/80',
              },
              {
                icon: Shield,
                title: 'Advanced Risk Management',
                description:
                  'Automated stop-loss, take-profit, trailing stops with customizable triggers. Never lose more than you plan',
                gradient: 'from-primary to-primary-glow',
              },
              {
                icon: Smartphone,
                title: 'Trade Anywhere',
                description:
                  'Fully responsive platform optimized for desktop, tablet, and mobile. Your portfolio syncs across all devices instantly',
                gradient: 'from-gold to-gold-hover',
              },
              {
                icon: Briefcase,
                title: 'Order Templates',
                description:
                  'Save your favorite trading setups with preset SL/TP levels. Execute complex strategies with a single click',
                gradient: 'from-accent to-accent/80',
              },
            ].map((feature, index) => (
              <StaggerItem key={index}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full group hover:shadow-xl transition-shadow duration-300 border-border bg-card">
                    <CardContent className="p-8">
                      <motion.div
                        className={`h-16 w-16 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <feature.icon className="h-8 w-8 text-primary-foreground" />
                      </motion.div>
                      <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors duration-200">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Platform Preview Section */}
      <PlatformPreview />

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 md:py-24 bg-background overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSectionHeader
            badge={
              <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20">
                Getting Started
              </Badge>
            }
            title="Start Trading in"
            subtitle="Under 3 Minutes"
            description="No complicated forms. No waiting. Just fast, simple setup."
          />

          <StaggerContainer
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            staggerDelay={0.2}
          >
            {[
              {
                step: '01',
                icon: Users,
                title: 'Create Account',
                description:
                  'Sign up with your email in 30 seconds. No credit card, no commitments.',
                time: '30 sec',
                color: 'text-primary',
              },
              {
                step: '02',
                icon: Shield,
                title: 'Quick Verification',
                description:
                  'Complete simple KYC verification. Get instant approval and $50,000 virtual capital.',
                time: '2 min',
                color: 'text-gold',
              },
              {
                step: '03',
                icon: TrendingUp,
                title: 'Start Trading',
                description:
                  'Access 500+ instruments immediately. Practice with real market conditions, zero risk.',
                time: 'Instant',
                color: 'text-accent',
              },
            ].map((step, index) => (
              <StaggerItem key={index}>
                <div className="relative h-full">
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-border bg-card">
                      <CardContent className="p-8 text-center">
                        <motion.div
                          className={`text-6xl font-bold ${step.color} mb-4 opacity-20`}
                          initial={{ scale: 0.5, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 0.2 }}
                          viewport={{ once: true }}
                          transition={{
                            delay: 0.3 + index * 0.1,
                            type: 'spring',
                          }}
                        >
                          {step.step}
                        </motion.div>
                        <motion.div
                          className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-gold flex items-center justify-center mx-auto mb-6"
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <step.icon className="h-8 w-8 text-primary-foreground" />
                        </motion.div>
                        <Badge className="mb-4 bg-muted text-muted-foreground">
                          {step.time}
                        </Badge>
                        <h3 className="text-2xl font-bold mb-4">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                  {index < 2 && (
                    <motion.div
                      className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.2 }}
                    >
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-8 w-8 text-gold" />
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <ScrollReveal delay={0.4}>
            <div className="text-center mt-12">
              <Link to="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-gold text-gold-foreground hover:bg-gold-hover px-8 py-6 text-lg font-bold"
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Asset Classes Section */}
      <section
        id="markets"
        className="py-20 md:py-24 bg-muted/50 overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSectionHeader
            badge={
              <Badge className="mb-4 bg-gold/10 text-gold hover:bg-gold/20 border border-gold/20">
                Global Markets
              </Badge>
            }
            title="Trade Across"
            subtitle="5 Major Asset Classes"
            description="Diversify your practice portfolio across global markets"
          />

          <StaggerContainer
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
            staggerDelay={0.1}
          >
            {[
              {
                title: 'Forex',
                icon: Globe,
                instruments: '50+ Pairs',
                spread: 'From 0.1 pips',
                examples: 'EUR/USD, GBP/JPY',
                gradient: 'from-primary to-primary-glow',
              },
              {
                title: 'Stocks',
                icon: TrendingUp,
                instruments: '200+ Stocks',
                spread: 'From $0.01',
                examples: 'AAPL, TSLA, AMZN',
                gradient: 'from-gold to-gold-hover',
              },
              {
                title: 'Indices',
                icon: BarChart3,
                instruments: '20+ Indices',
                spread: 'From 0.4 pts',
                examples: 'S&P500, NASDAQ',
                gradient: 'from-accent to-accent/80',
              },
              {
                title: 'Commodities',
                icon: LineChart,
                instruments: '30+ Assets',
                spread: 'From 0.03',
                examples: 'Gold, Oil, Silver',
                gradient: 'from-primary to-gold',
              },
              {
                title: 'Crypto',
                icon: Zap,
                instruments: '50+ Coins',
                spread: 'From 0.1%',
                examples: 'BTC, ETH, SOL',
                gradient: 'from-gold to-accent',
              },
            ].map((asset, index) => (
              <StaggerItem key={index}>
                <motion.div
                  whileHover={{ y: -10, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full group hover:shadow-xl transition-shadow duration-300 border-border bg-card">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        className={`h-14 w-14 rounded-lg bg-gradient-to-br ${asset.gradient} flex items-center justify-center mx-auto mb-4`}
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <asset.icon className="h-7 w-7 text-primary-foreground" />
                      </motion.div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-200">
                        {asset.title}
                      </h3>
                      <div className="text-sm font-semibold text-gold mb-1">
                        {asset.instruments}
                      </div>
                      <div className="text-xs text-accent mb-2">
                        {asset.spread}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {asset.examples}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Comparison Table */}
      <ComparisonTable />

      {/* Why Choose Us Section */}
      <section className="py-20 md:py-24 bg-primary text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left" distance={50}>
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Badge className="mb-6 bg-gold text-gold-foreground hover:bg-gold-hover">
                    Why TradeX Pro
                  </Badge>
                </motion.div>
                <motion.h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  The Smart Choice for
                  <span className="block mt-2 text-gold">Aspiring Traders</span>
                </motion.h2>
                <motion.p
                  className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Join 50,000+ traders who've chosen TradeX Pro as their trusted
                  platform for mastering CFD trading without financial risk.
                </motion.p>

                <div className="space-y-6">
                  {[
                    {
                      icon: GraduationCap,
                      title: 'Learn Without Risk',
                      description:
                        'Practice with $50,000 virtual capital. Make mistakes, learn lessons, without losing real money',
                    },
                    {
                      icon: Clock,
                      title: 'Real Market Conditions',
                      description:
                        'Trade with live prices from major exchanges. Experience actual market volatility and spreads',
                    },
                    {
                      icon: Target,
                      title: 'Professional Tools',
                      description:
                        'Access the same TradingView charts, risk management, and analytics used by hedge funds',
                    },
                    {
                      icon: Star,
                      title: 'Completely Free Forever',
                      description:
                        'No subscriptions, no hidden fees, no ads. 100% free professional trading education',
                    },
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      className="flex gap-4 group"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      whileHover={{ x: 8 }}
                    >
                      <div className="flex-shrink-0">
                        <motion.div
                          className="h-12 w-12 rounded-lg bg-gold flex items-center justify-center"
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <benefit.icon className="h-6 w-6 text-primary" />
                        </motion.div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-primary-foreground/80 leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" distance={50} delay={0.2}>
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="bg-background/95 backdrop-blur-sm border-gold/20">
                  <CardContent className="p-10">
                    <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                      What You Get
                    </h3>
                    <div className="space-y-6">
                      {[
                        {
                          label: 'Starting Capital',
                          value: '$50,000',
                          color: 'text-gold',
                        },
                        {
                          label: 'Trading Instruments',
                          value: '500+',
                          color: 'text-accent',
                        },
                        {
                          label: 'Technical Indicators',
                          value: '100+',
                          color: 'text-primary',
                        },
                        {
                          label: 'Setup Time',
                          value: '2 min',
                          color: 'text-gold',
                        },
                        {
                          label: 'Monthly Cost',
                          value: '$0',
                          color: 'text-accent',
                        },
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          className={`flex items-center justify-between ${
                            index < 4 ? 'pb-4 border-b border-border' : ''
                          }`}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <span className="text-muted-foreground">
                            {stat.label}
                          </span>
                          <motion.span
                            className={`text-2xl font-bold ${stat.color}`}
                            initial={{ scale: 0.5 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{
                              delay: 0.5 + index * 0.1,
                              type: 'spring',
                            }}
                          >
                            {stat.value}
                          </motion.span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-8">
                      <Link to="/register" className="block">
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-gold-hover text-primary hover:opacity-90 py-7 text-lg font-bold shadow-xl"
                          >
                            Get Started Free
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </motion.div>
                      </Link>
                      <p className="text-center text-xs text-muted-foreground mt-4">
                        No credit card required • Instant access
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-primary via-primary-glow to-accent overflow-hidden relative">
        {/* Animated background elements */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal delay={0}>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Badge className="mb-6 bg-gold text-gold-foreground">
                  Limited Time: Extra $10,000 Virtual Bonus
                </Badge>
              </motion.div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                Ready to Start Your
                <span className="block mt-2 text-gold">Trading Journey?</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary-foreground/90 mb-10 leading-relaxed">
                Join 50,000+ traders mastering CFD trading with zero risk. Get
                $50,000 + $10,000 bonus virtual capital when you sign up today.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link to="/register">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="bg-gold text-gold-foreground hover:bg-gold-hover px-8 py-8 text-lg font-bold shadow-2xl w-full sm:w-auto group"
                    >
                      Claim Your $60,000 Account
                      <motion.span
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.span>
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </ScrollReveal>

            <StaggerContainer
              className="flex flex-wrap justify-center gap-8 text-primary-foreground/80 text-sm"
              staggerDelay={0.1}
            >
              {[
                'No credit card required',
                'Setup in 2 minutes',
                'Start trading immediately',
              ].map((text, index) => (
                <StaggerItem key={index}>
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-gold" />
                    </motion.div>
                    <span>{text}</span>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <ScrollReveal delay={0.6}>
              <div className="mt-8">
                <CompactRiskDisclaimer />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <PublicFooter />

      {/* Live Chat Indicator */}
      <LiveChatIndicator />
    </div>
  );
}
