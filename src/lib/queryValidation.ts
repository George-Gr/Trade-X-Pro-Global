/**
 * Query Parameter Validation Utilities
 *
 * Provides Zod schemas and validation functions to prevent SQL injection
 * and ensure type safety for Supabase query parameters.
 */

import { logger } from '@/lib/logger';
import { z } from 'zod';

/**
 * Common validation schemas for database query parameters
 */
export const QuerySchemas = {
  // UUID validation (for IDs)
  uuid: z.string().uuid('Invalid ID format'),

  // Symbol validation (alphanumeric with optional dash/underscore, max 20 chars)
  symbol: z
    .string()
    .min(1, 'Symbol cannot be empty')
    .max(20, 'Symbol too long')
    .regex(/^[A-Z0-9_-]+$/i, 'Invalid symbol format'),

  // Watchlist name validation
  watchlistName: z
    .string()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z0-9\s_-]+$/, 'Name contains invalid characters'),

  // Order status validation
  orderStatus: z.enum([
    'pending',
    'filled',
    'cancelled',
    'rejected',
    'open',
    'closed',
  ]),

  // Position status validation
  positionStatus: z.enum(['open', 'closed']),

  // Order type validation
  orderType: z.enum(['market', 'limit', 'stop', 'stop_limit']),

  // Side validation
  side: z.enum(['buy', 'sell']),

  // Positive number validation
  positiveNumber: z.number().positive('Must be a positive number'),

  // Non-negative number validation
  nonNegativeNumber: z.number().nonnegative('Must be non-negative'),

  // ISO date string validation
  isoDate: z.string().datetime('Invalid date format'),

  // Boolean validation
  boolean: z.boolean(),

  // Pagination limit (1-1000)
  paginationLimit: z.number().int().min(1).max(1000),

  // Pagination offset (non-negative)
  paginationOffset: z.number().int().nonnegative(),
};

/**
 * Validates a query parameter against a schema
 * @param schema - Zod schema to validate against
 * @param value - Value to validate
 * @param paramName - Name of the parameter (for logging)
 * @returns Validated value
 * @throws Error if validation fails
 */
export function validateQueryParam<T>(
  schema: z.ZodSchema<T>,
  value: unknown,
  paramName: string
): T {
  try {
    return schema.parse(value);
  } catch (error) {
    logger.error(`Query parameter validation failed for ${paramName}`, error, {
      action: 'validate_query_param',
      metadata: { paramName, value, error },
    });
    throw new Error(
      `Invalid ${paramName}: ${
        error instanceof z.ZodError
          ? error.errors[0]?.message
          : 'Validation failed'
      }`
    );
  }
}

/**
 * Safely validates a query parameter and returns null if invalid
 * @param schema - Zod schema to validate against
 * @param value - Value to validate
 * @param paramName - Name of the parameter (for logging)
 * @returns Validated value or null if invalid
 */
export function safeValidateQueryParam<T>(
  schema: z.ZodSchema<T>,
  value: unknown,
  paramName: string
): T | null {
  try {
    return schema.parse(value);
  } catch (error) {
    logger.warn(`Query parameter validation failed for ${paramName}`, {
      action: 'safe_validate_query_param',
      metadata: { paramName, value, error },
    });
    return null;
  }
}

/**
 * Validates multiple query parameters at once
 * @param validations - Array of [schema, value, paramName] tuples
 * @returns Array of validated values
 * @throws Error if any validation fails
 */
export function validateQueryParams(
  validations: Array<[z.ZodSchema<unknown>, unknown, string]>
): unknown[] {
  return validations.map(([schema, value, paramName]) =>
    validateQueryParam(schema, value, paramName)
  );
}

/**
 * Sanitizes a string for use in LIKE queries by escaping special characters
 * @param value - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeLikePattern(value: string): string {
  // Escape special characters used in PostgreSQL LIKE patterns
  return value.replace(/[%_\\]/g, '\\$&');
}

/**
 * Validates an array of UUIDs
 * @param ids - Array of IDs to validate
 * @param paramName - Name of the parameter (for logging)
 * @returns Validated array of UUIDs
 * @throws Error if any ID is invalid
 */
export function validateUuidArray(ids: unknown[], paramName: string): string[] {
  return ids.map((id, index) =>
    validateQueryParam(QuerySchemas.uuid, id, `${paramName}[${index}]`)
  );
}

/**
 * Validates an array of symbols
 * @param symbols - Array of symbols to validate
 * @param paramName - Name of the parameter (for logging)
 * @returns Validated array of symbols
 * @throws Error if any symbol is invalid
 */
export function validateSymbolArray(
  symbols: unknown[],
  paramName: string
): string[] {
  return symbols.map((symbol, index) =>
    validateQueryParam(QuerySchemas.symbol, symbol, `${paramName}[${index}]`)
  );
}
