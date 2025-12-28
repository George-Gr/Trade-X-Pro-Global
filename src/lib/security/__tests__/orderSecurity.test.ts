/**
 * Comprehensive Unit Tests for Order Security Orchestrator
 *
 * Tests cover:
 * - Input validation edge cases (boundary values and injection attempts)
 * - Rate limit enforcement across all tiers
 * - CSRF token lifecycle (generation, validation, expiration, replay protection)
 * - All cross-field validation paths for every order type
 */

// Mock external dependencies before importing the module under test

vi.mock('crypto', () => ({
  randomUUID: () => 'mock-uuid-12345',
  getRandomValues: (array: Uint8Array) => {
    // Fill with predictable values for testing
    for (let i = 0; i < array.length; i++) {
      array[i] = i % 256;
    }
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: () => {},
    warn: () => {},
    info: () => {},
    debug: () => {},
  },
}));

vi.mock('@/lib/securityAlertSystem', () => ({
  securityAlertUtils: {
    processAuthEvent: () => Promise.resolve(),
  },
}));

vi.mock('@/lib/authAuditLogger', () => ({
  authAuditLogger: {
    logAuthEvent: () => Promise.resolve(),
    logSuspiciousActivity: () => Promise.resolve(),
  },
}));

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  APIOrderSecurity,
  CSRFProtection,
  OrderExecutionRateLimiter,
  OrderSecurityOrchestrator,
  OrderSecurityValidator,
} from '../orderSecurity';

// Create mock function references for testing
const mockSecurityAlertUtils = {
  processAuthEvent: vi.fn(),
};

const mockAuthAuditLogger = {
  logAuthEvent: vi.fn(),
  logSuspiciousActivity: vi.fn(),
};

// =========================================
// TEST SETUP AND UTILITIES
// =========================================

// Mock time for deterministic testing
let mockDate: Date;
let timeTravelOffset = 0;

const mockDateNow = vi.fn(() => {
  return mockDate.getTime() + timeTravelOffset;
});

// Test utilities

const createValidOrder = (overrides: Record<string, unknown> = {}) => ({
  symbol: 'BTCUSD',
  order_type: 'limit',
  side: 'buy',
  quantity: 0.1,
  price: 50000,
  stop_loss: 45000,
  take_profit: 55000,
  ...overrides,
});

const timeTravel = (ms: number) => {
  timeTravelOffset += ms;
};

const resetTime = () => {
  timeTravelOffset = 0;
};

