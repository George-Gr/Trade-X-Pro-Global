/**
 * Security utilities barrel export
 * Centralized exports for all security-related utilities
 */

// XSS Protection
export {
  sanitizeHtml,
  sanitizeText,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeSymbol,
  sanitizeUrl,
  sanitizeFormData,
} from "./sanitize";

// Rate Limiting
export {
  rateLimiter,
  checkRateLimit,
  type RateLimitStatus,
} from "./rateLimiter";

// Idempotency
export {
  generateIdempotencyKey,
  isRequestPending,
  getCompletedRequest,
  markRequestPending,
  markRequestCompleted,
  markRequestFailed,
  executeWithIdempotency,
} from "./idempotency";

// Transaction Handling
export {
  executeTransaction,
  handleTransactionResult,
  executeTradingOperation,
  safeRpcCall,
} from "./transactionHandler";

// Logger
export { logger } from "./logger";
