/**
 * Spacing System Tokens - AUTHORITATIVE SOURCE
 * Unified spacing definitions for TradeX Pro Global CFD Trading Platform
 * Version: 1.0 (Unified Frontend Guidelines v4.0)
 * 
 * FUNDAMENTAL PRINCIPLE: 8PX GRID SYSTEM
 * - All spacing values must be multiples of 8px
 * - Ensures consistent visual rhythm across entire platform
 * - Simplifies responsive design with predictable scales
 * - Improves alignment and component consistency
 * 
 * RESPONSIVE BREAKPOINTS:
 * - Desktop: 1024px and above
 * - Tablet: 768px to 1023px
 * - Mobile: Below 768px
 * 
 * WHITESPACE REQUIREMENTS:
 * - Minimum 40% whitespace on every page
 * - Supports visual hierarchy and information scanning
 * - Critical for premium/institutional appearance
 * 
 * TOUCH TARGET REQUIREMENTS (Mobile Accessibility):
 * - Minimum touch target size: 44px × 44px
 * - Comfortable touch size: 48px × 48px
 * - Ensures WCAG AAA mobile compliance
 */

// ============================================================================
// SPACING SCALE - 8PX GRID SYSTEM (BASE UNITS)
// ============================================================================

/**
 * Core spacing scale using 8px base grid
 * All values in this object are multiples of 8px
 * Provides consistent measurement across all components
 */
