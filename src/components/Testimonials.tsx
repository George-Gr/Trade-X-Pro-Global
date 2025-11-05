import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  TrendingUp,
  Users,
  Award,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  experience: string;
  avatar: string;
  rating: number;
  quote: string;
  achievement: string;
  verified: boolean;
}

interface StatBarProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color?: string;
}

const StatBar: React.FC<StatBarProps> = ({ icon, value, label, color = 'text-primary' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);
  const targetCount = parseInt(value.replace(/\D/g, ''));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`stat-${label.replace(/\s+/g, '-')}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [isVisible, label]);

  useEffect(() => {
    if (isVisible && targetCount > 0) {
      const duration = 2000;
      const steps = 60;
      const increment = targetCount / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetCount) {
          current = targetCount;
          clearInterval(timer);
        }
        setCount(Math.floor(current));
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isVisible, targetCount]);

  return (
    <div
      id={`stat-${label.replace(/\s+/g, '-')}`}
      className="text-center"
    >
      <div className={`text-3xl font-bold ${color} mb-1`}>
        {value.includes('%') ? `${count}%` : value.includes('+') ? `${count.toLocaleString()}+` : count.toLocaleString()}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
};

interface AwardBadgeProps {
  name: string;
  issuer: string;
  year: string;
  icon?: React.ReactNode;
}

const AwardBadge: React.FC<AwardBadgeProps> = ({ name, issuer, year, icon }) => {
  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors">
      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
        {icon || <Award className="h-6 w-6 text-primary" />}
      </div>
      <h4 className="text-sm font-semibold text-foreground text-center">{name}</h4>
      <p className="text-xs text-muted-foreground text-center">{issuer}</p>
      <p className="text-xs text-primary font-medium">{year}</p>
    </div>
  );
};

interface TestimonialsProps {
  className?: string;
}

const Testimonials: React.FC<TestimonialsProps> = ({ className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Professional Day Trader',
      experience: '5+ years trading',
      avatar: '/images/testimonials/sarah.jpg',
      rating: 5,
      quote: 'TradeX Pro has completely transformed my trading. The realistic practice environment helped me develop consistent strategies without risking real capital. Increased my win rate by 40% using the practice mode.',
      achievement: 'Increased win rate by 40%',
      verified: true
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      role: 'Investment Analyst',
      experience: '8+ years trading',
      avatar: '/images/testimonials/marcus.jpg',
      rating: 5,
      quote: 'The educational resources are outstanding. From the comprehensive trading academy to the expert webinars, I\'ve learned more in 3 months than in years of self-study. Completed the Advanced Technical Analysis course.',
      achievement: 'Completed Advanced Technical Analysis',
      verified: true
    },
    {
      id: '3',
      name: 'Emily Watson',
      role: 'Beginner Trader',
      experience: '6 months trading',
      avatar: '/images/testimonials/emily.jpg',
      rating: 4,
      quote: 'As a complete beginner, I was intimidated by trading. TradeX Pro made it accessible and fun. The risk-free environment and excellent educational content helped me build consistent strategies over 6 months.',
      achievement: 'Built consistent strategy over 6 months',
      verified: true
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'Swing Trader',
      experience: '3+ years trading',
      avatar: '/images/testimonials/david.jpg',
      rating: 5,
      quote: 'The multi-asset capabilities are incredible. I can trade forex, stocks, and crypto all from one platform. The research tools and market analysis helped me successfully diversify across 5 asset classes.',
      achievement: 'Successfully diversified across 5 asset classes',
      verified: true
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      role: 'Trading Educator',
      experience: '10+ years trading',
      avatar: '/images/testimonials/lisa.jpg',
      rating: 5,
      quote: 'I recommend TradeX Pro to all my students. The platform\'s educational value is exceptional, and the practice environment is perfect for learning. I\'ve recommended this platform to 100+ students.',
      achievement: 'Recommended platform to 100+ students',
      verified: true
    },
    {
      id: '6',
      name: 'James Mitchell',
      role: 'Algorithm Developer',
      experience: '7+ years trading',
      avatar: '/images/testimonials/james.jpg',
      rating: 4,
      quote: 'The advanced charting and technical indicators are exactly what I need for strategy development. I\'ve successfully backtested 50+ strategies using the platform\'s professional tools.',
      achievement: 'Backtested 50+ strategies successfully',
      verified: true
    }
  ];

  const awards = [
    {
      name: 'Best Trading Platform',
      issuer: 'Finance Awards',
      year: '2024',
      icon: <Trophy className="h-6 w-6 text-primary" />
    },
    {
      name: 'Educational Excellence',
      issuer: 'Trading Academy',
      year: '2024',
      icon: <Star className="h-6 w-6 text-primary" />
    },
    {
      name: 'Most Innovative Platform',
      issuer: 'FinTech Weekly',
      year: '2023',
      icon: <Award className="h-6 w-6 text-primary" />
    },
    {
      name: 'User Choice Award',
      issuer: 'Trader Magazine',
      year: '2023',
      icon: <Users className="h-6 w-6 text-primary" />
    },
    {
      name: 'Security Excellence',
      issuer: 'Cyber Security Awards',
      year: '2023',
      icon: <Shield className="h-6 w-6 text-primary" />
    },
    {
      name: 'Best Customer Support',
      issuer: 'Service Awards',
      year: '2022',
      icon: <Headphones className="h-6 w-6 text-primary" />
    }
  ];

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, testimonials.length]);

  const visibleTestimonials = [];
  for (let i = 0; i < 3; i++) {
    const index = (currentIndex + i) % testimonials.length;
    visibleTestimonials.push(testimonials[index]);
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
        }`}
      />
    ));
  };

  return (
    <section className={`py-20 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 fade-in-up visible">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            What Our
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {' '}Traders Say
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Join thousands of successful traders who have transformed their
            trading journey with TradeX Pro's professional platform and education.
          </p>
        </div>

        {/* Trust Score Display */}
        <div className="text-center mb-16 fade-in-up visible">
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
            <div className="text-center">
              <div className="text-5xl font-bold text-foreground mb-2">4.8</div>
              <div className="text-lg text-muted-foreground mb-2">out of 5</div>
              <div className="flex justify-center mb-2">{renderStars(5)}</div>
              <div className="text-sm text-muted-foreground">
                Based on 2,500+ verified reviews
              </div>
            </div>
            <div className="h-16 w-px bg-border/50" />
            <div className="text-center space-y-3">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Verified Traders</span>
              </div>
              <div className="flex items-center gap-2 text-blue-500">
                <Award className="h-5 w-5" />
                <span className="font-medium">Recommended by Experts</span>
              </div>
              <div className="flex items-center gap-2 text-purple-500">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Proven Results</span>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            {visibleTestimonials.map((testimonial, index) => (
              <Card
                key={testimonial.id}
                className={`
                  card-hover bg-card border-border/50
                  ${index === 1 ? 'ring-2 ring-primary/20' : ''}
                  fade-in-up visible
                `}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    {testimonial.verified && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex mb-3">{renderStars(testimonial.rating)}</div>

                  {/* Quote */}
                  <div className="relative mb-4">
                    <Quote className="absolute -top-2 -left-2 h-6 w-6 text-primary/20" />
                    <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                      {testimonial.quote}
                    </p>
                  </div>

                  {/* Achievement */}
                  <div className="p-3 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
                    <p className="text-xs font-medium text-green-400">
                      {testimonial.achievement}
                    </p>
                  </div>

                  {/* Experience */}
                  <div className="mt-3 text-xs text-muted-foreground">
                    {testimonial.experience}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              className="hover:bg-primary/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              className="hover:bg-primary/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatBar
              icon={<Users className="h-5 w-5 text-primary" />}
              value="94%"
              label="Would recommend"
              color="text-green-500"
            />
            <StatBar
              icon={<Star className="h-5 w-5 text-primary" />}
              value="4.8/5"
              label="Average rating"
              color="text-yellow-500"
            />
            <StatBar
              icon={<Users className="h-5 w-5 text-primary" />}
              value="2,500+"
              label="Verified reviews"
              color="text-blue-500"
            />
            <StatBar
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              value="1,000+"
              label="Success stories"
              color="text-purple-500"
            />
          </div>
        </div>

        {/* Awards & Certifications */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Awards & Recognition</h3>
            <p className="text-muted-foreground">
              Industry recognition for excellence in trading technology
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {awards.map((award, index) => (
              <AwardBadge
                key={index}
                {...award}
              />
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground/60">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Independent Reviews</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <span>Verified Users</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-purple-500" />
            <span>Industry Awards</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <span>Proven Results</span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12 fade-in-up visible">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">
              Join Our Community of Successful Traders
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start your journey with thousands of traders who have already transformed
              their trading with TradeX Pro.
            </p>
            <Button size="lg" className="btn-hover-lift">
              <span className="flex items-center gap-2">
                Start Trading Free
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;