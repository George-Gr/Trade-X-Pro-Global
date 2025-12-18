/**
 * XSS Protection utilities using DOMPurify
 * All user-generated content should be sanitized before rendering
 */

import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this before rendering any user-generated HTML content
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize text content - strips all HTML tags
 * Use for plain text fields like names, descriptions
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize and validate email format
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeText(email).toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : "";
}

/**
 * Sanitize numeric input - returns only valid numbers
 */
export function sanitizeNumber(value: string | number): number | null {
  if (typeof value === "number") {
    return isNaN(value) ? null : value;
  }
  const sanitized = sanitizeText(value).replace(/[^0-9.-]/g, "");
  const num = parseFloat(sanitized);
  return isNaN(num) ? null : num;
}

/**
 * Sanitize symbol input (trading symbols)
 */
export function sanitizeSymbol(symbol: string): string {
  return sanitizeText(symbol)
    .toUpperCase()
    .replace(/[^A-Z0-9_/]/g, "")
    .slice(0, 20);
}

/**
 * Sanitize URL to prevent javascript: and data: protocol attacks
 */
export function sanitizeUrl(url: string): string {
  const sanitized = sanitizeText(url).trim();

  // Block dangerous protocols
  const dangerousProtocols = ["javascript:", "data:", "vbscript:"];
  const lowerUrl = sanitized.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return "";
    }
  }

  return sanitized;
}

/**
 * Sanitize form data object
 */
export function sanitizeFormData<T extends Record<string, unknown>>(
  data: T,
): T {
  const sanitized = {} as T;

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      (sanitized as Record<string, unknown>)[key] = sanitizeText(value);
    } else if (typeof value === "number") {
      (sanitized as Record<string, unknown>)[key] = sanitizeNumber(value);
    } else {
      (sanitized as Record<string, unknown>)[key] = value;
    }
  }

  return sanitized;
}

export default {
  sanitizeHtml,
  sanitizeText,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeSymbol,
  sanitizeUrl,
  sanitizeFormData,
};
