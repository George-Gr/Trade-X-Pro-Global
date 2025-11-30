/**
 * Commission Calculation Tests
 * 
 * Test suite for commission calculation engine:
 * - Asset class configurations
 * - Base commission calculations (per-share, per-contract, percentage)
 * - Tier-based multipliers and discounts
 * - Min/max commission bounds
 * - Batch calculations
 * - Edge cases and error handling
 */

import { describe, it, expect } from 'vitest';
import {
  AssetClass,
  AccountTier,
  calculateCommission,
  calculateCommissionBatch,
  calculateTotalCommission,
  calculateBaseCommission,
  getTierMultiplier,
  applyCommissionBounds,
  calculateOrderCostWithCommission,
  getCommissionConfig,
  CommissionCalculationError,
  getSupportedAssetClasses,
  getAvailableAccountTiers,
  formatCommission,
  CommissionCalculationInput,
} from '../commissionCalculation';

describe('Commission Calculation Engine', () => {
  describe('Asset Class Configuration', () => {
    it('should have configuration for all asset classes', () => {
      const assetClasses = getSupportedAssetClasses();
      expect(assetClasses).toContain(AssetClass.Stock);
      expect(assetClasses).toContain(AssetClass.Forex);
      expect(assetClasses).toContain(AssetClass.Crypto);
      expect(assetClasses).toHaveLength(7); // 7 asset classes
    });

    it('should return commission config for stock', () => {
      const config = getCommissionConfig(AssetClass.Stock);
      expect(config.hasCommission).toBe(true);
      expect(config.commissionType).toBe('per_share');
      expect(config.baseCommission).toBe(0.02);
    });

    it('should return commission config for forex (no commission)', () => {
      const config = getCommissionConfig(AssetClass.Forex);
      expect(config.hasCommission).toBe(false);
      expect(config.commissionType).toBe('none');
      expect(config.baseCommission).toBe(0);
    });

    it('should return commission config for ETF', () => {
      const config = getCommissionConfig(AssetClass.ETF);
      expect(config.hasCommission).toBe(true);
      expect(config.commissionType).toBe('per_share');
      expect(config.baseCommission).toBe(0.02); // Same as stocks
    });

    it('should throw error for invalid asset class', () => {
      expect(() => {
        getCommissionConfig('invalid' as AssetClass);
      }).toThrow(CommissionCalculationError);
    });
  });

  describe('Stock Commission Calculation', () => {
    it('should calculate per-share commission for 100 shares at $150', () => {
      const result = calculateCommission({
        symbol: 'AAPL',
        assetClass: AssetClass.Stock,
        side: 'buy',
        quantity: 100,
        executionPrice: 150.0,
        accountTier: AccountTier.Standard,
      });

      expect(result.baseCommission).toBe(2.0); // 100 * $0.02
      expect(result.totalCommission).toBe(2.0);
      expect(result.tierMultiplier).toBe(1.0);
    });

    it('should apply minimum commission of $1', () => {
      const result = calculateCommission({
        symbol: 'BRK.A',
        assetClass: AssetClass.Stock,
        side: 'buy',
        quantity: 1,
        executionPrice: 500000.0,
        accountTier: AccountTier.Standard,
      });

      expect(result.baseCommission).toBe(0.02); // 1 * $0.02
      expect(result.totalCommission).toBe(1.0); // Minimum commission applied
    });

    it('should apply maximum commission of $50', () => {
      const result = calculateCommission({
        symbol: 'TSLA',
        assetClass: AssetClass.Stock,
        side: 'buy',
        quantity: 5000,
        executionPrice: 250.0,
        accountTier: AccountTier.Standard,
      });

      const baseCalc = 5000 * 0.02; // $100
      expect(result.baseCommission).toBe(baseCalc);
      expect(result.totalCommission).toBe(50.0); // Maximum commission applied
    });

    it('should calculate commission for both buy and sell', () => {
      const buyResult = calculateCommission({
        symbol: 'MSFT',
        assetClass: AssetClass.Stock,
        side: 'buy',
        quantity: 50,
        executionPrice: 300.0,
        accountTier: AccountTier.Standard,
      });

      const sellResult = calculateCommission({
        symbol: 'MSFT',
        assetClass: AssetClass.Stock,
        side: 'sell',
        quantity: 50,
        executionPrice: 300.0,
        accountTier: AccountTier.Standard,
      });

      expect(buyResult.totalCommission).toBe(sellResult.totalCommission);
      expect(buyResult.totalCommission).toBe(1.0); // 50 * $0.02 = $1.00
    });
  });

  describe('ETF Commission Calculation', () => {
    it('should calculate ETF commission (same as stocks)', () => {
      const result = calculateCommission({
        symbol: 'VOO',
        assetClass: AssetClass.ETF,
        side: 'buy',
        quantity: 100,
        executionPrice: 500.0,
        accountTier: AccountTier.Standard,
      });

      expect(result.baseCommission).toBe(2.0); // 100 * $0.02
      expect(result.totalCommission).toBe(2.0);
    });
  });

  describe('Forex Commission Calculation', () => {
    it('should have zero commission for forex (spread only)', () => {
      const result = calculateCommission({
        symbol: 'EURUSD',
        assetClass: AssetClass.Forex,
        side: 'buy',
        quantity: 100000,
        executionPrice: 1.0850,
        accountTier: AccountTier.Standard,
      });

      expect(result.totalCommission).toBe(0);
      expect(result.notes).toBeUndefined();
    });
  });

  describe('Crypto Commission Calculation', () => {
    it('should have zero commission for crypto', () => {
      const result = calculateCommission({
        symbol: 'BTCUSD',
        assetClass: AssetClass.Crypto,
        side: 'buy',
        quantity: 0.5,
        executionPrice: 42000.0,
        accountTier: AccountTier.Standard,
      });

      expect(result.totalCommission).toBe(0);
    });
  });

  describe('Tier-Based Discounts', () => {
    const baseInput = {
      symbol: 'AAPL',
      assetClass: AssetClass.Stock,
      side: 'buy' as const,
      quantity: 100,
      executionPrice: 150.0,
    };

    it('should apply 10% discount for Silver tier', () => {
      const result = calculateCommission({
        ...baseInput,
        accountTier: AccountTier.Silver,
      });

      expect(result.baseCommission).toBe(2.0); // 100 * $0.02
      expect(result.tierMultiplier).toBe(0.9);
      expect(result.totalCommission).toBe(1.8); // $2.00 * 0.9
    });

    it('should apply 20% discount for Gold tier', () => {
      const result = calculateCommission({
        ...baseInput,
        accountTier: AccountTier.Gold,
      });

      expect(result.tierMultiplier).toBe(0.8);
      expect(result.totalCommission).toBe(1.6); // $2.00 * 0.8
      expect(result.notes).toContain('20%');
    });

    it('should apply 30% discount for Platinum tier', () => {
      const result = calculateCommission({
        ...baseInput,
        accountTier: AccountTier.Platinum,
      });

      expect(result.tierMultiplier).toBe(0.7);
      expect(result.totalCommission).toBe(1.4); // $2.00 * 0.7
      expect(result.notes).toContain('30%');
    });

    it('should apply no discount for Standard tier', () => {
      const result = calculateCommission({
        ...baseInput,
        accountTier: AccountTier.Standard,
      });

      expect(result.tierMultiplier).toBe(1.0);
      expect(result.totalCommission).toBe(2.0);
      expect(result.notes).toBeUndefined();
    });

    it('should default to Standard tier if not specified', () => {
      const result = calculateCommission({
        symbol: 'MSFT',
        assetClass: AssetClass.Stock,
        side: 'buy' as const,
        quantity: 100,
        executionPrice: 300.0,
      });

      expect(result.tierMultiplier).toBe(1.0);
      expect(result.totalCommission).toBe(2.0);
    });
  });

  describe('Order Cost With Commission', () => {
    it('should calculate buy cost including commission', () => {
      const orderValue = 100 * 150.0; // $15,000
      const commission = 2.0;
      const totalCost = calculateOrderCostWithCommission(100, 150.0, commission, 'buy');

      expect(totalCost).toBe(15002.0); // Order + commission
    });

    it('should calculate sell proceeds deducting commission', () => {
      const orderValue = 100 * 150.0; // $15,000
      const commission = 2.0;
      const netProceeds = calculateOrderCostWithCommission(100, 150.0, commission, 'sell');

      expect(netProceeds).toBe(14998.0); // Order - commission
    });
  });

  describe('Batch Commission Calculation', () => {
    it('should calculate commissions for multiple orders', () => {
      const orders: CommissionCalculationInput[] = [
        {
          symbol: 'AAPL',
          assetClass: AssetClass.Stock,
          side: 'buy',
          quantity: 100,
          executionPrice: 150.0,
          accountTier: AccountTier.Standard,
        },
        {
          symbol: 'MSFT',
          assetClass: AssetClass.Stock,
          side: 'buy',
          quantity: 50,
          executionPrice: 300.0,
          accountTier: AccountTier.Gold,
        },
        {
          symbol: 'EURUSD',
          assetClass: AssetClass.Forex,
          side: 'buy',
          quantity: 100000,
          executionPrice: 1.0850,
          accountTier: AccountTier.Standard,
        },
      ];

      const results = calculateCommissionBatch(orders);

      expect(results).toHaveLength(3);
      expect(results[0].totalCommission).toBe(2.0); // AAPL: 100 * 0.02 = 2.0
      expect(results[1].totalCommission).toBe(1.0); // MSFT: 50 * 0.02 * 0.8 = 0.8, but min $1
      expect(results[2].totalCommission).toBe(0); // Forex (no commission)
    });

    it('should calculate total commission across all orders', () => {
      const orders: CommissionCalculationInput[] = [
        {
          symbol: 'AAPL',
          assetClass: AssetClass.Stock,
          side: 'buy',
          quantity: 100,
          executionPrice: 150.0,
          accountTier: AccountTier.Standard,
        },
        {
          symbol: 'MSFT',
          assetClass: AssetClass.Stock,
          side: 'buy',
          quantity: 50,
          executionPrice: 300.0,
          accountTier: AccountTier.Gold,
        },
      ];

      const total = calculateTotalCommission(orders);

      expect(total).toBe(3.0); // $2.00 + $1.00 (MSFT applies minimum)
    });
  });

  describe('Edge Cases', () => {
    it('should handle fractional shares (ETF)', () => {
      const result = calculateCommission({
        symbol: 'VOO',
        assetClass: AssetClass.ETF,
        side: 'buy',
        quantity: 2.5,
        executionPrice: 500.0,
        accountTier: AccountTier.Standard,
      });

      expect(result.totalCommission).toBe(Math.max(0.05, 1.0)); // $0.05 but min is $1
      expect(result.totalCommission).toBe(1.0);
    });

    it('should handle very large orders', () => {
      const result = calculateCommission({
        symbol: 'AAPL',
        assetClass: AssetClass.Stock,
        side: 'buy',
        quantity: 100000,
        executionPrice: 150.0,
        accountTier: AccountTier.Standard,
      });

      const baseCalc = 100000 * 0.02; // $2,000
      expect(result.baseCommission).toBe(baseCalc);
      expect(result.totalCommission).toBe(50.0); // Maximum cap applied
    });

    it('should handle very small decimal prices', () => {
      const result = calculateCommission({
        symbol: 'EURUSD',
        assetClass: AssetClass.Forex,
        side: 'buy',
        quantity: 100000,
        executionPrice: 0.9999,
        accountTier: AccountTier.Standard,
      });

      // Forex has no commission
      expect(result.totalCommission).toBe(0);
    });

    it('should handle commission rounding correctly', () => {
      const result = calculateCommission({
        symbol: 'AAPL',
        assetClass: AssetClass.Stock,
        side: 'buy' as const,
        quantity: 33,
        executionPrice: 150.0,
        accountTier: AccountTier.Silver,
      });

      // Base: 33 * 0.02 * 0.9 = 0.594 → rounds to $0.59, but min is $1.00
      expect(result.totalCommission).toBe(1.0); // Minimum commission applied
      expect(Number.isInteger(result.totalCommission * 100)).toBe(true); // Valid cents
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid asset class', () => {
      expect(() => {
        calculateCommission({
          symbol: 'AAPL',
          assetClass: 'invalid' as AssetClass,
          side: 'buy',
          quantity: 100,
          executionPrice: 150.0,
        });
      }).toThrow();
    });

    it('should reject invalid side', () => {
      expect(() => {
        calculateCommission({
          symbol: 'AAPL',
          assetClass: AssetClass.Stock,
          side: 'invalid' as unknown as 'buy' | 'sell',
          quantity: 100,
          executionPrice: 150.0,
        });
      }).toThrow();
    });

    it('should reject zero quantity', () => {
      expect(() => {
        calculateCommission({
          symbol: 'AAPL',
          assetClass: AssetClass.Stock,
          side: 'buy',
          quantity: 0,
          executionPrice: 150.0,
        });
      }).toThrow();
    });

    it('should reject negative quantity', () => {
      expect(() => {
        calculateCommission({
          symbol: 'AAPL',
          assetClass: AssetClass.Stock,
          side: 'buy',
          quantity: -100,
          executionPrice: 150.0,
        });
      }).toThrow();
    });

    it('should reject zero price', () => {
      expect(() => {
        calculateCommission({
          symbol: 'AAPL',
          assetClass: AssetClass.Stock,
          side: 'buy',
          quantity: 100,
          executionPrice: 0,
        });
      }).toThrow();
    });

    it('should reject negative price', () => {
      expect(() => {
        calculateCommission({
          symbol: 'AAPL',
          assetClass: AssetClass.Stock,
          side: 'buy',
          quantity: 100,
          executionPrice: -150.0,
        });
      }).toThrow();
    });

    it('should reject empty symbol', () => {
      expect(() => {
        calculateCommission({
          symbol: '',
          assetClass: AssetClass.Stock,
          side: 'buy',
          quantity: 100,
          executionPrice: 150.0,
        });
      }).toThrow();
    });
  });

  describe('Formatting Utilities', () => {
    it('should format commission with default USD symbol', () => {
      const formatted = formatCommission(2.5);
      expect(formatted).toBe('$2.50');
    });

    it('should format commission with custom currency symbol', () => {
      const formatted = formatCommission(150.75, '£');
      expect(formatted).toBe('£150.75');
    });

    it('should format zero commission', () => {
      const formatted = formatCommission(0);
      expect(formatted).toBe('$0.00');
    });

    it('should format large commission', () => {
      const formatted = formatCommission(1234.56);
      expect(formatted).toBe('$1234.56');
    });
  });

  describe('Account Tier Coverage', () => {
    it('should return all available account tiers', () => {
      const tiers = getAvailableAccountTiers();
      expect(tiers).toContain(AccountTier.Standard);
      expect(tiers).toContain(AccountTier.Silver);
      expect(tiers).toContain(AccountTier.Gold);
      expect(tiers).toContain(AccountTier.Platinum);
      expect(tiers).toHaveLength(4);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle realistic day trading scenario', () => {
      // Day trader: 5 round-trip trades, Gold tier
      const orders: CommissionCalculationInput[] = [
        // Buy AAPL
        {
          symbol: 'AAPL',
          assetClass: AssetClass.Stock,
          side: 'buy',
          quantity: 100,
          executionPrice: 150.0,
          accountTier: AccountTier.Gold,
        },
        // Sell AAPL
        {
          symbol: 'AAPL',
          assetClass: AssetClass.Stock,
          side: 'sell',
          quantity: 100,
          executionPrice: 150.5,
          accountTier: AccountTier.Gold,
        },
        // Buy MSFT
        {
          symbol: 'MSFT',
          assetClass: AssetClass.Stock,
          side: 'buy',
          quantity: 50,
          executionPrice: 300.0,
          accountTier: AccountTier.Gold,
        },
        // Sell MSFT
        {
          symbol: 'MSFT',
          assetClass: AssetClass.Stock,
          side: 'sell',
          quantity: 50,
          executionPrice: 301.0,
          accountTier: AccountTier.Gold,
        },
        // Hedge with Forex
        {
          symbol: 'EURUSD',
          assetClass: AssetClass.Forex,
          side: 'buy',
          quantity: 100000,
          executionPrice: 1.0850,
          accountTier: AccountTier.Gold,
        },
      ];

      const total = calculateTotalCommission(orders);

      expect(total).toBe(5.2);
      // AAPL buy: $2 * 0.8 = $1.60
      // AAPL sell: $2 * 0.8 = $1.60
      // MSFT buy: $1 (minimum) * 0.8 = $1.00 (minimum applies)
      // MSFT sell: $1 (minimum) * 0.8 = $1.00 (minimum applies)
      // Forex: $0
    });

    it('should handle mixed asset class portfolio', () => {
      const portfolio: CommissionCalculationInput[] = [
        {
          symbol: 'AAPL',
          assetClass: AssetClass.Stock,
          side: 'buy',
          quantity: 100,
          executionPrice: 150.0,
          accountTier: AccountTier.Silver,
        },
        {
          symbol: 'VOO',
          assetClass: AssetClass.ETF,
          side: 'buy',
          quantity: 50,
          executionPrice: 500.0,
          accountTier: AccountTier.Silver,
        },
        {
          symbol: 'BND',
          assetClass: AssetClass.Bond,
          side: 'buy',
          quantity: 1000,
          executionPrice: 100.0,
          accountTier: AccountTier.Silver,
        },
        {
          symbol: 'GLD',
          assetClass: AssetClass.Commodity,
          side: 'buy',
          quantity: 10,
          executionPrice: 1800.0,
          accountTier: AccountTier.Silver,
        },
        {
          symbol: 'SPX',
          assetClass: AssetClass.Index,
          side: 'buy',
          quantity: 1,
          executionPrice: 4500.0,
          accountTier: AccountTier.Silver,
        },
        {
          symbol: 'BTCUSD',
          assetClass: AssetClass.Crypto,
          side: 'buy',
          quantity: 0.5,
          executionPrice: 42000.0,
          accountTier: AccountTier.Silver,
        },
      ];

      const results = calculateCommissionBatch(portfolio);
      const total = calculateTotalCommission(portfolio);

      // Only stocks/ETFs have commission
      expect(results[0].totalCommission).toBeGreaterThan(0); // AAPL
      expect(results[1].totalCommission).toBeGreaterThan(0); // VOO
      expect(results[2].totalCommission).toBe(0); // Bond
      expect(results[3].totalCommission).toBe(0); // Commodity
      expect(results[4].totalCommission).toBe(0); // Index
      expect(results[5].totalCommission).toBe(0); // Crypto

      // Should be: AAPL ($100*0.02=2) + VOO ($50*0.02=1) = $3 before tier
      // After Silver tier 0.9x: $2.70 for stock, but VOO (50 shares * 0.02 * 0.9 = 0.9, min $1) = $1
      // Total: $2.00 (AAPL with Silver) + $1.00 (VOO with minimum) = $3.00... actually let me recalculate
      // AAPL: 100 * 0.02 * 0.9 = 1.80 (no minimum)
      // VOO: 50 * 0.02 * 0.9 = 0.90, but min = 1.00
      // Total: 1.80 + 1.00 = 2.80
      const expectedStockCommission = (100 * 0.02 * 0.9) + Math.max(50 * 0.02 * 0.9, 1.0);
      expect(total).toBe(expectedStockCommission);
    });
  });
});
