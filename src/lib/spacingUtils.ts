/* Spacing Utilities - TradeX Pro Dashboard
 * TypeScript utility functions for working with the 4px/8px grid spacing system
 * Provides validation, diagnostics, and helper functions for consistent spacing
 */

/**
 * Spacing scale values in pixels (4px/8px grid system)
 */
export const SPACING_SCALE = {
  0: 0,
  xs: 4,      // 0.25rem
  sm: 8,      // 0.5rem
  md: 12,     // 0.75rem
  base: 16,   // 1rem
  lg: 24,     // 1.5rem
  xl: 32,     // 2rem
  "2xl": 48,  // 3rem
  "3xl": 56,  // 3.5rem
  "4xl": 64,  // 4rem
  "5xl": 80,  // 5rem
  "6xl": 96,  // 6rem
  // Numeric aliases for backward compatibility or direct grid unit access (multiples of 4px)
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  11: 44,     // Touch target size
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

/**
 * Common padding values in pixels
 */
export const PADDING_VALUES = {
  xs: 4,      // var(--padding-xs)
  sm: 8,      // var(--padding-sm)
  md: 12,     // var(--padding-md)
  base: 16,   // var(--padding-base)
  lg: 24,     // var(--padding-lg)
  xl: 32,     // var(--padding-xl)
  "2xl": 48,  // var(--padding-2xl)
  "3xl": 64,  // var(--padding-3xl)
} as const;

/**
 * Common margin values in pixels
 */
export const MARGIN_VALUES = {
  xs: 4,      // var(--margin-xs)
  sm: 8,      // var(--margin-sm)
  md: 12,     // var(--margin-md)
  base: 16,   // var(--margin-base)
  lg: 24,     // var(--margin-lg)
  xl: 32,     // var(--margin-xl)
  "2xl": 48,  // var(--margin-2xl)
  "3xl": 64,  // var(--margin-3xl)
} as const;

/**
 * Gap values for flexbox and grid in pixels
 */
export const GAP_VALUES = {
  xs: 4,      // var(--gap-xs)
  sm: 8,      // var(--gap-sm)
  md: 12,     // var(--gap-md)
  base: 16,   // var(--gap-base)
  lg: 24,     // var(--gap-lg)
  xl: 32,     // var(--gap-xl)
  "2xl": 48,  // var(--gap-2xl)
} as const;

/**
 * Component-specific spacing values in pixels
 */
export const COMPONENT_SPACING = {
  card: {
    padding: 24,    // var(--card-padding)
    margin: 16,     // var(--card-margin)
    gap: 24,        // var(--card-gap)
  },
  button: {
    paddingX: 24,   // var(--button-padding-x)
    paddingY: 16,   // var(--button-padding-y)
    margin: 8,      // var(--button-margin)
  },
  input: {
    paddingX: 24,   // var(--input-padding-x)
    paddingY: 16,   // var(--input-padding-y)
    margin: 8,      // var(--input-margin)
  },
  form: {
    fieldMargin: 16,    // var(--form-field-margin)
    sectionMargin: 32,  // var(--form-section-margin)
  },
  header: {
    padding: 24,    // var(--header-padding)
    margin: 8,      // var(--header-margin)
  },
  sidebar: {
    padding: 24,    // var(--sidebar-padding)
    gap: 16,        // var(--sidebar-gap)
  },
  dashboard: {
    gridGap: 24,        // var(--dashboard-grid-gap)
    cardPadding: 24,    // var(--dashboard-card-padding)
    cardMargin: 16,     // var(--dashboard-card-margin)
  },
  layout: {
    padding: 32,    // var(--layout-padding)
    margin: 16,     // var(--layout-margin)
  },
  section: {
    spacing: 48,    // var(--section-spacing)
  },
} as const;

/**
 * Validates if a spacing value is part of the 8px grid system
 * @param value - Spacing value to validate (in pixels or rem)
 * @returns boolean indicating if the value follows the grid system
 */
export function validateSpacing(value: number | string): boolean {
  if (typeof value === 'string') {
    // Convert rem to pixels (assuming 16px base font size)
    if (value.endsWith('rem')) {
      const remValue = parseFloat(value);
      value = remValue * 16;
    } else if (value.endsWith('px')) {
      value = parseFloat(value);
    } else {
      return false; // Invalid format
    }
  }

  // Check if value is exactly on the grid
  const gridValues = Object.values(SPACING_SCALE);
  return gridValues.includes(value as typeof gridValues[number]);
}

/**
 * Converts a spacing value to CSS custom property
 * @param type - Type of spacing (margin, padding, gap)
 * @param size - Size of spacing (xs, sm, md, base, lg, xl, 2xl)
 * @returns CSS custom property string
 */
export function getSpacingCSS(type: 'margin' | 'padding' | 'gap', size: keyof typeof SPACING_SCALE): string {
  const cssMap = {
    margin: `var(--margin-${size})`,
    padding: `var(--padding-${size})`,
    gap: `var(--gap-${size})`,
  };
  
  return cssMap[type];
}

/**
 * Gets the pixel value for a spacing size
 * @param size - Size key from SPACING_SCALE
 * @returns Pixel value as number
 */
export function getSpacingPixels(size: keyof typeof SPACING_SCALE): number {
  return SPACING_SCALE[size];
}

/**
 * Gets the rem value for a spacing size
 * @param size - Size key from SPACING_SCALE
 * @returns Rem value as string
 */
export function getSpacingRem(size: keyof typeof SPACING_SCALE): string {
  const pixelValue = SPACING_SCALE[size];
  return `${pixelValue / 16}rem`;
}

/**
 * Calculates spacing for responsive design
 * @param baseSize - Base spacing size
 * @param mobileReduction - How much to reduce on mobile (in grid units of 4px)
 * @returns Object with base and mobile spacing values
 */
export function getResponsiveSpacing(
  baseSize: keyof typeof SPACING_SCALE,
  mobileReduction: number = 1
): { base: string; mobile: string } {
  const basePixels = SPACING_SCALE[baseSize];
  const mobilePixels = Math.max(0, basePixels - (mobileReduction * 4));
  
  return {
    base: getSpacingCSS('padding', baseSize),
    mobile: `${mobilePixels / 16}rem`,
  };
}

/**
 * Validates that a component uses consistent spacing
 * @param componentSpacing - Object with spacing values for a component
 * @returns Array of validation errors
 */
export function validateComponentSpacing(componentSpacing: Record<string, number | string>): string[] {
  const errors: string[] = [];
  
  Object.entries(componentSpacing).forEach(([key, value]) => {
    if (!validateSpacing(value)) {
      errors.push(`Spacing value "${value}" for "${key}" is not on the grid`);
    }
  });
  
  return errors;
}

/**
 * Generates spacing utility classes for a component
 * @param componentName - Name of the component
 * @param spacingConfig - Configuration object with spacing values
 * @returns CSS string with utility classes
 */
export function generateComponentSpacingClasses(
  componentName: string,
  spacingConfig: Record<string, keyof typeof SPACING_SCALE>
): string {
  let css = '';
  
  Object.entries(spacingConfig).forEach(([variant, size]) => {
    css += `.${componentName}-${variant} {\n`;
    css += `  padding: var(--padding-${size});\n`;
    css += `  margin: var(--margin-${size});\n`;
    css += `}\n\n`;
  });
  
  return css;
}

/**
 * Checks for spacing consistency across multiple components
 * @param components - Array of component spacing configurations
 * @returns Array of consistency issues
 */
export function checkSpacingConsistency(components: Record<string, Record<string, string>>[]): string[] {
  const issues: string[] = [];
  const allSpacingValues: string[] = [];
  
  components.forEach((component, index) => {
    Object.values(component).forEach((spacingValues) => {
      Object.values(spacingValues).forEach((value) => {
        allSpacingValues.push(value);
      });
    });
  });
  
  // Check for non-grid values
  allSpacingValues.forEach((value) => {
    if (!validateSpacing(value)) {
      issues.push(`Found non-grid spacing value: ${value}`);
    }
  });
  
  return issues;
}

/**
 * Logs spacing diagnostics to console for development
 */
export function logSpacingDiagnostics(): void {
  console.group('🔧 TradeX Pro Spacing System Diagnostics');
  
  console.log('📏 Spacing Scale (4px/8px Grid):');
  Object.entries(SPACING_SCALE).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}px (${value / 16}rem)`);
  });
  
  console.log('\n📐 Component Spacing:');
  Object.entries(COMPONENT_SPACING).forEach(([component, values]) => {
    console.log(`  ${component}:`);
    Object.entries(values).forEach(([key, value]) => {
      console.log(`    ${key}: ${value}px`);
    });
  });
  
  console.log('\n✅ Spacing system loaded successfully');
  console.groupEnd();
}

/**
 * Gets spacing value for specific use cases
 * @param context - Context for spacing (card, button, form, etc.)
 * @param variant - Variant within the context (padding, margin, gap)
 * @returns CSS custom property string
 */
export function getSpacingForContext(context: string, variant: string): string {
  const contextMap: Record<string, Record<string, string>> = {
    card: {
      padding: 'var(--card-padding)',
      margin: 'var(--card-margin)',
      gap: 'var(--card-gap)',
    },
    button: {
      padding: 'var(--button-padding-y) var(--button-padding-x)',
      margin: 'var(--button-margin)',
    },
    input: {
      padding: 'var(--input-padding-y) var(--input-padding-x)',
      margin: 'var(--input-margin)',
    },
    form: {
      field: 'var(--form-field-margin)',
      section: 'var(--form-section-margin)',
    },
    header: {
      padding: 'var(--header-padding)',
      margin: 'var(--header-margin)',
    },
    sidebar: {
      padding: 'var(--sidebar-padding)',
      gap: 'var(--sidebar-gap)',
    },
    dashboard: {
      grid: 'var(--dashboard-grid-gap)',
      cardPadding: 'var(--dashboard-card-padding)',
      cardMargin: 'var(--dashboard-card-margin)',
    },
    layout: {
      padding: 'var(--layout-padding)',
      margin: 'var(--layout-margin)',
    },
    section: {
      spacing: 'var(--section-spacing)',
    },
  };
  
  return contextMap[context]?.[variant] || 'var(--space-base)'; // Default to 16px
}

/**
 * Spacing utility class generator for Tailwind-like usage
 */
export const spacingUtils = {
  /**
   * Generates margin utility classes
   */
  margin: {
    m: (size: keyof typeof SPACING_SCALE) => `margin: var(--margin-${size});`,
    mt: (size: keyof typeof SPACING_SCALE) => `margin-top: var(--margin-${size});`,
    mb: (size: keyof typeof SPACING_SCALE) => `margin-bottom: var(--margin-${size});`,
    ml: (size: keyof typeof SPACING_SCALE) => `margin-left: var(--margin-${size});`,
    mr: (size: keyof typeof SPACING_SCALE) => `margin-right: var(--margin-${size});`,
    mx: (size: keyof typeof SPACING_SCALE) => `margin-left: var(--margin-${size}); margin-right: var(--margin-${size});`,
    my: (size: keyof typeof SPACING_SCALE) => `margin-top: var(--margin-${size}); margin-bottom: var(--margin-${size});`,
  },
  
  /**
   * Generates padding utility classes
   */
  padding: {
    p: (size: keyof typeof SPACING_SCALE) => `padding: var(--padding-${size});`,
    pt: (size: keyof typeof SPACING_SCALE) => `padding-top: var(--padding-${size});`,
    pb: (size: keyof typeof SPACING_SCALE) => `padding-bottom: var(--padding-${size});`,
    pl: (size: keyof typeof SPACING_SCALE) => `padding-left: var(--padding-${size});`,
    pr: (size: keyof typeof SPACING_SCALE) => `padding-right: var(--padding-${size});`,
    px: (size: keyof typeof SPACING_SCALE) => `padding-left: var(--padding-${size}); padding-right: var(--padding-${size});`,
    py: (size: keyof typeof SPACING_SCALE) => `padding-top: var(--padding-${size}); padding-bottom: var(--padding-${size});`,
  },
  
  /**
   * Generates gap utility classes
   */
  gap: (size: keyof typeof SPACING_SCALE) => `gap: var(--gap-${size});`,
};
