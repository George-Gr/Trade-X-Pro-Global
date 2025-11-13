import { describe, it, expect } from 'vitest';
import {
  validateOrderInput,
  validateQuantity,
  validateAccountStatus,
  validateKYCStatus,
  validateMarketHours,
  validateLeverage,
  ValidationError,
} from '../orderValidation';

describe('orderValidation', () => {
  it('accepts a valid order payload', () => {
    const payload = {
      symbol: 'BTC_USD',
      order_type: 'market',
      side: 'buy',
      quantity: 1,
      idempotency_key: 'test-1'
    } as const;

    const parsed = validateOrderInput(payload);
    expect(parsed.symbol).toBe('BTC_USD');
    expect(parsed.idempotency_key).toBe('test-1');
  });

  it('rejects invalid symbol', () => {
    const payload = {
      symbol: '',
      order_type: 'market',
      side: 'buy',
      quantity: 1,
      idempotency_key: 'test-2'
    } as any;

    expect(() => validateOrderInput(payload)).toThrow();
  });

  it('validates quantity within bounds', () => {
    const assetSpec = { min_quantity: 1, max_quantity: 10 };
    expect(() => validateQuantity({ quantity: 5 }, assetSpec)).not.toThrow();
    expect(() => validateQuantity({ quantity: 0 }, assetSpec)).toThrow(ValidationError);
    expect(() => validateQuantity({ quantity: 11 }, assetSpec)).toThrow(ValidationError);
  });

  it('checks account and kyc status', () => {
    const goodProfile = { account_status: 'active', kyc_status: 'approved' };
    expect(() => validateAccountStatus(goodProfile)).not.toThrow();
    expect(() => validateKYCStatus(goodProfile)).not.toThrow();

    const suspended = { account_status: 'suspended', kyc_status: 'approved' };
    expect(() => validateAccountStatus(suspended)).toThrow(ValidationError);

    const notKyc = { account_status: 'active', kyc_status: 'pending' };
    expect(() => validateKYCStatus(notKyc)).toThrow(ValidationError);
  });

  it('validates market hours', () => {
    const assetSpecOpen = { trading_hours: { open: '00:00', close: '23:59' } };
    expect(() => validateMarketHours(assetSpecOpen, new Date())).not.toThrow();

    const now = new Date();
    // set trading hours to a window that excludes current time
    const assetSpecClosed = { trading_hours: { open: '00:00', close: '00:01' } };
    // If current time falls outside, expect a ValidationError; adjust by using a far future date to ensure outside
    const farFuture = new Date('2099-01-01T12:00:00Z');
    expect(() => validateMarketHours(assetSpecClosed, farFuture)).toThrow(ValidationError);
  });

  it('validates leverage limits', () => {
    const profile = { max_leverage: 10 };
    const assetSpec = { leverage: 5 };
    expect(() => validateLeverage(profile, assetSpec)).not.toThrow();

    const assetHigh = { leverage: 20 };
    expect(() => validateLeverage(profile, assetHigh)).toThrow(ValidationError);
  });

  // === INTEGRATION TESTS ===

  describe('integration: full order validation flow', () => {
    it('accepts a valid order when all validations pass', () => {
      // Simulate complete flow: order input → asset exists → quantity valid → account active → KYC approved → market open → leverage OK
      const orderPayload = {
        symbol: 'BTC_USD',
        order_type: 'market',
        side: 'buy',
        quantity: 5,
        idempotency_key: 'int-test-valid-1'
      } as const;

      const asset = {
        symbol: 'BTC_USD',
        min_quantity: 1,
        max_quantity: 100,
        leverage: 2,
        trading_hours: { open: '00:00', close: '23:59' }
      };

      const profile = {
        account_status: 'active',
        kyc_status: 'approved',
        max_leverage: 10
      };

      // Test each validation independently for this scenario
      expect(() => validateOrderInput(orderPayload)).not.toThrow();
      expect(() => validateQuantity(orderPayload, asset)).not.toThrow();
      expect(() => validateAccountStatus(profile)).not.toThrow();
      expect(() => validateKYCStatus(profile)).not.toThrow();
      expect(() => validateMarketHours(asset, new Date())).not.toThrow();
      expect(() => validateLeverage(profile, asset)).not.toThrow();
    });

    it('rejects order when validation fails independently', () => {
      const orderPayload = {
        symbol: 'BTC_USD',
        order_type: 'market',
        side: 'buy',
        quantity: 5,
        idempotency_key: 'int-test-fail-1'
      } as const;

      const validAsset = {
        symbol: 'BTC_USD',
        min_quantity: 1,
        max_quantity: 100,
        leverage: 2,
        trading_hours: { open: '00:00', close: '23:59' }
      };

      const validProfile = {
        account_status: 'active',
        kyc_status: 'approved',
        max_leverage: 10
      };

      // Test 1: Invalid order input (empty symbol)
      expect(() => validateOrderInput({ ...orderPayload, symbol: '' } as any)).toThrow(ValidationError);

      // Test 2: Quantity exceeds max
      expect(() => validateQuantity({ quantity: 150 }, validAsset)).toThrow(ValidationError);

      // Test 3: Account suspended
      expect(() => validateAccountStatus({ account_status: 'suspended' })).toThrow(ValidationError);

      // Test 4: KYC not approved
      expect(() => validateKYCStatus({ kyc_status: 'pending' })).toThrow(ValidationError);

      // Test 5: Market closed (using a date outside trading hours)
      const closedAsset = { trading_hours: { open: '00:00', close: '00:01' } };
      const farFuture = new Date('2099-01-01T12:00:00Z');
      expect(() => validateMarketHours(closedAsset, farFuture)).toThrow(ValidationError);

      // Test 6: Leverage exceeds max
      expect(() => validateLeverage({ max_leverage: 2 }, { leverage: 5 })).toThrow(ValidationError);
    });
  });
});
