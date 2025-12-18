# 📚 Consolidated Documentation Templates & Content Maps

**Purpose:** Detailed structure and content consolidation guides for creating unified design system documentation.

---

## 1. DESIGN_SYSTEM.md (Consolidated Master Document)

### New Structure (1200 lines target)

```
# 🎨 TradeX Pro Design System v1.0

[TOC]

## Quick Start (New Section)
- 5-minute overview
- Common use cases
- Links to deeper docs

## Design Principles
- Clarity First
- Consistency Over Customization
- Accessibility is Mandatory
- Mobile First
- Performance Matters
- (Keep existing content)

## Color System
- Primary, Secondary, Accent colors
- Semantic colors (success, warning, etc.)
- Functional colors (foreground, background, border)
- Dark mode implementation
- Accessibility: Contrast ratios
- CSS Variables reference
- (Keep existing - add dark mode specifics)

## Typography [MERGED FROM TYPOGRAPHY_SYSTEM.md]
- Type Scale (8 levels with complete specs)
- Font Families (Sans, Mono, Display)
- Font Weights and Line Heights
- Letter Spacing specifications
- Tailwind class mappings
- Usage examples (15+ code snippets)
- Responsive typography
- Best practices (DO/DON'T)
- Accessibility guidelines
- Testing checklist
- (Replaces old scattered typography info)

## Spacing & Layout
- 4px/8px Grid System
- CSS Variables (--space-xs to --space-4xl)
- Touch Target Minimums (44x44px)
- Common spacing patterns
- Responsive spacing rules
- Component spacing guidelines
- (Enhanced with specific variables)

## Component Library [KEEP EXISTING]
- Button Component (variants, sizes, states, dark mode)
- Input Component (with keyboard optimization)
- Card Component (elevation system)
- Form Component (validation, accessibility)
- Brief specs only - full API in COMPONENT_API.md

## Interactions & Animations
- Micro-interactions principles
- Timing functions and durations
- Motion preferences (prefers-reduced-motion)
- Animation examples
- Transition guidelines
- (Keep MICRO_INTERACTIONS_REFERENCE.md link)

## Accessibility Standards [SUMMARIZED]
- WCAG 2.1 Level AA compliance
- Color contrast requirements
- Focus management
- ARIA patterns
- Testing methods
- (Full details in ACCESSIBILITY_STANDARDS.md)

## Responsive Design
- Breakpoints (sm, md, lg, xl)
- Mobile-first approach
- Fluid typography and spacing
- Touch-friendly interfaces
- (Keep existing)

## Dark Mode
- CSS Variable strategy
- Color mapping (light ↔ dark)
- Testing dark mode
- User preferences
- (Extracted from DESIGN_SYSTEM_MAINTENANCE.md)

## Design Token Versioning
- Semantic versioning (MAJOR.MINOR.PATCH)
- Breaking changes policy
- Deprecation process
- Changelog format
- (Link to DESIGN_TOKENS_CHANGELOG.md for details)

## Governance & Maintenance [NEW SECTION]
- Who manages design system
- Contribution workflow overview (detailed in CONTRIBUTING_DESIGN_SYSTEM.md)
- Quality gates enforcement (detailed in QUALITY_GATES.md)
- Design review process
- Emergency procedures
- (Brief summary with links to governance docs)
```

### Content Sources to Merge

```
Primary: project_resources/design_system_and_typography/DESIGN_SYSTEM.md (868 lines)
+ Typography sections from: project_resources/rules_and_guidelines/TYPOGRAPHY_SYSTEM.md (558 lines)
+ Dark mode from: project_resources/design_system_and_typography/DESIGN_SYSTEM_MAINTENANCE.md (300 lines)
+ Governance summary from: CONTRIBUTING_DESIGN_SYSTEM.md
+ Link to: DESIGN_TOKENS_CHANGELOG.md for versioning details
```

### Eliminate/Relocate

```
❌ REMOVE:
- Detailed governance (→ CONTRIBUTING_DESIGN_SYSTEM.md)
- Maintenance procedures (→ CONTRIBUTING_DESIGN_SYSTEM.md)
- Quality gates specifics (→ QUALITY_GATES.md)

✓ KEEP:
- All design principles
- All color definitions
- All typography specs
- Spacing grid
- Component basics
```

---

## 2. COMPONENT_API.md (New Consolidated)

### New Structure (1800 lines target)

````
# 🧩 Component API Reference

[Interactive TOC - link to each component]

## Component Guidelines
- General prop patterns
- Accessibility requirements
- Dark mode support
- Responsive behavior
- Common prop combinations

## Button Component
### API Reference
- Props interface (children, variant, size, disabled, loading, etc.)
- Variants: "default" | "primary" | "secondary" | "destructive" | "ghost"
- Sizes: "sm" | "md" | "lg" | "xl"
- States: default, hover, active, disabled, loading
- Accessibility: button role, aria-label, keyboard support
- Dark mode: color mappings

