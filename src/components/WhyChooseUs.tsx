import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  Server,
  BarChart3,
  BookOpen,
  Grid3x3,
  Headphones,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Users,
  Clock,
  Zap
} from 'lucide-react';

interface AdvantageItemProps {
  title: string;
  description: string;
  highlights: string[];
  icon: React.ReactNode;
  image: string;
  imagePosition: 'left' | 'right';
  index: number;
  link?: string;
}

const AdvantageItem: React.FC<AdvantageItemProps> = ({
  title,
  description,
  highlights,
  icon,
  image,
  imagePosition,
  index,
  link = '/register'
}) => {
  const isLeft = imagePosition === 'left';

  return (
    <div
      className={`
        advantage-item-${index + 1} grid lg:grid-cols-2 gap-12 items-center
        py-16 border-b border-border/30 last:border-b-0
        fade-in-up visible
      `}
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      {/* Image Side */}
      <div className={`${isLeft ? 'lg:order-first' : 'lg:order-last'}`}>
        <div className="relative">
          <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 flex items-center justify-center overflow-hidden">
            {/* Placeholder for image */}
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {title}
              </h3>
              <p className="text-muted-foreground">
                Professional illustration or platform screenshot
              </p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl" />
        </div>
      </div>

      {/* Content Side */}
      <div className={`space-y-6 ${isLeft ? 'lg:pl-8' : 'lg:pr-8'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            {icon}
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
            {title}
          </h3>
        </div>

        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>

        <div className="space-y-3">
          {highlights.map((highlight, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-foreground">{highlight}</span>
            </div>
          ))}
        </div>

        <Link to={link}>
          <Button className="btn-hover-lift">
            <span className="flex items-center gap-2">
              Learn More
              <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

interface WhyChooseUsProps {
  className?: string;
}

const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ className = '' }) => {
  const advantages = [
    {
      title: 'Zero Risk Practice Trading',
      description: 'Master trading strategies with $50,000 in virtual funds. Experience real market conditions without risking real money.',
      highlights: [
        '$50,000 virtual capital',
        'Real market conditions',
        'Strategy testing environment',
        'No time limits'
      ],
      icon: <Shield className="h-6 w-6 text-primary" />,
      image: '/images/risk-free-trading.jpg',
      imagePosition: 'left' as const
    },
    {
      title: 'Institutional-Grade Infrastructure',
      description: 'Trade on enterprise-grade technology with 99.9% uptime, sub-second execution, and bank-level security.',
      highlights: [
        '99.9% uptime guarantee',
        'Sub-second execution',
        'Enterprise security',
        'Global server network'
      ],
      icon: <Server className="h-6 w-6 text-primary" />,
      image: '/images/infrastructure.jpg',
      imagePosition: 'right' as const
    },
    {
      title: 'Advanced Trading Tools',
      description: 'Professional charting package with 50+ indicators, multiple timeframes, and advanced order types.',
      highlights: [
        '50+ technical indicators',
        'Multiple chart timeframes',
        'Advanced order types',
        'Drawing tools & patterns'
      ],
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      image: '/images/trading-tools.jpg',
      imagePosition: 'left' as const
    },
    {
      title: 'Comprehensive Education',
      description: 'Learn from basics to advanced strategies with video tutorials, live webinars, and expert market analysis.',
      highlights: [
        '50+ video lessons',
        'Weekly live webinars',
        'Expert market analysis',
        'Trading strategies library'
      ],
      icon: <BookOpen className="h-6 w-6 text-primary" />,
      image: '/images/education.jpg',
      imagePosition: 'right' as const
    },
    {
      title: 'Multi-Asset Portfolio',
      description: 'Diversify across 5 asset classes with 1000+ instruments. Build a balanced portfolio with correlated analysis.',
      highlights: [
        '5 major asset classes',
        '1000+ tradable instruments',
        'Correlation analysis',
        'Portfolio analytics'
      ],
      icon: <Grid3x3 className="h-6 w-6 text-primary" />,
      image: '/images/multi-asset.jpg',
      imagePosition: 'left' as const
    },
    {
      title: '24/7 Professional Support',
      description: 'Get help whenever you need it with live chat, phone support, and dedicated account managers.',
      highlights: [
        '24/7 live chat support',
        'Phone support available',
        'Dedicated account managers',
        'Multilingual support'
      ],
      icon: <Headphones className="h-6 w-6 text-primary" />,
      image: '/images/support.jpg',
      imagePosition: 'right' as const
    }
  ];

  return (
    <section className={`py-20 bg-card/20 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 fade-in-up visible">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Why Choose
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {' '}TradeX Pro
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Discover the advantages that make TradeX Pro the preferred choice for
            serious traders seeking professional tools and comprehensive support.
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-16 text-sm text-muted-foreground/60">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>Proven Track Record</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span>2M+ Happy Traders</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <span>15+ Years Experience</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-orange-500" />
            <span>Cutting-Edge Technology</span>
          </div>
        </div>

        {/* Advantage Items */}
        <div className="bg-card/50 rounded-2xl border border-border/50 overflow-hidden">
          {advantages.map((advantage, index) => (
            <AdvantageItem
              key={index}
              {...advantage}
              index={index}
            />
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'User Satisfaction', value: '94%', icon: <Users className="h-5 w-5" /> },
            { label: 'Platform Uptime', value: '99.9%', icon: <Server className="h-5 w-5" /> },
            { label: 'Support Response', value: '<2min', icon: <Clock className="h-5 w-5" /> },
            { label: 'Global Reach', value: '150+', icon: <TrendingUp className="h-5 w-5" /> }
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20"
              style={{ animationDelay: `${(index + 6) * 0.1}s` }}
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

        {/* Final CTA */}
        <div className="mt-16 text-center fade-in-up visible">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Experience the TradeX Pro Advantage?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of successful traders who have chosen TradeX Pro for their
              trading journey. Start with zero risk and discover your potential.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="btn-hover-lift">
                  <span className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline">
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;