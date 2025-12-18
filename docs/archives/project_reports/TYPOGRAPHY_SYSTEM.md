# Typography Hierarchy System Documentation

## Overview

The TradeX Pro Dashboard implements a comprehensive typography hierarchy system using CSS custom properties for consistency, maintainability, and responsiveness.

**Status:** ✅ Fully Implemented (Phase 1 - Task 1.1)

---

## Typography Scale

### Heading Hierarchy

#### H1 - Page Titles (32px, weight: 700)

- **Size:** 32px (2rem)
- **Weight:** 700 (bold)
- **Line Height:** 1.2
- **Letter Spacing:** -0.02em
- **Use Cases:**
  - Main page titles
  - Dashboard headers
  - Section headers on landing page
- **Example Classes:** `typography-h1`, `.text-h1`
- **HTML Element:** `<h1>`

```tsx
<h1 className="typography-h1">Dashboard</h1>
```

---

#### H2 - Section Headers (24px, weight: 600)

- **Size:** 24px (1.5rem)
- **Weight:** 600 (semibold)
- **Line Height:** 1.33
- **Letter Spacing:** -0.01em
- **Use Cases:**
  - Main section headers
  - Major feature titles
  - Subsection headings
- **Example Classes:** `typography-h2`, `.text-h2`
- **HTML Element:** `<h2>`

```tsx
<h2 className="typography-h2">Everything You Need to Succeed in Trading</h2>
```

---

#### H3 - Card Titles (18px, weight: 600)

- **Size:** 18px (1.125rem)
- **Weight:** 600 (semibold)
- **Line Height:** 1.33
- **Use Cases:**
  - Card titles
  - Feature titles
  - Subsection headers within cards
- **Example Classes:** `typography-h3`, `.text-h3`
- **HTML Element:** `<h3>`

```tsx
<h3 className="typography-h3">Advanced Charting</h3>
```

---

#### H4 - Subsection Headers (16px, weight: 600)

- **Size:** 16px (1rem)
- **Weight:** 600 (semibold)
- **Line Height:** 1.375
- **Use Cases:**
  - Subsection headers
  - Form section titles
  - Component headers
- **Example Classes:** `typography-h4`, `.text-h4`
- **HTML Element:** `<h4>`

```tsx
<h4 className="typography-h4">Bank-Level Security</h4>
```

---

### Body Text Hierarchy

#### Body - Regular Text (14px, weight: 400)

- **Size:** 14px (0.875rem)
- **Weight:** 400 (normal)
- **Line Height:** 1.625
- **Use Cases:**
  - Default body text
  - Paragraph content
  - Regular descriptions
- **Example Classes:** `typography-body`, `.text-body`
- **HTML Element:** `<p>`

```tsx
<p className="typography-body">Welcome back to your trading account</p>
```

---

#### Small - Helper Text (12px, weight: 400)

- **Size:** 12px (0.75rem)
- **Weight:** 400 (normal)
- **Line Height:** 1.5
- **Use Cases:**
  - Secondary text
  - Helper text
  - Captions
- **Example Classes:** `typography-small`, `.text-small`
- **HTML Element:** `<small>`

```tsx
<small className="typography-small">You haven't opened any positions yet</small>
```

---

#### Label - Form Labels (14px, weight: 500)

- **Size:** 14px (0.875rem)
- **Weight:** 500 (medium)
- **Line Height:** 1.43
- **Use Cases:**
  - Form labels
  - Field names
  - Metadata labels
- **Example Classes:** `typography-label`, `.text-label`
- **HTML Element:** `<label>`

```tsx
<label className="typography-label">Account Status</label>
```

---

#### Caption - Metadata (12px, weight: 500)

- **Size:** 12px (0.75rem)
- **Weight:** 500 (medium)
- **Line Height:** 1.5
- **Use Cases:**
  - Timestamps
  - Metadata
  - Small info text
- **Example Classes:** `typography-caption`, `.text-caption`
- **HTML Element:** `<div>`

```tsx
<div className="typography-caption">Updated 2 minutes ago</div>
```

---

## CSS Custom Properties

All typography values are defined as CSS custom properties for easy customization and responsive scaling.

### Font Size Variables

```css
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */
--text-5xl: 3rem; /* 48px */
--text-6xl: 3.75rem; /* 60px */
```

### Font Weight Variables

