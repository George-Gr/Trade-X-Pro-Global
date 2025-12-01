# TradePro Frontend Style Guide & Implementation Standards

## 1. Design System Guidelines

### Color Palette Implementation

#### Primary Color System
| Role | Hex Code | Usage | Contrast Ratio | Enforcement |
|------|----------|-------|----------------|-------------|
| **Deep Navy Blue** | #0A1628 | Primary buttons, headers, sidebar, primary CTAs | 4.6:1 (vs white) | Mandatory for all primary interactive elements |
| **Gold Accents** | #F39C12 | Premium badges, borders, highlights | 3.2:1 (vs navy) | Maximum 5% of UI surface area |
| **Emerald Green** | #00C896 | Buy orders, profit indicators, success states | 5.1:1 (vs charcoal) | Use only for positive financial actions |
| **Crimson Red** | #FF4757 | Sell orders, losses, warnings | 3.8:1 (vs charcoal) | Never use for primary actions |
| **Warm White** | #FAFAF5 | Light mode backgrounds | N/A | Minimum 40% whitespace ratio |
| **Dark Charcoal** | #0F1419 | Dark mode backgrounds | N/A | Pure black (#000000) strictly prohibited |

#### Color Application Rules
- **DO**: Use gold accents only for premium indicators and critical CTAs
- **DON'T**: Use gold for text or primary backgrounds
- **DO**: Pair emerald green with warm white for maximum readability
- **DON'T**: Use red for informational elements (only for critical warnings)
- **DO**: Maintain 40% whitespace ratio across all views
- **DON'T**: Allow pure white (#FFFFFF) in any light mode implementation

#### Color Contrast Requirements
- All text must meet WCAG AAA standards (7:1 contrast ratio)
- Critical information (warnings, errors) must exceed 4.5:1 contrast
- Interactive elements must have 3:1 contrast between states (hover/focus)

### Typography Specifications

#### Font System
| Element | Font | Size | Weight | Line Height | Tracking | Usage |
|---------|------|------|--------|-------------|----------|-------|
| **H1 (Page Title)** | Playfair Display | 48px | 700 | 1.2 | 0 | Landing hero, page header |
| **H2 (Section Title)** | Playfair Display | 36px | 600 | 1.3 | 0 | Major sections |
| **H3 (Subsection)** | Playfair Display | 28px | 600 | 1.4 | 0 | Subsections, cards |
| **H4 (Component Title)** | Playfair Display | 22px | 600 | 1.4 | 0 | Modal titles, card headers |
| **H5 (Label)** | Manrope | 16px | 600 | 1.5 | 0.02em | Form labels, UI text |
| **Body (Regular)** | Manrope | 16px | 400 | 1.6 | 0.01em | Main content, descriptions |
| **Body (Small)** | Manrope | 14px | 400 | 1.6 | 0.01em | Secondary info, help text |
| **Caption** | Manrope | 12px | 500 | 1.4 | 0.04em | Timestamps, meta info |
| **Mono (Data)** | Manrope | 13px | 400 | 1.5 | 0 | Numbers, prices, code |

#### Mobile Typography
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| **H1** | 36px | 700 | 1.2 |
| **H2** | 28px | 600 | 1.3 |
| **H3** | 22px | 600 | 1.4 |
| **Body** | 16px | 400 | 1.6 |
| **Caption** | 12px | 500 | 1.4 |

#### Typography Rules
- **DO**: Use Playfair Display only for headings H1-H4, badges, and critical metrics
- **DON'T**: Use serif fonts for body text, form inputs, or button labels
- **DO**: Limit font weights to 3 per view (bold, semibold, regular)
- **DON'T**: Exceed 4 font weights in any single interface
- **DO**: Maintain minimum 16px body text on mobile (iOS requirement)
- **DON'T**: Justify text alignment (always use left-aligned text)

### Spacing & Layout Standards

#### Spacing System
| Level | Desktop | Mobile | Usage |
|-------|---------|--------|-------|
| **0** | 0px | 0px | No spacing |
| **1** | 4px | 4px | Small internal padding |
| **2** | 8px | 8px | Standard spacing unit |
| **3** | 16px | 12px | Card padding, element spacing |
| **4** | 24px | 16px | Section padding, card margins |
| **5** | 32px | 24px | Major section gaps |
| **6** | 48px | 32px | Page margins, section gaps |

#### Layout Requirements
- **Page margins**: 48px desktop, 24px mobile (minimum)
- **Section gaps**: 48px between major sections
- **Card margins**: 24px minimum
- **Element padding**: 16px-24px (never less than 16px)
- **Whitespace ratio**: Minimum 40% blank space in all views

