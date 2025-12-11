# 🎨 TradeX Pro Design System v1.0

**Version:** 1.0  
**Status:** Production Ready

---

## 📋 Quick Navigation

- [Design Principles](#design-principles)
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Components](#components)
- [Interactions](#interactions--animations)
- [Accessibility](#accessibility)
- [Quality Standards](#quality-standards)

---

## 🎯 Design Principles

### 1. Clarity First
Every interface element communicates its purpose clearly.

### 2. Consistency Over Customization
Maintain design consistency across all features.

### 3. Accessibility is Mandatory
Every component must be accessible by default. Accessibility is not optional.

### 4. Mobile First
Design for small screens first, then enhance for larger displays.

### 5. Performance Matters
Smooth, responsive interactions at 60fps. Respect user motion preferences.

---

## 🎨 Color System

### Primary Colors
| Color | HSL Value | Use Case |
|-------|-----------|----------|
| **Primary** | `hsl(210, 100%, 50%)` | Primary actions, CTAs |
| **Secondary** | `hsl(220, 90%, 56%)` | Secondary actions |
| **Accent** | `hsl(200, 100%, 50%)` | Highlights, accents |

### Semantic Colors
```
Success:     hsl(160 84% 39%)   - Positive feedback
Warning:     hsl(38 92% 50%)    - Warning messages
Destructive: hsl(0 84% 60%)     - Errors, deletions
Info:        hsl(210 100% 50%)  - Information
```

### Functional Colors
```
Foreground:       hsl(222 84% 5%)     - Primary text
Foreground-Secondary: hsl(220 9% 27%) - Secondary text
Foreground-Muted: hsl(220 9% 58%)     - Muted text
Background:       hsl(0 0% 100%)      - Primary background
Background-Secondary: hsl(220 13% 96%)- Elevated backgrounds
Border:           hsl(220 13% 91%)    - Border colors
```

---

## 🔤 Typography

### Type Scale

| Style | Size | Line Height | Usage |
|-------|------|-------------|-------|
| **Display-lg** | 3.5rem (56px) | 1.1 | Hero headlines |
| **Display-md** | 2.25rem (36px) | 1.2 | Major sections |
| **Display-sm** | 1.875rem (30px) | 1.3 | Section headers |
| **Headline-lg** | 1.5rem (24px) | 1.3 | Page titles |
| **Headline-md** | 1.25rem (20px) | 1.4 | Card titles |
| **Body-md** | 1rem (16px) | 1.6 | Body text |
| **Body-sm** | 0.875rem (14px) | 1.6 | Secondary text |
| **Caption** | 0.75rem (12px) | 1.5 | Small labels |

### Font Families
```css
Sans-serif: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
Monospace:  'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono'
```

---

## 📏 Spacing & Layout

### Spacing Scale (8px/4px Grid)

```
xs: 4px      - Tight spacing, icon gaps
sm: 8px      - Small elements
md: 16px     - Related elements  
lg: 24px     - Component internal spacing
xl: 32px     - Between sections (mobile)
2xl: 48px    - Between sections (tablet)
3xl: 64px    - Between sections (desktop)
4xl: 96px    - Major breaks
5xl: 128px   - Hero to content
```

### Component Padding
```
Button-sm:   padding: 8px 12px;
Button-md:   padding: 12px 16px;
Button-lg:   padding: 16px 24px;
Input:       padding: 12px 16px;
Card:        padding: 16px (mobile), 24px (desktop)
```

---

## 🧩 Components

### Button Sizes
- `xs`: 32px height (icon buttons)
- `sm`: 40px height
- `md`: 48px height (default)
- `lg`: 56px height
- `xl`: 64px height

### Button Variants
- **primary**: Main CTAs
- **secondary**: Alternative actions
- **outline**: Low-emphasis actions
- **ghost**: Minimal actions
- **destructive**: Dangerous actions

### Card Component
```
Elevation-1: Subtle shadow for grouped content
Elevation-2: Standard elevation for cards
Elevation-3: High elevation for overlays
```

### Form Components
All form components must:
- Have explicit labels
- Support `aria-describedby` for help text
- Support `aria-invalid` for errors
- Have 44px minimum touch targets on mobile

---

## ✨ Interactions & Animations

### Animation Timing
```css
--duration-instant: 0ms;
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### Easing Functions
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Animation Types
- Ripple effects
- Staggered list animations
- Slide & fade transitions
- Scale & transform effects
- Loading animations
- Modal & dropdown animations
- Toast notifications

### Reduced Motion
All animations automatically respect `prefers-reduced-motion`. No setup needed!

---

## ♿ Accessibility

### WCAG 2.1 Level AA

### Keyboard Navigation
- Tab through all interactive elements in logical order
- Enter/Space to activate buttons
- Escape to close modals
- Arrow keys for menus

### Screen Reader Support
```html
<button aria-label="Close dialog" onClick={onClose}>
  <X />
</button>

<div role="status" aria-live="polite">
  Status message
</div>
```

### Focus Indicators
All interactive elements must have visible focus:
```css
:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### Color Contrast
All text must have 4.5:1 contrast ratio (WCAG AA):
```
Dark text on light: ✓ 18:1
Light text on dark: ✓ 18:1
Secondary text: ✓ 9:1
Muted text: ✓ 4.5:1
```

### Touch Targets
Minimum 44×44px for mobile touch targets:
```
Button: min-height: 44px; min-width: 44px;
Gap: gap: 8px; (between targets)
```

---

## 📱 Responsive Design

### Breakpoints
```
Mobile:  320px - 639px (default)
Tablet:  640px - 1023px
Desktop: 1024px+
```

### Mobile-First Approach
```css
/* Mobile (default) */
.card { padding: 16px; }

/* Tablet */
@media (min-width: 640px) {
  .card { padding: 20px; }
}

/* Desktop */
@media (min-width: 1024px) {
  .card { padding: 24px; }
}
```

---

## ✅ Quality Standards

### Component Checklist
Before shipping any component:
- [ ] Functionality works as intended
- [ ] Uses design system colors, typography, spacing
- [ ] Works at 320px, 768px, 1024px breakpoints
- [ ] Keyboard accessible
- [ ] Screen reader compatible
- [ ] 4.5:1 contrast ratio
- [ ] Focus visible
- [ ] No console errors
- [ ] Unit tests exist
- [ ] JSDoc comments present

### Code Review Checklist
- [ ] Tailwind utility classes used (not inline styles)
- [ ] Proper spacing from design system
- [ ] Color values from CSS variables
- [ ] Typography classes applied
- [ ] Focus states for interactive elements
- [ ] ARIA attributes where needed
- [ ] Mobile-first responsive design
- [ ] Respects `prefers-reduced-motion`

### Design System Violations

**FORBIDDEN:**
```javascript
backgroundColor: '#ff0000'      // Use CSS variables
fontSize: '16px'                // Use text-* classes
padding: '13px'                 // Use 4/8px grid
borderRadius: '7px'             // Use standard values
```

**REQUIRED:**
```javascript
backgroundColor: hsl(var(--primary))  // CSS variables
className="text-base"                 // Text classes
padding: 16px                         // 4/8px grid
borderRadius: 8px                     // Standard values
```

---

## 📚 Related Documentation

- **QUALITY_GATES.md**: Quality standards and validation
- **MICRO_INTERACTIONS_REFERENCE.md**: Animation usage guide
- **advanced-accessibility.css**: Accessibility patterns
- **micro-interactions.css**: Animation implementation

---

## 🤝 Contributing

When adding new components:
1. Follow design principles
2. Use existing design tokens
3. Ensure accessibility compliance
4. Test across breakpoints
5. Document usage with examples
6. Get design review approval

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

*Last updated: December 2024*  
*Design System Version: 1.0*
