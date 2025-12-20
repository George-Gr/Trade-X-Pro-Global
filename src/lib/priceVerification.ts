/**
 * Price Feed Verification Utilities
 * Provides HMAC signature verification for price data to prevent manipulation.
 */

/**
 * Price data structure with verification signature
 */
export interface VerifiedPriceData {
  price: number;
  symbol: string;
  timestamp: number;
  signature: string;
}

/**
 * Default maximum age for price data in milliseconds (30 seconds).
 */
export const PRICE_MAX_AGE_MS = 30000;

/**
 * Verify a price signature using Web Crypto API
 */
export async function verifyPriceSignature(
  data: Omit<VerifiedPriceData, 'signature'>,
  signature: string,
  publicKey: string
): Promise<boolean> {
  try {
    const message = `${data.symbol}:${data.price}:${data.timestamp}`;
    const keyData = new TextEncoder().encode(publicKey);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = hexToBytes(signature);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureBytes,
      new TextEncoder().encode(message)
    );

    return isValid;
  } catch {
    return false;
  }
}

/**
 * Check if price data is within acceptable staleness threshold
 */
export function isPriceFresh(
  timestamp: number,
  maxAgeMs: number = PRICE_MAX_AGE_MS
): boolean {
  const age = Date.now() - timestamp;
  return age >= 0 && age <= maxAgeMs;
}

/**
 * Validate price data integrity
 */
export function validatePriceData(data: unknown): {
  valid: boolean;
  error?: string;
} {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid price data format' };
  }

  const priceData = data as Record<string, unknown>;

  if (typeof priceData.c !== 'number' || priceData.c <= 0) {
    return { valid: false, error: 'Invalid current price' };
  }

  if (typeof priceData.t !== 'number') {
    return { valid: false, error: 'Missing timestamp' };
  }

  return { valid: true };
}

function hexToBytes(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes.buffer;
}

/**
 * Convert a Uint8Array to a hexadecimal string representation
 *
 * @param {Uint8Array} bytes - The byte array to convert to hex
 * @returns {string} Hexadecimal string representation of the input bytes
 * @example
 * const bytes = new Uint8Array([255, 0, 128]);
 * bytesToHex(bytes); // returns "ff0080"
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
