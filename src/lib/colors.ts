/**
 * Centralized color tokens for JS usage
 * Maps design tokens (CSS variables) to semantic names used across the app
 */
export const RISK_COLORS = {
  SAFE: "hsl(var(--buy))",
  WARNING: "hsl(var(--warning))",
  CRITICAL: "hsl(var(--destructive))",
  MONITOR: "hsl(var(--secondary))",
  DEFAULT: "hsl(var(--foreground-muted))",
};

export const CHART_COLORS = {
  UP: "hsl(var(--buy))",
  DOWN: "hsl(var(--destructive))",
  BLUE: "hsl(var(--secondary))",
  BORDER_LIGHT: "hsl(var(--foreground) / 0.1)",
};

export default {
  RISK_COLORS,
  CHART_COLORS,
};
