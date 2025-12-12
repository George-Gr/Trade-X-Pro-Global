# Component Specifications & Reference Guide

**Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Complete

---

## Table of Contents

1. [Button Component](#button-component)
2. [Input Component](#input-component)
3. [Card Component](#card-component)
4. [Form Component](#form-component)
5. [Label Component](#label-component)
6. [Common Patterns](#common-patterns)
7. [Accessibility Checklist](#accessibility-checklist)
8. [Troubleshooting](#troubleshooting)

---

## Button Component

### Overview
The Button component is the primary call-to-action element. It supports multiple sizes, variants, and states.

**Location:** `src/components/ui/button.tsx`  
**Variants File:** `src/components/ui/buttonVariants.ts`  

### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Variants
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'loading' | 'success' | 'warning'
  
  // Sizes
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'icon' | 'xl'
  
  // Animation
  animation?: 'none' | 'subtle' | 'bouncy' | 'immediate'
  
  // Standard React button props
  asChild?: boolean
  loading?: boolean
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  aria-label?: string
  aria-pressed?: boolean
  children: React.ReactNode
}
```

### Size Guide

| Size | Height | Padding | Font | Use Case | Touch-friendly |
|------|--------|---------|------|----------|---|
| xs | 32px | 3px horizontal | xs | Icon buttons, compact | No |
| sm | 40px | 4px horizontal | sm | Small actions | No |
| default | 48px | 5px horizontal | base | Standard buttons | Yes |
| lg | 56px | 6px horizontal | base | Large CTAs | Yes |
| icon | 48×48px | — | — | Icon-only buttons | Yes |
| xl | 64px | 8px horizontal | lg | Hero buttons | Yes |

### Variant Guide

```tsx
// Primary CTA
<Button variant="default">Primary Action</Button>

// Secondary CTA
<Button variant="secondary">Secondary Action</Button>

// Neutral/Outline
<Button variant="outline">Outline Button</Button>

// Subtle/Ghost
<Button variant="ghost">Ghost Button</Button>

// Danger/Delete
<Button variant="destructive">Delete</Button>

// Text Link
<Button variant="link">Link Text</Button>

// Loading State
<Button variant="loading" disabled>
  <Loader className="mr-2 animate-spin" />
  Loading...
</Button>

// Success State
<Button variant="success">Success</Button>

// Warning State
<Button variant="warning">Warning</Button>
```

### States

**Hover**
- Background lightens (90-95% opacity)
- Shadow increases
- Lifts 1px up (translateY)
- Cursor changes to pointer

**Active/Pressed**
- Background darkens (80-90% opacity)
- Scales down slightly (0.98)
- Shadow reduces
- Visual feedback of interaction

**Disabled**
- Opacity: 40%
- Cursor: not-allowed
- No interactive response

**Focus (Keyboard)**
- 2px ring outline
- Ring color: primary color
- Ring offset: 2px
- Visible focus indicator for accessibility

### Animation Variants

```tsx
// Subtle (default) - gentle feedback
<Button animation="subtle">Subtle</Button>

// Bouncy - more playful
<Button animation="bouncy">Bouncy</Button>

// Immediate - instant feedback
<Button animation="immediate">Immediate</Button>

// No animation
<Button animation="none">No Animation</Button>
```

### Accessibility

- ✅ Minimum 44×44px for touch (default size and larger)
- ✅ Visible focus ring (2px)
- ✅ 4.5:1 contrast ratio
- ✅ For icon buttons, use `aria-label`
- ✅ For toggle buttons, use `aria-pressed`
- ✅ Respects `prefers-reduced-motion`

### Examples

**Basic Button**
```tsx
import { Button } from '@/components/ui/button'

<Button onClick={handleClick}>Click me</Button>
```

**Icon Button**
```tsx
<Button size="icon" aria-label="Close dialog">
  <X className="w-4 h-4" />
</Button>
```

**Loading State**
```tsx
const [isLoading, setIsLoading] = React.useState(false)

<Button 
  loading={isLoading}
  disabled={isLoading}
  onClick={async () => {
    setIsLoading(true)
    await handleSubmit()
    setIsLoading(false)
  }}
>
  Submit Form
</Button>
```

**With Keyboard Shortcut**
```tsx
<Button title="Keyboard shortcut: Ctrl+S">
  Save (Ctrl+S)
</Button>
```

---

## Input Component

### Overview
The Input component handles text, email, password, and number inputs with mobile optimization and error handling.

**Location:** `src/components/ui/input.tsx`

### Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Custom sizing
  size?: 'sm' | 'default' | 'lg' | 'mobile'
  
  // Form integration
  label?: string
  error?: string
  description?: string
  
  // Mobile optimization
  mobileOptimized?: boolean
  keyboardType?: 'default' | 'numeric' | 'decimal' | 'email' | 'tel'
  
  // Standard HTML input props
  type?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  aria-label?: string
  aria-describedby?: string
  aria-invalid?: boolean
  aria-errormessage?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
}
```

### Size Guide

| Size | Height | Padding | Font | Use Case | Mobile |
|------|--------|---------|------|----------|--------|
| sm | 36px | 3px/8px | sm | Compact forms | No |
| default | 40px | 3px/10px | base/sm | Standard inputs | No |
| lg | 44px | 4px/12px | base | Large inputs | No |
| mobile | 44px | 4px/12px | base/sm | Mobile forms | Yes |

### Keyboard Types

```tsx
// Default text input
<Input keyboardType="default" />

// Mobile: Shows numeric keyboard
<Input keyboardType="numeric" pattern="[0-9]*" />

// Mobile: Shows decimal keyboard
<Input keyboardType="decimal" type="number" />

// Mobile: Shows email keyboard
<Input keyboardType="email" type="email" />

// Mobile: Shows phone keyboard
<Input keyboardType="tel" type="tel" />
```

### States

**Default**
- Border: 1px solid (var(--input))
- Background: white
- Placeholder: muted gray
- Cursor: text

**Focused**
- Ring: 2px solid (var(--ring))
- Ring offset: 2px
- Border: matches ring color
- Outline: none

**Error**
- Border: 2px solid (var(--destructive))
- Background: light red
- aria-invalid: true
- aria-errormessage: populated

**Disabled**
- Opacity: 60%
- Background: muted gray
- Cursor: not-allowed

**Read-only**
- Background: muted gray
- Cursor: default
- No focus ring

### Mobile Optimizations

```tsx
// For mobile forms, use mobileOptimized prop
<Input
  mobileOptimized
  type="tel"
  keyboardType="tel"
  placeholder="(555) 000-0000"
/>

// This automatically:
// - Sets height to 44px minimum
// - Shows phone keyboard on mobile
// - Sets proper inputMode
// - Prevents auto-capitalize
```

### Accessibility

- ✅ Minimum 44×44px touch target (size lg or mobile)
- ✅ Clear focus indicator
- ✅ Proper aria-label or associated label
- ✅ aria-describedby for help text
- ✅ aria-invalid and aria-errormessage
- ✅ Autocomplete attribute set appropriately
- ✅ Pattern validation for numeric inputs

### Examples

**Basic Text Input**
```tsx
import { Input } from '@/components/ui/input'

const [value, setValue] = React.useState('')

<Input
  type="text"
  placeholder="Enter name"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

**Email with Validation**
```tsx
<Input
  type="email"
  keyboardType="email"
  placeholder="user@example.com"
  required
  aria-label="Email address"
/>
```

**Error State**
```tsx
const [error, setError] = React.useState('')

<div className="space-y-2">
  <Input
    type="password"
    error={error}
    aria-invalid={!!error}
    aria-errormessage="password-error"
  />
  {error && (
    <p id="password-error" className="text-sm text-destructive">
      {error}
    </p>
  )}
</div>
```

**Mobile Number Input**
```tsx
<Input
  type="tel"
  keyboardType="numeric"
  mobileOptimized
  placeholder="(555) 000-0000"
  pattern="[0-9]*"
/>
```

---

## Card Component

### Overview
The Card component provides a container for grouped content with multiple elevation levels and variants.

**Location:** `src/components/ui/card.tsx`  
**Styles:** `src/styles/cards.css`

### Props

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Elevation system (FE-013)
  elevation?: '1' | '2' | '3'
  
  // Background variants
  variant?: 'primary' | 'secondary' | 'tertiary'
  
  // Interactive behavior
  interactive?: boolean
  
  // Standard HTML div props
  className?: string
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLDivElement>
  role?: string
  tabIndex?: number
}
```

### Elevation System

| Level | Shadow | Visual Weight | Use Case |
|-------|--------|---------------|----------|
| 1 | shadow-sm | Subtle | Base content, stats, default cards |
| 2 | shadow-md | Medium | Featured sections, emphasized content |
| 3 | shadow-lg | Strong | Modals, dialogs, floating panels |

```tsx
// Base level - stat cards, content cards
<Card elevation="1">
  <CardContent>Base level content</CardContent>
</Card>

// Featured - section cards, emphasized
<Card elevation="2">
  <CardContent>Featured content</CardContent>
</Card>

// Modal - floating elements, overlays
<Card elevation="3">
  <CardContent>Modal content</CardContent>
</Card>
```

### Variants

| Variant | Background | Use Case |
|---------|-----------|----------|
| primary | Solid white/dark | Main content cards |
| secondary | Light blue/muted | Supporting content |
| tertiary | Very light gray | Background elements |

```tsx
// Primary - main content
<Card variant="primary">Main content</Card>

// Secondary - supporting content
<Card variant="secondary">Supporting content</Card>

// Tertiary - background elements
<Card variant="tertiary">Background content</Card>
```

### Compound Components

**CardHeader**
- Container for title and description
- Padding: 24px
- Space: 8px between children
- Use: Always include with CardTitle

```tsx
<CardHeader>
  <CardTitle>Title</CardTitle>
  <CardDescription>Description</CardDescription>
</CardHeader>
```

**CardTitle**
- Semantic: h2 heading
- Font: 1.25rem, semibold
- Use: Primary heading in card

```tsx
<CardTitle>My Card Title</CardTitle>
```

**CardDescription**
- Font: 14px, muted
- Use: Subtitle or description text

```tsx
<CardDescription>Optional subtitle</CardDescription>
```

**CardContent**
- Container for main content
- Padding: 24px (no top padding)
- Use: Primary content area

```tsx
<CardContent>
  Main card content goes here
</CardContent>
```

**CardFooter**
- Container for actions
- Layout: flex items-center
- Padding: 24px (no top padding)
- Use: Buttons, actions, metadata

```tsx
<CardFooter>
  <Button>Save</Button>
  <Button variant="ghost">Cancel</Button>
</CardFooter>
```

**CardCompact**
- Reduced padding: 16px
- Use: Compact card variations

```tsx
<CardCompact>Compact content</CardCompact>
```

### States

**Default**
- Border: 1px solid
- Shadow: elevation-level specific
- Transition: 0.3s ease-in-out

**Hover** (interactive cards)
- Shadow: elevated one level
- Transform: translateY(-1px)
- Cursor: pointer

**Disabled**
- Opacity: 60%
- Cursor: not-allowed
- Pointer-events: none

**Focus** (focusable cards)
- Outline: 2px solid ring color
- Outline-offset: 2px
- Box-shadow: ring glow

### Accessibility

- ✅ Proper heading hierarchy (h2 for CardTitle)
- ✅ Focus ring visible on keyboard navigation
- ✅ Sufficient color contrast (4.5:1)
- ✅ No color-only information
- ✅ Respects prefers-reduced-motion

### Examples

**Basic Card**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card elevation="1" variant="primary">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

**Interactive Card**
```tsx
<Card 
  elevation="2" 
  interactive
  onClick={() => navigate(`/items/${id}`)}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      navigate(`/items/${id}`)
    }
  }}
>
  <CardHeader>
    <CardTitle>Clickable Card</CardTitle>
  </CardHeader>
  <CardContent>Click to open details</CardContent>
</Card>
```

**With All Components**
```tsx
<Card elevation="2">
  <CardHeader>
    <CardTitle>Complete Card</CardTitle>
    <CardDescription>With all components</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content area</p>
  </CardContent>
  <CardFooter className="gap-2">
    <Button>Save</Button>
    <Button variant="ghost">Cancel</Button>
  </CardFooter>
</Card>
```

---

## Form Component

### Overview
The Form component provides a complete form solution with React Hook Form integration, validation, and accessibility.

**Location:** `src/components/ui/form.tsx`

### Setup

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'

// 1. Define schema
const formSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Too short'),
})

// 2. Create form
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { email: '', password: '' },
})

// 3. Render form
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    {/* Form fields go here */}
  </form>
</Form>
```

### Props

**Form**
- Extends FormProvider from react-hook-form
- Wraps entire form
- Provides form context

**FormField**
```typescript
interface FormFieldProps {
  control: Control  // From useForm
  name: string      // Field name from schema
  render: (props: any) => React.ReactNode
}
```

**FormItem**
- Container for label + control + message
- Auto-generates unique IDs
- Handles spacing

**FormLabel**
```typescript
interface FormLabelProps extends React.LabelHTMLAttributes {
  required?: boolean  // Shows red asterisk
  children: React.ReactNode
}
```

**FormControl**
- Wraps input component
- Applies ARIA attributes
- Links to description and error IDs

**FormDescription**
- Helper text below input
- Font: 14px, muted
- Use: Instructions, hints, examples

**FormMessage**
- Displays validation error
- Auto-includes error icon
- Role: alert
- aria-live: polite

### Form States

**Default**
- All inputs visible
- No errors shown
- Submit button enabled

**Focused** (on input)
- Ring outline visible
- Input: 2px ring
- Color: primary

**Error** (validation failed)
- Input border: red
- FormMessage shows error
- aria-invalid: true
- aria-errormessage: set

**Submitting**
- Submit button: loading state
- Inputs: disabled
- No further validation

**Success**
- Optional success message
- Form can be reset
- Clear user feedback

### Validation

```tsx
// Built-in validation with Zod
const schema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email required'),
  
  password: z.string()
    .min(8, 'Password too short')
    .regex(/[A-Z]/, 'Need uppercase')
    .regex(/[0-9]/, 'Need a number'),
  
  terms: z.boolean()
    .refine(val => val === true, 'Must accept terms'),
})

// Validation happens on:
// - Blur
// - Change (if previously blurred)
// - Submit (always)
```

### Accessibility

- ✅ Auto-generated unique IDs
- ✅ FormLabel linked via htmlFor
- ✅ FormMessage linked via aria-errormessage
- ✅ FormDescription linked via aria-describedby
- ✅ aria-invalid on error
- ✅ Error message: role="alert", aria-live="polite"
- ✅ Required indicator: aria-label="required"

### Examples

**Simple Login Form**
```tsx
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export function LoginForm() {
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
        
        <Button type="submit">Sign In</Button>
      </form>
    </Form>
  )
}
```

**With Help Text**
```tsx
<FormField
  control={form.control}
  name="password"
  render={({ field }) => (
    <FormItem>
      <FormLabel required>Password</FormLabel>
      <FormControl>
        <Input type="password" {...field} />
      </FormControl>
      <FormDescription>
        Min 8 characters, 1 uppercase, 1 number
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## Label Component

### Overview
Simple label component with proper accessibility and disabled state support.

**Location:** `src/components/ui/label.tsx`

### Props

```typescript
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string      // Links to input ID
  children: React.ReactNode
  className?: string
  disabled?: boolean    // Visual disabled state
}
```

### Usage

```tsx
import { Label } from '@/components/ui/label'

// With input
<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input id="email" type="email" />
</div>

// Standalone
<Label>Checkbox Label</Label>
```

---

## Common Patterns

### Pattern: Form with Validation & Error Handling

```tsx
function ContactForm() {
  const schema = z.object({
    name: z.string().min(1, 'Name required'),
    email: z.string().email('Invalid email'),
    message: z.string().min(10, 'Message too short'),
  })
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', message: '' },
  })
  
  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(values),
      })
      
      if (!response.ok) throw new Error('Failed to send')
      
      toast.success('Message sent!')
      form.reset()
    } catch (error) {
      toast.error('Failed to send message')
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Message</FormLabel>
              <FormControl>
                <textarea className="w-full p-3 border rounded-md" {...field} />
              </FormControl>
              <FormDescription>Min 10 characters</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          Send Message
        </Button>
      </form>
    </Form>
  )
}
```

### Pattern: Interactive Card List

```tsx
function ItemList({ items, onSelect }: { items: Item[], onSelect: (id: string) => void }) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  
  return (
    <div className="space-y-2">
      {items.map(item => (
        <Card
          key={item.id}
          elevation="1"
          interactive
          onClick={() => {
            setSelectedId(item.id)
            onSelect(item.id)
          }}
          role="button"
          tabIndex={0}
          className={selectedId === item.id ? 'ring-2 ring-primary' : ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setSelectedId(item.id)
              onSelect(item.id)
            }
          }}
        >
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <Button size="icon" variant="ghost">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
```

---

## Accessibility Checklist

### For All Components
- [ ] 4.5:1 color contrast (WCAG AA)
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] No color-only information
- [ ] Respects prefers-reduced-motion
- [ ] Works in dark mode
- [ ] Touch targets 44×44px minimum

### For Buttons
- [ ] Has type attribute (button, submit, reset)
- [ ] Icon buttons have aria-label
- [ ] Disabled state properly styled
- [ ] Loading state clear
- [ ] Focus ring visible

### For Inputs
- [ ] Associated label (visible or aria-label)
- [ ] Error state clearly marked
- [ ] aria-invalid on error
- [ ] aria-describedby for help text
- [ ] aria-errormessage for errors
- [ ] Proper input type set
- [ ] Pattern validation if applicable

### For Forms
- [ ] All inputs labeled
- [ ] Error messages visible
- [ ] Required fields marked
- [ ] Submit button clearly labeled
- [ ] Success message shown
- [ ] Form can be reset
- [ ] Validation on appropriate events

### For Cards
- [ ] Heading hierarchy correct
- [ ] Interactive cards are keyboard accessible
- [ ] Focus ring visible
- [ ] No critical content color-only

---

## Troubleshooting

### Button Issues

**Problem: Button not responding to clicks**
- Check: `disabled` attribute not set
- Check: `onClick` handler is passed
- Check: `type` is not "button" (for submit, use type="submit")

**Problem: Button text cut off**
- Solution: Use `size="lg"` for more padding
- Solution: Add `className="whitespace-nowrap"` if needed
- Check: Content not too long for button width

**Problem: Focus ring not visible**
- Check: CSS not overriding focus styles
- Solution: Use `focus-visible:ring-2` class
- Check: Dark mode contrast sufficient

### Input Issues

**Problem: Mobile keyboard not optimizing**
- Solution: Use `keyboardType` prop
- Example: `keyboardType="email"` for email
- Check: `inputMode` attribute in dev tools

**Problem: Error not displaying**
- Check: `error` prop is passed
- Check: `FormMessage` component rendered
- Check: aria-invalid set to true

**Problem: Input too small on mobile**
- Solution: Use `mobileOptimized` prop
- Solution: Use `size="lg"` or `size="mobile"`
- Check: Height is 44px minimum

### Card Issues

**Problem: Card shadow looks wrong in dark mode**
- Check: CSS variables using dark mode values
- Solution: Shadows automatically adjusted
- Check: Browser dark mode enabled

**Problem: Interactive card not keyboard accessible**
- Add: `role="button"` attribute
- Add: `tabIndex={0}` for keyboard nav
- Add: `onKeyDown` handler for Enter/Space

### Form Issues

**Problem: Validation not triggering**
- Check: `resolver` passed to useForm
- Check: Validation schema matches fields
- Check: Field names match schema keys

**Problem: Error message not showing**
- Check: `FormMessage` rendered
- Check: Field has validation error
- Check: `aria-errormessage` linked

**Problem: Form values not updating**
- Check: `{...field}` spread operator used
- Check: `name` prop matches schema
- Check: Control passed to FormField

---

## Dark Mode Support

All components automatically support dark mode through CSS variables.

**Light Mode**
- Backgrounds: White, light gray
- Text: Dark gray, black
- Borders: Light gray
- Shadows: Subtle

**Dark Mode**
- Backgrounds: Dark gray, black
- Text: White, light gray
- Borders: Medium gray
- Shadows: More pronounced

No additional setup needed - CSS variables handle all styling.

---

**Last Updated:** December 2024  
**Maintained by:** Design System Team
