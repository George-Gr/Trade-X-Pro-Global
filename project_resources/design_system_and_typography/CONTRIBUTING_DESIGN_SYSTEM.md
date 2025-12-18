# 🤝 Contributing to TradeX Pro Design System

**Version:** 1.0  
**Status:** Active Guidelines  
**Last Updated:** December 2024

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Component Contribution Process](#component-contribution-process)
- [Color Addition Guidelines](#color-addition-guidelines)
- [Typography Addition Process](#typography-addition-process)
- [Spacing Value Guidelines](#spacing-value-guidelines)
- [Animation Addition Requirements](#animation-addition-requirements)
- [Code Review Checklist](#code-review-checklist)
- [Documentation Requirements](#documentation-requirements)
- [Testing & Quality Standards](#testing--quality-standards)

---

## 🚀 Getting Started

### Prerequisites

Before contributing to the design system:

- [ ] Read the core [DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md)
- [ ] Understand [QUALITY_GATES.md](./docs/QUALITY_GATES.md)
- [ ] Review [MAINTENANCE_GUIDE](./DESIGN_SYSTEM_MAINTENANCE.md)
- [ ] Complete onboarding guide: [DESIGN_SYSTEM_ONBOARDING.md](./DESIGN_SYSTEM_ONBOARDING.md)
- [ ] Set up development environment per team guidelines

### Contribution Workflow

1. **Propose** your change via RFC (Request for Comments)
2. **Design** the implementation with accessibility in mind
3. **Implement** following established patterns
4. **Test** thoroughly across devices and browsers
5. **Document** usage examples and guidelines
6. **Review** through proper approval channels
7. **Deploy** with monitoring and rollback plan

---

## 🧩 Component Contribution Process

### Phase 1: Planning & Design

#### Component Proposal Checklist

- [ ] **Use Case Defined**: Clear business need identified
- [ ] **Accessibility Requirements**: WCAG 2.1 AA compliance planned
- [ ] **Responsive Behavior**: Mobile-first approach designed
- [ ] **State Management**: All interactive states defined
- [ ] **Performance Impact**: <5% render time increase
- [ ] **Integration Plan**: How it fits existing ecosystem

#### Design Requirements

```typescript
// Component must support these interfaces
interface ComponentProps {
  // Accessibility
  "aria-label"?: string;
  "aria-describedby"?: string;
  tabIndex?: number;

  // Responsive
  className?: string;

  // States
  disabled?: boolean;
  loading?: boolean;

  // Events
  onClick?: (event: MouseEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
}
```

#### Component Structure Template

```typescript
// Component template following design system standards
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const componentVariants = cva(
  'base-component-styles',
  {
    variants: {
      variant: {
        primary: 'primary-variant-styles',
        secondary: 'secondary-variant-styles',
      },
      size: {
        sm: 'size-sm-styles',
        md: 'size-md-styles',
        lg: 'size-lg-styles',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ComponentProps
  extends VariantProps<typeof componentVariants> {
  children?: React.ReactNode;
  className?: string;
  // Accessibility props
  'aria-label'?: string;
  'aria-describedby'?: string;
  tabIndex?: number;
  // State props
  disabled?: boolean;
  loading?: boolean;
  // Event handlers
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (event: FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: FocusEvent<HTMLButtonElement>) => void;
}

export function Component({
  children,
  className,
  variant,
  size,
  disabled = false,
  loading = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  tabIndex,
  onClick,
  onFocus,
  onBlur,
  ...props
}: ComponentProps) {
  return (
    <div
      className={cn(componentVariants({ variant, size }), className)}
      role="button"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      tabIndex={disabled ? -1 : tabIndex}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {/* Implementation */}
    </div>
  );
}
```

### Phase 2: Implementation Guidelines

#### Required Files Structure

```
src/components/
└── your-component/
    ├── index.ts                    # Main export
    ├── YourComponent.tsx           # Component implementation
    ├── YourComponent.stories.tsx   # Storybook stories
    ├── YourComponent.test.tsx      # Unit tests
    ├── YourComponent.css           # Component styles (if needed)
    └── README.md                   # Usage documentation
```

#### Style Guidelines

```typescript
// Use design system tokens only
const styles = {
  // ✅ CORRECT - Using design tokens
  backgroundColor: "hsl(var(--primary))",
  color: "hsl(var(--foreground))",
  padding: "var(--spacing-md)",
  borderRadius: "var(--border-radius-md)",

  // ❌ WRONG - Hardcoded values
  backgroundColor: "#3b82f6",
  padding: "13px",
  borderRadius: "7px",
};
```

#### Responsive Implementation

```typescript
// Mobile-first responsive design
const responsiveStyles = {
  // Mobile (default)
  padding: "16px",
  fontSize: "14px",

  // Tablet
  "@media(min-width: 640px)": {
    padding: "20px",
    fontSize: "16px",
  },

  // Desktop
  "@media(min-width: 1024px)": {
    padding: "24px",
    fontSize: "18px",
  },
};
```

### Phase 3: Accessibility Integration

#### Required ARIA Attributes

```typescript
// Button component example
interface ButtonProps {
  // Visual
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";

  // Accessibility (REQUIRED)
  "aria-label"?: string; // Required for icon-only buttons
  "aria-describedby"?: string; // For helper text
  "aria-pressed"?: boolean; // For toggle buttons
  tabIndex?: number;

  // State
  disabled?: boolean;
  loading?: boolean;

  // Events
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
}
```

#### Keyboard Navigation

```typescript
// Required keyboard handlers
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case "Enter":
    case " ":
      event.preventDefault();
      onClick?.(event as any);
      break;
    case "Escape":
      // Handle escape for modals, dropdowns
      break;
    case "ArrowDown":
    case "ArrowUp":
      // Handle arrow keys for menus
      break;
  }
};
```

#### Focus Management

```typescript
// Proper focus management
const focusStyles = {
  "&:focus-visible": {
    outline: "2px solid hsl(var(--ring))",
    outlineOffset: "2px",
    borderRadius: "4px",
  },

  "&:focus:not(:focus-visible)": {
    outline: "none",
  },
};
```

---

## 🎨 Color Addition Guidelines

### Pre-Addition Checklist

#### Color Validation Requirements

- [ ] **Contrast Ratio**: 4.5:1 minimum for normal text, 3:1 for large text
- [ ] **Brand Alignment**: Fits existing brand palette and principles
- [ ] **Semantic Naming**: Follows `--primary`, `--secondary`, `--success`, etc.
- [ ] **HSL Format**: Use HSL values for consistency
- [ ] **Light/Dark Support**: Works in both themes

#### Color Addition Template

```css
/* New color addition template */
:root {
  /* New semantic color */
  --your-new-color: hsl(210 100% 50%);
  --your-new-color-foreground: hsl(0 0% 100%);

  /* State variants (if applicable) */
  --your-new-color-hover: hsl(210 100% 45%);
  --your-new-color-active: hsl(210 100% 40%);
  --your-new-color-muted: hsl(210 100% 85%);
}

/* Dark mode support */
.dark {
  --your-new-color: hsl(210 100% 60%);
  --your-new-color-foreground: hsl(0 0% 100%);
}
```

### Contrast Testing Process

#### Step 1: Create Test Cases

```typescript
// Contrast testing examples
const contrastTests = [
  { fg: "--your-new-color", bg: "--background", expected: "≥4.5:1" },
  { fg: "--foreground", bg: "--your-new-color", expected: "≥4.5:1" },
  { fg: "--your-new-color-muted", bg: "--background", expected: "≥4.5:1" },
];
```

#### Step 2: Accessibility Testing

```typescript
// Required accessibility tests
const a11yRequirements = [
  "Screen reader announces color appropriately",
  "No information conveyed by color alone",
  "Works with high contrast mode",
  "Works with reduced motion preferences",
];
```

### Color Usage Documentation

#### Implementation Guide

```typescript
// How to use the new color
const ColorUsageExample = () => {
  return (
    <div className="bg-[var(--your-new-color)] text-[var(--your-new-color-foreground)] p-4 rounded-lg">
      <p>This uses the new color with proper contrast</p>
    </div>
  );
};

// DON'T: Direct color values
// <div style={{ backgroundColor: '#new-color' }}> ❌

// DO: CSS variables
// <div className="bg-[var(--your-new-color)]"> ✅
```

---

## 🔤 Typography Addition Process

### Typography Scale Requirements

#### Grid Alignment

Typography must align with 4px/8px grid system:

```css
/* Valid typography scale */
:root {
  --font-size-xs: 12px; /* 3 × 4px */
  --font-size-sm: 14px; /* 3.5 × 4px */
  --font-size-base: 16px; /* 4 × 4px */
  --font-size-lg: 18px; /* 4.5 × 4px */
  --font-size-xl: 20px; /* 5 × 4px */
  --font-size-2xl: 24px; /* 6 × 4px */
}
```

#### Line Height Relationships

```css
/* Proper line height ratios */
.text-xs {
  font-size: 12px;
  line-height: 16px;
} /* 1.33 ratio */
.text-sm {
  font-size: 14px;
  line-height: 20px;
} /* 1.43 ratio */
.text-base {
  font-size: 16px;
  line-height: 24px;
} /* 1.5 ratio */
.text-lg {
  font-size: 18px;
  line-height: 28px;
} /* 1.56 ratio */
.text-xl {
  font-size: 20px;
  line-height: 28px;
} /* 1.4 ratio */
.text-2xl {
  font-size: 24px;
  line-height: 32px;
} /* 1.33 ratio */
```

### Adding New Typography

#### Tailwind Configuration

```typescript
// tailwind.config.ts - Add to theme
theme: {
  extend: {
    fontSize: {
      'new-size': ['16px', { lineHeight: '24px' }],
      'new-large': ['24px', { lineHeight: '32px' }],
    },
  },
}
```

#### Implementation Example

```typescript
// New typography class
.new-typography {
  font-size: var(--font-size-new);
  line-height: var(--line-height-new);
  font-weight: var(--font-weight-normal);
  letter-spacing: var(--letter-spacing-normal);
}
```

#### Usage Guidelines

```typescript
// Correct typography usage
<>
  <h1 className="text-2xl font-bold">Heading</h1>      {/* 24px, bold */}
  <p className="text-base text-muted-foreground">Text</p> {/* 16px, muted */}
  <span className="text-sm font-medium">Label</span>     {/* 14px, medium */}
</>

// Incorrect usage
<>
  <p style={{ fontSize: '15px' }}>❌ Hardcoded size</p>
  <p className="text-[17px]">❌ Off-scale size</p>
</>
```

---

## 📏 Spacing Value Guidelines

### Spacing Grid System

#### Allowed Spacing Values

```css
:root {
  /* 4px base grid */
  --space-1: 4px; /* 1 × 4px */
  --space-2: 8px; /* 2 × 4px */
  --space-3: 12px; /* 3 × 4px */
  --space-4: 16px; /* 4 × 4px */
  --space-5: 20px; /* 5 × 4px */
  --space-6: 24px; /* 6 × 4px */

  /* 8px extended grid */
  --space-8: 32px; /* 8 × 4px */
  --space-10: 40px; /* 10 × 4px */
  --space-12: 48px; /* 12 × 4px */
  --space-16: 64px; /* 16 × 4px */
  --space-20: 80px; /* 20 × 4px */
  --space-24: 96px; /* 24 × 4px */
  --space-32: 128px; /* 32 × 4px */
}
```

### Adding New Spacing Values

#### Validation Checklist

- [ ] **Grid Alignment**: Value is multiple of 4px
- [ ] **Component Need**: Serves specific design requirement
- [ ] **Performance**: No unnecessary CSS bloat
- [ ] **Consistency**: Fits existing spacing patterns

#### Implementation Template

```css
/* New spacing value addition */
:root {
  --space-7: 28px; /* 7 × 4px - between medium and large */
}

/* Tailwind extension */
@layer utilities {
  .space-7 {
    margin: 28px;
  }
  .p-7 {
    padding: 28px;
  }
  .gap-7 {
    gap: 28px;
  }
}
```

#### Spacing Usage Examples

```typescript
// Component spacing examples
const ButtonSpacing = () => (
  <div className="space-y-4"> {/* 16px gaps */}
    <Button className="px-4 py-2">Small Button</Button>     {/* 16px × 8px */}
    <Button className="px-6 py-3">Medium Button</Button>   {/* 24px × 12px */}
    <Button className="px-8 py-4">Large Button</Button>    {/* 32px × 16px */}
  </div>
);

const CardSpacing = () => (
  <Card className="p-6"> {/* 24px internal padding */}
    <div className="space-y-3"> {/* 12px between elements */}
      <h3 className="text-lg">Card Title</h3>
      <p className="text-base">Card content</p>
    </div>
  </Card>
);
```

---

## ✨ Animation Addition Requirements

### Animation Standards

#### Duration Standards

```css
:root {
  --duration-instant: 0ms; /* Immediate state changes */
  --duration-fast: 150ms; /* Quick interactions */
  --duration-normal: 200ms; /* Standard transitions */
  --duration-slow: 300ms; /* Complex animations */
  --duration-slower: 500ms; /* Page transitions */
}
```

#### Easing Standards

```css
:root {
  --ease-in: cubic-bezier(0.4, 0, 1, 1); /* Accelerating */
  --ease-out: cubic-bezier(0, 0, 0.2, 1); /* Decelerating */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1); /* Ease-in-out */
  --ease-emphasized: cubic-bezier(0.2, 0, 0, 1); /* Emphasized */
}
```

### Adding New Animations

#### Animation Template

```css
/* New animation definition */
@keyframes new-animation {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.new-animation {
  animation: new-animation var(--duration-normal) var(--ease-out);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .new-animation {
    animation: none;
  }
}
```

#### Component Integration

```typescript
// Animation with accessibility
const AnimatedComponent = ({ children, isVisible }) => {
  return (
    <div
      className={cn(
        'transition-all duration-200',
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      )}
      aria-hidden={!isVisible}
    >
      {children}
    </div>
  );
};
```

---

## ✅ Code Review Checklist

### Pre-Submission Checklist

#### Design System Compliance

- [ ] **Colors**: Uses CSS variables only, no hardcoded values
- [ ] **Typography**: Uses approved text sizes and line heights
- [ ] **Spacing**: Aligns with 4px/8px grid system
- [ ] **Border Radius**: Uses approved radius values
- [ ] **Shadows**: Uses design system elevation levels

#### Accessibility Compliance

- [ ] **Keyboard Navigation**: All interactive elements keyboard accessible
- [ ] **Screen Reader**: Proper ARIA labels and descriptions
- [ ] **Focus Management**: Visible focus indicators present
- [ ] **Color Contrast**: 4.5:1 ratio minimum for all text
- [ ] **Touch Targets**: 44px minimum on mobile devices

#### Code Quality

- [ ] **TypeScript**: Proper typing for all props and interfaces
- [ ] **Performance**: No unnecessary re-renders or reflows
- [ ] **Bundle Size**: Optimized imports and minimal dependencies
- [ ] **Browser Support**: Works in target browser list

#### Documentation

- [ ] **README**: Clear usage examples and API documentation
- [ ] **JSDoc**: Proper comments for all public interfaces
- [ ] **Stories**: Storybook examples for all variants
- [ ] **Tests**: Unit tests with >80% coverage

### Review Process

#### Level 1 Review (Team Lead)

**Timeframe**: 2 business days  
**Focus**: Implementation quality and standards compliance

```markdown
## Review Checklist

- [ ] Code follows established patterns
- [ ] Design system tokens used correctly
- [ ] Performance impact acceptable
- [ ] Accessibility standards met
- [ ] Tests pass and coverage adequate
```

#### Level 2 Review (Design System Council)

**Timeframe**: 1 week  
**Focus**: Design consistency and strategic alignment

```markdown
## Strategic Review

- [ ] Fits overall design system goals
- [ ] Maintains design consistency
- [ ] Addresses identified user needs
- [ ] Performance and scalability acceptable
- [ ] Long-term maintenance plan defined
```

---

## 📚 Documentation Requirements

### Component Documentation Template

#### README.md Structure

````markdown
# Component Name

## Overview

Brief description of what the component does and when to use it.

## Usage

```tsx
import { Component } from "@/components/component";

<Component variant="primary" size="md" onClick={handleClick}>
  Click me
</Component>;
```
````

## Props

| Prop     | Type         | Default     | Description                       |
| -------- | ------------ | ----------- | --------------------------------- | -------------------- | --------------------- |
| variant  | 'primary' \\ | 'secondary' | 'primary'                         | Visual style variant |
| size     | 'sm' \\      | 'md' \\     | 'lg'                              | 'md'                 | Size of the component |
| disabled | boolean      | false       | Whether the component is disabled |

## Accessibility

- Keyboard navigation supported
- Screen reader compatible
- 4.5:1 color contrast ratio
- 44px minimum touch targets

## Related

- [Link to related components]
- [Design system guidelines]

````

#### JSDoc Documentation
```typescript
/**
 * Primary button component following design system standards.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 *
 * @remarks
 * This component automatically handles:
 * - Accessibility compliance
 * - Responsive behavior
 * - Focus management
 * - Loading states
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Loading indicator to show when loading */
  loadingIndicator?: React.ReactNode;
}
````

---

## 🧪 Testing & Quality Standards

### Unit Testing Requirements

#### Test Structure

```typescript
// Component test template
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is accessible', () => {
    render(<Button aria-label="Submit form">Submit</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Submit form');
    expect(button).toHaveAttribute('tabindex', '0');
  });
});
```

### Accessibility Testing

```typescript
// Accessibility test utilities
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Visual Testing

```typescript
// Storybook stories for visual regression
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Primary button component following design system standards.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    size: "md",
    children: "Primary Button",
  },
};

export const Loading: Story = {
  args: {
    variant: "primary",
    loading: true,
    children: "Loading...",
  },
};
```

---

## 🎯 Success Criteria

### Contribution Acceptance Criteria

✅ **Technical Excellence**

- Clean, maintainable code following team patterns
- Comprehensive test coverage (>80%)
- Performance impact <5%
- Browser compatibility verified

✅ **Design System Integration**

- Uses only approved design tokens
- Follows established patterns and conventions
- Maintains design consistency
- Works across all breakpoints

✅ **Accessibility Compliance**

- WCAG 2.1 Level AA compliant
- Keyboard navigation supported
- Screen reader compatible
- Color contrast ratios met

✅ **Documentation Quality**

- Clear usage examples
- Complete API documentation
- Accessibility guidelines
- Performance considerations

✅ **Developer Experience**

- Easy to integrate and use
- Clear error messages
- Helpful development tooling
- Migration guides when needed

---

## 📞 Getting Help

### Contact Information

- **Design System Council**: designsystem@tradex.pro
- **Slack Channel**: #design-system-contributors
- **Weekly Office Hours**: Thursdays 3-4pm
- **Emergency Contact**: Frontend Tech Lead

### Resources

- **Core Documentation**: [DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md)
- **Quality Standards**: [QUALITY_GATES.md](./docs/QUALITY_GATES.md)
- **Maintenance Guide**: [DESIGN_SYSTEM_MAINTENANCE.md](./DESIGN_SYSTEM_MAINTENANCE.md)
- **Onboarding**: [DESIGN_SYSTEM_ONBOARDING.md](./DESIGN_SYSTEM_ONBOARDING.md)

---

_Thank you for contributing to TradeX Pro's design system! Your contributions help maintain our high standards of quality and accessibility._

**Document Version**: 1.0  
**Next Review**: March 2025  
**Contributing Team**: Design System Council