export const SPACING = {
    // Numeric spacing scale (multiples of 8px)
    /**
     * 0px - No spacing
     * Usage: Element removal, collapse states
     */
    0: '0px',

    /**
     * 4px - Half unit (half of 8px base)
     * Usage: Rare, edge cases only (e.g., slight icon offsets)
     * Warning: Use sparingly to maintain grid consistency
     */
    1: '4px',

    /**
     * 8px - Base unit, fundamental spacing increment
     * Usage: Tight element spacing, compact layouts
     * Example: Button padding, small gaps between elements
     */
    2: '8px',

    /**
     * 16px - One and a half base units (2×8px)
     * Usage: Standard element spacing, form fields
     * Example: Section padding, normal gaps
     */
    3: '16px',

    /**
     * 24px - Three base units (3×8px)
     * Usage: Medium spacing, card padding
     * Example: Card internals, section headers
     */
    4: '24px',

    /**
     * 32px - Four base units (4×8px)
     * Usage: Substantial spacing, section padding
     * Example: Section spacing, major components
     */
    5: '32px',

    /**
     * 48px - Six base units (6×8px)
     * Usage: Large spacing, page margins (desktop)
     * Example: Page padding, major section gaps
     */
    6: '48px',

    /**
     * 64px - Eight base units (8×8px)
     * Usage: Very large spacing, major sections
     * Example: Full-width section gaps, hero spacing
     */
    7: '64px',

    /**
     * 80px - Ten base units (10×8px)
     * Usage: Extra large spacing, rare usage
     * Example: Large feature sections, hero spacing
     */
    8: '80px',

    /**
     * 96px - Twelve base units (12×8px)
     * Usage: Maximum spacing, layout division
     * Example: Between major page sections
     */
    9: '96px',

    /**
     * 128px - Sixteen base units (16×8px)
     * Usage: Extreme spacing, full page layouts
     * Example: Very large feature separation
     */
    10: '128px',

    // ========================================================================
    // RESPONSIVE SPACING - ADAPTS TO BREAKPOINTS
    // ========================================================================

    /**
     * Page Margins - Outermost padding on pages
     * Controls the space between page content and viewport edges
     * Critical for premium appearance and readability
     * 
     * Desktop: 48px (6 units)
     * Tablet: 32px (4 units)
     * Mobile: 24px (3 units)
     */
    pageMargin: {
        desktop: '48px',
        tablet: '32px',
        mobile: '24px',
    },

    /**
     * Section Gap - Space between major sections
     * Separates logical content areas from each other
     * Creates visual breathing room for content
     * 
     * Desktop: 48px (6 units)
     * Tablet: 32px (4 units)
     * Mobile: 32px (4 units) - same as tablet for consistency
     */
    sectionGap: {
        desktop: '48px',
        tablet: '32px',
        mobile: '32px',
    },

    /**
     * Element Gap - Space between individual elements
     * Provides flexibility for different component densities
     * Supports tight to loose arrangements
     */
    elementGap: {
        tight: '8px',       // Close together (2 units)
        normal: '16px',     // Standard spacing (2 units)
        loose: '24px',      // Generous spacing (3 units)
    },

    /**
     * Card Spacing - Applied to card components
     * Outer margin when cards are in a grid or list
     */
    cardMargin: '24px',

    /**
     * Card Padding - Internal padding within cards
     * Adjusts based on card size and content density
     */
    cardPadding: {
        sm: '16px',         // Small cards, compact content
        md: '24px',         // Medium cards, standard content
        lg: '32px',         // Large cards, spacious content
    },

    // ========================================================================
    // COMPONENT-SPECIFIC SPACING
    // ========================================================================

    /**
     * Button Spacing - Padding and sizing
     * Ensures clickable area meets 44px minimum touch target
     */
    button: {
        paddingHorizontal: {
            sm: '12px',     // Small button
            md: '16px',     // Medium button
            lg: '24px',     // Large button
        },
        paddingVertical: {
            sm: '8px',      // Small button
            md: '12px',     // Medium button
            lg: '16px',     // Large button
        },
    },

    /**
     * Input Field Spacing - Form input padding and sizing
     * Touch targets: minimum 44px height for mobile
     */
    input: {
        paddingHorizontal: '16px',  // Standard horizontal padding
        paddingVertical: '12px',    // Standard vertical padding
        height: {
            sm: '40px',             // Small inputs
            md: '44px',             // Medium (Touch target minimum)
            lg: '48px',             // Large inputs
        },
    },

    /**
     * Badge Spacing - Small label badges
     * Compact sizing for badges and pills
     */
    badge: {
        padding: '4px 12px',    // Asymmetric: 0.5 unit vertical, 1.5 unit horizontal
        height: '24px',         // 3 units
    },

    /**
     * Divider Spacing - Space around dividers/separators
     * Separates content with breathing room
     */
    divider: {
        vertical: '16px',       // Above/below horizontal divider
        horizontal: '24px',     // Left/right of vertical divider
    },

    // ========================================================================
    // ACCESSIBILITY SPACING - WCAG & MOBILE COMPLIANCE
    // ========================================================================

    /**
     * Touch Target Sizes - Mobile accessibility requirements
     * WCAG Level AAA compliance for touch targets
     * Minimum 44×44px for interactive elements
     */
    touchTarget: {
        minimum: '44px',    // WCAG AAA minimum touch target
        comfortable: '48px', // Comfortable for active use
        large: '56px',      // Extra generous for critical controls
    },

    // ========================================================================
    // DATA TABLE/LIST SPACING
    // ========================================================================

    /**
     * List Item Height - Height for list items
     * Maintains consistent vertical rhythm in lists
     */
    listItem: '48px',           // 6 units (touch-friendly)

    /**
     * Table Row Heights - Vertical spacing in tables
     * Standard and compact options for data density
     */
    tableRow: '40px',           // Standard data table row
    tableRowCompact: '32px',    // Compact data table row

    // ========================================================================
    // MODAL/DRAWER/OVERLAY SPACING
    // ========================================================================

    /**
     * Modal Spacing - Dialog box padding
     * Responsive padding based on viewport size
     */
    modal: {
        paddingDesktop: '32px',  // Standard desktop modal padding
        paddingMobile: '24px',   // Mobile-optimized modal padding
    },

    // Sidebar spacing
    sidebar: {
        width: '280px',
        widthCollapsed: '64px',
        padding: '16px',
        itemHeight: '40px',
    },

    // Header/navigation spacing
    header: {
        height: '64px',
        paddingHorizontal: '24px',
        padding: '16px 24px',
    },

    // Form spacing
    form: {
        fieldGap: '20px',
        fieldGroupGap: '32px',
        helperTextMargin: '4px',
    },

    // Z-index specific spacing (for overlays)
    zIndex: {
        dropdown: '1000',
        modal: '1050',
        tooltip: '1100',
        notification: '1200',
    },
} as const;

// ============================================================================
// RESPONSIVE BREAKPOINT SPACING
// ============================================================================

export const RESPONSIVE_SPACING = {
    mobile: {
        pageMargin: SPACING.pageMargin.mobile,
        sectionGap: SPACING.sectionGap.mobile,
        cardPadding: SPACING.cardPadding.md,
    },

    tablet: {
        pageMargin: SPACING.pageMargin.tablet,
        sectionGap: SPACING.sectionGap.tablet,
        cardPadding: SPACING.cardPadding.lg,
    },

    desktop: {
        pageMargin: SPACING.pageMargin.desktop,
        sectionGap: SPACING.sectionGap.desktop,
        cardPadding: SPACING.cardPadding.lg,
    },
} as const;

// ============================================================================
// WHITESPACE & BREATHING ROOM
// ============================================================================

