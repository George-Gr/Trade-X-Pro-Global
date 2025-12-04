import { animated, useScroll, useSpring } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';
import Aurora from './Aurora';

interface ParallaxAuroraBackgroundProps {
  speed?: number;
  intensity?: number;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const ParallaxAuroraBackground = ({
  speed = 0.3,
  intensity = 1,
  className = '',
  style = {},
  disabled = false,
  children
}: ParallaxAuroraBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Use useScroll for smooth, performant scroll tracking
  const { scrollYProgress } = useScroll({
    container: disabled ? undefined : (containerRef as React.MutableRefObject<HTMLElement>)
  });

  // Create smooth parallax animation for the background
  const backgroundAnimation = useSpring({
    transform: isInView ? `translateY(${scrollYProgress.to(p => p * speed * 150)}px)` : 'translateY(0px)',
    opacity: isInView ? 1 : 0,
    config: { mass: 1, tension: 280, friction: 120 },
    immediate: disabled
  });

  // Aurora intensity animation based on scroll
  const auroraIntensity = useSpring({
    amplitude: isInView ? intensity : 0,
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
        rootMargin: '300px',
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
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
        willChange: 'transform'
      }}
    >
      {/* Aurora Background */}
      <animated.div
        style={{
          position: 'absolute',
          inset: 0,
          transform: backgroundAnimation.transform.to(t => t),
          opacity: backgroundAnimation.opacity.to(o => o),
          willChange: 'transform, opacity',
          filter: 'blur(2px)',
          zIndex: 0
        }}
      >
        <Aurora
          style={{
            filter: `brightness(${auroraIntensity.amplitude.to(a => 0.8 + a * 0.4)}) saturate(${auroraIntensity.amplitude.to(a => 1 + a * 0.2)})`
          }}
        />
      </animated.div>

      {/* Content Layer */}
      <animated.div
        style={{
          position: 'relative',
          zIndex: 1,
          transform: backgroundAnimation.transform.to(t => `translateY(${scrollYProgress.to(p => p * speed * 50)}px)`),
          willChange: 'transform'
        }}
      >
        {children}
      </animated.div>
    </div>
  );
};