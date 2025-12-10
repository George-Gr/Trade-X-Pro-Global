import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Sparkles,
  TrendingUp,
  BarChart3,
  DollarSign,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

// Floating card component for visual interest
const FloatingCard = ({ 
  children, 
  className = "", 
  delay = 0,
  duration = 6
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
  duration?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: 1, 
      y: [0, -10, 0],
    }}
    transition={{
      opacity: { duration: 0.5, delay },
      y: { duration, repeat: Infinity, ease: "easeInOut", delay }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Animated stat card
const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  trend,
  delay 
}: { 
  icon: React.ElementType; 
  value: string; 
  label: string;
  trend?: string;
  delay: number;
}) => (
  <FloatingCard delay={delay} duration={5 + delay}>
    <div className="glass-card p-4 rounded-xl border border-primary-foreground/20 backdrop-blur-md bg-primary-foreground/10 shadow-lg min-w-[140px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-lg bg-gold/20 flex items-center justify-center">
          <Icon className="h-4 w-4 text-gold" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-trading-profit bg-trading-profit/20 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="text-xl font-bold text-primary-foreground">{value}</div>
      <div className="text-xs text-primary-foreground/70">{label}</div>
    </div>
  </FloatingCard>
);

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-primary min-h-[90vh] flex items-center">
      {/* Animated Background Patterns */}
      <div className="absolute inset-0 z-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 pattern-grid opacity-30" />
        
        {/* Gradient mesh overlay */}
        <div className="absolute inset-0 pattern-mesh" />
        
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-gold/30 to-transparent blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-accent/30 to-transparent blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
            x: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-primary-glow/20 to-transparent blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 pattern-dots opacity-20" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* 60/40 Asymmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column - 60% - Text Content */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <Badge className="bg-gold text-gold-foreground hover:bg-gold-hover px-4 py-2 text-sm font-semibold shadow-lg">
                  <Sparkles className="mr-2 h-4 w-4" />
                  #1 Virtual Trading Platform
                </Badge>
              </div>
            </motion.div>
            
            {/* Compelling Headline */}
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Master Global Markets
              <motion.span 
                className="block mt-2 bg-gradient-to-r from-gold via-gold-hover to-accent bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Without Risking a Penny
              </motion.span>
            </motion.h1>
            
            {/* Specific Value Proposition */}
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-primary-foreground/90 mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Trade 500+ instruments across Forex, Stocks, Indices, Commodities & Crypto 
              with <span className="text-gold font-semibold">$50,000 virtual capital</span> and 
              real-time market data.
            </motion.p>

            {/* Urgency/Limited Offer */}
            <motion.div 
              className="flex items-center justify-center lg:justify-start gap-2 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="h-2 w-2 bg-accent rounded-full animate-pulse" />
              <span className="text-primary-foreground/80 text-sm">
                <span className="font-semibold text-accent">2,847 traders</span> started practicing this week
              </span>
            </motion.div>

            {/* CTA Buttons with Clear Hierarchy */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="btn-glow bg-gold text-gold-foreground hover:bg-gold-hover px-10 py-7 text-lg font-bold shadow-2xl hover:shadow-gold/25 transition-all duration-300 hover:scale-105 w-full sm:w-auto group"
                >
                  Start Trading Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/60 px-8 py-7 text-lg font-semibold w-full sm:w-auto backdrop-blur-sm"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </motion.div>

            {/* Quick Benefits */}
            <motion.div 
              className="flex flex-wrap justify-center lg:justify-start gap-6 text-primary-foreground/80 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              {[
                "No credit card required",
                "Setup in 2 minutes",
                "100% risk-free"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-gold" />
                  <span>{benefit}</span>
                </div>
              ))}
            </motion.div>
          </div>
          
          {/* Right Column - 40% - Visual Elements with Floating Cards */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative h-[500px]">
              {/* Main Dashboard Preview Card */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <div className="glass-card rounded-2xl border border-primary-foreground/20 backdrop-blur-xl bg-primary-foreground/10 p-6 shadow-2xl">
                  {/* Mini Chart Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-trading-profit animate-pulse" />
                      <span className="text-sm font-medium text-primary-foreground">EUR/USD</span>
                    </div>
                    <Badge className="bg-trading-profit/20 text-trading-profit text-xs">
                      +1.24%
                    </Badge>
                  </div>
                  
                  {/* Simulated Chart */}
                  <div className="h-32 mb-4 relative overflow-hidden rounded-lg bg-primary-foreground/5">
                    <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <motion.path
                        d="M0,70 Q30,60 60,65 T120,45 T180,55 T240,30 T300,40"
                        fill="none"
                        stroke="hsl(var(--gold))"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 0.5 }}
                      />
                      <motion.path
                        d="M0,70 Q30,60 60,65 T120,45 T180,55 T240,30 T300,40 V100 H0 Z"
                        fill="url(#chartGradient)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.5 }}
                      />
                    </svg>
                  </div>
                  
                  {/* Price Display */}
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-bold text-primary-foreground">1.0847</div>
                      <div className="text-xs text-primary-foreground/60">Current Price</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-trading-profit">+0.0134</div>
                      <div className="text-xs text-primary-foreground/60">Today's Change</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Stat Cards */}
              <div className="absolute -top-4 -left-4">
                <StatCard 
                  icon={TrendingUp} 
                  value="$2.4B" 
                  label="24h Volume"
                  trend="+12%"
                  delay={0.8}
                />
              </div>
              
              <div className="absolute top-8 -right-8">
                <StatCard 
                  icon={Activity} 
                  value="50K+" 
                  label="Active Traders"
                  delay={1}
                />
              </div>
              
              <div className="absolute -bottom-4 left-8">
                <StatCard 
                  icon={BarChart3} 
                  value="500+" 
                  label="Instruments"
                  delay={1.2}
                />
              </div>
              
              <div className="absolute bottom-16 -right-4">
                <StatCard 
                  icon={DollarSign} 
                  value="$50K" 
                  label="Virtual Capital"
                  delay={1.4}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trust Metrics - Below the fold on mobile, integrated on desktop */}
        <motion.div 
          className="mt-16 lg:mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-primary-foreground/90 max-w-4xl mx-auto glass-card rounded-2xl p-6 border border-primary-foreground/10">
            {[
              { value: "50K+", label: "Active Traders", color: "text-gold" },
              { value: "$2B+", label: "Monthly Volume", color: "text-accent" },
              { value: "500+", label: "Instruments", color: "text-gold" },
              { value: "4.8★", label: "User Rating", color: "text-accent" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
              >
                <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-sm text-primary-foreground/70">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
