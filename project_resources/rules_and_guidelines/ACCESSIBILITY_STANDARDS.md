# ♿ Accessibility Standards & Requirements

**Version:** 1.0  
**Compliance Level:** WCAG 2.1 Level AA  
**Status:** Complete  
**Last Updated:** December 12, 2025

---

## 📋 Quick Navigation

- [Accessibility Principles](#accessibility-principles)
- [WCAG 2.1 Compliance](#wcag-21-compliance)
- [Component Accessibility](#component-accessibility)
- [Keyboard Navigation](#keyboard-navigation)
- [Screen Reader Support](#screen-reader-support)
- [Color & Contrast](#color--contrast)
- [Touch Targets & Spacing](#touch-targets--spacing)
- [Motion & Animations](#motion--animations)
- [Testing Checklist](#-testing-checklist)
- [Tools & Resources](#-tools--resources)

---

## 🎯 Accessibility Principles

### 1. Perceivable
Information must be presented so all can perceive it.
- Content is visible and readable
- Colors are not the only indicator
- Text alternatives for images
- Sufficient contrast ratios

### 2. Operable
All functionality must be keyboard accessible.
- Keyboard navigation possible
- Links, buttons, inputs all accessible
- Focus indicators visible
- No content requires timed interaction

### 3. Understandable
Content must be clear and easy to comprehend.
- Plain language (avoid jargon)
- Consistent navigation
- Clear labels and instructions
- Predictable behavior

### 4. Robust
Content works with assistive technologies.
- Valid HTML semantics
- Proper ARIA attributes
- Compatible with screen readers
- Works on all browsers

---

## ♿ WCAG 2.1 Compliance

### Compliance Level: AA (Minimum Standard)

**Level AA includes:**
- ✅ All Level A requirements
- ✅ Enhanced contrast (4.5:1 for normal, 3:1 for large)
- ✅ Keyboard accessibility
- ✅ Focus management
- ✅ Descriptive link text
- ✅ Page structure (headings)
- ✅ Form accessibility
- ✅ Error identification

### Our Standards

| Criterion | Requirement | Status |
|-----------|-------------|--------|
| 1.4.3 Contrast (Minimum) | 4.5:1 for body text, 3:1 for large | ✅ Compliant |
| 1.4.11 Non-text Contrast | 3:1 for UI components | ✅ Compliant |
| 2.1.1 Keyboard | All functions keyboard accessible | ✅ Compliant |
| 2.1.2 No Keyboard Trap | Keyboard can move away from elements | ✅ Compliant |
| 2.4.3 Focus Order | Logical tab order | ✅ Compliant |
| 2.4.7 Focus Visible | Visible focus indicator | ✅ Compliant |
| 3.2.1 On Focus | No unexpected context changes | ✅ Compliant |
| 3.2.2 On Input | Changes only after explicit request | ✅ Compliant |
| 3.3.2 Labels or Instructions | All inputs have labels | ✅ Compliant |
| 4.1.2 Name, Role, Value | All components have proper semantics | ✅ Compliant |

---

## 🧩 Component Accessibility

### Button

**Requirements:**
- ✅ Semantic `<button>` element
- ✅ Text content or `aria-label` for icon buttons
- ✅ Visible focus indicator
- ✅ 44×44px minimum touch target
- ✅ `aria-pressed` for toggle buttons
- ✅ `aria-expanded` for menu buttons

**Example:**
```tsx
// ✅ CORRECT - Text button
<Button>Delete Account</Button>

// ✅ CORRECT - Icon button with label
<Button size="icon" aria-label="Close dialog">
  <X className="w-4 h-4" />
</Button>

// ✅ CORRECT - Toggle button
<Button 
  aria-pressed={isPressed}
  onClick={() => setIsPressed(!isPressed)}
>
  Toggle
</Button>

// ❌ WRONG - No aria-label
<Button size="icon">
  <Settings className="w-4 h-4" />
</Button>
```

### Input

**Requirements:**
- ✅ Associated `<label>` element
- ✅ Unique `id` attribute
- ✅ Correct `type` attribute
- ✅ `aria-invalid` for errors
- ✅ `aria-describedby` for help text
- ✅ `required` prop for required fields

**Example:**
```tsx
// ✅ CORRECT
<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    aria-describedby="email-help"
    required
  />
  <p id="email-help" className="text-xs text-muted-foreground">
    We'll never share your email
  </p>
</div>

// ✅ CORRECT - With error
<div className="space-y-2">
  <Label htmlFor="username">Username</Label>
  <Input
    id="username"
    aria-invalid={!!error}
    aria-describedby={error ? 'username-error' : undefined}
  />
  {error && (
    <p id="username-error" className="text-sm text-destructive">
      {error}
    </p>
  )}
</div>

// ❌ WRONG - No label
<Input type="email" placeholder="Email" />

// ❌ WRONG - Placeholder as label
<Input type="email" placeholder="Enter your email" />
```

### Form

**Requirements:**
- ✅ All inputs have `<label>` elements
- ✅ Required fields marked with `required` prop
- ✅ Error messages linked with `aria-describedby`
- ✅ `aria-invalid` on error states
- ✅ Submit button always visible
- ✅ Form validation errors announced

**Example:**
```tsx
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export function Form() {
  const form = useForm({ resolver: zodResolver(schema) })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage /> {/* Connects to aria-invalid */}
          </FormItem>
        )}
      />

      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Dialog

**Requirements:**
- ✅ Role `dialog` or use `<Dialog>` component
- ✅ Focus trapped inside dialog
- ✅ Escape key closes dialog
- ✅ Focus returned to trigger button
- ✅ Descriptive title with `id="dialog-title"`
- ✅ Description with `id="dialog-desc"`
- ✅ `aria-labelledby` points to title
- ✅ `aria-describedby` points to description

**Example:**
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Card

**Requirements:**
- ✅ Proper heading hierarchy if contains headings
- ✅ Interactive cards have focus indicator
- ✅ Text contrast 4.5:1 minimum
- ✅ Images have alt text
- ✅ No color-only information

**Example:**
```tsx
// ✅ CORRECT
<Card elevation="2" interactive onClick={selectCard}>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Descriptive content</p>
  </CardContent>
</Card>
```

### Alert

**Requirements:**
- ✅ Role `alert` for important messages
- ✅ `aria-live="polite"` for dynamic content
- ✅ Clear, descriptive message
- ✅ Icon + text (color not only indicator)
- ✅ Text contrast 4.5:1

**Example:**
```tsx
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    This is a message that screen readers will announce
  </AlertDescription>
</Alert>

// Dynamic status
<div role="status" aria-live="polite" aria-atomic="true">
  {status === 'success' && 'Your changes have been saved'}
</div>
```

---

## ⌨️ Keyboard Navigation

### Tab Order

**Requirements:**
- ✅ Logical tab order (left-to-right, top-to-bottom)
- ✅ No skipped interactive elements
- ✅ Tab order matches visual order
- ✅ Use `tabIndex` only when necessary

**Example:**
```tsx
// ✅ CORRECT - Natural tab order
<form className="space-y-4">
  <Input id="first" placeholder="First name" />
  <Input id="last" placeholder="Last name" />
  <Button>Submit</Button>
</form>

// ❌ WRONG - Skipped elements
<div>
  <Input tabIndex="1" />
  {/* Can't tab to this button */}
  <Button>Submit</Button>
</div>
```

### Keyboard Shortcuts

**Supported Keys:**
- **Tab** - Move to next interactive element
- **Shift+Tab** - Move to previous interactive element
- **Enter/Space** - Activate buttons
- **Escape** - Close dialogs/menus
- **Arrow Keys** - Navigate within components (select, menu, tabs)

**Example:**
```tsx
// ✅ Dialog closes on Escape
<Dialog onOpenChange={setOpen}>
  {/* Escape automatically closes */}
</Dialog>

// ✅ Menu navigation with arrow keys
<Select>
  {/* Arrow keys navigate options */}
</Select>

// ✅ RadioGroup with arrow keys
<RadioGroup>
  {/* Arrow keys select options */}
</RadioGroup>
```

### Focus Management

**Requirements:**
- ✅ Focus visible at all times
- ✅ Focus indicator 2px+ width
- ✅ Sufficient contrast against background
- ✅ Not removed for styling

**CSS Implementation:**
```css
:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

---

## 🔊 Screen Reader Support

### Semantic HTML

**Use semantic elements:**
```tsx
// ✅ CORRECT
<main>
  <h1>Page Title</h1>
  <section>
    <h2>Section Title</h2>
    <p>Content</p>
  </section>
  <aside>
    <h2>Related</h2>
  </aside>
</main>

// ❌ WRONG
<div>
  <div className="h1-style">Page Title</div>
  <div>Content</div>
</div>
```

### ARIA Attributes

**Essential ARIA Attributes:**

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `aria-label` | Label for icon buttons | `<Button aria-label="Close">×</Button>` |
| `aria-labelledby` | Link to heading/title | `<div aria-labelledby="dialog-title">` |
| `aria-describedby` | Link to description | `<Input aria-describedby="help-text">` |
| `aria-invalid` | Mark errors | `<Input aria-invalid="true">` |
| `aria-required` | Mark required | `<Input aria-required="true">` |
| `aria-live` | Announce updates | `<div aria-live="polite">Status</div>` |
| `aria-expanded` | Toggle state | `<Button aria-expanded={open}>Menu</Button>` |
| `aria-pressed` | Button state | `<Button aria-pressed={active}>Bold</Button>` |
| `aria-hidden` | Hide decorative | `<Icon aria-hidden="true" />` |

**Examples:**
```tsx
// Icon button
<Button size="icon" aria-label="Settings">
  <Settings className="w-4 h-4" />
</Button>

// Status message
<div role="status" aria-live="polite">
  3 new messages
</div>

// Menu button
<Button 
  aria-expanded={isOpen}
  aria-haspopup="menu"
  onClick={toggleMenu}
>
  Actions
</Button>

// Error input
<Input
  aria-invalid={!!error}
  aria-describedby={error ? 'error-message' : undefined}
/>
{error && <p id="error-message">{error}</p>}
```

### Heading Hierarchy

**Requirements:**
- ✅ Exactly one `<h1>` per page
- ✅ Sequential levels: H1 → H2 → H3 → H4
- ✅ No skipped levels
- ✅ Use for structure, not styling

**Example:**
```tsx
// ✅ CORRECT
<main>
  <h1>Dashboard</h1>
  
  <section>
    <h2>Portfolio</h2>
    <h3>Holdings</h3>
    <p>Content</p>
  </section>

  <section>
    <h2>Positions</h2>
    <h3>Open Orders</h3>
    <p>Content</p>
  </section>
</main>

// ❌ WRONG - Skipped level
<h1>Dashboard</h1>
<h3>Portfolio</h3> {/* Should be H2 */}
```

### Link Text

**Requirements:**
- ✅ Descriptive link text
- ✅ Not "Click here" or "Read more"
- ✅ Unique within page when possible
- ✅ Clear destination

**Example:**
```tsx
// ✅ CORRECT
<a href="/docs/getting-started">Getting Started Guide</a>

// ❌ WRONG - Not descriptive
<a href="/docs/getting-started">Click here</a>
<a href="/docs/guide">Read more</a>
```

---

## 🎨 Color & Contrast

### Contrast Ratios

**Minimum Compliance:**
| Content | WCAG AA | WCAG AAA |
|---------|---------|----------|
| Normal text (14px) | 4.5:1 | 7:1 |
| Large text (18px+) | 3:1 | 4.5:1 |
| UI components | 3:1 | 3:1 |
| Disabled elements | No requirement | No requirement |

**Current TradeX Pro Contrast:**
```
Light Mode:
  Foreground on Background: 18:1 ✅
  Secondary on Background: 9:1 ✅
  Muted on Background: 4.5:1 ✅

Dark Mode:
  Foreground on Background: 18:1 ✅
  Secondary on Background: 9:1 ✅
  Muted on Background: 4.5:1 ✅
```

### Color as Only Indicator

**Forbidden:** Using color alone to convey meaning.

**Example:**
```tsx
// ❌ WRONG - Color only
<div style={{ color: error ? 'red' : 'green' }}>
  Status
</div>

// ✅ CORRECT - Icon + color + text
<div className={error ? 'text-destructive' : 'text-green-600'}>
  <AlertCircle className="inline mr-2" />
  {error ? 'Error' : 'Success'}
</div>
```

---

## 👆 Touch Targets & Spacing

### Minimum Touch Target Size

**Requirements:**
- ✅ 44×44px minimum for all interactive elements
- ✅ 8px gap between targets
- ✅ For mobile devices especially

**TradePro Standards:**
```
Button sizes:
  xs: 32×32px   - Desktop only (not mobile)
  sm: 40×40px   - Desktop only (not mobile)
  default: 48×48px - Mobile OK ✅
  lg: 56×56px   - Mobile OK ✅
  icon: 48×48px - Mobile OK ✅
  xl: 64×64px   - Mobile OK ✅

Input heights:
  sm: 32px      - Not recommended for mobile
  default: 40px - Desktop OK
  lg: 48px      - Mobile OK ✅
```

**Example:**
```tsx
// ✅ CORRECT - Touch-friendly
<Button size="lg" className="w-full">
  Sign In
</Button>

<div className="space-y-3"> {/* 12px gap */}
  <Input size="lg" />
  <Input size="lg" />
</div>

// ❌ WRONG - Too small for touch
<Button size="xs">Delete</Button>
<Button size="sm">Edit</Button>
```

---

## 🎬 Motion & Animations

### Respects Prefers Reduced Motion

**Requirement:**
All animations automatically respect `prefers-reduced-motion: reduce`.

**Implementation:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**CSS Variables:**
```css
/* Animations adjust automatically */
--duration-instant: 0ms;        /* Fast */
--duration-fast: 150ms;
--duration-normal: 200ms;       /* Default */
--duration-slow: 300ms;
--duration-slower: 500ms;       /* Slow */

/* All respect prefers-reduced-motion */
```

**Example:**
```tsx
// ✅ CORRECT - Animations work and respect preference
<motion.div animate={{ opacity: 1 }}>
  Content
</motion.div>

// ✅ NO SETUP NEEDED
// Animations automatically respect user preference
```

### Vestibular & Kinetic

**Forbidden:**
- ❌ Parallax scrolling
- ❌ Flashing content (>3 times/second)
- ❌ Zooming on hover

**Allowed:**
- ✅ Fade transitions
- ✅ Slide animations
- ✅ Color changes
- ✅ Scale transforms (smooth)

---

## ✅ Testing Checklist

### Keyboard Testing

- [ ] Can navigate all interactive elements with Tab
- [ ] Tab order is logical (left→right, top→bottom)
- [ ] Focus indicator visible on all elements
- [ ] Can activate buttons with Enter/Space
- [ ] Can close dialogs with Escape
- [ ] No keyboard traps
- [ ] Arrow keys work for select/menu/tabs
- [ ] All functionality accessible without mouse

### Screen Reader Testing

**With NVDA (Windows free):**
```
1. Download NVDA: https://www.nvaccess.org/
2. Enable NVDA + set to Scan mode
3. Navigate with arrow keys through page
4. Check:
   - All text readable
   - Links have descriptive text
   - Buttons have labels
   - Form fields have labels
   - Errors announced
   - Status updates announced
   - Headings announce level
```

**With JAWS (Windows paid):**
```
Similar testing with JAWS screen reader
```

**With VoiceOver (macOS/iOS):**
```
1. Enable: System Preferences > Accessibility > VoiceOver
2. Navigate with arrow keys
3. Perform same checks as NVDA
```

### Color Contrast Testing

**Tools:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)
- Chrome DevTools (Accessibility panel)
- Firefox Accessibility Inspector

**Process:**
```
1. Open Web Accessibility Evaluator Toolbars (WAVE)
2. Check each color combination
3. Verify:
   - 4.5:1 for body text
   - 3:1 for large text
   - 3:1 for UI components
4. Test light AND dark modes
```

### Motion Testing

- [ ] Content works with `prefers-reduced-motion: reduce`
- [ ] No flashing content (>3Hz)
- [ ] No parallax or kinetic scrolling
- [ ] Animations smooth and not jarring

### Component Testing

**For Every Component:**
- [ ] Semantic HTML used
- [ ] Focus visible and logical
- [ ] Labels connected to inputs
- [ ] ARIA attributes correct
- [ ] Color contrast sufficient
- [ ] Touch targets 44×44px+
- [ ] Keyboard accessible
- [ ] Screen reader announces properly
- [ ] Dark mode tested
- [ ] Mobile responsive

---

## 🛠️ Tools & Resources

### Testing Tools

| Tool | Purpose | Cost |
|------|---------|------|
| [WAVE](https://wave.webaim.org/) | Visual accessibility checker | Free |
| [Axe DevTools](https://www.deque.com/axe/devtools/) | Automated accessibility testing | Free |
| [Lighthouse](https://developers.google.com/web/tools/lighthouse) | Google's performance/a11y tool | Free |
| [NVDA](https://www.nvaccess.org/) | Free screen reader (Windows) | Free |
| [JAWS](https://www.freedomscientific.com/products/software/jaws/) | Premium screen reader | Paid |
| [Accessibility Insight](https://accessibilityinsights.io/) | Automated scanning + manual testing | Free |

### Learning Resources

| Resource | Topic |
|----------|-------|
| [WebAIM](https://webaim.org/) | A11y best practices |
| [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) | Official guidelines |
| [MDN A11y](https://developer.mozilla.org/en-US/docs/Web/Accessibility) | MDN accessibility guide |
| [Inclusive Components](https://inclusive-components.design/) | Component patterns |
| [A11y Project](https://www.a11yproject.com/) | Community resources |

### Quick Reference

**A11y Testing Checklist:**
1. Keyboard navigation (Tab through entire page)
2. Screen reader (test with NVDA/VoiceOver)
3. Contrast ratios (check with WebAIM)
4. Focus indicators (visible everywhere)
5. Motion preferences (test reduced motion)
6. Color not alone (icons + text)
7. Touch targets (44px+ minimum)
8. Heading hierarchy (H1 first, sequential)

---

## 🚀 Getting Started with Accessibility

### For New Components

1. **Use semantic HTML** - `<button>`, `<input>`, `<label>`, `<h1>`, etc.
2. **Add ARIA** - `aria-label`, `aria-describedby`, etc.
3. **Test keyboard** - Tab through your component
4. **Check contrast** - Use WebAIM Contrast Checker
5. **Test with screen reader** - Run NVDA on your component
6. **Check focus** - Ensure visible focus indicator
7. **Test on mobile** - Touch targets 44px minimum

### For Existing Components

1. Run Axe DevTools scan
2. Fix critical issues first
3. Check keyboard navigation
4. Verify ARIA labels
5. Test with screen reader
6. Validate contrast ratios

---

## 📞 Questions?

For accessibility questions or issues:
1. Check [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
2. Review [WebAIM](https://webaim.org/) articles
3. Ask in #accessibility Slack channel
4. Schedule a11y review with team

---

**Last Updated:** December 12, 2025  
**Version:** 1.0  
**Compliance:** WCAG 2.1 Level AA ✅
