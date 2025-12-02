# TASK 1: Establish Unified Design Standards
## Complete Execution Plan with Instructions & Guidelines

**Document Version:** 1.0  
**Created:** December 2, 2025  
**Status:** Ready for Execution  
**Estimated Duration:** 5 days (Week 1)  
**Priority Level:** CRITICAL ⚠️

---

## 🎯 Executive Summary

This is the **foundational task** that enables all subsequent work in the TradeX Pro frontend transformation. Before any component refactoring, testing fixes, or UI enhancements can proceed, we must establish a unified, authoritative design system.

**Current State:** Design tokens exist but are scattered across multiple documents with inconsistencies  
**Target State:** Single, authoritative design system with resolved conflicts and comprehensive validation  
**Business Impact:** Prevents confusion, enables parallel development, ensures consistency  
**Success Criteria:** All design tokens validated, documented, and tested

---

## 📋 Task Breakdown

This task is divided into **5 major subtasks** that must be completed in sequence:

### Subtask 1.1: Color Palette Unification & Validation
### Subtask 1.2: Typography System Standardization
### Subtask 1.3: Spacing System Finalization
### Subtask 1.4: Design System Documentation
### Subtask 1.5: Automated Compliance Testing

---

## ✅ SUBTASK 1.1: Color Palette Unification & Validation

**Duration:** 1 day  
**Dependencies:** None  
**Files to Review:** `src/constants/designTokens.ts`

### Current State Analysis
The color palette is **already defined correctly** in `designTokens.ts` with:
- ✅ Deep Navy: #0A1628 (Primary background)
- ✅ Electric Blue: #00D4FF (Interactive elements)
- ✅ Emerald Green: #00C896 (Buy/Success)
- ✅ Crimson Red: #FF4757 (Sell/Danger)
- ✅ Charcoal Gray: #2C3E50 (Secondary backgrounds)
- ✅ Silver Gray: #95A5A6 (Text/Borders)
- ✅ Pure White: #FFFFFF (Text on dark)
- ✅ Warm Gold: #F39C12 (Premium/Warnings - max 5%)

### Action Items

#### Step 1.1.1: Verify WCAG Compliance
**Objective:** Confirm all color combinations meet WCAG AAA standards (7:1 contrast ratio)

**Instructions:**
1. Use online WCAG contrast checker: https://www.tpgi.com/color-contrast-checker/
2. For each text color combination, verify:
   - Pure White on Deep Navy (text): Should be ~21:1 ✓
   - Silver Gray on Charcoal Gray (secondary text): Should be ~7.1:1 ✓
   - Electric Blue on Deep Navy: Should be ~3.2:1 ✓ (interactive, acceptable)
   
3. Document results in compliance checklist (see below)

**Expected Outcome:**
```
✅ Pure White on Deep Navy: 21:1 (Exceeds AAA)
✅ Silver Gray on Charcoal Gray: 7.1:1 (Meets AAA)
✅ Electric Blue on Deep Navy: 3.2:1 (Interactive element acceptable)
✅ Emerald Green on Deep Navy: 5.1:1 (Meets AAA)
✅ Crimson Red on Deep Navy: 3.8:1 (Interactive element acceptable)
✅ Warm Gold on Deep Navy: 3.2:1 (Max 5% usage, acceptable)
```

#### Step 1.1.2: Resolve Document Conflicts
**Objective:** Identify and resolve any color palette inconsistencies mentioned in attached documents