### Usage Examples
```typescript
// 5 common patterns
// 5 advanced patterns
// 5 edge cases
````

### Do's and Don'ts

- DO use button for actions
- DON'T use as links (use Link instead)
- DO provide clear labels
- DON'T disable without explanation
- (10+ guidelines)

### Troubleshooting

- Button not responding
- Styling not applying
- Accessibility issues
- Common mistakes

---

## Input Component

### API Reference

- Props interface (type, value, onChange, placeholder, disabled, error, etc.)
- Input types supported
- States: default, focus, error, disabled, readonly
- Accessibility: label association, error announcement
- Dark mode behavior

### Variants

- Text input
- Email input
- Password input
- Number input
- Search input
- With prefix/suffix
- With validation icon
- (Examples for each)

### Usage Examples

- Basic input
- With validation
- With form integration
- With keyboard handling
- (Copy-paste ready examples)

### Do's and Don'ts

- DO always associate with label
- DON'T hardcode widths
- DO show validation feedback
- DON'T use placeholder as label

---

## Card Component

### API Reference

- Props interface (children, className, elevation, variant, etc.)
- Elevation system (none, sm, md, lg)
- Variants (default, elevated, outlined)
- States and interactions
- Responsive behavior

### Usage Examples

- Basic card
- Card with header/footer
- Card grid layouts
- Interactive cards
- Cards with forms

### Do's and Don'ts

- DO use for grouped related content
- DON'T nest cards unnecessarily
- DO ensure minimum touch targets
- DON'T use as layout wrapper

---

## Form Component

### API Reference

- Props interface (onSubmit, method, validation, etc.)
- Field states (default, filled, error, success)
- Error handling and display
- Accessibility patterns
- Keyboard navigation

### Common Patterns

- Login form
- Registration form
- Profile update form
- Search form
- Multi-step form

### Validation Integration

- React Hook Form integration
- Zod schema validation
- Error message display
- Real-time vs. on-blur
- Cross-field validation

### Do's and Don'ts

- DO provide clear error messages
- DON'T hide required field indicators
- DO support autofill
- DON'T submit on Enter (use button)

---

## [Other Components: Select, Dialog, Toast, Tabs, Dropdown, etc.]

(Same structure as above - API reference, examples, do's/don'ts)

---

## Migration Guide

### From Old to New Components

(When upgrading component API versions)

### Breaking Changes

- What changed
- How to update
- Migration checklist
- Common issues during migration

### Examples

```typescript
// Before
<OldButton variant="primary">
  Click me
</OldButton>

// After
<Button variant="primary">
  Click me
</Button>
```

---

## Accessibility Testing Checklist

- Keyboard navigation for each component
- Screen reader announcement
- Color contrast
- Focus indicators
- ARIA attributes

---

## Dark Mode Testing Checklist

- Colors readable in dark mode
- No hardcoded colors
- CSS variables applied
- User preference respected

```

### Content Sources to Merge
```

Primary: project_resources/components/COMPONENT_SPECIFICATIONS.md (1000+ lines)

- project_resources/components/COMPONENT_QUICK_REFERENCE.md (500+ lines)
- Migration guide from: project_resources/components/COMPONENT_MIGRATION_GUIDE.md (600+ lines)
- Navigation from: project_resources/components/COMPONENT_DOCUMENTATION_INDEX.md (400+ lines)
- Component examples from actual src/components/

```

---

## 3. CONTRIBUTING_DESIGN_SYSTEM.md (Reorganized Governance)

### New Structure (700 lines target)

```

# 🤝 Contributing to Design System

## Overview

- Purpose of this guide
- Who should read this
- Process overview (3 phases)

## 3-Phase Contribution Workflow

### Phase 1: Design & Specification

- Create design specification
- Component proposal template
- Design review process
- Getting feedback
- Approval criteria

### Phase 2: Implementation

- Implementation checklist
- Code review criteria (40+ checks)
- Testing requirements
- Accessibility testing
- Documentation requirements

### Phase 3: Publication & Integration

- Publishing to design system
- Version bumping (MAJOR.MINOR.PATCH)
- Changelog update
- Migration guide (if breaking)
- Integration testing

---

## 3-Level Governance Model

### Level 1: Automatic Validation

- Pre-commit hooks
- Design system validation script
- ESLint checks
- Accessibility checks
- Color contrast validation
- (What automatically blocks commits)

### Level 2: Team Lead Review

- Design system team lead approval
- Code review (40+ criteria)
- Accessibility sign-off
- Performance review
- Documentation review

### Level 3: Design System Council

- Complex decisions (breaking changes, new patterns)
- Major version releases
- Architecture changes
- Strategic decisions
- Cross-team impact review

---

## Code Review Checklist (40+ criteria)

- Component structure
- Accessibility (40 items)
- Design system compliance
- Styling (no hardcoded values)
- TypeScript types
- Testing
- Documentation
- Performance
- Browser compatibility

---

## Pull Request Requirements

- PR description template
- Type of change (feature, fix, docs, etc.)
- Testing performed
- Screenshots/video for UI changes
- Design system impact
- Accessibility impact
- Breaking changes (if any)
- Migration guide (if needed)

---

## Testing Requirements

- Unit tests (>80% coverage)
- Component tests
- Accessibility tests (axe, manual)
- Visual regression tests
- Dark mode tests
- Responsive tests (mobile, tablet, desktop)

---

## Design Token Deprecation Process

- Deprecation notice period
- Migration guide for users
- Breaking change timeline
- Support period

---

## Emergency Procedures

- Critical bug fixes (bypass full review)
- Security patches
- Production hotfixes
- Rollback procedures

---

## Design System Maintenance

### Quarterly Review

- Audit component usage
- Identify patterns
- Propose improvements
- Release planning

### Annual Major Release

- Breaking changes
- New components
- Architecture changes
- Migration guide

```

### Content Sources
```

Primary: project_resources/design_system_and_typography/CONTRIBUTING_DESIGN_SYSTEM.md (500 lines)

- Governance from: project_resources/design_system_and_typography/DESIGN_SYSTEM_MAINTENANCE.md
- Enforcement from: project_resources/design_system_and_typography/QUALITY_GATES.md
- Enhanced checklist from audit findings

```

---

