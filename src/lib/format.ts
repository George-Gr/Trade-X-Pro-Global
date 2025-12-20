/**
 * Number formatting utilities for consistent data presentation across the application
 */

export interface FormatOptions {
  /**
   * Currency symbol to display (default: "$")
   */
  currency?: string;
  /**
   * Whether to show the currency symbol (default: true)
   */
  showCurrency?: boolean;
  /**
   * Locale for number formatting (default: "en-US")
   */
  locale?: string;
  /**
   * Whether to use compact notation for large numbers (default: false)
   */
  compact?: boolean;
}

/**
 * Format a price with consistent decimal places (4 decimals for precision)
 * Examples: $1,234.5678, $0.0001
 */
export function formatPrice(
  value: number | string | null | undefined,
  options: FormatOptions = {}
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return '—';
  }

  const {
    currency = '$',
    showCurrency = true,
    locale = 'en-US',
    compact = false,
  } = options;

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
    notation: compact ? 'compact' : 'standard',
  }).format(numValue);

  return showCurrency ? `${currency}${formatted}` : formatted;
}

/**
 * Format a monetary amount with 2 decimal places
 * Examples: $1,234.56, $0.00
 */
export function formatAmount(
  value: number | string | null | undefined,
  options: FormatOptions = {}
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return '—';
  }

  const {
    currency = '$',
    showCurrency = true,
    locale = 'en-US',
    compact = false,
  } = options;

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    notation: compact ? 'compact' : 'standard',
  }).format(numValue);

  return showCurrency ? `${currency}${formatted}` : formatted;
}

/**
 * Format a percentage with 2 decimal places
 * Examples: 12.34%, -5.67%, 0.00%
 */
export function formatPercent(
  value: number | string | null | undefined,
  options: { decimals?: number; showSign?: boolean; locale?: string } = {}
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return '—';
  }

  const { decimals = 2, showSign = false, locale = 'en-US' } = options;

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay: showSign ? 'always' : 'auto',
  }).format(numValue);

  return `${formatted}%`;
}

/**
 * Format a quantity/volume with appropriate decimal places
 * Examples: 1,234.5678 (for crypto), 1,234.56 (for stocks)
 */
export function formatQuantity(
  value: number | string | null | undefined,
  options: { decimals?: number; locale?: string; compact?: boolean } = {}
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return '—';
  }

  const { decimals = 4, locale = 'en-US', compact = false } = options;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    notation: compact ? 'compact' : 'standard',
  }).format(numValue);
}

/**
 * Format a large number with compact notation
 * Examples: 1.2K, 1.5M, 2.3B
 */
export function formatCompactNumber(
  value: number | string | null | undefined,
  options: { decimals?: number; locale?: string } = {}
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return '—';
  }

  const { decimals = 1, locale = 'en-US' } = options;

  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(numValue);
}

/**
 * Format profit/loss with color indication
 * Returns formatted value and whether it's positive/negative/neutral
 */
export function formatPnL(
  value: number | string | null | undefined,
  options: FormatOptions = {}
): { formatted: string; type: 'positive' | 'negative' | 'neutral' } {
  if (value === null || value === undefined || value === '') {
    return { formatted: '—', type: 'neutral' };
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return { formatted: '—', type: 'neutral' };
  }

  const formatted = formatAmount(numValue, { ...options, showCurrency: true });
  const type =
    numValue > 0 ? 'positive' : numValue < 0 ? 'negative' : 'neutral';

  return { formatted, type };
}
