# 🎬 Micro-Interactions Quick Reference

**Phase 4 Enhancement System**

---

## 📋 Quick Navigation

- [Animations](#animations)
- [Transitions](#transitions)
- [Interactions](#interactions)
- [Responsive Feedback](#responsive-feedback)
- [Accessibility](#accessibility)

---

## 🎬 Animations

### Ripple Effect

```html
<button class="ripple-container">
  <span class="ripple"></span>
  Click me
</button>
```

### Spin Animation

```html
<div class="animate-spin">
  <svg class="icon-md"></svg>
</div>
```

### Pulse Animation

```html
<div class="animate-pulse">Loading...</div>
```

### Shimmer (Skeleton Loading)

```html
<div class="animate-shimmer h-12 rounded-md"></div>
```

### Staggered List

```html
<ul>
  <li class="list-item">Item 1</li>
  <li class="list-item">Item 2</li>
  <li class="list-item">Item 3</li>
</ul>
```

**Each item fades in with 50ms stagger**

### Bounce Animation

```html
<div class="scale-bounce">Bouncing content</div>
```

---

## 🔄 Transitions

### Slide In (Left)

```html
<div class="slide-in-left">Sliding in from left</div>
```

Options:

- `.slide-in-left` - From left (200ms)
- `.slide-in-right` - From right (200ms)
- `.slide-in-up` - From bottom (200ms)

### Fade In

```html
<div class="fade-in">Fading in</div>
```

### Scale In

```html
<div class="scale-in">Scaling in from 95%</div>
```

### Dropdown Open/Close

```html
<!-- Opening -->
<div class="dropdown-open">Dropdown content</div>

<!-- Closing -->
<div class="dropdown-close">Dropdown content</div>
```

### Modal Animation

```html
<div class="modal-appear">Modal content</div>

<div class="backdrop-fade">Backdrop</div>
```

### Toast Notification

```html
<!-- Entering -->
<div class="toast-enter">Notification</div>

<!-- Exiting -->
<div class="toast-exit">Notification</div>
```

---

## 🖱️ Interactions

### Button Interactive

```html
<button class="button-interactive">Interactive Button</button>
```

**Features:**

- Hover: Lift effect + shadow
- Active: Press effect
- Smooth transitions

### Button Pulse (CTA Emphasis)

```html
<button class="button-pulse">Place Trade</button>
```

**Features:**

- Continuous pulse animation
- Draws attention to important CTAs
- 2s infinite animation

### Card Elevation

```html
<div class="card-elevation-transition card-hoverable">
  Elevated card content
</div>
```

**Features:**

- Hover: Lift + shadow increase
- Active: Press effect
- Smooth transitions

### Input Interaction

```html
<input class="input-interactive" type="text" />
```

**Features:**

- Hover: Background + border change
- Focus: Shadow ring
- Smooth transitions

---

## 📱 Responsive Feedback

### Touch-Aware Button

```html
<button class="button-hover-effect">Touch or Click</button>
```

**Behavior:**

- Desktop (hover capable): Hover effect
- Mobile (touch only): Press effect

### Gesture-Aware Hover

```html
<div class="button-hover-effect">Hover on desktop, tap on mobile</div>
```

Automatically adapts based on device capabilities.

---

## ♿ Accessibility

### Icon Animations

```html
<!-- Rotating icon -->
<svg class="icon-rotate">
  <use href="#icon" />
</svg>

<!-- Bouncing icon -->
<svg class="icon-bounce">
  <use href="#icon" />
</svg>
```

### Checkbox Toggle

```html
<input type="checkbox" class="checkbox-toggle" />
```

**Features:**

- Smooth color transition on check
- Accessible state change
- Clear visual feedback

### Reduced Motion

All animations automatically disable when user has:

```css
@media (prefers-reduced-motion: reduce);
```

No special code needed - it's automatic!

---

## ⏱️ Timing System

### Duration Variables

```css
--duration-instant: 0ms; /* No delay */
--duration-fast: 150ms; /* Quick feedback */
--duration-normal: 200ms; /* Standard transitions */
--duration-slow: 300ms; /* Gradual animations */
--duration-slower: 500ms; /* Slow animations */
```

### Easing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1); /* Accelerating */
--ease-out: cubic-bezier(0, 0, 0.2, 1); /* Decelerating */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1); /* Both */
--ease-bounce: cubic-bezier(0.68, -0.55, ...); /* Bouncy */
```

### Transition Variables

```css
--transition-instant: all 0ms ease-out;
--transition-fast: all 150ms ease-out;
--transition-normal: all 200ms ease-out;
--transition-slow: all 300ms ease-in-out;
```

---

## 💡 Usage Examples

### Login Form with Loading

```html
<form class="space-y-4">
  <input class="input-interactive" type="email" />
  <input class="input-interactive" type="password" />

  <button class="button-interactive w-full" disabled="{isLoading}">
    {isLoading ? (
    <span class="animate-spin">●</span>
    ) : ( 'Sign In' )}
  </button>
</form>
```

### Trading Order Card

```html
<div class="card-elevation-transition card-hoverable">
  <div class="slide-in-up">
    <h3>Order #12345</h3>
    <p>Status: <span class="animate-pulse">Processing</span></p>
  </div>

  <div class="flex gap-2">
    <button class="button-interactive">Edit</button>
    <button class="button-interactive">Cancel</button>
  </div>
</div>
```

### Notification Stack

```html
<div class="space-y-2">
  <div class="toast-enter">✓ Order placed successfully</div>
  <div class="toast-enter" style="animation-delay: 100ms">
    📊 Portfolio updated
  </div>
</div>
```

### Dropdown Menu

```html
<div class="dropdown-open">
  <div class="list-item">Option 1</div>
  <div class="list-item">Option 2</div>
  <div class="list-item">Option 3</div>
</div>
```

### Modal Dialog

```html
<div class="backdrop-fade" />
<div class="modal-appear" role="dialog">
  <h2>Confirm Action</h2>
  <p>Are you sure?</p>
  <div class="flex gap-2">
    <button class="button-interactive">Cancel</button>
    <button class="button-pulse">Confirm</button>
  </div>
</div>
```

---

## 🎯 Best Practices

### 1. Use Appropriate Timing

```html
<!-- ✅ Good: Quick feedback for user actions -->
<button class="transition-fast">Click me</button>

<!-- ✅ Good: Slower for attention-drawing animations -->
<div class="button-pulse">Important CTA</div>

<!-- ❌ Bad: Too slow for interactive feedback -->
<button style="transition: all 500ms">Slow button</button>
```

### 2. Respect User Preferences

All animations automatically respect `prefers-reduced-motion`. No additional code needed!

```css
/* Automatic - no setup required */
@media (prefers-reduced-motion: reduce) {
  /* Animations disabled */
}
```

### 3. Combine with Tailwind

```html
<!-- ✅ Good: Mix Tailwind with animation classes -->
<div class="fade-in p-4 rounded-lg bg-primary/10">Content</div>

<!-- ❌ Bad: Hard to scan -->
<div class="fade-in" style="padding: 16px;">Content</div>
```

### 4. Performance First

```html
<!-- ✅ Good: Use GPU-accelerated properties -->
<div class="scale-in">Transform-based animation</div>
<div class="slide-in-left">Translate-based animation</div>

<!-- ❌ Avoid: Layout-thrashing properties -->
<div style="animation: width-change 200ms;">Avoid width/height animations</div>
```

### 5. Accessibility Always

```html
<!-- ✅ Good: ARIA attributes + animations -->
<button aria-busy="{isLoading}" class="button-interactive">
  {isLoading ? <span class="animate-spin" /> : 'Submit'}
</button>

<!-- ❌ Bad: Animation without context -->
<div class="animate-spin" />
```

---

## 🚫 Anti-Patterns

### Don't Mix Animations Carelessly

```html
<!-- ❌ Bad: Too many animations at once -->
<div class="fade-in slide-in-left scale-in">Too much!</div>

<!-- ✅ Good: One animation per element -->
<div class="fade-in">Content</div>
```

### Don't Use Animations for Information

```html
<!-- ❌ Bad: Animation conveys information -->
<div class="scale-bounce">New message</div>

<!-- ✅ Good: Animation + text/icon -->
<div class="flex items-center gap-2">
  <span class="scale-bounce">●</span>
  <span>New message</span>
</div>
```

### Don't Ignore Performance

```html
<!-- ❌ Bad: Will cause jank -->
<div style="animation: left-change 200ms;">Animating left property</div>

<!-- ✅ Good: GPU-accelerated -->
<div class="slide-in-left">Using transform</div>
```

### Don't Skip Accessibility

```html
<!-- ❌ Bad: Loading state not announced -->
<button disabled class="animate-spin">Loading</button>

<!-- ✅ Good: ARIA attribute added -->
<button disabled aria-busy="true" class="animate-spin">
  <span class="sr-only">Loading</span>
</button>
```

---

## 🔧 Customization

### Add Custom Animation Timing

```css
/* In your component's CSS */
.my-custom-animation {
  animation: custom-animation 250ms ease-out forwards;
}

@keyframes custom-animation {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .my-custom-animation {
    animation: none;
    opacity: 1;
  }
}
```

### Extend Animation Timing

```css
/* Add new duration variable */
:root {
  --duration-custom: 400ms;
  --transition-custom: all 400ms ease-out;
}

.my-element {
  transition: var(--transition-custom);
}
```

---

## 📚 Related Documentation

- [Design System](./DESIGN_SYSTEM.md) - Complete system reference
- [Quality Gates](./QUALITY_GATES.md) - Standards and validation
- [Advanced Accessibility](../src/styles/advanced-accessibility.css) - A11y patterns
- [Source CSS](../src/styles/micro-interactions.css) - Full implementation

---

## ✨ Summary

The micro-interactions system provides:

- ✅ 10+ animation types
- ✅ Smooth, professional feel
- ✅ Gesture-aware interactions
- ✅ Automatic reduced-motion support
- ✅ GPU-accelerated performance
- ✅ Accessibility-first approach
- ✅ Dark mode support
- ✅ Easy-to-use classes

Use these patterns to create a delightful, professional user experience!

---

_Last updated: December 2024_
