import { trackCustomMetric } from '@/hooks/useWebVitalsEnhanced';

export interface ExperimentVariant {
  id: string;
  name: string;
  weight: number; // Traffic allocation percentage
  isControl?: boolean; // Explicit flag to mark control variant (fallback: first variant)
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
  private computedResults: Map<string, ExperimentResult[]> = new Map(); // experimentId -> computed results with improvement and significance

  static getInstance(): ExperimentManager {
    if (!ExperimentManager.instance) {
      ExperimentManager.instance = new ExperimentManager();
    }
    return ExperimentManager.instance;
  }

  private constructor() {
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
      import('@/lib/logger')
        .then(({ logger }) => {
          logger.warn('Failed to load experiments from storage', {
            component: 'ExperimentManager',
            action: 'load_from_storage',
            metadata: { error },
          });
        })
        .catch(() => {
          // Fallback if logger fails to load
        });
    }
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.experiments);
      localStorage.setItem('ab_experiments', JSON.stringify(data));
    } catch (error) {
      import('@/lib/logger')
        .then(({ logger }) => {
          logger.warn('Failed to save experiments to storage', {
            component: 'ExperimentManager',
            action: 'save_to_storage',
            metadata: { error },
          });
        })
        .catch(() => {
          // Fallback if logger fails to load
        });
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
    const id = `exp_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;
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
    if (!variant) {
      // No variants available, return null
      return null;
    }

    this.userVariants.set(cacheKey, variant.id);

    // Track participant
    this.trackParticipant(experimentId, variant.id);

    return variant;
  }

  private selectWeightedVariant(
    variants: ExperimentVariant[],
    userId: string
  ): ExperimentVariant | null {
    // Guard against empty variants array
    if (!variants || variants.length === 0) {
      return null;
    }

    // Use user ID for consistent assignment
    const hash = this.hashString(userId);
    const normalizedHash = hash / 0xffffffff; // Normalize to 0-1

    // Compute total weight from variants
    const totalWeight = variants.reduce(
      (sum, variant) => sum + variant.weight,
      0
    );

    // If total weight is zero or negative, treat as equal distribution
    if (totalWeight <= 0) {
      // Equal distribution - return variant based on hash
      const index = Math.floor(normalizedHash * variants.length);
      return variants[index] || null;
    }

    // Normalize weights and use cumulative comparison
    let cumulativeWeight = 0;
    for (const variant of variants) {
      cumulativeWeight += variant.weight / totalWeight;
      if (normalizedHash <= cumulativeWeight) {
        return variant;
      }
    }

    // This should not happen with proper normalization, but fallback to first variant
    return variants[0] || null;
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

    // Clear cached computed results since data has changed
    this.computedResults.delete(experimentId);

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

  private unloadHandler: (() => void) | null = null;
  private engagementStartTime: number = 0;
  private cumulativeEngagement: number = 0;

  private trackEngagement() {
    if (document.hidden) {
      // Page is becoming hidden - stop timing and add to cumulative
      if (this.engagementStartTime > 0) {
        const timeSpent = performance.now() - this.engagementStartTime;
        this.cumulativeEngagement += timeSpent;
        this.engagementStartTime = 0;
      }
    } else {
      // Page is becoming visible - start timing if not already started
      if (this.engagementStartTime === 0) {
        this.engagementStartTime = performance.now();
      }
    }

    // Ensure unload handler is registered (persistent, not once)
    if (!this.unloadHandler) {
      this.unloadHandler = () => {
        // Calculate final engagement time including any in-progress interval
        let finalEngagementTime = this.cumulativeEngagement;
        if (this.engagementStartTime > 0) {
          finalEngagementTime += performance.now() - this.engagementStartTime;
        }
        trackCustomMetric(
          'engagement_time',
          finalEngagementTime,
          'User Behavior'
        );
      };
      window.addEventListener('beforeunload', this.unloadHandler);
    }
  }

  getResults(experimentId: string): ExperimentResult[] {
    // Return cached computed results if available
    const cachedResults = this.computedResults.get(experimentId);
    if (cachedResults) {
      return cachedResults;
    }

    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      return [];
    }

    const conversions = this.conversionData.get(experimentId) || new Map();
    const participants = this.participantData.get(experimentId) || new Map();

    const baseResults = experiment.variants.map((variant) => {
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
        significance: 'not_significant' as const,
      };
    });

    // Calculate and persist improvement and significance
    const computedResults = this.calculateSignificance(
      experimentId,
      baseResults
    );
    this.computedResults.set(experimentId, computedResults);

    return computedResults;
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

  /**
   * Calculate statistical significance and improvement metrics for experiment results
   *
   * @param experimentId - The ID of the experiment
   * @param results - Array of experiment results to calculate metrics for
   * @returns Updated results with improvement and significance calculated
   *
   * @remarks
   * Control variant detection:
   * 1. First tries to find a variant explicitly marked with isControl: true
   * 2. Falls back to the first variant if no explicit control is found
   * 3. Logs a warning if no control can be determined
   *
   * Improvement is calculated as percentage difference from control:
   * ((variantRate - controlRate) / controlRate) * 100
   */
  private calculateSignificance(
    experimentId: string,
    results: ExperimentResult[]
  ): ExperimentResult[] {
    // Find the control variant (explicitly marked or first variant as fallback)
    const control =
      results.find((r) => {
        const experiment = this.experiments.get(experimentId);
        const variant = experiment?.variants.find((v) => v.id === r.variantId);
        return variant?.isControl === true;
      }) || results[0]; // Fallback to first variant if no explicit control

    if (!control) {
      // Log warning about missing control
      import('@/lib/logger')
        .then(({ logger }) => {
          logger.warn('No control variant found for experiment', {
            component: 'ExperimentManager',
            action: 'calculate_significance',
            metadata: { experimentId },
          });
        })
        .catch(() => {});
      return results;
    }

    // Calculate improvement for each variant and update in place
    return results.map((result) => {
      if (result.variantId === control.variantId) {
        return {
          ...result,
          improvement: 0, // Control has no improvement
          significance: 'not_significant' as const,
        };
      }

      const improvement =
        control.conversionRate > 0
          ? ((result.conversionRate - control.conversionRate) /
              control.conversionRate) *
            100
          : 0;

      const significance = this.determineSignificance(
        result.confidence,
        improvement
      );

      return {
        ...result,
        improvement,
        significance,
      };
    });
  }

  private checkSignificance(experimentId: string): void {
    // Force recalculation of significance by clearing cache and getting fresh results
    this.computedResults.delete(experimentId);
    const results = this.getResults(experimentId);

    // If significant improvement found, could trigger auto-pause or notification
    const significantVariant = results.find(
      (r: ExperimentResult) => r.significance === 'significant'
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
        totalParticipants: results.reduce(
          (sum: number, r: ExperimentResult) => sum + r.participants,
          0
        ),
        totalConversions: results.reduce(
          (sum: number, r: ExperimentResult) => sum + r.conversions,
          0
        ),
        bestPerformingVariant: results.reduce(
          (best: ExperimentResult | null, current: ExperimentResult) =>
            !best || current.conversionRate > best.conversionRate
              ? current
              : best,
          null
        ),
      },
    };

    // Store report (in real implementation, would send to analytics service)
    import('@/lib/logger')
      .then(({ logger }) => {
        logger.info(`Experiment Report: ${experiment.name}`, {
          component: 'ExperimentManager',
          action: 'generate_report',
          metadata: { report },
        });
      })
      .catch(() => {
        // Fallback if logger fails to load
      });
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
