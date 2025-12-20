/**
 * Centralized color tokens for JS usage
 * Maps design tokens (CSS variables) to semantic names used across the app
 */
/**
 * Risk level color mappings for trading indicators and alerts.
 * SAFE: positive/low-risk scenarios (profit, healthy metrics); WARNING: caution/medium-risk (approaching limits); CRITICAL: danger/high-risk (losses, breaches); MONITOR: neutral watch state; DEFAULT: fallback/unknown.
 * @constant
 * @readonly
 */
export const RISK_COLORS = {
  SAFE: 'hsl(var(--buy))',
  WARNING: 'hsl(var(--warning))',
  CRITICAL: 'hsl(var(--destructive))',
  MONITOR: 'hsl(var(--secondary))',
  DEFAULT: 'hsl(var(--foreground-muted))',
};

/**
 * Chart visualization color mappings for price movements and UI elements.
 * UP: bullish/positive price movement; DOWN: bearish/negative price movement; BLUE: neutral indicators; BORDER_LIGHT: subtle borders and dividers. Expects CSS variables to be defined in HSL format.
 * @constant
 * @readonly
 */
export const CHART_COLORS = {
  UP: 'hsl(var(--buy))',
  DOWN: 'hsl(var(--destructive))',
  BLUE: 'hsl(var(--secondary))',
  BORDER_LIGHT: 'hsl(var(--foreground) / 0.1)',
};

export default {
  RISK_COLORS,
  CHART_COLORS,
};
