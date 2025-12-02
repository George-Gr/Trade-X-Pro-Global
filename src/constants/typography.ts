/**
 * Typography System Tokens - AUTHORITATIVE SOURCE
 * Unified typography definitions for TradeX Pro Global CFD Trading Platform
 * Version: 1.0 (Unified Frontend Guidelines v4.0)
 * 
 * FONT STACK:
 * - Primary: Inter (modern sans-serif for all headings and body text)
 * - Monospace: JetBrains Mono (for code, data displays, prices)
 * 
 * FONT WEIGHT STANDARD:
 * - Only 3 primary weights allowed: 400, 600, 700
 * - 500 weight is DEPRECATED, use 600 instead
 * - Follow strict standardization to reduce visual noise
 * 
 * RESPONSIVE SCALING:
 * - All headings scale from desktop to mobile sizes
 * - H1: 48px (desktop) → 36px (mobile)
 * - Body text: Fixed at 16px (both desktop and mobile)
 * - Minimum touch target: 44px (for interactive elements)
 * 
 * WCAG ACCESSIBILITY:
 * - All text meets or exceeds 16px minimum size (except captions at 12px)
 * - Line-height minimum: 1.4 for all text
 * - Letter-spacing tuned for readability on trading data
 */

// ============================================================================
// FONT FAMILY DEFINITIONS
// ============================================================================

/**
 * Font family stacks with fallbacks
 * Ensures system fonts load if primary fonts fail
 */
export const FONT_FAMILIES = {
    /**
     * Primary font - Inter sans-serif
     * Usage: All headings (H1-H5), body text, labels
     * Fallback: System fonts → Segoe UI → sans-serif
     */
    primary:
        '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',

    /**
     * Monospace font - JetBrains Mono
     * Usage: Price data, timestamps, code examples, technical values
     * Fallback: Courier New → monospace
     */
    mono: '"JetBrains Mono", "Courier New", monospace',

    /**
     * System font stack (fallback for older browsers)
     * No web fonts loaded - instant rendering
     */
    system:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
} as const;

// ============================================================================
// FONT WEIGHTS - STANDARDIZED TO 3 WEIGHTS ONLY
// ============================================================================

/**
 * Typography system uses only 3 font weights to reduce visual noise
 * and ensure consistency across the platform.
 * 
 * WEIGHT USAGE RULES:
 * - 400 (regular): Body text, captions, small text
 * - 600 (semibold): Headings, emphasis, important text
 * - 700 (bold): Hero titles, key emphasis, CTAs
 * 
 * Weight 500 (medium) is DEPRECATED and should not be used.
 * Replace all 500 usage with 600 or 400 depending on context.
 */
export const FONT_WEIGHTS = {
    /**
     * Regular (400) - Standard text weight
     * Usage: Body paragraphs, secondary text, captions
     * Readability: Optimal for large blocks of text
     */
    regular: 400,

    /**
     * Medium (500) - DEPRECATED - Use 600 instead
     * Kept for backward compatibility only
     * Migrate all usages to 600 (semibold)
     * 
     * @deprecated Use semibold (600) instead
     */
    medium: 500,

    /**
     * Semibold (600) - Primary emphasis weight
     * Usage: All headings (H1-H5), labels, emphasis
     * Readability: Good contrast without being too heavy
     */
    semibold: 600,

    /**
     * Bold (700) - Maximum emphasis weight
     * Usage: H1 titles, key data, CTAs, important notices
     * Readability: Highest contrast, use sparingly
     */
    bold: 700,
} as const;

export type FontWeight = typeof FONT_WEIGHTS[keyof typeof FONT_WEIGHTS];

// ============================================================================
// FONT SIZES - RESPONSIVE TYPOGRAPHY SCALE
// ============================================================================

/**
 * Heading and text sizes with responsive design
 * 
 * RESPONSIVE BREAKPOINTS:
 * - Desktop: 1024px and above
 * - Tablet: 768px to 1023px (inherits desktop sizes)
 * - Mobile: Below 768px (uses mobile sizes)
 * 
 * MINIMUM SIZE REQUIREMENTS:
 * - Body text: 16px minimum (WCAG AA compliance)
 * - Headings: Scaled appropriately (H1: 48px desktop, 36px mobile)
 * - Captions: 12px minimum (small text only)
 * 
 * LINE HEIGHT RULES:
 * - H1-H5: 1.2-1.5 (tighter for headings)
 * - Body: 1.6 (generous for readability)
 * - Small/Caption: 1.4-1.5 (compact for brevity)
 */
