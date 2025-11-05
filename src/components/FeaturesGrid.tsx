import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Zap,
  Grid3x3,
  Terminal,
  BookOpen,
  Headphones,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Users
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlights?: string[];
  index: number;
  link?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  highlights,
  index,
  link = '/register'
}) => {
  return (
    <div
      className={`
        feature-card-${index + 1} group relative
        bg-card border border-border rounded-xl p-6
        card-hover cursor-pointer
        fade-in-up visible
      `}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Hover gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Card content */}
      <div className="relative z-10 space-y-4">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300">
          <div className="text-primary group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Highlights */}
        {highlights && highlights.length > 0 && (
          <div className="space-y-2">
            {highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground/80">
                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link to={link}>
          <Button
            variant="ghost"
            className="p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent group"
          >
            <span className="flex items-center gap-2">
              Learn More
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Button>
        </Link>
      </div>

      {/* Decorative element */}
      <div className="absolute top-2 right-2 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
};

interface FeaturesGridProps {
  className?: string;
}

const FeaturesGrid: React.FC<FeaturesGridProps> = ({ className = '' }) => {
  const features = [
    {
      icon: <Shield className="h-7 w-7" />,
      title: 'Risk-Free Trading',
      description: 'Practice with $50,000 virtual funds. Zero risk, real market conditions.',
      highlights: [
        'No real money required',
        'Realistic market simulation',
        'Strategy testing environment'
      ]
    },
    {
      icon: <Zap className="h-7 w-7" />,
      title: 'Real-Time Data',
      description: 'Live market prices, real-time charts, instant execution. Experience professional trading conditions.',
      highlights: [
        'Live price feeds',
        'Sub-second execution',
        'Real-time portfolio tracking'
      ]
    },
    {
      icon: <Grid3x3 className="h-7 w-7" />,
      title: '5 Asset Classes',
      description: 'Trade forex, stocks, indices, commodities, and cryptocurrencies. 1000+ instruments.',
      highlights: [
        'Forex (50+ pairs)',
        'Global stock indices',
        'Crypto & commodities'
      ]
    },
    {
      icon: <Terminal className="h-7 w-7" />,
      title: 'Advanced Trading Tools',
      description: 'Professional IC Markets-inspired interface with advanced orders, leverage up to 1:500, portfolio analytics.',
      highlights: [
        '20+ technical indicators',
        'Multiple order types',
        'Risk management tools'
      ]
    },
    {
      icon: <BookOpen className="h-7 w-7" />,
      title: 'Educational Resources',
      description: 'Trading Academy, video tutorials, webinars, eBooks. Learn from basics to advanced strategies.',
      highlights: [
        '50+ video lessons',
        'Weekly live webinars',
        'Expert market analysis'
      ]
    },
    {
      icon: <Headphones className="h-7 w-7" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support, live chat, comprehensive help center, dedicated account managers.',
      highlights: [
        'Live chat support',
        'Email response < 2 hours',
        'Dedicated account managers'
      ]
    }
  ];

  return (
    <section className={`py-20 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 fade-in-up visible">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {' '}Trade Like a Pro
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Professional trading platform with advanced tools, comprehensive education,
            and dedicated support - all in a risk-free environment.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              {...feature}
              index={index}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center fade-in-up visible" style={{ animationDelay: '0.8s' }}>
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Experience Professional Trading?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of traders who have mastered their strategies using our
              comprehensive platform and educational resources.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="btn-hover-lift">
                  <span className="flex items-center gap-2">
                    Start Trading Free
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              </Link>
              <Link to="/academy">
                <Button size="lg" variant="outline" className="backdrop-blur-sm border-primary/30 hover:border-primary/60">
                  Browse Education
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground/60">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Instant account setup</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>$50,000 virtual funds</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;