export const WHITESPACE = {
    // Minimum whitespace ratio across UI (40% of surface)
    minimumRatio: 0.4,

    // Safe area padding for mobile (notch/safe area support)
    safeArea: {
        top: 'max(16px, env(safe-area-inset-top))',
        bottom: 'max(16px, env(safe-area-inset-bottom))',
        left: 'max(16px, env(safe-area-inset-left))',
        right: 'max(16px, env(safe-area-inset-right))',
    },

    // Content max-width for readability
    maxWidth: {
        sm: '640px',  // Small content
        md: '960px',  // Medium content
        lg: '1280px', // Large content
        xl: '1440px', // Extra large content
    },
} as const;

// ============================================================================
// SPACING RULES & CONSTRAINTS
// ============================================================================

export const SPACING_RULES = {
    // All spacing must be multiple of 8px
    baseUnit: 8,

    // Minimum spacing between interactive elements (accessibility)
    minimumInteractiveSpacing: '16px',

    // Maximum spacing before visual hierarchy breaks
    maximumSectionGap: '80px',

    // Enforced spacing constraints
    constraints: {
        // Never use: 1px, 2px, 3px, 5px, 6px, 7px
        bannedValues: [1, 2, 3, 5, 6, 7] as number[],

        // Always use multiples of 8
        allowedValues: [0, 4, 8, 16, 24, 32, 48, 64, 80, 96, 128],
    },
} as const;

// ============================================================================
// LAYOUT CONTAINER SIZES
// ============================================================================

export const CONTAINER_SIZES = {
    // Page container max-widths
    full: '100%',
    sm: '640px',
    md: '960px',
    lg: '1280px',
    xl: '1440px',
    '2xl': '1536px',

    // Content margins by breakpoint
    margins: {
        mobile: '16px',
        tablet: '24px',
        desktop: '48px',
    },

    // Grid column gaps
    gaps: {
        mobile: '12px',
        tablet: '16px',
        desktop: '24px',
    },
} as const;

// ============================================================================
// CSS VARIABLE MAPPINGS
// ============================================================================

export const CSS_SPACING_VARIABLES = {
    '--spacing-0': SPACING[0],
    '--spacing-1': SPACING[1],
    '--spacing-2': SPACING[2],
    '--spacing-3': SPACING[3],
    '--spacing-4': SPACING[4],
    '--spacing-5': SPACING[5],
    '--spacing-6': SPACING[6],
    '--spacing-7': SPACING[7],
    '--spacing-8': SPACING[8],
    '--spacing-9': SPACING[9],
    '--spacing-10': SPACING[10],

    '--page-margin-desktop': SPACING.pageMargin.desktop,
    '--page-margin-tablet': SPACING.pageMargin.tablet,
    '--page-margin-mobile': SPACING.pageMargin.mobile,

    '--section-gap-desktop': SPACING.sectionGap.desktop,
    '--section-gap-tablet': SPACING.sectionGap.tablet,
    '--section-gap-mobile': SPACING.sectionGap.mobile,

    '--card-padding-sm': SPACING.cardPadding.sm,
    '--card-padding-md': SPACING.cardPadding.md,
    '--card-padding-lg': SPACING.cardPadding.lg,

    '--button-padding-h-sm': SPACING.button.paddingHorizontal.sm,
    '--button-padding-h-md': SPACING.button.paddingHorizontal.md,
    '--button-padding-h-lg': SPACING.button.paddingHorizontal.lg,

    '--input-padding-h': SPACING.input.paddingHorizontal,
    '--input-padding-v': SPACING.input.paddingVertical,

    '--touch-target-minimum': SPACING.touchTarget.minimum,
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SpacingKey = keyof typeof SPACING;
export type SpacingValue = typeof SPACING[SpacingKey];

/**
 * Get spacing value with validation
 * @example getSpacing(4) // returns '24px'
 */
export function getSpacing(level: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10): string {
    return SPACING[level];
}

/**
 * Get responsive spacing based on breakpoint
 * @example getResponsiveSpacing('pageMargin') // returns responsive spacing object
 */
export function getResponsiveSpacing(key: keyof typeof RESPONSIVE_SPACING['mobile']) {
    return {
        mobile: RESPONSIVE_SPACING.mobile[key],
        tablet: RESPONSIVE_SPACING.tablet[key],
        desktop: RESPONSIVE_SPACING.desktop[key],
    };
}

/**
 * Verify spacing value is compliant with 8px grid system
 */
export function isSpacingCompliant(value: number): boolean {
    if (value === 0) return true; // 0 is always valid
    return value % SPACING_RULES.baseUnit === 0 && !SPACING_RULES.constraints.bannedValues.includes(value);
}

/**
 * Generate Tailwind spacing scale
 * Useful for generating config files
 */
export function generateTailwindSpacing() {
    return {
        0: '0px',
        1: '4px',
        2: '8px',
        3: '16px',
        4: '24px',
        5: '32px',
        6: '48px',
        7: '64px',
        8: '80px',
        9: '96px',
        10: '128px',
    };
}