## 4. ACCESSIBILITY_STANDARDS.md (New Consolidated)

### New Structure (600 lines target)

```

# ♿ Accessibility Standards & Compliance

## Compliance Level: WCAG 2.1 Level AA

### Principles

- Perceivable: Content visible to all users
- Operable: Keyboard navigable, enough time
- Understandable: Clear language and predictable
- Robust: Works across browsers and AT

---

## Standards We Follow

### WCAG 2.1 Level AA Criteria (50+ criteria)

- 1.4.3: Contrast Minimum (4.5:1)
- 1.4.11: Non-text Contrast (3:1)
- 2.1.1: Keyboard (all functionality)
- 2.1.2: No Keyboard Trap
- 2.4.3: Focus Order
- 2.4.7: Focus Visible
- 3.3.4: Error Prevention
- (Full list with details)

### ADA Compliance

- US Americans with Disabilities Act
- Public website accessibility
- Key requirements

### ATAG 2.0 (Authoring Tools)

- Content accessibility
- Interface accessibility
- Support for generation

---

## Component Accessibility Requirements

### Button Component

- Semantic HTML <button> element
- aria-label for icon buttons
- aria-pressed for toggles
- aria-expanded for dropdowns
- Keyboard: Enter, Space activation
- Focus: visible focus indicator
- Contrast: 4.5:1 minimum
- States: disabled announcement

### Input Component

- Associated <label> element (required)
- aria-required for required fields
- aria-invalid for errors
- aria-describedby for error messages
- Type attribute (type="email", type="number", etc.)
- Autocomplete support
- Placeholder ≠ label

### Form Component

- Fieldset + legend for groups
- aria-live for dynamic errors
- Error messages linked with aria-describedby
- Success announcements
- Required indicators
- Form submission validation

### Dialog Component

- dialog semantic role
- Focus trap (first → last)
- Escape key to close
- aria-labelledby or aria-label
- aria-describedby for description
- Return focus on close

### [Other Components...]

---

## Color & Contrast

### Contrast Ratios

- Normal text (14px+): 4.5:1
- Large text (18px+): 3:1
- UI components: 3:1
- Graphical elements: 3:1

### Color Usage

- DON'T use color alone to convey info
- Use color + icon, text, or pattern
- Sufficient lightness/darkness difference
- CSS variable approach ensures consistency

### Testing Tools

- axe DevTools
- WebAIM Contrast Checker
- NVDA screen reader
- JAWS screen reader
- Chrome DevTools accessibility panel

---

## Keyboard Navigation

### Requirements

- All interactive elements keyboard accessible
- Logical tab order
- No keyboard trap
- Focus visible (never display: none)
- Keyboard equivalents for mouse events

### Implementation

- Use semantic HTML buttons/links
- tabindex carefully (mostly avoid)
- Focus management for modals
- Keyboard handlers: onKeyDown vs onClick
- Escape to close modals/dropdowns

---

## Screen Reader Support

### ARIA Patterns

- Buttons with icons: aria-label
- Dropdowns: aria-expanded, aria-haspopup
- Notifications: aria-live="polite/assertive"
- Forms: aria-required, aria-invalid
- Relationships: aria-labelledby, aria-describedby
- Status: aria-current for active nav

### Testing

- Use NVDA (Windows, free)
- Use JAWS (Windows, paid)
- Use VoiceOver (macOS, built-in)
- Read aloud test for clarity

---

## Testing & Validation

### Manual Testing

- Keyboard only (no mouse)
- Screen reader (NVDA/JAWS)
- Browser zoom (200%)
- Color blindness simulators
- High contrast mode
- Prefers-reduced-motion

### Automated Testing

```bash
npm run test:a11y  # Accessibility tests
npm run test:contrast  # Color contrast
npm run test:keyboard  # Keyboard navigation
```

### Testing Checklist

- [ ] Keyboard navigable
- [ ] Screen reader tested
- [ ] Color contrast verified
- [ ] Focus visible
- [ ] ARIA attributes correct
- [ ] Error messages clear
- [ ] Labels present
- [ ] Reduced motion respected

---

## Common Issues & Solutions

### Issue: Color alone conveys meaning

**Solution:** Add icons, patterns, or text labels

### Issue: Missing form labels

**Solution:** Always use <label> or aria-label

### Issue: Non-semantic buttons

**Solution:** Use <button> not <div role="button">

### Issue: Focus trap in modal

**Solution:** Focus management library or manual focus trap

### Issue: Screen reader announces all dialogs

**Solution:** aria-hidden="true" for background elements

---

## Accessibility Performance

### No Performance Penalty

- ARIA attributes: minimal impact
- Semantic HTML: better performance
- Focus management: no impact
- Screen reader testing: development only

### Perceived Performance

- Clear feedback on actions
- Predictable behavior
- Reduced confusion → faster task completion

---

## Tools & Resources

### Development Tools

- axe DevTools (Chrome/Firefox)
- WAVE (Web Accessibility Evaluation Tool)
- Lighthouse (Chrome DevTools)
- Screen readers: NVDA, JAWS, VoiceOver
- Color checker: WebAIM

### Documentation

- WCAG 2.1 Guidelines (w3.org)
- WAI ARIA Authoring Practices (w3.org)
- WebAIM (webaim.org)
- A11y project (a11yproject.com)

---

## Troubleshooting

### Q: Why does my component fail axe?

A: Review error message - usually missing aria-label or color contrast issue

### Q: How to test screen reader?

A: Use NVDA (free) or VoiceOver (built-in Mac)

### Q: What's focus-visible vs :focus?

A: Use :focus-visible for keyboard navigation only

### Q: When to use aria-live?

A: For dynamic content changes that must be announced

```

