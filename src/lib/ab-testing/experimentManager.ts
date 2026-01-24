/**
 * A/B Testing Experiment Manager
 * Comprehensive experiment management for A/B testing
 */

export interface ExperimentVariant {
  id: string;
  name: string;
  weight: number;
  data?: Record<string, unknown>;
}

export interface Experiment {
  id: string;
  name: string;
  variants: ExperimentVariant[];
  activeVariant: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface ExperimentResult {
  experimentId: string;
  variantId: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
}

export interface ExperimentManager {
  getExperiment: (id: string) => Experiment | null;
  getVariant: (experimentId: string) => string;
  trackEvent: (experimentId: string, event: string, data?: Record<string, unknown>) => void;
  trackConversion: (experimentId: string, conversionValue?: number) => void;
  isFeatureEnabled: (featureId: string) => boolean;
  getActiveExperiments: () => Experiment[];
  getResults: (experimentId: string) => ExperimentResult | null;
  createExperiment: (experiment: Omit<Experiment, 'activeVariant'>) => Experiment;
}

const experiments: Map<string, Experiment> = new Map();
const results: Map<string, ExperimentResult> = new Map();

export function createExperimentManager(): ExperimentManager {
  return {
    getExperiment: (id: string) => experiments.get(id) ?? null,
    
    getVariant: (experimentId: string) => {
      const experiment = experiments.get(experimentId);
      return experiment?.activeVariant ?? 'control';
    },
    
    trackEvent: (_experimentId: string, _event: string, _data?: Record<string, unknown>) => {
      // Tracking stub - would integrate with analytics
      console.debug('[AB Test] Event tracked:', _experimentId, _event);
    },
    
    trackConversion: (experimentId: string, _conversionValue?: number) => {
      const result = results.get(experimentId);
      if (result) {
        result.conversions++;
        result.conversionRate = result.conversions / result.impressions;
      }
    },
    
    isFeatureEnabled: (_featureId: string) => true,
    
    getActiveExperiments: () => Array.from(experiments.values()).filter(e => e.isActive),
    
    getResults: (experimentId: string) => results.get(experimentId) ?? null,
    
    createExperiment: (experiment: Omit<Experiment, 'activeVariant'>) => {
      const activeVariant = experiment.variants[0]?.id ?? 'control';
      const fullExperiment: Experiment = {
        ...experiment,
        activeVariant,
      };
      experiments.set(experiment.id, fullExperiment);
      results.set(experiment.id, {
        experimentId: experiment.id,
        variantId: activeVariant,
        impressions: 0,
        conversions: 0,
        conversionRate: 0,
      });
      return fullExperiment;
    },
  };
}

export const experimentManager = createExperimentManager();

export function useExperiment(experimentId: string): { 
  variant: string; 
  trackEvent: (event: string) => void;
  trackConversion: () => void;
} {
  const variant = experimentManager.getVariant(experimentId);
  return {
    variant,
    trackEvent: (event: string) => experimentManager.trackEvent(experimentId, event),
    trackConversion: () => experimentManager.trackConversion(experimentId),
  };
}

export { ExperimentVariant as Variant };
export default experimentManager;