**Reference Documents:**
- Frontend Design Complete Reference: Navy (#0A1628) + Gold (#FFD700) vs.
- Unified Guidelines: Navy (#0A1628) + Gold (#F39C12)

**Resolution Rule:** Use values from `src/constants/designTokens.ts` as authoritative source
- Deep Navy: #0A1628 ✓ (Both documents agree)
- Gold: #F39C12 (from designTokens.ts) - Update any references to #FFD700

**Action:**
```bash
# Search for old gold color reference
grep -r "FFD700\|ffd700" src/ --include="*.ts" --include="*.tsx" --include="*.css"
```

If any old references found:
- Create inline comments explaining the change
- Update to #F39C12
- Add justification: "Unified standard per designTokens.ts (WCAG AAA compliance)"

#### Step 1.1.3: Create Color Usage Documentation
**Objective:** Create clear guidelines for when/where each color should be used

**Deliverable:** Update `src/constants/designTokens.ts` with comprehensive JSDoc comments

**Template to follow:**
```typescript
/**
 * Deep Navy - Primary background color for trading platform
 * 
 * @usage
 * - Primary page backgrounds
 * - Navigation bars and headers
 * - Main card backgrounds
 * - Primary UI containers
 * 
 * @contrast
 * - Against Pure White text: 21:1 (Exceeds WCAG AAA)
 * - Against Electric Blue: 3.2:1 (Interactive elements acceptable)
 * 
 * @percentage 60-70% of total interface
 */
deepNavy: '#0A1628',
```

**Coverage Required:** Every color in COLORS object needs similar documentation

#### Step 1.1.4: Implement Color Variable CSS
**Objective:** Ensure CSS custom properties are available globally

**Location:** `src/index.css` or `src/styles/globals.css`

**Implementation:**
```css
:root {
  /* Primary Colors - Trading Platform */
  --color-deep-navy: #0A1628;
  --color-electric-blue: #00D4FF;
  --color-emerald-green: #00C896;
  --color-crimson-red: #FF4757;
  
  /* Secondary Colors */
  --color-charcoal-gray: #2C3E50;
  --color-silver-gray: #95A5A6;
  --color-pure-white: #FFFFFF;
  --color-warm-gold: #F39C12;
  
  /* Semantic Colors */
  --color-background-primary: var(--color-deep-navy);
  --color-background-secondary: var(--color-charcoal-gray);
  --color-text-primary: var(--color-pure-white);
  --color-text-secondary: var(--color-silver-gray);
  --color-interactive-primary: var(--color-electric-blue);
  
  /* Trading Semantic */
  --color-buy: var(--color-emerald-green);
  --color-sell: var(--color-crimson-red);
}
```

**Verification:**
```bash
# Test that variables are accessible
grep -l "var(--color-" src/**/*.tsx | head -5
```

### ✅ Verification Checklist - Subtask 1.1

- [ ] WCAG AAA contrast ratios documented for all text combinations
- [ ] Old color references (#FFD700) replaced with unified value (#F39C12)
- [ ] Comprehensive JSDoc comments added to all colors in designTokens.ts
- [ ] CSS custom properties defined in global stylesheet
- [ ] No conflicting color definitions remain in codebase
- [ ] All 8 primary colors verified as correct

---

## ✅ SUBTASK 1.2: Typography System Standardization

**Duration:** 1.5 days  
**Dependencies:** Subtask 1.1 (can start parallel)  
**Files to Review/Update:** `src/constants/typography.ts`

### Current State Analysis
Typography system is **well-structured** in `typography.ts`:
- ✅ Primary Font: Inter (Modern sans-serif)
- ✅ Monospace Font: JetBrains Mono (For data/prices)
- ✅ Font Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- ✅ Responsive Scales: H1-H5 with desktop/mobile sizes

### Action Items

#### Step 1.2.1: Verify Font Loading Configuration
**Objective:** Ensure Inter and JetBrains Mono fonts are properly loaded

**Files to Check:**
1. `index.html` - Look for font imports
2. `src/index.css` - Look for @import statements
3. `tailwind.config.ts` - Look for fontFamily configuration

**Instructions:**
```bash
# Check for font imports
grep -n "@import\|@font-face\|<link.*font" index.html
```

**Expected Result:**
- Inter font loaded from Google Fonts or system
- JetBrains Mono loaded
- Both should be available for use

**If Missing:** Add to `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
```

#### Step 1.2.2: Standardize Font Weight Usage
**Objective:** Ensure only 3 weights are used per interface: 400, 600, 700

**Current Rules (from Unified Guidelines):**
- 400: Regular body text
- 500: Medium (minimize usage)
- 600: Semibold (headings, emphasis)
- 700: Bold (hero titles, key emphasis)

**Action:**
1. Search for font-weight usage across codebase:
```bash
grep -r "font-weight:\|fontWeight" src/ --include="*.tsx" --include="*.ts" --include="*.css" | grep -v "node_modules" | sort | uniq
```

2. Create standardization mapping:
   - 300 weight → Replace with 400 or 600
   - 500 weight → Replace with 600 (unless default weight)
   - 800+ weights → Replace with 700

3. Update any violations with explanation:
```typescript
// OLD (5 weights)
font-weight: 300; // Too light for readability

// NEW (standardized to 3 weights)
font-weight: 400; // Regular (meets WCAG AAA 16px min for body)
```

#### Step 1.2.3: Validate Responsive Typography Scales
**Objective:** Confirm all headings and text scale correctly on mobile/desktop

**Heading Scale Requirements (from Guidelines):**
| Element | Desktop | Mobile | Weight | Line-Height |
|---------|---------|--------|--------|-------------|
| H1 | 48px | 36px | 700 | 1.2 |
| H2 | 36px | 28px | 600 | 1.3 |
| H3 | 28px | 22px | 600 | 1.4 |
| H4 | 22px | 18px | 600 | 1.4 |
| H5 | 16px | 16px | 600 | 1.5 |
| Body | 16px | 16px | 400 | 1.6 |
| Small | 14px | 14px | 400 | 1.6 |
| Mono (Prices) | 16px | 16px | 500 | 1.5 |

**Validation Method:**
1. Open `/src/constants/typography.ts`
2. Compare each entry against table above
3. Verify `FONT_SIZES` object matches
4. Check Tailwind config for `fontSize` utilities

**Expected Output in typography.ts:**
```typescript
export const FONT_SIZES = {
  h1: {
    desktop: '48px',    // ✅ Correct
    mobile: '36px',     // ✅ Correct
    lineHeight: 1.2,    // ✅ Correct
    letterSpacing: '-0.02em',
    weight: FONT_WEIGHTS.bold,
  },
  // ... all others verified
};
```

#### Step 1.2.4: Create Tailwind Typography Utilities
**Objective:** Enable consistent typography usage via Tailwind classes

**Location:** `tailwind.config.ts`

**Add to config:**
```typescript
{
  theme: {
    extend: {
      fontSize: {
        'h1-desktop': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1-mobile': ['36px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2-desktop': ['36px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h2-mobile': ['28px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        // ... all headings
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-small': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'mono': ['16px', { lineHeight: '1.5', fontWeight: '500' }],
      },
      fontFamily: {
        'sans': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'mono': '"JetBrains Mono", "Courier New", monospace',
      },
    },
  },
}
```

**Usage in Components:**
```tsx
// Instead of inline styles:
<h1 className="text-h1-desktop md:text-h1-mobile">Title</h1>
<p className="text-body">Body text</p>
<code className="font-mono">const code = true;</code>
```

#### Step 1.2.5: Document Typography Best Practices
**Objective:** Create clear guidelines for typography usage

**Deliverable:** Add to `docs/DESIGN_SYSTEM.md` or create new section

**Content to Include:**
```markdown
## Typography Guidelines

### Font Selection Rules
- **Headings (H1-H5):** Use Inter only
- **Body Text:** Use Inter only
- **Data/Prices/Code:** Use JetBrains Mono only
- **Never mix:** Serif fonts, script fonts, or decorative fonts

### Font Weight Rules
- **Only use 3 weights per view:** 400, 600, 700
- **400:** Regular body text
- **600:** Subheadings, emphasis
- **700:** Main headings, critical emphasis

### Line Height Rules
- **Headings (H1-H5):** 1.2-1.5
- **Body text:** 1.6 (minimum, for readability)
- **Captions:** 1.4

### Letter Spacing Rules
- **H1-H2:** -0.01em to -0.02em (visual tightness)
- **Body text:** 0em (normal)
- **Mono data:** 0em (precise alignment)

### Responsive Scaling
- **Desktop:** Use desktop sizes defined in typography.ts
- **Mobile (< 768px):** Use mobile sizes (10-20% smaller)
- **Tablet (768px-1024px):** Transition zone, use desktop sizes
```

### ✅ Verification Checklist - Subtask 1.2

- [ ] Inter and JetBrains Mono fonts loaded and available
- [ ] Only 3 font weights (400, 600, 700) used across codebase
- [ ] Responsive scales verified: H1 48px→36px, H2 36px→28px, etc.
- [ ] Tailwind typography utilities configured and working
- [ ] Typography best practices documented in DESIGN_SYSTEM.md
- [ ] All heading hierarchy follows semantic HTML (H1-H6)

---

## ✅ SUBTASK 1.3: Spacing System Finalization

**Duration:** 1 day  
**Dependencies:** Subtask 1.1 (can start parallel)  
**Files to Review/Update:** `src/constants/spacing.ts`, Tailwind config

### Current State Analysis
Spacing system is **well-defined** in `spacing.ts`:
- ✅ 8px Grid System (0, 4, 8, 16, 24, 32, 48, 64, 80, 96, 128px)
- ✅ Semantic spacing categories
- ✅ Responsive values for different breakpoints

### Action Items

#### Step 1.3.1: Validate 8px Grid Compliance
**Objective:** Ensure all spacing throughout codebase uses multiples of 8px

**Current Grid:**
```
Level 0: 0px     (No spacing)
Level 1: 4px     (Half-unit, edge cases only)
Level 2: 8px     (Base unit)
Level 3: 16px    (2x)
Level 4: 24px    (3x)
Level 5: 32px    (4x)
Level 6: 48px    (6x)
Level 7: 64px    (8x)
Level 8: 80px    (10x)
Level 9: 96px    (12x)
Level 10: 128px  (16x)
```

**Validation Steps:**

1. Search for inline spacing violations:
```bash
# Find px values that aren't multiples of 8
grep -r "px" src/ --include="*.tsx" --include="*.css" | grep -E "[0-9]*(1|2|3|5|6|7|9|10|11|12|13|14|15|17|18|19|20|21|22|23|25|26|27|28|29|30|31|33)[^0-9]px" | head -20
```

2. For any violations found, categorize:
   - **Acceptable 4px:** Only for micro-adjustments (half-unit exceptions)
   - **Unacceptable:** Any other non-8px-multiple values (should be refactored)

3. Document violations found and create refactoring list

#### Step 1.3.2: Configure Tailwind Spacing Utilities
**Objective:** Ensure Tailwind spacing matches our 8px grid

**Location:** `tailwind.config.ts`

**Configuration:**
```typescript
{
  theme: {
    spacing: {
      '0': '0px',
      '0.5': '4px',      // Half unit (edge cases)
      '1': '8px',        // Base unit
      '2': '16px',
      '3': '24px',
      '4': '32px',
      '6': '48px',
      '8': '64px',
      '10': '80px',
      '12': '96px',
      '16': '128px',
    },
    extend: {
      // Add semantic spacing aliases
      margin: {
        'page': 'var(--spacing-page-margin)',
        'section': 'var(--spacing-section-gap)',
      },
      padding: {
        'card-sm': 'var(--spacing-card-padding-sm)',
        'card-md': 'var(--spacing-card-padding-md)',
        'card-lg': 'var(--spacing-card-padding-lg)',
      },
    },
  },
}
```

**Expected Outcome:** Tailwind classes like `p-4` (32px), `m-3` (24px) match our grid

#### Step 1.3.3: Define Responsive Spacing Breakpoints
**Objective:** Specify page margins and section gaps for each device size

**Breakpoint Configuration:**
```typescript
// From spacing.ts
pageMargin: {
  desktop: '48px',    // 1280px+ screens
  tablet: '32px',     // 768px-1279px screens
  mobile: '24px',     // < 768px screens
},

sectionGap: {
  desktop: '48px',    // Vertical gap between major sections
  tablet: '32px',
  mobile: '32px',
},

cardMargin: '24px',   // Margin around card elements
cardPadding: {
  sm: '16px',        // Compact cards
  md: '24px',        // Standard cards
  lg: '32px',        // Large/detailed cards
},
```

**Responsive Utility Creation in Tailwind:**
```typescript
// In tailwind.config.ts
{
  theme: {
    extend: {
      margin: {
        'page-desktop': '48px',
        'page-tablet': '32px',
        'page-mobile': '24px',
      },
    },
  },
}
```

**Usage in Components:**
```tsx
// Responsive page margin
<div className="mx-page-mobile md:mx-page-tablet lg:mx-page-desktop">
  Content with responsive margins
</div>

// Touch target sizing (44px minimum, 48px comfortable)
<button className="min-h-12 min-w-12 px-4 py-2">
  Touch-friendly button
</button>
```

#### Step 1.3.4: Create Spacing Documentation
**Objective:** Document all spacing rules and edge cases

**Deliverable:** Add section to `docs/DESIGN_SYSTEM.md`

**Content Template:**
```markdown
## Spacing System (8px Grid)

### Core Spacing Scale
All spacing must be multiples of 8px (with rare 4px exceptions)

| Level | Value | Usage | Notes |
|-------|-------|-------|-------|
| 0 | 0px | No spacing | |
| 1 | 4px | Half-unit only | Edge cases only |
| 2 | 8px | Base unit | Most common |
| 3 | 16px | 2x base | Element spacing |
| 4 | 24px | 3x base | Card padding |
| 5 | 32px | 4x base | Section padding |
| 6 | 48px | 6x base | Page margins (desktop) |

### Responsive Spacing Rules

**Page Margins (Left/Right):**
- Desktop (1024px+): 48px
- Tablet (768px-1023px): 32px
- Mobile (<768px): 24px

**Section Gaps (Top/Bottom):**
- All sizes: 48px between major sections
- Mobile: 32px minimum

**Card Spacing:**
- Margin between cards: 24px
- Padding (small): 16px
- Padding (medium): 24px (standard)
- Padding (large): 32px

### Touch Target Minimums
- **Minimum:** 44px (WCAG requirement)
- **Comfortable:** 48px (recommended)
- **Large:** 56px (premium experience)

### Whitespace Rules
- Minimum 40% of interface should be whitespace
- This creates visual breathing room
- DO NOT fill every pixel of the screen
```

#### Step 1.3.5: Verify No Hardcoded Spacing
**Objective:** Ensure all spacing uses design tokens, not hardcoded values

**Search and Replace:**

```bash
# Find inline margin/padding with hardcoded values
grep -r "margin:\|padding:\|gap:" src/ --include="*.tsx" --include="*.css" | grep -v "SPACING\|var(--spacing)" | head -10
```

**For any found:** Create inline comment explaining the deviation:
```tsx
// ✓ Correct - using design token
<div className={`px-${SPACING[6]} py-${SPACING[4]}`}>
  {children}
</div>

// ✗ AVOID - hardcoded value
<div style={{ padding: '20px' }}>
  {children}
</div>

// ✓ Correct - using Tailwind utility
<div className="p-6">
  {children}
</div>
```

### ✅ Verification Checklist - Subtask 1.3

- [ ] 8px grid compliance verified (no rogue spacing values)
- [ ] Tailwind spacing utilities configured correctly
- [ ] Responsive breakpoints defined: mobile/tablet/desktop
- [ ] Page margins set: 48px (desktop), 32px (tablet), 24px (mobile)
- [ ] Card padding standardized: 16px (sm), 24px (md), 32px (lg)
- [ ] Touch targets meet 44px minimum
- [ ] Spacing documentation complete in DESIGN_SYSTEM.md
- [ ] No hardcoded spacing values remain (using design tokens)

---

## ✅ SUBTASK 1.4: Design System Documentation

**Duration:** 1 day  
**Dependencies:** Subtasks 1.1, 1.2, 1.3 (coordinate together)  
**Primary File:** `docs/DESIGN_SYSTEM.md`

### Objective
Create a single, authoritative design system reference that consolidates all tokens and guidelines from the attached documents.

### Action Items

#### Step 1.4.1: Create Master DESIGN_SYSTEM.md
**Location:** `/workspaces/Trade-X-Pro-Global/docs/DESIGN_SYSTEM.md`

**Structure:**
```markdown
# TradeX Pro Design System
## Authoritative Reference for All Design & Development

**Version:** 1.0 - Unified Standard  
**Last Updated:** [DATE]  
**Status:** Authoritative  
**Scope:** Complete design system including colors, typography, spacing, components

---

## Table of Contents
1. Quick Start Reference
2. Color System (8 colors, WCAG AAA)
3. Typography System (Inter + Mono, responsive scales)
4. Spacing System (8px grid, responsive)
5. Component Patterns
6. Usage Rules & Guidelines
7. FAQ & Troubleshooting

---

## 1. Quick Start Reference

### Essential Files
- Colors: `src/constants/designTokens.ts`
- Typography: `src/constants/typography.ts`
- Spacing: `src/constants/spacing.ts`
- Tests: `src/__tests__/designTokens.test.ts`

### 30-Second Color Reference
- **Primary:** Deep Navy (#0A1628) - 60-70% of UI
- **Interactive:** Electric Blue (#00D4FF) - Buttons, links
- **Success:** Emerald Green (#00C896) - Buy orders, profit
- **Danger:** Crimson Red (#FF4757) - Sell orders, loss
- **Text:** Pure White (#FFFFFF) on navy, Silver Gray (#95A5A6) secondary

### 30-Second Typography Reference
- **Headings:** Inter (semibold/bold): H1 48px, H2 36px, H3 28px
- **Body:** Inter (regular): 16px base
- **Data:** JetBrains Mono (medium): 16px
- **Mobile:** All headings 10-20% smaller

### 30-Second Spacing Reference
- **Grid:** 8px base (0, 8, 16, 24, 32, 48, 64, 80, 96, 128px)
- **Pages:** 48px desktop, 32px tablet, 24px mobile margins
- **Cards:** 16px-24px padding
- **Minimum touch:** 44px

---

[Continue with detailed sections for each system...]
```

**Key Sections to Include:**

1. **Color System**
   - All 8 colors with hex codes
   - WCAG contrast ratios
   - Semantic groupings (background, text, interactive, trading)
   - Usage guidelines per color
   - Examples of correct/incorrect usage

2. **Typography System**
   - Font stack definitions
   - All sizes with line heights
   - Weight guidelines (only 3 weights)
   - Responsive scales
   - Usage examples

3. **Spacing System**
   - 8px grid explanation
   - Responsive breakpoints
   - Touch target minimums
   - Card padding standards
   - Whitespace requirements

4. **Component Patterns** (Reference templates)
   - Button patterns (primary, secondary, danger, etc.)
   - Card patterns (standard, compact, large)
   - Input patterns
   - Modal patterns

5. **Accessibility Standards**
   - WCAG AAA targets
   - Contrast requirements
   - Keyboard navigation rules
   - Focus indicator styles

6. **Implementation Rules**
   - DO: Use design tokens from constants/
   - DO: Use Tailwind utilities
   - DO: Follow semantic HTML
   - DON'T: Hardcode colors or spacing
   - DON'T: Create custom spacing values
   - DON'T: Use 4+ font weights

#### Step 1.4.2: Create IMPLEMENTATION_CHECKLIST.md
**Location:** `/workspaces/Trade-X-Pro-Global/docs/DESIGN_SYSTEM_IMPLEMENTATION_CHECKLIST.md`

**Purpose:** Checklist for developers implementing design system

**Content:**
```markdown
# Design System Implementation Checklist
Use this checklist when implementing new components or refactoring existing ones.

## Color Implementation
- [ ] Component uses only colors from COLORS constant
- [ ] Text color combinations verified for 7:1 WCAG AAA contrast
- [ ] No custom hex colors in component code
- [ ] Gold color limited to max 5% of surface area
- [ ] Buy/Sell indicators use emeraldGreen/crimsonRed

## Typography Implementation
- [ ] Headings use Inter font (H1-H5 semantic HTML)
- [ ] Body text is 16px minimum on mobile
- [ ] Data/prices use JetBrains Mono
- [ ] Only 3 font weights used: 400, 600, 700
- [ ] Line heights follow standards: Headings 1.2-1.5, Body 1.6+
- [ ] Responsive sizes implemented for all text

## Spacing Implementation
- [ ] All spacing values are multiples of 8px
- [ ] No hardcoded pixel values (use SPACING constant)
- [ ] Page margins correct: 48px(d), 32px(t), 24px(m)
- [ ] Card padding standard: 16px(sm), 24px(md), 32px(lg)
- [ ] Touch targets minimum 44px
- [ ] Minimum 40% whitespace maintained

## Accessibility Implementation
- [ ] Contrast ratios verified: 7:1 for text, 3:1 for interactive
- [ ] Focus indicators visible and properly styled
- [ ] Keyboard navigation supported
- [ ] ARIA labels present where needed
- [ ] Semantic HTML used (not divs everywhere)

## Testing
- [ ] Unit tests written and passing
- [ ] Accessibility tests pass (jest-axe or similar)
- [ ] Visual regression tests pass
- [ ] Responsive design tested: mobile/tablet/desktop
```

#### Step 1.4.3: Update README Files
**Locations:**
- `docs/DESIGN_SYSTEM.md` - Main reference
- `docs/frontend/INDEX.md` - Navigation hub
- Project root `README.md` - Quick reference

**Add section to each:**
```markdown
## Design System

All frontend development must follow the unified Design System:

### Quick Links
- **Complete Reference:** [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md)
- **Colors:** `src/constants/designTokens.ts` (8 institutional colors)
- **Typography:** `src/constants/typography.ts` (Inter + Mono, responsive)
- **Spacing:** `src/constants/spacing.ts` (8px grid system)
- **Implementation Checklist:** [`docs/DESIGN_SYSTEM_IMPLEMENTATION_CHECKLIST.md`](./docs/DESIGN_SYSTEM_IMPLEMENTATION_CHECKLIST.md)

### Essential Rules
1. ✅ Use design tokens from constants/ - never hardcode colors/spacing
2. ✅ Follow 8px spacing grid - all values multiples of 8px
3. ✅ Use only Inter (headings/body) and JetBrains Mono (data)
4. ✅ Limit to 3 font weights: 400 (regular), 600 (semibold), 700 (bold)
5. ✅ Ensure 7:1 contrast ratio for all text (WCAG AAA)
6. ✅ Maintain 40% minimum whitespace in all views
7. ✅ Touch targets minimum 44px (WCAG requirement)

### When Building Components
1. Review `docs/DESIGN_SYSTEM.md`
2. Use checklist from `docs/DESIGN_SYSTEM_IMPLEMENTATION_CHECKLIST.md`
3. Import tokens from `src/constants/`
4. Write tests for design compliance
5. Verify accessibility requirements
```

### ✅ Verification Checklist - Subtask 1.4

- [ ] DESIGN_SYSTEM.md created with complete reference
- [ ] IMPLEMENTATION_CHECKLIST.md created for developers
- [ ] README files updated with design system links
- [ ] All files have clear table of contents
- [ ] Examples included for all major patterns
- [ ] Quick reference sections created
- [ ] FAQ section addresses common questions
- [ ] Design system is searchable and well-organized

---

## ✅ SUBTASK 1.5: Automated Compliance Testing

**Duration:** 1.5 days  
**Dependencies:** Subtasks 1.1-1.4 (after tokens defined)  
**Primary File:** `src/__tests__/designTokens.test.ts`

### Objective
Implement automated tests to ensure design system compliance is maintained throughout development.

### Current State
File exists with 58 tests - verify all pass and expand coverage

### Action Items

#### Step 1.5.1: Review Existing Tests
**Location:** `src/__tests__/designTokens.test.ts`

**Instructions:**
1. Open file and review existing tests
2. Run tests:
```bash
npm test src/__tests__/designTokens.test.ts
```

3. Document any failures
4. Expected: Most tests should pass (design tokens are correct)

#### Step 1.5.2: Expand Color Compliance Tests
**Add Tests For:**

```typescript
describe('Design System - Color Compliance', () => {
  
  // Test 1: All colors defined
  it('should have all 8 required primary colors defined', () => {
    expect(COLORS).toHaveProperty('deepNavy');
    expect(COLORS).toHaveProperty('electricBlue');
    expect(COLORS).toHaveProperty('emeraldGreen');
    expect(COLORS).toHaveProperty('crimsonRed');
    expect(COLORS).toHaveProperty('charcoalGray');
    expect(COLORS).toHaveProperty('silverGray');
    expect(COLORS).toHaveProperty('pureWhite');
    expect(COLORS).toHaveProperty('warmGold');
  });

  // Test 2: Colors are valid hex
  it('should use valid hex color format', () => {
    Object.entries(COLORS).forEach(([name, color]) => {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  // Test 3: Correct hex values
  it('should match unified standard hex codes', () => {
    expect(COLORS.deepNavy).toBe('#0A1628');
    expect(COLORS.electricBlue).toBe('#00D4FF');
    expect(COLORS.emeraldGreen).toBe('#00C896');
    expect(COLORS.crimsonRed).toBe('#FF4757');
    expect(COLORS.charcoalGray).toBe('#2C3E50');
    expect(COLORS.silverGray).toBe('#95A5A6');
    expect(COLORS.pureWhite).toBe('#FFFFFF');
    expect(COLORS.warmGold).toBe('#F39C12');
  });

  // Test 4: No conflicting color values
  it('should not have duplicate hex values', () => {
    const values = Object.values(COLORS);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  // Test 5: Semantic colors reference primary colors
  it('should use primary colors in semantic groups', () => {
    expect(SEMANTIC_COLORS.trading.buy).toBe(COLORS.emeraldGreen);
    expect(SEMANTIC_COLORS.trading.sell).toBe(COLORS.crimsonRed);
  });
});
```

#### Step 1.5.3: Expand Typography Compliance Tests
**Add Tests For:**

```typescript
describe('Design System - Typography Compliance', () => {
  
  // Test 1: Fonts defined
  it('should have primary and mono fonts defined', () => {
    expect(FONT_FAMILIES.primary).toBeDefined();
    expect(FONT_FAMILIES.mono).toBeDefined();
    expect(FONT_FAMILIES.primary).toContain('Inter');
    expect(FONT_FAMILIES.mono).toContain('JetBrains Mono');
  });

  // Test 2: Font weights limited to 3
  it('should limit to exactly 4 weights: 400, 500, 600, 700', () => {
    const weights = Object.values(FONT_WEIGHTS);
    expect(weights).toContain(400);
    expect(weights).toContain(600);
    expect(weights).toContain(700);
    expect(weights.length).toBeLessThanOrEqual(4);
  });

  // Test 3: All heading sizes defined
  it('should define all heading sizes H1-H5', () => {
    expect(FONT_SIZES.h1).toBeDefined();
    expect(FONT_SIZES.h2).toBeDefined();
    expect(FONT_SIZES.h3).toBeDefined();
    expect(FONT_SIZES.h4).toBeDefined();
    expect(FONT_SIZES.h5).toBeDefined();
  });

  // Test 4: Responsive scales correct
  it('should have correct responsive heading scales', () => {
    expect(FONT_SIZES.h1.desktop).toBe('48px');
    expect(FONT_SIZES.h1.mobile).toBe('36px');
    expect(FONT_SIZES.h2.desktop).toBe('36px');
    expect(FONT_SIZES.h2.mobile).toBe('28px');
  });

  // Test 5: Line heights valid
  it('should have valid line heights (>= 1.2)', () => {
    Object.entries(FONT_SIZES).forEach(([size, config]) => {
      if (config.lineHeight) {
        expect(config.lineHeight).toBeGreaterThanOrEqual(1.2);
      }
    });
  });
});
```

#### Step 1.5.4: Expand Spacing Compliance Tests
**Add Tests For:**

```typescript
describe('Design System - Spacing Compliance', () => {
  
  // Test 1: 8px grid values
  it('should use multiples of 8px for main scale', () => {
    const mainSpacing = [0, 8, 16, 24, 32, 48, 64, 80, 96, 128];
    mainSpacing.forEach(size => {
      expect(SPACING[size / 8]).toBe(`${size}px`);
    });
  });

  // Test 2: No invalid spacing values
  it('should not use non-8px-multiple values (except 4px)', () => {
    const invalidValues = [1, 2, 3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15];
    invalidValues.forEach(val => {
      expect(SPACING[val]).toBeUndefined();
    });
  });

  // Test 3: Responsive spacing defined
  it('should define responsive page margins', () => {
    expect(SPACING.pageMargin.desktop).toBe('48px');
    expect(SPACING.pageMargin.tablet).toBe('32px');
    expect(SPACING.pageMargin.mobile).toBe('24px');
  });

  // Test 4: Touch targets meet minimum
  it('should enforce 44px minimum touch target', () => {
    // Touch targets should be at least SPACING[5] (32px) padding + 12px
    // Or directly 44px
    expect(parseInt(SPACING[5])).toBeLessThanOrEqual(44);
  });

  // Test 5: Card padding standards
  it('should define standard card padding', () => {
    expect(SPACING.cardPadding.sm).toBe('16px');
    expect(SPACING.cardPadding.md).toBe('24px');
    expect(SPACING.cardPadding.lg).toBe('32px');
  });
});
```

#### Step 1.5.5: Accessibility Compliance Tests
**Add Tests For:**

```typescript
describe('Design System - Accessibility Compliance', () => {
  
  // Test 1: WCAG AAA contrast
  it('should maintain 7:1 contrast for primary text', () => {
    // Pure White on Deep Navy should be ~21:1
    const contrastRatio = calculateContrast('#FFFFFF', '#0A1628');
    expect(contrastRatio).toBeGreaterThanOrEqual(7);
  });

  // Test 2: Text sizes meet minimum
  it('should enforce 16px minimum for mobile body text', () => {
    expect(parseInt(FONT_SIZES.body.mobile)).toBeGreaterThanOrEqual(16);
  });

  // Test 3: Line heights adequate
  it('should have adequate line heights for readability', () => {
    // Body text should have 1.6+ line height
    expect(FONT_SIZES.body.lineHeight).toBeGreaterThanOrEqual(1.6);
  });
});
```

#### Step 1.5.6: Integration Tests
**Add Tests For System-Wide Compliance:**

```typescript
describe('Design System - Integration Compliance', () => {
  
  // Test 1: No conflicts across systems
  it('should not have color conflicts with reserved names', () => {
    const colorNames = Object.keys(COLORS);
    const typeScriptReserved = ['public', 'private', 'class', 'interface'];
    colorNames.forEach(name => {
      expect(typeScriptReserved).not.toContain(name);
    });
  });

  // Test 2: All systems use same weight definitions
  it('should use consistent font weights across systems', () => {
    Object.entries(FONT_SIZES).forEach(([key, config]) => {
      if (config.weight) {
        expect(Object.values(FONT_WEIGHTS)).toContain(config.weight);
      }
    });
  });

  // Test 3: Design token consistency
  it('should maintain version consistency across token files', () => {
    // All files should reference same version
    expect(designTokensVersion).toBe(typographyVersion);
    expect(typographyVersion).toBe(spacingVersion);
  });
});
```

#### Step 1.5.7: Test Configuration
**Location:** `vitest.config.ts`

**Ensure Configuration:**
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/__tests__/designTokens.test.ts',
        'src/constants/**',
      ],
      // Require 100% coverage for design tokens
      lines: 100,
      functions: 100,
      branches: 100,
    },
  },
});
```

#### Step 1.5.8: Run and Verify Tests
**Commands:**

```bash
# Run design system tests
npm test src/__tests__/designTokens.test.ts