#### Grid System
```css
/* Base grid implementation */
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 48px;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .grid-container {
    padding: 0 32px;
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(8, 1fr);
    padding: 0 24px;
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: 1fr;
    padding: 0 16px;
    gap: 16px;
  }
}
```

### Component Specifications

#### Button System
| Type | Background | Text Color | Border | Padding | Height | Hover Effect |
|------|------------|------------|--------|---------|--------|--------------|
| **Primary** | #F39C12 (gold) | #0F1419 (charcoal) | none | 12px 24px | 48px | Darken gold 5% |
| **Secondary** | transparent | #0A1628 (navy) | 2px solid #0A1628 | 10px 22px | 46px | Navy background |
| **Danger** | #FF4757 (crimson) | #FAFAF5 (white) | none | 12px 24px | 48px | Darken red 10% |
| **Ghost** | transparent | #FAFAF5 | 1px solid #FAFAF5 | 10px 20px | 46px | Background #0A1628 |

#### Button Implementation Rules
```css
.button {
  border-radius: 8px;
  font-family: 'Manrope', sans-serif;
  font-weight: 600;
  font-size: 16px;
  transition: all 150ms ease-out;
  cursor: pointer;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.button-primary {
  background-color: #D4AF37;
  color: #0F1419;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.button-primary:hover {
  background-color: #c49f2f;
  transform: scale(1.02);
}

.button:active {
  animation: button-press 150ms ease-out;
}

@keyframes button-press {
  0% { transform: scale(0.98); box-shadow: 0 1px 2px; }
  100% { transform: scale(1); box-shadow: 0 4px 8px; }
}
```

#### Card Elevation System
| Level | Box Shadow | Usage | Enforcement |
|-------|------------|-------|-------------|
| **1 (Flat)** | none | Background elements | Secondary cards only |
| **2 (Subtle)** | 0 1px 3px rgba(0,0,0,0.1) | Primary content cards | Default card state |
| **3 (Medium)** | 0 4px 6px rgba(0,0,0,0.1) | Trading panels, primary actions | Interactive elements |
| **4 (Prominent)** | 0 10px 15px rgba(0,0,0,0.15) | Modals, alerts, hero CTAs | Critical UI elements |
| **5 (Premium)** | 0 0 40px rgba(212,175,55,0.3) | Premium badges, verification | Gold glow effect only |

## 2. Code Standards

### File Naming & Structure
```
src/
├── assets/
│   ├── fonts/                # Font files with proper licensing
│   ├── icons/                # SVG icons organized by category
│   └── images/               # Optimized images
├── components/
│   ├── common/               # Reusable UI components
│   │   ├── buttons/
│   │   │   ├── ButtonPrimary.vue
│   │   │   ├── ButtonSecondary.vue
│   │   │   └── index.ts      # Barrel file
│   │   ├── cards/
│   │   └── typography/
│   ├── layout/               # Layout components
│   └── features/             # Feature-specific components
├── design-system/
│   ├── tokens/               # Design tokens
│   │   ├── colors.css        # CSS variables
│   │   ├── spacing.css
│   │   └── typography.css
│   └── mixins/               # SCSS/Sass mixins
├── pages/                    # Page components
├── styles/
│   ├── base/                 # Reset, typography
│   ├── components/           # Component styles
│   └── themes/               # Light/dark mode
├── utils/
└── views/                    # View components (if using Vue)
```

### CSS/SCSS Organization
```css
/* design-system/tokens/colors.css */
:root {
  /* Primary Colors */
  --color-navy: #0A1628;
  --color-navy-light: #3B5DBA;
  --color-gold: #D4AF37;
  --color-gold-light: #E6C35C;
  --color-emerald: #10B981;
  --color-crimson: #DC2626;
  
  /* Neutrals */
  --color-warm-white: #FAFAF5;
  --color-charcoal: #0F1419;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  
  /* States */
  --color-hover-overlay: rgba(0,0,0,0.05);
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --color-warm-white: #121821;
    --color-charcoal: #FAFAF5;
    --color-gray-100: #1F2937;
    --color-gray-200: #374151;
  }
}
```

### Component Architecture Guidelines
- All components must be built as self-contained units
- Components must accept a `theme` prop for color variations
- Maximum component complexity: 300 lines of code
- All interactive components require keyboard navigation support
- Components must include accessibility attributes by default

