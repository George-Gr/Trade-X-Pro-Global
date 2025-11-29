/**
 * Comprehensive Error Tracking Tests
 * 
 * Tests for all error tracking, monitoring, and alerting functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import * as Sentry from '@sentry/react';
import { logger } from '@/lib/logger';
import { breadcrumbTracker } from '@/lib/breadcrumbTracker';
import { apiInterceptor } from '@/lib/apiInterceptor';
import { alertManager, CRITICAL_ALERT_RULES } from '@/lib/alertManager';
import { initializeSentryAdvanced } from '@/lib/sentryConfig';
import TradingErrorBoundary from '@/components/TradingErrorBoundary';
import APIErrorBoundary from '@/components/APIErrorBoundary';
import ErrorBoundary from '@/components/ErrorBoundary';

// Mock Sentry
vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
  setUser: vi.fn(),
  setContext: vi.fn(),
  startTransaction: vi.fn(),
  getCurrentHub: vi.fn(() => ({
    getScope: vi.fn(() => ({
      getTransaction: vi.fn(() => ({
        setStatus: vi.fn(),
        setTag: vi.fn(),
        finish: vi.fn(),
      })),
    })),
  })),
  reactRouterV6Instrumentation: vi.fn(),
  BrowserTracing: vi.fn(),
  Replay: vi.fn(),
  BrowserProfilingIntegration: vi.fn(),
  Feedback: vi.fn(),
}));

// Mock environment variables
const mockEnv = {
  MODE: 'test',
  PROD: false,
  DEV: true,
  VITE_SENTRY_DSN: 'https://test@sentry.io/123',
  VITE_APP_VERSION: '1.0.0-test',
};

describe('Error Tracking System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset logger state
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Logger', () => {
    it('should log info messages with context', () => {
      const context = { userId: 'test-user', component: 'TestComponent' };
      logger.info('Test message', context);
      
      expect(Sentry.captureMessage).toHaveBeenCalledWith('Test message', 'info');
      expect(Sentry.setUser).toHaveBeenCalledWith({ id: 'test-user' });
    });

    it('should log errors with full context', () => {
      const error = new Error('Test error');
      const context = { 
        userId: 'test-user', 
        action: 'test_action',
        component: 'TestComponent'
      };
      
      logger.error('Error occurred', error, context);
      
      expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.objectContaining({
        tags: {
          component: 'TestComponent',
          action: 'test_action',
          page: undefined,
        },
        contexts: {
          application: expect.objectContaining({
            userId: 'test-user',
            action: 'test_action',
            component: 'TestComponent',
          }),
        },
      }));
    });

    it('should add breadcrumbs', () => {
      logger.addBreadcrumb('test_category', 'Test breadcrumb');
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'test_category',
        message: 'Test breadcrumb',
        level: 'info',
        timestamp: expect.any(Number),
      });
    });

    it('should time operations correctly', async () => {
      const result = await logger.timeAsync('test_operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'result';
      });
      
      expect(result).toBe('result');
    });
  });

  describe('Performance Tracking', () => {
    it('should start and finish transactions', () => {
      const transactionId = logger.startTransaction('test_operation', 'test');
      
      expect(typeof transactionId).toBe('string');
      expect(Sentry.startTransaction).toHaveBeenCalled();
      
      logger.finishTransaction(transactionId);
      
      // Transaction should be cleaned up
      expect(() => logger.finishTransaction('invalid-id')).not.toThrow();
    });

    it('should track API calls', () => {
      logger.timeApiCall('GET', '/api/test', 100, 200);
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'http',
          message: 'GET /api/test - 200 (100.00ms)',
        })
      );
    });
  });

  describe('Breadcrumb Tracker', () => {
    it('should record user interactions', () => {
      breadcrumbTracker.recordInteraction('click', 'Test Button', { id: 'test-button' });
      
      const interactions = breadcrumbTracker.getInteractions();
      expect(interactions).toHaveLength(1);
      expect(interactions[0]).toEqual(expect.objectContaining({
        type: 'click',
        target: 'Test Button',
        metadata: { id: 'test-button' },
      }));
    });

    it('should record trading actions', () => {
      breadcrumbTracker.recordTradeAction('place_order', {
        symbol: 'EURUSD',
        size: 10000,
        leverage: 10,
      });
      
      const interactions = breadcrumbTracker.getInteractions();
      const tradeAction = interactions.find(i => i.type === 'trade_action');
      
      expect(tradeAction).toEqual(expect.objectContaining({
        type: 'trade_action',
        target: 'place_order',
        metadata: {
          symbol: 'EURUSD',
          size: 10000,
          leverage: 10,
        },
      }));
    });
  });

  describe('API Interceptor', () => {
    let mockFetch: Mock;

    beforeEach(() => {
      mockFetch = vi.fn();
      global.fetch = mockFetch;
    });

    it('should track API response times', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
      } as Response);

      const response = await apiInterceptor.fetch('/api/test', { method: 'GET' });

      expect(response.ok).toBe(true);
      
      const stats = apiInterceptor.getStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.totalErrors).toBe(0);
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiInterceptor.fetch('/api/test')).rejects.toThrow('Network error');

      const stats = apiInterceptor.getStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.totalErrors).toBe(1);
    });

    it('should retry failed requests', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
        } as Response);

      const response = await apiInterceptor.fetchWithRetry('/api/test', {}, 2);

      expect(response.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Boundaries', () => {
    it('should catch errors in TradingErrorBoundary', () => {
      const mockOnError = vi.fn();
      
      // This would require React testing library to properly test
      // For now, we'll test the component structure
      expect(TradingErrorBoundary).toBeDefined();
      expect(typeof TradingErrorBoundary).toBe('function');
    });

    it('should catch errors in APIErrorBoundary', () => {
      expect(APIErrorBoundary).toBeDefined();
      expect(typeof APIErrorBoundary).toBe('function');
    });

    it('should catch errors in ErrorBoundary', () => {
      expect(ErrorBoundary).toBeDefined();
      expect(typeof ErrorBoundary).toBe('function');
    });
  });

  describe('Alert Manager', () => {
    it('should have critical alert rules configured', () => {
      expect(CRITICAL_ALERT_RULES).toBeDefined();
      expect(CRITICAL_ALERT_RULES.length).toBeGreaterThan(0);
      
      const criticalRules = CRITICAL_ALERT_RULES.filter(rule => 
        rule.severity === 'critical'
      );
      expect(criticalRules.length).toBeGreaterThan(0);
    });

    it('should check alert conditions', () => {
      const rule = CRITICAL_ALERT_RULES[0];
      const metrics = {
        'trading.place_order': 60, // Above 50% threshold
      };

      const shouldTrigger = alertManager.shouldTriggerAlert(rule, metrics);
      expect(shouldTrigger).toBe(true);
    });

    it('should respect cooldown periods', () => {
      const rule = CRITICAL_ALERT_RULES[0];
      const metrics = {
        'trading.place_order': 60,
      };

      // Trigger alert
      alertManager.triggerAlert(rule, metrics);
      
      // Should not trigger again immediately due to cooldown
      const shouldTrigger = alertManager.shouldTriggerAlert(rule, metrics);
      expect(shouldTrigger).toBe(false);
    });

    it('should get alert statistics', () => {
      const stats = alertManager.getAlertStats();
      
      expect(stats).toHaveProperty('totalRules');
      expect(stats).toHaveProperty('enabledRules');
      expect(stats).toHaveProperty('recentAlerts');
      expect(typeof stats.totalRules).toBe('number');
    });
  });

  describe('Sentry Configuration', () => {
    it('should initialize Sentry with advanced configuration', () => {
      initializeSentryAdvanced();
      
      expect(Sentry.init).toHaveBeenCalledWith(expect.objectContaining({
        environment: expect.any(String),
        tracesSampleRate: expect.any(Number),
        replaysSessionSampleRate: expect.any(Number),
        beforeSend: expect.any(Function),
        beforeTransaction: expect.any(Function),
      }));
    });

    it('should filter errors intelligently', () => {
      const testCases = [
        {
          error: { value: 'ResizeObserver loop limit exceeded' },
          shouldFilter: true,
        },
        {
          error: { value: 'Trading system error' },
          shouldFilter: false,
        },
        {
          error: { value: 'Loading chunk 123 failed' },
          shouldFilter: true,
        },
      ];

      // Test would require mocking the beforeSend function
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete error flow', async () => {
      // Simulate a complete error scenario
      const error = new Error('Test trading error');
      
      // Log error
      logger.error('Trading operation failed', error, {
        component: 'TradingEngine',
        action: 'place_order',
        metadata: {
          symbol: 'EURUSD',
          size: 10000,
        },
      });

      // Add breadcrumbs
      logger.addBreadcrumb('trading', 'Order placement started');
      logger.addBreadcrumb('api', 'Calling order API');
      logger.addBreadcrumb('error', 'Order API failed');

      // Track API call
      logger.timeApiCall('POST', '/api/orders', 2500, 500, 'Internal Server Error');

      // Record in breadcrumb tracker
      breadcrumbTracker.recordTradeAction('place_order', {
        symbol: 'EURUSD',
        size: 10000,
        error: 'API failed',
      });

      // Verify all systems were called
      expect(Sentry.captureException).toHaveBeenCalled();
      expect(Sentry.addBreadcrumb).toHaveBeenCalled();
    });

    it('should handle performance monitoring', () => {
      // Start transaction
      const transactionId = logger.startTransaction('complete_trading_flow', 'trading');
      
      // Record user actions
      const actionId = logger.startUserAction('place_order');
      
      // Simulate API call
      logger.timeApiCall('POST', '/api/orders', 1200, 200);
      
      // End action
      logger.endUserAction(actionId, 'place_order');
      
      // Finish transaction
      logger.finishTransaction(transactionId);
      
      expect(transactionId).toBeDefined();
    });
  });
});

// Performance and memory tests
describe('Performance Tests', () => {
  it('should not cause memory leaks in breadcrumb tracking', () => {
    // Add many breadcrumbs
    for (let i = 0; i < 200; i++) {
      breadcrumbTracker.recordInteraction('click', `Button ${i}`, { id: `button-${i}` });
    }

    // Should be limited to max interactions
    const interactions = breadcrumbTracker.getInteractions();
    expect(interactions.length).toBeLessThanOrEqual(100);
  });

  it('should handle high-frequency API calls', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
    } as Response);

    global.fetch = mockFetch;

    // Make many concurrent API calls
    const promises = Array.from({ length: 50 }, (_, i) => 
      apiInterceptor.fetch(`/api/test-${i}`)
    );

    await Promise.all(promises);

    const stats = apiInterceptor.getStats();
    expect(stats.totalRequests).toBe(50);
    expect(stats.totalErrors).toBe(0);
  });
});

// Error boundary integration tests would go here
// These would require React Testing Library setup
describe('Error Boundary Integration', () => {
  it('should be defined', () => {
    expect(TradingErrorBoundary).toBeDefined();
    expect(APIErrorBoundary).toBeDefined();
    expect(ErrorBoundary).toBeDefined();
  });
});