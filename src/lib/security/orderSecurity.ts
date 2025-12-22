/**
 * Order Execution Security Module
 *
 * Comprehensive security hardening for order execution including:
 * - Enhanced input validation and sanitization
 * - Multi-tier rate limiting for order operations
 * - Comprehensive audit logging for security events
 * - CSRF protection for order operations
 * - Enhanced API security measures
 */

import {
  authAuditLogger,
  type AuditEvent,
  type AuditEventType,
} from '@/lib/authAuditLogger';
import { logger } from '@/lib/logger';
import { securityAlertUtils } from '@/lib/securityAlertSystem';

// =========================================
// ENHANCED INPUT VALIDATION AND SANITIZATION
// =========================================

export interface OrderValidationConfig {
  maxSymbolLength: number;
  maxQuantity: number;
  maxPrice: number;
  maxStopLoss: number;
  maxTakeProfit: number;
  allowedOrderTypes: string[];
  allowedSides: string[];
  minQuantity: number;
  minPrice: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized: Record<string, unknown>;
}

export class OrderSecurityValidator {
  private config: OrderValidationConfig;

  constructor(config?: Partial<OrderValidationConfig>) {
    this.config = {
      maxSymbolLength: 20,
      maxQuantity: 1000000,
      maxPrice: 10000000,
      maxStopLoss: 10000000,
      maxTakeProfit: 10000000,
      allowedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
      allowedSides: ['buy', 'sell'],
      minQuantity: 0.001,
      minPrice: 0.0001,
      ...config,
    };
  }

  /**
   * Comprehensive validation and sanitization of order request
   */
  validateAndSanitizeOrder(
    orderRequest: Record<string, unknown>
  ): ValidationResult {
    const errors: string[] = [];
    const sanitized: Record<string, unknown> = {};

    try {
      // Validate and sanitize symbol
      const symbolValidation = this.validateSymbol(
        orderRequest.symbol as string
      );
      if (!symbolValidation.isValid) {
        errors.push(...symbolValidation.errors);
      } else {
        sanitized.symbol = symbolValidation.value;
      }

      // Validate and sanitize order type
      const orderTypeValidation = this.validateOrderType(
        orderRequest.order_type as string
      );
      if (!orderTypeValidation.isValid) {
        errors.push(...orderTypeValidation.errors);
      } else {
        sanitized.order_type = orderTypeValidation.value;
      }

      // Validate and sanitize side
      const sideValidation = this.validateSide(orderRequest.side as string);
      if (!sideValidation.isValid) {
        errors.push(...sideValidation.errors);
      } else {
        sanitized.side = sideValidation.value;
      }

      // Validate and sanitize quantity
      const quantityValidation = this.validateQuantity(orderRequest.quantity);
      if (!quantityValidation.isValid) {
        errors.push(...quantityValidation.errors);
      } else {
        sanitized.quantity = quantityValidation.value;
      }

      // Validate and sanitize price (optional for market orders)
      if (orderRequest.price !== undefined && orderRequest.price !== null) {
        const priceValidation = this.validatePrice(orderRequest.price);
        if (!priceValidation.isValid) {
          errors.push(...priceValidation.errors);
        } else {
          sanitized.price = priceValidation.value;
        }
      }

      // Validate and sanitize stop loss
      if (
        orderRequest.stop_loss !== undefined &&
        orderRequest.stop_loss !== null
      ) {
        const stopLossValidation = this.validateStopLoss(
          orderRequest.stop_loss
        );
        if (!stopLossValidation.isValid) {
          errors.push(...stopLossValidation.errors);
        } else {
          sanitized.stop_loss = stopLossValidation.value;
        }
      }

      // Validate and sanitize take profit
      if (
        orderRequest.take_profit !== undefined &&
        orderRequest.take_profit !== null
      ) {
        const takeProfitValidation = this.validateTakeProfit(
          orderRequest.take_profit
        );
        if (!takeProfitValidation.isValid) {
          errors.push(...takeProfitValidation.errors);
        } else {
          sanitized.take_profit = takeProfitValidation.value;
        }
      }

      // Cross-field validation
      const crossValidation = this.validateCrossFields(sanitized);
      if (!crossValidation.isValid) {
        errors.push(...crossValidation.errors);
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitized,
      };
    } catch (error) {
      logger.error('Order validation error:', error);
      return {
        isValid: false,
        errors: ['Validation process failed'],
        sanitized: {},
      };
    }
  }

  /**
   * Update configuration by merging with existing config
   * Preserves any internal state while updating validation rules
   *
   * @param newConfig - Partial configuration to merge with existing config
   */
  updateConfig(newConfig: Partial<OrderValidationConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }

  /**
   * Get current configuration
   *
   * @returns Current configuration object
   */
  getConfig(): OrderValidationConfig {
    return { ...this.config };
  }

  /**
   * Validate and sanitize trading symbol
   * Detects injection patterns in raw input before sanitization
   */
  private validateSymbol(symbol: string): {
    isValid: boolean;
    value?: string;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!symbol || typeof symbol !== 'string') {
      errors.push('Symbol is required and must be a string');
      return { isValid: false, errors };
    }