### Content Sources
```

Primary: project_resources/rules_and_guidelines/ACCESSIBILITY_IMPLEMENTATION_GUIDE.md

- Accessibility sections from DESIGN_SYSTEM.md
- WCAG requirements from QUALITY_GATES.md
- Testing tools from various docs

```

---

## 5. DEVELOPMENT_SETUP.md (New Consolidated)

### New Structure (800 lines target)

```

# 🚀 Development Environment Setup

## Quick Start (5 minutes)

```bash
# Clone and setup
git clone <repo>
cd Trade-X-Pro-Global

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_PUBLISHABLE_KEY=...

# Start dev server
npm run dev

# Open browser
open http://localhost:8080
```

---

## Prerequisites

### Node.js & npm

- Node.js 18+ (check: `node --version`)
- npm 9+ (check: `npm --version`)
- Installation: nodejs.org

### Git

- Git 2.30+ (check: `git --version`)
- Installation: git-scm.com

### Code Editor

- Recommended: VS Code
- Extensions: ESLint, Prettier, TypeScript, REST Client

---

## Full Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/[org]/Trade-X-Pro-Global.git
cd Trade-X-Pro-Global
```

### 2. Install Dependencies

```bash
npm install
# This installs:
# - React 18
# - TypeScript 5
# - Vite 5
# - Tailwind CSS 4
# - And 50+ other packages
```

### 3. Configure Environment

Create `.env.local` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...

# Optional: Sentry for error tracking
VITE_SENTRY_DSN=https://...

# Optional: Analytics
VITE_ANALYTICS_ID=...
```

**Never commit .env.local to git.**

### 4. Verify Installation

```bash
# Check TypeScript
npm run type-check

# Run linter
npm run lint

# Run unit tests
npm run test

# Build for production (verify no errors)
npm run build
```

All should pass with no errors. ✅

---

## Running the Development Server

### Start Development

```bash
npm run dev
# Vite starts on http://localhost:8080
# Hot reload enabled
# Source maps enabled for debugging
```

### Open in Browser

```
http://localhost:8080
```

Features:

- Hot Module Replacement (HMR)
- Source map debugging
- Network tab shows actual files
- Console shows line numbers

### Stop Server

```bash
Ctrl+C  # Windows/Linux
Cmd+C  # macOS
```

---

## Design System Validation

### Quick Validation

```bash
npm run validate:design
# Checks:
# - Color usage
# - Typography scale
# - Spacing grid (4px/8px)
# - Component compliance
```

### Full Validation with Report

```bash
npm run validate:design:report
# Generates design-system-violations-report.json
# Lists all violations with locations
```

### Baseline Comparison

```bash
npm run validate:design:baseline
# Compares against last baseline
# Shows improvement/regression
```

---

## Code Quality Tools

### ESLint (Code Standards)

```bash
npm run lint              # Check for issues
npm run lint:fix          # Auto-fix issues
```

Issues checked:

- React best practices
- React Hooks rules
- No console.log in production
- Proper error handling
- TypeScript compliance

### TypeScript (Type Safety)

```bash
npm run type-check  # Verify all types
```

Configuration:

- Loose by default (noImplicitAny: false)
- Allows gradual adoption
- Use @ts-expect-error for justified bypasses

### Prettier (Code Formatting)

```bash
npm run format           # Auto-format code
npm run format:check    # Check formatting
```

### Pre-commit Hooks

```bash
# Automatically runs on git commit
- ESLint check
- TypeScript check
- Design system validation
- Blocks commit if issues found
```

---

## Testing

### Run All Tests

```bash
npm run test                # Watch mode
npm run test:ui             # Open test UI
npm run test:coverage       # Coverage report
```

### Unit Tests (Vitest)

```bash
npm run test -- path/to/file.test.ts
npm run test -- --reporter=verbose
```

Test location: `src/__tests__/` or colocated `.test.ts` files

### E2E Tests (Playwright)

```bash
npm run test:e2e           # Headless
npm run test:e2e:ui        # UI mode
npm run test:e2e:debug     # Debug mode
```

Test location: `e2e/`

### Coverage

```bash
npm run test:coverage
# Generates coverage report
# Target: >80% coverage for business logic
```

---

## Building for Production

### Development Build

```bash
npm run build  # Creates dist/ folder
npm run preview  # Preview build locally
```

Output:

- Minified code
- Optimized assets
- Source maps (for debugging production)
- Bundle analysis (set ANALYZE=true npm run build)

### Vite Configuration

- SWC transpilation (fast)
- Tree-shaking enabled
- Code splitting enabled
- CSS optimization enabled

---

## Database & Supabase

### Supabase Setup

```bash
# Pull latest schema and types
npm run supabase:pull

# Push local migrations
npm run supabase:push

# Start local Supabase (if using local)
npm run supabase:start
```

### Update Types After Schema Change

```bash
npm run supabase:pull
# Regenerates src/integrations/supabase/types.ts
# Never manually edit types.ts!
```

---

## Common Tasks

### Adding a New Page

1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Run type-check: `npm run type-check`
4. Start dev server: `npm run dev`

### Adding a New Component

1. Create component in `src/components/Feature/NewComponent.tsx`
2. Add tests in `src/components/Feature/__tests__/NewComponent.test.tsx`
3. Follow design system: DESIGN_SYSTEM.md
4. Run tests: `npm run test`

### Adding a Design System Component

1. Create component using shadcn-ui base
2. Customize with CSS from `src/styles/`
3. Document in COMPONENT_API.md
4. Add tests (>80% coverage)
5. Follow CONTRIBUTING_DESIGN_SYSTEM.md

### Updating Dependencies

```bash
npm update                  # Update minor/patch
npm outdated               # Check what's outdated
npm audit                  # Check security issues
npm audit fix              # Fix security issues
```

---

## Troubleshooting

### Port 8080 Already in Use

```bash
# macOS/Linux: Find process
lsof -i :8080

