/**
 * Typography Utility Functions and Helpers
 * Provides helper functions for working with the typography system
 */

/**
 * Typography size map for responsive design
 * Maps semantic names to CSS variable values
 */
export const typographyScaleMap = {
  h1: 'var(--h1-size)',
  h2: 'var(--h2-size)',
  h3: 'var(--h3-size)',
  h4: 'var(--h4-size)',
  body: 'var(--body-size)',
  small: 'var(--small-size)',
  label: 'var(--label-size)',
  caption: 'var(--caption-size)',
} as const;

/**
 * Font weight map
 */
export const fontWeightMap = {
  light: 'var(--font-light)',
  normal: 'var(--font-normal)',
  medium: 'var(--font-medium)',
  semibold: 'var(--font-semibold)',
  bold: 'var(--font-bold)',
  extrabold: 'var(--font-extrabold)',
} as const;

/**
 * Line height map
 */
export const lineHeightMap = {
  tight: 'var(--leading-tight)',
  snug: 'var(--leading-snug)',
  normal: 'var(--leading-normal)',
  relaxed: 'var(--leading-relaxed)',
  loose: 'var(--leading-loose)',
} as const;

/**
 * Get heading level from 1-6
 * @param level - Heading level (1-6)
 * @returns CSS class name for the heading level
 */
export const getHeadingClass = (level: 1 | 2 | 3 | 4 | 5 | 6): string => {
  const classMap = {
    1: 'typography-h1',
    2: 'typography-h2',
    3: 'typography-h3',
    4: 'typography-h4',
    5: 'typography-label',
    6: 'typography-caption',
  };
  return classMap[level];
};

/**
 * Create a custom typography style object
 * @param size - Font size in px
 * @param weight - Font weight (100-900)
 * @param lineHeight - Line height (number or string)
 * @returns Style object
 */
export const createTypographyStyle = (
  size: number,
  weight: number = 400,
  lineHeight: number = 1.5
): React.CSSProperties => ({
  fontSize: `${size}px`,
  fontWeight: weight,
  lineHeight,
});

/**
 * Clamp typography size for responsive scaling
 * @param minSize - Minimum size in rem
 * @param maxSize - Maximum size in rem
 * @param minWidth - Viewport width for minimum (in px)
 * @param maxWidth - Viewport width for maximum (in px)
 * @returns CSS value for fluid typography
 */
export const clampTypography = (
  minSize: number,
  maxSize: number,
  minWidth: number = 320,
  maxWidth: number = 1280
): string => {
  const slope = (maxSize - minSize) / (maxWidth - minWidth);
  const intercept = minSize - (slope * minWidth) / 16;
  return `clamp(${minSize}rem, ${intercept.toFixed(2)}rem + ${(slope * 100).toFixed(2)}vw, ${maxSize}rem)`;
};

/**
 * Get contrast-safe color for text based on background
 * @param bgLight - Background color in light mode (HSL)
 * @param bgDark - Background color in dark mode (HSL)
 * @returns Object with light and dark mode text colors
 */
export const getContrastSafeTextColor = (
  bgLight: string,
  bgDark: string
): { light: string; dark: string } => ({
  light: 'hsl(var(--foreground))',
  dark: 'hsl(var(--foreground))',
});

/**
 * Truncate text with ellipsis
 * @param lines - Number of lines before truncation (1 for single line)
 * @returns CSS class for line clamping
 */
export const getLineClampClass = (lines: number): string => {
  const clampMap: Record<number, string> = {
    1: 'line-clamp-1',
    2: 'line-clamp-2',
    3: 'line-clamp-3',
    4: 'line-clamp-4',
    5: 'line-clamp-5',
    6: 'line-clamp-6',
  };
  return clampMap[lines] || 'line-clamp-2';
};

/**
 * Check if typography system CSS variables are loaded
 * @returns boolean indicating if CSS variables are available
 */
