/**
 * Sentry Configuration with Advanced Sampling
 * 
 * Configures intelligent sampling rates for different types of errors,
 * performance monitoring, and user sessions based on environment and criticality.
 */

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from "react-router-dom";

/**
 * Environment-specific configuration
 */
const ENVIRONMENT_CONFIG = {
  development: {
    tracesSampleRate: 1.0,           // 100% of transactions in dev
    replaysSampleRate: 0.0,          // No replays in dev
    replaysOnErrorSampleRate: 0.0,   // No error replays in dev
    profilesSampleRate: 0.0,         // No profiling in dev
    errorSampleRate: 1.0,            // 100% of errors in dev
  },
  staging: {
    tracesSampleRate: 0.3,           // 30% of transactions in staging
    replaysSampleRate: 0.1,          // 10% of sessions in staging
    replaysOnErrorSampleRate: 0.5,   // 50% of error sessions in staging
    profilesSampleRate: 0.1,         // 10% of sessions for profiling
    errorSampleRate: 1.0,            // 100% of errors in staging
  },
  production: {
    tracesSampleRate: 0.1,           // 10% of transactions in production
    replaysSampleRate: 0.05,         // 5% of sessions in production
    replaysOnErrorSampleRate: 1.0,   // 100% of error sessions in production
    profilesSampleRate: 0.05,        // 5% of sessions for profiling
    errorSampleRate: 1.0,            // 100% of errors in production
  }
};

/**
 * Critical operations that should have higher sampling rates
 */
const CRITICAL_OPERATIONS = [
  'trading:place_order',
  'trading:close_position', 
  'trading:modify_order',
  'auth:login',
  'auth:logout',
  'payment:process',
  'api:critical_endpoint',
  'websocket:connection'
];

/**
 * Get environment-specific configuration
 */
function getConfig() {
  const environment = import.meta.env.MODE;
  return ENVIRONMENT_CONFIG[environment as keyof typeof ENVIRONMENT_CONFIG] || ENVIRONMENT_CONFIG.development;
}

/**
 * Custom sampling function for transactions
 */
function tracesSampler(context: Sentry.TransactionContext) {
  const config = getConfig();
  
  // Always sample critical operations at higher rate
  if (CRITICAL_OPERATIONS.some(op => context.name.includes(op))) {
    return Math.min(config.tracesSampleRate * 5, 1.0); // 5x rate, max 100%
  }
  
  // Sample user navigation more than background operations
  if (context.op === 'navigation' || context.op === 'pageload') {
    return Math.min(config.tracesSampleRate * 3, 1.0); // 3x rate
  }
  
  // Sample API calls at standard rate
  if (context.op === 'http') {
    return config.tracesSampleRate;
  }
  
  // Lower rate for background operations
  return config.tracesSampleRate * 0.5;
}

/**
 * Custom sampling function for profiles
 */
function profilesSampler(context: Sentry.ProfileContext) {
  const config = getConfig();
  
  // Only profile in production and staging
  if (import.meta.env.PROD || import.meta.env.ENV === 'staging') {
    // Higher profile rate for critical operations
    if (CRITICAL_OPERATIONS.some(op => context.transactionName?.includes(op))) {
      return Math.min(config.profilesSampleRate * 3, 0.2); // Max 20%
    }
    return config.profilesSampleRate;
  }
  
  return 0;
}

/**
 * Enhanced beforeSend function for intelligent error filtering
 */
function beforeSend(event: Sentry.Event, hint: Sentry.EventHint) {
  // Skip processing for development mode unless forced
  if (import.meta.env.DEV && !import.meta.env.VITE_FORCE_SENTRY) {
    return null;
  }
  
  // Add custom tags and context
  event.tags = {
    ...event.tags,
    platform: 'web',
    buildType: import.meta.env.DEV ? 'development' : 'production',
    criticalError: isCriticalError(event),
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  };
  
  // Add user context if available
  const userId = getUserId();
  if (userId) {
    event.user = { id: userId };
  }
  
  // Enhanced context
  event.contexts = {
    ...event.contexts,
    device: {
      ...event.contexts?.device,
      connection: (navigator as any).connection?.effectiveType || 'unknown',
      memory: (navigator as any).deviceMemory || 'unknown',
      cores: navigator.hardwareConcurrency || 'unknown',
    },
    browser: {
      name: getBrowserName(),
      version: getBrowserVersion(),
      online: navigator.onLine,
      language: navigator.language,
    },
    page: {
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
      title: document.title,
    }
  };
  
  // Intelligent error filtering
  const filteredEvent = filterErrors(event, hint);
  if (!filteredEvent) {
    return null;
  }
  
  return filteredEvent;
}

/**
 * Check if error is critical
 */