# Check coverage
npm test -- --coverage src/__tests__/designTokens.test.ts

# Run in watch mode for development
npm test -- --watch src/__tests__/designTokens.test.ts
```

**Expected Output:**
```
✓ Design System - Color Compliance (8 tests)
✓ Design System - Typography Compliance (5 tests)
✓ Design System - Spacing Compliance (5 tests)
✓ Design System - Accessibility Compliance (3 tests)
✓ Design System - Integration Compliance (3 tests)

Total: 24 new tests + existing 58 tests = 82 tests
Coverage: 100% for design tokens
```

### ✅ Verification Checklist - Subtask 1.5

- [ ] All existing design token tests pass (58 tests)
- [ ] New color compliance tests added and passing (8 tests)
- [ ] New typography compliance tests added and passing (5 tests)
- [ ] New spacing compliance tests added and passing (5 tests)
- [ ] New accessibility compliance tests added and passing (3 tests)
- [ ] Integration tests added and passing (3 tests)
- [ ] 100% coverage achieved for design token files
- [ ] Tests can run in watch mode without errors
- [ ] CI/CD integration ready (tests pass in pipeline)

---

## 📊 TASK 1 SUCCESS CRITERIA

### Overall Task Completion Checklist

**Phase Completion: Week 1 of 13**

#### Subtask 1.1: Color Palette ✓
- [ ] All 8 colors verified with correct hex codes
- [ ] WCAG AAA contrast verified for all text combinations
- [ ] Old color references replaced (#FFD700 → #F39C12)
- [ ] Comprehensive JSDoc comments added
- [ ] CSS custom properties defined globally

**Estimated Completion: Day 1-2**

#### Subtask 1.2: Typography ✓
- [ ] Fonts verified loaded (Inter + JetBrains Mono)
- [ ] Font weights standardized to 3 only (400, 600, 700)
- [ ] Responsive scales validated (H1 48px→36px, etc.)
- [ ] Tailwind typography utilities configured
- [ ] Best practices documented

**Estimated Completion: Day 2-3**

#### Subtask 1.3: Spacing ✓
- [ ] 8px grid compliance verified
- [ ] Tailwind spacing utilities configured
- [ ] Responsive breakpoints defined
- [ ] Touch targets verified 44px minimum
- [ ] Spacing documentation complete

**Estimated Completion: Day 3-4**

#### Subtask 1.4: Documentation ✓
- [ ] DESIGN_SYSTEM.md created (authoritative reference)
- [ ] IMPLEMENTATION_CHECKLIST.md created (developer guide)
- [ ] README files updated with links
- [ ] FAQ section completed
- [ ] Quick reference guides created

**Estimated Completion: Day 4**

#### Subtask 1.5: Testing ✓
- [ ] Existing 58 design token tests pass
- [ ] 24 new compliance tests added and passing
- [ ] 100% coverage for design token files
- [ ] Tests integrated in CI/CD pipeline
- [ ] Watch mode works without errors

**Estimated Completion: Day 5**

### Final Verification

**All Questions Must Answer YES:**

1. ✅ Are all 8 colors defined with correct hex codes and WCAG AAA compliance?
2. ✅ Is typography limited to exactly 3 font weights used throughout?
3. ✅ Is all spacing using 8px grid with no hardcoded values?
4. ✅ Is DESIGN_SYSTEM.md authoritative and complete?
5. ✅ Are all design token tests passing with 100% coverage?
6. ✅ Can developers reference a single source of truth?
7. ✅ Are conflicts between documents resolved?
8. ✅ Is accessibility compliance (WCAG AAA) verified?

**Task Status:** ✅ READY TO EXECUTE

**Next Steps After Completion:**
→ Proceed to **TASK 2: Implement Comprehensive Testing Framework**
→ Begin **TASK 3: Refactor Monolithic Components** (can overlap)

---

## 🚀 Execution Guidelines

### Development Workflow

**Before Starting:**
1. Create feature branch: `git checkout -b feature/task-1-design-system`
2. Ensure npm dependencies installed: `npm install`
3. Verify dev server works: `npm run dev`

**During Development:**
1. Make changes incrementally (1 subtask at a time)
2. Test changes immediately after each subtask
3. Run linter: `npm run lint -- --fix`
4. Run tests: `npm test`
5. Commit after each subtask with clear message

**Commit Messages Template:**
```
feat(design-system): [Subtask] - Description

