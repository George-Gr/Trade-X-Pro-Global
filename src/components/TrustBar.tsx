import React, { useState, useEffect, useRef } from 'react';
import { Users, DollarSign, Calendar, Shield, Trophy } from 'lucide-react';

interface TrustMetricProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  suffix?: string;
  targetNumber?: number;
  duration?: number;
}

const TrustMetric: React.FC<TrustMetricProps> = ({
  icon,
  value,
  label,
  suffix = '',
  targetNumber,
  duration = 2000
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const metricRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            setIsVisible(true);
            hasAnimated.current = true;
          }
        });
      },
      { threshold: 0.1 }
    );

    if (metricRef.current) {
      observer.observe(metricRef.current);
    }

    return () => {
      if (metricRef.current) {
        observer.unobserve(metricRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible && targetNumber && !hasAnimated.current) {
      const startTime = Date.now();
      const endTime = startTime + duration;

      const updateCounter = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(targetNumber * easeOutQuart);

        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };

      requestAnimationFrame(updateCounter);
    }
  }, [isVisible, targetNumber, duration, hasAnimated]);

  // Format the display value
  const formatValue = (val: number, originalValue: string) => {
    if (originalValue.includes('M')) {
      return `${(val / 1000000).toFixed(0)}M+`;
    }
    if (originalValue.includes('B')) {
      return `${(val / 1000000000).toFixed(0)}B+`;
    }
    if (originalValue.includes('+')) {
      return `${val}+`;
    }
    return `${val}${suffix}`;
  };

  return (
    <div
      ref={metricRef}
      className={`
        trust-counter flex flex-col items-center space-y-3
        ${isVisible ? 'visible' : ''}
      `}
    >
      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full border border-primary/20 mb-2">
        {icon}
      </div>
      <div className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">
        {targetNumber ? formatValue(displayValue, value) : value}
      </div>
      <div className="text-sm md:text-base text-muted-foreground text-center max-w-xs">
        {label}
      </div>
    </div>
  );
};

interface TrustBarProps {
  className?: string;
}

const TrustBar: React.FC<TrustBarProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (barRef.current) {
      observer.observe(barRef.current);
    }

    return () => {
      if (barRef.current) {
        observer.unobserve(barRef.current);
      }
    };
  }, []);

  const trustMetrics = [
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      value: '2M+',
      label: 'Active Traders',
      targetNumber: 2000000,
      duration: 2000
    },
    {
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      value: '$500B+',
      label: 'Trading Volume',
      targetNumber: 500000000000,
      duration: 2500
    },
    {
      icon: <Calendar className="h-6 w-6 text-primary" />,
      value: '15+',
      label: 'Years in Business',
      targetNumber: 15,
      duration: 1500
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      value: '6',
      label: 'Regulated Jurisdictions',
      targetNumber: 6,
      duration: 1200
    },
    {
      icon: <Trophy className="h-6 w-6 text-primary" />,
      value: '30+',
      label: 'Industry Awards',
      targetNumber: 30,
      duration: 1800
    }
  ];

  return (
    <section
      ref={barRef}
      className={`
        relative bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95
        backdrop-blur-md border-y border-border/50
        ${className}
      `}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className={`
          grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12
          ${isVisible ? 'fade-in-up visible' : 'fade-in-up'}
        `}>
          {trustMetrics.map((metric, index) => (
            <div
              key={index}
              className={`
                trust-counter visible
                delay-${(index + 1) * 100}
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <TrustMetric {...metric} />
            </div>
          ))}
        </div>

        {/* Bottom trust indicators */}
        <div className="mt-8 pt-8 border-t border-border/30">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground/80">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span>FCA Regulated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span>CySEC Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
              <span>ASIC Licensed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
              <span>Segregated Funds</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span>Negative Balance Protection</span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animation */}
      <style jsx>{`
        .trust-counter.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>
    </section>
  );
};

export default TrustBar;