# Kill process
kill -9 <PID>

# Or start on different port
npm run dev -- --port 8081
```

### Module not found errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors

```bash
npm run type-check      # Check all errors
npm run type-check -- --noEmit  # No files written
```

### Build errors

```bash
# Clear build cache
rm -rf dist
npm run build

# Verbose output
npm run build -- --debug
```

### Supabase type errors

```bash
# Regenerate types
npm run supabase:pull
npm run type-check
```

### Design validation failing

```bash
# Check violations
npm run validate:design:report

# Fix violations
# Review DESIGN_SYSTEM.md for correct usage
```

---

## IDE Setup (VS Code)

### Recommended Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-vue",
    "GitHub.copilot",
    "eamodio.gitlens",
    "ms-playwright.playwright"
  ]
}
```

### VS Code Settings

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## Performance Tips

### Fast Builds

- Vite with SWC: <5s dev build
- HMR for instant updates
- Tree-shaking: unused code removed

### Development Performance

- Enable hardware acceleration in browser
- Close unused browser tabs
- Use source maps (already enabled)

### Test Performance

- Run subset: `npm run test -- file.test.ts`
- Use watch mode: `npm run test`
- Run in parallel (default)

---

## Next Steps

1. ✅ Complete setup above
2. 📖 Read STYLE_GUIDE.md (code conventions)
3. 🎨 Read DESIGN_SYSTEM.md (design patterns)
4. 🚀 Create your first feature
5. 💬 Join team Slack for questions

```

### Content Sources
```

Primary: project_resources/design_system_and_typography/DESIGN_SYSTEM_ONBOARDING.md (1007 lines)

- Setup sections from README.md
- Environment setup from package.json comments
- Troubleshooting from docs/console_logs/ and docs/lint_errors/

```

---

## 6. ARCHITECTURE_DECISIONS.md (New Document)

### New Structure (500 lines target)

```

# 🏗️ Architecture Decision Records

Format: Each ADR includes: Decision | Context | Consequences | Alternatives

---

## ADR 001: Feature-Based Code Organization

**Decision:** Organize code by business feature, not technical layer

**Context:**

- Alternative: Layer-based (components/, services/, models/)
- Feature-based easier to locate related code
- Reduces cross-domain imports

**Implementation:**

```
src/
├── components/auth/      # All auth UI
├── components/trading/   # All trading UI
├── lib/trading/         # Trading business logic
├── hooks/useAuth.ts     # Shared hook
```

**Consequences:**

- ✅ Colocated related features
- ✅ Easier to find code
- ❌ Some code duplication
- ✅ Scales to large teams

**Alternatives Considered:**

- Layer-based organization (rejected: harder to find code)
- Domain-driven design (selected: feature-based is lighter)

**Decision Made:** November 2024

---

## ADR 002: Tailwind CSS + CSS Variables

**Decision:** Use Tailwind CSS utilities + CSS variables for styling

**Context:**

- BEM/SMACSS alternatives considered
- CSS-in-JS (Emotion, Styled) alternatives considered
- Design tokens need consistency
- Dark mode requires variables

**Implementation:**

- Primary: Tailwind class names (`className="flex gap-4"`)
- Fallback: CSS variables for hardcoded values (`--space-2`)
- Files: All styles in `src/styles/*.css`
- No inline styles (except dynamic values)

**Consequences:**

- ✅ Fast development
- ✅ Small CSS bundle (~30KB)
- ✅ Easy dark mode
- ❌ Learning curve for Tailwind
- ✅ Consistent spacing/colors

**Alternatives Considered:**

- CSS Modules (rejected: harder to customize)
- Styled Components (rejected: JS bundle size)
- Shadow DOM (rejected: complexity)

**Decision Made:** August 2024

---

## ADR 003: 8px/4px Spacing Grid

**Decision:** Enforce 8px (standard) and 4px (fine adjustments) spacing

**Context:**

- Consistency across all UIs
- CSS variables enforce grid: `--space-1` = 4px, `--space-2` = 8px
- Prevents arbitrary values like 11px, 23px
- Improves visual rhythm

**Implementation:**

- `--space-xs` = 4px, `--space-sm` = 8px, etc.
- Tailwind: `p-1` (4px), `p-2` (8px), etc.
- No arbitrary spacing (`p-[11px]` forbidden)
- Validation script blocks hardcoded values

**Consequences:**

- ✅ Visual consistency
- ✅ Predictable layouts
- ❌ Edge cases need workarounds
- ✅ Faster design decisions

**Alternatives Considered:**

