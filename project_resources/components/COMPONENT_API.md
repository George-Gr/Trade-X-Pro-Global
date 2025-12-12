# 🧩 Component API Reference

**Version:** 1.0  
**Status:** Complete & Consolidated  
**Last Updated:** December 12, 2025

---

## 📋 Quick Navigation

- [Button Component](#button-component)
- [Input Component](#input-component)
- [Card Component](#card-component)
- [Form Component](#form-component)
- [Dialog Component](#dialog-component)
- [Select Component](#select-component)
- [Checkbox & Radio Components](#checkbox--radio-components)
- [Badge & Label Components](#badge--label-components)
- [Alert Component](#alert-component)
- [Dropdown Menu](#dropdown-menu)
- [Common Patterns](#-common-patterns)
- [Accessibility Checklist](#-accessibility-checklist)
- [Component Do's & Don'ts](#-component-dos--donts)

---

## Button Component

### Overview
The Button component is the primary call-to-action element. It supports multiple sizes, variants, and states. Always use Button for interactive actions.

**Location:** `src/components/ui/button.tsx`

### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'icon' | 'xl'
  asChild?: boolean
  loading?: boolean
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  'aria-label'?: string
  'aria-pressed'?: boolean
  children: React.ReactNode
}
```

### Sizes

| Size | Height | Min Width | Padding | Touch Target | Use Case |
|------|--------|-----------|---------|--------------|----------|
| `xs` | 32px | — | 4px 8px | ❌ No | Icon buttons, compact spaces |
| `sm` | 40px | — | 6px 12px | ❌ No | Small secondary actions |
| `default` | 48px | 48px | 8px 16px | ✅ Yes | Standard buttons (default) |
| `lg` | 56px | — | 12px 24px | ✅ Yes | Large CTAs, hero sections |
| `icon` | 48px | 48px | — | ✅ Yes | Icon-only buttons |
| `xl` | 64px | — | 16px 24px | ✅ Yes | Full-width CTAs |

### Variants

#### Default (Primary)
```tsx
<Button variant="default">Save Changes</Button>
<Button variant="default" size="lg">Get Started</Button>
<Button variant="default" disabled>Disabled</Button>
<Button variant="default" size="icon" aria-label="Settings">
  <Settings className="w-4 h-4" />
</Button>
```
**Use:** Primary call-to-action, main actions  
**Color:** Primary blue, white text  
**States:** Hover (darker), Active (pressed), Disabled (muted)

#### Secondary
```tsx
<Button variant="secondary">Cancel</Button>
<Button variant="secondary" size="sm">Learn More</Button>
```
**Use:** Secondary actions, alternative paths  
**Color:** Secondary blue, white text  
**States:** Similar to default

#### Outline
```tsx
<Button variant="outline">Edit</Button>
<Button variant="outline" size="lg">View All</Button>
```
**Use:** Neutral actions, low-emphasis options  
**Color:** Border + text, transparent background  
**States:** Filled on hover/active

#### Ghost
```tsx
<Button variant="ghost">More Options</Button>
<Button variant="ghost" size="sm">Skip</Button>
```
**Use:** Minimal actions, text-like appearance  
**Color:** Text only, no border  
**States:** Background on hover

#### Destructive
```tsx
<Button variant="destructive">Delete Account</Button>
<Button variant="destructive" size="sm">Remove</Button>
```
**Use:** Dangerous actions, deletions  
**Color:** Red, white text  
**States:** Darker red on hover

#### Link
```tsx
<Button variant="link">Learn more →</Button>
<Button variant="link" size="sm">View source</Button>
```
**Use:** Inline links, navigation  
**Color:** Primary blue, underline on hover  
**States:** Darker on hover

### Loading State

```tsx
<Button disabled loading>
  <Loader className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

Use the `loading` prop to disable and show loading indicator.

### Examples

#### CTA Button
```tsx
<Button 
  size="lg" 
  onClick={handleSubmit}
  className="w-full"
>
  Start Trading
</Button>
```

#### Icon Button
```tsx
<Button 
  variant="ghost" 
  size="icon" 
  aria-label="Close dialog"
  onClick={onClose}
>
  <X className="w-4 h-4" />
</Button>
```

#### Button Group
```tsx
<div className="flex gap-3">
  <Button variant="outline" onClick={onCancel}>Cancel</Button>
  <Button onClick={onConfirm}>Confirm</Button>
</div>
```

#### Loading CTA
```tsx
<Button 
  disabled={isLoading} 
  loading={isLoading}
  size="lg"
>
  {isLoading ? 'Processing' : 'Submit'}
</Button>
```

### Do's & Don'ts

**DO:**
- ✅ Use `size="default"` or `lg` for touch targets (44px+ minimum)
- ✅ Use `variant="destructive"` for delete/dangerous actions
- ✅ Provide `aria-label` for icon-only buttons
- ✅ Use `size="icon"` with square icon buttons
- ✅ Show loading state during async operations
- ✅ Combine with Tooltip for additional context

**DON'T:**
- ❌ Use multiple `variant="default"` in same section
- ❌ Remove focus rings for styling
- ❌ Use `<button onClick>` for navigation (use `<Link>` or `<a>`)
- ❌ Make buttons smaller than 32px height
- ❌ Use hardcoded colors instead of variants
- ❌ Forget aria-label on icon buttons

---

## Input Component

### Overview
The Input component is used for single-line text entry. Always pair with a Label component.

**Location:** `src/components/ui/input.tsx`

### Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time'
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: boolean
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
}
```

### Sizes

| Size | Height | Padding | Font | Use Case |
|------|--------|---------|------|----------|
| `default` | 40px | 8px 12px | sm | Standard inputs |
| `sm` | 32px | 4px 8px | xs | Compact forms |
| `lg` | 48px | 12px 16px | base | Large forms, mobile |

### Examples

#### Email Input
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input 
    id="email"
    type="email" 
    placeholder="you@example.com"
    required
  />
</div>
```

#### Password Input
```tsx
<div className="space-y-2">
  <Label htmlFor="password">Password</Label>
  <Input 
    id="password"
    type="password" 
    placeholder="••••••••"
    required
  />
</div>
```

#### Number Input
```tsx
<div className="space-y-2">
  <Label htmlFor="amount">Amount</Label>
  <Input 
    id="amount"
    type="number" 
    placeholder="0.00"
    min="0"
    step="0.01"
  />
</div>
```

#### Disabled Input
```tsx
<Input 
  placeholder="Disabled input"
  disabled
  value="Cannot edit"
/>
```

#### Error State
```tsx
<div className="space-y-2">
  <Label htmlFor="username">Username</Label>
  <Input 
    id="username"
    aria-invalid="true"
    aria-describedby="username-error"
  />
  <p id="username-error" className="text-sm text-destructive">
    Username already taken
  </p>
</div>
```

### Do's & Don'ts

**DO:**
- ✅ Always pair with `<Label>` component
- ✅ Use correct `type` attribute for mobile keyboard optimization
- ✅ Provide `placeholder` for input examples
- ✅ Use `aria-describedby` for error messages
- ✅ Set `required` prop for required fields
- ✅ Use `size="lg"` for better touch targets on mobile

**DON'T:**
- ❌ Use placeholder as the only label
- ❌ Hide the label component
- ❌ Use `disabled` without good reason
- ❌ Apply hardcoded colors for error states
- ❌ Forget `aria-invalid` when showing errors
- ❌ Make inputs smaller than 32px height

---

## Card Component

### Overview
The Card component is a container for related content. Use elevation and variants to create hierarchy.

**Location:** `src/components/ui/card.tsx`

### Props

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: '1' | '2' | '3'
  variant?: 'primary' | 'secondary' | 'outline'
  interactive?: boolean
  selected?: boolean
  className?: string
  onClick?: React.MouseEventHandler<HTMLDivElement>
  children: React.ReactNode
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
```

### Elevations

| Elevation | Shadow | Use Case |
|-----------|--------|----------|
| `1` | Subtle | Base content, grouped items |
| `2` | Standard | Featured content, main cards |
| `3` | High | Modal/overlay, important dialogs |

### Variants

#### Primary
```tsx
<Card elevation="2" variant="primary">
  <CardHeader>
    <CardTitle>Account Settings</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
</Card>
```
**Use:** Main content cards  
**Color:** Default background, standard border

#### Secondary
```tsx
<Card elevation="1" variant="secondary">
  <CardContent>
    Secondary information
  </CardContent>
</Card>
```
**Use:** Supporting content, sidebars  
**Color:** Elevated background

#### Outline
```tsx
<Card elevation="1" variant="outline">
  <CardContent>
    Outlined content
  </CardContent>
</Card>
```
**Use:** Low-emphasis content  
**Color:** Transparent background, visible border

### Examples

#### Basic Card
```tsx
<Card elevation="2">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description or subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Interactive Card
```tsx
<Card 
  elevation="2" 
  interactive 
  onClick={() => selectPortfolio(portfolio)}
  className={selected ? 'ring-2 ring-primary' : ''}
>
  <CardHeader>
    <CardTitle>{portfolio.name}</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Value: ${portfolio.value}</p>
  </CardContent>
</Card>
```

#### Card List
```tsx
<div className="space-y-2">
  {items.map(item => (
    <Card key={item.id} elevation="1">
      <div className="flex items-center justify-between p-4">
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
        <Badge>{item.status}</Badge>
      </div>
    </Card>
  ))}
</div>
```

#### Card with Image
```tsx
<Card elevation="2">
  <img 
    src={image} 
    alt="Card image"
    className="w-full h-48 object-cover rounded-t-lg"
  />
  <CardHeader>
    <CardTitle>Image Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content below image
  </CardContent>
</Card>
```

### Do's & Don'ts

**DO:**
- ✅ Use `elevation="1"` for base content
- ✅ Use `elevation="2"` for featured content
- ✅ Use `elevation="3"` for modals/overlays only
- ✅ Use `interactive` prop for clickable cards
- ✅ Keep card padding consistent (16px-24px)
- ✅ Combine elevation + variant appropriately

**DON'T:**
- ❌ Mix elevation levels in same context
- ❌ Use elevation-3 for regular content
- ❌ Remove border and shadow for "flat" effect
- ❌ Use cards for layout structure
- ❌ Make cards smaller than 200px width
- ❌ Ignore dark mode colors

---

## Form Component

### Overview
The Form component provides schema validation using React Hook Form + Zod. Use `FormField`, `FormLabel`, and `FormMessage` for complete form structure.

**Location:** `src/components/ui/form.tsx`

### Props & Setup

```typescript
// Define schema with Zod
const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be 8 characters'),
  rememberMe: z.boolean().default(false),
})

// Create form instance
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    email: '',
    password: '',
    rememberMe: false,
  },
})

// Render form with FormField
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel required>Email</FormLabel>
          <FormControl>
            <Input type="email" placeholder="you@example.com" {...field} />
          </FormControl>
          <FormDescription>We'll never share your email</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### Components

#### FormField
```tsx
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      {/* Form item content */}
    </FormItem>
  )}
/>
```
Connects form state to input field. Always use with `render` prop.

#### FormItem
```tsx
<FormItem>
  <FormLabel>Field Label</FormLabel>
  <FormControl>
    <Input {...field} />
  </FormControl>
  <FormMessage />
</FormItem>
```
Container for label, input, and error message.

#### FormLabel
```tsx
<FormLabel required>Email Address</FormLabel>
```
**Props:**
- `required` - Shows red asterisk
- `htmlFor` - Connect to input id

#### FormControl
```tsx
<FormControl>
  <Input type="email" {...field} />
</FormControl>
```
Wrapper for input element. Passes field props.

#### FormDescription
```tsx
<FormDescription>
  We'll never share your email address
</FormDescription>
```
Helper text below input. Optional.

#### FormMessage
```tsx
<FormMessage />
```
Shows validation error messages automatically from schema.

### Examples

#### Complete Login Form
```tsx
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be 8 characters'),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data) => {
    // Handle login
  }

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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full">
          Sign In
        </Button>
      </form>
    </Form>
  )
}
```

#### Multi-Step Form
```tsx
const [step, setStep] = useState(1)

const form = useForm({
  resolver: zodResolver(schema),
})

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {step === 1 && (
        <>
          <FormField name="firstName" render={() => /* ... */} />
          <FormField name="lastName" render={() => /* ... */} />
          <Button onClick={() => setStep(2)}>Next</Button>
        </>
      )}

      {step === 2 && (
        <>
          <FormField name="email" render={() => /* ... */} />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </>
      )}
    </form>
  </Form>
)
```

### Do's & Don'ts

**DO:**
- ✅ Use FormField for each input
- ✅ Always include FormLabel with `required` prop
- ✅ Use FormDescription for helper text
- ✅ Show FormMessage for validation errors
- ✅ Use Zod for schema validation
- ✅ Validate on blur/change, not just submit
- ✅ Disable submit button during submission

**DON'T:**
- ❌ Skip FormLabel (always include)
- ❌ Use placeholder as label alternative
- ❌ Hide FormMessage errors
- ❌ Disable submit button without reason
- ❌ Validate without showing errors
- ❌ Use inline error styles (use FormMessage)
- ❌ Mix validation libraries

---

## Dialog Component

### Overview
The Dialog component is a modal for important information or actions.

**Location:** `src/components/ui/dialog.tsx`

### Examples

#### Confirmation Dialog
```tsx
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button variant="destructive">Delete Account</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Account?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. All your data will be permanently deleted.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Form Dialog
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Add Item</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add New Item</DialogTitle>
    </DialogHeader>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="title" render={() => /* ... */} />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Add</Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>
```

---

## Select Component

### Overview
The Select component is for dropdown selection lists.

**Location:** `src/components/ui/select.tsx`

### Examples

```tsx
<div className="space-y-2">
  <Label htmlFor="status">Status</Label>
  <Select value={status} onValueChange={setStatus}>
    <SelectTrigger id="status">
      <SelectValue placeholder="Select status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="active">Active</SelectItem>
      <SelectItem value="inactive">Inactive</SelectItem>
      <SelectItem value="pending">Pending</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

## Checkbox & Radio Components

### Checkbox

```tsx
<div className="flex items-center space-x-2">
  <Checkbox 
    id="terms" 
    checked={agreed}
    onCheckedChange={setAgreed}
  />
  <Label htmlFor="terms">I agree to terms</Label>
</div>
```

### Radio

```tsx
<RadioGroup value={selected} onValueChange={setSelected}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-1" id="option-1" />
    <Label htmlFor="option-1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-2" id="option-2" />
    <Label htmlFor="option-2">Option 2</Label>
  </div>
</RadioGroup>
```

---

## Badge & Label Components

### Badge

```tsx
<Badge>Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="outline">Draft</Badge>
<Badge variant="destructive">Error</Badge>
```

### Label

```tsx
<Label htmlFor="email">Email Address</Label>
<Label htmlFor="password" required>Password</Label>
```

---

## Alert Component

### Overview
The Alert component shows important information or status messages.

### Examples

```tsx
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Notice</AlertTitle>
  <AlertDescription>
    This is an informational alert message.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Something went wrong. Please try again.
  </AlertDescription>
</Alert>
```

---

## Dropdown Menu

### Overview
The Dropdown Menu component provides context actions.

### Examples

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Copy</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 🎯 Common Patterns

### Login Form Pattern

```tsx
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export function LoginPage() {
  const form = useForm({ resolver: zodResolver(loginSchema) })
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Login logic
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card elevation="2" className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField name="email" render={() => /* ... */} />
            <FormField name="password" render={() => /* ... */} />
            <Button 
              type="submit" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
              loading={isLoading}
            >
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
```

### Empty State Pattern

```tsx
<div className="flex flex-col items-center justify-center py-12">
  <InboxIcon className="w-12 h-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold mb-2">No items yet</h3>
  <p className="text-sm text-muted-foreground mb-6 text-center">
    You haven't created any items yet. Get started by creating your first one.
  </p>
  <Button onClick={handleCreate}>Create Item</Button>
</div>
```

### Data List Pattern

```tsx
<div className="space-y-2">
  {items.map(item => (
    <Card key={item.id} elevation="1" interactive onClick={() => select(item)}>
      <div className="flex items-center justify-between p-4">
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => edit(item)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => delete(item)}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  ))}
</div>
```

### Error Alert Pattern

```tsx
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
)}
```

### Loading State Pattern

```tsx
{isLoading ? (
  <div className="flex justify-center py-8">
    <Loader className="w-6 h-6 animate-spin" />
  </div>
) : (
  <ComponentContent />
)}
```

---

## ✅ Accessibility Checklist

**For Every Component:**
- [ ] Has proper semantic HTML (`<button>`, `<input>`, etc.)
- [ ] Focus visible and logical (Tab order correct)
- [ ] `aria-label` or `aria-labelledby` provided when needed
- [ ] Form labels connected with `htmlFor`
- [ ] Error messages connected with `aria-describedby`
- [ ] Color not the only indicator
- [ ] Contrast ratio 4.5:1 minimum
- [ ] Touch targets 44×44px minimum
- [ ] Keyboard accessible (no mouse-only interactions)
- [ ] Works with screen readers

**For Forms:**
- [ ] Labels visible and required marked with `*`
- [ ] Error messages clear and specific
- [ ] Validation on blur/change, not just submit
- [ ] Required fields marked with `required` prop
- [ ] Help text with `FormDescription`

**For Interactive:**
- [ ] All functionality keyboard accessible
- [ ] Focus rings visible
- [ ] `aria-expanded`, `aria-pressed` when applicable
- [ ] `aria-live` for dynamic updates

---

## 🚫 Component Do's & Don'ts

### General Rules

**DO:**
- ✅ Use components from `shadcn-ui` / design system
- ✅ Use Tailwind classes for styling
- ✅ Use CSS variables for colors
- ✅ Always include labels for inputs
- ✅ Provide aria-labels for icon buttons
- ✅ Test at 320px, 768px, 1024px breakpoints
- ✅ Respect `prefers-reduced-motion`

**DON'T:**
- ❌ Hardcode colors (use CSS variables)
- ❌ Use inline styles for sizing/spacing
- ❌ Skip labels for inputs
- ❌ Remove focus rings for "aesthetic" reasons
- ❌ Use `<button>` for navigation (use `<Link>`)
- ❌ Mix component libraries
- ❌ Create custom components when design system has one

---

**Last Updated:** December 12, 2025  
**Version:** 1.0  
**Status:** Complete