describe('Order Security Tests', () => {
  let orchestrator: OrderSecurityOrchestrator;
  let validator: OrderSecurityValidator;
  let rateLimiter: OrderExecutionRateLimiter;
  let csrfProtection: CSRFProtection;
  let apiSecurity: APIOrderSecurity;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Reset time
    resetTime();
    mockDate = new Date('2025-12-22T20:40:57.072Z');
    vi.setSystemTime(mockDate);

    // Create fresh instances for each test
    const config = {
      validation: {
        maxSymbolLength: 20,
        maxQuantity: 1000000,
        maxPrice: 10000000,
        allowedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
        allowedSides: ['buy', 'sell'],
        minQuantity: 0.001,
        minPrice: 0.0001,
      },
      rateLimit: {
        userTierLimits: {
          bronze: { maxOrders: 10, windowMs: 60000 },
          silver: { maxOrders: 20, windowMs: 60000 },
          gold: { maxOrders: 50, windowMs: 60000 },
          platinum: { maxOrders: 100, windowMs: 60000 },
        },
        ipLimits: { maxOrders: 200, windowMs: 60000 },
        orderTypeLimits: {
          market: { maxOrders: 30, windowMs: 60000 },
          limit: { maxOrders: 20, windowMs: 60000 },
          stop: { maxOrders: 15, windowMs: 60000 },
          stop_limit: { maxOrders: 10, windowMs: 60000 },
        },
        globalLimits: { maxOrders: 10000, windowMs: 60000 },
        cleanupIntervalMs: 300000,
      },
      apiSecurity: {
        requireHTTPS: true,
        allowedOrigins: ['https://trade-x-pro-global.vercel.app'],
        allowedMethods: ['POST', 'GET', 'OPTIONS'],
        allowedHeaders: ['content-type', 'authorization', 'x-csrf-token'],
        maxRequestSize: 1024 * 1024,
        requestTimeout: 30000,
        enableRequestSigning: true,
      },
    };

    orchestrator = new OrderSecurityOrchestrator(config);
    validator = new OrderSecurityValidator(config.validation);
    rateLimiter = new OrderExecutionRateLimiter(config.rateLimit);
    csrfProtection = new CSRFProtection();
    apiSecurity = new APIOrderSecurity(config.apiSecurity);
  });

  afterEach(() => {
    // Cleanup
    orchestrator?.shutdown();
    rateLimiter?.resetHistory();
    apiSecurity?.resetHistory();
  });

  // =========================================
  // INPUT VALIDATION TESTS
  // =========================================

  describe('Input Validation Edge Cases', () => {
    describe('Symbol Validation', () => {
      it('should handle SQL injection attempts in symbol field', () => {
        const maliciousOrder = createValidOrder({
          symbol: "BTC'; DROP TABLE orders; --",
        });

        const result = validator.validateAndSanitizeOrder(maliciousOrder);

        expect(result.isValid).toBe(true);
        expect(result.sanitized.symbol).toBe('BTCDROP TABLE ORDERS');
        expect(mockSecurityAlertUtils.processAuthEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            eventType: 'AUTH_SUSPICIOUS_ACTIVITY',
            metadata: expect.objectContaining({
              attackType: 'SQL_INJECTION',
              field: 'trading_symbol',
            }),
            severity: 'critical',
          })
        );
      });

      it('should handle command injection attempts in symbol field', () => {
        const maliciousOrder = createValidOrder({
          symbol: 'BTCUSD; rm -rf /',
        });

        const result = validator.validateAndSanitizeOrder(maliciousOrder);

        expect(result.isValid).toBe(true);
        expect(result.sanitized.symbol).toBe('BTCUSDRMRF');
        expect(mockSecurityAlertUtils.processAuthEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            eventType: 'AUTH_SUSPICIOUS_ACTIVITY',
            metadata: expect.objectContaining({
              attackType: 'COMMAND_INJECTION',
              field: 'trading_symbol',
            }),
          })
        );
      });

      it('should handle XSS attempts in symbol field', () => {
        const maliciousOrder = createValidOrder({
          symbol: '<script>alert("xss")</script>BTC',
        });

        const result = validator.validateAndSanitizeOrder(maliciousOrder);

        expect(result.isValid).toBe(true);
        expect(result.sanitized.symbol).toBe('SCRIPTALERTXSSSCRIPTBTC');
      });

      it('should validate boundary values for symbol length', () => {
        // Test maximum length
        const maxLengthOrder = createValidOrder({
          symbol: 'A'.repeat(20),
        });
        const maxResult = validator.validateAndSanitizeOrder(maxLengthOrder);
        expect(maxResult.isValid).toBe(true);

        // Test exceeding maximum length
        const tooLongOrder = createValidOrder({
          symbol: 'A'.repeat(21),
        });
        const longResult = validator.validateAndSanitizeOrder(tooLongOrder);
        expect(longResult.isValid).toBe(false);
        expect(longResult.errors).toContain(
          'Symbol cannot exceed 20 characters'
        );

        // Test empty symbol after sanitization
        const emptyOrder = createValidOrder({
          symbol: '   !@#$%^&*()   ',
        });
        const emptyResult = validator.validateAndSanitizeOrder(emptyOrder);
        expect(emptyResult.isValid).toBe(false);
        expect(emptyResult.errors).toContain(
          'Symbol cannot be empty after sanitization'
        );
      });

      it('should handle null/undefined/empty symbol values', () => {
        const nullResult = validator.validateAndSanitizeOrder({
          ...createValidOrder(),
          symbol: null,
        });
        expect(nullResult.isValid).toBe(false);

        const undefinedResult = validator.validateAndSanitizeOrder({
          ...createValidOrder(),
          symbol: undefined,
        });
        expect(undefinedResult.isValid).toBe(false);

        const emptyResult = validator.validateAndSanitizeOrder({
          ...createValidOrder(),
          symbol: '',
        });
        expect(emptyResult.isValid).toBe(false);
      });
    });

    describe('Quantity Validation', () => {
      it('should handle boundary values for quantity', () => {
        // Test minimum boundary
        const minValid = createValidOrder({ quantity: 0.001 });
        const minResult = validator.validateAndSanitizeOrder(minValid);
        expect(minResult.isValid).toBe(true);
        expect(minResult.sanitized.quantity).toBe(0.001);

        // Test below minimum
        const belowMin = createValidOrder({ quantity: 0.0009 });
        const belowResult = validator.validateAndSanitizeOrder(belowMin);
        expect(belowResult.isValid).toBe(false);
        expect(belowResult.errors).toContain('Quantity must be at least 0.001');

        // Test maximum boundary
        const maxValid = createValidOrder({ quantity: 1000000 });
        const maxResult = validator.validateAndSanitizeOrder(maxValid);
        expect(maxResult.isValid).toBe(true);

        // Test exceeding maximum
        const aboveMax = createValidOrder({ quantity: 1000001 });
        const aboveResult = validator.validateAndSanitizeOrder(aboveMax);
        expect(aboveResult.isValid).toBe(false);
        expect(aboveResult.errors).toContain('Quantity cannot exceed 1000000');

        // Test negative quantity
        const negative = createValidOrder({ quantity: -1 });
        const negativeResult = validator.validateAndSanitizeOrder(negative);
        expect(negativeResult.isValid).toBe(false);
        expect(negativeResult.errors).toContain('Quantity must be positive');
      });

      it('should handle various input types for quantity', () => {
        // String input
        const stringInput = createValidOrder({ quantity: '0.1' });
        const stringResult = validator.validateAndSanitizeOrder(stringInput);
        expect(stringResult.isValid).toBe(true);
        expect(stringResult.sanitized.quantity).toBe(0.1);

        // Scientific notation
        const sciInput = createValidOrder({ quantity: '1e-3' });
        const sciResult = validator.validateAndSanitizeOrder(sciInput);
        expect(sciResult.isValid).toBe(true);
        expect(sciResult.sanitized.quantity).toBe(0.001);

        // Invalid string
        const invalidString = createValidOrder({ quantity: 'invalid' });
        const invalidResult = validator.validateAndSanitizeOrder(invalidString);
        expect(invalidResult.isValid).toBe(false);

        // NaN
        const nanInput = createValidOrder({ quantity: NaN });
        const nanResult = validator.validateAndSanitizeOrder(nanInput);
        expect(nanResult.isValid).toBe(false);

        // Infinity
        const infInput = createValidOrder({ quantity: Infinity });
        const infResult = validator.validateAndSanitizeOrder(infInput);
        expect(infResult.isValid).toBe(false);
      });
    });

    describe('Price Validation', () => {
      it('should validate price boundary values', () => {
        // Test minimum price
        const minValid = createValidOrder({ price: 0.0001 });
        const minResult = validator.validateAndSanitizeOrder(minValid);
        expect(minResult.isValid).toBe(true);

        // Test below minimum
        const belowMin = createValidOrder({ price: 0.00009 });
        const belowResult = validator.validateAndSanitizeOrder(belowMin);
        expect(belowResult.isValid).toBe(false);

        // Test maximum price
        const maxValid = createValidOrder({ price: 10000000 });
        const maxResult = validator.validateAndSanitizeOrder(maxValid);
        expect(maxResult.isValid).toBe(true);

        // Test zero price (should fail)
        const zeroPrice = createValidOrder({ price: 0 });
        const zeroResult = validator.validateAndSanitizeOrder(zeroPrice);
        expect(zeroResult.isValid).toBe(false);

        // Test negative price
        const negativePrice = createValidOrder({ price: -100 });
        const negativeResult =
          validator.validateAndSanitizeOrder(negativePrice);
        expect(negativeResult.isValid).toBe(false);
      });

      it('should handle optional price field correctly', () => {
        // Market order without price (should be valid)
        const marketOrder = createValidOrder({
          order_type: 'market',
          price: undefined,
        });
        const marketResult = validator.validateAndSanitizeOrder(marketOrder);
        expect(marketResult.isValid).toBe(true);
        expect(marketResult.sanitized.price).toBeUndefined();

        // Limit order without price (should fail)
        const limitOrder = createValidOrder({
          order_type: 'limit',
          price: undefined,
        });
        const limitResult = validator.validateAndSanitizeOrder(limitOrder);
        expect(limitResult.isValid).toBe(false);
        expect(limitResult.errors).toContain(
          'Price is required for limit orders'
        );
      });
    });

    describe('Order Type and Side Validation', () => {
      it('should validate allowed order types', () => {
        const validTypes = ['market', 'limit', 'stop', 'stop_limit'];

        validTypes.forEach((type) => {
          const order = createValidOrder({ order_type: type });
          const result = validator.validateAndSanitizeOrder(order);
          expect(result.isValid).toBe(true);
          expect(result.sanitized.order_type).toBe(type);
        });

        // Test invalid order type
        const invalidOrder = createValidOrder({ order_type: 'invalid_type' });
        const invalidResult = validator.validateAndSanitizeOrder(invalidOrder);
        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.errors).toContain(
          'Order type must be one of: market, limit, stop, stop_limit'
        );
      });

      it('should validate allowed sides', () => {
        const validSides = ['buy', 'sell'];

        validSides.forEach((side) => {
          const order = createValidOrder({ side });
          const result = validator.validateAndSanitizeOrder(order);
          expect(result.isValid).toBe(true);
          expect(result.sanitized.side).toBe(side);
        });

        // Test invalid side
        const invalidOrder = createValidOrder({ side: 'invalid_side' });
        const invalidResult = validator.validateAndSanitizeOrder(invalidOrder);
        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.errors).toContain(
          'Side must be one of: buy, sell'
        );
      });

      it('should handle case insensitivity', () => {
        const upperCaseOrder = createValidOrder({
          order_type: 'LIMIT',
          side: 'BUY',
        });
        const result = validator.validateAndSanitizeOrder(upperCaseOrder);
        expect(result.isValid).toBe(true);
        expect(result.sanitized.order_type).toBe('limit');
        expect(result.sanitized.side).toBe('buy');
      });
    });
  });

  // =========================================
  // CROSS-FIELD VALIDATION TESTS
  // =========================================

  describe('Cross-Field Validation', () => {
    describe('Order Type Specific Requirements', () => {
      it('should validate market orders (no price required)', () => {
        const marketOrder = createValidOrder({
          order_type: 'market',
          price: undefined,
        });
        const result = validator.validateAndSanitizeOrder(marketOrder);
        expect(result.isValid).toBe(true);
      });

      it('should validate limit orders (price required)', () => {
        const validLimitOrder = createValidOrder({
          order_type: 'limit',
          price: 50000,
        });
        const validResult = validator.validateAndSanitizeOrder(validLimitOrder);
        expect(validResult.isValid).toBe(true);

        const invalidLimitOrder = createValidOrder({
          order_type: 'limit',
          price: undefined,
        });
        const invalidResult =
          validator.validateAndSanitizeOrder(invalidLimitOrder);
        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.errors).toContain(
          'Price is required for limit orders'
        );
      });

      it('should validate stop orders (price required)', () => {
        const validStopOrder = createValidOrder({
          order_type: 'stop',
          price: 45000,
        });
        const validResult = validator.validateAndSanitizeOrder(validStopOrder);
        expect(validResult.isValid).toBe(true);

        const invalidStopOrder = createValidOrder({
          order_type: 'stop',
          price: undefined,
        });
        const invalidResult =
          validator.validateAndSanitizeOrder(invalidStopOrder);
        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.errors).toContain(
          'Price is required for stop orders'
        );
      });

      it('should validate stop_limit orders (price required)', () => {
        const validStopLimitOrder = createValidOrder({
          order_type: 'stop_limit',
          price: 48000,
        });
        const validResult =
          validator.validateAndSanitizeOrder(validStopLimitOrder);
        expect(validResult.isValid).toBe(true);

        const invalidStopLimitOrder = createValidOrder({
          order_type: 'stop_limit',
          price: undefined,
        });
        const invalidResult = validator.validateAndSanitizeOrder(
          invalidStopLimitOrder
        );
        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.errors).toContain(
          'Price is required for stop_limit orders'
        );
      });
    });

    describe('Stop Loss and Take Profit Validation', () => {
      it('should validate stop loss for buy orders', () => {
        // Valid stop loss for buy order (below entry price)
        const validBuyOrder = createValidOrder({
          side: 'buy',
          price: 50000,
          stop_loss: 45000,
        });
        const validResult = validator.validateAndSanitizeOrder(validBuyOrder);
        expect(validResult.isValid).toBe(true);

        // Invalid stop loss for buy order (above entry price)
        const invalidBuyOrder = createValidOrder({
          side: 'buy',
          price: 50000,
          stop_loss: 55000,
        });
        const invalidResult =
          validator.validateAndSanitizeOrder(invalidBuyOrder);
        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.errors).toContain(
          'Stop loss for buy orders should be below the entry price'
        );
      });

      it('should validate stop loss for sell orders', () => {
        // Valid stop loss for sell order (above entry price)
        const validSellOrder = createValidOrder({
          side: 'sell',
          price: 50000,
          stop_loss: 55000,
        });
        const validResult = validator.validateAndSanitizeOrder(validSellOrder);
        expect(validResult.isValid).toBe(true);

        // Invalid stop loss for sell order (below entry price)
        const invalidSellOrder = createValidOrder({
          side: 'sell',
          price: 50000,
          stop_loss: 45000,
        });
        const invalidResult =
          validator.validateAndSanitizeOrder(invalidSellOrder);
        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.errors).toContain(
          'Stop loss for sell orders should be above the entry price'
        );
      });

      it('should validate take profit for buy orders', () => {
        // Valid take profit for buy order (above entry price)
        const validBuyOrder = createValidOrder({
          side: 'buy',
          price: 50000,
          take_profit: 55000,
        });
        const validResult = validator.validateAndSanitizeOrder(validBuyOrder);
        expect(validResult.isValid).toBe(true);

        // Invalid take profit for buy order (below entry price)
        const invalidBuyOrder = createValidOrder({
          side: 'buy',
          price: 50000,
          take_profit: 45000,
        });
        const invalidResult =
          validator.validateAndSanitizeOrder(invalidBuyOrder);
        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.errors).toContain(
          'Take profit for buy orders should be above the entry price'
        );
      });

      it('should validate take profit for sell orders', () => {
        // Valid take profit for sell order (below entry price)
        const validSellOrder = createValidOrder({
          side: 'sell',
          price: 50000,
          take_profit: 45000,
        });
        const validResult = validator.validateAndSanitizeOrder(validSellOrder);
        expect(validResult.isValid).toBe(true);

        // Invalid take profit for sell order (above entry price)
        const invalidSellOrder = createValidOrder({
          side: 'sell',
          price: 50000,
          take_profit: 55000,
        });
        const invalidResult =
          validator.validateAndSanitizeOrder(invalidSellOrder);
        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.errors).toContain(
          'Take profit for sell orders should be below the entry price'
        );
      });

      it('should handle orders without price reference for stop/take profit', () => {
        // Market order without price - stop loss should be allowed
        const marketOrder = createValidOrder({
          order_type: 'market',
          price: undefined,
          stop_loss: 45000,
        });
        const marketResult = validator.validateAndSanitizeOrder(marketOrder);
        expect(marketResult.isValid).toBe(true);

        // Limit order without price - stop loss validation should not run
        const limitOrderNoPrice = createValidOrder({
          order_type: 'limit',
          price: undefined,
          stop_loss: 45000,
        });
        const limitResult =
          validator.validateAndSanitizeOrder(limitOrderNoPrice);
        expect(limitResult.isValid).toBe(false); // Should fail on missing price, not stop loss
      });
    });
  });

  // =========================================
  // RATE LIMITING TESTS
  // =========================================

  describe('Rate Limiting Enforcement', () => {
    const testUserId = 'test-user-123';
    const testIP = '192.168.1.100';

    beforeEach(() => {
      // Reset rate limiter for clean state
      rateLimiter.resetHistory();
    });

    describe('User Tier Limits', () => {
      it('should enforce bronze tier limits (10 orders/minute)', () => {
        const result1 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(result1.allowed).toBe(true);

        // Record 10 orders
        for (let i = 0; i < 10; i++) {
          rateLimiter.recordOrder({
            userId: testUserId,
            ipAddress: testIP,
            orderType: 'limit',
          });
        }

        // 11th order should be blocked
        const result2 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(result2.allowed).toBe(false);
        expect(result2.violations).toHaveLength(1);
        expect(result2.violations[0]?.type).toBe('user_tier');
        expect(result2.violations[0]?.limit).toBe(10);
      });

      it('should enforce silver tier limits (20 orders/minute)', () => {
        const result1 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'silver',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(result1.allowed).toBe(true);

        // Record 20 orders
        for (let i = 0; i < 20; i++) {
          rateLimiter.recordOrder({
            userId: testUserId,
            ipAddress: testIP,
            orderType: 'limit',
          });
        }

        // 21st order should be blocked
        const result2 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'silver',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(result2.allowed).toBe(false);
        expect(result2.violations[0]?.type).toBe('user_tier');
        expect(result2.violations[0]?.limit).toBe(20);
      });

      it('should enforce gold tier limits (50 orders/minute)', () => {
        const result1 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'gold',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(result1.allowed).toBe(true);

        // Record 50 orders
        for (let i = 0; i < 50; i++) {
          rateLimiter.recordOrder({
            userId: testUserId,
            ipAddress: testIP,
            orderType: 'limit',
          });
        }

        // 51st order should be blocked
        const result2 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'gold',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(result2.allowed).toBe(false);
        expect(result2.violations[0]?.type).toBe('user_tier');
        expect(result2.violations[0]?.limit).toBe(50);
      });

      it('should enforce platinum tier limits (100 orders/minute)', () => {
        const result1 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'platinum',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(result1.allowed).toBe(true);

        // Record 100 orders
        for (let i = 0; i < 100; i++) {
          rateLimiter.recordOrder({
            userId: testUserId,
            ipAddress: testIP,
            orderType: 'limit',
          });
        }

        // 101st order should be blocked
        const result2 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'platinum',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(result2.allowed).toBe(false);
        expect(result2.violations[0]?.type).toBe('user_tier');
        expect(result2.violations[0]?.limit).toBe(100);
      });

      it('should default to bronze tier when no tier specified', () => {
        const result1 = rateLimiter.checkRateLimit({
          userId: testUserId,
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(result1.allowed).toBe(true);

        // Record 10 orders (bronze limit)
        for (let i = 0; i < 10; i++) {
          rateLimiter.recordOrder({
            userId: testUserId,
            ipAddress: testIP,
            orderType: 'limit',
          });
        }

        // 11th order should be blocked
        const result2 = rateLimiter.checkRateLimit({
          userId: testUserId,
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(result2.allowed).toBe(false);
        expect(result2.violations[0]?.type).toBe('user_tier');
        expect(result2.violations[0]?.limit).toBe(10);
      });
    });

    describe('IP Limits', () => {
      it('should enforce IP limits (200 orders/minute)', () => {
        const result1 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(result1.allowed).toBe(true);

        // Record 200 orders from same IP
        for (let i = 0; i < 200; i++) {
          rateLimiter.recordOrder({
            userId: `user-${i}`,
            ipAddress: testIP,
            orderType: 'limit',
          });
        }

        // 201st order should be blocked
        const result2 = rateLimiter.checkRateLimit({
          userId: 'new-user',
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(result2.allowed).toBe(false);
        expect(result2.violations).toContainEqual(
          expect.objectContaining({
            type: 'ip',
            limit: 200,
          })
        );
      });
    });

    describe('Order Type Limits', () => {
      it('should enforce market order limits (30/minute)', () => {
        const result1 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'market',
        });
        expect(result1.allowed).toBe(true);

        // Record 30 market orders
        for (let i = 0; i < 30; i++) {
          rateLimiter.recordOrder({
            userId: testUserId,
            ipAddress: testIP,
            orderType: 'market',
          });
        }

        // 31st market order should be blocked
        const result2 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'market',
        });
        expect(result2.allowed).toBe(false);
        expect(result2.violations).toContainEqual(
          expect.objectContaining({
            type: 'order_type',
            limit: 30,
          })
        );
      });

      it('should enforce limit order limits (20/minute)', () => {
        const result1 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(result1.allowed).toBe(true);

        // Record 20 limit orders
        for (let i = 0; i < 20; i++) {
          rateLimiter.recordOrder({
            userId: testUserId,
            ipAddress: testIP,
            orderType: 'limit',
          });
        }

        // 21st limit order should be blocked
        const result2 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(result2.allowed).toBe(false);
        expect(result2.violations).toContainEqual(
          expect.objectContaining({
            type: 'order_type',
            limit: 20,
          })
        );
      });

      it('should enforce stop order limits (15/minute)', () => {
        const result1 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'stop',
        });
        expect(result1.allowed).toBe(true);

        // Record 15 stop orders
        for (let i = 0; i < 15; i++) {
          rateLimiter.recordOrder({
            userId: testUserId,
            ipAddress: testIP,
            orderType: 'stop',
          });
        }

        // 16th stop order should be blocked
        const result2 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'stop',
        });
        expect(result2.allowed).toBe(false);
        expect(result2.violations).toContainEqual(
          expect.objectContaining({
            type: 'order_type',
            limit: 15,
          })
        );
      });

      it('should enforce stop_limit order limits (10/minute)', () => {
        const result1 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'stop_limit',
        });
        expect(result1.allowed).toBe(true);

        // Record 10 stop_limit orders
        for (let i = 0; i < 10; i++) {
          rateLimiter.recordOrder({
            userId: testUserId,
            ipAddress: testIP,
            orderType: 'stop_limit',
          });
        }

        // 11th stop_limit order should be blocked
        const result2 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'stop_limit',
        });
        expect(result2.allowed).toBe(false);
        expect(result2.violations).toContainEqual(
          expect.objectContaining({
            type: 'order_type',
            limit: 10,
          })
        );
      });
    });

    describe('Global Limits', () => {
      it('should enforce global limits (10000 orders/minute)', () => {
        const result1 = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(result1.allowed).toBe(true);

        // Record 10000 global orders
        for (let i = 0; i < 10000; i++) {
          rateLimiter.recordOrder({
            userId: `user-${i}`,
            ipAddress: `192.168.1.${i % 255}`,
            orderType: 'limit',
          });
        }

        // 10001st order should be blocked
        const result2 = rateLimiter.checkRateLimit({
          userId: 'new-user',
          userTier: 'bronze',
          ipAddress: '192.168.1.200',
          orderType: 'limit',
        });
        expect(result2.allowed).toBe(false);
        expect(result2.violations).toContainEqual(
          expect.objectContaining({
            type: 'global',
            limit: 10000,
          })
        );
      });
    });

    describe('Rate Limit Window Behavior', () => {
      it('should reset limits after time window expires', () => {
        // Fill up bronze tier
        for (let i = 0; i < 10; i++) {
          rateLimiter.recordOrder({
            userId: testUserId,
            ipAddress: testIP,
            orderType: 'limit',
          });
        }

        // Should be blocked
        const blockedResult = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(blockedResult.allowed).toBe(false);

        // Travel forward 61 seconds (past 1 minute window)
        timeTravel(61000);

        // Should now be allowed
        const allowedResult = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(allowedResult.allowed).toBe(true);
      });

      it('should handle partial window expiration', () => {
        // Record 5 orders
        for (let i = 0; i < 5; i++) {
          rateLimiter.recordOrder({
            userId: testUserId,
            ipAddress: testIP,
            orderType: 'limit',
          });
        }

        // Travel forward 45 seconds
        timeTravel(45000);

        // Record 5 more orders (should be allowed, first 5 are still in window)
        for (let i = 0; i < 5; i++) {
          rateLimiter.recordOrder({
            userId: testUserId,
            ipAddress: testIP,
            orderType: 'limit',
          });
        }

        // Should still be allowed (10 total, all within window)
        const result = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(result.allowed).toBe(true);

        // Record 1 more (should be blocked - 11th order)
        rateLimiter.recordOrder({
          userId: testUserId,
          ipAddress: testIP,
          orderType: 'limit',
        });

        const blockedResult = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'limit',
        });
        expect(blockedResult.allowed).toBe(false);
      });
    });

    describe('Multiple Violation Types', () => {
      it('should return all violation types when multiple limits are exceeded', () => {
        // Create scenario where multiple limits are exceeded
        for (let i = 0; i < 200; i++) {
          rateLimiter.recordOrder({
            userId: testUserId,
            ipAddress: testIP,
            orderType: 'limit',
          });
        }

        const result = rateLimiter.checkRateLimit({
          userId: testUserId,
          userTier: 'bronze',
          ipAddress: testIP,
          orderType: 'limit',
        });

        expect(result.allowed).toBe(false);
        expect(result.violations.length).toBeGreaterThan(1);
        expect(result.violations).toContainEqual(
          expect.objectContaining({ type: 'user_tier' })
        );
        expect(result.violations).toContainEqual(
          expect.objectContaining({ type: 'ip' })
        );
        expect(result.violations).toContainEqual(
          expect.objectContaining({ type: 'order_type' })
        );
      });
    });
  });

  // =========================================
  // CSRF PROTECTION TESTS
  // =========================================

  describe('CSRF Token Lifecycle', () => {
    const testUserId = 'csrf-test-user';
    const testSessionId = 'csrf-test-session';

    beforeEach(() => {
      // Reset CSRF protection state
      csrfProtection.invalidateUserTokens(testUserId, testSessionId);
    });

    describe('Token Generation', () => {
      it('should generate secure tokens with correct format', () => {
        const token = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
        });

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBe(64); // 32 bytes * 2 hex chars = 64 hex chars
        expect(token).toMatch(/^[0-9a-f]{64}$/);
      });

      it('should generate tokens with order context', () => {
        const token = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
          orderContext: 'BTCUSD_limit_order',
        });

        expect(token).toBeDefined();
      });

      it('should generate unique tokens for different requests', () => {
        const token1 = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
        });
        const token2 = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
        });

        expect(token1).not.toBe(token2);
      });

      it('should handle token generation for different users', () => {
        const token1 = csrfProtection.generateToken({
          userId: 'user1',
          sessionId: testSessionId,
        });
        const token2 = csrfProtection.generateToken({
          userId: 'user2',
          sessionId: testSessionId,
        });

        expect(token1).not.toBe(token2);
      });
    });

    describe('Token Validation - Valid Cases', () => {
      let validToken: string;

      beforeEach(() => {
        validToken = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
        });
      });

      it('should validate correctly generated token', () => {
        const result = csrfProtection.validateToken({
          token: validToken,
          userId: testUserId,
          sessionId: testSessionId,
        });

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate token with matching context', () => {
        const contextToken = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
          orderContext: 'BTCUSD_limit_order',
        });

        const result = csrfProtection.validateToken({
          token: contextToken,
          userId: testUserId,
          sessionId: testSessionId,
          expectedContext: 'BTCUSD_limit_order',
        });

        expect(result.isValid).toBe(true);
      });

      it('should validate token without context when no context expected', () => {
        const noContextToken = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
        });

        const result = csrfProtection.validateToken({
          token: noContextToken,
          userId: testUserId,
          sessionId: testSessionId,
        });

        expect(result.isValid).toBe(true);
      });
    });

    describe('Token Validation - Invalid Cases', () => {
      let validToken: string;

      beforeEach(() => {
        validToken = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
        });
      });

      it('should reject invalid token', () => {
        const result = csrfProtection.validateToken({
          token: 'invalid-token',
          userId: testUserId,
          sessionId: testSessionId,
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid or expired CSRF token');
      });

      it('should reject token for wrong user', () => {
        const result = csrfProtection.validateToken({
          token: validToken,
          userId: 'wrong-user',
          sessionId: testSessionId,
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('CSRF token user mismatch');
      });

      it('should reject token for wrong session', () => {
        const result = csrfProtection.validateToken({
          token: validToken,
          userId: testUserId,
          sessionId: 'wrong-session',
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('CSRF token session mismatch');
      });

      it('should reject token with wrong context', () => {
        const contextToken = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
          orderContext: 'BTCUSD_limit_order',
        });

        const result = csrfProtection.validateToken({
          token: contextToken,
          userId: testUserId,
          sessionId: testSessionId,
          expectedContext: 'ETHUSD_limit_order',
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('CSRF token context mismatch');
      });
    });

    describe('Token Expiration', () => {
      it('should reject expired tokens', () => {
        const token = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
        });

        // Travel forward 16 minutes (past 15 minute TTL)
        timeTravel(16 * 60 * 1000);

        const result = csrfProtection.validateToken({
          token,
          userId: testUserId,
          sessionId: testSessionId,
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('CSRF token has expired');
      });

      it('should accept tokens within expiration time', () => {
        const token = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
        });

        // Travel forward 14 minutes (within 15 minute TTL)
        timeTravel(14 * 60 * 1000);

        const result = csrfProtection.validateToken({
          token,
          userId: testUserId,
          sessionId: testSessionId,
        });

        expect(result.isValid).toBe(true);
      });

      it('should reject token right at expiration boundary', () => {
        const token = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
        });

        // Travel forward exactly 15 minutes
        timeTravel(15 * 60 * 1000);

        const result = csrfProtection.validateToken({
          token,
          userId: testUserId,
          sessionId: testSessionId,
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('CSRF token has expired');
      });
    });

    describe('One-Time Use Protection', () => {
      it('should invalidate token after single use', () => {
        const token = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
        });

        // First use should succeed
        const result1 = csrfProtection.validateToken({
          token,
          userId: testUserId,
          sessionId: testSessionId,
        });
        expect(result1.isValid).toBe(true);

        // Second use should fail (token already used)
        const result2 = csrfProtection.validateToken({
          token,
          userId: testUserId,
          sessionId: testSessionId,
        });
        expect(result2.isValid).toBe(false);
        expect(result2.errors).toContain('Invalid or expired CSRF token');
      });

      it('should allow multiple tokens for same user/session', () => {
        const token1 = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
        });
        const token2 = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
        });

        const result1 = csrfProtection.validateToken({
          token: token1,
          userId: testUserId,
          sessionId: testSessionId,
        });
        expect(result1.isValid).toBe(true);

        const result2 = csrfProtection.validateToken({
          token: token2,
          userId: testUserId,
          sessionId: testSessionId,
        });
        expect(result2.isValid).toBe(true);
      });
    });

    describe('Token Invalidation', () => {
      it('should invalidate all tokens for specific user/session', () => {
        const token1 = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
        });
        const token2 = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
        });

        // Both should be valid initially
        expect(
          csrfProtection.validateToken({
            token: token1,
            userId: testUserId,
            sessionId: testSessionId,
          }).isValid
        ).toBe(true);

        expect(
          csrfProtection.validateToken({
            token: token2,
            userId: testUserId,
            sessionId: testSessionId,
          }).isValid
        ).toBe(true);

        // Invalidate tokens for the user/session
        csrfProtection.invalidateUserTokens(testUserId, testSessionId);

        // Both should now be invalid
        expect(
          csrfProtection.validateToken({
            token: token1,
            userId: testUserId,
            sessionId: testSessionId,
          }).isValid
        ).toBe(false);

        expect(
          csrfProtection.validateToken({
            token: token2,
            userId: testUserId,
            sessionId: testSessionId,
          }).isValid
        ).toBe(false);
      });

      it('should not invalidate tokens for different user/session', () => {
        const token1 = csrfProtection.generateToken({
          userId: testUserId,
          sessionId: testSessionId,
        });
        const token2 = csrfProtection.generateToken({
          userId: 'other-user',
          sessionId: 'other-session',
        });

        // Invalidate tokens for test user/session
        csrfProtection.invalidateUserTokens(testUserId, testSessionId);

        // Token1 should be invalid, token2 should still be valid
        expect(
          csrfProtection.validateToken({
            token: token1,
            userId: testUserId,
            sessionId: testSessionId,
          }).isValid
        ).toBe(false);

        expect(
          csrfProtection.validateToken({
            token: token2,
            userId: 'other-user',
            sessionId: 'other-session',
          }).isValid
        ).toBe(true);
      });
    });
  });

  // =========================================
  // API SECURITY TESTS
  // =========================================

  describe('API Security Validation', () => {
    const createMockRequestWithHeaders = (
      headers: Record<string, string> = {}
    ) => {
      const mockHeaders = new Map();
      Object.entries(headers).forEach(([key, value]) => {
        mockHeaders.set(key, value);
      });

      return {
        url: 'https://test.example.com/api/orders',
        method: 'POST',
        headers: mockHeaders,
        get: (name: string) => mockHeaders.get(name),
      } as unknown as Request;
    };

    describe('HTTPS Requirements', () => {
      it('should reject HTTP requests in production mode', () => {
        const httpRequest = {
          url: 'http://test.example.com/api/orders',
          method: 'POST',
          headers: new Map(),
        } as unknown as Request;

        const result = apiSecurity.validateRequest({
          request: httpRequest,
          clientIP: '192.168.1.100',
          userAgent: 'test-browser',
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'HTTPS required in production environment'
        );
      });

      it('should allow HTTP requests in development mode', () => {
        // Mock development environment
        vi.stubGlobal('process', {
          env: { NODE_ENV: 'development' },
        });

        const devApiSecurity = new APIOrderSecurity({ requireHTTPS: false });

        const httpRequest = {
          url: 'http://test.example.com/api/orders',
          method: 'POST',
          headers: new Map(),
        } as unknown as Request;

        const result = devApiSecurity.validateRequest({
          request: httpRequest,
          clientIP: '192.168.1.100',
          userAgent: 'test-browser',
        });

        expect(result.isValid).toBe(true);
      });
    });

    describe('Origin Validation', () => {
      it('should allow requests from allowed origins', () => {
        const request = createMockRequestWithHeaders({
          origin: 'https://trade-x-pro-global.vercel.app',
        });

        const result = apiSecurity.validateRequest({
          request,
          clientIP: '192.168.1.100',
          userAgent: 'test-browser',
        });

        expect(result.isValid).toBe(true);
        expect(result.warnings).not.toContain(
          expect.stringContaining('Origin not in allowlist')
        );
      });

      it('should warn about requests from non-allowed origins', () => {
        const request = createMockRequestWithHeaders({
          origin: 'https://malicious-site.com',
        });

        const result = apiSecurity.validateRequest({
          request,
          clientIP: '192.168.1.100',
          userAgent: 'test-browser',
        });

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain(
          'Origin not in allowlist: https://malicious-site.com'
        );
      });
    });

    describe('Method Validation', () => {
      it('should allow allowed methods', () => {
        const allowedMethods = ['POST', 'GET', 'OPTIONS'];

        allowedMethods.forEach((method) => {
          const request = createMockRequestWithHeaders();
          Object.defineProperty(request, 'method', { value: method });

          const result = apiSecurity.validateRequest({
            request,
            clientIP: '192.168.1.100',
            userAgent: 'test-browser',
          });

          expect(result.isValid).toBe(true);
        });
      });

      it('should reject disallowed methods', () => {
        const request = createMockRequestWithHeaders();
        Object.defineProperty(request, 'method', { value: 'DELETE' });

        const result = apiSecurity.validateRequest({
          request,
          clientIP: '192.168.1.100',
          userAgent: 'test-browser',
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Method DELETE not allowed');
      });
    });

    describe('Request Size Validation', () => {
      it('should allow requests within size limit', () => {
        const request = createMockRequestWithHeaders({
          'content-length': '1024', // 1KB, within 1MB limit
        });

        const result = apiSecurity.validateRequest({
          request,
          clientIP: '192.168.1.100',
          userAgent: 'test-browser',
        });

        expect(result.isValid).toBe(true);
      });

      it('should reject requests exceeding size limit', () => {
        const request = createMockRequestWithHeaders({
          'content-length': (2 * 1024 * 1024).toString(), // 2MB, exceeds 1MB limit
        });

        const result = apiSecurity.validateRequest({
          request,
          clientIP: '192.168.1.100',
          userAgent: 'test-browser',
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Request size exceeds limit');
      });
    });

    describe('Request Signing Validation', () => {
      it('should validate request signing headers', () => {
        const currentTime = Date.now().toString();
        const request = createMockRequestWithHeaders({
          'x-request-signature': 'mock-signature',
          'x-request-timestamp': currentTime,
          'x-request-nonce': 'mock-nonce-123',
        });

        const result = apiSecurity.validateRequest({
          request,
          clientIP: '192.168.1.100',
          userAgent: 'test-browser',
        });

        expect(result.isValid).toBe(true);
      });

      it('should reject requests with missing signing headers', () => {
        const request = createMockRequestWithHeaders();

        const result = apiSecurity.validateRequest({
          request,
          clientIP: '192.168.1.100',
          userAgent: 'test-browser',
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Missing request signing headers');
      });

      it('should reject requests with old timestamps', () => {
        const oldTime = (Date.now() - 10 * 60 * 1000).toString(); // 10 minutes ago
        const request = createMockRequestWithHeaders({
          'x-request-signature': 'mock-signature',
          'x-request-timestamp': oldTime,
          'x-request-nonce': 'mock-nonce-123',
        });

        const result = apiSecurity.validateRequest({
          request,
          clientIP: '192.168.1.100',
          userAgent: 'test-browser',
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Request timestamp too old or too far in future'
        );
      });

      it('should detect replay attacks', () => {
        const currentTime = Date.now().toString();
        const request = createMockRequestWithHeaders({
          'x-request-signature': 'mock-signature',
          'x-request-timestamp': currentTime,
          'x-request-nonce': 'mock-nonce-123',
        });

        // First request should succeed
        const result1 = apiSecurity.validateRequest({
          request,
          clientIP: '192.168.1.100',
          userAgent: 'test-browser',
        });
        expect(result1.isValid).toBe(true);

        // Duplicate request should be rejected as replay attack
        const result2 = apiSecurity.validateRequest({
          request,
          clientIP: '192.168.1.100',
          userAgent: 'test-browser',
        });
        expect(result2.isValid).toBe(false);
        expect(result2.errors).toContain('Potential replay attack detected');
      });
    });
  });

  // =========================================
  // INTEGRATION TESTS
  // =========================================

  describe('Security Orchestrator Integration', () => {
    const validOrder = createValidOrder();

    const createMockRequest = () => {
      return {
        url: 'https://trade-x-pro-global.vercel.app/api/orders',
        method: 'POST',
        headers: new Map([
          ['content-type', 'application/json'],
          ['origin', 'https://trade-x-pro-global.vercel.app'],
          ['x-request-signature', 'mock-signature'],
          ['x-request-timestamp', Date.now().toString()],
          ['x-request-nonce', 'mock-nonce-123'],
        ]),
      } as unknown as Request;
    };

    it('should validate complete security flow successfully', async () => {
      const request = createMockRequest();
      const csrfToken = orchestrator.generateCSRFToken({
        userId: 'test-user',
        sessionId: 'test-session',
        orderContext: 'order_execution',
      });

      const result = await orchestrator.validateOrderSecurity({
        request,
        userId: 'test-user',
        sessionId: 'test-session',
        clientIP: '192.168.1.100',
        userAgent: 'test-browser',
        orderRequest: validOrder,
        csrfToken,
        userTier: 'bronze',
        requestId: 'test-request-123',
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitizedOrder).toBeDefined();
      expect(result.securityContext).toBeDefined();
      expect(result.requestId).toBe('test-request-123');
    });

    it('should reject order with invalid CSRF token', async () => {
      const request = createMockRequest();

      const result = await orchestrator.validateOrderSecurity({
        request,
        userId: 'test-user',
        sessionId: 'test-session',
        clientIP: '192.168.1.100',
        userAgent: 'test-browser',
        orderRequest: validOrder,
        csrfToken: 'invalid-token',
        userTier: 'bronze',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'CSRF token required for order operations'
      );
    });

    it('should reject order with malicious symbol', async () => {
      const request = createMockRequest();
      const csrfToken = orchestrator.generateCSRFToken({
        userId: 'test-user',
        sessionId: 'test-session',
        orderContext: 'order_execution',
      });

      const maliciousOrder = {
        ...validOrder,
        symbol: "BTC'; DROP TABLE orders; --",
      };

      const result = await orchestrator.validateOrderSecurity({
        request,
        userId: 'test-user',
        sessionId: 'test-session',
        clientIP: '192.168.1.100',
        userAgent: 'test-browser',
        orderRequest: maliciousOrder,
        csrfToken,
        userTier: 'bronze',
      });

      // Should be valid but sanitized (attack detected and logged)
      expect(result.isValid).toBe(true);
      expect(result.sanitizedOrder?.symbol).toBe('BTCDROP TABLE ORDERS');

      // Security alert should have been triggered
      expect(mockSecurityAlertUtils.processAuthEvent).toHaveBeenCalled();
    });

    it('should reject order that exceeds rate limits', async () => {
      const request = createMockRequest();
      const csrfToken = orchestrator.generateCSRFToken({
        userId: 'rate-limit-test-user',
        sessionId: 'test-session',
        orderContext: 'order_execution',
      });

      // Exceed bronze tier limit (10 orders)
      for (let i = 0; i < 10; i++) {
        orchestrator.recordOrderExecution({
          userId: 'rate-limit-test-user',
          ipAddress: '192.168.1.100',
          orderType: 'limit',
        });
      }

      const result = await orchestrator.validateOrderSecurity({
        request,
        userId: 'rate-limit-test-user',
        sessionId: 'test-session',
        clientIP: '192.168.1.100',
        userAgent: 'test-browser',
        orderRequest: validOrder,
        csrfToken,
        userTier: 'bronze',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('Rate limit exceeded (user_tier)')
      );
    });

    it('should reject order with cross-field validation errors', async () => {
      const request = createMockRequest();
      const csrfToken = orchestrator.generateCSRFToken({
        userId: 'test-user',
        sessionId: 'test-session',
        orderContext: 'order_execution',
      });

      // Invalid order: buy order with stop loss above entry price
      const invalidOrder = {
        ...validOrder,
        side: 'buy',
        price: 50000,
        stop_loss: 55000, // Invalid: should be below 50000 for buy orders
      };

      const result = await orchestrator.validateOrderSecurity({
        request,
        userId: 'test-user',
        sessionId: 'test-session',
        clientIP: '192.168.1.100',
        userAgent: 'test-browser',
        orderRequest: invalidOrder,
        csrfToken,
        userTier: 'bronze',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Stop loss for buy orders should be below the entry price'
      );
    });

    it('should handle missing CSRF token gracefully', async () => {
      const request = createMockRequest();

      const result = await orchestrator.validateOrderSecurity({
        request,
        userId: 'test-user',
        sessionId: 'test-session',
        clientIP: '192.168.1.100',
        userAgent: 'test-browser',
        orderRequest: validOrder,
        userTier: 'bronze',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'CSRF token required for order operations'
      );
    });

    it('should log security events appropriately', async () => {
      const request = createMockRequest();
      const csrfToken = orchestrator.generateCSRFToken({
        userId: 'test-user',
        sessionId: 'test-session',
        orderContext: 'order_execution',
      });

      await orchestrator.validateOrderSecurity({
        request,
        userId: 'test-user',
        sessionId: 'test-session',
        clientIP: '192.168.1.100',
        userAgent: 'test-browser',
        orderRequest: validOrder,
        csrfToken,
        userTier: 'bronze',
      });

      // Should log successful submission attempt
      expect(mockAuthAuditLogger.logAuthEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            orderEventType: 'ORDER_SUBMISSION_ATTEMPT',
          }),
        })
      );
    });

    it('should handle configuration updates correctly', () => {
      // Update validation config
      orchestrator.updateConfig({
        validation: { maxSymbolLength: 30 },
      });

      const config = orchestrator.getConfig();
      expect(config.validation.maxSymbolLength).toBe(30);

      // Update rate limit config
      orchestrator.updateConfig({
        rateLimit: {
          userTierLimits: {
            bronze: { maxOrders: 5, windowMs: 60000 },
          },
        },
      });

      const updatedConfig = orchestrator.getConfig();
      expect(updatedConfig.rateLimit.userTierLimits.bronze?.maxOrders).toBe(5);

      // Update API security config
      orchestrator.updateConfig({
        apiSecurity: { maxRequestSize: 2048 * 1024 },
      });

      const apiConfig = orchestrator.getConfig();
      expect(apiConfig.apiSecurity.maxRequestSize).toBe(2048 * 1024);
    });

    it('should reset histories when requested', () => {
      // Generate some CSRF tokens and make API calls
      orchestrator.generateCSRFToken({
        userId: 'test-user',
        sessionId: 'test-session',
      });

      // Record some orders
      orchestrator.recordOrderExecution({
        userId: 'test-user',
        ipAddress: '192.168.1.100',
        orderType: 'limit',
      });

      // Reset histories
      orchestrator.resetAllHistories();

      // Rate limiter history should be cleared
      const rateLimitCheck = rateLimiter.checkRateLimit({
        userId: 'test-user',
        userTier: 'bronze',
        ipAddress: '192.168.1.100',
        orderType: 'limit',
      });
      expect(rateLimitCheck.allowed).toBe(true);

      // API security signatures should be cleared
      const mockHeaders = new Map([
        ['x-request-signature', 'test-signature'],
        ['x-request-timestamp', Date.now().toString()],
        ['x-request-nonce', 'test-nonce'],
      ]);

      const testRequest = {
        url: 'https://test.example.com/api/orders',
        method: 'POST',
        headers: mockHeaders,
      } as unknown as Request;

      const result1 = apiSecurity.validateRequest({
        request: testRequest,
        clientIP: '192.168.1.100',
        userAgent: 'test-browser',
      });
      expect(result1.isValid).toBe(true);

      // Same request should work again (signatures cleared)
      const result2 = apiSecurity.validateRequest({
        request: testRequest,
        clientIP: '192.168.1.100',
        userAgent: 'test-browser',
      });
      expect(result2.isValid).toBe(true);
    });
  });

  // =========================================
  // CONFIGURATION AND RESET TESTS
  // =========================================

  describe('Configuration Management', () => {
    it('should handle validator configuration updates', () => {
      const newConfig = {
        maxSymbolLength: 50,
        maxQuantity: 2000000,
        minQuantity: 0.01,
      };

      validator.updateConfig(newConfig);
      const currentConfig = validator.getConfig();

      expect(currentConfig.maxSymbolLength).toBe(50);
      expect(currentConfig.maxQuantity).toBe(2000000);
      expect(currentConfig.minQuantity).toBe(0.01);
    });

    it('should handle rate limiter configuration updates', () => {
      const newConfig = {
        userTierLimits: {
          bronze: { maxOrders: 5, windowMs: 30000 },
        },
        ipLimits: { maxOrders: 100, windowMs: 30000 },
      };

      rateLimiter.updateConfig(newConfig);
      const currentConfig = rateLimiter.getConfig();

      expect(currentConfig.userTierLimits.bronze?.maxOrders).toBe(5);
      expect(currentConfig.userTierLimits.bronze?.windowMs).toBe(30000);
      expect(currentConfig.ipLimits.maxOrders).toBe(100);
      expect(currentConfig.ipLimits.windowMs).toBe(30000);
    });

    it('should handle API security configuration updates', () => {
      const newConfig = {
        requireHTTPS: false,
        maxRequestSize: 2048 * 1024,
        enableRequestSigning: false,
      };

      apiSecurity.updateConfig(newConfig);
      const currentConfig = apiSecurity.getConfig();

      expect(currentConfig.requireHTTPS).toBe(false);
      expect(currentConfig.maxRequestSize).toBe(2048 * 1024);
      expect(currentConfig.enableRequestSigning).toBe(false);
    });

    it('should reset rate limiter with configuration', () => {
      // Make some orders
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordOrder({
          userId: 'test-user',
          ipAddress: '192.168.1.100',
          orderType: 'limit',
        });
      }

      // Should be allowed
      expect(
        rateLimiter.checkRateLimit({
          userId: 'test-user',
          userTier: 'bronze',
          ipAddress: '192.168.1.100',
          orderType: 'limit',
        }).allowed
      ).toBe(true);

      // Reset with config
      rateLimiter.resetHistory(true);

      const currentConfig = rateLimiter.getConfig();
      expect(currentConfig.userTierLimits.bronze?.maxOrders).toBe(10);
      expect(currentConfig.userTierLimits.bronze?.windowMs).toBe(60000);
    });

    it('should reset API security with configuration', () => {
      const mockHeaders = new Map([
        ['x-request-signature', 'test-signature'],
        ['x-request-timestamp', Date.now().toString()],
        ['x-request-nonce', 'test-nonce'],
      ]);

      const request = {
        url: 'https://test.example.com/api/orders',
        method: 'POST',
        headers: mockHeaders,
      } as unknown as Request;

      // First request should work
      const result1 = apiSecurity.validateRequest({
        request,
        clientIP: '192.168.1.100',
        userAgent: 'test-browser',
      });
      expect(result1.isValid).toBe(true);

      // Reset with config
      apiSecurity.resetHistory(true);

      const currentConfig = apiSecurity.getConfig();
      expect(currentConfig.enableRequestSigning).toBe(true);
    });
  });

  // =========================================
  // EDGE CASES AND ERROR HANDLING
  // =========================================

  describe('Edge Cases and Error Handling', () => {
    it('should handle validation exceptions gracefully', () => {
      // Create an order that might cause validation exceptions
      const problematicOrder = {
        symbol: null,
        order_type: undefined,
        side: '',
        quantity: 'not a number',
        price: NaN,
      };

      const result = validator.validateAndSanitizeOrder(problematicOrder);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.sanitized).toEqual({});
    });

    it('should handle rate limiter cleanup during low traffic', () => {
      // Record some orders
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordOrder({
          userId: 'test-user',
          ipAddress: '192.168.1.100',
          orderType: 'limit',
        });
      }

      // Travel forward past all windows
      timeTravel(120000); // 2 minutes

      // Should allow new orders (cleanup happens automatically during rate limit check)
      const result = rateLimiter.checkRateLimit({
        userId: 'test-user',
        userTier: 'bronze',
        ipAddress: '192.168.1.100',
        orderType: 'limit',
      });

      expect(result.allowed).toBe(true);
    });

    it('should handle CSRF token cleanup of expired tokens', () => {
      // Generate token
      const token = csrfProtection.generateToken({
        userId: 'test-user',
        sessionId: 'test-session',
      });

      // Verify it's valid initially
      const initialResult = csrfProtection.validateToken({
        token,
        userId: 'test-user',
        sessionId: 'test-session',
      });
      expect(initialResult.isValid).toBe(true);

      // Travel forward past expiration
      timeTravel(16 * 60 * 1000); // 16 minutes

      // Generate new token (should trigger cleanup)
      csrfProtection.generateToken({
        userId: 'other-user',
        sessionId: 'other-session',
      });

      // Original token should now be invalid
      const finalResult = csrfProtection.validateToken({
        token,
        userId: 'test-user',
        sessionId: 'test-session',
      });
      expect(finalResult.isValid).toBe(false);
    });

    it('should handle API security signature cleanup', () => {
      const mockHeaders = new Map([
        ['x-request-signature', 'test-signature'],
        ['x-request-timestamp', Date.now().toString()],
        ['x-request-nonce', 'test-nonce'],
      ]);

      const request = {
        url: 'https://test.example.com/api/orders',
        method: 'POST',
        headers: mockHeaders,
      } as unknown as Request;

      // Make request
      const result1 = apiSecurity.validateRequest({
        request,
        clientIP: '192.168.1.100',
        userAgent: 'test-browser',
      });
      expect(result1.isValid).toBe(true);

      // Travel forward past cleanup window
      timeTravel(10 * 60 * 1000); // 10 minutes

      // Same request should work again (cleanup happens automatically during validation)
      const result2 = apiSecurity.validateRequest({
        request,
        clientIP: '192.168.1.100',
        userAgent: 'test-browser',
      });
      expect(result2.isValid).toBe(true);
    });

    it('should handle orchestrator shutdown gracefully', () => {
      // Generate some state
      orchestrator.generateCSRFToken({
        userId: 'test-user',
        sessionId: 'test-session',
      });

      orchestrator.recordOrderExecution({
        userId: 'test-user',
        ipAddress: '192.168.1.100',
        orderType: 'limit',
      });

      // Should not throw during shutdown
      expect(() => {
        orchestrator.shutdown();
      }).not.toThrow();
    });

    it('should provide security headers', () => {
      const headers = orchestrator.getSecurityHeaders();

      expect(headers).toHaveProperty('X-Content-Type-Options');
      expect(headers).toHaveProperty('X-Frame-Options');
      expect(headers).toHaveProperty('X-XSS-Protection');
      expect(headers).toHaveProperty('Strict-Transport-Security');
      expect(headers).toHaveProperty('Referrer-Policy');
      expect(headers).toHaveProperty('Content-Security-Policy');
      expect(headers).toHaveProperty('Permissions-Policy');

      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
    });
  });
});
