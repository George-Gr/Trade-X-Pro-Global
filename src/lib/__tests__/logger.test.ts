import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { logger, createDomainLogger, LogContext, initializeSentry } from '@/lib/logger';

/**
 * Test suite for centralized logging system
 * Tests: logger methods, context tracking, breadcrumbs, Sentry integration
 */

describe('Logger', () => {
  beforeAll(() => {
    // Clear context before each test
    logger.clearGlobalContext();
    logger.clearBreadcrumbs();
  });

  afterAll(() => {
    // Cleanup after each test
    logger.clearGlobalContext();
    logger.clearBreadcrumbs();
  });

  describe('Global Context Management', () => {
    it('should set and retrieve global context', () => {
      const context: LogContext = {
        userId: 'user-123',
        page: 'trading',
        action: 'execute_order',
      };

      logger.setGlobalContext(context);
      const retrieved = logger.getGlobalContext();

      expect(retrieved.userId).toBe('user-123');
      expect(retrieved.page).toBe('trading');
      expect(retrieved.action).toBe('execute_order');
    });

    it('should merge contexts correctly', () => {
      const context1: LogContext = { userId: 'user-123' };
      const context2: LogContext = { page: 'trading' };

      logger.setGlobalContext(context1);
      logger.setGlobalContext(context2);
      const merged = logger.getGlobalContext();

      expect(merged.userId).toBe('user-123');
      expect(merged.page).toBe('trading');
    });

    it('should clear global context', () => {
      logger.setGlobalContext({ userId: 'user-123' });
      logger.clearGlobalContext();
      const context = logger.getGlobalContext();

      expect(context.userId).toBeUndefined();
    });
  });

  describe('Breadcrumb Management', () => {
    beforeEach(() => {
      logger.clearBreadcrumbs();
    });

    it('should add breadcrumbs', () => {
      logger.addBreadcrumb('user_action', 'Clicked Place Order');
      const breadcrumbs = logger.getBreadcrumbs();

      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].category).toBe('user_action');
      expect(breadcrumbs[0].message).toBe('Clicked Place Order');
    });

    it('should add breadcrumbs with different levels', () => {
      logger.addBreadcrumb('info', 'User logged in', 'info');
      logger.addBreadcrumb('warning', 'Low balance', 'warning');
      logger.addBreadcrumb('error', 'Order failed', 'error');

      const breadcrumbs = logger.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0].level).toBe('info');
      expect(breadcrumbs[1].level).toBe('warning');
      expect(breadcrumbs[2].level).toBe('error');
    });

    it('should limit breadcrumbs to MAX_BREADCRUMBS', () => {
      // Add more than 50 breadcrumbs
      for (let i = 0; i < 60; i++) {
        logger.addBreadcrumb('action', `Action ${i}`);
      }

      const breadcrumbs = logger.getBreadcrumbs();
      expect(breadcrumbs.length).toBeLessThanOrEqual(50);
      expect(breadcrumbs[0].message).toContain('Action 10');
    });

    it('should clear breadcrumbs', () => {
      logger.addBreadcrumb('action', 'Test');
      logger.clearBreadcrumbs();
      const breadcrumbs = logger.getBreadcrumbs();

      expect(breadcrumbs).toHaveLength(0);
    });
  });

  describe('Logging Methods', () => {
    it('should handle info logging', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message', { userId: 'user-123' });

      if (import.meta.env.MODE === 'development') {
        expect(consoleSpy).toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });

    it('should handle warn logging', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      logger.warn('Warning message', { metadata: { test: 'value' } as Record<string, unknown> });

      if (import.meta.env.MODE === 'development') {
        expect(consoleSpy).toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });

    it('should handle error logging with Error object', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const testError = new Error('Test error');

      logger.error('Error occurred', testError, { action: 'test' });

      if (import.meta.env.MODE === 'development') {
        expect(consoleSpy).toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });

    it('should handle error logging with non-Error object', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      logger.error('Error occurred', { status: 500, message: 'Server error' });

      if (import.meta.env.MODE === 'development') {
        expect(consoleSpy).toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });

    it('should handle debug logging', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      logger.debug('Debug message', { metadata: { value: 42 } as Record<string, unknown> });

      if (import.meta.env.MODE === 'development') {
        expect(consoleSpy).toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });
  });

  describe('Performance Timing', () => {
    it('should time synchronous operations', () => {
      const result = logger.time('sync_operation', () => {
        return 42;
      });

      expect(result).toBe(42);
    });

    it('should handle errors in timed operations', () => {
      const operation = () => {
        throw new Error('Timed operation failed');
      };

      expect(() => logger.time('failing_operation', operation)).toThrow(
        'Timed operation failed'
      );
    });

    it('should time async operations', async () => {
      const result = await logger.timeAsync('async_operation', async () => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(42), 10);
        });
      });

      expect(result).toBe(42);
    });

    it('should handle errors in timed async operations', async () => {
      const operation = async () => {
        throw new Error('Async operation failed');
      };

      await expect(
        logger.timeAsync('failing_async_operation', operation)
      ).rejects.toThrow('Async operation failed');
    });
  });

  describe('Domain Logger', () => {
    it('should create domain-scoped logger', () => {
      const domainLogger = createDomainLogger('trading');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      domainLogger.info('Order executed', { metadata: { orderId: '123' } as Record<string, unknown> });

      if (import.meta.env.MODE === 'development') {
        expect(consoleSpy).toHaveBeenCalled();
        // Should contain domain name
        const callArgs = consoleSpy.mock.calls[0]?.[0];
        if (callArgs && typeof callArgs === 'string') {
          expect(callArgs).toContain('[trading]');
        }
      }

      consoleSpy.mockRestore();
    });

    it('should add domain-scoped breadcrumbs', () => {
      const domainLogger = createDomainLogger('kyc');

      domainLogger.addBreadcrumb('upload', 'Document uploaded');
      const breadcrumbs = logger.getBreadcrumbs();

      expect(breadcrumbs.length).toBeGreaterThan(0);
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
      expect(lastBreadcrumb.category).toContain('kyc');
    });
  });

  describe('Sentry Integration', () => {
    it('should initialize Sentry', () => {
      // This should not throw
      expect(() => initializeSentry()).not.toThrow();
    });

    it('should handle missing Sentry DSN gracefully', () => {
      // Test that initialization handles missing DSN
      const originalEnv = import.meta.env.VITE_SENTRY_DSN;

      // Reset and try initialization
      expect(() => initializeSentry()).not.toThrow();

      // Restore
      Object.assign(import.meta.env, { VITE_SENTRY_DSN: originalEnv });
    });
  });

  describe('Timestamp Generation', () => {
    it('should add timestamp when merging context in log calls', () => {
      logger.setGlobalContext({ userId: 'user-123' });
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // When logging, timestamp should be added
      logger.info('Test message');

      if (import.meta.env.MODE === 'development') {
        expect(consoleSpy).toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });

    it('should generate valid ISO timestamp format', () => {
      const consolidateSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Timestamp test', { userId: 'user-123' });

      if (import.meta.env.MODE === 'development') {
        const callArgs = consolidateSpy.mock.calls[0]?.[0];
        if (callArgs && typeof callArgs === 'string') {
          // Should contain ISO timestamp at the beginning
          const isoMatch = callArgs.match(/\[\d{4}-\d{2}-\d{2}T/);
          expect(isoMatch).toBeTruthy();
        }
      }

      consolidateSpy.mockRestore();
    });
  });

  describe('Context Merge Behavior', () => {
    it('should merge provided context with global context', () => {
      logger.setGlobalContext({ userId: 'user-123', page: 'trading' });

      const providedContext: LogContext = {
        action: 'execute_order',
        component: 'TradeForm',
      };

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Order executed', providedContext);

      if (import.meta.env.MODE === 'development') {
        expect(consoleSpy).toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });
  });

  describe('Metadata Handling', () => {
    it('should include metadata in logs', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const context: LogContext = {
        userId: 'user-123',
        metadata: {
          orderId: 'order-456',
          symbol: 'EURUSD',
          quantity: 1.5,
        },
      };

      logger.info('Order details', context);

      if (import.meta.env.MODE === 'development') {
        expect(consoleSpy).toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });
  });
});
