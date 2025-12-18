# Component Quick Reference

**Quick lookup guide for common component usage patterns.**

---

## 🔘 Button

```tsx
// Basic
<Button>Default</Button>

// Variants
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>

// Sizes
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
<Button size="icon"><Plus /></Button>

// Icon Button (always add aria-label)
<Button size="icon" aria-label="Close">
  <X className="w-4 h-4" />
</Button>

// Loading
<Button disabled variant="loading">
  <Loader className="mr-2 animate-spin" />
  Processing...
</Button>

// Link-styled button
<Button variant="link">Click here</Button>

// Touch-friendly (mobile)
<Button size="lg" className="w-full">
  Mobile Button
</Button>
```

---

## ⌨️ Input

```tsx
// Basic
<Input placeholder="Enter text" />

// With label (recommended)
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="user@example.com" />
</div>

// With error
<Input
  type="text"
  aria-invalid={!!error}
  aria-errormessage="field-error"
  className={error ? 'border-red-500' : ''}
/>
{error && <p id="field-error" className="text-sm text-red-500">{error}</p>}

// Email (with mobile keyboard)
<Input type="email" keyboardType="email" />

// Phone (with mobile keyboard)
<Input type="tel" keyboardType="tel" />

// Number (with numeric keyboard)
<Input type="number" keyboardType="numeric" />

// Mobile optimized (44px minimum height)
<Input mobileOptimized size="mobile" />

// Password
<Input type="password" placeholder="••••••••" />

// Disabled
<Input disabled />

// Read-only
<Input readOnly value="Cannot edit" />

// With description
<div className="space-y-2">
  <Input type="password" />
  <p className="text-sm text-gray-500">
    Min 8 characters, 1 uppercase, 1 number
  </p>
</div>
```

---

## 🎴 Card

```tsx
// Basic
<Card>
  <CardContent>Content</CardContent>
</Card>

// With header
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// With footer
<Card>
  <CardHeader>
    <CardTitle>Actions</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>
    <Button>Save</Button>
    <Button variant="ghost">Cancel</Button>
  </CardFooter>
</Card>

// Elevation levels
<Card elevation="1">Base level</Card>      {/* Subtle shadow */}
<Card elevation="2">Featured</Card>        {/* Medium shadow */}
<Card elevation="3">Modal</Card>           {/* Large shadow */}

// Variants (background colors)
<Card variant="primary">Main content</Card>     {/* White/dark */}
<Card variant="secondary">Supporting</Card>    {/* Blue tint */}
<Card variant="tertiary">Background</Card>     {/* Gray tint */}

// Interactive (clickable)
<Card
  interactive
  onClick={() => navigate(`/item/${id}`)}
  role="button"
  tabIndex={0}
>
  <CardContent>Click me</CardContent>
</Card>

// Compact padding
<Card>
  <CardCompact>Reduced padding</CardCompact>
</Card>

// Disabled state
<Card className="opacity-60 pointer-events-none">
  <CardContent>Disabled</CardContent>
</Card>
```

---

## 📋 Form

```tsx
// Setup
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' },
})

// Basic form
<Form {...form}>
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
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>

// With description
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
        Min 8 chars, 1 uppercase, 1 number
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

// Error handling
async function onSubmit(values) {
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(values),
    })
    if (!response.ok) throw new Error('Failed')
    toast.success('Success!')
    form.reset()
  } catch (error) {
    toast.error('Failed to submit')
  }
}

// Custom validation
const schema = z.object({
  password: z.string().min(8, 'Too short'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
```

---

## 🏷️ Label

```tsx
// Basic
<Label htmlFor="input-id">Label text</Label>
<Input id="input-id" />

// Standalone
<Label>Checkbox Label</Label>

// With required indicator
<Label htmlFor="email">
  Email
  <span className="text-red-500 ml-1">*</span>
</Label>
```

---

## 🔍 More Components

### Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm</DialogTitle>
    </DialogHeader>
    <p>Are you sure?</p>
  </DialogContent>
</Dialog>;
```

### Alert

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>;
```

### Badge

```tsx
import { Badge } from '@/components/ui/badge'

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### Checkbox

```tsx
import { Checkbox } from "@/components/ui/checkbox";