```vue
<!-- Example ButtonPrimary.vue -->
<template>
  <button 
    class="button button-primary" 
    :class="{ 'button-full-width': fullWidth }"
    :aria-label="ariaLabel || label"
    @click="$emit('click', $event)"
  >
    <span v-if="iconLeft" class="button-icon"><Icon :name="iconLeft" /></span>
    <span class="button-label">{{ label }}</span>
    <span v-if="iconRight" class="button-icon"><Icon :name="iconRight" /></span>
  </button>
</template>

<script setup lang="ts">
defineProps({
  label: { type: String, required: true },
  fullWidth: { type: Boolean, default: false },
  ariaLabel: { type: String, default: null },
  iconLeft: { type: String, default: null },
  iconRight: { type: String, default: null }
});
</script>

<style scoped>
.button-primary {
  background-color: var(--color-gold);
  color: var(--color-charcoal);
}
</style>
```

## 3. Implementation Rules

### Responsive Design Requirements
- **Mobile-first approach required** (60%+ traffic is mobile)
- Minimum touch target size: 48px × 48px
- All text must be readable without zoom on mobile
- Breakpoints:
  - Mobile: 0-768px
  - Tablet: 769-1024px 
  - Desktop: 1025px+
- All layouts must collapse gracefully to single column on mobile

### Accessibility Requirements
- **WCAG AAA compliance** for all critical paths
- Color contrast minimum 7:1 for text (AAA standard)
- All interactive elements must be keyboard navigable
- All icons must have accessible labels
- Form elements require proper ARIA attributes
- Screen reader announcements for critical state changes
- Colorblind mode toggle must be available in settings

### Performance Optimization
- Lighthouse performance score minimum 90
- First Contentful Paint < 2 seconds
- Critical CSS bundle < 50KB
- All images must be optimized (WebP format preferred)
- Lazy load non-critical components
- Implement skeleton loaders for all async operations
- All animations must use `will-change` and `transform` properties

### Browser Compatibility
- **Required support**:
  - Chrome (latest 2 versions)
  - Firefox (latest 2 versions)
  - Safari (latest 2 versions)
  - Edge (latest 2 versions)
- **Mobile support**:
  - iOS Safari (latest 2 versions)
  - Android Chrome (latest 2 versions)
- **Polyfills required** for CSS variables in legacy browsers

## 4. Dos and Don'ts