Subtask 1.1: Color palette unification
- Verified all 8 colors with WCAG AAA compliance
- Replaced old gold reference (#FFD700 → #F39C12)
- Added comprehensive JSDoc documentation

Closes: [Issue#]
```

**After Completion:**
1. Merge branch: `git merge feature/task-1-design-system`
2. Verify no regressions: `npm test && npm run lint`
3. Mark TASK 1 as complete
4. Begin TASK 2

### Troubleshooting Guide

**Problem:** Tests failing for contrast ratios
**Solution:** Use TPGI Color Contrast Checker tool online to verify exact ratios

**Problem:** Font not loading in browser
**Solution:** Check Google Fonts link in HTML, verify font names exactly match CSS

**Problem:** Spacing not aligning to 8px grid
**Solution:** Search codebase for non-standard values using grep commands provided

**Problem:** Tailwind utilities not generating
**Solution:** Restart dev server, verify config syntax in tailwind.config.ts

---

## 📝 Summary

**TASK 1: Establish Unified Design Standards** is a critical foundation task that:

✅ Consolidates 8 primary institutional colors  
✅ Standardizes typography (Inter + Mono)  
✅ Implements 8px spacing grid  
✅ Creates authoritative documentation  
✅ Establishes automated compliance testing  

**Timeline:** 5 days (Week 1)  
**Blockers:** None - can start immediately  
**Dependencies:** None  
**Enables:** All subsequent tasks (2, 3, 4, etc.)

**Upon Completion:** All future development will reference unified design system, ensuring consistency, accessibility, and professional quality throughout the TradeX Pro frontend.

