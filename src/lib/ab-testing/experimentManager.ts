import { trackCustomMetric } from '../../hooks/useWebVitalsEnhanced';

export interface ExperimentVariant {
  id: string;
  name: string;
  weight: number; // Traffic allocation percentage
  description?: string;
  config?: Record<string, unknown>;
}

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed';
  variants: ExperimentVariant[];
  startDate: Date;
  endDate?: Date;
  targetMetric:
    | 'conversion_rate'
    | 'click_through_rate'
    | 'engagement_time'
    | 'bounce_rate';
  confidence: number; // Statistical confidence threshold
  trafficAllocation: number; // Total traffic percentage to include in experiment
  metadata?: Record<string, unknown>;
}

export interface ExperimentResult {
  variantId: string;
  variantName: string;
  participants: number;
  conversions: number;
  conversionRate: number;
  confidence: number;
  improvement: number; // % improvement over control
  significance: 'significant' | 'not_significant' | 'insufficient_data';
}

export class ExperimentManager {
  private static instance: ExperimentManager;
  private experiments: Map<string, Experiment> = new Map();
  private userVariants: Map<string, string> = new Map();
  private conversionData: Map<string, Map<string, number>> = new Map(); // experimentId -> variantId -> conversions
  private participantData: Map<string, Map<string, number>> = new Map(); // experimentId -> variantId -> participants

  static getInstance(): ExperimentManager {
    if (!ExperimentManager.instance) {
      ExperimentManager.instance = new ExperimentManager();
    }
    return ExperimentManager.instance;
  }

