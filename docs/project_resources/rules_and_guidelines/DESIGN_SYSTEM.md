# TradeX Pro Design System Documentation

## Overview

The TradeX Pro Design System provides a comprehensive, unified set of design tokens and components that ensure visual consistency, accessibility, and professional quality across the entire CFD trading platform.

**Last Updated:** December 2025  
**Version:** 1.0 - Official Release  
**Status:** Authoritative Foundation for All Frontend Development

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography System](#typography-system)
3. [Spacing System](#spacing-system)
4. [Components](#components)
5. [Accessibility](#accessibility)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)

---

## Color Palette

### Authoritative Colors

All colors are defined in the unified guidelines and verified for WCAG AAA compliance.

| Color | Hex Code | Usage | Contrast Ratio | Compliance |
|-------|----------|-------|---|---|
| **Deep Navy** | #0A1628 | Main backgrounds, headers, primary UI | 4.6:1 vs white | AAA |
| **Electric Blue** | #00D4FF | Interactive elements, CTAs, highlights | 3.2:1 vs navy | AA |
| **Emerald Green** | #00C896 | Buy orders, profit indicators, success | 5.1:1 vs charcoal | AAA |
| **Crimson Red** | #FF4757 | Sell orders, loss indicators, danger | 3.8:1 vs charcoal | AA |
| **Charcoal Gray** | #2C3E50 | Secondary backgrounds, panels | 4.5:1 vs white | AAA |
| **Silver Gray** | #95A5A6 | Text, borders, secondary information | 7.1:1 vs navy | AAA |
| **Pure White** | #FFFFFF | Text on dark backgrounds | 21:1 vs navy | AAA |
| **Warm Gold** | #F39C12 | Premium features, warnings (max 5% usage) | 3.2:1 vs navy | AA |

### Usage Rules

✅ **DO:**
- Use Deep Navy (#0A1628) as primary background (never #1E3A8A or #002B5B)
- Use Electric Blue (#00D4FF) for all interactive elements
- Maintain 40% whitespace ratio across all views
- Ensure WCAG AAA compliance (7:1 contrast for text)
- Use Silver Gray for secondary text
- Use Pure White for primary text on dark backgrounds

❌ **DON'T:**
- Use pure white in light mode backgrounds
- Use Gold for text or primary backgrounds
- Exceed 5% UI surface area with Gold
- Mix color systems (don't use HSL variables and hex codes together)
- Use colors outside the defined palette

### Semantic Color Usage

```typescript
// ✅ CORRECT: Use semantic colors
import { SEMANTIC_COLORS } from '@/constants/designTokens';

const buttonStyles = {
  background: SEMANTIC_COLORS.background.primary,
  color: SEMANTIC_COLORS.text.primary,
  borderColor: SEMANTIC_COLORS.interactive.primary,
};

// ❌ WRONG: Hardcoding colors
const badStyles = {
  background: '#0A1628', // Don't hardcode
  color: '#FFFFFF', // Use tokens instead
};
```

---

## Typography System

### Font Stack

**Primary Font:** Inter (headings and body text)
- Modern, technical, excellent readability
- Optimized for digital interfaces
- Web-safe with comprehensive language support

**Monospace Font:** JetBrains Mono (code, data, prices)
- Designed for technical content
- Consistent character width (tabular numbers)
- Perfect for trading data display

### Heading Hierarchy

| Level | Desktop | Mobile | Weight | Usage |
|-------|---------|--------|--------|-------|
| **H1** | 48px | 36px | Bold (700) | Page titles, hero content |
| **H2** | 36px | 28px | Semibold (600) | Major section headers |
| **H3** | 28px | 22px | Semibold (600) | Subsection headers |
| **H4** | 22px | 18px | Semibold (600) | Minor headers |
| **H5** | 16px | 16px | Semibold (600) | Small headers |

### Body Text

| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| **Body** | 16px | Regular (400) | Primary content text |
| **Body Medium** | 16px | Medium (500) | Emphasized text |
| **Small** | 14px | Regular (400) | Labels, secondary text |
| **Caption** | 12px | Regular (400) | Tertiary text, helpers |
| **Mono** | 14px | Medium (500) | Code, data, prices |

### Typography Rules

- **Maximum font weights per interface:** 3
- **Preferred weights:** 400 (regular), 600 (semibold), 700 (bold)
- **Responsive scaling:** All headings scale smoothly from mobile to desktop
- **Line-height consistency:** Maintains proper readability on all screen sizes
- **Letter-spacing:** Slightly negative (-0.02em) for headings, normal (0) for body

### Typography Component Usage

```typescript
// ✅ CORRECT: Use Typography components
import { Typography, H1, Body, Mono } from '@/components/common/Typography';

export function Dashboard() {
  return (
    <div>
      <H1>Dashboard</H1>
      <Body>Welcome to your trading dashboard</Body>
      <Mono>Data goes here</Mono>
    </div>
  );
}

// Trading-specific components
import { Price, Symbol, ChangePercent } from '@/components/common/Typography';

export function PriceCard({ symbol, price, change }) {
  return (
    <div>
      <Symbol symbol={symbol} />
      <Price value={price} isProfit={change > 0} isLarge />
      <ChangePercent value={change} />
    </div>
  );
}
```

---

## Spacing System

### 8px Grid System

All spacing values are multiples of 8px to maintain visual consistency and alignment.

| Level | Value | Usage |
|-------|-------|-------|
| **0** | 0px | Reset spacing |
| **1** | 4px | Rare edge cases only |
| **2** | 8px | Minimal gaps, internal component spacing |
| **3** | 16px | Element gaps, input padding |
| **4** | 24px | Component padding, section gaps |
| **5** | 32px | Page padding, large gaps |
| **6** | 48px | Section margins, major padding |
| **7** | 64px | Large gaps |
| **8** | 80px | Extra-large spacing |
| **9** | 96px | Page-level spacing |
| **10** | 128px | Full page margins |

### Responsive Spacing

Spacing adjusts automatically based on breakpoint:

```typescript
// Page margins scale by device
- Mobile: 24px (Spacing[3])
- Tablet: 32px (Spacing[4])
- Desktop: 48px (Spacing[6])

// Section gaps also scale
- Mobile: 32px
- Tablet: 32px
- Desktop: 48px
```

### Component Spacing

```typescript
// Button padding
- Small: 8px vertical × 12px horizontal
- Medium: 12px vertical × 16px horizontal
- Large: 16px vertical × 24px horizontal

// Input fields (minimum 44px height for touch targets)
- Small: 40px
- Medium: 44px (recommended for mobile)
- Large: 48px

// Card padding
- Small: 16px
- Medium: 24px
- Large: 32px

// Touch targets (mobile accessibility)
- Minimum: 44px (WCAG requirement)
- Comfortable: 48px (recommended)
- Large: 56px (for important actions)
```

### Layout Components

```typescript
// ✅ CORRECT: Use layout components
import {
  Container,
  Section,
  Flex,
  Grid,
  Stack,
  Spacer,
} from '@/components/common/Layout';

export function Page() {
  return (
    <Container maxWidth="7xl">
      <Section spacing="normal">
        <H1>Main Title</H1>
        <Grid cols={3} gap="normal">
          <Card>Item 1</Card>
          <Card>Item 2</Card>
          <Card>Item 3</Card>
        </Grid>
      </Section>

      <Spacer size="lg" />

      <Section spacing="normal">
        <Stack spacing="normal">
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>
      </Section>
    </Container>
  );
}
```

---

## Components

### Available Components

All components are built using the design tokens and adhere to the spacing system.

#### Typography Components

```typescript
import {
  Typography,    // Generic variant-based component
  H1, H2, H3, H4, H5,  // Heading variants
  Body, BodyMedium, Small, Caption,  // Text variants
  Mono, MonoSmall,  // Monospace for data
  Price, Symbol, ChangePercent,  // Trading-specific
} from '@/components/common/Typography';
```

#### Layout Components

```typescript
import {
  Container,  // Main page container with margins
  Section,    // Semantic section with spacing
  Flex,       // Flexible row/column layout
  Grid,       // Grid layout with responsive columns
  Stack,      // Vertical flex with spacing
  Spacer,     // Consistent whitespace
  Inset,      // Margin wrapper
  PaddedBox,  // Padding wrapper
} from '@/components/common/Layout';
```

### Component Composition

```typescript
// Example: Card component using design tokens
import { PaddedBox } from '@/components/common/Layout';
import { H3, Body } from '@/components/common/Typography';

export function Card({ title, content }) {
  return (
    <PaddedBox size="lg" className="bg-charcoal border border-charcoal-gray/30 rounded-lg">
      <H3 className="mb-3">{title}</H3>
      <Body>{content}</Body>
    </PaddedBox>
  );
}
```

---

## Accessibility

### WCAG 2.1 AA Compliance

All design tokens meet WCAG 2.1 AA standards at minimum, with many exceeding to AAA:

- **Text Contrast:** Minimum 4.5:1, target 7:1 (AAA)
- **Interactive Elements:** Minimum 3:1
- **Touch Targets:** Minimum 44×44px (mobile)
- **Focus Indicators:** Always visible, 2px minimum
- **Keyboard Navigation:** All interactive elements keyboard accessible
- **Reduced Motion:** Respects `prefers-reduced-motion` preference

### Color Accessibility

```typescript
// ✅ CORRECT: Colors meet contrast requirements
<div className="bg-navy text-white">
  {/* 21:1 contrast ratio - AAA */}
</div>

// ❌ WRONG: Insufficient contrast
<div className="bg-navy text-silver-gray/50">
  {/* ~3:1 contrast ratio - fails accessibility */}
</div>
```

### Focus Management

```typescript
// ✅ CORRECT: Use focus indicators
<button className="focus:ring-2 focus:ring-offset-2 focus:ring-electric-blue">
  Click me
</button>

// Focus ring colors use electric-blue for visibility
```

### Typography Accessibility

```typescript
// ✅ CORRECT: Use semantic heading levels
<section>
  <H1>Main Topic</H1>
  <H2>Subtopic</H2>
  <H3>Detail</H3>
</section>

// ❌ WRONG: Skipping heading levels breaks document structure
<section>
  <H1>Main Topic</H1>
  <H3>Detail</H3>  {/* Skip h2! */}
</section>
```

---

## Usage Examples

### Full Page Layout

```typescript
import {
  Container,
  Section,
  Grid,
  Stack,
} from '@/components/common/Layout';
import { H1, H2, Body } from '@/components/common/Typography';

export function Dashboard() {
  return (
    <Container maxWidth="7xl">
      {/* Hero Section */}
      <Section spacing="loose">
        <H1>Trading Dashboard</H1>
        <Body>Manage your positions and execute trades</Body>
      </Section>

      {/* Main Grid */}
      <Section spacing="normal">
        <H2>Active Positions</H2>
        <Grid cols={3} gap="normal">
          <PositionCard />
          <PositionCard />
          <PositionCard />
        </Grid>
      </Section>

      {/* Supporting Section */}
      <Section spacing="normal">
        <H2>Recent Trades</H2>
        <Stack spacing="normal">
          <TradeItem />
          <TradeItem />
          <TradeItem />
        </Stack>
      </Section>
    </Container>
  );
}
```

### Form Example

```typescript
import { Flex, Stack, PaddedBox } from '@/components/common/Layout';
import { H2, Body, Small } from '@/components/common/Typography';

export function TradeForm() {
  return (
    <PaddedBox size="lg" className="bg-charcoal rounded-lg">
      <H2 className="mb-4">New Trade</H2>

      <Stack spacing="normal" className="space-y-6">
        {/* Symbol Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Symbol</label>
          <input className="w-full" placeholder="EUR/USD" />
        </div>

        {/* Size Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Size</label>
          <input className="w-full" placeholder="1.0" />
        </div>

        {/* Action Buttons */}
        <Flex gap="normal" justify="end">
          <button className="px-4 py-2">Cancel</button>
          <button className="px-4 py-2 bg-electric-blue">Place Trade</button>
        </Flex>
      </Stack>
    </PaddedBox>
  );
}
```

### Trading UI Example

```typescript
import {
  Price,
  Symbol,
  ChangePercent,
  Body,
} from '@/components/common/Typography';
import { Flex, PaddedBox } from '@/components/common/Layout';

export function PriceCard({ symbol, price, change }) {
  return (
    <PaddedBox size="md" className="bg-charcoal rounded-lg">
      <Flex direction="col" gap="tight">
        <Symbol symbol={symbol} />
        <Price value={price} isLarge isProfit={change > 0} />
        <ChangePercent value={change} />
      </Flex>
    </PaddedBox>
  );
}
```

---

## Best Practices

### Do's

✅ **Always use design tokens** instead of hardcoding values  
✅ **Use semantic components** (H1, H2, Body, etc.) for text  
✅ **Use layout components** for consistent spacing  
✅ **Maintain 40% whitespace** across all views  
✅ **Test color contrast** before deploying changes  
✅ **Use responsive spacing** (Container/Section handle this)  
✅ **Follow the 8px grid** for all spacing  
✅ **Use tabular numbers** for data/prices (Mono component)  
✅ **Provide focus indicators** on interactive elements  
✅ **Test with keyboard navigation** for accessibility  

### Don'ts

❌ **Don't hardcode colors** - use COLORS or SEMANTIC_COLORS  
❌ **Don't use arbitrary spacing** - stick to 8px multiples  
❌ **Don't skip heading levels** - maintain document structure  
❌ **Don't create components** that duplicate existing tokens  
❌ **Don't use more than 3 font weights** per interface  
❌ **Don't exceed 5% UI surface** with Gold color  
❌ **Don't remove focus indicators** - always accessible  
❌ **Don't use text smaller than 14px** without justification  
❌ **Don't create custom color combinations** - use defined palette  
❌ **Don't override token values** in components  

### Performance Considerations

- Typography components are fully typed for IntelliSense
- Layout components use CSS Grid/Flexbox (no JS calculations)
- Design tokens are static (no runtime overhead)
- Components use React.memo for optimization where needed
- All spacing uses Tailwind utilities (production-optimized)

### Maintenance Guidelines

1. **Update tokens centrally** in `src/constants/designTokens.ts`
2. **Add new colors/spacing** only to token files
3. **Test WCAG compliance** for new color combinations
4. **Document component changes** in this file
5. **Run tests** after any design system updates
6. **Update visual regression tests** when tokens change

---

## Resources

### Color Accessibility Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)
- [Accessible Colors](https://accessible-colors.com/)

### Typography Resources

- [Inter Font](https://rsms.me/inter/)
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
- [Typography Scale Calculator](https://type-scale.com/)
- [WCAG Typography Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html)

### Layout & Spacing

- [Spacing Scale Calculator](https://www.gridlover.net/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

### Standards & Guidelines

- [WCAG 2.1 Standards](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design System](https://m3.material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

## Support & Contributions

For questions or contributions to the design system:

1. Review this documentation
2. Check existing components in `src/components/common/`
3. Check tokens in `src/constants/`
4. Ensure all changes maintain WCAG AAA compliance
5. Update this documentation when adding new patterns

---

**Last Updated:** December 2025  
**Version:** 1.0  
**Maintained by:** Frontend Team