- 10px grid (rejected: doesn't align with tailwind)
- No grid (rejected: inconsistency)
- Variable grid (rejected: hard to manage)

**Decision Made:** July 2024

---

## ADR 004: Intentionally Loose TypeScript Config

**Decision:** Allow `noImplicitAny: false` and `strictNullChecks: false`

**Context:**

- Team has varied TS experience
- Gradual adoption approach
- Strict TS blocks less experienced developers
- ESLint catches most real issues

**Implementation:**

```json
{
  "noImplicitAny": false,
  "strictNullChecks": false,
  "noUnusedLocals": false
}
```

**Consequences:**

- ✅ Lower barrier to entry
- ✅ Faster initial development
- ❌ Less type safety than strict
- ✅ Room for growth
- ✅ ESLint catches issues

**Alternatives Considered:**

- Strict TypeScript (rejected: blocks contributions)
- No TypeScript (rejected: loses type benefits)
- Selective strict in folders (rejected: complexity)

**Decision Made:** February 2024

---

## ADR 005: React Context + React Query (No Redux)

**Decision:** Use React Context for auth/UI state, React Query for server state

**Context:**

- Redux adds complexity (boilerplate)
- Context built into React
- React Query handles caching and synchronization
- Most state is server-driven

**Implementation:**

- Auth context: `src/contexts/AuthContext.tsx`
- Server state: React Query for all API calls
- Local UI state: Component useState
- No centralized global store

**Consequences:**

- ✅ Less boilerplate
- ✅ Smaller bundle
- ✅ Easier onboarding
- ❌ More prop drilling (mitigated by custom hooks)
- ✅ Server state separation is clean

**Alternatives Considered:**

- Redux (rejected: boilerplate)
- Zustand (rejected: another dependency)
- MobX (rejected: learning curve)

**Decision Made:** June 2024

---

## ADR 006: shadcn-ui as Component Base

**Decision:** Use shadcn-ui (Radix + Tailwind) for component foundation

**Context:**

- Headless UI components with accessibility
- Fully customizable (copy components into repo)
- No styling lock-in
- Large ecosystem (200+ components available)

**Implementation:**

- Copy components from shadcn-ui into `src/components/ui/`
- Customize with Tailwind and CSS variables
- Extend as needed for app-specific variants
- No breaking dependency on shadcn-ui

**Consequences:**

- ✅ Production-ready components
- ✅ Fully accessible
- ✅ Customizable
- ❌ Copy-based (manual updates)
- ✅ No breaking changes from lib

**Alternatives Considered:**

- Headless UI (rejected: fewer components)
- Material UI (rejected: styling lock-in)
- Build from scratch (rejected: time/a11y)

**Decision Made:** May 2024

---

## ADR 007: Dark Mode with CSS Variables

**Decision:** Implement dark mode using CSS variables

**Context:**

- Dark mode increasingly expected
- CSS variables allow theme switching
- No JavaScript DOM manipulation needed
- Works with prefers-color-scheme

**Implementation:**

```css
:root {
  --color-foreground: hsl(222 84% 5%);
  --color-background: hsl(0 0% 100%);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-foreground: hsl(0 0% 95%);
    --color-background: hsl(222 84% 5%);
  }
}
```

**Consequences:**

- ✅ Instant theme switching
- ✅ Respects system preference
- ✅ Manual override support
- ✅ No flash on page load
- ✅ Reduced JavaScript

**Alternatives Considered:**

- JavaScript-based switching (rejected: FOUC)
- Tailwind dark: prefix (rejected: less flexible)
- CSS-in-JS themes (rejected: bundle size)

**Decision Made:** September 2024

---

## ADR 008: Playwright for E2E Testing

**Decision:** Use Playwright for end-to-end tests

**Context:**

- Critical user journeys need testing
- Cypress alternative (too heavy, slower)
- Selenium (too low-level)
- Unit tests cover components, E2E cover flows

**Implementation:**

- Tests in `e2e/` folder
- Run against live/staging server
- Tests cover: auth, trading, KYC, risk management
- CI/CD integration

**Consequences:**

- ✅ Real browser testing
- ✅ Cross-browser support (Chrome, Firefox, Safari)
- ✅ Fast execution
- ✅ Good debugging
- ❌ Slower than unit tests

**Alternatives Considered:**

- Cypress (rejected: heavier, slower for this project)
- Selenium (rejected: low-level)
- Manual testing only (rejected: risky)

**Decision Made:** October 2024

---

## ADR 009: Supabase for Backend

**Decision:** Use Supabase (managed PostgreSQL + Auth + Realtime)

**Context:**

- Need quick backend without building from scratch
- Real-time features (position updates, notifications)
- Auth with KYC/AML verification
- PostgreSQL maturity and reliability

**Implementation:**

- All data in PostgreSQL
- RLS policies for security
- Supabase Auth for JWT
- Edge functions for custom logic
- Realtime subscriptions for updates

**Consequences:**

- ✅ Fast development
- ✅ Built-in auth
- ✅ Real-time support
- ✅ Managed infrastructure
- ⚠️ Vendor lock-in (mitigated: standard PostgreSQL)

**Alternatives Considered:**

- Firebase (rejected: less flexible)
- DIY Node + PostgreSQL (rejected: too much work)
- GraphQL backend (rejected: complexity)

**Decision Made:** March 2024

---

## When to Revisit These Decisions

- ADR 001: Feature organization → Revisit if project grows >50 developers
- ADR 002: Tailwind + CSS vars → Revisit if performance issues arise
- ADR 003: 8px grid → Only if designer alignment changes
- ADR 004: Loose TS → Graduate to strict when team ready
- ADR 005: Context + React Query → Revisit if state complexity increases
- ADR 006: shadcn-ui → Stable, unlikely to change
- ADR 007: Dark mode with CSS vars → Only if switching speed becomes issue
- ADR 008: Playwright → Only if E2E testing becomes slow
- ADR 009: Supabase → Only if vendor concerns emerge

---

## Decision Process for New Decisions

1. **Propose:** Document decision, context, alternatives
2. **Discuss:** Team review (async in PR)
3. **Decide:** Team lead approval
4. **Record:** Add new ADR entry
5. **Communicate:** Share with team, update related docs
6. **Review:** Quarterly review of effectiveness

```

### Content Sources
```

New document - extract from:

- AGENT.md (architecture principles)
- DESIGN_SYSTEM.md (design decisions)
- STYLE_GUIDE.md (coding decisions)
- CONTRIBUTING_DESIGN_SYSTEM.md (governance decisions)

```

---

## 7. TROUBLESHOOTING.md (New Consolidated)

### New Structure (600 lines target)

```

# 🔧 Troubleshooting Guide

## Development Issues

### Port 8080 Already in Use

**Problem:** `npm run dev` fails with "Port 8080 is already in use"

**Solution 1: Kill Process**

```bash
# macOS/Linux
lsof -i :8080
kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Solution 2: Different Port**

```bash
npm run dev -- --port 8081
```

---

### Module Not Found Errors

**Problem:** `Cannot find module '@/components/Button'`

**Causes:**

1. Module not installed
2. Wrong import path
3. Path alias not configured

**Solutions:**

1. Check `tsconfig.json` paths configuration
2. Verify file exists at import path
3. Clear node_modules: `rm -rf node_modules && npm install`

---

## Type Check Errors

### "'any' is not allowed" Error

**Problem:** ESLint error about `any` type

**Solution:**

```typescript
// Instead of
const data: any = response;

// Use
const data: unknown = response;
if (typeof data === "object") {
  // Now data is narrowed
}
```

---

### "Type 'null' is not assignable to type"

**Problem:** TypeScript strict null check (but we disabled it)

**Solution:**

```typescript
// This is allowed with our loose config
let value: string = null; // OK

// But best practice: use optional
let value: string | null = null; // Better
```

---

## Design System Validation Errors

### "Hardcoded color detected: #FF0000"

**Problem:** Design validation script found hardcoded color

**Solution:**

```css
/* Wrong */
.button {
  color: #ff0000; /* Hardcoded */
}

/* Right */
.button {
  color: var(--color-destructive); /* Variable */
}
```

**Available variables:**

- `--color-primary`, `--color-secondary`, `--color-accent`
- `--color-success`, `--color-warning`, `--color-destructive`
- `--color-foreground`, `--color-background`, `--color-border`

---

### "Typography off-scale: 13px (not in allowed list)"

**Problem:** Font size not in design system scale

**Solution:**

```css
/* Wrong */
.text {
  font-size: 13px;  /* Not in scale */
}

/* Right - use design scale */
.text {
  font-size: 0.875rem;  /* 14px, in scale */
}

/* Or use Tailwind */
<p className="text-sm">Text</p>
```

**Allowed sizes:**

- 12px, 14px, 16px, 18px, 24px, 32px
- For fine adjustments: 4px, 8px spacing

---

### "Spacing not on grid: padding 15px"

**Problem:** Spacing value not on 4px/8px grid

**Solution:**

```css
/* Wrong */
.card {
  padding: 15px; /* Not on grid */
}

/* Right */
.card {
  padding: 16px; /* 4px unit: 4×4 = 16px */
}

/* Or */
.card {
  @apply p-4; /* Tailwind: 16px */
}
```

---

## Build Errors

### "Module build failed" During Build

**Problem:** Build fails with cryptic module error

**Solutions:**

```bash
# Clear cache and rebuild
rm -rf dist .vite
npm run build

# Check for syntax errors
npm run type-check

# Verbose mode
npm run build -- --debug
```

---

### "Chunk too large" Warning

**Problem:** Build warning about chunk size

**Solution:** This is a warning, not a blocker. May improve with:

```bash
# Set ANALYZE to see bundle breakdown
ANALYZE=true npm run build

# Then optimize large chunks
```

---

## Component/UI Issues

### Button Not Responding to Clicks

**Problem:** Button receives clicks but doesn't trigger handler

**Checklist:**

1. ✅ Is it actually a `<button>` element?
2. ✅ Is onClick handler defined and correct?
3. ✅ Is button disabled? Check `disabled` prop
4. ✅ Is button inside a form? May submit instead
5. ✅ CSS z-index covering it? Check DevTools

**Solution:**

```tsx
// Check these
<Button
  onClick={handleClick} // Handler defined?
  disabled={false} // Not disabled?
  className="relative z-10" // Not hidden?
>
  Click me
</Button>
```

---

### Form Not Submitting

**Problem:** Form onSubmit not firing

**Causes:**

1. Missing form element (need <form>, not <div>)
2. No submit button
3. Event.preventDefault() called twice
4. Validation blocking submit

**Solution:**

```tsx
<form onSubmit={handleSubmit}>
  <Input name="email" />
  <Button type="submit">Send</Button> {/* type="submit" */}
</form>;

function handleSubmit(e) {
  e.preventDefault();
  // Handle submit
}
```

---

### Styling Not Applied

**Problem:** CSS classes added but styling not visible

**Checklist:**

1. ✅ Is className spelled correctly?
2. ✅ Is CSS loaded? Check in DevTools
3. ✅ Is selector specific enough?
4. ✅ Is !important being used elsewhere?
5. ✅ Build completed? Try `npm run build`

**Solution:**

```tsx
// Check DevTools
// 1. Right-click element → Inspect
// 2. Look for your class in Styles panel
// 3. Check if crossed out (overridden)
// 4. Check CSS file is loaded (Sources tab)
```

---

## Accessibility Issues

### "Element must have an associated label"

**Problem:** Form input missing label

**Solution:**

```tsx
/* Wrong */
<input type="email" placeholder="Email" />

/* Right */
<label htmlFor="email">Email</label>
<input id="email" type="email" />

/* Or */
<input
  type="email"
  aria-label="Email address"  // Invisible label
/>
```

---

### "Color contrast insufficient"

**Problem:** Text not readable on background

**Solution:**

```css
/* Check color contrast ratio */
/* Normal text: 4.5:1 minimum */
/* Large text (18px+): 3:1 minimum */

/* Use color variables which are pre-tested */
.text {
  color: var(--color-foreground); /* 18:1 contrast */
  background-color: var(--color-background);
}

/* Check with: https://webaim.org/resources/contrastchecker/ */
```

---

## Performance Issues

### Slow Page Load

**Checklist:**

1. ✅ Is there a large image? Optimize with WebP
2. ✅ Many API calls? Check Network tab
3. ✅ Large bundle? Run `ANALYZE=true npm run build`
4. ✅ Slow database query? Check Supabase logs

**Solutions:**

```bash
# See bundle breakdown
ANALYZE=true npm run build

# Check Network tab in DevTools
# 1. Slow images? Compress/webp
# 2. Slow API? Check database query
# 3. Large JS? Check code splitting
```

---

### React Warning: Unnecessary Re-renders

**Problem:** Component re-renders too often (warning in DevTools)

**Solution:**

```tsx
// Use useMemo for expensive computations
const memoized = useMemo(() => expensiveComputation(), [deps]);

// Use useCallback for stable function refs
const callback = useCallback(() => {
  /* ... */
}, [deps]);

// Avoid creating objects in render
const config = useMemo(() => ({ key: "value" }), []);
```

---

## Database/Supabase Issues

### "RLS policy violation"

**Problem:** Database query fails with RLS policy error

**Cause:** Row-level security policy blocking query

**Solutions:**

1. Check if user is authenticated
2. Check if policy matches query
3. Check if user_id column exists
4. Review RLS policy in Supabase console

```sql
-- Example policy
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = user_id);
```

---

### "Relation does not exist"

**Problem:** Table not found error

**Solution:**

```bash
# Regenerate types from database
npm run supabase:pull