  constructor() {
    this.loadFromStorage();
    this.setupEventListeners();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('ab_experiments');
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([id, experiment]) => {
          this.experiments.set(id, experiment as Experiment);
        });
      }
    } catch (error) {
      console.warn('Failed to load experiments from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const data: Record<string, Experiment> = {};
      this.experiments.forEach((experiment, id) => {
        data[id] = experiment;
      });
      localStorage.setItem('ab_experiments', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save experiments to storage:', error);
    }
  }

  private setupEventListeners() {
    // Listen for custom events to track conversions
    document.addEventListener('ab-test-conversion', (event: Event) => {
      const customEvent = event as CustomEvent<{
        experimentId: string;
        variantId: string;
      }>;
      this.trackConversion(
        customEvent.detail.experimentId,
        customEvent.detail.variantId
      );
    });

    // Listen for page visibility changes to track engagement
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.trackEngagement();
      }
    });
  }

  createExperiment(experiment: Omit<Experiment, 'startDate'>): string {
    const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullExperiment: Experiment = {
      ...experiment,
      id,
      startDate: new Date(),
    };

    this.experiments.set(id, fullExperiment);
    this.saveToStorage();

    // Track experiment creation
    trackCustomMetric('experiment_created', 1, 'A/B Testing');

    return id;
  }

  getVariant(experimentId: string, userId: string): ExperimentVariant | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'active') {
      return null;
    }

    // Check if user already has a variant assigned
    const cacheKey = `${experimentId}_${userId}`;
    const cachedVariantId = this.userVariants.get(cacheKey);

    if (cachedVariantId) {
      return experiment.variants.find((v) => v.id === cachedVariantId) || null;
    }

    // Assign variant based on weighted random selection
    const variant = this.selectWeightedVariant(experiment.variants, userId);
    this.userVariants.set(cacheKey, variant.id);

    // Track participant
    this.trackParticipant(experimentId, variant.id);

    return variant;
  }

  private selectWeightedVariant(
    variants: ExperimentVariant[],
    userId: string
  ): ExperimentVariant {
    // Use user ID for consistent assignment
    const hash = this.hashString(userId);
    const normalizedHash = hash / 0xffffffff; // Normalize to 0-1

    let cumulativeWeight = 0;
    for (const variant of variants) {
      cumulativeWeight += variant.weight / 100;
      if (normalizedHash <= cumulativeWeight) {
        return variant;
      }
    }

    // Fallback to first variant
    return variants[0];
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  trackConversion(experimentId: string, variantId: string) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'active') {
      return;
    }

    // Update conversion data
    if (!this.conversionData.has(experimentId)) {
      this.conversionData.set(experimentId, new Map());
    }

    const conversions = this.conversionData.get(experimentId)!;
    conversions.set(variantId, (conversions.get(variantId) || 0) + 1);

    // Track conversion event
    trackCustomMetric(`${experimentId}_conversion`, 1, 'A/B Testing');

    // Check for statistical significance
    this.checkSignificance(experimentId);
  }

  private trackParticipant(experimentId: string, variantId: string) {
    if (!this.participantData.has(experimentId)) {
      this.participantData.set(experimentId, new Map());
    }

    const participants = this.participantData.get(experimentId)!;
    participants.set(variantId, (participants.get(variantId) || 0) + 1);
  }

  private trackEngagement() {
    // Track time spent on page for engagement metrics
    const startTime = performance.now();

    window.addEventListener(
      'beforeunload',
      () => {
        const timeSpent = performance.now() - startTime;
        trackCustomMetric('engagement_time', timeSpent, 'User Behavior');
      },
      { once: true }
    );
  }

  getResults(experimentId: string): ExperimentResult[] {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      return [];
    }

    const conversions = this.conversionData.get(experimentId) || new Map();
    const participants = this.participantData.get(experimentId) || new Map();

    return experiment.variants.map((variant) => {
      const variantConversions = conversions.get(variant.id) || 0;
      const variantParticipants = participants.get(variant.id) || 0;
      const conversionRate =
        variantParticipants > 0
          ? (variantConversions / variantParticipants) * 100
          : 0;

      return {
        variantId: variant.id,
        variantName: variant.name,
        participants: variantParticipants,
        conversions: variantConversions,
        conversionRate,
        confidence: this.calculateConfidence(
          variantConversions,
          variantParticipants
        ),
        improvement: 0, // Will be calculated relative to control
        significance: 'not_significant',
      };
    });
  }

  private calculateConfidence(
    conversions: number,
    participants: number
  ): number {
    if (participants === 0) return 0;

    const p = conversions / participants;
    const n = participants;
    const standardError = Math.sqrt((p * (1 - p)) / n);

    // Simplified confidence calculation (would need proper z-score for real implementation)
    return Math.min(95, (1 - standardError) * 100);
  }

  private checkSignificance(experimentId: string) {
    const results = this.getResults(experimentId);
    const control = results.find(
      (r) =>
        r.variantName.toLowerCase().includes('control') ||
        r.variantName.toLowerCase().includes('a')
    );

    if (!control) return;

    // Calculate improvement for each variant
    results.forEach((result) => {
      if (result.variantId !== control.variantId) {
        result.improvement =
          ((result.conversionRate - control.conversionRate) /
            control.conversionRate) *
          100;
        result.significance = this.determineSignificance(
          result.confidence,
          result.improvement
        );
      }
    });

    // If significant improvement found, could trigger auto-pause or notification
    const significantVariant = results.find(
      (r) => r.significance === 'significant'
    );
    if (significantVariant) {
      trackCustomMetric('significant_result', 1, 'A/B Testing');
    }
  }

  private determineSignificance(
    confidence: number,
    improvement: number
  ): 'significant' | 'not_significant' | 'insufficient_data' {
    if (confidence < 80 || Math.abs(improvement) < 5) {
      return 'insufficient_data';
    }

    return Math.abs(improvement) > 10 && confidence > 90
      ? 'significant'
      : 'not_significant';
  }

  pauseExperiment(experimentId: string) {
    const experiment = this.experiments.get(experimentId);
    if (experiment) {
      experiment.status = 'paused';
      this.saveToStorage();
    }
  }

  resumeExperiment(experimentId: string) {
    const experiment = this.experiments.get(experimentId);
    if (experiment) {
      experiment.status = 'active';
      this.saveToStorage();
    }
  }

  completeExperiment(experimentId: string) {
    const experiment = this.experiments.get(experimentId);
    if (experiment) {
      experiment.status = 'completed';
      experiment.endDate = new Date();
      this.saveToStorage();

      // Generate final report
      this.generateReport(experimentId);
    }
  }

  private generateReport(experimentId: string) {
    const results = this.getResults(experimentId);
    const experiment = this.experiments.get(experimentId);

    if (!experiment) return;

    const report = {
      experimentId,
      experimentName: experiment.name,
      startDate: experiment.startDate,
      endDate: experiment.endDate,
      results,
      summary: {
        totalParticipants: results.reduce((sum, r) => sum + r.participants, 0),
        totalConversions: results.reduce((sum, r) => sum + r.conversions, 0),
        bestPerformingVariant: results.reduce((best, current) =>
          current.conversionRate > best.conversionRate ? current : best
        ),
      },
    };

    // Store report (in real implementation, would send to analytics service)
    console.warn('Experiment Report:', report);
    trackCustomMetric('experiment_completed', 1, 'A/B Testing');
  }

  getActiveExperiments(): Experiment[] {
    return Array.from(this.experiments.values()).filter(
      (exp) => exp.status === 'active'
    );
  }

  getAllExperiments(): Experiment[] {
    return Array.from(this.experiments.values());
  }
}

// Singleton instance
export const experimentManager = ExperimentManager.getInstance();
