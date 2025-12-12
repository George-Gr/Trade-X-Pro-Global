# 🚪 Quality Gates & Development Standards

**Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Active

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Pre-Commit Validations](#pre-commit-validations)
3. [Design System Enforcement](#design-system-enforcement)
4. [Accessibility Checks](#accessibility-checks)
5. [Code Quality Standards](#code-quality-standards)
6. [Performance Requirements](#performance-requirements)
7. [Testing Requirements](#testing-requirements)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Contributing Guidelines](#contributing-guidelines)

---

## 📖 Introduction

Quality Gates are automated checks that run at various stages of development to ensure code quality, design consistency, and accessibility compliance. These gates prevent common issues from reaching production.

### Gate Levels

- **Pre-Commit**: Run before code is staged
- **Pre-Push**: Run before pushing to remote
- **CI/CD**: Run in automated pipeline
- **Production Deployment**: Final safety checks

### Philosophy

> "Fail fast, fail often, improve always"

By catching issues early in the development process, we maintain code quality and prevent technical debt.

---

## 🚫 Pre-Commit Validations

### Enabled Checks

All these checks run automatically before you commit code:

#### 1. Design System Compliance
```bash
✓ No hardcoded colors (must use CSS variables)
✓ No hardcoded font sizes (must use text-* classes)
✓ No arbitrary spacing (must use 4/8px grid)
✓ No non-standard border-radius values
✓ Proper heading hierarchy
✓ ARIA attributes present on interactive elements
```

#### 2. TypeScript Type Checking
```bash
✓ No `any` types without justification
✓ No unused imports
✓ No unused variables
✓ Strict null checks enabled
✓ All function parameters typed
```

#### 3. ESLint Rules
```bash
✓ React best practices
✓ React Hooks rules
✓ No console.log in production code
✓ No debugger statements
✓ Proper error handling
✓ No unused state/props
```

#### 4. CSS/Styling Validation
```bash
✓ No hardcoded colors in inline styles
✓ Proper Tailwind class usage
✓ No conflicting style rules
✓ Proper CSS selector specificity
```

#### 5. Accessibility Checks
```bash
✓ Interactive elements have labels
✓ Images have alt text
✓ Links have descriptive text
✓ Form inputs have associated labels
✓ Color contrast ratios are adequate
```

#### 6. File Size Checks
```bash
✓ Component files under 500 lines
✓ CSS files under 2000 lines
✓ No large assets without compression
```

### Running Pre-Commit Hooks Manually

```bash
# Run all pre-commit checks
npm run lint

# Run specific checks
npm run lint -- --fix              # Auto-fix eslint issues
npm run type:strict                # Type checking
npm run test                       # Unit tests
```

---

## 🎨 Design System Enforcement

### Forbidden Patterns

These patterns are automatically rejected:

```typescript
// ❌ FORBIDDEN: Hardcoded colors
backgroundColor: '#ff0000'
color: 'rgb(100, 150, 200)'
borderColor: '#e6e6e6'

// ✅ CORRECT: Use CSS variables
backgroundColor: hsl(var(--primary))
color: hsl(var(--foreground))
borderColor: hsl(var(--border))
```

```typescript
// ❌ FORBIDDEN: Hardcoded font sizes
style={{ fontSize: '16px' }}
className="text-[16px]"
fontSize: '14px'

// ✅ CORRECT: Use design system classes
className="text-base"        // 16px
className="text-sm"          // 14px
className="text-lg"          // 18px
```

```typescript
// ❌ FORBIDDEN: Non-grid spacing
padding: '13px'
margin: '18px'
gap: '22px'

// ✅ CORRECT: Use grid-aligned values (4/8px)
padding: '16px'   // 2x8px
margin: '12px'    // 3x4px
gap: '8px'        // 1x8px
```

```typescript
// ❌ FORBIDDEN: Arbitrary border-radius
borderRadius: '7px'
borderRadius: '11px'
borderRadius: '13px'

// ✅ CORRECT: Use standard values
borderRadius: '4px'   // .radius-xs
borderRadius: '8px'   // .radius-md
borderRadius: '12px'  // .radius-lg
```

### Design System Validation Script

```bash
# Run design system validation
node scripts/setup-quality-gates.js

# Output:
# 🔍 Validating design system compliance...
# ✅ Design system validation passed!
```

### CSS Variable Requirements

All color values must use CSS variables:

```css
/* ❌ Forbidden */
.button {
  background-color: #3b82f6;
  color: #ffffff;
}

/* ✅ Required */
.button {
  background-color: hsl(var(--primary));
  color: hsl(var(--background));
}
```

Available color variables:
- `--primary`, `--secondary`, `--accent`
- `--background`, `--background-secondary`
- `--foreground`, `--foreground-secondary`, `--foreground-muted`
- `--border`, `--ring`
- `--success`, `--warning`, `--destructive`, `--info`

---

## ♿ Accessibility Checks

### Mandatory Accessibility Standards

All code must meet or exceed WCAG 2.1 Level AA:

#### 1. Keyboard Navigation
```typescript
// ✅ Good: All interactive elements keyboard accessible
<button onClick={handleClick} className="focus-ring">
  Save
</button>

// ❌ Bad: Not keyboard accessible
<div onClick={handleClick}>
  Save
</div>
```

#### 2. Screen Reader Support
```typescript
// ✅ Good: Proper ARIA attributes
<button
  aria-label="Close dialog"
  onClick={onClose}
>
  <X />
</button>

// ❌ Bad: Missing ARIA
<button onClick={onClose}>
  <X />
</button>
```

#### 3. Color Contrast
```typescript
// ✅ Good: 4.5:1 contrast ratio
<p className="text-foreground bg-background">
  Dark text on light background
</p>

// ❌ Bad: Insufficient contrast
<p style={{ color: '#ccc', background: '#e6e6e6' }}>
  Only 3.2:1 contrast
</p>
```

#### 4. Focus Indicators
```typescript
// ✅ Good: Visible focus ring
<input className="focus-ring" type="text" />

// ❌ Bad: Outline removed without replacement
<input style={{ outline: 'none' }} type="text" />
```

#### 5. Touch Targets
```typescript
// ✅ Good: 44px minimum for mobile
<button className="h-12 px-4">Click me</button>

// ❌ Bad: Too small for reliable touch
<button className="h-8 px-2">Click me</button>
```

### Automated Accessibility Testing

```bash
# Run accessibility checks
npm run lint

# Manual testing with axe DevTools
# Chrome/Firefox: Install axe DevTools extension
# https://www.deque.com/axe/devtools/
```

### Accessibility Validation Checklist

Before committing code, verify:

- [ ] All buttons have visible focus states
- [ ] All form inputs have associated labels
- [ ] All images have alt text (or `alt=""` if decorative)
- [ ] All links have descriptive text or aria-label
- [ ] Color is not the only way to convey information
- [ ] Interactive elements are at least 44×44px on mobile
- [ ] All ARIA attributes are valid and used correctly
- [ ] Heading hierarchy is logical (h1→h2→h3, no skipping)
- [ ] No keyboard traps (users can tab out of all elements)
- [ ] Animations respect prefers-reduced-motion

---

## 💻 Code Quality Standards

### TypeScript Strict Mode

All code must pass strict TypeScript checking:

```bash
npm run type:strict
```

### ESLint Configuration

Rules enforced in eslint.config.js:

```javascript
// ❌ Forbidden patterns
debugger;                          // Remove debug statements
console.log('debug');              // Use proper logging
var x = 10;                        // Use const/let
function unused() {}               // Remove unused functions
import { x } from 'module';        // Use imported variables
```

### Component Code Style

```typescript
// ✅ Good: Clear, well-structured component
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'primary',
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      className={cn('button', `button--${variant}`)}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

// ❌ Bad: Unclear, poorly typed
export function Button({ ...props }) {
  return (
    <button {...props} className="btn">
      {props.children}
    </button>
  );
}
```

### Documentation Requirements

```typescript
/**
 * Renders a trading order card with status indicators
 *
 * @param {OrderCardProps} props - Component props
 * @param {Order} props.order - The order data
 * @param {() => void} props.onEdit - Called when edit is clicked
 * @param {() => void} props.onCancel - Called when cancel is clicked
 * @returns {React.ReactElement} Rendered order card
 *
 * @example
 * <OrderCard order={myOrder} onEdit={handleEdit} onCancel={handleCancel} />
 */
export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onEdit,
  onCancel
}) => {
  // ...
};
```

---

## ⚡ Performance Requirements

### Bundle Size Limits

- **Main bundle**: < 300KB gzipped
- **Component chunk**: < 100KB gzipped per lazy-loaded route
- **CSS**: < 50KB gzipped

### Performance Metrics

Track these Core Web Vitals:

| Metric | Good | Needs Improvement |
|--------|------|-------------------|
| LCP (Largest Contentful Paint) | < 2.5s | > 4s |
| FID (First Input Delay) | < 100ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | > 0.25 |

### Optimization Checklist

- [ ] Images are optimized and lazy-loaded
- [ ] Code splitting implemented for large routes
- [ ] React.memo used for expensive components
- [ ] No unnecessary re-renders (check DevTools Profiler)
- [ ] No layout thrashing in animations
- [ ] CSS-in-JS minimized (prefer Tailwind)
- [ ] Network requests debounced/throttled appropriately

```bash
# Build and analyze bundle size
npm run build
# Check dist/ folder for size information
```

---

## ✅ Testing Requirements

### Unit Test Coverage

Minimum coverage requirements:

- **Utility functions**: 100% coverage required
- **Custom hooks**: 100% coverage required
- **Components**: 80% coverage required
- **Overall**: 75% coverage minimum

```bash
# Run tests with coverage
npm run test -- --coverage
```

### Test Writing Standards

```typescript
// ✅ Good: Clear test with descriptive name
describe('Button component', () => {
  it('should call onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledOnce();
  });
});

// ❌ Bad: Unclear test
describe('Button', () => {
  it('works', () => {
    render(<Button onClick={() => {}} />);
    // What are we testing?
  });
});
```

### E2E Test Requirements

Critical user flows must have E2E tests:

- [ ] User authentication flow
- [ ] Trade placement flow
- [ ] Portfolio viewing
- [ ] Settings management

```bash
npm run test:e2e
```

---

## 🔄 CI/CD Pipeline

### Automated Pipeline Stages

```
Code Push
   ↓
→ Lint & Type Check (2 min)
   ↓
→ Unit Tests (5 min)
   ↓
→ Build Verification (3 min)
   ↓
→ Bundle Size Check (1 min)
   ↓
→ E2E Tests (10 min)
   ↓
→ Accessibility Audit (5 min)
   ↓
→ Ready for Deployment ✅
```

### Manual Quality Gate Checklist

Before requesting review, run:

```bash
# 1. Format and fix issues
npm run lint -- --fix

# 2. Type checking
npm run type:strict

# 3. Run all tests
npm run test
npm run test:e2e

# 4. Build for production
npm run build

# 5. Verify design system
node scripts/setup-quality-gates.js
```

---

## 🤝 Contributing Guidelines

### Commit Message Standards

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`

Examples:
```bash
✅ git commit -m "feat(button): add loading state support"
✅ git commit -m "fix(accessibility): improve focus indicator visibility"
✅ git commit -m "refactor(forms): extract validation logic"
❌ git commit -m "update"
❌ git commit -m "bug fixes"
```

### Pull Request Standards

When creating a PR:

1. **Title**: Use conventional commit format
2. **Description**: Include why, what, and how
3. **Testing**: Demonstrate testing performed
4. **Screenshots**: Include visual changes
5. **Checklist**: Verify all items below

```markdown
## Changes
- [ ] Design system compliance verified
- [ ] Accessibility tested (keyboard nav, screen readers)
- [ ] Mobile responsiveness tested
- [ ] No console errors or warnings
- [ ] Tests pass locally
- [ ] No new bundle size warnings

## Testing
Tested in:
- [ ] Chrome/Firefox
- [ ] Mobile (iPhone/Android)
- [ ] Dark mode
- [ ] Reduced motion

## Screenshots
[Add relevant screenshots]
```

### Code Review Standards

Reviewers check for:

1. ✅ Design system compliance
2. ✅ Accessibility best practices
3. ✅ Code quality and readability
4. ✅ Test coverage
5. ✅ Performance impact
6. ✅ Security concerns

---

## 📊 Monitoring & Reporting

### Continuous Monitoring

- **Bundle size**: Tracked on every build
- **Test coverage**: Must not decrease
- **Accessibility score**: Must not decrease
- **Performance metrics**: Tracked in Sentry

### Monthly Audits

- [ ] Design system compliance audit
- [ ] Accessibility audit
- [ ] Performance review
- [ ] Security audit

### Reporting Issues

Found a violation? Report it:

```bash
# Create issue with details
title: "[VIOLATION] Design System: Hardcoded color in Button"
labels: design-system, quality-gate
description: "File: src/components/Button.tsx, Line 45"
```

---

## 🚀 Getting Help

### Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Design System Documentation](./DESIGN_SYSTEM.md)
- [React Best Practices](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Support

- **Design System Questions**: Check DESIGN_SYSTEM.md
- **Accessibility Questions**: Check advanced-accessibility.css
- **TypeScript Issues**: Run `npm run type:strict` for details
- **Lint Errors**: Run `npm run lint -- --fix`

---

## ✨ Continuous Improvement

This quality gate system is continuously improved based on:

- Code review feedback
- User testing results
- Performance data
- Security findings
- Community best practices

Suggestions for improvements are welcome!

---

*Last updated: December 2024*  
*Quality Gates Version: 1.0*
