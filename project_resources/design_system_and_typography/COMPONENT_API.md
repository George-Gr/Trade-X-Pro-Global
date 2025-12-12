# Component API Reference

**Version:** 1.0  
**Last Updated:** December 13, 2025  
**Status:** ✅ Complete

---

## 📋 Table of Contents

1. [Dialog Component](#dialog-component)
2. [Alert Component](#alert-component)
3. [Badge Component](#badge-component)
4. [Button Component](#button-component)
5. [Card Component](#card-component)
6. [Form Components](#form-components)

---

## 🪟 Dialog Component

### Overview
Modal dialogs for important user interactions, confirmations, and focused content.

### Props

| Prop | Type | Default | Description | Required |
|------|------|---------|-------------|----------|
| `open` | `boolean` | `false` | Controls dialog visibility | ✅ Yes |
| `onOpenChange` | `(open: boolean) => void` | — | Callback when dialog state changes | ✅ Yes |
| `title` | `string` | — | Dialog title text | ✅ Yes |
| `description` | `string` | — | Dialog description/subtitle | No |
| `children` | `ReactNode` | — | Dialog content | ✅ Yes |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Dialog width size | No |
| `className` | `string` | — | Additional CSS classes | No |
| `closeButton` | `boolean` | `true` | Show close (X) button | No |
| `escapeToClose` | `boolean` | `true` | Close on Escape key | No |
| `backdropClose` | `boolean` | `false` | Close when clicking backdrop | No |

### Size Options

| Size | Width | Use Case |
|------|-------|----------|
| `sm` | 400px | Simple confirmations |
| `md` | 600px | Forms, detailed content |
| `lg` | 800px | Complex forms, media |

### Example

```tsx
import { Dialog } from '@/components/ui/dialog';

function DeleteConfirmation() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete Account
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Confirm Account Deletion</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete your account? This includes:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>All trading history and positions</li>
              <li>Portfolio data and preferences</li>
              <li>Connected account information</li>
            </ul>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                // Handle deletion
                setOpen(false);
              }}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Accessibility Features

- ✅ **Focus Trap:** Tab cycles within dialog
- ✅ **Escape Key:** Closes dialog (configurable)
- ✅ **Screen Reader:** Title properly announced
- ✅ **Backdrop:** Prevents interaction with background
- ✅ **ARIA Roles:** `role="dialog"` with `aria-modal="true"`

### Animation

- **Entrance:** Fade + scale (200ms, ease-out)
- **Backdrop:** Fade (200ms, ease-out)
- **Exit:** Reverse entrance animation
- **Reduced Motion:** Respects `prefers-reduced-motion`

### Styling

```tsx
// Custom styling
<DialogContent 
  size="lg" 
  className="bg-gradient-to-br from-primary/10 to-primary-glow/5"
>
  {/* Content */}
</DialogContent>
```

### Best Practices

1. **Use Cases:**
   - ✅ Confirmations (delete, dangerous actions)
   - ✅ Important notifications
   - ✅ Focused forms
   - ✅ Critical user decisions

2. **Avoid:**
   - ❌ Multiple dialogs open simultaneously
   - ❌ Non-essential information
   - ❌ Long forms that could be pages
   - ❌ Blocking user flow unnecessarily

3. **Content Guidelines:**
   - Clear, descriptive titles
   - Concise descriptions
   - Primary action button on the right
   - Destructive actions use `variant="destructive"`

---

## ⚠️ Alert Component

### Overview
Contextual feedback messages for user actions with automatic or manual dismissal.

### Props

| Prop | Type | Default | Description | Required |
|------|------|---------|-------------|----------|
| `variant` | `'default' \| 'success' \| 'warning' \| 'destructive'` | `'default'` | Alert style and semantics | No |
| `title` | `string` | — | Alert title | ✅ Yes |
| `message` | `string` | — | Alert message content | ✅ Yes |
| `icon` | `ReactNode` | auto | Custom icon (or `null` to hide) | No |
| `dismissible` | `boolean` | `false` | Show close button | No |
| `onDismiss` | `() => void` | — | Called when dismissed | No |
| `duration` | `number` | `0` | Auto-dismiss after ms (0 = manual only) | No |
| `className` | `string` | — | Additional CSS classes | No |

### Variant Options

| Variant | Color | Use Case |
|---------|-------|----------|
| `default` | Blue | Informational messages |
| `success` | Green | Actions completed successfully |
| `warning` | Amber | Potential issues, warnings |
| `destructive` | Red | Errors, critical issues |

### Example

```tsx
import { Alert } from '@/components/ui/alert';

function TradingAlerts() {
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    variant: 'success' | 'warning' | 'destructive';
    title: string;
    message: string;
  }>>([]);

  const addAlert = (alert: typeof alerts[0]) => {
    setAlerts(prev => [...prev, alert]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Success Alert */}
      <Alert
        variant="success"
        title="Position Opened Successfully"
        message="Your long position in BTC/USD has been opened at $45,000"
        dismissible
        onDismiss={() => removeAlert('success-1')}
      />

      {/* Warning Alert */}
      <Alert
        variant="warning"
        title="Margin Warning"
        message="Your margin level is approaching the maintenance threshold"
        duration={5000}
      />

      {/* Destructive Alert */}
      <Alert
        variant="destructive"
        title="Connection Lost"
        message="Reconnecting to the trading server..."
        icon={<AlertTriangle className="h-5 w-5" />}
        dismissible={false}
      />

      {/* Custom Alert */}
      <Alert
        variant="default"
        title="Market Update"
        message="Gold prices have increased by 2.5% in the last hour"
        icon={<TrendingUp className="h-5 w-5" />}
        dismissible
      />
    </div>
  );
}
```

### Accessibility Features

- ✅ **ARIA Live Regions:** Automatic announcements
- ✅ **Role:** `alert` for important messages
- ✅ **Focus Management:** Dismissible alerts accessible via keyboard
- ✅ **Color Independence:** Icons and text provide context
- ✅ **Screen Reader:** Clear, descriptive messages

### Animation

- **Entrance:** Slide down + fade (150ms)
- **Exit:** Slide up + fade (150ms)
- **Auto-dismiss:** Smooth transition before removal
- **Reduced Motion:** Respects `prefers-reduced-motion`

### Styling

```tsx
// Custom styling
<Alert
  variant="success"
  title="Custom Alert"
  message="This alert has custom styling"
  className="border-l-4 border-l-success"
/>
```

### Best Practices

1. **Placement:**
   - Top of relevant sections
   - Above the fold for critical alerts
   - Near related content

2. **Timing:**
   - Success: 3-5 seconds auto-dismiss
   - Warning: 5-7 seconds auto-dismiss
   - Error: Manual dismissal only
   - Info: 3-5 seconds auto-dismiss

3. **Content:**
   - Clear, actionable titles
   - Specific, helpful messages
   - Appropriate variant selection
   - Avoid technical jargon

4. **Accessibility:**
   - Use `role="alert"` for critical messages
   - Provide clear dismissal methods
   - Ensure sufficient color contrast
   - Support keyboard navigation

---

## 🏷️ Badge Component

### Overview
Status indicators, labels, and small pieces of information with various styling options.

### Props

| Prop | Type | Default | Description | Required |
|------|------|---------|-------------|----------|
| `variant` | `'default' \| 'secondary' \| 'outline' \| 'destructive'` | `'default'` | Badge style | No |
| `size` | `'sm' \| 'default'` | `'default'` | Badge size | No |
| `interactive` | `boolean` | `false` | Clickable badge | No |
| `onClick` | `() => void` | — | Click handler (if interactive) | No |
| `className` | `string` | — | Additional CSS classes | No |
| `children` | `ReactNode` | — | Badge content | ✅ Yes |

### Variant Options

| Variant | Description | Use Case |
|---------|-------------|----------|
| `default` | Primary brand colors | Status indicators |
| `secondary` | Subtle, muted colors | Secondary information |
| `outline` | Border-focused design | Tags, categories |
| `destructive` | Red/error colors | Error states, warnings |

### Size Options

| Size | Height | Font Size | Use Case |
|------|--------|-----------|----------|
| `sm` | 20px | 11px | Compact spaces |
| `default` | 24px | 12px | Standard usage |

### Example

```tsx
import { Badge } from '@/components/ui/badge';

function TradingBadges() {
  return (
    <div className="space-y-4">
      {/* Status Badges */}
      <div className="flex gap-2">
        <Badge variant="success">Active</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="destructive">Closed</Badge>
      </div>

      {/* Interactive Badges */}
      <div className="flex gap-2">
        <Badge 
          variant="outline" 
          interactive 
          onClick={() => console.log('Filter applied')}
        >
          Filter: BTC
        </Badge>
        
        <Badge 
          variant="secondary" 
          interactive 
          onClick={() => console.log('Tag clicked')}
        >
          #Cryptocurrency
        </Badge>
      </div>

      {/* Size Variants */}
      <div className="flex gap-2">
        <Badge size="sm">Small</Badge>
        <Badge>Default</Badge>
        <Badge size="lg">Large</Badge>
      </div>

      {/* Custom Content */}
      <div className="flex gap-2">
        <Badge variant="default">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Up 2.5%
          </span>
        </Badge>
        
        <Badge variant="outline">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            2h ago
          </span>
        </Badge>
      </div>
    </div>
  );
}
```

### Accessibility Features

- ✅ **Keyboard Navigation:** Interactive badges focusable
- ✅ **Screen Reader:** Clear content description
- ✅ **Color Contrast:** WCAG AA compliant
- ✅ **Focus Indicators:** Visible focus states
- ✅ **Semantic HTML:** Proper button/link usage

### Animation

- **Hover:** Scale + shadow (150ms)
- **Active:** Press effect (100ms)
- **Focus:** Outline glow (200ms)
- **Reduced Motion:** Respects `prefers-reduced-motion`

### Styling

```tsx
// Custom styling
<Badge 
  variant="default"
  className="bg-gradient-to-r from-primary to-primary/80"
>
  Custom Badge
</Badge>
```

### Best Practices

1. **Interactive Usage:**
   - Use semantic `<button>` or `<a>` elements
   - Provide clear click targets (minimum 44×44px)
   - Add appropriate ARIA labels if needed
   - Handle keyboard events (Enter/Space)

2. **Content Guidelines:**
   - Keep text concise (1-3 words ideal)
   - Use clear, descriptive labels
   - Avoid wrapping long text
   - Consider icon + text combinations

3. **Visual Hierarchy:**
   - Use variants to indicate importance
   - Size badges appropriately for context
   - Maintain consistent spacing
   - Group related badges

4. **Accessibility:**
   - Ensure sufficient color contrast
   - Don't rely solely on color
   - Provide focus indicators
   - Test with screen readers

---

## 🎯 Button Component

### Overview
Interactive buttons with multiple sizes, variants, and states for all user actions.

### Props

| Prop | Type | Default | Description | Required |
|------|------|---------|-------------|----------|
| `variant` | `'default' \| 'secondary' \| 'outline' \| 'ghost' \| 'destructive'` | `'default'` | Button style | No |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Button height | No |
| `disabled` | `boolean` | `false` | Disable button | No |
| `loading` | `boolean` | `false` | Show loading spinner | No |
| `fullWidth` | `boolean` | `false` | Full width button | No |
| `className` | `string` | — | Additional CSS classes | No |
| `onClick` | `() => void` | — | Click handler | ✅ Yes (unless disabled) |
| `children` | `ReactNode` | — | Button content | ✅ Yes |

### Size Options

| Size | Height | Padding | Font Size | Use Case |
|------|--------|---------|-----------|----------|
| `xs` | 32px | 8px 12px | 12px | Compact interfaces |
| `sm` | 40px | 12px 16px | 13px | Secondary actions |
| `md` | 48px | 16px 20px | 14px | Primary actions (default) |
| `lg` | 56px | 20px 24px | 16px | Prominent CTAs |
| `xl` | 64px | 24px 32px | 18px | Hero sections |

### Variant Options

| Variant | Description | Use Case |
|---------|-------------|----------|
| `default` | Primary brand styling | Main CTAs |
| `secondary` | Subtle, less prominent | Secondary actions |
| `outline` | Border-focused | Alternative styling |
| `ghost` | Minimal styling | Toolbar actions |
| `destructive` | Red/error styling | Dangerous actions |

### Example

```tsx
import { Button } from '@/components/ui/button';

function TradingButtons() {
  return (
    <div className="space-y-4">
      {/* Size Variants */}
      <div className="flex gap-2">
        <Button size="xs">Extra Small</Button>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button size="xl">Extra Large</Button>
      </div>

      {/* Variant Buttons */}
      <div className="flex gap-2">
        <Button variant="default">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Delete</Button>
      </div>

      {/* States */}
      <div className="flex gap-2">
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
        <Button fullWidth>Full Width</Button>
      </div>

      {/* Custom Button */}
      <Button
        variant="default"
        size="lg"
        onClick={() => console.log('Trade executed')}
        className="bg-gradient-to-r from-primary to-primary/80"
      >
        <span className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Execute Trade
        </span>
      </Button>
    </div>
  );
}
```

### Accessibility Features

- ✅ **Keyboard Navigation:** Full keyboard support
- ✅ **Screen Reader:** Clear button labels
- ✅ **Focus Management:** Visible focus indicators
- ✅ **Loading States:** ARIA busy attributes
- ✅ **Disabled States:** ARIA disabled attributes

### Animation

- **Hover:** Scale + shadow (150ms)
- **Active:** Press effect (100ms)
- **Focus:** Outline glow (200ms)
- **Loading:** Spinner rotation (1s infinite)
- **Reduced Motion:** Respects `prefers-reduced-motion`

### Best Practices

1. **Hierarchy:**
   - Primary action: `variant="default"`, `size="md"`
   - Secondary: `variant="secondary"` or `outline`
   - Destructive: `variant="destructive"` for dangerous actions

2. **Content:**
   - Clear, action-oriented text
   - Use icons for clarity
   - Avoid generic "Click Here"
   - Match button text to action

3. **Accessibility:**
   - Minimum 44×44px touch targets
   - Sufficient color contrast
   - Clear loading/disabled states
   - Keyboard navigation support

4. **Performance:**
   - Use `loading` state during async operations
   - Disable during processing
   - Provide clear feedback

---

## 🃏 Card Component

### Overview
Flexible container component for grouping related content with elevation and styling options.

### Props

| Prop | Type | Default | Description | Required |
|------|------|---------|-------------|----------|
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Card styling variant | No |
| `elevation` | `1 \| 2 \| 3` | `1` | Shadow/elevation level | No |
| `interactive` | `boolean` | `false` | Clickable card | No |
| `onClick` | `() => void` | — | Click handler | No |
| `className` | `string` | — | Additional CSS classes | No |
| `children` | `ReactNode` | — | Card content | ✅ Yes |

### Elevation Options

| Level | Shadow | Use Case |
|-------|--------|----------|
| `1` | Subtle | Base content, grouped information |
| `2` | Medium | Featured content, sections |
| `3` | Strong | Modals, overlays, floating elements |

### Variant Options

| Variant | Description | Use Case |
|---------|-------------|----------|
| `primary` | Standard card styling | Main content areas |
| `secondary` | Subtle, muted styling | Supporting content |

### Example

```tsx
import { Card } from '@/components/ui/card';

function DashboardCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Primary Card */}
      <Card variant="primary" elevation={1}>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
          <CardDescription>Total value and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-2xl font-bold">$45,234.50</div>
            <div className="text-sm text-success">+2.5% (24h)</div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">View Details</Button>
        </CardFooter>
      </Card>

      {/* Interactive Card */}
      <Card 
        variant="secondary" 
        elevation={2}
        interactive
        onClick={() => console.log('Card clicked')}
      >
        <CardHeader>
          <CardTitle>Market News</CardTitle>
          <CardDescription>Latest updates</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Stay updated with the latest market trends and news that could impact your portfolio.
          </p>
        </CardContent>
      </Card>

      {/* High Elevation Card */}
      <Card variant="primary" elevation={3}>
        <CardHeader>
          <CardTitle>Premium Features</CardTitle>
          <CardDescription>Unlock advanced tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Badge variant="success">Pro</Badge>
            <p className="text-sm">Access to premium trading tools and analytics.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Upgrade Plan</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

### Accessibility Features

- ✅ **Keyboard Navigation:** Interactive cards focusable
- ✅ **Screen Reader:** Clear content structure
- ✅ **Focus Management:** Visible focus states
- ✅ **Semantic HTML:** Proper heading hierarchy
- ✅ **Color Contrast:** WCAG AA compliant

### Animation

- **Hover:** Lift + scale (200ms)
- **Interactive:** Ripple effect (300ms)
- **Focus:** Outline glow (200ms)
- **Reduced Motion:** Respects `prefers-reduced-motion`

### Best Practices

1. **Content Structure:**
   - Use `CardHeader`, `CardContent`, `CardFooter`
   - Maintain heading hierarchy (H2, H3, etc.)
   - Group related information
   - Provide clear CTAs

2. **Elevation Usage:**
   - Level 1: Base content cards
   - Level 2: Featured/important content
   - Level 3: Modals, overlays, floating elements
   - Avoid excessive elevation

3. **Interactive Cards:**
   - Use semantic `<button>` or `<a>` elements
   - Provide clear click targets
   - Add appropriate ARIA labels
   - Handle keyboard events

4. **Visual Consistency:**
   - Maintain consistent padding
   - Use appropriate spacing
   - Group related cards
   - Consider grid layouts

---

## 📝 Form Components

### Overview
Comprehensive form components with validation, accessibility, and responsive design.

### FormField Props

| Prop | Type | Default | Description | Required |
|------|------|---------|-------------|----------|
| `label` | `string` | — | Field label | ✅ Yes |
| `required` | `boolean` | `false` | Mark as required | No |
| `error` | `string` | — | Error message | No |
| `helpText` | `string` | — | Helper text | No |
| `className` | `string` | — | Additional CSS classes | No |
| `children` | `ReactNode` | — | Field content | ✅ Yes |

### Input Props

| Prop | Type | Default | Description | Required |
|------|------|---------|-------------|----------|
| `type` | `string` | `'text'` | Input type | No |
| `placeholder` | `string` | — | Placeholder text | No |
| `disabled` | `boolean` | `false` | Disable input | No |
| `error` | `boolean` | `false` | Error state | No |
| `className` | `string` | — | Additional CSS classes | No |
| `onChange` | `(value: string) => void` | — | Change handler | No |

### Example

```tsx
import { FormField, Input, Select, Textarea } from '@/components/ui/form';

function TradingForm() {
  return (
    <form className="space-y-4">
      <FormField
        label="Email Address"
        required
        helpText="We'll never share your email"
        error="Please enter a valid email address"
      >
        <Input
          type="email"
          placeholder="your@email.com"
          onChange={(e) => console.log(e.target.value)}
        />
      </FormField>

      <FormField
        label="Account Type"
        required
      >
        <Select
          options={[
            { value: 'demo', label: 'Demo Account' },
            { value: 'live', label: 'Live Account' },
          ]}
          onChange={(value) => console.log(value)}
        />
      </FormField>

      <FormField
        label="Additional Notes"
        helpText="Any special requirements or questions"
      >
        <Textarea
          placeholder="Tell us more about your needs..."
          rows={4}
          onChange={(e) => console.log(e.target.value)}
        />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit">Submit</Button>
        <Button variant="outline" type="reset">Reset</Button>
      </div>
    </form>
  );
}
```

### Accessibility Features

- ✅ **Labels:** Proper label associations
- ✅ **Error States:** ARIA live regions
- ✅ **Required Fields:** ARIA required attributes
- ✅ **Focus Management:** Logical tab order
- ✅ **Screen Reader:** Clear announcements

### Validation

- **Real-time:** Validation on blur/change
- **Visual:** Clear error states
- **Accessible:** Screen reader announcements
- **User-friendly:** Helpful error messages

### Best Practices

1. **Labeling:**
   - Always provide labels
   - Use `placeholder` for hints only
   - Mark required fields clearly
   - Provide helpful descriptions

2. **Error Handling:**
   - Show errors after user interaction
   - Provide specific, actionable messages
   - Use visual and text indicators
   - Support keyboard navigation

3. **Accessibility:**
   - Use semantic form elements
   - Provide ARIA attributes
   - Support keyboard navigation
   - Test with screen readers

4. **User Experience:**
   - Clear visual hierarchy
   - Consistent styling
   - Helpful error messages
   - Smooth interactions

---

## 📚 Component Usage Guidelines

### Import Patterns

```tsx
// Named imports (recommended)
import { Button, Card, Dialog } from '@/components/ui';

// Or individual imports
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import Dialog from '@/components/ui/dialog';
```

### Styling Customization

```tsx
// Using className prop
<Button className="bg-gradient-to-r from-primary to-primary/80">
  Custom Button
</Button>

// Using Tailwind utilities
<Card className="border-2 border-dashed border-border">
  Dashed border card
</Card>
```

### Responsive Design

```tsx
// Responsive sizing
<Button size={{ base: 'md', sm: 'lg', md: 'xl' }}>
  Responsive Button
</Button>

// Responsive layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Content</Card>
  <Card>Content</Card>
  <Card>Content</Card>
</div>
```

### Accessibility Testing

```tsx
// Test with screen readers
// Test keyboard navigation
// Verify color contrast
// Check focus indicators
// Test error announcements
```

### Performance Considerations

- Use memoization for expensive calculations
- Debounce input handlers
- Lazy load heavy components
- Optimize image assets
- Minimize re-renders

---

## 🚀 Getting Started

1. **Import Components:**
   ```tsx
   import { Button, Card, Dialog } from '@/components/ui';
   ```

2. **Use in Your Components:**
   ```tsx
   function MyComponent() {
     return (
       <Card>
         <CardHeader>
           <CardTitle>My Card</CardTitle>
         </CardHeader>
         <CardContent>
           <Button>Click me</Button>
         </CardContent>
       </Card>
     );
   }
   ```

3. **Customize as Needed:**
   ```tsx
   <Card className="custom-styles">
     <Button variant="secondary" size="lg">
       Custom Button
     </Button>
   </Card>
   ```

---

## 📞 Support

For questions, issues, or feature requests:

- **Documentation:** [DESIGN_SYSTEM.md](../design_system_and_typography/DESIGN_SYSTEM.md)
- **Quality Gates:** [QUALITY_GATES.md](../design_system_and_typography/QUALITY_GATES.md)
- **GitHub Issues:** Report bugs and request features
- **Team Chat:** Reach out for design system questions

---

**Last Updated:** December 13, 2025  
**Version:** 1.0  
**Maintainer:** Frontend Architecture Team