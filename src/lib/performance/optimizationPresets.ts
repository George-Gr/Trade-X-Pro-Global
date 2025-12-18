/**
 * Pre-configured optimization presets for performance, A/B testing, and accessibility settings.
 * Each preset contains performance monitoring thresholds, feature flags, and configuration options.
 *
 * @typedef {Object} PresetConfig
 * @property {Object} performance - Performance optimization settings
 * @property {boolean} performance.enableMonitoring - Enable performance metrics tracking
 * @property {boolean} performance.enableWebVitals - Enable Web Vitals monitoring (LCP, FID, CLS)
 * @property {boolean} performance.enablePreloading - Enable module preloading
 * @property {Object} performance.customThresholds - Custom performance thresholds
 * @property {number} performance.customThresholds.lighthouse - Target Lighthouse score
 * @property {Object} performance.customThresholds.webVitals - Web Vitals thresholds (lcp, fid, cls)
 * @property {Object} abTesting - A/B testing configuration
 * @property {boolean} abTesting.enableTesting - Enable A/B testing features
 * @property {boolean} abTesting.autoInitializeExperiments - Auto-initialize experiments
 * @property {Object} accessibility - Accessibility enhancement settings
 * @property {boolean} accessibility.enableEnhancedFeatures - Enable enhanced accessibility features
 * @property {boolean} accessibility.enableSettingsPanel - Enable accessibility settings panel
 */
export const OPTIMIZATION_PRESETS = {
  // Maximum performance preset
  maximumPerformance: {
    performance: {
      enableMonitoring: true,
      enableWebVitals: true,
      enablePreloading: true,
      customThresholds: {
        lighthouse: 90,
        webVitals: {
          lcp: 2500,
          fid: 100,
          cls: 0.1,
        },
      },
    },
    abTesting: {
      enableTesting: true,
      autoInitializeExperiments: true,
    },
    accessibility: {
      enableEnhancedFeatures: true,
      enableSettingsPanel: true,
    },
  },

  // Balanced preset
  balanced: {
    performance: {
      enableMonitoring: true,
      enableWebVitals: true,
      enablePreloading: false,
      customThresholds: {
        lighthouse: 80,
        webVitals: {
          lcp: 4000,
          fid: 300,
          cls: 0.25,
        },
      },
    },
    abTesting: {
      enableTesting: true,
      autoInitializeExperiments: false,
    },
    accessibility: {
      enableEnhancedFeatures: true,
      enableSettingsPanel: false,
    },
  },

  // Minimal preset
  minimal: {
    performance: {
      enableMonitoring: false,
      enableWebVitals: false,
      enablePreloading: false,
      customThresholds: {
        lighthouse: 60,
        webVitals: {
          lcp: 6000,
          fid: 500,
          cls: 0.5,
        },
      },
    },
    abTesting: {
      enableTesting: false,
      autoInitializeExperiments: false,
    },
    accessibility: {
      enableEnhancedFeatures: false,
      enableSettingsPanel: false,
    },
  },
};