    // Detect SQL and command injection patterns in raw input before sanitization
    const originalSymbol = symbol;
    const hasSqlInjectionPattern = /['";\\]/.test(originalSymbol);
    const hasCommandInjectionPattern = /[&|;$`()<>]/.test(originalSymbol);

    // Log malicious attempts if injection patterns are detected
    if (hasSqlInjectionPattern || hasCommandInjectionPattern) {
      logger.warn('Potential injection attack detected in symbol field', {
        metadata: {
          originalSymbol,
          userAgent:
            typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
          timestamp: new Date().toISOString(),
          hasSqlInjection: hasSqlInjectionPattern,
          hasCommandInjection: hasCommandInjectionPattern,
        },
      });

      // Trigger security alert for potential injection attack
      securityAlertUtils.processAuthEvent({
        timestamp: new Date().toISOString(),
        eventType: 'AUTH_SUSPICIOUS_ACTIVITY',
        userId: 'unknown', // Will be populated by calling context if needed
        ipAddress: 'unknown', // Will be populated by calling context if needed
        userAgent:
          typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        metadata: {
          message: 'Potential SQL/command injection attempt in trading symbol',
          originalSymbol,
          sanitizedPreview: originalSymbol.replace(/[^A-Z0-9_/:-]/g, ''),
          attackType: hasSqlInjectionPattern
            ? 'SQL_INJECTION'
            : 'COMMAND_INJECTION',
          field: 'trading_symbol',
        },
        severity: 'critical',
      });
    }

    // Sanitize symbol
    const sanitized = symbol
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9_/:-]/g, ''); // Allow alphanumeric, underscore, slash, colon, hyphen

    if (sanitized.length === 0) {
      errors.push('Symbol cannot be empty after sanitization');
      return { isValid: false, errors };
    }

    if (sanitized.length > this.config.maxSymbolLength) {
      errors.push(
        `Symbol cannot exceed ${this.config.maxSymbolLength} characters`
      );
      return { isValid: false, errors };
    }

    return { isValid: true, value: sanitized, errors: [] };
  }

  /**
   * Validate and sanitize order type
   */
  private validateOrderType(orderType: string): {
    isValid: boolean;
    value?: string;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!orderType || typeof orderType !== 'string') {
      errors.push('Order type is required and must be a string');
      return { isValid: false, errors };
    }

    const sanitized = orderType.toLowerCase().trim();

    if (!this.config.allowedOrderTypes.includes(sanitized)) {
      errors.push(
        `Order type must be one of: ${this.config.allowedOrderTypes.join(', ')}`
      );
      return { isValid: false, errors };
    }

    return { isValid: true, value: sanitized, errors: [] };
  }

  /**
   * Validate and sanitize side (buy/sell)
   */
  private validateSide(side: string): {
    isValid: boolean;
    value?: string;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!side || typeof side !== 'string') {
      errors.push('Side is required and must be a string');
      return { isValid: false, errors };
    }

    const sanitized = side.toLowerCase().trim();

    if (!this.config.allowedSides.includes(sanitized)) {
      errors.push(
        `Side must be one of: ${this.config.allowedSides.join(', ')}`
      );
      return { isValid: false, errors };
    }

    return { isValid: true, value: sanitized, errors: [] };
  }

  /**
   * Validate and sanitize quantity
   */
  private validateQuantity(quantity: unknown): {
    isValid: boolean;
    value?: number;
    errors: string[];
  } {
    const errors: string[] = [];

    if (quantity === null || quantity === undefined) {
      errors.push('Quantity is required');
      return { isValid: false, errors };
    }

    let numQuantity: number;
    if (typeof quantity === 'string') {
      numQuantity = parseFloat(quantity);
    } else if (typeof quantity === 'number') {
      numQuantity = quantity;
    } else {
      errors.push('Quantity must be a number');
      return { isValid: false, errors };
    }

    if (isNaN(numQuantity) || !isFinite(numQuantity)) {
      errors.push('Quantity must be a valid number');
      return { isValid: false, errors };
    }

    if (numQuantity < this.config.minQuantity) {
      errors.push(`Quantity must be at least ${this.config.minQuantity}`);
      return { isValid: false, errors };
    }

    if (numQuantity > this.config.maxQuantity) {
      errors.push(`Quantity cannot exceed ${this.config.maxQuantity}`);
      return { isValid: false, errors };
    }

    // Prevent negative quantities
    if (numQuantity <= 0) {
      errors.push('Quantity must be positive');
      return { isValid: false, errors };
    }

    return { isValid: true, value: numQuantity, errors: [] };
  }

  /**
   * Validate and sanitize price
   */
  private validatePrice(price: unknown): {
    isValid: boolean;
    value?: number;
    errors: string[];
  } {
    const errors: string[] = [];

    if (price === null || price === undefined) {
      return { isValid: true, errors: [] }; // Optional field
    }

    let numPrice: number;
    if (typeof price === 'string') {
      numPrice = parseFloat(price);
    } else if (typeof price === 'number') {
      numPrice = price;
    } else {
      errors.push('Price must be a number');
      return { isValid: false, errors };
    }

    if (isNaN(numPrice) || !isFinite(numPrice)) {
      errors.push('Price must be a valid number');
      return { isValid: false, errors };
    }

    if (numPrice < this.config.minPrice) {
      errors.push(`Price must be at least ${this.config.minPrice}`);
      return { isValid: false, errors };
    }

    if (numPrice > this.config.maxPrice) {
      errors.push(`Price cannot exceed ${this.config.maxPrice}`);
      return { isValid: false, errors };
    }

    if (numPrice <= 0) {
      errors.push('Price must be positive');
      return { isValid: false, errors };
    }

    return { isValid: true, value: numPrice, errors: [] };
  }

  /**
   * Validate and sanitize stop loss
   */
  private validateStopLoss(stopLoss: unknown): {
    isValid: boolean;
    value?: number;
    errors: string[];
  } {
    return this.validatePrice(stopLoss);
  }

  /**
   * Validate and sanitize take profit
   */
  private validateTakeProfit(takeProfit: unknown): {
    isValid: boolean;
    value?: number;
    errors: string[];
  } {
    return this.validatePrice(takeProfit);
  }

  /**
   * Cross-field validation
   */
  private validateCrossFields(sanitized: Record<string, unknown>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // For limit orders, price is required
    if (sanitized.order_type === 'limit' && !sanitized.price) {
      errors.push('Price is required for limit orders');
    }

    // For stop orders, price is required
    if (sanitized.order_type === 'stop' && !sanitized.price) {
      errors.push('Price is required for stop orders');
    }

    // For stop_limit orders, price is required
    if (sanitized.order_type === 'stop_limit' && !sanitized.price) {
      errors.push('Price is required for stop_limit orders');
    }

    // Validate stop loss and take profit positions independently
    const side = sanitized.side as string;
    const price = sanitized.price as number | undefined;

    // Validate stop loss position if present with a reference price
    if (sanitized.stop_loss && price) {
      const stopLoss = sanitized.stop_loss as number;
      if (side === 'buy') {
        if (stopLoss >= price) {
          errors.push(
            'Stop loss for buy orders should be below the entry price'
          );
        }
      } else if (side === 'sell') {
        if (stopLoss <= price) {
          errors.push(
            'Stop loss for sell orders should be above the entry price'
          );
        }
      }
    }

    // Validate take profit position if present with a reference price
    if (sanitized.take_profit && price) {
      const takeProfit = sanitized.take_profit as number;
      if (side === 'buy') {
        if (takeProfit <= price) {
          errors.push(
            'Take profit for buy orders should be above the entry price'
          );
        }
      } else if (side === 'sell') {
        if (takeProfit >= price) {
          errors.push(
            'Take profit for sell orders should be below the entry price'
          );
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

// =========================================
// MULTI-TIER RATE LIMITING FOR ORDER EXECUTION
// =========================================

export interface OrderRateLimitConfig {
  userTierLimits: Record<string, { maxOrders: number; windowMs: number }>;
  ipLimits: { maxOrders: number; windowMs: number };
  orderTypeLimits: Record<string, { maxOrders: number; windowMs: number }>;
  globalLimits: { maxOrders: number; windowMs: number };
  cleanupIntervalMs?: number; // Periodic cleanup interval in milliseconds
}

export interface RateLimitViolation {
  type: 'user_tier' | 'ip' | 'order_type' | 'global';
  limit: number;
  window: number;
  violations: number;
  resetTime: number;
}

export class OrderExecutionRateLimiter {
  private config: OrderRateLimitConfig;
  private userOrderHistory: Map<
    string,
    Array<{ timestamp: number; orderType: string }>
  > = new Map();
  private ipOrderHistory: Map<
    string,
    Array<{ timestamp: number; userId?: string }>
  > = new Map();
  private globalOrderHistory: Array<{ timestamp: number }> = [];
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Start periodic cleanup to prevent memory leaks during low-traffic periods
   */
  private startPeriodicCleanup(): void {
    // Clear any existing interval first
    this.stopPeriodicCleanup();

    // Only start cleanup interval if explicitly configured
    if (this.config.cleanupIntervalMs && this.config.cleanupIntervalMs > 0) {
      this.cleanupInterval = setInterval(() => {
        this.performPeriodicCleanup();
      }, this.config.cleanupIntervalMs);

      // Handle cleanup on process termination
      if (typeof process !== 'undefined' && process.on) {
        process.on('SIGTERM', this.stopPeriodicCleanup);
        process.on('SIGINT', this.stopPeriodicCleanup);
        process.on('beforeExit', this.stopPeriodicCleanup);
      }
    }
  }

  /**
   * Stop the periodic cleanup timer to prevent memory leaks
   */
  private stopPeriodicCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Remove process event listeners
    if (typeof process !== 'undefined' && process.off) {
      process.off('SIGTERM', this.stopPeriodicCleanup);
      process.off('SIGINT', this.stopPeriodicCleanup);
      process.off('beforeExit', this.stopPeriodicCleanup);
    }
  }

  /**
   * Perform the actual periodic cleanup of old entries
   */
  private performPeriodicCleanup(): void {
    try {
      const now = Date.now();

      logger.debug('Starting periodic cleanup of rate limiting history');

      // Use the existing cleanup logic
      this.cleanupHistory(now);

      // Log cleanup statistics
      const userCount = this.userOrderHistory.size;
      const ipCount = this.ipOrderHistory.size;
      const globalCount = this.globalOrderHistory.length;

      logger.debug('Periodic cleanup completed', {
        metadata: {
          userEntriesRemaining: userCount,
          ipEntriesRemaining: ipCount,
          globalEntriesRemaining: globalCount,
          cleanupIntervalMs: this.config.cleanupIntervalMs,
        },
      });
    } catch (error) {
      logger.error('Error during periodic cleanup:', error);
    }
  }

  constructor(config?: Partial<OrderRateLimitConfig>) {
    this.config = {
      userTierLimits: {
        bronze: { maxOrders: 10, windowMs: 60000 }, // 10 orders per minute
        silver: { maxOrders: 20, windowMs: 60000 }, // 20 orders per minute
        gold: { maxOrders: 50, windowMs: 60000 }, // 50 orders per minute
        platinum: { maxOrders: 100, windowMs: 60000 }, // 100 orders per minute
      },
      ipLimits: { maxOrders: 200, windowMs: 60000 }, // 200 orders per minute per IP
      orderTypeLimits: {
        market: { maxOrders: 30, windowMs: 60000 },
        limit: { maxOrders: 20, windowMs: 60000 },
        stop: { maxOrders: 15, windowMs: 60000 },
        stop_limit: { maxOrders: 10, windowMs: 60000 },
      },
      globalLimits: { maxOrders: 10000, windowMs: 60000 }, // 10,000 orders per minute globally
      cleanupIntervalMs: 300000, // 5 minutes default cleanup interval
      ...config,
    };

    // Start periodic cleanup to prevent memory leaks during low-traffic periods
    this.startPeriodicCleanup();
  }

  /**
   * Check if order execution is allowed under rate limits
   */
  checkRateLimit(params: {
    userId: string;
    userTier?: string;
    ipAddress: string;
    orderType: string;
  }): { allowed: boolean; violations: RateLimitViolation[] } {
    const violations: RateLimitViolation[] = [];
    const now = Date.now();

    // Clean old entries
    this.cleanupHistory(now);

    // Check user tier limits
    const userTier = params.userTier || 'bronze';
    const userLimit = this.config.userTierLimits[userTier];
    if (userLimit) {
      const userOrders = this.getUserOrdersInWindow(
        params.userId,
        userLimit.windowMs,
        now
      );
      if (userOrders.length >= userLimit.maxOrders) {
        violations.push({
          type: 'user_tier',
          limit: userLimit.maxOrders,
          window: userLimit.windowMs,
          violations: userOrders.length,
          resetTime:
            this.getOldestOrderTime(params.userId, userLimit.windowMs, now) +
            userLimit.windowMs,
        });
      }
    }

    // Check IP limits
    const ipOrders = this.getIPOrdersInWindow(
      params.ipAddress,
      this.config.ipLimits.windowMs,
      now
    );
    if (ipOrders.length >= this.config.ipLimits.maxOrders) {
      violations.push({
        type: 'ip',
        limit: this.config.ipLimits.maxOrders,
        window: this.config.ipLimits.windowMs,
        violations: ipOrders.length,
        resetTime:
          this.getOldestIPOrderTime(
            params.ipAddress,
            this.config.ipLimits.windowMs,
            now
          ) + this.config.ipLimits.windowMs,
      });
    }

    // Check order type limits
    const orderTypeLimit = this.config.orderTypeLimits[params.orderType];
    if (orderTypeLimit) {
      const userOrderTypeOrders = this.getUserOrdersByTypeInWindow(
        params.userId,
        params.orderType,
        orderTypeLimit.windowMs,
        now
      );
      if (userOrderTypeOrders.length >= orderTypeLimit.maxOrders) {
        violations.push({
          type: 'order_type',
          limit: orderTypeLimit.maxOrders,
          window: orderTypeLimit.windowMs,
          violations: userOrderTypeOrders.length,
          resetTime:
            this.getOldestOrderTimeByType(
              params.userId,
              params.orderType,
              orderTypeLimit.windowMs,
              now
            ) + orderTypeLimit.windowMs,
        });
      }
    }

    // Check global limits
    const globalOrders = this.getGlobalOrdersInWindow(
      this.config.globalLimits.windowMs,
      now
    );
    if (globalOrders.length >= this.config.globalLimits.maxOrders) {
      violations.push({
        type: 'global',
        limit: this.config.globalLimits.maxOrders,
        window: this.config.globalLimits.windowMs,
        violations: globalOrders.length,
        resetTime:
          this.getOldestGlobalOrderTime(
            this.config.globalLimits.windowMs,
            now
          ) + this.config.globalLimits.windowMs,
      });
    }

    return {
      allowed: violations.length === 0,
      violations,
    };
  }

  /**
   * Record an order execution
   */
  recordOrder(params: {
    userId: string;
    ipAddress: string;
    orderType: string;
  }): void {
    const now = Date.now();

    // Record user order
    let userOrders = this.userOrderHistory.get(params.userId);
    if (!userOrders) {
      userOrders = [];
      this.userOrderHistory.set(params.userId, userOrders);
    }
    userOrders.push({ timestamp: now, orderType: params.orderType });

    // Record IP order
    let ipOrders = this.ipOrderHistory.get(params.ipAddress);
    if (!ipOrders) {
      ipOrders = [];
      this.ipOrderHistory.set(params.ipAddress, ipOrders);
    }
    ipOrders.push({ timestamp: now, userId: params.userId });

    // Record global order
    this.globalOrderHistory.push({ timestamp: now });
  }

  /**
   * Get user's orders in time window
   */
  private getUserOrdersInWindow(
    userId: string,
    windowMs: number,
    now: number
  ): Array<{ timestamp: number; orderType: string }> {
    const userOrders = this.userOrderHistory.get(userId) || [];
    return userOrders.filter((order) => now - order.timestamp < windowMs);
  }

  /**
   * Get user's orders by type in time window
   */
  private getUserOrdersByTypeInWindow(
    userId: string,
    orderType: string,
    windowMs: number,
    now: number
  ): Array<{ timestamp: number; orderType: string }> {
    const userOrders = this.userOrderHistory.get(userId) || [];
    return userOrders.filter(
      (order) =>
        order.orderType === orderType && now - order.timestamp < windowMs
    );
  }

  /**
   * Get IP orders in time window
   */
  private getIPOrdersInWindow(
    ipAddress: string,
    windowMs: number,
    now: number
  ): Array<{ timestamp: number; userId?: string }> {
    const ipOrders = this.ipOrderHistory.get(ipAddress) || [];
    return ipOrders.filter((order) => now - order.timestamp < windowMs);
  }

  /**
   * Get global orders in time window
   */
  private getGlobalOrdersInWindow(
    windowMs: number,
    now: number
  ): Array<{ timestamp: number }> {
    return this.globalOrderHistory.filter(
      (order) => now - order.timestamp < windowMs
    );
  }

  /**
   * Get oldest order time for user
   */
  private getOldestOrderTime(
    userId: string,
    windowMs: number,
    now: number
  ): number {
    const userOrders = this.getUserOrdersInWindow(userId, windowMs, now);
    if (userOrders.length === 0) return now;
    return Math.min(...userOrders.map((order) => order.timestamp));
  }

  /**
   * Get oldest order time by type for user
   */
  private getOldestOrderTimeByType(
    userId: string,
    orderType: string,
    windowMs: number,
    now: number
  ): number {
    const userOrders = this.getUserOrdersByTypeInWindow(
      userId,
      orderType,
      windowMs,
      now
    );
    if (userOrders.length === 0) return now;
    return Math.min(...userOrders.map((order) => order.timestamp));
  }

  /**
   * Get oldest IP order time
   */
  private getOldestIPOrderTime(
    ipAddress: string,
    windowMs: number,
    now: number
  ): number {
    const ipOrders = this.getIPOrdersInWindow(ipAddress, windowMs, now);
    if (ipOrders.length === 0) return now;
    return Math.min(...ipOrders.map((order) => order.timestamp));
  }

  /**
   * Get oldest global order time
   */
  private getOldestGlobalOrderTime(windowMs: number, now: number): number {
    const globalOrders = this.getGlobalOrdersInWindow(windowMs, now);
    if (globalOrders.length === 0) return now;
    return Math.min(...globalOrders.map((order) => order.timestamp));
  }

  /**
   * Cleanup old history entries
   */
  private cleanupHistory(now: number): void {
    const cutoffTime =
      now -
      Math.max(
        ...Object.values(this.config.userTierLimits).map(
          (limit) => limit.windowMs
        ),
        this.config.ipLimits.windowMs,
        ...Object.values(this.config.orderTypeLimits).map(
          (limit) => limit.windowMs
        ),
        this.config.globalLimits.windowMs
      );

    // Cleanup user history
    for (const [userId, orders] of Array.from(
      this.userOrderHistory.entries()
    )) {
      const filtered = orders.filter((order) => order.timestamp > cutoffTime);
      if (filtered.length === 0) {
        this.userOrderHistory.delete(userId);
      } else {
        this.userOrderHistory.set(userId, filtered);
      }
    }

    // Cleanup IP history
    for (const [ip, orders] of Array.from(this.ipOrderHistory.entries())) {
      const filtered = orders.filter((order) => order.timestamp > cutoffTime);
      if (filtered.length === 0) {
        this.ipOrderHistory.delete(ip);
      } else {
        this.ipOrderHistory.set(ip, filtered);
      }
    }

    // Cleanup global history
    this.globalOrderHistory = this.globalOrderHistory.filter(
      (order) => order.timestamp > cutoffTime
    );
  }

  /**
   * Update configuration by merging with existing config
   * Preserves rate limiting history while updating limits
   *
   * @param newConfig - Partial configuration to merge with existing config
   */
  updateConfig(newConfig: Partial<OrderRateLimitConfig>): void {
    // Deep merge userTierLimits
    if (newConfig.userTierLimits) {
      this.config.userTierLimits = {
        ...this.config.userTierLimits,
        ...newConfig.userTierLimits,
      };
    }

    // Update other config properties
    if (newConfig.ipLimits) {
      this.config.ipLimits = { ...this.config.ipLimits, ...newConfig.ipLimits };
    }

    if (newConfig.orderTypeLimits) {
      this.config.orderTypeLimits = {
        ...this.config.orderTypeLimits,
        ...newConfig.orderTypeLimits,
      };
    }

    if (newConfig.globalLimits) {
      this.config.globalLimits = {
        ...this.config.globalLimits,
        ...newConfig.globalLimits,
      };
    }

    // Update cleanup interval and restart periodic cleanup if needed
    if (newConfig.cleanupIntervalMs !== undefined) {
      this.config.cleanupIntervalMs = newConfig.cleanupIntervalMs;
      this.startPeriodicCleanup(); // Restart with new interval
    }
  }

  /**
   * Get current configuration
   *
   * @returns Current configuration object
   */
  getConfig(): OrderRateLimitConfig {
    return {
      userTierLimits: { ...this.config.userTierLimits },
      ipLimits: { ...this.config.ipLimits },
      orderTypeLimits: { ...this.config.orderTypeLimits },
      globalLimits: { ...this.config.globalLimits },
      cleanupIntervalMs: this.config.cleanupIntervalMs || 300000, // Default 5 minutes
    };
  }

  /**
   * Reset rate limiting history (use with caution)
   * This should only be used when a full reset is explicitly required
   *
   * @param includeConfig - If true, also reset configuration to defaults
   */
  resetHistory(includeConfig: boolean = false): void {
    this.userOrderHistory.clear();
    this.ipOrderHistory.clear();
    this.globalOrderHistory = [];

    if (includeConfig) {
      this.config = {
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
      };
    }
  }

  /**
   * Shutdown the rate limiter and cleanup all resources
   * This method should be called when the application is shutting down
   * to prevent memory leaks from the periodic cleanup timer.
   *
   * @param performFinalCleanup - If true, performs one final cleanup of old entries
   */
  shutdown(performFinalCleanup: boolean = true): void {
    // Perform final cleanup if requested
    if (performFinalCleanup) {
      try {
        this.cleanupHistory(Date.now());
        logger.debug('Final cleanup performed during shutdown');
      } catch (error) {
        logger.error('Error during final cleanup:', error);
      }
    }

    // Stop the periodic cleanup timer
    this.stopPeriodicCleanup();

    // Clear all rate limiting history
    this.userOrderHistory.clear();
    this.ipOrderHistory.clear();
    this.globalOrderHistory = [];

    logger.debug('OrderExecutionRateLimiter shutdown completed');
  }
}

// =========================================
// COMPREHENSIVE AUDIT LOGGING FOR ORDER EXECUTION
// =========================================

export interface OrderAuditEvent {
  timestamp: string;
  eventType: OrderAuditEventType;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, unknown>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  orderId?: string;
  orderDetails?: {
    symbol: string;
    orderType: string;
    side: string;
    quantity: number;
    price?: number;
    stopLoss?: number;
    takeProfit?: number;
  };
  securityContext?: {
    clientIP: string;
    userAgent: string;
    sessionId: string;
    requestId: string;
  };
  validationResults?: {
    inputValidationPassed: boolean;
    rateLimitPassed: boolean;
    authorizationPassed: boolean;
    validationErrors?: string[];
  };
}

// Extended event type for order-specific events
export type OrderAuditEventType =
  | 'ORDER_SUBMISSION_ATTEMPT'
  | 'ORDER_VALIDATION_FAILED'
  | 'ORDER_RATE_LIMIT_EXCEEDED'
  | 'ORDER_AUTHORIZATION_FAILED'
  | 'ORDER_EXECUTED_SUCCESS'
  | 'ORDER_EXECUTION_FAILED'
  | 'ORDER_CANCELLED'
  | 'ORDER_PENDING'
  | 'SUSPICIOUS_ORDER_PATTERN'
  | 'HIGH_VALUE_ORDER'
  | 'RAPID_ORDER_SEQUENCE';

export class OrderAuditLogger {
  private suspiciousPatterns: Map<
    string,
    Array<{ timestamp: number; pattern: string }>
  > = new Map();

  // Default TTL for suspicious pattern cleanup (24 hours)
  private readonly SUSPICIOUS_PATTERN_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Convert OrderAuditEvent to AuditEvent for compatibility
   */
  private convertToAuditEvent(orderEvent: OrderAuditEvent): AuditEvent {
    const auditEvent: AuditEvent = {
      timestamp: orderEvent.timestamp,
      eventType: 'AUTH_SUSPICIOUS_ACTIVITY' as AuditEventType, // Use existing auth event type
      metadata: {
        ...orderEvent.metadata,
        orderEventType: orderEvent.eventType,
        orderId: orderEvent.orderId,
        orderDetails: orderEvent.orderDetails,
        securityContext: orderEvent.securityContext,
        validationResults: orderEvent.validationResults,
      },
      severity: orderEvent.severity,
    };

    // Only add optional properties if they exist
    if (orderEvent.userId) auditEvent.userId = orderEvent.userId;
    if (orderEvent.sessionId) auditEvent.sessionId = orderEvent.sessionId;
    if (orderEvent.ipAddress) auditEvent.ipAddress = orderEvent.ipAddress;
    if (orderEvent.userAgent) auditEvent.userAgent = orderEvent.userAgent;

    return auditEvent;
  }

  /**
   * Log order submission attempt
   */
  async logOrderSubmissionAttempt(params: {
    userId: string;
    sessionId: string;
    clientIP: string;
    userAgent: string;
    requestId: string;
    orderDetails: {
      symbol: string;
      orderType: string;
      side: string;
      quantity: number;
      price?: number;
      stopLoss?: number;
      takeProfit?: number;
    };
  }): Promise<void> {
    const auditEvent: OrderAuditEvent = {
      timestamp: new Date().toISOString(),
      eventType: 'ORDER_SUBMISSION_ATTEMPT',
      userId: params.userId,
      sessionId: params.sessionId,
      ipAddress: params.clientIP,
      userAgent: params.userAgent,
      orderDetails: params.orderDetails,
      securityContext: {
        clientIP: params.clientIP,
        userAgent: params.userAgent,
        sessionId: params.sessionId,
        requestId: params.requestId,
      },
      validationResults: {
        inputValidationPassed: true,
        rateLimitPassed: true,
        authorizationPassed: true,
      },
      metadata: {
        message: 'Order submission attempt',
        action: 'order_submission',
        timestamp: Date.now(),
      },
      severity: 'info',
    };

    await authAuditLogger.logAuthEvent(this.convertToAuditEvent(auditEvent));

    // Check for suspicious patterns
    await this.checkSuspiciousPatterns(
      params.userId,
      params.orderDetails,
      params.clientIP
    );
  }

  /**
   * Log order validation failure
   */
  async logOrderValidationFailure(params: {
    userId: string;
    sessionId: string;
    clientIP: string;
    userAgent: string;
    requestId: string;
    orderDetails: {
      symbol: string;
      orderType: string;
      side: string;
      quantity: number;
      price?: number;
      stopLoss?: number;
      takeProfit?: number;
    };
    validationErrors: string[];
  }): Promise<void> {
    const auditEvent: OrderAuditEvent = {
      timestamp: new Date().toISOString(),
      eventType: 'ORDER_VALIDATION_FAILED',
      userId: params.userId,
      sessionId: params.sessionId,
      ipAddress: params.clientIP,
      userAgent: params.userAgent,
      orderDetails: params.orderDetails,
      securityContext: {
        clientIP: params.clientIP,
        userAgent: params.userAgent,
        sessionId: params.sessionId,
        requestId: params.requestId,
      },
      validationResults: {
        inputValidationPassed: false,
        rateLimitPassed: true,
        authorizationPassed: true,
        validationErrors: params.validationErrors,
      },
      metadata: {
        message: 'Order validation failed',
        validationErrors: params.validationErrors,
        action: 'order_validation_failure',
      },
      severity: 'warning',
    };

    await authAuditLogger.logAuthEvent(this.convertToAuditEvent(auditEvent));

    // Check for potential attack patterns
    if (params.validationErrors.length > 3) {
      await this.logSuspiciousActivity(
        params.userId,
        'Multiple validation errors',
        {
          userId: params.userId,
          clientIP: params.clientIP,
          validationErrors: params.validationErrors,
          orderDetails: params.orderDetails,
        },
        params.clientIP,
        params.userAgent
      );
    }
  }

  /**
   * Log order execution success
   */
  async logOrderExecutionSuccess(params: {
    userId: string;
    sessionId: string;
    clientIP: string;
    userAgent: string;
    requestId: string;
    orderId: string;
    orderDetails: {
      symbol: string;
      orderType: string;
      side: string;
      quantity: number;
      price?: number;
      stopLoss?: number;
      takeProfit?: number;
    };
    executionDetails: {
      executionPrice: number;
      commission: number;
      totalCost: number;
    };
  }): Promise<void> {
    const auditEvent: OrderAuditEvent = {
      timestamp: new Date().toISOString(),
      eventType: 'ORDER_EXECUTED_SUCCESS',
      userId: params.userId,
      sessionId: params.sessionId,
      ipAddress: params.clientIP,
      userAgent: params.userAgent,
      orderId: params.orderId,
      orderDetails: params.orderDetails,
      securityContext: {
        clientIP: params.clientIP,
        userAgent: params.userAgent,
        sessionId: params.sessionId,
        requestId: params.requestId,
      },
      validationResults: {
        inputValidationPassed: true,
        rateLimitPassed: true,
        authorizationPassed: true,
      },
      metadata: {
        message: 'Order executed successfully',
        action: 'order_execution_success',
        executionDetails: params.executionDetails,
        orderId: params.orderId,
      },
      severity: 'info',
    };

    await authAuditLogger.logAuthEvent(this.convertToAuditEvent(auditEvent));

    // Check for high-value orders
    if (params.executionDetails.totalCost > 100000) {
      const highValueEvent: OrderAuditEvent = {
        ...auditEvent,
        eventType: 'HIGH_VALUE_ORDER',
        severity: 'warning',
        metadata: {
          ...auditEvent.metadata,
          message: 'High-value order executed',
          value: params.executionDetails.totalCost,
        },
      };
      await authAuditLogger.logAuthEvent(
        this.convertToAuditEvent(highValueEvent)
      );
    }
  }

  /**
   * Log order execution failure
   */
  async logOrderExecutionFailure(params: {
    userId: string;
    sessionId: string;
    clientIP: string;
    userAgent: string;
    requestId: string;
    orderDetails: {
      symbol: string;
      orderType: string;
      side: string;
      quantity: number;
      price?: number;
      stopLoss?: number;
      takeProfit?: number;
    };
    errorDetails: {
      errorCode: string;
      errorMessage: string;
      errorContext?: Record<string, unknown>;
    };
  }): Promise<void> {
    const auditEvent: OrderAuditEvent = {
      timestamp: new Date().toISOString(),
      eventType: 'ORDER_EXECUTION_FAILED',
      userId: params.userId,
      sessionId: params.sessionId,
      ipAddress: params.clientIP,
      userAgent: params.userAgent,
      orderDetails: params.orderDetails,
      securityContext: {
        clientIP: params.clientIP,
        userAgent: params.userAgent,
        sessionId: params.sessionId,
        requestId: params.requestId,
      },
      validationResults: {
        inputValidationPassed: true,
        rateLimitPassed: true,
        authorizationPassed: true,
      },
      metadata: {
        message: 'Order execution failed',
        action: 'order_execution_failure',
        errorDetails: params.errorDetails,
      },
      severity: 'warning',
    };

    await authAuditLogger.logAuthEvent(this.convertToAuditEvent(auditEvent));
  }

  /**
   * Cleanup inactive suspicious pattern entries to prevent memory leaks
   *
   * @param maxAgeMs - Maximum age in milliseconds before patterns are considered inactive
   */
  private cleanupInactivePatterns(
    maxAgeMs: number = this.SUSPICIOUS_PATTERN_TTL
  ): void {
    const now = Date.now();
    const cutoffTime = now - maxAgeMs;

    // Iterate through all user patterns and remove inactive ones
    for (const [userId, patterns] of Array.from(
      this.suspiciousPatterns.entries()
    )) {
      // Find the most recent timestamp for this user's patterns
      const mostRecentTimestamp = Math.max(...patterns.map((p) => p.timestamp));

      // If the most recent pattern is older than cutoff, delete the entire user entry
      if (mostRecentTimestamp < cutoffTime) {
        this.suspiciousPatterns.delete(userId);
      }
    }
  }

  /**
   * Check for suspicious patterns
   */
  private async checkSuspiciousPatterns(
    userId: string,
    orderDetails: {
      symbol: string;
      orderType: string;
      side: string;
      quantity: number;
      price?: number;
      stopLoss?: number;
      takeProfit?: number;
    },
    clientIP: string
  ): Promise<void> {
    // Clean up inactive patterns to prevent memory leaks
    this.cleanupInactivePatterns();

    const now = Date.now();
    const patterns = this.suspiciousPatterns.get(userId) || [];

    // Check for rapid sequence of orders
    const recentPatterns = patterns.filter((p) => now - p.timestamp < 60000); // Last minute
    if (recentPatterns.length >= 5) {
      await this.logSuspiciousActivity(
        userId,
        'Rapid order sequence detected',
        {
          userId,
          clientIP,
          patternCount: recentPatterns.length,
          timeWindow: '1 minute',
          orderDetails,
        },
        clientIP,
        ''
      );
    }

    // Check for diverse symbol trading in short time
    const symbolPatterns = recentPatterns.filter((p) =>
      p.pattern.includes('symbol_')
    );
    const uniqueSymbols = new Set(
      symbolPatterns.map((p) => p.pattern.split('_')[1])
    ).size;
    if (uniqueSymbols >= 10) {
      await this.logSuspiciousActivity(
        userId,
        'Diverse symbol trading pattern',
        {
          userId,
          clientIP,
          uniqueSymbols,
          symbols: Array.from(
            new Set(symbolPatterns.map((p) => p.pattern.split('_')[1]))
          ),
        },
        clientIP,
        ''
      );
    }

    // Add current pattern
    patterns.push({ timestamp: now, pattern: `symbol_${orderDetails.symbol}` });
    this.suspiciousPatterns.set(userId, patterns.slice(-20)); // Keep last 20 patterns
  }

  /**
   * Log suspicious activity
   */
  public async logSuspiciousActivity(
    userId: string,
    activity: string,
    details: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await authAuditLogger.logSuspiciousActivity(
      userId,
      activity,
      details,
      ipAddress,
      userAgent
    );

    // Also trigger security alert
    await securityAlertUtils.processAuthEvent({
      timestamp: new Date().toISOString(),
      eventType: 'AUTH_SUSPICIOUS_ACTIVITY',
      userId,
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
      metadata: {
        message: `Order-related suspicious activity: ${activity}`,
        activity,
        details,
      },
      severity: 'critical',
    });
  }
}

// =========================================
// CSRF PROTECTION FOR ORDER OPERATIONS
// =========================================

export interface CSRFTokenData {
  token: string;
  userId: string;
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
  orderContext?: string;
}

export class CSRFProtection {
  private activeTokens: Map<string, CSRFTokenData> = new Map();
  private readonly TOKEN_TTL = 15 * 60 * 1000; // 15 minutes

  /**
   * Generate CSRF token for order operations
   */
  generateToken(params: {
    userId: string;
    sessionId: string;
    orderContext?: string;
  }): string {
    const token = this.generateSecureToken();
    const tokenData: CSRFTokenData = {
      token,
      userId: params.userId,
      sessionId: params.sessionId,
      issuedAt: Date.now(),
      expiresAt: Date.now() + this.TOKEN_TTL,
      orderContext: params.orderContext || '',
    };

    this.activeTokens.set(token, tokenData);
    this.cleanupExpiredTokens();

    return token;
  }

  /**
   * Validate CSRF token for order request
   */
  validateToken(params: {
    token: string;
    userId: string;
    sessionId: string;
    expectedContext?: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const tokenData = this.activeTokens.get(params.token);
    if (!tokenData) {
      errors.push('Invalid or expired CSRF token');
      return { isValid: false, errors };
    }

    // Check token expiration
    if (Date.now() > tokenData.expiresAt) {
      this.activeTokens.delete(params.token);
      errors.push('CSRF token has expired');
      return { isValid: false, errors };
    }

    // Check user ID match
    if (tokenData.userId !== params.userId) {
      errors.push('CSRF token user mismatch');
      return { isValid: false, errors };
    }

    // Check session ID match
    if (tokenData.sessionId !== params.sessionId) {
      errors.push('CSRF token session mismatch');
      return { isValid: false, errors };
    }

    // Check context if provided
    if (
      params.expectedContext &&
      tokenData.orderContext !== params.expectedContext
    ) {
      errors.push('CSRF token context mismatch');
      return { isValid: false, errors };
    }

    // Mark token as used (one-time use)
    this.activeTokens.delete(params.token);

    return { isValid: true, errors: [] };
  }

  /**
   * Invalidate tokens for a user/session
   */
  invalidateUserTokens(userId: string, sessionId: string): void {
    for (const [token, data] of Array.from(this.activeTokens.entries())) {
      if (data.userId === userId && data.sessionId === sessionId) {
        this.activeTokens.delete(token);
      }
    }
  }

  /**
   * Generate secure random token
   */
  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  }

  /**
   * Cleanup expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, data] of Array.from(this.activeTokens.entries())) {
      if (now > data.expiresAt) {
        this.activeTokens.delete(token);
      }
    }
  }
}

// =========================================
// ENHANCED API SECURITY
// =========================================

export interface APISecurityConfig {
  requireHTTPS: boolean;
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  maxRequestSize: number;
  requestTimeout: number;
  enableRequestSigning: boolean;
}

export class APIOrderSecurity {
  private config: APISecurityConfig;
  private requestSignatures: Map<
    string,
    { signature: string; timestamp: number; nonce: string }
  > = new Map();

  constructor(config?: Partial<APISecurityConfig>) {
    this.config = {
      requireHTTPS: process.env.NODE_ENV === 'production',
      allowedOrigins: this.parseAllowedOrigins(),
      allowedMethods: ['POST', 'GET', 'OPTIONS'],
      allowedHeaders: [
        'content-type',
        'authorization',
        'x-requested-with',
        'x-csrf-token',
        'x-request-signature',
        'x-request-timestamp',
        'x-request-nonce',
      ],
      maxRequestSize: 1024 * 1024, // 1MB
      requestTimeout: 30000, // 30 seconds
      enableRequestSigning: true,
      ...config,
    };
  }

  /**
   * Parse allowed origins from environment variable
   * Falls back to safe minimal defaults if environment variable is missing
   */
  private parseAllowedOrigins(): string[] {
    const envOrigins = process.env.ALLOWED_ORIGINS;

    if (!envOrigins || envOrigins.trim() === '') {
      // Safe minimal defaults - only localhost for development
      return ['http://localhost:3000', 'http://localhost:5173'];
    }

    // Parse comma-separated string, trim whitespace, and filter empty entries
    const parsedOrigins = envOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0)
      .filter((origin) => this.isValidOrigin(origin));

    // If no valid origins were parsed, fall back to defaults
    if (parsedOrigins.length === 0) {
      return ['http://localhost:3000', 'http://localhost:5173'];
    }

    return parsedOrigins;
  }

  /**
   * Validate that an origin is properly formatted
   */
  private isValidOrigin(origin: string): boolean {
    try {
      new URL(origin);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate API request security
   */
  validateRequest(params: {
    request: Request;
    clientIP: string;
    userAgent: string;
  }): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check HTTPS in production
    if (this.config.requireHTTPS && params.request.url.startsWith('http://')) {
      errors.push('HTTPS required in production environment');
    }

    // Check origin
    const origin = params.request.headers.get('Origin');
    if (origin && !this.isAllowedOrigin(origin)) {
      warnings.push(`Origin not in allowlist: ${origin}`);
    }

    // Check method
    const method = params.request.method;
    if (!this.config.allowedMethods.includes(method)) {
      errors.push(`Method ${method} not allowed`);
    }

    // Check headers
    const headers: string[] = [];
    params.request.headers.forEach((_, key) => {
      headers.push(key);
    });
    for (const header of headers) {
      if (!this.config.allowedHeaders.includes(String(header).toLowerCase())) {
        warnings.push(`Non-standard header: ${header}`);
      }
    }

    // Check request size
    const contentLength = params.request.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength) > this.config.maxRequestSize) {
      errors.push('Request size exceeds limit');
    }

    // Validate request signing if enabled
    if (this.config.enableRequestSigning) {
      const signingValidation = this.validateRequestSigning(params.request);
      if (!signingValidation.isValid) {
        errors.push(...signingValidation.errors);
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Check if origin is allowed
   */
  private isAllowedOrigin(origin: string): boolean {
    return this.config.allowedOrigins.some((allowed) => {
      if (allowed === '*') return true;
      if (allowed.endsWith('*')) {
        return origin.startsWith(allowed.slice(0, -1));
      }
      return origin === allowed || origin.startsWith(allowed + '/');
    });
  }

  /**
   * Validate request signing
   */
  private validateRequestSigning(request: Request): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    const signature = request.headers.get('X-Request-Signature');
    const timestamp = request.headers.get('X-Request-Timestamp');
    const nonce = request.headers.get('X-Request-Nonce');

    if (!signature || !timestamp || !nonce) {
      errors.push('Missing request signing headers');
      return { isValid: false, errors };
    }

    // Check timestamp freshness
    const requestTime = parseInt(timestamp);
    const now = Date.now();
    if (Math.abs(now - requestTime) > 300000) {
      // 5 minutes
      errors.push('Request timestamp too old or too far in future');
      return { isValid: false, errors };
    }

    // Check for replay attacks
    const requestKey = `${signature}_${timestamp}_${nonce}`;
    if (this.requestSignatures.has(requestKey)) {
      errors.push('Potential replay attack detected');
      return { isValid: false, errors };
    }

    // Store signature for replay detection (cleanup after 5 minutes)
    this.requestSignatures.set(requestKey, {
      signature,
      timestamp: requestTime,
      nonce,
    });

    // Cleanup old signatures
    this.cleanupOldSignatures();

    return { isValid: true, errors: [] };
  }

  /**
   * Cleanup old request signatures
   */
  private cleanupOldSignatures(): void {
    const now = Date.now();
    const cutoff = now - 300000; // 5 minutes

    for (const [key, data] of Array.from(this.requestSignatures.entries())) {
      if (data.timestamp < cutoff) {
        this.requestSignatures.delete(key);
      }
    }
  }

  /**
   * Get security headers for response
   */
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.tradex.pro;",
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    };
  }

  /**
   * Update configuration by merging with existing config
   * Preserves request signatures history while updating security settings
   *
   * @param newConfig - Partial configuration to merge with existing config
   */
  updateConfig(newConfig: Partial<APISecurityConfig>): void {
    if (newConfig.requireHTTPS !== undefined) {
      this.config.requireHTTPS = newConfig.requireHTTPS;
    }

    if (newConfig.allowedOrigins) {
      this.config.allowedOrigins = [
        ...new Set([
          ...this.config.allowedOrigins,
          ...newConfig.allowedOrigins,
        ]),
      ];
    }

    if (newConfig.allowedMethods) {
      this.config.allowedMethods = [
        ...new Set([
          ...this.config.allowedMethods,
          ...newConfig.allowedMethods,
        ]),
      ];
    }

    if (newConfig.allowedHeaders) {
      this.config.allowedHeaders = [
        ...new Set([
          ...this.config.allowedHeaders,
          ...newConfig.allowedHeaders.map((header) => header.toLowerCase()),
        ]),
      ];
    }

    if (newConfig.maxRequestSize !== undefined) {
      this.config.maxRequestSize = newConfig.maxRequestSize;
    }

    if (newConfig.requestTimeout !== undefined) {
      this.config.requestTimeout = newConfig.requestTimeout;
    }

    if (newConfig.enableRequestSigning !== undefined) {
      this.config.enableRequestSigning = newConfig.enableRequestSigning;
    }
  }

  /**
   * Get current configuration
   *
   * @returns Current configuration object
   */
  getConfig(): APISecurityConfig {
    return {
      requireHTTPS: this.config.requireHTTPS,
      allowedOrigins: [...this.config.allowedOrigins],
      allowedMethods: [...this.config.allowedMethods],
      allowedHeaders: [...this.config.allowedHeaders],
      maxRequestSize: this.config.maxRequestSize,
      requestTimeout: this.config.requestTimeout,
      enableRequestSigning: this.config.enableRequestSigning,
    };
  }

  /**
   * Reset request signatures history (use with caution)
   * This should only be used when a full reset is explicitly required
   *
   * @param includeConfig - If true, also reset configuration to defaults
   */
  resetHistory(includeConfig: boolean = false): void {
    this.requestSignatures.clear();

    if (includeConfig) {
      this.config = {
        requireHTTPS: process.env.NODE_ENV === 'production',
        allowedOrigins: [
          'https://trade-x-pro-global.vercel.app',
          'https://tradexpro-global.com',
          'http://localhost:3000',
          'http://localhost:5173',
        ],
        allowedMethods: ['POST', 'GET', 'OPTIONS'],
        allowedHeaders: [
          'content-type',
          'authorization',
          'x-requested-with',
          'x-csrf-token',
          'x-request-signature',
          'x-request-timestamp',
          'x-request-nonce',
        ],
        maxRequestSize: 1024 * 1024, // 1MB
        requestTimeout: 30000, // 30 seconds
        enableRequestSigning: true,
      };
    }
  }
}

// =========================================
// MAIN SECURITY ORCHESTRATOR
// =========================================

export class OrderSecurityOrchestrator {
  private validator: OrderSecurityValidator;
  private rateLimiter: OrderExecutionRateLimiter;
  private auditLogger: OrderAuditLogger;
  private csrfProtection: CSRFProtection;
  private apiSecurity: APIOrderSecurity;

  constructor(config?: {
    validation?: Partial<OrderValidationConfig>;
    rateLimit?: Partial<OrderRateLimitConfig>;
    apiSecurity?: Partial<APISecurityConfig>;
  }) {
    this.validator = new OrderSecurityValidator(config?.validation);
    this.rateLimiter = new OrderExecutionRateLimiter(config?.rateLimit);
    this.auditLogger = new OrderAuditLogger();
    this.csrfProtection = new CSRFProtection();
    this.apiSecurity = new APIOrderSecurity(config?.apiSecurity);
  }

  /**
   * Comprehensive security validation for order execution
   */
  async validateOrderSecurity(params: {
    request: Request;
    userId: string;
    sessionId: string;
    clientIP: string;
    userAgent: string;
    orderRequest: Record<string, unknown>;
    csrfToken?: string;
    userTier?: string;
    requestId?: string; // Allow external requestId for traceability
  }): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    sanitizedOrder?: Record<string, unknown>;
    securityContext?: Record<string, unknown>;
    requestId?: string; // Return the requestId used for traceability
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    // Generate single requestId for entire validation flow to ensure traceability
    const requestId = params.requestId || crypto.randomUUID();

    try {
      // 1. API Security Validation
      const apiValidation = this.apiSecurity.validateRequest({
        request: params.request,
        clientIP: params.clientIP,
        userAgent: params.userAgent,
      });

      if (!apiValidation.isValid) {
        errors.push(...apiValidation.errors);
      }
      warnings.push(...apiValidation.warnings);

      // 2. Input Validation and Sanitization
      const validationResult = this.validator.validateAndSanitizeOrder(
        params.orderRequest
      );
      if (!validationResult.isValid) {
        errors.push(...validationResult.errors);

        // Log validation failure
        await this.auditLogger.logOrderValidationFailure({
          userId: params.userId,
          sessionId: params.sessionId,
          clientIP: params.clientIP,
          userAgent: params.userAgent,
          requestId: requestId,
          orderDetails: validationResult.sanitized as {
            symbol: string;
            orderType: string;
            side: string;
            quantity: number;
            price?: number;
            stopLoss?: number;
            takeProfit?: number;
          },
          validationErrors: validationResult.errors,
        });

        return {
          isValid: false,
          errors,
          warnings,
          requestId: requestId,
        };
      }

      // 3. CSRF Token Validation
      if (params.csrfToken) {
        const csrfValidation = this.csrfProtection.validateToken({
          token: params.csrfToken,
          userId: params.userId,
          sessionId: params.sessionId,
          expectedContext: 'order_execution',
        });

        if (!csrfValidation.isValid) {
          errors.push(...csrfValidation.errors);

          // Log CSRF violation
          await this.auditLogger.logSuspiciousActivity(
            params.userId,
            'CSRF token validation failed',
            {
              userId: params.userId,
              clientIP: params.clientIP,
              csrfErrors: csrfValidation.errors,
            },
            params.clientIP,
            params.userAgent
          );

          return {
            isValid: false,
            errors,
            warnings,
            requestId: requestId,
          };
        }
      } else {
        errors.push('CSRF token required for order operations');
        return {
          isValid: false,
          errors,
          warnings,
          requestId: requestId,
        };
      }

      // 4. Rate Limiting Check
      const userTier = params.userTier || 'bronze';
      const rateLimitResult = this.rateLimiter.checkRateLimit({
        userId: params.userId,
        userTier,
        ipAddress: params.clientIP,
        orderType: validationResult.sanitized.order_type as string,
      });

      if (!rateLimitResult.allowed) {
        const rateLimitErrors = rateLimitResult.violations.map(
          (v) =>
            `Rate limit exceeded (${v.type}): ${v.violations}/${
              v.limit
            } in ${Math.ceil(v.window / 60000)} minutes`
        );
        errors.push(...rateLimitErrors);

        // Log rate limit violation
        await this.auditLogger.logOrderValidationFailure({
          userId: params.userId,
          sessionId: params.sessionId,
          clientIP: params.clientIP,
          userAgent: params.userAgent,
          requestId: requestId,
          orderDetails: validationResult.sanitized as {
            symbol: string;
            orderType: string;
            side: string;
            quantity: number;
            price?: number;
            stopLoss?: number;
            takeProfit?: number;
          },
          validationErrors: rateLimitErrors,
        });

        return {
          isValid: false,
          errors,
          warnings,
          requestId: requestId,
        };
      }

      // Log successful validation
      await this.auditLogger.logOrderSubmissionAttempt({
        userId: params.userId,
        sessionId: params.sessionId,
        clientIP: params.clientIP,
        userAgent: params.userAgent,
        requestId: requestId,
        orderDetails: validationResult.sanitized as {
          symbol: string;
          orderType: string;
          side: string;
          quantity: number;
          price?: number;
          stopLoss?: number;
          takeProfit?: number;
        },
      });

      return {
        isValid: true,
        errors,
        warnings,
        sanitizedOrder: validationResult.sanitized,
        securityContext: {
          apiValidation,
          rateLimitResult,
          csrfValidated: true,
          inputValidated: true,
        },
        requestId: requestId,
      };
    } catch (error) {
      logger.error('Order security validation error:', error);
      return {
        isValid: false,
        errors: ['Security validation process failed'],
        warnings,
        requestId: requestId,
      };
    }
  }

  /**
   * Record successful order execution for rate limiting
   */
  recordOrderExecution(params: {
    userId: string;
    ipAddress: string;
    orderType: string;
  }): void {
    this.rateLimiter.recordOrder(params);
  }

  /**
   * Generate CSRF token for order operations
   */
  generateCSRFToken(params: {
    userId: string;
    sessionId: string;
    orderContext?: string;
  }): string {
    return this.csrfProtection.generateToken(params);
  }

  /**
   * Get security headers for API responses
   */
  getSecurityHeaders(): Record<string, string> {
    return this.apiSecurity.getSecurityHeaders();
  }

  /**
   * Update security configurations by merging with existing configurations
   *
   * This method preserves internal state (rate limiting history, request signatures, etc.)
   * while updating configuration parameters. For a complete reset including state,
   * use the individual resetHistory methods on the respective components.
   *
   * @param config - Partial configuration updates for validation, rate limiting, and API security
   * @param config.validation - Partial validation configuration
   * @param config.rateLimit - Partial rate limiting configuration
   * @param config.apiSecurity - Partial API security configuration
   *
   * @example
   * // Update only rate limits, preserving history
   * orderSecurity.updateConfig({
   *   rateLimit: { userTierLimits: { bronze: { maxOrders: 5, windowMs: 60000 } } }
   * });
   *
   * @example
   * // Reset rate limiting history completely (use with caution)
   * orderSecurity.rateLimiter.resetHistory(true);
   */
  updateConfig(config: {
    validation?: Partial<OrderValidationConfig>;
    rateLimit?: Partial<OrderRateLimitConfig>;
    apiSecurity?: Partial<APISecurityConfig>;
  }): void {
    if (config.validation) {
      this.validator.updateConfig(config.validation);
    }
    if (config.rateLimit) {
      this.rateLimiter.updateConfig(config.rateLimit);
    }
    if (config.apiSecurity) {
      this.apiSecurity.updateConfig(config.apiSecurity);
    }
  }

  /**
   * Get current configuration from all security components
   *
   * @returns Current configuration object containing all security settings
   */
  getConfig(): {
    validation: OrderValidationConfig;
    rateLimit: OrderRateLimitConfig;
    apiSecurity: APISecurityConfig;
  } {
    return {
      validation: this.validator.getConfig(),
      rateLimit: this.rateLimiter.getConfig(),
      apiSecurity: this.apiSecurity.getConfig(),
    };
  }

  /**
   * Reset all security component histories (use with extreme caution)
   * This will clear all accumulated state including rate limiting history,
   * request signatures, suspicious patterns, etc. Only use when a complete
   * system reset is explicitly required.
   *
   * @param includeConfig - If true, also reset configurations to defaults
   * @param components - Which components to reset (defaults to all)
   */
  resetAllHistories(
    includeConfig: boolean = false,
    components?: ('validator' | 'rateLimiter' | 'apiSecurity')[]
  ): void {
    const componentsToReset = components || ['rateLimiter', 'apiSecurity'];

    if (componentsToReset.includes('rateLimiter')) {
      this.rateLimiter.resetHistory(includeConfig);
    }

    if (componentsToReset.includes('apiSecurity')) {
      this.apiSecurity.resetHistory(includeConfig);
    }

    // Note: Audit logger doesn't have a reset method as it logs to external system
    // CSRF protection doesn't maintain long-term state that needs resetting
    // Validator doesn't maintain history, just configuration
  }

  /**
   * Shutdown all security components and cleanup resources
   * This method should be called when the application is shutting down
   * to prevent memory leaks and ensure proper cleanup of timers.
   *
   * @param performFinalCleanup - If true, performs final cleanup of rate limiting data
   */
  shutdown(performFinalCleanup: boolean = true): void {
    logger.debug('Starting OrderSecurityOrchestrator shutdown');

    // Shutdown the rate limiter (this handles periodic cleanup timer)
    this.rateLimiter.shutdown(performFinalCleanup);

    // Clear any active CSRF tokens
    this.csrfProtection.invalidateUserTokens('*', '*'); // Invalidate all tokens

    // Reset API security history if requested
    if (performFinalCleanup) {
      this.apiSecurity.resetHistory(false);
    }

    logger.debug('OrderSecurityOrchestrator shutdown completed');
  }
}

// Export singleton instance
export const orderSecurity = new OrderSecurityOrchestrator();

export default orderSecurity;