function isCriticalError(event: Sentry.Event): boolean {
  const error = event.exception?.values?.[0];
  if (!error) return false;
  
  const criticalPatterns = [
    /trading/i,
    /order/i,
    /position/i,
    /balance/i,
    /payment/i,
    /auth/i,
    /security/i,
    /crypto/i,
  ];
  
  const message = error.value || error.type || '';
  return criticalPatterns.some(pattern => pattern.test(message));
}

/**
 * Get user ID from various sources
 */
function getUserId(): string | undefined {
  // Try to get from localStorage (user session)
  try {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || user.userId;
    }
  } catch (e) {
    // Fallback to sessionStorage
    const sessionData = sessionStorage.getItem('session_id');
    if (sessionData) return sessionData;
  }
  
  return undefined;
}

/**
 * Get browser name
 */
function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Unknown';
}

/**
 * Get browser version
 */
function getBrowserVersion(): string {
  const ua = navigator.userAgent;
  const match = ua.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/);
  return match ? match[2] : 'unknown';
}

/**
 * Intelligent error filtering
 */
function filterErrors(event: Sentry.Event, hint: Sentry.EventHint): Sentry.Event | null {
  const error = event.exception?.values?.[0];
  if (!error) return event;
  
  const message = error.value || error.type || '';
  
  // Filter out common non-actionable errors
  const ignoredPatterns = [
    /ResizeObserver loop limit exceeded/,
    /Non-Error promise rejection captured/,
    /Loading chunk .* failed/,
    /Loading CSS chunk .* failed/,
    /Loading CSS.*failed/,
    /Failed to fetch.*localhost/,
    /net::ERR_CONNECTION_REFUSED/,
    /net::ERR_NAME_NOT_RESOLVED/,
    /net::ERR_INTERNET_DISCONNECTED/,
    /Request aborted/,
    /The operation was aborted/,
    /cancelled/,
  ];
  
  if (ignoredPatterns.some(pattern => pattern.test(message))) {
    return null;
  }
  
  // Filter out specific TradingView errors that are handled
  if (message.includes('Symbol.toStringTag') && message.includes('undefined')) {
    return null;
  }
  
  // Add additional context for debugging
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.slice(-20); // Keep last 20 breadcrumbs
  }
  
  return event;
}

/**
 * Enhanced beforeTransaction function
 */
function beforeTransaction(event: Sentry.Event) {
  // Add performance-related tags
  event.tags = {
    ...event.tags,
    navigationType: (performance.getEntriesByType('navigation')?.[0] as any)?.type || 'unknown',
    domContentLoaded: performance.getEntriesByType('navigation')?.[0]?.domContentLoadedEventEnd || 0,
    loadComplete: performance.getEntriesByType('navigation')?.[0]?.loadEventEnd || 0,
  };
  
  return event;
}

/**
 * Initialize Sentry with comprehensive configuration
 */
export function initializeSentryAdvanced() {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn('[Sentry] DSN not configured, skipping initialization');
    return;
  }
  
  const config = getConfig();
  
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || 'unknown',
    
    // Sampling rates
    tracesSampleRate: config.tracesSampleRate,
    replaysSessionSampleRate: config.replaysSampleRate,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,
    profilesSampleRate: config.profilesSampleRate,
    sampleRate: config.errorSampleRate,
    
    // Custom sampling functions
    tracesSampler,
    profilesSampler,
    
    integrations: [
      // Enhanced BrowserTracing with React Router
      new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6BrowserTracingIntegration(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
        // Custom tracing configuration
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/api\.tradexpro\.com\/api/,
          /^https:\/\/staging-api\.tradexpro\.com\/api/,
        ],
      }),
      // Note: Session replay, profiling, and feedback integrations removed
      // as they are not available in the current Sentry version or require
      // additional configuration. BrowserTracing handles basic performance monitoring.
    ],
    
    // Enhanced error processing
    beforeSend,
    beforeTransaction,
    
    // Additional configuration
    attachStacktrace: true,
    maxBreadcrumbs: 100,
    beforeBreadcrumb: (breadcrumb) => {
      // Filter out excessive navigation breadcrumbs
      if (breadcrumb.category === 'navigation' && Math.random() > 0.5) {
        return null;
      }
      return breadcrumb;
    },
    
    // Hook for transaction creation
    idleTimeout: 1000,
    shutdownTimeout: 2000,
    
    // Debug configuration for development
    debug: import.meta.env.DEV,
    
    // Hook for error boundaries
    autoSessionTracking: true,
    initialScope: {
      tags: {
        component: 'web-app',
        framework: 'react',
      },
    },
  });
  
  console.log('[Sentry] Advanced configuration initialized', {
    environment: import.meta.env.MODE,
    tracesSampleRate: config.tracesSampleRate,
    replaysSampleRate: config.replaysSampleRate,
  });
}

export default initializeSentryAdvanced;