<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">I agree to terms</Label>
</div>;
```

---

## ✨ Common Patterns

### Login Form

```tsx
const LoginForm = () => {
  const schema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Too short"),
  });

  const form = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values: z.infer<typeof schema>) {
    const response = await login(values);
    if (response.ok) {
      navigate("/dashboard");
    }
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
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
    </Form>
  );
};
```

### Item List with Selection

```tsx
const ItemList = ({ items }: { items: Item[] }) => {
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Card
          key={item.id}
          interactive
          elevation="1"
          onClick={() => setSelected(item.id)}
          className={selected === item.id ? "ring-2 ring-primary" : ""}
        >
          <div className="p-4">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};
```

### Error State

```tsx
<Card elevation="1" className="border-l-4 border-red-500">
  <CardHeader>
    <CardTitle className="text-red-600">Error</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm">Something went wrong. Please try again.</p>
  </CardContent>
  <CardFooter>
    <Button onClick={handleRetry}>Retry</Button>
  </CardFooter>
</Card>
```

### Loading State

```tsx
const [isLoading, setIsLoading] = React.useState(false)

<Button
  disabled={isLoading}
  variant={isLoading ? "loading" : "default"}
  onClick={async () => {
    setIsLoading(true)
    await doSomething()
    setIsLoading(false)
  }}
>
  {isLoading ? (
    <>
      <Loader className="mr-2 w-4 h-4 animate-spin" />
      Loading...
    </>
  ) : (
    'Click me'
  )}
</Button>
```

---

## 🎯 Size Reference

### Touch Targets (Mobile)

- Minimum: 44×44px
- Gap between: 8px
- Use `size="lg"` or `mobileOptimized` prop

### Button Heights

- xs: 32px
- sm: 40px
- default: 48px ✅ Touch-friendly
- lg: 56px ✅ Touch-friendly
- xl: 64px ✅ Touch-friendly

### Input Heights

- sm: 36px
- default: 40px
- lg: 44px ✅ Touch-friendly
- mobile: 44px ✅ Touch-friendly

### Card Padding

- Header: 24px
- Content: 24px
- Footer: 24px
- Compact: 16px

---

## 🌙 Dark Mode

All components automatically support dark mode.

```tsx
// Light mode (default)
<Button>Default</Button>

// Dark mode (automatic)
// Add "dark" class to html element
// <html class="dark">

// Works automatically in both modes
// No CSS changes needed!
```

---

## 📱 Mobile Optimization

```tsx
// For mobile forms
<Input
  mobileOptimized        // 44px height
  keyboardType="email"   // Proper keyboard
  size="lg"              // Larger touch target
/>

// For mobile buttons
<Button size="lg" className="w-full">  // Full width
  Mobile Button
</Button>

// Responsive button gap
<div className="flex gap-2">   {/* 8px minimum */}
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</div>
```

---

## ⚠️ Common Mistakes to Avoid

```tsx
// ❌ Don't: Use placeholder as label
<Input placeholder="Email" />

// ✅ Do: Use separate label
<div className="space-y-2">
  <Label>Email</Label>
  <Input placeholder="you@example.com" />
</div>

// ❌ Don't: Forget aria-label on icon button
<Button size="icon"><X /></Button>

// ✅ Do: Add aria-label
<Button size="icon" aria-label="Close"><X /></Button>

// ❌ Don't: Use inline styles
<Button style={{ backgroundColor: '#FF0000' }}>Delete</Button>

// ✅ Do: Use Tailwind classes
<Button variant="destructive">Delete</Button>

// ❌ Don't: Remove focus rings
<Button className="focus:ring-0">Button</Button>

// ✅ Do: Keep focus visible
<Button>Button</Button>

// ❌ Don't: Skip error messages
<Input error={error} />

// ✅ Do: Display error clearly
<Input error={error} />
{error && <p className="text-sm text-red-500">{error}</p>}
```

---

## 🔗 More Information

- **Full Documentation**: See `DESIGN_SYSTEM.md`
- **Detailed Specs**: See `COMPONENT_SPECIFICATIONS.md`
- **Contributing**: See `CONTRIBUTING_DESIGN_SYSTEM.md`
- **Quality Standards**: See `QUALITY_GATES.md`

---

**Last Updated**: December 2024  
**Version**: 1.0