export const FONT_SIZES = {
    /**
     * H1 - Hero & Page Titles
     * Primary use: Main page titles, hero sections
     * Scale: 48px (desktop) → 36px (mobile)
     * Weight: Bold (700) for strong visual hierarchy
     * Letter-spacing: Tighter (-0.02em) for impact
     */
    h1: {
        desktop: '48px',
        mobile: '36px',
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        weight: FONT_WEIGHTS.bold,
    },

    /**
     * H2 - Section Headers
     * Primary use: Major section titles, subsection starts
     * Scale: 36px (desktop) → 28px (mobile)
     * Weight: Semibold (600) for hierarchy without excessive weight
     * Letter-spacing: Slightly tighter (-0.01em)
     */
    h2: {
        desktop: '36px',
        mobile: '28px',
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
        weight: FONT_WEIGHTS.semibold,
    },

    /**
     * H3 - Subsections & Category Headers
     * Primary use: Subsection headings, card titles
     * Scale: 28px (desktop) → 22px (mobile)
     * Weight: Semibold (600) for consistency
     * Letter-spacing: Neutral (0) for balanced look
     */
    h3: {
        desktop: '28px',
        mobile: '22px',
        lineHeight: 1.4,
        letterSpacing: '0',
        weight: FONT_WEIGHTS.semibold,
    },

    /**
     * H4 - Minor Headings & Panel Titles
     * Primary use: Form labels, panel headers, data section titles
     * Scale: 22px (desktop) → 18px (mobile)
     * Weight: Semibold (600) for clarity
     * Letter-spacing: Neutral (0)
     */
    h4: {
        desktop: '22px',
        mobile: '18px',
        lineHeight: 1.4,
        letterSpacing: '0',
        weight: FONT_WEIGHTS.semibold,
    },

    /**
     * H5 - Small Headings & Labels
     * Primary use: Field labels, small headers, badge titles
     * Scale: 16px (fixed)
     * Weight: Semibold (600) for distinction from body
     * Line-height: Tight (1.5) to keep label compact
     */
    h5: {
        desktop: '16px',
        mobile: '16px',
        lineHeight: 1.5,
        letterSpacing: '0',
        weight: FONT_WEIGHTS.semibold,
    },

    /**
     * Body - Primary Content Text
     * Primary use: Main paragraphs, descriptions, content blocks
     * Scale: 16px (both desktop and mobile - fixed size)
     * Weight: Regular (400) for easy reading
     * Line-height: Generous (1.6) for readability
     * WCAG: Meets AA compliance (16px minimum for normal text)
     */
    body: {
        desktop: '16px',
        mobile: '16px',
        lineHeight: 1.6,
        letterSpacing: '0',
        weight: FONT_WEIGHTS.regular,
    },

    /**
     * Body Medium - Emphasized Body Text
     * Primary use: Important body text, highlighted content
     * Scale: 16px (fixed)
     * Weight: Medium (500) - DEPRECATED, use 600 instead
     * Recommendation: Migrate to semibold (600)
     * 
     * @deprecated Use h5 or semibold styling instead
     */
    bodyMedium: {
        desktop: '16px',
        mobile: '16px',
        lineHeight: 1.6,
        letterSpacing: '0',
        weight: FONT_WEIGHTS.medium,
    },

    /**
     * Small - Secondary Text & Labels
     * Primary use: Helper text, form labels, captions, metadata
     * Scale: 14px (fixed)
     * Weight: Regular (400) for light appearance
     * Line-height: Compact (1.5) to save space
     */
    small: {
        desktop: '14px',
        mobile: '14px',
        lineHeight: 1.5,
        letterSpacing: '0',
        weight: FONT_WEIGHTS.regular,
    },

    /**
     * Caption - Tertiary Text & Helpers
     * Primary use: Timestamps, hints, very small labels, assistive text
     * Scale: 12px (fixed)
     * Weight: Regular (400) for minimal emphasis
     * Line-height: Compact (1.4) for condensed information
     * Letter-spacing: Slightly increased (0.5px) for readability at small size
     * WCAG: Below 16px - use only for secondary information
     */
    caption: {
        desktop: '12px',
        mobile: '12px',
        lineHeight: 1.4,
        letterSpacing: '0.5px',
        weight: FONT_WEIGHTS.regular,
    },

    /**
     * Monospace - Code, Data & Prices
     * Primary use: Price displays, timestamps, code snippets, technical data
     * Font: JetBrains Mono (monospace)
     * Scale: 14px (fixed)
     * Weight: Medium (500) - suits monospace better than 400
     * Line-height: Compact (1.5) for data density
     * Use Case: Trading prices, order timestamps, account numbers
     */
    mono: {
        desktop: '14px',
        mobile: '14px',
        lineHeight: 1.5,
        letterSpacing: '0',
        weight: FONT_WEIGHTS.medium,
    },

    /**
     * Monospace Small - Small Code & Data
     * Primary use: Small prices, compact timestamps, mini data displays
     * Font: JetBrains Mono (monospace)
     * Scale: 12px (fixed)
     * Weight: Medium (500) - standard for monospace small
     * Line-height: Compact (1.4)
     * Use Case: Secondary prices, badges, compressed displays
     */
    monoSmall: {
        desktop: '12px',
        mobile: '12px',
        lineHeight: 1.4,
        letterSpacing: '0',
        weight: FONT_WEIGHTS.medium,
    },
} as const;

