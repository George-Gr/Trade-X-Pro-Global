import type { ReactNode } from 'react';
import { experimentManager } from '../../lib/ab-testing/experimentManager';

export interface CTAConfig {
  text: string;
  color: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  style: 'filled' | 'outline' | 'ghost';
  icon?: ReactNode;
  position?: 'left' | 'right' | 'center';
}

// A/B Test Configuration Helper
export function createCTAExperiment(
  name: string,
  variants: Array<{
    name: string;
    weight: number;
    config: CTAConfig;
    description?: string;
  }>
) {
  return experimentManager.createExperiment({
    id: `exp_${name.replace(/\s+/g, '_').toLowerCase()}`,
    name,
    description: `CTA optimization experiment: ${name}`,
    status: 'active',
    variants: variants.map((v, index) => ({
      id: `variant_${index}`,
      name: v.name,
      weight: v.weight,
      description: v.description,
      config: v.config as unknown as Record<string, unknown>,
    })),
    targetMetric: 'conversion_rate',
    confidence: 95,
    trafficAllocation: 100,
    metadata: {},
  });
}

// Common CTA configurations for testing
export const CTA_VARIANTS = {
  urgency: {
    primary: {
      text: 'Start Trading Now',
      color: 'primary',
      style: 'filled' as const,
      size: 'lg' as const,
    },
    urgency: {
      text: 'Limited Time: Start Trading Today',
      color: 'gold',
      style: 'filled' as const,
      size: 'lg' as const,
    },
  },
  social_proof: {
    primary: {
      text: 'Join 50,000+ Traders',
      color: 'primary',
      style: 'filled' as const,
      size: 'lg' as const,
    },
    social: {
      text: 'Join 50,000+ Successful Traders',
      color: 'success',
      style: 'filled' as const,
      size: 'lg' as const,
    },
  },
  benefit_focused: {
    primary: {
      text: 'Get Started',
      color: 'primary',
      style: 'filled' as const,
      size: 'md' as const,
    },
    benefit: {
      text: 'Start Earning Today',
      color: 'primary',
      style: 'filled' as const,
      size: 'md' as const,
    },
  },
};