### Color Implementation
| DO | DON'T |
|----|-------|
| Use gold accents for premium indicators only | Use gold for primary backgrounds |
| Pair emerald green with warm white | Use pure white backgrounds |
| Maintain 40% whitespace ratio | Crowd elements together |
| Use crimson red only for critical warnings | Use red for informational elements |
| Implement warm white in light mode | Use pure white (#FFFFFF) |

### Typography Implementation
| DO | DON'T |
|----|-------|
| Use Playfair Display for headings H1-H4 | Use serif fonts for body text |
| Maintain 16px minimum body text on mobile | Use <16px text on mobile |
| Use Manrope for data displays | Use Playfair Display for numbers |
| Limit to 3 font weights per view | Exceed 4 font weights in any view |
| Increase letter spacing for dyslexia mode | Justify text alignment |

### Component Implementation
| DO | DON'T |
|----|-------|
| Implement button press animation | Use static buttons |
| Use skeleton loaders for async operations | Show spinners immediately |
| Add gold flash for successful trades | Use generic success messages |
| Implement progressive disclosure | Show all options at once |
| Use card elevation hierarchy | Apply random shadows |

### Common Code Review Checkpoints
1. Verify color usage follows the palette system (no unauthorized colors)
2. Check font usage against typography rules (serif/sans-serif usage)
3. Validate spacing follows the 48px/24px standard
4. Confirm accessibility attributes are present
5. Check performance metrics (bundle size, image optimization)
6. Verify mobile responsiveness at all breakpoints
7. Ensure proper implementation of micro-interactions
8. Validate error states and edge cases

## 5. Best Practices

### Reusable Component Creation
- Build components with single responsibility principle
- Use composition API for complex components
- Implement props for all configurable aspects
- Provide default slots for flexibility
- Document all props and events thoroughly

```ts
// Example component documentation
/**
 * PrimaryButton component
 * 
 * A premium gold button following our design system
 * 
 * @props
 * - label: string (required) - Button text
 * - fullWidth: boolean (default: false) - Makes button full width
 * - ariaLabel: string (optional) - Accessible label
 * - iconLeft: string (optional) - Left icon name
 * - iconRight: string (optional) - Right icon name
 * 
 * @events
 * - click: Emitted when button is clicked
 */
```

### State Management Patterns
- Use Vuex/Pinia for global state
- Component-local state for UI-specific states
- Implement state persistence for critical user preferences
- Use reactive state for real-time trading data
- Implement loading/error states for all async operations

```ts
// Trading data state example
interface TradingState {
  portfolio: Portfolio | null;
  positions: Position[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const useTradingStore = defineStore('trading', {
  state: (): TradingState => ({
    portfolio: null,
    positions: [],
    isLoading: false,
    error: null,
    lastUpdated: null
  }),
  actions: {
    async fetchPortfolio() {
      this.isLoading = true;
      try {
        const data = await api.getPortfolio();
        this.portfolio = data;
        this.lastUpdated = new Date();
      } catch (error) {
        this.error = 'Failed to load portfolio data';
        // Implementation-specific error handling
      } finally {
        this.isLoading = false;
      }
    }
  }
});
```

### Testing Requirements
- **Unit tests**: 80%+ coverage for critical components
- **Integration tests**: All user flows must be tested
- **Accessibility tests**: Axe-core integration required
- **Visual regression tests**: Critical UI components
- **Performance tests**: Lighthouse CI integration
- **All PRs must pass**:
  - ESLint with our config
  - Unit tests
  - Accessibility scan
  - Bundle size check

### Character Persona & Brand Voice

#### TradePro's Character Persona
- **Name**: Alex Sterling
- **Profession**: Experienced financial advisor with a tech background
- **Personality**: Confident but approachable, knowledgeable but not condescending
- **Voice**: Professional yet warm, precise but not technical

#### Micro-Copy Guidelines
| Context | DO | DON'T |
|---------|----|-------|
| **Onboarding** | "Let's get to know you" | "Personal Information" |
| **Success** | "Position opened at {price}! 🎯" | "Order executed successfully" |
| **Error** | "Email already registered. Sign in to continue?" | "Error 409: Conflict" |
| **CTA** | "Begin Your Trading Journey" | "Sign Up" |
| **Security** | "Secure your trading account" | "Account Verification" |

#### Implementation Example
```vue
<!-- Good implementation -->
<SuccessToast>
  <template #message>
    Position opened at {{ price }}! 🎯
  </template>
  <template #action>
    <ButtonPrimary label="View Position" @click="navigateToPosition" />
  </template>
</SuccessToast>

<!-- Bad implementation -->
<Toast type="success">
  <p>Order executed successfully</p>
  <button @click="navigateToPosition">View</button>
</Toast>
```

### Documentation Standards
- All components require JSDoc/TypeDoc comments
- Design system changes require documentation updates
- Code examples must accompany all documentation
- Version history must be maintained for design tokens
- All design decisions must be documented in RFC format

```md
## ButtonPrimary

A premium gold button following our design system.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | required | Button text content |
| fullWidth | boolean | false | Makes button stretch to container width |
| ariaLabel | string | null | Accessible label for screen readers |
| iconLeft | string | null | Icon to display before text |
| iconRight | string | null | Icon to display after text |

### Events

| Event | Description |
|-------|-------------|
| click | Emitted when button is clicked |

### Examples

#### Basic usage
```vue
<ButtonPrimary label="Begin Trading" />
```

#### With icon
```vue
<ButtonPrimary 
  label="Verify Account" 
  iconRight="check" 
/>
```
```

## Enforcement Mechanisms

### Design System Governance
- **Design token validation**: Automated checks for color usage
- **Code linters**: ESLint plugin for design system rules
- **Visual regression testing**: Percy.io integration
- **Accessibility scanner**: Axe-core in CI pipeline
- **Design review gates**: Required before merging UI changes

### Measurement & Accountability
- **Weekly design system health report**:
  - Design token usage compliance %
  - Accessibility score trends
  - Performance metrics
  - Component usage statistics
- **Quarterly design system audit**:
  - Consistency across features
  - Adherence to psychological principles
  - User perception metrics
  - Competitive benchmarking

### Review Criteria
All UI implementations must pass:
1. **Design Compliance** (40% weight):
   - Correct color usage (10%)
   - Proper typography implementation (10%)
   - Spacing and layout adherence (10%)
   - Component specification compliance (10%)

2. **Technical Excellence** (30% weight):
   - Accessibility compliance (10%)
   - Performance metrics (10%)
   - Code quality (10%)

3. **Psychological Impact** (30% weight):
   - Trust-building elements (10%)
   - Micro-interaction implementation (10%)
   - Emotional design elements (10%)

This style guide serves as the definitive rulebook for TradePro's frontend implementation. All developers and designers must adhere to these standards to maintain consistency, quality, and the premium psychological experience that defines our platform.