```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Line Height Variables

```css
--leading-tight: 1.2;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 1.875;
```

### Heading-Specific Variables

```css
--h1-size: 2rem; /* 32px */
--h1-weight: 700;
--h1-line-height: 1.2;
--h1-letter-spacing: -0.02em;

--h2-size: 1.5rem; /* 24px */
--h2-weight: 600;
--h2-line-height: 1.33;
--h2-letter-spacing: -0.01em;

--h3-size: 1.125rem; /* 18px */
--h3-weight: 600;
--h3-line-height: 1.33;
--h3-letter-spacing: 0;

--h4-size: 1rem; /* 16px */
--h4-weight: 600;
--h4-line-height: 1.375;
--h4-letter-spacing: 0;
```

---

## Component Library

### React Components (typography.tsx)

#### H1 Component

```tsx
import { H1 } from "@/components/ui/typography";

<H1>Page Title</H1>;
```

#### H2 Component

```tsx
import { H2 } from "@/components/ui/typography";

<H2>Section Header</H2>;
```

#### H3 Component

```tsx
import { H3 } from "@/components/ui/typography";

<H3>Card Title</H3>;
```

#### H4 Component

```tsx
import { H4 } from "@/components/ui/typography";

<H4>Subsection Header</H4>;
```

#### Body Component

```tsx
import { Body } from "@/components/ui/typography";

<Body>This is regular body text</Body>;
```

#### BodySmall Component

```tsx
import { BodySmall } from "@/components/ui/typography";

<BodySmall>This is smaller text</BodySmall>;
```

#### Label Component

```tsx
import { Label } from "@/components/ui/typography";

<Label>Form Label</Label>;
```

#### Caption Component

```tsx
import { Caption } from "@/components/ui/typography";

<Caption>Metadata or timestamp</Caption>;
```

---

## Utility Functions

### typographyUtils.ts

Comprehensive utility functions for working with the typography system.

#### getHeadingClass(level: 1-6)

Get the typography class name for a heading level.

```tsx
import { getHeadingClass } from "@/lib/typographyUtils";

const className = getHeadingClass(2);
// Returns: 'typography-h2'
```

#### createTypographyStyle()

Create a custom typography style object.

```tsx
import { createTypographyStyle } from "@/lib/typographyUtils";

const style = createTypographyStyle(16, 600, 1.5);
// Returns: { fontSize: '16px', fontWeight: 600, lineHeight: 1.5 }
```

#### isTypographyLoaded()

Check if typography CSS variables are loaded.

```tsx
import { isTypographyLoaded } from "@/lib/typographyUtils";

if (isTypographyLoaded()) {
  console.log("Typography system is ready");
}
```

#### validateTypography()

Validate the typography system configuration.

```tsx
import { validateTypography } from "@/lib/typographyUtils";

const validation = validateTypography();
if (!validation.isValid) {
  console.error("Typography errors:", validation.errors);
}
```

#### logTypographyDiagnostics()

Log typography diagnostics to console (dev only).

```tsx
import { logTypographyDiagnostics } from "@/lib/typographyUtils";

