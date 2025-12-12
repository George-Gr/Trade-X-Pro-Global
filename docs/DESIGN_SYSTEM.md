# 🎨 TradeX Pro Design System v1.0

**Version:** 1.0  
**Status:** Production Ready

---

## 📋 Quick Navigation

- [Design Principles](#design-principles)
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Component Library](#component-library)
  - [Button Component](#button-component)
  - [Input Component](#input-component)
  - [Card Component](#card-component)
  - [Form Component](#form-component)
- [Component Do's and Don'ts](#-component-dos-and-donts)
- [shadcn-ui Customizations](#️-shadcn-ui-customizations)
- [Interactions & Animations](#-interactions--animations)
- [Accessibility](#-accessibility)
- [Responsive Design](#-responsive-design)
- [Quality Standards](#-quality-standards)

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

## ✅ Component Do's and Don'ts

### Button Do's ✅
- ✅ Use `size="default"` for standard buttons (48px)
- ✅ Use `variant="default"` for primary CTAs
- ✅ Use `variant="destructive"` for delete/dangerous actions
- ✅ Use `aria-label` for icon-only buttons
- ✅ Provide visual feedback on hover/active states
- ✅ Use loading state while processing

### Button Don'ts ❌
- ❌ Don't use multiple primary buttons in one section
- ❌ Don't use colors other than defined variants
- ❌ Don't remove focus rings for styling
- ❌ Don't use `<button>` with `onClick` for navigation (use links)
- ❌ Don't make buttons smaller than 32px height (xs)
- ❌ Don't use inline styles instead of CSS classes

### Input Do's ✅
- ✅ Always provide a visible label
- ✅ Use `mobileOptimized` for mobile forms
- ✅ Show error state with `error` prop
- ✅ Provide `aria-label` and `aria-describedby`
- ✅ Use `keyboardType` to optimize mobile keyboards
- ✅ Show help text with `description` prop
- ✅ Use size="lg" for better touch targets

### Input Don'ts ❌
- ❌ Don't hide labels (use aria-label if needed)
- ❌ Don't use placeholder as label
- ❌ Don't use hardcoded colors for invalid state
- ❌ Don't forget `type` attribute
- ❌ Don't display errors without visual indicator
- ❌ Don't make inputs smaller than 40px height

### Card Do's ✅
- ✅ Use elevation-1 for base content
- ✅ Use elevation-2 for featured content
- ✅ Use elevation-3 for modals only
- ✅ Use variant-primary for main content
- ✅ Combine elevation + variant appropriately
- ✅ Use `interactive` for clickable cards
- ✅ Keep card padding consistent (16-24px)

### Card Don'ts ❌
- ❌ Don't mix elevation levels in same context
- ❌ Don't use elevation-3 for regular content
- ❌ Don't remove border and shadow for "flat" effect
- ❌ Don't use cards for layout structure
- ❌ Don't make cards smaller than 200px width
- ❌ Don't ignore dark mode colors

### Form Do's ✅
- ✅ Use FormField for each input
- ✅ Always include FormLabel with `required` prop
- ✅ Use FormDescription for helper text
- ✅ Display FormMessage for errors
- ✅ Use Zod/TypeScript for schema validation
- ✅ Validate on blur/change, not just submit
- ✅ Show loading state during submission

### Form Don'ts ❌
- ❌ Don't skip FormLabel (always include)
- ❌ Don't use placeholder as label alternative
- ❌ Don't hide error messages
- ❌ Don't disable submit button without clear reason
- ❌ Don't validate without showing errors
- ❌ Don't use inline error styles (use FormMessage)
- ❌ Don't forget `aria-invalid` on errors

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

## 🎨 Additional Components

### Dialog Component
- **Use for**: Confirmation dialogs, important alerts
- **Elevation**: Card elevation-3
- **Animation**: Fade + scale on open
- **Accessibility**: Focus trap, escape to close
- **Mobile**: Full width with padding

### Alert Component
- **Variants**: default, destructive, success, warning
- **Use for**: Notifications, status messages
- **Icon**: Auto-included per variant
- **Dismissible**: Optional close button
- **Role**: `alert` for screen readers

### Badge Component
- **Use for**: Status indicators, labels, tags
- **Variants**: default, secondary, outline, destructive
- **Sizes**: sm, default
- **Interactive**: Optional onClick handler

### Checkbox Component
- **Size**: 20×20px (base)
- **States**: checked, unchecked, indeterminate
- **Accessibility**: Proper `aria-checked` attribute
- **Dark mode**: Automatic adaptation

### Dropdown Menu
- **Elevation**: Card elevation-3
- **Animation**: Fade + slide
- **Keyboard**: Arrow keys, Enter to select, Escape to close
- **Accessibility**: Role="menuitem", proper ARIA attributes

### Tooltip
- **Delay**: 200ms before show
- **Duration**: 150ms animate
- **Position**: Auto-adjust to viewport
- **Mobile**: Tap to show, avoid on small screens
- **Accessibility**: Optional `aria-label`, no tooltip for essential info

### Loading States
- **Spinner**: Animated circular icon
- **Skeleton**: Placeholder content loader
- **Progress**: For long operations
- **Loading button**: Disabled with spinner icon

---

## 🔧 Common Usage Patterns

### Form with Validation
```tsx
const schema = z.object({
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message too short'),
})

const form = useForm({ resolver: zodResolver(schema) })

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="you@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit">Send</Button>
    </form>
  </Form>
)
```

### Modal Dialog
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
    </DialogHeader>
    <p>Are you sure you want to proceed?</p>
    <DialogFooter>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleConfirm}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Error Boundary with Card
```tsx
<Card elevation="1" variant="primary">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <AlertCircle className="w-5 h-5 text-destructive" />
      Error Occurred
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground">
      Something went wrong. Please try again.
    </p>
  </CardContent>
  <CardFooter>
    <Button onClick={handleRetry}>Retry</Button>
  </CardFooter>
</Card>
```

### Empty State
```tsx
<Card elevation="1" className="text-center py-12">
  <CardContent>
    <InboxIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
    <CardTitle className="mb-2">No items yet</CardTitle>
    <p className="text-sm text-muted-foreground mb-4">
      You haven't created any items yet. Get started by creating your first one.
    </p>
    <Button onClick={handleCreate}>Create Item</Button>
  </CardContent>
</Card>
```

### List with Actions
```tsx
<div className="space-y-2">
  {items.map(item => (
    <Card key={item.id} elevation="1" interactive onClick={() => selectItem(item)}>
      <div className="flex items-center justify-between p-4">
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => editItem(item)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => deleteItem(item.id)}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  ))}
</div>
```

### Mobile Optimized Form
```tsx
<div className="space-y-6">
  <FormField
    control={form.control}
    name="phone"
    render={({ field }) => (
      <FormItem>
        <FormLabel required>Phone Number</FormLabel>
        <FormControl>
          <Input
            type="tel"
            keyboardType="tel"
            mobileOptimized
            placeholder="+1 (555) 000-0000"
            {...field}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
  <Button size="lg" className="w-full">
    Continue
  </Button>
</div>
```

---

## 📊 Color System in Components

### Light Mode (Default)
- **Primary**: `hsl(262 83% 58%)` - Purple, used for primary buttons, focus rings
- **Secondary**: `hsl(217 91% 60%)` - Blue, used for secondary buttons
- **Destructive**: `hsl(0 84% 60%)` - Red, used for delete buttons
- **Success**: `hsl(160 84% 39%)` - Green, used for success states
- **Warning**: `hsl(38 92% 50%)` - Amber, used for warning states
- **Background**: `hsl(0 0% 100%)` - White, main background
- **Foreground**: `hsl(222 47% 11%)` - Dark gray, main text

### Dark Mode
- All colors automatically adjust for dark backgrounds
- Text contrast maintained at 4.5:1 (WCAG AA)
- Backgrounds darken significantly
- Borders and dividers increase in opacity
- Shadows become more pronounced

**Accessing colors in components:**
```tsx
// Use CSS variables, not hardcoded colors
className="bg-primary"           // ✅ Correct
className="text-destructive"     // ✅ Correct
className="border-input"         // ✅ Correct
className="bg-[#FF0000]"        // ❌ Wrong

// In styles, use CSS variables
background: hsl(var(--primary))        // ✅ Correct
color: #FF0000                         // ❌ Wrong
```

---

## 📱 Responsive Behavior

### Breakpoints
- **Mobile**: 320px - 639px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px+

### Component Adjustments
**Cards**
- Mobile: `elevation-2` → `elevation-1`, no hover lift
- Tablet: Normal elevation
- Desktop: Normal elevation

**Button**
- Mobile: Minimum 44×44px, gap between buttons 8px
- Tablet: Normal sizing
- Desktop: Normal sizing

**Input**
- Mobile: Use `mobileOptimized` prop for 44px height
- Tablet: Standard sizing
- Desktop: Standard sizing

**Forms**
- Mobile: Stack fields vertically, full width
- Tablet: Can use 2-column layout
- Desktop: Can use 2-3 column layout

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