// ============================================================================
// TYPOGRAPHY SCALE DEFINITION
// ============================================================================

export const TYPOGRAPHY_SCALE = {
    /** Extra Small - 12px, primarily for captions and helper text */
    xs: {
        size: '12px',
        lineHeight: 1.4,
        weight: FONT_WEIGHTS.regular,
    },

    /** Small - 14px, for labels and secondary text */
    sm: {
        size: '14px',
        lineHeight: 1.5,
        weight: FONT_WEIGHTS.regular,
    },

    /** Base - 16px, primary body text */
    base: {
        size: '16px',
        lineHeight: 1.6,
        weight: FONT_WEIGHTS.regular,
    },

    /** Large - 18px, large body text */
    lg: {
        size: '18px',
        lineHeight: 1.6,
        weight: FONT_WEIGHTS.regular,
    },

    /** Extra Large - 20px, large body emphasis */
    xl: {
        size: '20px',
        lineHeight: 1.5,
        weight: FONT_WEIGHTS.medium,
    },

    /** 2XL - 24px, large headings */
    '2xl': {
        size: '24px',
        lineHeight: 1.4,
        weight: FONT_WEIGHTS.semibold,
    },

    /** 3XL - 30px, section headings */
    '3xl': {
        size: '30px',
        lineHeight: 1.3,
        weight: FONT_WEIGHTS.semibold,
    },

    /** 4XL - 36px, major headings */
    '4xl': {
        size: '36px',
        lineHeight: 1.2,
        weight: FONT_WEIGHTS.semibold,
    },

    /** 5XL - 48px, page titles */
    '5xl': {
        size: '48px',
        lineHeight: 1.2,
        weight: FONT_WEIGHTS.bold,
    },
} as const;

// ============================================================================
// COMPONENT-SPECIFIC TYPOGRAPHY
// ============================================================================

export const COMPONENT_TYPOGRAPHY = {
    // Button typography
    button: {
        primary: {
            size: '16px',
            weight: FONT_WEIGHTS.semibold,
            lineHeight: 1.5,
            letterSpacing: '0',
        },
        secondary: {
            size: '16px',
            weight: FONT_WEIGHTS.medium,
            lineHeight: 1.5,
            letterSpacing: '0',
        },
        small: {
            size: '14px',
            weight: FONT_WEIGHTS.semibold,
            lineHeight: 1.4,
            letterSpacing: '0',
        },
    },

    // Input field typography
    input: {
        placeholder: {
            size: '16px',
            weight: FONT_WEIGHTS.regular,
            lineHeight: 1.5,
            color: 'rgba(255, 255, 255, 0.5)',
        },
        value: {
            size: '16px',
            weight: FONT_WEIGHTS.regular,
            lineHeight: 1.5,
        },
    },

    // Trading-specific typography
    trading: {
        price: {
            size: '16px',
            weight: FONT_WEIGHTS.bold,
            lineHeight: 1.2,
            fontFamily: 'mono',
            letterSpacing: '0.5px', // Tabular nums
        },
        priceLarge: {
            size: '24px',
            weight: FONT_WEIGHTS.bold,
            lineHeight: 1.2,
            fontFamily: 'mono',
            letterSpacing: '0.5px',
        },
        symbol: {
            size: '14px',
            weight: FONT_WEIGHTS.semibold,
            lineHeight: 1.4,
            letterSpacing: '0.5px',
        },
        change: {
            size: '14px',
            weight: FONT_WEIGHTS.semibold,
            lineHeight: 1.4,
            fontFamily: 'mono',
        },
    },

    // Card typography
    card: {
        title: {
            size: '16px',
            weight: FONT_WEIGHTS.semibold,
            lineHeight: 1.5,
        },
        subtitle: {
            size: '14px',
            weight: FONT_WEIGHTS.regular,
            lineHeight: 1.5,
        },
        body: {
            size: '14px',
            weight: FONT_WEIGHTS.regular,
            lineHeight: 1.6,
        },
    },

    // Data table typography
    table: {
        header: {
            size: '12px',
            weight: FONT_WEIGHTS.semibold,
            lineHeight: 1.4,
            letterSpacing: '0.5px',
        },
        cell: {
            size: '14px',
            weight: FONT_WEIGHTS.regular,
            lineHeight: 1.5,
        },
        numeric: {
            size: '14px',
            weight: FONT_WEIGHTS.medium,
            lineHeight: 1.5,
            fontFamily: 'mono',
            letterSpacing: '0.5px',
        },
    },

    // Badge typography
    badge: {
        default: {
            size: '12px',
            weight: FONT_WEIGHTS.semibold,
            lineHeight: 1.4,
            letterSpacing: '0',
        },
    },

    // Label typography
    label: {
        default: {
            size: '14px',
            weight: FONT_WEIGHTS.medium,
            lineHeight: 1.5,
            letterSpacing: '0',
        },
        small: {
            size: '12px',
            weight: FONT_WEIGHTS.medium,
            lineHeight: 1.4,
            letterSpacing: '0',
        },
    },

    // Code typography
    code: {
        inline: {
            size: '13px',
            weight: FONT_WEIGHTS.medium,
            lineHeight: 1.4,
            fontFamily: 'mono',
            letterSpacing: '0',
        },
        block: {
            size: '13px',
            weight: FONT_WEIGHTS.regular,
            lineHeight: 1.6,
            fontFamily: 'mono',
            letterSpacing: '0',
        },
    },
} as const;

