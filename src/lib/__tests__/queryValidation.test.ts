import { logger } from '@/lib/logger';
import {
  QuerySchemas,
  safeValidateQueryParam,
  sanitizeLikePattern,
  validateQueryParam,
  validateQueryParams,
  validateSymbolArray,
  validateUuidArray,
} from '@/lib/queryValidation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

// Mock the logger to prevent console noise during tests
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Query Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('QuerySchemas', () => {
    describe('uuid', () => {
      it('should validate valid UUIDs', () => {
        const validUuids = [
          '123e4567-e89b-12d3-a456-426614174000',
          '550e8400-e29b-41d4-a716-446655440000',
          '00000000-0000-0000-0000-000000000000',
        ];

        validUuids.forEach((uuid) => {
          expect(() => QuerySchemas.uuid.parse(uuid)).not.toThrow();
        });
      });

      it('should reject invalid UUIDs', () => {
        const invalidUuids = [
          'not-a-uuid',
          '123e4567-e89b-12d3-a456', // too short
          '123e4567-e89b-12d3-a456-42661417400', // too long
          '123e4567-e89b-12d3-a456-42661417400x', // invalid character
          123, // wrong type
          null,
          undefined,
        ];

        invalidUuids.forEach((uuid) => {
          expect(() => QuerySchemas.uuid.parse(uuid)).toThrow();
        });
      });
    });

    describe('symbol', () => {
      it('should validate valid symbols', () => {
        const validSymbols = [
          'EURUSD',
          'BTC-USD',
          'AAPL',
          'TSLA',
          'test_symbol',
          '123',
          'a'.repeat(20), // max length
        ];

        validSymbols.forEach((symbol) => {
          expect(() => QuerySchemas.symbol.parse(symbol)).not.toThrow();
        });
      });

      it('should reject invalid symbols', () => {
        const invalidSymbols = [
          '', // empty
          'a'.repeat(21), // too long
          'EUR/USD', // invalid character
          'EUR@USD', // invalid character
          'EUR USD', // space not allowed
          123, // wrong type
          null,
          undefined,
        ];

        invalidSymbols.forEach((symbol) => {
          expect(() => QuerySchemas.symbol.parse(symbol)).toThrow();
        });
      });
    });

    describe('watchlistName', () => {
      it('should validate valid watchlist names', () => {
        const validNames = [
          'My Watchlist',
          'Trading_Portfolio',
          'Crypto-2024',
          'AAPL_Bullish',
          'a'.repeat(100), // max length
        ];

        validNames.forEach((name) => {
          expect(() => QuerySchemas.watchlistName.parse(name)).not.toThrow();
        });
      });

      it('should reject invalid watchlist names', () => {
        const invalidNames = [
          '', // empty
          'a'.repeat(101), // too long
          'Watchlist@2024', // invalid character
          'Portfolio!', // invalid character
          'Name/Here', // invalid character
          123, // wrong type
          null,
          undefined,
        ];

        invalidNames.forEach((name) => {
          expect(() => QuerySchemas.watchlistName.parse(name)).toThrow();
        });
      });
    });

    describe('orderStatus', () => {
      it('should validate valid order statuses', () => {
        const validStatuses = [
          'pending',
          'filled',
          'cancelled',
          'rejected',
          'open',
          'closed',
        ];

        validStatuses.forEach((status) => {
          expect(() => QuerySchemas.orderStatus.parse(status)).not.toThrow();
        });
      });

      it('should reject invalid order statuses', () => {
        const invalidStatuses = [
          'executed',
          'partial',
          'cancelledd',
          'pendinggg',
          123,
          null,
          undefined,
        ];

        invalidStatuses.forEach((status) => {
          expect(() => QuerySchemas.orderStatus.parse(status)).toThrow();
        });
      });
    });

    describe('positionStatus', () => {
      it('should validate valid position statuses', () => {
        const validStatuses = ['open', 'closed'];

        validStatuses.forEach((status) => {
          expect(() => QuerySchemas.positionStatus.parse(status)).not.toThrow();
        });
      });

      it('should reject invalid position statuses', () => {
        const invalidStatuses = [
          'pending',
          'filled',
          'cancelled',
          123,
          null,
          undefined,
        ];

        invalidStatuses.forEach((status) => {
          expect(() => QuerySchemas.positionStatus.parse(status)).toThrow();
        });
      });
    });

    describe('orderType', () => {
      it('should validate valid order types', () => {
        const validTypes = ['market', 'limit', 'stop', 'stop_limit'];

        validTypes.forEach((type) => {
          expect(() => QuerySchemas.orderType.parse(type)).not.toThrow();
        });
      });

      it('should reject invalid order types', () => {
        const invalidTypes = [
          'markett',
          'limit_buy',
          'stop-sell',
          123,
          null,
          undefined,
        ];

        invalidTypes.forEach((type) => {
          expect(() => QuerySchemas.orderType.parse(type)).toThrow();
        });
      });
    });

    describe('side', () => {
      it('should validate valid sides', () => {
        const validSides = ['buy', 'sell'];

        validSides.forEach((side) => {
          expect(() => QuerySchemas.side.parse(side)).not.toThrow();
        });
      });

      it('should reject invalid sides', () => {
        const invalidSides = [
          'Buy',
          'SELL',
          'long',
          'short',
          123,
          null,
          undefined,
        ];

        invalidSides.forEach((side) => {
          expect(() => QuerySchemas.side.parse(side)).toThrow();
        });
      });
    });

    describe('positiveNumber', () => {
      it('should validate positive numbers', () => {
        const validNumbers = [0.1, 1, 100, 999999, Number.MAX_VALUE];

        validNumbers.forEach((num) => {
          expect(() => QuerySchemas.positiveNumber.parse(num)).not.toThrow();
        });
      });

      it('should reject non-positive numbers', () => {
        const invalidNumbers = [0, -1, -100, -0.1, '1', null, undefined];

        invalidNumbers.forEach((num) => {
          expect(() => QuerySchemas.positiveNumber.parse(num)).toThrow();
        });
      });
    });

    describe('nonNegativeNumber', () => {
      it('should validate non-negative numbers', () => {
        const validNumbers = [0, 0.1, 1, 100, 999999];

        validNumbers.forEach((num) => {
          expect(() => QuerySchemas.nonNegativeNumber.parse(num)).not.toThrow();
        });
      });

      it('should reject negative numbers', () => {
        const invalidNumbers = [-1, -100, -0.1, '1', null, undefined];

        invalidNumbers.forEach((num) => {
          expect(() => QuerySchemas.nonNegativeNumber.parse(num)).toThrow();
        });
      });
    });

    describe('isoDate', () => {
      it('should validate valid ISO date strings', () => {
        const validDates = ['2023-12-01T10:30:00.000Z', '2023-12-01T10:30:00Z'];

        validDates.forEach((date) => {
          expect(() => QuerySchemas.isoDate.parse(date)).not.toThrow();
        });
      });

      it('should reject invalid date strings', () => {
        const invalidDates = [
          '2023-12-01',
          '10:30:00',
          'invalid-date',
          '2023/12/01 10:30:00',
          new Date().toISOString(),
          123,
          null,
          undefined,
        ];

        invalidDates.forEach((date) => {
          expect(() => QuerySchemas.isoDate.parse(date)).toThrow();
        });
      });
    });

    describe('boolean', () => {
      it('should validate boolean values', () => {
        const validBooleans = [true, false];

        validBooleans.forEach((bool) => {
          expect(() => QuerySchemas.boolean.parse(bool)).not.toThrow();
        });
      });

      it('should reject non-boolean values', () => {
        const invalidBooleans = [
          'true',
          'false',
          1,
          0,
          '1',
          '0',
          null,
          undefined,
        ];

        invalidBooleans.forEach((bool) => {
          expect(() => QuerySchemas.boolean.parse(bool)).toThrow();
        });
      });
    });

    describe('paginationLimit', () => {
      it('should validate valid pagination limits', () => {
        const validLimits = [1, 10, 100, 500, 1000];

        validLimits.forEach((limit) => {
          expect(() => QuerySchemas.paginationLimit.parse(limit)).not.toThrow();
        });
      });

      it('should reject invalid pagination limits', () => {
        const invalidLimits = [0, -1, 1001, 1.5, '10', null, undefined];

        invalidLimits.forEach((limit) => {
          expect(() => QuerySchemas.paginationLimit.parse(limit)).toThrow();
        });
      });
    });

    describe('paginationOffset', () => {
      it('should validate valid pagination offsets', () => {
        const validOffsets = [0, 10, 100, 1000, 999999];

        validOffsets.forEach((offset) => {
          expect(() =>
            QuerySchemas.paginationOffset.parse(offset)
          ).not.toThrow();
        });
      });

      it('should reject invalid pagination offsets', () => {
        const invalidOffsets = [-1, -100, 1.5, '10', null, undefined];

        invalidOffsets.forEach((offset) => {
          expect(() => QuerySchemas.paginationOffset.parse(offset)).toThrow();
        });
      });
    });
  });

  describe('validateQueryParam', () => {
    it('should successfully parse valid values', () => {
      const result = validateQueryParam(
        QuerySchemas.uuid,
        '123e4567-e89b-12d3-a456-426614174000',
        'testId'
      );
      expect(result).toBe('123e4567-e89b-12d3-a456-426614174000');

      const result2 = validateQueryParam(
        QuerySchemas.positiveNumber,
        42,
        'testNumber'
      );
      expect(result2).toBe(42);

      const result3 = validateQueryParam(QuerySchemas.side, 'buy', 'testSide');
      expect(result3).toBe('buy');
    });

    it('should throw Error with proper message on invalid values', () => {
      expect(() => {
        validateQueryParam(QuerySchemas.uuid, 'invalid-uuid', 'testId');
      }).toThrow('Invalid testId: Invalid ID format');

      expect(() => {
        validateQueryParam(QuerySchemas.positiveNumber, -5, 'testNumber');
      }).toThrow('Invalid testNumber: Must be a positive number');

      expect(() => {
        validateQueryParam(QuerySchemas.symbol, '', 'testSymbol');
      }).toThrow('Invalid testSymbol: Symbol cannot be empty');
    });

    it('should call logger.error when validation fails', () => {
      try {
        validateQueryParam(QuerySchemas.uuid, 'invalid-uuid', 'testId');
      } catch (error) {
        // Expected to throw
      }

      // Check that the logger.error was called
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('safeValidateQueryParam', () => {
    it('should return value on successful parse', () => {
      const result = safeValidateQueryParam(
        QuerySchemas.uuid,
        '123e4567-e89b-12d3-a456-426614174000',
        'testId'
      );
      expect(result).toBe('123e4567-e89b-12d3-a456-426614174000');

      const result2 = safeValidateQueryParam(
        QuerySchemas.positiveNumber,
        42,
        'testNumber'
      );
      expect(result2).toBe(42);

      const result3 = safeValidateQueryParam(
        QuerySchemas.side,
        'buy',
        'testSide'
      );
      expect(result3).toBe('buy');
    });

    it('should return null on invalid values', () => {
      const result = safeValidateQueryParam(
        QuerySchemas.uuid,
        'invalid-uuid',
        'testId'
      );
      expect(result).toBeNull();

      const result2 = safeValidateQueryParam(
        QuerySchemas.positiveNumber,
        -5,
        'testNumber'
      );
      expect(result2).toBeNull();

      const result3 = safeValidateQueryParam(
        QuerySchemas.symbol,
        '',
        'testSymbol'
      );
      expect(result3).toBeNull();
    });

    it('should call logger.warn when validation fails', () => {
      safeValidateQueryParam(QuerySchemas.uuid, 'invalid-uuid', 'testId');

      // Check that the logger.warn was called
      expect(
        vi.mocked(vi.importMock('@/lib/logger').logger).warn
      ).toHaveBeenCalled();
    });
  });

  describe('validateQueryParams', () => {
    it('should return array of validated values when all are valid', () => {
      const validations: [z.ZodSchema<unknown>, unknown, string][] = [
        [QuerySchemas.uuid, '123e4567-e89b-12d3-a456-426614174000', 'id'],
        [QuerySchemas.side, 'buy', 'side'],
        [QuerySchemas.positiveNumber, 42, 'limit'],
      ];

      const result = validateQueryParams(validations);

      expect(result).toEqual([
        '123e4567-e89b-12d3-a456-426614174000',
        'buy',
        42,
      ]);
    });

    it('should throw error when one entry fails', () => {
      const validations: [z.ZodSchema<unknown>, unknown, string][] = [
        [QuerySchemas.uuid, '123e4567-e89b-12d3-a456-426614174000', 'id'],
        [QuerySchemas.side, 'invalid-side', 'side'], // This will fail
        [QuerySchemas.positiveNumber, 42, 'limit'],
      ];

      expect(() => {
        validateQueryParams(validations);
      }).toThrow('Invalid side');

      // Verify it fails on the first invalid parameter
      expect(() => {
        validateQueryParams(validations);
      }).toThrow();
    });
  });

  describe('validateUuidArray', () => {
    it('should validate array of valid UUIDs', () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        '550e8400-e29b-41d4-a716-446655440000',
        '00000000-0000-0000-0000-000000000000',
      ];

      const result = validateUuidArray(validUuids, 'testIds');
      expect(result).toEqual(validUuids);
    });

    it('should throw error for mixed valid/invalid UUIDs', () => {
      const mixedUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        'invalid-uuid', // This will fail
        '550e8400-e29b-41d4-a716-446655440000',
      ];

      expect(() => {
        validateUuidArray(mixedUuids, 'testIds');
      }).toThrow('Invalid testIds[1]: Invalid ID format');

      // Verify it includes the index in the error
      expect(() => {
        validateUuidArray(mixedUuids, 'testIds');
      }).toThrow('testIds[1]');
    });

    it('should handle empty array', () => {
      const result = validateUuidArray([], 'testIds');
      expect(result).toEqual([]);
    });

    it('should throw error for single invalid UUID', () => {
      expect(() => {
        validateUuidArray(['invalid-uuid'], 'testId');
      }).toThrow('Invalid testId[0]: Invalid ID format');
    });
  });

  describe('validateSymbolArray', () => {
    it('should validate array of valid symbols', () => {
      const validSymbols = ['EURUSD', 'BTC-USD', 'AAPL', 'TSLA'];

      const result = validateSymbolArray(validSymbols, 'testSymbols');
      expect(result).toEqual(validSymbols);
    });

    it('should throw error for mixed valid/invalid symbols', () => {
      const mixedSymbols = [
        'EURUSD',
        'invalid@symbol', // This will fail
        'AAPL',
      ];

      expect(() => {
        validateSymbolArray(mixedSymbols, 'testSymbols');
      }).toThrow('Invalid testSymbols[1]: Invalid symbol format');

      // Verify it includes the index in the error
      expect(() => {
        validateSymbolArray(mixedSymbols, 'testSymbols');
      }).toThrow('testSymbols[1]');
    });

    it('should handle empty array', () => {
      const result = validateSymbolArray([], 'testSymbols');
      expect(result).toEqual([]);
    });

    it('should throw error for single invalid symbol', () => {
      expect(() => {
        validateSymbolArray(['invalid@symbol'], 'testSymbol');
      }).toThrow('Invalid testSymbol[0]: Invalid symbol format');
    });
  });

  describe('sanitizeLikePattern', () => {
    it('should escape percentage signs', () => {
      const result = sanitizeLikePattern('test%value');
      expect(result).toBe('test\\%value');
    });

    it('should escape underscores', () => {
      const result = sanitizeLikePattern('test_value');
      expect(result).toBe('test\\_value');
    });

    it('should escape backslashes', () => {
      const result = sanitizeLikePattern('test\\value');
      expect(result).toBe('test\\\\value');
    });

    it('should escape all special characters together', () => {
      const result = sanitizeLikePattern('test%_\\value%test');
      expect(result).toBe('test%\\_\\\\value\\%test');
    });

    it('should return string unchanged when no special characters', () => {
      const result = sanitizeLikePattern('testvalue');
      expect(result).toBe('testvalue');
    });

    it('should handle empty string', () => {
      const result = sanitizeLikePattern('');
      expect(result).toBe('');
    });

    it('should handle strings with only special characters', () => {
      const result = sanitizeLikePattern('%_%\\');
      expect(result).toBe('\\%\\_\\\\');
    });

    it('should handle multiple consecutive special characters', () => {
      const result = sanitizeLikePattern('test%%%___value');
      expect(result).toBe('test\\%\\%\\%\\_\\_\\_value');
    });
  });
});
