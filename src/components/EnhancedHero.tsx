import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface FloatingCardProps {
  symbol: string;
  change: number;
  price: string;
  delay: number;
  position: 'top-left' | 'top-right' | 'bottom-left';
}

const FloatingCard: React.FC<FloatingCardProps> = ({ symbol, change, price, delay, position }) => {
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
  const bgColor = isPositive ? 'bg-green-500/10' : 'bg-red-500/10';
  const borderColor = isPositive ? 'border-green-500/20' : 'border-red-500/20';

  const positionClasses = {
    'top-left': 'top-8 left-8',
    'top-right': 'top-8 right-8',
    'bottom-left': 'bottom-8 left-8'
  };

  return (
    <div
      className={`
        absolute ${positionClasses[position]}
        glassmorphism rounded-lg p-3 border ${borderColor} ${bgColor}
        animate-float opacity-0 fade-in-scale visible
        delay-${delay * 100}
        w-32
        z-10
      `}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-foreground/70">{symbol}</span>
        {isPositive ? (
          <TrendingUp className="h-3 w-3 text-green-500" />
        ) : (
          <TrendingDown className="h-3 w-3 text-red-500" />
        )}
      </div>
      <div className="text-sm font-bold text-foreground">{price}</div>
      <div className={`text-xs ${changeColor} font-medium`}>
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </div>
      {/* Mini chart representation */}
      <div className="mt-2 h-6 opacity-50">
        <svg viewBox="0 0 40 20" className="w-full h-full">
          <path
            d={isPositive
              ? "M2,18 L8,15 L12,10 L18,12 L24,8 L30,5 L38,2"
              : "M2,2 L8,5 L12,10 L18,8 L24,12 L30,15 L38,18"
            }
            fill="none"
            stroke={isPositive ? '#10b981' : '#ef4444'}
            strokeWidth="1"
            className="opacity-60"
          />
        </svg>
      </div>
    </div>
  );
};

interface EnhancedHeroProps {
  className?: string;
}

const EnhancedHero: React.FC<EnhancedHeroProps> = ({ className = '' }) => {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Handle parallax scrolling
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Update CSS custom property for parallax effects
      document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Floating market data
  const floatingCards: FloatingCardProps[] = [
    { symbol: 'EUR/USD', change: 1.24, price: '1.0892', delay: 0, position: 'top-left' },
    { symbol: 'BTC/USD', change: -2.15, price: '43,256', delay: 2, position: 'top-right' },
    { symbol: 'SPX500', change: 0.87, price: '4,521', delay: 4, position: 'bottom-left' }
  ];

  return (
    <section ref={heroRef} className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
      {/* Background System */}
      <div className="absolute inset-0">
        {/* Base background image with parallax */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/hero-trading-background.jpg')`,
            transform: `translateY(${scrollY * 0.3}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        />

        {/* Fallback gradient if image doesn't load */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/60" />

        {/* Animated gradient mesh overlay */}
        <div
          className="absolute inset-0 opacity-30 animate-gradient"
          style={{
            background: `linear-gradient(135deg,
              rgba(37, 99, 235, 0.1) 0%,
              rgba(16, 185, 129, 0.1) 50%,
              rgba(239, 68, 68, 0.1) 100%)`,
            backgroundSize: '200% 200%'
          }}
        />

        {/* Floating particles/particles system placeholder */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full animate-particle-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${6 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating Chart Elements */}
      {floatingCards.map((card, index) => (
        <FloatingCard key={index} {...card} />
      ))}

      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-block hero-badge fade-in-up visible">
            <div className="px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20 inline-flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-primary text-sm font-medium">Risk-Free Paper Trading</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="hero-headline fade-in-up visible space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="block">Master CFD Trading</span>
              <span className="block bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                Without Risk
              </span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-transparent mx-auto rounded-full" />
          </div>

          {/* Subheadline */}
          <div className="hero-subheadline fade-in-up visible max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Practice trading forex, stocks, indices, commodities, and crypto on a
              <span className="text-primary font-semibold"> professional platform</span>
              {' '}with virtual funds. Zero risk, real market experience.
            </p>
          </div>

          {/* CTA Button Group */}
          <div className="hero-cta fade-in-up visible flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Link to="/register">
              <Button size="lg" className="btn-hover-lift text-base px-8 py-6 h-auto group">
                <span className="flex items-center gap-3">
                  Start Trading Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            <Link to="/trade">
              <Button size="lg" variant="outline" className="btn-hover-lift text-base px-8 py-6 h-auto backdrop-blur-sm border-primary/30 hover:border-primary/60 hover:bg-primary/10">
                View Platform
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="hero-trust fade-in-up visible">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
                <span>No credit card required</span>
              </div>
              <div className="hidden sm:block text-muted-foreground/50">•</div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Instant setup</span>
              </div>
              <div className="hidden sm:block text-muted-foreground/50">•</div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>$50,000 virtual capital</span>
              </div>
            </div>
          </div>

          {/* Additional Trust Elements */}
          <div className="flex items-center justify-center gap-8 pt-8 opacity-60">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">2M+</div>
              <div className="text-xs text-muted-foreground">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">$500B+</div>
              <div className="text-xs text-muted-foreground">Trading Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">15+</div>
              <div className="text-xs text-muted-foreground">Years in Business</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col items-center gap-2 text-muted-foreground/60 animate-bounce">
          <span className="text-xs uppercase tracking-wide">Scroll to explore</span>
          <div className="w-6 h-10 border border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted-foreground/60 rounded-full mt-2" />
          </div>
        </div>
      </div>

      {/* Intersection Observer for animations */}
      <style jsx>{`
        .fade-in-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
};

export default EnhancedHero;