# Check table name (case-sensitive)
# Verify migration was run
# Check Supabase dashboard
```

---

## Testing Issues

### "Test fails with 'Cannot find module'"

**Problem:** Import in test fails

**Solution:**

```bash
# ESM imports need proper setup
# Check jest/vitest config

# May need:
npm install --save-dev @babel/preset-typescript
```

---

### "Component not rendered in test"

**Problem:** Component renders null in test

**Solutions:**

1. Wrap with providers (Context, QueryClient)
2. Mock API calls
3. Wait for async data

```tsx
import { render, screen, waitFor } from "@testing-library/react";

// Wrap with providers
const Wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

render(<MyComponent />, { wrapper: Wrapper });
await waitFor(() => screen.getByText("Expected text"));
```

---

## Getting Help

### Resources

- 📖 DESIGN_SYSTEM.md - Design patterns
- 📖 COMPONENT_API.md - Component specs
- 📖 STYLE_GUIDE.md - Code conventions
- 🐛 GitHub Issues - Known bugs
- 💬 Team Slack - Ask other developers

### Escalation

- **Design question:** Post in #design Slack
- **TypeScript/type issue:** Post in #eng-help Slack
- **Accessibility issue:** Tag @accessibility-lead in PR
- **Performance issue:** File issue with ANALYZE report

### Before You Ask

- ✅ Search docs for solution
- ✅ Check error in DevTools
- ✅ Try clearing cache/rebuild
- ✅ Check your code for typos
- ✅ Check TypeScript/ESLint output

```

