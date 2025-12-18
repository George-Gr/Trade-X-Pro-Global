import { experimentManager } from "./experimentManager";

// Pre-configured CTA experiments for quick setup

/**
 * Initializes pre-configured CTA (Call-to-Action) experiments for signup and trading flows.
 * Creates two experiments with multiple variants to optimize button performance and conversions.
 *
 * @returns Array of experiment IDs: ['exp_signup_cta_optimization', 'exp_trading_cta_optimization']
 *
 * @example
 * const experimentIds = initializeCTAExperiments();
 * // Creates experiments with urgency-based, trading-focused, and conversion-optimized variants
 *
 * @sideeffects Creates experiments in the experiment manager with predefined variants and weights
 */
export function initializeCTAExperiments() {
  // Signup CTA Experiment
  const signupExperimentId = createCTAExperiment("Signup CTA Optimization", [
    {
      name: "Control",
      weight: 50,
      config: CTA_VARIANTS.urgency.primary,
    },
    {
      name: "Variant A",
      weight: 25,
      config: CTA_VARIANTS.urgency.secondary,
    },
    {
      name: "Variant B",
      weight: 25,
      config: CTA_VARIANTS.urgency.ghost,
    },
  ]);

  // Trading CTA Experiment
  const tradingExperimentId = createCTAExperiment("Trading CTA Optimization", [
    {
      name: "Control",
      weight: 50,
      config: CTA_VARIANTS.trading.primary,
    },
    {
      name: "Variant A",
      weight: 25,
      config: CTA_VARIANTS.trading.secondary,
    },
    {
      name: "Variant B",
      weight: 25,
      config: CTA_VARIANTS.trading.ghost,
    },
  ]);

  return [signupExperimentId, tradingExperimentId];
}

function createCTAExperiment(
  name: string,
  variants: Array<{
    name: string;
    weight: number;
    config: Record<string, unknown>;
  }>,
): string {
  try {
    return experimentManager.createExperiment({
      id: `exp_${name.replace(/\s+/g, "_").toLowerCase()}`,
      name,
      description: "Call-to-action button optimization experiment",
      status: "active",
      variants: variants.map((v, index) => ({
        id: `variant_${index}`,
        name: v.name,
        weight: v.weight,
        config: v.config,
      })),
      targetMetric: "conversion_rate",
      confidence: 95,
      trafficAllocation: 100,
      metadata: {},
    });
  } catch (error) {
    const errorMessage = `Failed to create CTA experiment "${name}": ${error instanceof Error ? error.message : "Unknown error"}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

const CTA_VARIANTS = {
  urgency: {
    primary: {
      text: "Start Trading Now - Limited Time Offer!",
      className:
        "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105",
      animation: "animate-pulse",
    },
    secondary: {
      text: "Join Free Trial - Act Fast!",
      className:
        "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105",
      animation: "animate-bounce",
    },
    ghost: {
      text: "Get Started Today",
      className:
        "bg-transparent text-[hsl(var(--primary))] px-6 py-3 rounded-lg font-bold border-2 border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition-all duration-200",
      animation: "animate-glow",
    },
  },
  trading: {
    primary: {
      text: "Open Live Account",
      className:
        "bg-[hsl(var(--danger))] text-[hsl(var(--danger-foreground))] px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105",
    },
    secondary: {
      text: "Start Trading",
      className:
        "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105",
    },
    ghost: {
      text: "Create Account",
      className:
        "bg-transparent text-[hsl(var(--danger))] px-6 py-3 rounded-lg font-bold border-2 border-[hsl(var(--danger))] hover:bg-[hsl(var(--danger))] hover:text-[hsl(var(--danger-foreground))] transition-all duration-200",
    },
  },
};
