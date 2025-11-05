import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Star, Users, Zap, Shield } from 'lucide-react';

interface EnhancedCTAProps {
  className?: string;
}

const EnhancedCTA: React.FC<EnhancedCTAProps> = ({ className = '' }) => {
  const benefits = [
    {
      icon: <Zap className="h-4 w-4 text-green-500" />,
      text: 'Instant Setup'
    },
    {
      icon: <Star className="h-4 w-4 text-yellow-500" />,
      text: '$50,000 Virtual Funds'
    },
    {
      icon: <Shield className="h-4 w-4 text-blue-500" />,
      text: 'Professional Platform'
    }
  ];

  const trustMetrics = [
    { icon: <Users className="h-4 w-4" />, text: '2M+ Traders Worldwide' },
    { icon: <CheckCircle className="h-4 w-4" />, text: 'No Credit Card Required' },
    { icon: <Shield className="h-4 w-4" />, text: 'Bank-Grade Security' }
  ];

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Background with animated gradient */}
      <div className="absolute inset-0 cta-gradient-bg">
        {/* Decorative particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
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

        {/* Additional gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-purple-900/20 animate-gradient" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Floating Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/30 animate-float">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-primary font-medium">Join 2M+ Traders Worldwide</span>
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-foreground via-white to-primary/80 bg-clip-text text-transparent">
              Ready to Start Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
              Trading Journey?
            </span>
          </h2>

          {/* Supporting Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Practice with <span className="text-primary font-semibold">$50,000 virtual capital</span>.
            Zero risk. Real market conditions. Professional tools.
          </p>

          {/* Benefits List */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-background/20 backdrop-blur-sm rounded-xl border border-border/30"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                {benefit.icon}
                <span className="font-medium text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Primary CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/register">
              <Button
                size="lg"
                className="btn-hover-lift text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 group"
              >
                <span className="flex items-center gap-3">
                  Start Trading Free Today
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>

          {/* Secondary Links */}
          <div className="flex items-center justify-center gap-8 text-sm">
            <Link
              to="/faq"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Browse FAQ
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link
              to="/contact"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Contact Support
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground/60 pt-8 border-t border-border/20">
            {trustMetrics.map((metric, index) => (
              <div key={index} className="flex items-center gap-2">
                {metric.icon}
                <span>{metric.text}</span>
              </div>
            ))}
          </div>

          {/* Risk Disclaimer */}
          <div className="text-center text-xs text-muted-foreground/60 max-w-2xl mx-auto">
            <p className="mb-2">
              <strong>Important:</strong> TradeX Pro is a simulated trading platform for educational purposes only.
              No real funds are involved. Trading involves risk, and past performance is not indicative of future results.
            </p>
            <p>
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Side decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-green-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* CSS for specific animations */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(37, 99, 235, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(37, 99, 235, 0.6);
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default EnhancedCTA;