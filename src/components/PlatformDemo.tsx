import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Maximize2, ArrowRight, Zap, Shield, TrendingUp, BarChart3, Eye, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AnnotationPoint {
  id: number;
  x: string;
  y: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const AnnotationTooltip: React.FC<{
  point: AnnotationPoint;
  isActive: boolean;
  onClick: () => void;
}> = ({ point, isActive, onClick }) => {
  return (
    <div
      className={`absolute z-20 transition-all duration-300 ${point.x} ${point.y} ${
        isActive ? 'scale-110' : 'hover:scale-105'
      }`}
      onClick={onClick}
    >
      {/* Number Badge */}
      <div className={`
        w-8 h-8 bg-primary text-primary-foreground rounded-full
        flex items-center justify-center text-sm font-bold
        cursor-pointer shadow-lg hover:shadow-xl transition-all
        ${isActive ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background' : ''}
      `}>
        {point.id}
      </div>

      {/* Tooltip */}
      {isActive && (
        <Card className="absolute top-10 left-1/2 transform -translate-x-1/2 w-64 shadow-xl animate-fade-in-scale">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-primary">
                {point.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">
                  {point.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {point.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface PlatformDemoProps {
  className?: string;
}

const PlatformDemo: React.FC<PlatformDemoProps> = ({ className = '' }) => {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const annotations: AnnotationPoint[] = [
    {
      id: 1,
      x: 'top-[20%]',
      y: 'left-[25%]',
      title: 'Real-Time Charts',
      description: 'Interactive candlestick charts with 20+ technical indicators and multiple timeframes.',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      id: 2,
      x: 'top-[35%]',
      y: 'right-[20%]',
      title: 'Advanced Order Panel',
      description: 'Market, limit, stop orders with advanced risk management tools.',
      icon: <Zap className="h-5 w-5" />
    },
    {
      id: 3,
      x: 'top-[60%]',
      y: 'left-[15%]',
      title: 'Market Watch',
      description: 'Live prices for 50+ tradable instruments with real-time updates.',
      icon: <Eye className="h-5 w-5" />
    },
    {
      id: 4,
      x: 'top-[45%]',
      y: 'right-[30%]',
      title: 'Portfolio Dashboard',
      description: 'Track positions, P&L, and account metrics with detailed analytics.',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: 5,
      x: 'top-[75%]',
      y: 'left-[35%]',
      title: 'One-Click Trading',
      description: 'Instant execution with customizable presets and quick trade buttons.',
      icon: <Play className="h-5 w-5" />
    },
    {
      id: 6,
      x: 'top-[55%]',
      y: 'left-[45%]',
      title: 'Risk Management',
      description: 'Built-in calculators, position sizing tools, and automated stop-loss.',
      icon: <Shield className="h-5 w-5" />
    }
  ];

  const features = [
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: 'Professional Charts',
      description: 'TradingView-powered charts with 50+ indicators, drawing tools, and advanced analysis features.'
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: 'Lightning Fast Execution',
      description: 'Sub-second order execution with multiple order types and advanced trading tools.'
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: 'Advanced Risk Management',
      description: 'Built-in risk calculators, position sizing tools, and automated risk controls.'
    },
    {
      icon: <Eye className="h-6 w-6 text-primary" />,
      title: 'Real-Time Market Data',
      description: 'Live streaming prices, news feeds, and market analysis integrated directly into the platform.'
    },
    {
      icon: <Lock className="h-6 w-6 text-primary" />,
      title: 'Secure & Reliable',
      description: 'Bank-grade security with 256-bit encryption and 99.9% uptime guarantee.'
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      title: 'Performance Analytics',
      description: 'Detailed trading analytics, performance reports, and insights to improve your trading.'
    }
  ];

  return (
    <section className={`py-20 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 fade-in-up visible">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Professional Trading
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {' '}Interface
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Experience institutional-grade trading with our advanced platform
            designed for serious traders.
          </p>
        </div>

        {/* Main Platform Demo */}
        <div className="mb-16 fade-in-up visible">
          <div className="relative bg-card rounded-2xl border border-border overflow-hidden shadow-2xl">
            {/* Platform Screenshot/Video */}
            <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800">
              {/* Placeholder for platform screenshot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <BarChart3 className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Trading Platform Preview
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Professional multi-asset trading interface with real-time charts,
                    advanced order types, and comprehensive portfolio management.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Link to="/trade">
                      <Button size="lg" className="btn-hover-lift">
                        <span className="flex items-center gap-2">
                          Try Live Demo
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline">
                      <span className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Watch Video
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Annotation Points */}
              {annotations.map((point) => (
                <AnnotationTooltip
                  key={point.id}
                  point={point}
                  isActive={activeAnnotation === point.id}
                  onClick={() => setActiveAnnotation(
                    activeAnnotation === point.id ? null : point.id
                  )}
                />
              ))}

              {/* Connection Lines (decorative) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {annotations.map((point) => (
                  <circle
                    key={`circle-${point.id}`}
                    cx="50%"
                    cy="50%"
                    r={point.id * 15}
                    fill="none"
                    stroke="rgba(37, 99, 235, 0.1)"
                    strokeWidth="1"
                    className="animate-pulse"
                    style={{
                      animationDelay: `${point.id * 0.5}s`
                    }}
                  />
                ))}
              </svg>
            </div>

            {/* Interactive Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="bg-background/80 backdrop-blur-sm hover:bg-background"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>

            {/* Live indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-medium">LIVE DEMO</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="card-hover border-border/50 bg-card/50 backdrop-blur-sm"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { label: 'Execution Speed', value: '<100ms', icon: <Zap className="h-5 w-5" /> },
            { label: 'Uptime', value: '99.9%', icon: <Shield className="h-5 w-5" /> },
            { label: 'Indicators', value: '50+', icon: <BarChart3 className="h-5 w-5" /> },
            { label: 'Asset Classes', value: '5', icon: <TrendingUp className="h-5 w-5" /> }
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center fade-in-up visible">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Experience Professional Trading?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start trading with a practice account and experience the full power of our
              professional trading platform without any risk.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="btn-hover-lift">
                  <span className="flex items-center gap-2">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              </Link>
              <Link to="/platform">
                <Button size="lg" variant="outline">
                  Platform Features
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tech Stack Indicator */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 text-sm text-muted-foreground/60">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Powered by TradingView
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              Real-time Data Feeds
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              Institutional Technology
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformDemo;