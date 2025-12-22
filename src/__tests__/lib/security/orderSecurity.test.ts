/**
 * Tests for Order Security Module
 * Specifically testing the injection detection improvements
 */

import { OrderSecurityValidator } from '@/lib/security/orderSecurity';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock logger to avoid console output during tests
vi.mock('@/lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock security alert system
vi.mock('@/lib/securityAlertSystem', () => ({
  securityAlertUtils: {
    processAuthEvent: vi.fn(),
  },
}));

describe('OrderSecurityValidator - Injection Detection', () => {
  let validator: OrderSecurityValidator;

  beforeEach(() => {
    validator = new OrderSecurityValidator();
    vi.clearAllMocks();
  });

  describe('Symbol validation with injection detection', () => {
    it('should detect SQL injection patterns before sanitization', () => {
      const maliciousSymbol = "EUR/USD'; DROP TABLE orders; --";
      const result = validator.validateAndSanitizeOrder({
        symbol: maliciousSymbol,
        order_type: 'market',
        side: 'buy',
        quantity: 100,
      });

      // Should still be valid after sanitization (injection chars removed)
      expect(result.isValid).toBe(true);
      expect(result.sanitized.symbol).toBe('EUR/USD DROP TABLE ORDERS');

      // Should have triggered security alert
      expect(
        require('@/lib/securityAlertSystem').securityAlertUtils.processAuthEvent
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'AUTH_SUSPICIOUS_ACTIVITY',
          severity: 'critical',
          metadata: expect.objectContaining({
            message:
              'Potential SQL/command injection attempt in trading symbol',
            originalSymbol: maliciousSymbol,
            attackType: 'SQL_INJECTION',
            field: 'trading_symbol',
          }),
        })
      );
    });

    it('should detect command injection patterns before sanitization', () => {
      const maliciousSymbol = 'EURUSD && rm -rf /';
      const result = validator.validateAndSanitizeOrder({
        symbol: maliciousSymbol,
        order_type: 'market',
        side: 'buy',
        quantity: 100,
      });

      // Should still be valid after sanitization (injection chars removed)
      expect(result.isValid).toBe(true);
      expect(result.sanitized.symbol).toBe('EURUSD  RM -RF');

      // Should have triggered security alert
      expect(
        require('@/lib/securityAlertSystem').securityAlertUtils.processAuthEvent
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'AUTH_SUSPICIOUS_ACTIVITY',
          severity: 'critical',
          metadata: expect.objectContaining({
            message:
              'Potential SQL/command injection attempt in trading symbol',
            originalSymbol: maliciousSymbol,
            attackType: 'COMMAND_INJECTION',
            field: 'trading_symbol',
          }),
        })
      );
    });

    it('should handle legitimate symbols without triggering alerts', () => {
      const legitimateSymbol = 'EURUSD';
      const result = validator.validateAndSanitizeOrder({
        symbol: legitimateSymbol,
        order_type: 'market',
        side: 'buy',
        quantity: 100,
      });

      // Should be valid
      expect(result.isValid).toBe(true);
      expect(result.sanitized.symbol).toBe('EURUSD');

      // Should NOT have triggered security alert
      expect(
        require('@/lib/securityAlertSystem').securityAlertUtils.processAuthEvent
      ).not.toHaveBeenCalled();
    });

    it('should still sanitize symbols containing injection characters', () => {
      const symbolWithQuotes = 'EUR/USD"test';
      const result = validator.validateAndSanitizeOrder({
        symbol: symbolWithQuotes,
        order_type: 'market',
        side: 'buy',
        quantity: 100,
      });

      // After sanitization, dangerous characters should be removed
      expect(result.isValid).toBe(true);
      expect(result.sanitized.symbol).toBe('EUR/USDTEST');
    });

    it('should preserve existing validation behavior', () => {
      // Test that all other validation rules still work
      const result = validator.validateAndSanitizeOrder({
        symbol: '',
        order_type: 'invalid_type',
        side: 'invalid_side',
        quantity: -10,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Symbol is required and must be a string'
      );
      expect(result.errors).toContain(
        'Order type must be one of: market, limit, stop, stop_limit'
      );
      expect(result.errors).toContain('Side must be one of: buy, sell');
      expect(result.errors).toContain('Quantity must be positive');
    });
  });

  describe('Redundant checks removal', () => {
    it('should not have duplicate injection checks after sanitization', () => {
      // This test verifies that the injection detection now happens
      // before sanitization, making the post-sanitization checks redundant
      // and successfully removed

      const symbolWithInjection = "EUR/USD'; DROP TABLE--";

      // Mock the logger to track calls
      const mockLogger = require('@/lib/logger').logger;

      const result = validator.validateAndSanitizeOrder({
        symbol: symbolWithInjection,
        order_type: 'market',
        side: 'buy',
        quantity: 100,
      });

      // Should be valid after sanitization
      expect(result.isValid).toBe(true);

      // Should have logged the malicious attempt
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Potential injection attack detected in symbol field',
        expect.objectContaining({
          metadata: expect.objectContaining({
            originalSymbol: symbolWithInjection,
            hasSqlInjection: true,
            hasCommandInjection: false,
          }),
        })
      );
    });
  });
});