// ============================================================================
// TYPOGRAPHY RULES & CONSTRAINTS
// ============================================================================

export const TYPOGRAPHY_RULES = {
    // Maximum font weights per interface (enforce visual hierarchy)
    maxFontWeightsPerView: 3,

    // Allowed font weights
    allowedWeights: [
        FONT_WEIGHTS.regular,
        FONT_WEIGHTS.medium,
        FONT_WEIGHTS.semibold,
        FONT_WEIGHTS.bold,
    ],

    // Minimum font size for body text (accessibility)
    minimumBodySize: 14,

    // Maximum line length for readability (em units)
    maximumLineLength: 70,

    // Responsive font scaling rules
    responsiveScaling: {
        // Scale down heading sizes on mobile
        h1MobileRatio: 0.75, // 48px → 36px
        h2MobileRatio: 0.78, // 36px → 28px
        h3MobileRatio: 0.79, // 28px → 22px
        h4MobileRatio: 0.82, // 22px → 18px
    },
} as const;

// ============================================================================
// CSS VARIABLE MAPPINGS
// ============================================================================

export const CSS_FONT_VARIABLES = {
    '--font-family-primary': FONT_FAMILIES.primary,
    '--font-family-mono': FONT_FAMILIES.mono,
    '--font-weight-regular': FONT_WEIGHTS.regular,
    '--font-weight-medium': FONT_WEIGHTS.medium,
    '--font-weight-semibold': FONT_WEIGHTS.semibold,
    '--font-weight-bold': FONT_WEIGHTS.bold,
    '--line-height-tight': 1.2,
    '--line-height-snug': 1.375,
    '--line-height-normal': 1.5,
    '--line-height-relaxed': 1.625,
    '--line-height-loose': 1.875,
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type FontSize = keyof typeof FONT_SIZES;
export type TypographyScale = keyof typeof TYPOGRAPHY_SCALE;
export type ComponentTypography = keyof typeof COMPONENT_TYPOGRAPHY;

/**
 * Get typography values for a heading level
 * @example getHeadingTypography('h1') // returns h1 typography values
 */
export function getHeadingTypography(
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5'
): (typeof FONT_SIZES)[FontSize] {
    return FONT_SIZES[level];
}

/**
 * Get component-specific typography
 * @example getComponentTypography('button', 'primary')
 */
export function getComponentTypography(
    component: ComponentTypography,
    variant: string
): Record<string, string | number> {
    const componentStyles = COMPONENT_TYPOGRAPHY[component];
    return componentStyles[variant as keyof typeof componentStyles] || {};
}

/**
 * Calculate responsive font size with clamp()
 * Smoothly scales between mobile and desktop sizes
 * @example responsiveFontSize(36, 48) // scales from 36px to 48px
 */
export function responsiveFontSize(mobileSize: number, desktopSize: number): string {
    // Uses CSS clamp for smooth scaling
    // min: mobile size, max: desktop size, preferred: viewport-based
    const minSize = mobileSize / 16; // convert to rem
    const maxSize = desktopSize / 16; // convert to rem
    const preferred = `${((desktopSize - mobileSize) / (1920 - 375)) * 100}vw + ${(mobileSize * 1920 - desktopSize * 375) / (1920 - 375)}px`;

    return `clamp(${minSize}rem, ${preferred}, ${maxSize}rem)`;
}

/**
 * Verify typography constraints are met
 */
export function isTypographyCompliant(fontWeight: number): boolean {
    return TYPOGRAPHY_RULES.allowedWeights.includes(fontWeight as FontWeight);
}
