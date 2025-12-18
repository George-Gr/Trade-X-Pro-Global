import * as React from "react";
import { motion, useInView, Variants } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  once?: boolean;
  threshold?: number;
}

const getVariants = (
  direction: "up" | "down" | "left" | "right" | "none",
  distance: number,
): Variants => {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: { x: 0, y: 0 },
  };

  return {
    hidden: {
      opacity: 0,
      ...directions[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };
};

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  direction = "up",
  distance = 40,
  once = true,
  threshold = 0.2,
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const variants = getVariants(direction, distance);

  // Faster animations on mobile for better UX
  const isMobile = window.innerWidth < 768;
  const animationDuration = isMobile ? Math.min(duration, 0.4) : duration;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{
        duration: animationDuration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger container for child animations
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
  threshold?: number;
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
  once = true,
  threshold = 0.1,
}: StaggerContainerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger item for use inside StaggerContainer
interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}

export function StaggerItem({
  children,
  className = "",
  direction = "up",
  distance = 30,
}: StaggerItemProps) {
  const variants = getVariants(direction, distance);

  // Faster animations on mobile for better UX
  const isMobile = window.innerWidth < 768;
  const animationDuration = isMobile ? 0.3 : 0.5;

  return (
    <motion.div
      variants={variants}
      transition={{
        duration: animationDuration,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Section header animation preset
interface AnimatedSectionHeaderProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

export function AnimatedSectionHeader({
  badge,
  title,
  subtitle,
  description,
  className = "",
}: AnimatedSectionHeaderProps) {
  return (
    <div className={`text-center mb-16 ${className}`}>
      {badge && (
        <ScrollReveal delay={0} duration={0.4}>
          {badge}
        </ScrollReveal>
      )}
      <ScrollReveal delay={0.1} duration={0.5}>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          {title}
          {subtitle && (
            <span className="block mt-2 bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
              {subtitle}
            </span>
          )}
        </h2>
      </ScrollReveal>
      {description && (
        <ScrollReveal delay={0.2} duration={0.5}>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </ScrollReveal>
      )}
    </div>
  );
}
