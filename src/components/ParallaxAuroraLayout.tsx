import { animated, useScroll, useSpring } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';
import Aurora from './Aurora';

interface ParallaxAuroraLayoutProps {
  children: React.ReactNode;
  sections?: number;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const ParallaxAuroraLayout = ({
  children,
  sections = 6,
  className = '',
  style = {},
  disabled = false
}: ParallaxAuroraLayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Use useScroll for smooth, performant scroll tracking
  const { scrollYProgress } = useScroll({
    container: disabled ? undefined : (containerRef as React.MutableRefObject<HTMLElement>)
  });

  // Create smooth parallax animations for different layers
  const backgroundAnimation = useSpring({
    transform: isInView ? `translateY(${scrollYProgress.to(p => p * 200)}px)` : 'translateY(0px)',
    opacity: isInView ? 0.8 : 0,
    config: { mass: 1, tension: 280, friction: 120 },
    immediate: disabled
  });

  const midgroundAnimation = useSpring({
    transform: isInView ? `translateY(${scrollYProgress.to(p => p * 100)}px)` : 'translateY(0px)',
    opacity: isInView ? 0.6 : 0,
    config: { mass: 1, tension: 280, friction: 120 },
    immediate: disabled
  });

  const foregroundAnimation = useSpring({
    transform: isInView ? `translateY(${scrollYProgress.to(p => p * 50)}px)` : 'translateY(0px)',
    opacity: isInView ? 0.4 : 0,
    config: { mass: 1, tension: 280, friction: 120 },
    immediate: disabled
  });

  // Aurora intensity animation based on scroll
  const auroraIntensity = useSpring({
    amplitude: isInView ? 1 : 0,
    config: { mass: 1, tension: 280, friction: 120 },
    immediate: disabled
  });

  // Intersection Observer for performance optimization
  useEffect(() => {
    if (!containerRef.current || disabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '400px',
        threshold: 0.1
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [disabled]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-x-hidden ${className}`}
      style={{
        ...style,
        willChange: 'transform',
        scrollBehavior: 'smooth'
      }}
    >
      {/* Aurora Background Layers */}
      <animated.div
        className="fixed inset-0 pointer-events-none"
        style={{
          transform: backgroundAnimation.transform.to(t => t),
          opacity: backgroundAnimation.opacity.to(o => o),
          willChange: 'transform, opacity',
          filter: 'blur(8px)',
          zIndex: -3
        }}
      >
        <Aurora
          className="w-full h-full"
          style={{
            filter: `brightness(${auroraIntensity.amplitude.to(a => 0.6 + a * 0.4)}) saturate(${auroraIntensity.amplitude.to(a => 1 + a * 0.3)})`
          }}
        />
      </animated.div>

      {/* Midground Aurora Layer */}
      <animated.div
        className="fixed inset-0 pointer-events-none"
        style={{
          transform: midgroundAnimation.transform.to(t => t),
          opacity: midgroundAnimation.opacity.to(o => o),
          willChange: 'transform, opacity',
          filter: 'blur(4px)',
          zIndex: -2
        }}
      >
        <Aurora
          className="w-full h-full"
          style={{
            filter: `brightness(${auroraIntensity.amplitude.to(a => 0.7 + a * 0.3)}) saturate(${auroraIntensity.amplitude.to(a => 1 + a * 0.2)})`
          }}
        />
      </animated.div>

      {/* Foreground Aurora Layer */}
      <animated.div
        className="fixed inset-0 pointer-events-none"
        style={{
          transform: foregroundAnimation.transform.to(t => t),
          opacity: foregroundAnimation.opacity.to(o => o),
          willChange: 'transform, opacity',
          filter: 'blur(2px)',
          zIndex: -1
        }}
      >
        <Aurora
          className="w-full h-full"
          style={{
            filter: `brightness(${auroraIntensity.amplitude.to(a => 0.8 + a * 0.2)}) saturate(${auroraIntensity.amplitude.to(a => 1 + a * 0.1)})`
          }}
        />
      </animated.div>

      {/* Content */}
      <animated.div
        style={{
          position: 'relative',
          zIndex: 10,
          willChange: 'transform'
        }}
      >
        {children}
      </animated.div>
    </div>
  );
};