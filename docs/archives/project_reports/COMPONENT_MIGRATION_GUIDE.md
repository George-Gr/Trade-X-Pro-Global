# Component Migration & Upgrade Guide

**Guide for implementing proper component specifications across the codebase.**

---

## 📋 Overview

This guide helps developers migrate existing component usage to match the new comprehensive specifications documented in `DESIGN_SYSTEM.md` and `COMPONENT_SPECIFICATIONS.md`.

---

## 🔄 Migration Checklist

### Phase 1: Button Components

- [ ] Audit all button usage
- [ ] Replace hardcoded colors with variants
- [ ] Add `aria-label` to icon buttons
- [ ] Ensure proper size for touch targets
- [ ] Test all variant styles

### Phase 2: Input Components

- [ ] Add explicit labels to all inputs
- [ ] Implement error state handling
- [ ] Add mobile optimization where needed
- [ ] Set proper keyboard types
- [ ] Add aria-describedby and aria-invalid

### Phase 3: Card Components

- [ ] Add elevation levels
- [ ] Set appropriate variants
- [ ] Test dark mode rendering
- [ ] Update interactive cards
- [ ] Verify responsive behavior

### Phase 4: Form Components

- [ ] Migrate to Form/FormField pattern
- [ ] Implement validation with Zod
- [ ] Add error messages with FormMessage
- [ ] Include help text with FormDescription
- [ ] Mark required fields

### Phase 5: Other Components

- [ ] Update Dialog components
- [ ] Fix Alert styling
- [ ] Update Badge usage
- [ ] Review all state indicators

---

## 🔧 Common Migrations

### Migration: Button Styles

**Before (Incorrect)**

```tsx
// ❌ Hardcoded colors
<button
  style={{
    backgroundColor: "#6B5FFF",
    color: "white",
    padding: "12px 20px",
    fontSize: "14px",
    borderRadius: "6px",
  }}
  onClick={handleClick}
>
  Click me
</button>
```

**After (Correct)**

```tsx
// ✅ Design system buttons
import { Button } from "@/components/ui/button";

<Button variant="default" onClick={handleClick}>
  Click me
</Button>;
```

**Benefits:**

- Consistent styling across app
- Automatic dark mode support
- Proper accessibility
- Easy theme changes
- Maintainable code

---

### Migration: Input with Label & Validation

**Before (Incorrect)**

```tsx
// ❌ No label, no error handling
<input
  type="email"
  placeholder="Email"
  onChange={(e) => setEmail(e.target.value)}
/>
```

**After (Correct)**

```tsx
// ✅ Proper label and error handling
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().email('Invalid email')
})

const form = useForm({ resolver: zodResolver(schema) })

<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input
            type="email"
            placeholder="user@example.com"
            {...field}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

**Benefits:**

- Accessible label
- Built-in validation
- Error display
- Mobile optimization
- Better UX

---

### Migration: Card Elevation System

**Before (Incorrect)**

```tsx
// ❌ No elevation or hierarchy
<div
  style={{
    border: "1px solid #DDD",
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  }}
>
  Card content
</div>
```

**After (Correct)**

```tsx
// ✅ Proper elevation and semantics
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card elevation="1" variant="primary">
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>Card content</CardContent>
</Card>;
```

**Benefits:**

- Visual hierarchy
- Consistent elevation levels
- Dark mode support
- Semantic HTML
- Better accessibility

---

### Migration: Error Messages

**Before (Incorrect)**

```tsx
// ❌ Unstructured error handling
const [error, setError] = React.useState('')

<div>
  <input
    type="text"
    onChange={(e) => {
      const value = e.target.value
      if (!value) setError('Required')
      else setError('')
    }}
  />
  {error && <p style={{ color: 'red' }}>{error}</p>}
</div>
```

**After (Correct)**

```tsx
// ✅ Proper form validation and errors
const schema = z.object({
  name: z.string().min(1, 'Name required')
})

const form = useForm({ resolver: zodResolver(schema) })

<Form {...form}>
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel required>Name</FormLabel>
        <FormControl>
          <Input placeholder="Enter name" {...field} />
        </FormControl>
        <FormMessage />  {/* Auto-shows error */}
      </FormItem>
    )}
  />
</Form>
```

**Benefits:**

- Structured validation
- Auto-managed error state
- Consistent error styling
- Better accessibility
- Automatic error icons

---

## 📝 Specific Component Migrations

### Button: Icon Button

**Pattern: Adding aria-label**

```tsx
// Before: Inaccessible
<Button size="icon">
  <X />
</Button>

// After: Accessible
<Button size="icon" aria-label="Close dialog">
  <X />
</Button>
```

### Button: Loading State

**Pattern: Disable during loading**

```tsx
// Before: Manual management
const [loading, setLoading] = React.useState(false)

<button
  disabled={loading}
  onClick={async () => {
    setLoading(true)
    await doSomething()
    setLoading(false)
  }}
>
  {loading ? 'Loading...' : 'Click'}
</button>

// After: Cleaner code
const [loading, setLoading] = React.useState(false)

<Button
  disabled={loading}
  variant={loading ? 'loading' : 'default'}
  onClick={async () => {
    setLoading(true)
    try {
      await doSomething()
    } finally {
      setLoading(false)
    }
  }}
>
  {loading && <Loader className="mr-2 animate-spin" />}
  {loading ? 'Processing...' : 'Submit'}
