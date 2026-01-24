/**
 * CTA Experiments Configuration
 * Defines A/B test variants for call-to-action elements
 */

import { experimentManager } from './experimentManager';

export interface CTAVariant {
  id: string;
  text: string;
  className?: string;
  icon?: string;
}

export interface CTAExperiment {
  id: string;
  name: string;
  variants: CTAVariant[];
  defaultVariant: string;
}

export const ctaExperiments: Record<string, CTAExperiment> = {
  'hero-cta': {
    id: 'hero-cta',
    name: 'Hero Section CTA',
    variants: [
      { id: 'control', text: 'Get Started' },
      { id: 'variant-a', text: 'Start Trading Now' },
      { id: 'variant-b', text: 'Open Free Account' },
    ],
    defaultVariant: 'control',
  },
  'signup-cta': {
    id: 'signup-cta',
    name: 'Signup Button CTA',
    variants: [
      { id: 'control', text: 'Sign Up' },
      { id: 'variant-a', text: 'Create Account' },
      { id: 'variant-b', text: 'Join Now' },
    ],
    defaultVariant: 'control',
  },
};

export function getCTAVariant(experimentId: string): CTAVariant {
  const experiment = ctaExperiments[experimentId];
  if (!experiment) {
    return { id: 'default', text: 'Get Started' };
  }
  
  const defaultVariant = experiment.variants.find(v => v.id === experiment.defaultVariant);
  return defaultVariant ?? experiment.variants[0] ?? { id: 'default', text: 'Get Started' };
}

export function initializeCTAExperiments(): void {
  Object.values(ctaExperiments).forEach(experiment => {
    experimentManager.createExperiment({
      id: experiment.id,
      name: experiment.name,
      variants: experiment.variants.map(v => ({
        id: v.id,
        name: v.text,
        weight: 1,
        data: { text: v.text, className: v.className, icon: v.icon },
      })),
      isActive: true,
    });
  });
}

export default ctaExperiments;