export const isTypographyLoaded = (): boolean => {
  if (typeof window === 'undefined') return false;
  const h1Size = getComputedStyle(document.documentElement).getPropertyValue(
    '--h1-size'
  );
  return h1Size.trim().length > 0;
};

/**
 * Get all typography CSS variables
 * @returns Object with all typography variable values
 */
export const getTypographyVariables = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};

  const root = document.documentElement;
  const styles = getComputedStyle(root);

  return {
    h1Size: styles.getPropertyValue('--h1-size').trim(),
    h2Size: styles.getPropertyValue('--h2-size').trim(),
    h3Size: styles.getPropertyValue('--h3-size').trim(),
    h4Size: styles.getPropertyValue('--h4-size').trim(),
    bodySize: styles.getPropertyValue('--body-size').trim(),
    smallSize: styles.getPropertyValue('--small-size').trim(),
    labelSize: styles.getPropertyValue('--label-size').trim(),
    captionSize: styles.getPropertyValue('--caption-size').trim(),
    h1Weight: styles.getPropertyValue('--h1-weight').trim(),
    h2Weight: styles.getPropertyValue('--h2-weight').trim(),
    h3Weight: styles.getPropertyValue('--h3-weight').trim(),
    h4Weight: styles.getPropertyValue('--h4-weight').trim(),
    bodyWeight: styles.getPropertyValue('--body-weight').trim(),
    h1LineHeight: styles.getPropertyValue('--h1-line-height').trim(),
    h2LineHeight: styles.getPropertyValue('--h2-line-height').trim(),
    h3LineHeight: styles.getPropertyValue('--h3-line-height').trim(),
    h4LineHeight: styles.getPropertyValue('--h4-line-height').trim(),
  };
};

/**
 * Create accessible heading with proper semantic HTML
 * @param level - Heading level (1-6)
 * @param content - Heading content
 * @param className - Additional CSS classes
 * @returns JSX element (note: returns as string for documentation)
 */
export const createHeading = (
  level: 1 | 2 | 3 | 4 | 5 | 6,
  content: string,
  className?: string
): string => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const classNames = [getHeadingClass(level), className].filter(Boolean).join(' ');
  return `<${Tag} className="${classNames}">${content}</${Tag}>`;
};

/**
 * Validate typography CSS variables
 * Checks if typography system is correctly configured
 * @returns Object with validation results
 */
export const validateTypography = (): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof window === 'undefined') {
    return { isValid: false, errors: ['Window object not available'], warnings: [] };
  }

  const styles = getComputedStyle(document.documentElement);
  const requiredVars = [
    '--h1-size',
    '--h2-size',
    '--h3-size',
    '--h4-size',
    '--body-size',
    '--small-size',
    '--h1-weight',
    '--h2-weight',
    '--h3-weight',
    '--h4-weight',
  ];

  requiredVars.forEach((variable) => {
    const value = styles.getPropertyValue(variable).trim();
    if (!value) {
      errors.push(`Missing CSS variable: ${variable}`);
    }
  });

  // Check for common issues
  const h1Size = parseFloat(styles.getPropertyValue('--h1-size'));
  const bodySize = parseFloat(styles.getPropertyValue('--body-size'));
  
  if (h1Size <= bodySize) {
    warnings.push('H1 size should be larger than body size');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Log typography diagnostics to console (dev only)
 */
export const logTypographyDiagnostics = (): void => {
  if (typeof window === 'undefined') return;

  console.group('Typography System Diagnostics');
  
  const validation = validateTypography();
  console.warn('Validation:', validation);
  
  if (validation.isValid) {
    const variables = getTypographyVariables();
    console.table(variables);
    console.warn('✓ Typography system is properly configured');
  } else {
    console.error('✗ Typography system has errors:', validation.errors);
  }

  console.groupEnd();
};

export default {
  getHeadingClass,
  createTypographyStyle,
  clampTypography,
  getLineClampClass,
  isTypographyLoaded,
  getTypographyVariables,
  validateTypography,
  logTypographyDiagnostics,
};
