/**
 * Idempotency key management for preventing duplicate requests
 * Ensures order operations are not duplicated during network retries
 */

import { logger } from "./logger";

interface PendingRequest {
  key: string;
  timestamp: number;
  endpoint: string;
  status: "pending" | "completed" | "failed";
}

// Store pending requests to prevent duplicates
const pendingRequests = new Map<string, PendingRequest>();

// Completed request cache to return cached responses
const completedRequests = new Map<
  string,
  { result: unknown; timestamp: number }
>();

// Request TTL (5 minutes)
const REQUEST_TTL = 5 * 60 * 1000;

// Cleanup interval
const CLEANUP_INTERVAL = 60 * 1000;

/**
 * Generate an idempotency key for a request
 */
export function generateIdempotencyKey(
  userId: string,
  action: string,
  params: Record<string, unknown>,
): string {
  const paramsString = JSON.stringify(params, Object.keys(params).sort());
  const data = `${userId}:${action}:${paramsString}:${Date.now()}`;

  // Simple hash function for browser compatibility
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `${action}_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
}

/**
 * Check if a request with this key is already pending
 */
export function isRequestPending(key: string): boolean {
  const request = pendingRequests.get(key);
  if (!request) return false;

  // Check if request is still within TTL
  if (Date.now() - request.timestamp > REQUEST_TTL) {
    pendingRequests.delete(key);
    return false;
  }

  return request.status === "pending";
}

/**
 * Check if a request with this key was already completed
 */
export function getCompletedRequest<T>(key: string): T | null {
  const completed = completedRequests.get(key);
  if (!completed) return null;

  // Check if within TTL
  if (Date.now() - completed.timestamp > REQUEST_TTL) {
    completedRequests.delete(key);
    return null;
  }

  return completed.result as T;
}

/**
 * Mark a request as pending
 */
export function markRequestPending(key: string, endpoint: string): void {
  pendingRequests.set(key, {
    key,
    timestamp: Date.now(),
    endpoint,
    status: "pending",
  });

  logger.debug(`Request marked pending: ${key}`);
}

/**
 * Mark a request as completed and cache the result
 */
export function markRequestCompleted<T>(key: string, result: T): void {
  const request = pendingRequests.get(key);
  if (request) {
    request.status = "completed";
  }

  completedRequests.set(key, {
    result,
    timestamp: Date.now(),
  });

  logger.debug(`Request completed: ${key}`);
}

/**
 * Mark a request as failed
 */
export function markRequestFailed(key: string): void {
  const request = pendingRequests.get(key);
  if (request) {
    request.status = "failed";
  }

  // Remove from pending after failure so retry is possible
  setTimeout(() => pendingRequests.delete(key), 1000);

  logger.debug(`Request failed: ${key}`);
}

/**
 * Execute a request with idempotency protection
 */
export async function executeWithIdempotency<T>(
  key: string,
  endpoint: string,
  requestFn: () => Promise<T>,
): Promise<T> {
  // Check for cached completed response
  const cached = getCompletedRequest<T>(key);
  if (cached !== null) {
    logger.info(`Returning cached response for idempotency key: ${key}`);
    return cached;
  }

  // Check if request is already pending
  if (isRequestPending(key)) {
    logger.warn(`Duplicate request blocked: ${key}`);
    throw new Error("Request is already being processed. Please wait.");
  }

  // Mark as pending
  markRequestPending(key, endpoint);

  try {
    const result = await requestFn();
    markRequestCompleted(key, result);
    return result;
  } catch (error) {
    markRequestFailed(key);
    throw error;
  }
}

/**
 * Cleanup expired requests
 */
function cleanupExpiredRequests(): void {
  const now = Date.now();

  for (const [key, request] of pendingRequests) {
    if (now - request.timestamp > REQUEST_TTL) {
      pendingRequests.delete(key);
    }
  }

  for (const [key, completed] of completedRequests) {
    if (now - completed.timestamp > REQUEST_TTL) {
      completedRequests.delete(key);
    }
  }
}

// Start cleanup interval
if (typeof window !== "undefined") {
  setInterval(cleanupExpiredRequests, CLEANUP_INTERVAL);
}

export default {
  generateIdempotencyKey,
  isRequestPending,
  getCompletedRequest,
  markRequestPending,
  markRequestCompleted,
  markRequestFailed,
  executeWithIdempotency,
};
