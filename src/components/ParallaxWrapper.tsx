import { animated, useScroll, useSpring } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';

interface ParallaxWrapperProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const ParallaxWrapper = ({
  children,
  speed = 0.5,
  className = '',
  style = {},
  disabled = false
}: ParallaxWrapperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Use useScroll for smooth, performant scroll tracking
  const { scrollYProgress } = useScroll({
    container: disabled ? undefined : (containerRef as React.MutableRefObject<HTMLElement>)
  });

  // Create smooth parallax animation
  const parallaxAnimation = useSpring({
    transform: isInView ? `translateY(${scrollYProgress.to(p => p * speed * 100)}px)` : 'translateY(0px)',
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
        rootMargin: '200px',
        threshold: 0.1
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [disabled]);

  return (
    <div ref={containerRef} className={className} style={style}>
      <animated.div
        style={{
          ...parallaxAnimation,
          willChange: 'transform',
          transform: parallaxAnimation.transform.to(t => t)
        }}
      >
        {children}
      </animated.div>
    </div>
  );
};