</Button>
```

### Input: Mobile Optimization

**Pattern: Mobile-friendly inputs**

```tsx
// Before: Small on mobile
<Input type="tel" placeholder="(555) 000-0000" />

// After: Mobile optimized
<Input
  type="tel"
  keyboardType="tel"
  mobileOptimized
  size="lg"
  placeholder="(555) 000-0000"
/>
```

### Input: Error State

**Pattern: Show errors properly**

```tsx
// Before: No visual feedback
<Input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// After: Clear error indication
<Input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
  aria-invalid={!!emailError}
  aria-errormessage={emailError ? 'email-error' : undefined}
/>
{emailError && (
  <p id="email-error" className="text-sm text-destructive">
    {emailError}
  </p>
)}
```

### Card: Interactive Cards

**Pattern: Clickable cards**

```tsx
// Before: Not keyboard accessible
<div
  onClick={() => navigate(`/item/${id}`)}
  style={{ cursor: 'pointer', padding: '16px' }}
>
  Click me
</div>

// After: Accessible
<Card
  interactive
  onClick={() => navigate(`/item/${id}`)}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      navigate(`/item/${id}`)
    }
  }}
>
  <CardContent>Click me</CardContent>
</Card>
```

### Form: Complete Form

**Pattern: Full form implementation**

```tsx
// Before: Basic form
<form onSubmit={(e) => {
  e.preventDefault()
  if (!email) alert('Email required')
  if (!password) alert('Password required')
  handleLogin({ email, password })
}}>
  <label>Email</label>
  <input
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />

  <label>Password</label>
  <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  <button type="submit">Login</button>
</form>

// After: Proper form with validation
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Too short')
})

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' }
})

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel required>Email</FormLabel>
          <FormControl>
            <Input type="email" placeholder="user@example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel required>Password</FormLabel>
          <FormControl>
            <Input type="password" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <Button type="submit" className="w-full">Sign In</Button>
  </form>
</Form>
```

---

## 🎯 Quality Checklist

After migration, verify:

### Accessibility

- [ ] All inputs have labels
- [ ] Focus rings visible
- [ ] Color contrast 4.5:1
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

### Visual Design

- [ ] Consistent colors (use variants)
- [ ] Proper spacing (4/8px grid)
- [ ] Correct sizing (touch-friendly)
- [ ] Dark mode looks good
- [ ] Responsive on all breakpoints

### Code Quality

- [ ] No hardcoded colors
- [ ] No inline styles
- [ ] Using Tailwind classes
- [ ] Proper component composition
- [ ] No console errors/warnings

### Mobile Experience

- [ ] 44px minimum touch targets
- [ ] Proper keyboard types
- [ ] Responsive layout
- [ ] No zoom required
- [ ] Touch-friendly spacing

---

## 🚀 Implementation Strategy

### Step 1: Plan

- Identify components to migrate
- Prioritize high-traffic pages
- Estimate effort per component
- Schedule sprints

### Step 2: Document

- Create task list per component
- Document expected changes
- Plan testing approach
- Identify potential issues

### Step 3: Implement

- Migrate one component at a time
- Test thoroughly
- Get code review
- Deploy to staging

### Step 4: Test

- Visual regression testing
- Accessibility audit
- Mobile testing
- User feedback

### Step 5: Deploy

- Deploy to production
- Monitor for issues
- Document changes
- Update documentation

---

## 📊 Metrics to Track

### Before Migration

- Line count of custom CSS
- Number of hardcoded colors
- Accessibility violations
- Mobile usability score

### After Migration

- Reduced custom CSS
- Zero hardcoded colors
- 100% accessibility compliance
- Improved mobile scores

### Success Criteria

- 80%+ component usage of design system
- 100% accessibility compliance
- Zero hardcoded color violations
- Mobile touch targets: 100%

---

## 🆘 Troubleshooting

### Issue: Button style not applying

**Solution**: Check component variant and size props are correct

```tsx
// Check these:
<Button variant="default">      {/* Check variant exists */}
<Button size="default">         {/* Check size exists */}
<Button className="custom">     {/* Custom classes might conflict */}
```

### Issue: Form validation not working

**Solution**: Ensure resolver is properly set

```tsx
// Must have:
const form = useForm({
  resolver: zodResolver(schema),  // ← Required
  defaultValues: { ... }
})
```

### Issue: Card shadow not visible

**Solution**: Check elevation prop is set

```tsx
// Add elevation:
<Card elevation="1">
  {" "}
  {/* Elevation required */}
  <CardContent>Content</CardContent>
</Card>
```

### Issue: Input not mobile optimized

**Solution**: Add mobile props

```tsx
// For mobile:
<Input
  mobileOptimized              {/* ← Required */}
  size="lg"                    {/* ← Larger touch target */}
  keyboardType="email"         {/* ← Proper keyboard */}
/>
```

---

## 📚 Resources

- **DESIGN_SYSTEM.md**: Complete design system documentation
- **COMPONENT_SPECIFICATIONS.md**: Detailed component APIs
- **COMPONENT_QUICK_REFERENCE.md**: Quick lookup guide
- **QUALITY_GATES.md**: Quality standards
- **CONTRIBUTING_DESIGN_SYSTEM.md**: Contribution guidelines

---

## 🤝 Getting Help

If you need help with migration:

1. Check **COMPONENT_QUICK_REFERENCE.md** for examples
2. Read **COMPONENT_SPECIFICATIONS.md** for detailed specs
3. Review existing working examples in codebase
4. Ask design system team for guidance

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintained by**: Design System Team
