import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
}) => {
  const location = useLocation();

  // Page transition variants
  const pageVariants: Variants = {
    initial: {
      opacity: 0,
      x: 50,
      scale: 0.95,
    },
    in: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
    out: {
      opacity: 0,
      x: -50,
      scale: 0.95,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Fallback transition for reduced motion
  const reducedMotionVariants: Variants = {
    initial: { opacity: 0 },
    in: {
      opacity: 1,
      transition: { duration: 0.15 },
    },
    out: {
      opacity: 0,
      transition: { duration: 0.15 },
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        className={cn('h-full w-full', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Fallback component for when framer-motion is not available or reduced motion is preferred
export const SimplePageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
}) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className={cn('fade-in h-full w-full', className)}
    >
      {children}
    </div>
  );
};
