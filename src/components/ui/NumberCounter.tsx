import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface NumberCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  animation?: boolean;
  format?: 'number' | 'currency' | 'percentage';
}

/**
 * NumberCounter Component
 *
 * Animated number counting component for stats and metrics.
 * Smoothly counts from 0 to the target value with various formatting options.
 *
 * Usage:
 * <NumberCounter value={1234.56} duration={2000} decimals={2} />
 * <NumberCounter value={98.7} suffix="%" format="percentage" />
 * <NumberCounter value={50000} prefix="$" format="currency" />
 */
export const NumberCounter: React.FC<NumberCounterProps> = ({
  value,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  animation = true,
  format = 'number',
}) => {
  const [count, setCount] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!animation || !isInView) {
      setCount(value);
      return;
    }

    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      const current = easeOutQuart * value;
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [value, duration, animation, isInView]);

  const formatValue = (val: number): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(val);

      case 'percentage':
        return new Intl.NumberFormat('en-US', {
          style: 'percent',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(val / 100);

      default:
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(val);
    }
  };

  const displayValue =
    format === 'currency' || format === 'percentage'
      ? formatValue(count)
      : `${prefix}${formatValue(count)}${suffix}`;

  return (
    <div
      ref={containerRef}
      className={cn(
        'font-bold text-foreground transition-colors duration-300',
        animation && 'animate-number-count',
        className
      )}
      style={{
        animationDuration: `${duration}ms`,
        transform: animation ? 'none' : undefined,
      }}
    >
      {displayValue}
    </div>
  );
};

// Compact version for smaller displays
export const CompactNumberCounter: React.FC<NumberCounterProps> = (props) => {
  return (
    <NumberCounter
      {...props}
      className={cn('text-lg font-semibold', props.className)}
    />
  );
};

// Large display version for dashboards
export const LargeNumberCounter: React.FC<NumberCounterProps> = (props) => {
  return (
    <NumberCounter
      {...props}
      className={cn(
        'text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent',
        props.className
      )}
    />
  );
};