logTypographyDiagnostics();
// Logs all typography variables and validates the system
```

---

## Responsive Typography

The typography system scales responsively across breakpoints:

### Tablet (max-width: 768px)

- H1: 28px (from 32px)
- H2: 22px (from 24px)
- H3: 16px (from 18px)
- H4: 15px (from 16px)
- Body: 13px (from 14px)
- Label: 13px (from 14px)

### Mobile (max-width: 640px)

- H1: 24px (from 32px)
- H2: 20px (from 24px)
- H3: 15px (from 18px)
- H4: 14px (from 16px)
- Body: 13px (from 14px)

The scaling is automatic and controlled by CSS media queries.

---

## Best Practices

### ✅ DO

1. **Use semantic HTML elements**

   ```tsx
   <h1 className="typography-h1">Title</h1>
   <h2 className="typography-h2">Section</h2>
   <p className="typography-body">Text</p>
   ```

2. **Use typography utility classes**

   ```tsx
   <div className="typography-label">Label</div>
   ```

3. **Use React components for consistency**

   ```tsx
   import { H1, H2, Body } from "@/components/ui/typography";
   <H1>Title</H1>;
   ```

4. **Maintain proper hierarchy**

   ```tsx
   <H1>Main Title</H1>
   <H2>Section</H2>
   <H3>Subsection</H3>
   ```

5. **Use CSS variables when customizing**
   ```tsx
   <p
     style={{ fontSize: "var(--body-size)", fontWeight: "var(--body-weight)" }}
   >
     Text
   </p>
   ```

### ❌ DON'T

1. **Don't use hardcoded font sizes**

   ```tsx
   ❌ <h1 style={{ fontSize: '32px' }}>Title</h1>
   ✅ <h1 className="typography-h1">Title</h1>
   ```

2. **Don't skip heading levels**

   ```tsx
   ❌ <h1>Title</h1>
     <h3>Subsection</h3> {/* Skipped H2 */}
   ✅ <h1>Title</h1>
     <h2>Section</h2>
     <h3>Subsection</h3>
   ```

3. **Don't mix Tailwind and typography classes inconsistently**

   ```tsx
   ❌ <h1 className="text-3xl font-bold">Title</h1>
   ✅ <h1 className="typography-h1">Title</h1>
   ```

4. **Don't use divs for headings**
   ```tsx
   ❌ <div className="typography-h1">Title</div>
   ✅ <h1 className="typography-h1">Title</h1>
   ```

---

## Files Modified

1. **src/styles/typography.css** - New
   - Defines all CSS custom properties
   - Implements responsive scaling
   - Provides utility classes

2. **src/components/ui/typography.tsx** - Updated
   - Updated components to use CSS variables
   - Added documentation JSDoc comments
   - Maintained component exports

3. **src/lib/typographyUtils.ts** - New
   - Utility functions for typography
   - Validation and diagnostics
   - Helper functions for common tasks

4. **src/index.css** - Updated
   - Imports typography.css system

5. **src/pages/** - Updated
   - Dashboard.tsx
   - Index.tsx
   - NotFound.tsx
   - KYC.tsx
   - Notifications.tsx
   - Wallet.tsx
   - RiskManagement.tsx
   - Other pages with heading elements

---

## Migration Guide

### For Existing Code

If you have existing components using Tailwind typography classes, migrate them as follows:

#### Old (Tailwind)

```tsx
<h1 className="text-3xl font-bold">Title</h1>
<p className="text-sm font-normal">Body</p>
```

#### New (CSS Variables)

```tsx
<h1 className="typography-h1">Title</h1>
<p className="typography-body">Body</p>
```

Or use components:

```tsx
<H1>Title</H1>
<Body>Body</Body>
```

---

## Validation & Debugging

### Check if typography is loaded

```tsx
import { isTypographyLoaded } from "@/lib/typographyUtils";

console.log(isTypographyLoaded()); // true/false
```

### Get all typography variables

```tsx
import { getTypographyVariables } from "@/lib/typographyUtils";

const vars = getTypographyVariables();
console.table(vars);
```

### Run diagnostics in console

```tsx
import { logTypographyDiagnostics } from "@/lib/typographyUtils";

logTypographyDiagnostics();
// Logs validation, variables, and any issues
```

### Validate system configuration

```tsx
import { validateTypography } from "@/lib/typographyUtils";

const result = validateTypography();
console.log("Valid:", result.isValid);
console.log("Errors:", result.errors);
console.log("Warnings:", result.warnings);
```

---

## Performance Considerations

1. **CSS Custom Properties** - Zero runtime overhead
2. **Responsive Scaling** - Uses CSS media queries (no JS)
3. **Minimal Bundle Impact** - ~3KB CSS gzip
4. **No Font Loading** - Uses system fonts for performance
5. **Hardware Acceleration** - Inherent with CSS approach

---

## Browser Support

- ✅ Chrome 49+
- ✅ Firefox 31+
- ✅ Safari 9.1+
- ✅ Edge 15+
- ✅ iOS Safari 9.3+
- ✅ Android Browser 37+

All modern browsers support CSS custom properties.

---

## Future Enhancements

1. **Font loading** - Consider Geist or Inter font family
2. **Advanced scaling** - Fluid typography with clamp()
3. **Font optimization** - Variable fonts
4. **Dark mode variants** - Font weight adjustments for dark mode
5. **Multilingual support** - Language-specific font metrics

---

## References

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Typography Best Practices](https://www.typewolf.com/blog/web-typography-best-practices/)
- [Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Typography Standards](https://www.smashingmagazine.com/2021/07/css-system-font-stack-ragged/)

---

**Last Updated:** November 25, 2025  
**Status:** ✅ Complete  
**Implementation Time:** ~4 hours