### Content Sources
```

Consolidate from:

- project_resources/design_system_and_typography/DESIGN_SYSTEM_ONBOARDING.md (Troubleshooting section)
- docs/console_logs/ (actual error logs and fixes)
- docs/lint_errors/ (ESLint fixes)
- Common issues from existing discussions

```

---

## Summary Table: What Gets Consolidated

| Old Docs (Fragmented) | New Consolidated Doc | Content Source |
|---|---|---|
| DESIGN_SYSTEM.md (868 L) + TYPOGRAPHY_SYSTEM.md (558 L) + DESIGN_SYSTEM_MAINTENANCE.md (300 L) | **DESIGN_SYSTEM.md** (1200 L) | Merge + cleanup |
| COMPONENT_SPECIFICATIONS.md (1000 L) + COMPONENT_QUICK_REFERENCE.md (500 L) + COMPONENT_MIGRATION_GUIDE.md (600 L) + COMPONENT_DOCUMENTATION_INDEX.md (400 L) | **COMPONENT_API.md** (1800 L) | Merge + reorganize |
| CONTRIBUTING_DESIGN_SYSTEM.md (500 L) + DESIGN_SYSTEM_MAINTENANCE.md governance sections | **CONTRIBUTING_DESIGN_SYSTEM.md** (700 L) | Extract + enhance |
| ACCESSIBILITY_IMPLEMENTATION_GUIDE.md (229 L) + DESIGN_SYSTEM.md accessibility sections | **ACCESSIBILITY_STANDARDS.md** (600 L) | Merge + expand |
| DESIGN_SYSTEM_ONBOARDING.md (1007 L) + DEVELOPMENT_SETUP sections | **DEVELOPMENT_SETUP.md** (800 L) | Merge + cleanup |
| Scattered throughout codebase | **ARCHITECTURE_DECISIONS.md** (500 L) | Extract + new |
| Scattered in console_logs/, lint_errors/, various docs | **TROUBLESHOOTING.md** (600 L) | Consolidate + new |

---

**This template document provides the exact structure and content mapping for all consolidated files. Use these outlines to create the actual consolidated documentation.**

```
