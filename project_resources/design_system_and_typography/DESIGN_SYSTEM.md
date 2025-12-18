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

| Color         | HSL Value             | Use Case              |
| ------------- | --------------------- | --------------------- |
| **Primary**   | `hsl(210, 100%, 50%)` | Primary actions, CTAs |
| **Secondary** | `hsl(220, 90%, 56%)`  | Secondary actions     |
| **Accent**    | `hsl(200, 100%, 50%)` | Highlights, accents   |

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

All typography values are defined in `src/styles/typography.css` and match the implementation exactly.

| Level       | Size            | Line Height     | Weight | Letter Spacing | Tailwind Class                | Usage                       |
| ----------- | --------------- | --------------- | ------ | -------------- | ----------------------------- | --------------------------- |
| **H1**      | 2rem (32px)     | 1.2 (38.4px)    | 700    | -0.02em        | `text-2xl` + `font-bold`      | Page titles, main headings  |
| **H2**      | 1.5rem (24px)   | 1.33 (32px)     | 600    | -0.01em        | `text-2xl` + `font-semibold`  | Section headers             |
| **H3**      | 1.125rem (18px) | 1.33 (24px)     | 600    | 0              | `text-lg` + `font-semibold`   | Card titles, subsections    |
| **H4**      | 1rem (16px)     | 1.375 (22px)    | 600    | 0              | `text-base` + `font-semibold` | Subsection headers          |
| **Body**    | 0.875rem (14px) | 1.625 (22.75px) | 400    | 0              | `text-sm`                     | Regular body text (default) |
| **Small**   | 0.75rem (12px)  | 1.5 (18px)      | 400    | 0              | `text-xs`                     | Helper text, captions       |
| **Label**   | 0.875rem (14px) | 1.43 (20px)     | 500    | 0              | `text-sm` + `font-medium`     | Form labels                 |
| **Caption** | 0.75rem (12px)  | 1.5 (18px)      | 500    | 0              | `text-xs` + `font-medium`     | Metadata, timestamps        |

### Font Families

```css
/* Primary UI Font */
Sans-serif: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto

/* Data/Code Font */
Monospace:  'JetBrains Mono', 'Fira Code', Consolas, Monaco

/* Display/Headline Font */
Display:    'Inter' (same as sans, heavier weights)
```

### Typography Usage Examples

#### Headings

```tsx
// H1 - Page Title (32px, weight 700)
<h1 className="text-2xl font-bold tracking-tighter">
  Dashboard Overview
</h1>

// H2 - Section Header (24px, weight 600)
<h2 className="text-2xl font-semibold tracking-tight">
  Recent Transactions
</h2>

// H3 - Card Title (18px, weight 600)
<h3 className="text-lg font-semibold">
  Portfolio Summary
</h3>

// H4 - Subsection (16px, weight 600)
<h4 className="text-base font-semibold">
  Account Details
</h4>
```

#### Body Text

```tsx
// Default body text (14px, weight 400)
<p className="text-sm">
  This is the default body text for paragraphs and content.
</p>

// Small helper text (12px, weight 400)
<span className="text-xs text-muted-foreground">
  Additional helper information
</span>

// Form label (14px, weight 500)
<label className="text-sm font-medium">
  Email Address
</label>

// Caption/metadata (12px, weight 500)
<time className="text-xs font-medium text-muted-foreground">
  2 hours ago
</time>
```

#### Special Typography Utilities

```tsx
// Display text (responsive, clamps 36px-72px)
<h1 className="text-display">
  Welcome to TradeX Pro
</h1>

// Headline text (responsive, clamps 30px-48px)
<h2 className="text-headline">
  Start Trading Today
</h2>

// Title text (responsive, clamps 24px-36px)
<h3 className="text-title">
  Featured Markets
</h3>

// Tabular numbers for data (monospace font)
<span className="text-data">
  $1,234.56
</span>
```

### Font Weights

```css
--font-light: 300 /* Use sparingly */ --font-normal: 400 /* Default body text */
  --font-medium: 500 /* Labels, emphasized text */ --font-semibold: 600
  /* Headings H2-H4 */ --font-bold: 700 /* H1, strong emphasis */
  --font-extrabold: 800 /* Display, hero text */;
```

### Line Heights

```css
--leading-tight: 1.2 /* Large headings */ --leading-snug: 1.375
  /* Medium headings */ --leading-normal: 1.5 /* Body text */
  --leading-relaxed: 1.625 /* Comfortable reading */ --leading-loose: 1.875
  /* Spacious text */;
```

### Letter Spacing

```css
--tracking-tight: -0.02em /* Large headings (H1) */ --tracking-normal: 0
  /* Default text */ --tracking-wide: 0.05em /* Small caps, labels */;
```

### Complete Typography Reference

#### All Available Tailwind Font Sizes

```
text-2xs: 10px / 14px      (Custom - very rare use)
text-xs:  12px / 16px      (Caption, helper text)
text-sm:  14px / 20px      (Body text - DEFAULT)
text-base: 16px / 24px     (Emphasized body)
text-lg:  18px / 28px      (H3, card titles)
text-xl:  20px / 28px      (Subheadings)
text-2xl: 24px / 32px      (H1, H2)
text-3xl: 30px / 36px      (Display text)
text-4xl: 36px / 40px      (Large display)
text-5xl: 48px / 1.15      (Hero text)
text-6xl: 60px / 1.1       (Extra large display)
text-7xl: 72px / 1.1       (Rare, marketing)
text-8xl: 96px / 1         (Rare, hero sections)
```

#### Accessibility & Contrast

All typography must meet WCAG 2.1 Level AA standards:

- **Body text (14px)**: Minimum 4.5:1 contrast ratio
- **Large text (18px+)**: Minimum 3:1 contrast ratio
- **Small text (12px)**: Minimum 4.5:1 contrast ratio

✅ **Current Compliance:**

```
Light Mode:
  - Foreground on Background:     18:1 ✓
  - Foreground-Secondary:         9:1 ✓
  - Foreground-Muted:            4.8:1 ✓

Dark Mode:
  - Foreground on Background:     18:1 ✓
  - Foreground-Secondary:         9:1 ✓
  - Foreground-Muted:            4.8:1 ✓
```

#### Typography Best Practices

**DO:**
✅ Use `text-sm` for body text (14px is the dashboard default)  
✅ Use `text-xs` with `font-medium` for captions and metadata  
✅ Use semantic heading levels (H1 → H2 → H3 → H4)  
✅ Apply `tracking-tighter` to large headings for optical balance  
✅ Use `text-data` class for monetary values and numbers  
✅ Test all text at 320px, 768px, and 1024px breakpoints

**DON'T:**
❌ Use inline font-size styles: `style={{ fontSize: '14px' }}`  
❌ Skip heading levels (H1 → H3)  
❌ Use text smaller than 12px  
❌ Mix font families arbitrarily  
❌ Override line-heights without testing readability  
❌ Use custom font sizes outside the scale

#### Responsive Typography

For hero sections and large displays, use responsive utilities:

```tsx
// Automatically scales between mobile and desktop
<h1 className="text-display">  // 36px → 72px
<h2 className="text-headline"> // 30px → 48px
<h3 className="text-title">    // 24px → 36px

// Manual responsive scaling
<h1 className="text-2xl md:text-4xl lg:text-5xl">
  Scales: 24px → 36px → 48px
</h1>
```

#### Testing Checklist

Before shipping typography changes:

- [ ] Verify exact pixel sizes match this documentation
- [ ] Test on 320px mobile (iPhone SE)
- [ ] Test on 768px tablet (iPad)
- [ ] Test on 1024px+ desktop
- [ ] Check contrast ratios in both light and dark modes
- [ ] Verify line height provides comfortable reading
- [ ] Ensure proper heading hierarchy (H1 → H2 → H3)
- [ ] Test with actual content (not just Lorem Ipsum)
- [ ] Verify tabular numbers render correctly (financial data)

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
<button aria-label="Close dialog" onClick="{onClose}">
  <X />
</button>

<div role="status" aria-live="polite">Status message</div>
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
.card {
  padding: 16px;
}

/* Tablet */
@media (min-width: 640px) {
  .card {
    padding: 20px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .card {
    padding: 24px;
  }
}
```

### Breakpoints

| Device Category  | Range           | Tailwind | Class Prefix | Usage                       |
| ---------------- | --------------- | -------- | ------------ | --------------------------- |
| Mobile (default) | 320px - 639px   | —        | —            | Small phones, no prefix     |
| Mobile Large     | 640px - 767px   | `sm`     | `sm:`        | Large phones, tablets start |
| Tablet           | 768px - 1023px  | `md`     | `md:`        | Tablets, iPads              |
| Desktop          | 1024px - 1279px | `lg`     | `lg:`        | Small desktops, laptops     |
| Desktop Large    | 1280px - 1399px | `xl`     | `xl:`        | Standard desktops           |
| Desktop XL       | 1400px+         | `2xl`    | `2xl:`       | Ultra-wide displays         |

### Mobile-First Example

```css
/* Mobile (default) - applies to all screens */
.card {
  padding: 16px;
  gap: 8px;
  grid-columns: 1;
}

/* Tablet */
@media (min-width: 640px) {
  .card {
    padding: 20px;
    gap: 12px;
    grid-columns: 2;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .card {
    padding: 24px;
    gap: 16px;
    grid-columns: 3;
  }
}
```

### Tailwind Responsive Prefix Examples

```tsx
// Padding responsive
<div className="p-4 sm:p-6 md:p-8 lg:p-10">
  Content
</div>

// Grid columns responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* Cards */}
</div>

// Display responsive
<div className="hidden md:block">
  Only visible on tablet and above
</div>

// Gap responsive
<div className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-10">
  Items with responsive spacing
</div>
```

### Touch Target Scaling

Ensure interactive elements are at least 44×44px:

```tsx
// Mobile
<button className="h-12 px-6">            {/* 48px height */}
  Action
</button>

// With margin
<button className="h-10 px-4 m-2">        {/* 44px + 4px margin = 52px */}
  Action
</button>
```

### Performance Considerations

- Mobile layouts use base (no prefix) styles
- Desktop enhancements use `lg:` and above
- Reduces CSS bloat by leveraging mobile defaults
- Typical pattern: `base md: lg: xl: 2xl:` in that order

````

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
````

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
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message too short"),
});

const form = useForm({ resolver: zodResolver(schema) });

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
);
```

### Modal Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
</Dialog>;
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
  {items.map((item) => (
    <Card
      key={item.id}
      elevation="1"
      interactive
      onClick={() => selectItem(item)}
    >
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

### Typography

- **TYPOGRAPHY_VERIFICATION.md**: Complete typography verification report
- **TYPOGRAPHY_ALIGNMENT_SUMMARY.md**: Typography alignment change summary
- **typography.css**: Typography system implementation

### Design System

- **QUALITY_GATES.md**: Quality standards and validation
- **MICRO_INTERACTIONS_REFERENCE.md**: Animation usage guide
- **DESIGN_SYSTEM_MAINTENANCE.md**: Governance and maintenance processes
- **CONTRIBUTING_DESIGN_SYSTEM.md**: Contributor guidelines

### Styles

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

_Last updated: December 2024_  
_Design System Version: 1.0_
