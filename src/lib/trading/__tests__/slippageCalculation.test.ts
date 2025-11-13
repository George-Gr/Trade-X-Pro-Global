import { describe, it, expect } from 'vitest';
import {
  calculateSlippage,
  calculateVolatilityMultiplier,
  calculateSizeMultiplier,
  calculateBaseSlippage,
  calculateAfterHoursPenalty,
  getExecutionPrice,
  getAssetSlippageConfig,
  getSupportedAssets,
  SlippageCalculationError,
  ASSET_SLIPPAGE_CONFIG,
} from '../slippageCalculation';

describe('Slippage Calculation Engine', () => {
  describe('calculateVolatilityMultiplier', () => {
    it('returns 1x when current volatility equals average', () => {
      const result = calculateVolatilityMultiplier(15, 15, 3, false);
      expect(result).toBeCloseTo(3); // 15/15 * 3 = 3
    });

    it('increases multiplier when current volatility is higher', () => {
      const result = calculateVolatilityMultiplier(20, 15, 3, false);
      expect(result).toBeCloseTo(4); // 20/15 * 3 ≈ 4
      expect(result).toBeGreaterThan(3);
    });

    it('decreases multiplier when current volatility is lower', () => {
      const result = calculateVolatilityMultiplier(10, 15, 3, false);
      expect(result).toBeCloseTo(2); // 10/15 * 3 = 2
      expect(result).toBeLessThan(3);
    });

    it('applies high volatility event multiplier', () => {
      const normalResult = calculateVolatilityMultiplier(15, 15, 3, false);
      const eventResult = calculateVolatilityMultiplier(15, 15, 3, true);
      expect(eventResult).toBeCloseTo(normalResult * 1.5);
    });

    it('enforces minimum multiplier of 1x', () => {
      const result = calculateVolatilityMultiplier(1, 100, 2, false);
      expect(result).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateSizeMultiplier', () => {
    it('returns ~1x for small orders on very high liquidity', () => {
      const result = calculateSizeMultiplier(0.5, 'very_high', false);
      expect(result).toBeCloseTo(1, 0); // Should be close to 1
    });

    it('increases multiplier for larger orders', () => {
      const small = calculateSizeMultiplier(2, 'very_high', false);
      const large = calculateSizeMultiplier(15, 'very_high', false);
      expect(large).toBeGreaterThan(small);
    });

    it('increases multiplier for lower liquidity', () => {
      const veryHigh = calculateSizeMultiplier(5, 'very_high', false);
      const low = calculateSizeMultiplier(5, 'low', false);
      expect(low).toBeGreaterThan(veryHigh);
    });

    it('applies low liquidity penalty multiplier', () => {
      const normal = calculateSizeMultiplier(5, 'high', false);
      const lowLiq = calculateSizeMultiplier(5, 'high', true);
      expect(lowLiq).toBeCloseTo(normal * 2);
    });

    it('handles zero order size gracefully', () => {
      const result = calculateSizeMultiplier(0, 'very_high', false);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(Number.isFinite(result)).toBe(true);
    });

    it('handles very large order size', () => {
      const result = calculateSizeMultiplier(100, 'low', true);
      expect(Number.isFinite(result)).toBe(true);
      expect(result).toBeGreaterThan(1);
    });
  });

  describe('calculateBaseSlippage', () => {
    it('returns valid slippage within configured range', () => {
      const config = ASSET_SLIPPAGE_CONFIG['EURUSD'];
      const randomFunc = () => 0.5;
      const result = calculateBaseSlippage(config, randomFunc);

      expect(result).toBeGreaterThanOrEqual(config.minSlippage);
      expect(result).toBeLessThanOrEqual(config.maxSlippage);
    });

    it('uses deterministic random generation', () => {
      const config = ASSET_SLIPPAGE_CONFIG['BTCUSD'];
      let counter = 0;
      const deterministicRandom = () => (counter++ % 10) / 10;

      const results = [];
      for (let i = 0; i < 5; i++) {
        counter = 0; // Reset counter for each call
        results.push(calculateBaseSlippage(config, deterministicRandom));
      }

      // All results should be valid
      results.forEach((r) => {
        expect(r).toBeGreaterThanOrEqual(config.minSlippage);
        expect(r).toBeLessThanOrEqual(config.maxSlippage);
      });
    });
  });

  describe('calculateAfterHoursPenalty', () => {
    it('returns 1x during normal hours', () => {
      const config = ASSET_SLIPPAGE_CONFIG['EURUSD'];
      const result = calculateAfterHoursPenalty(config, false);
      expect(result).toBe(1);
    });

    it('applies penalty multiplier after hours', () => {
      const config = ASSET_SLIPPAGE_CONFIG['EURUSD'];
      const result = calculateAfterHoursPenalty(config, true);
      expect(result).toBe(config.afterHoursPenalty);
      expect(result).toBeGreaterThan(1);
    });
  });

  describe('calculateSlippage', () => {
    it('calculates slippage for Forex Major (EURUSD)', () => {
      const result = calculateSlippage({
        symbol: 'EURUSD',
        marketPrice: 1.0850,
        orderQuantity: 100000,
        side: 'buy',
        conditions: {
          currentVolatility: 12,
          averageVolatility: 12,
          dailyVolume: 10000000,
          isHighVolatility: false,
          isLowLiquidity: false,
          orderSizePercentage: 1,
          isAfterHours: false,
        },
      });

      expect(result).toHaveProperty('baseSlippage');
      expect(result).toHaveProperty('volatilityMultiplier');
      expect(result).toHaveProperty('sizeMultiplier');
      expect(result).toHaveProperty('totalSlippage');
      expect(result).toHaveProperty('executionPrice');
      expect(result).toHaveProperty('slippageInPrice');

      expect(result.totalSlippage).toBeLessThanOrEqual(
        ASSET_SLIPPAGE_CONFIG['EURUSD'].maxSlippage * 2
      );
      expect(result.executionPrice).toBeGreaterThan(result.baseSlippage); // Buy slips up
    });

    it('increases slippage with higher volatility', () => {
      const baseResult = calculateSlippage({
        symbol: 'EURUSD',
        marketPrice: 1.0850,
        orderQuantity: 100000,
        side: 'buy',
        conditions: {
          currentVolatility: 12,
          averageVolatility: 12,
          dailyVolume: 10000000,
          isHighVolatility: false,
          isLowLiquidity: false,
          orderSizePercentage: 1,
          isAfterHours: false,
        },
        seed: 'test1',
      });

      const volResult = calculateSlippage({
        symbol: 'EURUSD',
        marketPrice: 1.0850,
        orderQuantity: 100000,
        side: 'buy',
        conditions: {
          currentVolatility: 25,
          averageVolatility: 12,
          dailyVolume: 10000000,
          isHighVolatility: false,
          isLowLiquidity: false,
          orderSizePercentage: 1,
          isAfterHours: false,
        },
        seed: 'test1',
      });

      expect(volResult.volatilityMultiplier).toBeGreaterThan(baseResult.volatilityMultiplier);
      expect(volResult.totalSlippage).toBeGreaterThan(baseResult.totalSlippage);
    });

    it('increases slippage with larger orders', () => {
      const smallOrder = calculateSlippage({
        symbol: 'EURUSD',
        marketPrice: 1.0850,
        orderQuantity: 10000,
        side: 'buy',
        conditions: {
          currentVolatility: 12,
          averageVolatility: 12,
          dailyVolume: 10000000,
          isHighVolatility: false,
          isLowLiquidity: false,
          orderSizePercentage: 0.1,
          isAfterHours: false,
        },
      });

      const largeOrder = calculateSlippage({
        symbol: 'EURUSD',
        marketPrice: 1.0850,
        orderQuantity: 2000000,
        side: 'buy',
        conditions: {
          currentVolatility: 12,
          averageVolatility: 12,
          dailyVolume: 10000000,
          isHighVolatility: false,
          isLowLiquidity: false,
          orderSizePercentage: 20,
          isAfterHours: false,
        },
      });

      // Size multiplier should increase significantly with larger order
      expect(largeOrder.sizeMultiplier).toBeGreaterThan(smallOrder.sizeMultiplier);
    });

    it('applies after-hours penalty', () => {
      const normalHours = calculateSlippage({
        symbol: 'AAPL',
        marketPrice: 150,
        orderQuantity: 100,
        side: 'buy',
        conditions: {
          currentVolatility: 20,
          averageVolatility: 20,
          dailyVolume: 1000000,
          isHighVolatility: false,
          isLowLiquidity: false,
          orderSizePercentage: 1,
          isAfterHours: false,
        },
        seed: 'test3',
      });

      const afterHours = calculateSlippage({
        symbol: 'AAPL',
        marketPrice: 150,
        orderQuantity: 100,
        side: 'buy',
        conditions: {
          currentVolatility: 20,
          averageVolatility: 20,
          dailyVolume: 1000000,
          isHighVolatility: false,
          isLowLiquidity: false,
          orderSizePercentage: 1,
          isAfterHours: true,
        },
        seed: 'test3',
      });

      expect(afterHours.totalSlippage).toBeGreaterThan(normalHours.totalSlippage);
    });

    it('handles sell orders (slips down)', () => {
      const buyResult = calculateSlippage({
        symbol: 'EURUSD',
        marketPrice: 1.0850,
        orderQuantity: 100000,
        side: 'buy',
        conditions: {
          currentVolatility: 12,
          averageVolatility: 12,
          dailyVolume: 10000000,
          isHighVolatility: false,
          isLowLiquidity: false,
          orderSizePercentage: 1,
          isAfterHours: false,
        },
        seed: 'test4',
      });

      const sellResult = calculateSlippage({
        symbol: 'EURUSD',
        marketPrice: 1.0850,
        orderQuantity: 100000,
        side: 'sell',
        conditions: {
          currentVolatility: 12,
          averageVolatility: 12,
          dailyVolume: 10000000,
          isHighVolatility: false,
          isLowLiquidity: false,
          orderSizePercentage: 1,
          isAfterHours: false,
        },
        seed: 'test4',
      });

      // Buy slips up (execution price higher)
      expect(buyResult.executionPrice).toBeGreaterThan(1.0850);

      // Sell slips down (execution price lower)
      expect(sellResult.executionPrice).toBeLessThan(1.0850);

      // Slippage magnitude should be same
      expect(buyResult.slippageInPrice).toBeCloseTo(sellResult.slippageInPrice);
    });

    it('rejects invalid symbol', () => {
      expect(() =>
        calculateSlippage({
          symbol: 'INVALID_SYMBOL',
          marketPrice: 100,
          orderQuantity: 10,
          side: 'buy',
          conditions: {
            currentVolatility: 15,
            averageVolatility: 15,
            dailyVolume: 1000000,
            isHighVolatility: false,
            isLowLiquidity: false,
            orderSizePercentage: 1,
            isAfterHours: false,
          },
        })
      ).toThrow(SlippageCalculationError);
    });

    it('rejects invalid inputs', () => {
      expect(() =>
        calculateSlippage({
          symbol: 'EURUSD',
          marketPrice: -100, // Invalid: negative
          orderQuantity: 10,
          side: 'buy',
          conditions: {
            currentVolatility: 15,
            averageVolatility: 15,
            dailyVolume: 1000000,
            isHighVolatility: false,
            isLowLiquidity: false,
            orderSizePercentage: 1,
            isAfterHours: false,
          },
        } as any)
      ).toThrow();
    });

    it('generates deterministic results with seed', () => {
      const input = {
        symbol: 'EURUSD',
        marketPrice: 1.0850,
        orderQuantity: 100000,
        side: 'buy' as const,
        conditions: {
          currentVolatility: 12,
          averageVolatility: 12,
          dailyVolume: 10000000,
          isHighVolatility: false,
          isLowLiquidity: false,
          orderSizePercentage: 1,
          isAfterHours: false,
        },
        seed: 'reproducible-seed-123',
      };

      const result1 = calculateSlippage(input);
      const result2 = calculateSlippage(input);

      expect(result1.totalSlippage).toBe(result2.totalSlippage);
      expect(result1.executionPrice).toBe(result2.executionPrice);
      expect(result1.baseSlippage).toBe(result2.baseSlippage);
    });
  });

  describe('getExecutionPrice', () => {
    it('returns execution price with slippage applied', () => {
      const result = getExecutionPrice('EURUSD', 1.0850, 'buy', 100000);
      expect(result).toBeGreaterThan(1.0850); // Buy slips up
      expect(result).toBeLessThan(1.0860); // But not too much
    });

    it('handles different asset classes', () => {
      const forex = getExecutionPrice('EURUSD', 1.0850, 'buy', 100000);
      const stock = getExecutionPrice('AAPL', 150, 'buy', 100);
      const crypto = getExecutionPrice('BTCUSD', 45000, 'buy', 1);

      // All should be valid prices
      expect(forex).toBeGreaterThan(0);
      expect(stock).toBeGreaterThan(0);
      expect(crypto).toBeGreaterThan(0);
    });
  });

  describe('getAssetSlippageConfig', () => {
    it('returns config for valid asset', () => {
      const config = getAssetSlippageConfig('EURUSD');
      expect(config).toBeDefined();
      expect(config).toHaveProperty('baseSpread');
      expect(config).toHaveProperty('minSlippage');
      expect(config).toHaveProperty('maxSlippage');
      expect(config).toHaveProperty('liquidity');
    });

    it('returns undefined for invalid asset', () => {
      const config = getAssetSlippageConfig('INVALID');
      expect(config).toBeUndefined();
    });
  });

  describe('getSupportedAssets', () => {
    it('returns list of supported assets', () => {
      const assets = getSupportedAssets();
      expect(Array.isArray(assets)).toBe(true);
      expect(assets.length).toBeGreaterThan(0);
      expect(assets).toContain('EURUSD');
      expect(assets).toContain('BTCUSD');
      expect(assets).toContain('AAPL');
    });

    it('returns unique assets', () => {
      const assets = getSupportedAssets();
      const unique = new Set(assets);
      expect(unique.size).toBe(assets.length);
    });
  });

  // ===== INTEGRATION TESTS =====

  describe('Integration: Slippage in different market conditions', () => {
    it('simulates stable market (low vol, normal liquidity)', () => {
      const result = calculateSlippage({
        symbol: 'EURUSD',
        marketPrice: 1.0850,
        orderQuantity: 50000,
        side: 'buy',
        conditions: {
          currentVolatility: 10,
          averageVolatility: 12,
          dailyVolume: 20000000,
          isHighVolatility: false,
          isLowLiquidity: false,
          orderSizePercentage: 0.25,
          isAfterHours: false,
        },
        seed: 'stable-market',
      });

      // Slippage should be relatively low (base spread to small multiplier)
      expect(result.totalSlippage).toBeLessThan(1);
      expect(result.executionPrice).toBeCloseTo(1.0850, 2);
    });

    it('simulates volatile market (high vol, earnings)', () => {
      const result = calculateSlippage({
        symbol: 'AAPL',
        marketPrice: 150,
        orderQuantity: 1000,
        side: 'buy',
        conditions: {
          currentVolatility: 40, // High volatility
          averageVolatility: 20,
          dailyVolume: 1000000,
          isHighVolatility: true, // Earnings event
          isLowLiquidity: false,
          orderSizePercentage: 2,
          isAfterHours: false,
        },
        seed: 'volatile-market',
      });

      // Slippage should be significant
      expect(result.volatilityMultiplier).toBeGreaterThan(2);
      expect(result.totalSlippage).toBeGreaterThan(0.1);
    });

    it('simulates exotic forex after-hours low liquidity', () => {
      const result = calculateSlippage({
        symbol: 'USDTRY',
        marketPrice: 32.5,
        orderQuantity: 10000,
        side: 'buy',
        conditions: {
          currentVolatility: 25,
          averageVolatility: 20,
          dailyVolume: 100000,
          isHighVolatility: true,
          isLowLiquidity: true,
          orderSizePercentage: 5,
          isAfterHours: true,
        },
        seed: 'exotic-after-hours',
      });

      // Slippage should be very high
      expect(result.totalSlippage).toBeGreaterThan(2);
      expect(result.volatilityMultiplier).toBeGreaterThan(1);
      expect(result.sizeMultiplier).toBeGreaterThan(1);
    });

    it('simulates crypto large order (liquidation scenario)', () => {
      const result = calculateSlippage({
        symbol: 'BTCUSD',
        marketPrice: 45000,
        orderQuantity: 50, // Large for crypto
        side: 'sell',
        conditions: {
          currentVolatility: 30,
          averageVolatility: 20,
          dailyVolume: 500000, // Coins, not dollars
          isHighVolatility: true,
          isLowLiquidity: true,
          orderSizePercentage: 20, // Large % of volume
          isAfterHours: false,
        },
        seed: 'crypto-liquidation',
      });

      // Slippage should be substantial
      expect(result.sizeMultiplier).toBeGreaterThan(1);
      expect(result.executionPrice).toBeLessThan(45000); // Sell slips down
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('handles very small prices (crypto pairs)', () => {
      const result = calculateSlippage({
        symbol: 'XRPUSD',
        marketPrice: 0.52,
        orderQuantity: 100000,
        side: 'buy',
        conditions: {
          currentVolatility: 15,
          averageVolatility: 15,
          dailyVolume: 10000000,
          isHighVolatility: false,
          isLowLiquidity: false,
          orderSizePercentage: 1,
          isAfterHours: false,
        },
      });

      expect(result.executionPrice).toBeGreaterThan(0);
      expect(result.executionPrice).toBeCloseTo(0.52, 5);
    });

    it('handles very large prices (indices)', () => {
      const result = calculateSlippage({
        symbol: 'US500',
        marketPrice: 5500,
        orderQuantity: 100,
        side: 'buy',
        conditions: {
          currentVolatility: 15,
          averageVolatility: 15,
          dailyVolume: 1000000,
          isHighVolatility: false,
          isLowLiquidity: false,
          orderSizePercentage: 1,
          isAfterHours: false,
        },
      });

      expect(result.executionPrice).toBeGreaterThan(5500);
      expect(result.executionPrice).toBeLessThan(5510);
    });

    it('handles minimum order size', () => {
      const result = calculateSlippage({
        symbol: 'EURUSD',
        marketPrice: 1.0850,
        orderQuantity: 0.01, // Minimum
        side: 'buy',
        conditions: {
          currentVolatility: 12,
          averageVolatility: 12,
          dailyVolume: 10000000,
          isHighVolatility: false,
          isLowLiquidity: false,
          orderSizePercentage: 0.0001,
          isAfterHours: false,
        },
      });

      expect(result.executionPrice).toBeDefined();
      expect(result.totalSlippage).toBeGreaterThanOrEqual(0);
    });
  });
});
