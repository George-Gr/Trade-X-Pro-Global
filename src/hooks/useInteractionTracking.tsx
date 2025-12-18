import { useAnalytics } from '../lib/analytics/AnalyticsManager';

/**
 * Hook for tracking user interactions with a specific component.
 * Provides methods to track clicks, form submissions, scroll events, and conversions.
 * Automatically prefixes events with the component name for organized analytics.
 *
 * @param componentName - The name of the component being tracked (e.g., 'TradingForm', 'Dashboard')
 * @returns Object with tracking methods:
 *   - trackClick: Track button/link clicks
 *   - trackFormSubmit: Track form submission success/failure
 *   - trackScroll: Track scroll depth
 *   - trackConversion: Track conversion events with optional value
 *
 * @example
 * const { trackClick, trackFormSubmit } = useInteractionTracking('TradingForm');
 * trackClick('submit_button');
 * trackFormSubmit('order_form', true, { orderValue: 1000 });
 */
export function useInteractionTracking(componentName: string) {
  const { trackCustomEvent } = useAnalytics();

  const trackClick = (element: string, metadata?: Record<string, unknown>) => {
    trackCustomEvent(`${componentName}_click`, {
      element,
      timestamp: Date.now(),
      ...metadata,
    });
  };

  const trackFormSubmit = (
    formName: string,
    success: boolean,
    metadata?: Record<string, unknown>
  ) => {
    trackCustomEvent(`${componentName}_form_submit`, {
      formName,
      success,
      timestamp: Date.now(),
      ...metadata,
    });
  };

  const trackScroll = (depth: number, metadata?: Record<string, unknown>) => {
    trackCustomEvent(`${componentName}_scroll`, {
      depth,
      timestamp: Date.now(),
      ...metadata,
    });
  };

  const trackConversion = (
    conversionName: string,
    value?: number,
    metadata?: Record<string, unknown>
  ) => {
    trackCustomEvent(`${componentName}_conversion`, {
      conversionName,
      value,
      component: componentName,
      timestamp: Date.now(),
      ...metadata,
    });
  };

  return {
    trackClick,
    trackFormSubmit,
    trackScroll,
    trackConversion,
  };
}
