# Style Guide - TradePro v10

A comprehensive guide to code standards, conventions, and best practices for the TradePro v10 codebase.

## Table of Contents

1. [TypeScript Standards](#typescript-standards)
2. [React Component Conventions](#react-component-conventions)
3. [File Organization](#file-organization)
4. [Naming Conventions](#naming-conventions)
5. [Tailwind CSS & Styling](#tailwind-css--styling)
6. [Form Validation](#form-validation)
7. [Supabase Integration](#supabase-integration)
8. [Error Handling](#error-handling)
9. [Testing Patterns](#testing-patterns)
10. [Performance Optimization](#performance-optimization)
11. [Common Pitfalls](#common-pitfalls)
12. [Code Examples](#code-examples)

---

## TypeScript Standards

### Type Configuration

TradePro uses **intentionally loose TypeScript configuration** for incremental adoption:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "noImplicitAny": false,           // Allow implicit any
    "strictNullChecks": false,        // Allow null in unions
    "noUnusedLocals": false,          // Don't warn on unused locals
    "noUnusedParameters": false,      // Don't warn on unused params
    "skipLibCheck": true,             // Skip type checking external libs
    "allowJs": true                   // Allow JavaScript imports
  }
}
```

**Why?** This allows developers to gradually adopt strict typing without blocking contributions.

### Type Guidelines

- **Use `unknown` then narrow**: When dealing with uncertain types, use `unknown` and narrow the type scope:
  ```typescript
  const parseData = (data: unknown): User => {
    if (typeof data === 'object' && data !== null && 'id' in data) {
      return data as User;
    }
    throw new Error('Invalid user data');
  };
  ```

- **Avoid `any` when possible**: ESLint warns on `@typescript-eslint/no-explicit-any` but doesn't block it. Prefer `unknown` or proper types.

- **Import types from Supabase**: Never manually create database types—import auto-generated types:
  ```typescript
  import type { Database } from '@/integrations/supabase/types';
  
  type User = Database['public']['Tables']['users']['Row'];
  ```

- **Path Aliases**: Always use `@/` prefix (configured in `tsconfig.json`):
  ```typescript
  import { Button } from '@/components/ui/button';
  import { useAuth } from '@/hooks/useAuth';
  import { supabase } from '@/integrations/supabase/client';
  ```

### Type Assertions

Minimize type assertions. When necessary, be explicit:

```typescript
// ✅ Good: Explicit and narrow
const user = data as { id: string; name: string };

// ❌ Bad: Too broad
const user = data as any;

// ✅ Better: Use type guard
function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'id' in data;
}
```

---

## React Component Conventions

### Functional Components Only

**No class components.** All components must be functional components with hooks.

```typescript
// ✅ Good: Functional component
export const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  return <div>Dashboard</div>;
};

// ❌ Bad: Class component
export class Dashboard extends React.Component {
  // ...
}
```

### Component Structure

```typescript
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types';

interface TradeFormProps {
  symbol: string;
  onSubmit: (order: Order) => Promise<void>;
  isDisabled?: boolean;
}

/**
 * TradeForm - Manages order creation and submission
 * 
 * @param symbol - The trading symbol (e.g., 'EURUSD')
 * @param onSubmit - Callback when order is submitted
 * @param isDisabled - Whether the form should be disabled
 */
export const TradeForm: React.FC<TradeFormProps> = ({ 
  symbol, 
  onSubmit, 
  isDisabled = false 
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (data: OrderInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [onSubmit]);

  if (!user) {
    return <div>Please log in first</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Component Size & Modularity

- **Max 300 lines per component**: Refactor larger components into smaller, reusable pieces
- **Single responsibility**: Each component should have one clear purpose
- **Extract reusable logic**: Move business logic into custom hooks

### Props Destructuring

Always destructure props with TypeScript types:

```typescript
// ✅ Good: Destructured with types
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const CustomButton: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => {
  // ...
};

// ❌ Bad: Not destructured
export const CustomButton: React.FC<any> = (props) => {
  // ...
};
```

### JSDoc Comments

Document components with JSDoc:

```typescript
/**
 * OrderBook - Displays real-time order book for a symbol
 * 
 * Subscribes to Supabase Realtime for live updates.
 * 
 * @component
 * @example
 * return <OrderBook symbol="EURUSD" />
 * 
 * @param symbol - Trading symbol to display orders for
 * @returns React component showing bid/ask orders
 */
export const OrderBook: React.FC<{ symbol: string }> = ({ symbol }) => {
  // ...
};
```

### Memoization

Use `useMemo` and `useCallback` only when proving performance issues with React Profiler:

```typescript
// ✅ Use only if Profiler shows repeated calculations
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// ✅ Use only if dependencies are complex
const handleClick = useCallback(() => {
  processOrder(orderId, symbol);
}, [orderId, symbol]);

// ❌ Don't use without justification
const name = useMemo(() => user.name, [user.name]);
```

---

## Component API Consistency

### Props Interface Patterns

All components must follow a consistent props pattern for API predictability:

```typescript
// ✅ Good: Consistent interface naming and structure
interface ButtonProps {
  // Content
  children: React.ReactNode;
  label?: string;
  
  // Behavior
  onClick?: () => void;
  disabled?: boolean;
  
  // Styling
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  
  // State
  isLoading?: boolean;
  isDanger?: boolean;
  
  // ARIA
  ariaLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  ...props
}) => {
  // Implementation
};
```

### Props Organization Order

Follow this consistent order in every interface:

1. **Content props** (`children`, `label`, `title`, `description`)
2. **Event handlers** (`onClick`, `onChange`, `onSubmit`)
3. **Behavior props** (`disabled`, `readOnly`, `required`)
4. **Styling props** (`variant`, `size`, `className`)
5. **State props** (`isLoading`, `isActive`, `isDanger`)
6. **ARIA/accessibility** (`ariaLabel`, `ariaDescribedBy`)
7. **HTML attributes** (`id`, `data-*`, `ref`)

```typescript
// ✅ Good: Logical grouping
interface InputProps {
  // Content
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  
  // Events
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  
  // Behavior
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  
  // Styling
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  
  // State
  isLoading?: boolean;
  error?: string;
  
  // Accessibility
  ariaLabel?: string;
  ariaErrorMessage?: string;
}
```

### Default Props

Always provide sensible defaults:

```typescript
// ✅ Good: Explicit defaults
interface CardProps {
  variant?: 'default' | 'elevated' | 'outline';
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',     // Explicit default
  padding = 'md',          // Explicit default
  children,
  className,
}) => {
  // Implementation
};

// ❌ Bad: No defaults, callers must specify everything
interface CardProps {
  variant: 'default' | 'elevated' | 'outline';
  padding: 'sm' | 'md' | 'lg';
}
```

### Optional vs Required Props

Use a consistent pattern for optional props:

```typescript
// ✅ Good: Optional props clearly marked with ?
interface ModalProps {
  isOpen: boolean;                    // Required, controls visibility
  onClose: () => void;                // Required, essential callback
  title: string;                      // Required, main content
  
  subtitle?: string;                  // Optional enhancement
  footer?: React.ReactNode;           // Optional, use rarely
  onConfirm?: () => void;             // Optional callback
  confirmText?: string;               // Optional label
}

// Rule: Only mark as required if absolutely needed for core functionality
```

### Event Handler Naming

Use consistent naming for event handlers:

```typescript
// ✅ Good: on* prefix for callbacks
interface FormProps {
  onSubmit: (data: FormData) => Promise<void>;
  onCancel?: () => void;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

interface SelectProps {
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

// ❌ Bad: Inconsistent naming
interface FormProps {
  submit: (data: FormData) => void;      // Missing 'on'
  handleCancel?: () => void;             // Use 'on', not 'handle'
  onFormError?: (error: Error) => void;  // Too specific
}
```

### State Props Naming

Use consistent boolean prop naming:

```typescript
// ✅ Good: Consistent state naming
interface ButtonProps {
  isDisabled?: boolean;        // ✅ Use 'is' prefix
  isLoading?: boolean;         // ✅ Consistent
  isDanger?: boolean;          // ✅ Consistent
  isActive?: boolean;          // ✅ Consistent
}

interface InputProps {
  isRequired?: boolean;        // ✅ Use 'is' prefix
  isReadOnly?: boolean;        // ✅ Consistent
  isError?: boolean;           // ✅ Consistent
}

// ❌ Bad: Inconsistent naming
interface ButtonProps {
  disabled?: boolean;          // ❌ Missing 'is' prefix
  loading?: boolean;           // ❌ Should be 'isLoading'
  isDanger?: boolean;          // ✅ But conflicts with above
  active?: boolean;            // ❌ Should be 'isActive'
}
```

### Styling Props Consistency

All styling props should follow a standard pattern:

```typescript
// ✅ Good: Consistent styling props across all components
interface BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary';  // Predefined variants only
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';        // Consistent sizes
  className?: string;                              // For overrides only
}

// ✅ Size standard (use consistently everywhere)
const SIZES = {
  xs: 'h-6 w-6',      // 24px - very small
  sm: 'h-8 w-8',      // 32px - small
  md: 'h-10 w-10',    // 40px - medium (default)
  lg: 'h-12 w-12',    // 48px - large
  xl: 'h-16 w-16',    // 64px - extra large
};

// ✅ Variant standard (use consistently)
interface VariantConfig {
  primary: string;    // Primary action color
  secondary: string;  // Secondary action color
  ghost: string;      // Minimal style
  outline: string;    // Border style
  danger: string;     // Destructive action
}

// ❌ Bad: Each component has different variants
// Button: 'primary', 'secondary', 'outline'
// Card: 'flat', 'elevated', 'outlined'
// Input: 'default', 'error', 'success'
// ^ Inconsistent naming makes API unpredictable
```

### Return Type Consistency

All hooks and functions should have consistent return types:

```typescript
// ✅ Good: Consistent hook return shape
export const useForm = <T>(schema: ZodSchema) => {
  return {
    data: formData,
    errors: validationErrors,
    isValid: boolean,
    isSubmitting: boolean,
    register: (name: string) => ({ ... }),
    handleSubmit: (onSubmit: Callback) => void,
    reset: () => void,
  };
};

export const useAuth = () => {
  return {
    user: currentUser,
    isLoading: boolean,
    error: errorMessage,
    logout: () => Promise<void>,
    login: (creds) => Promise<void>,
  };
};

// ✅ Consistent pattern: data, isLoading, error, callbacks

// ❌ Bad: Inconsistent return shapes
export const useForm = () => {
  return [formData, submit];                    // Array, hard to remember order
};

export const useAuth = () => {
  return { currentUser, isAuth, handleLogout }; // Different prop names
};
```

### Component Composition Props

When components accept other components as props, use consistent naming:

```typescript
// ✅ Good: Descriptive component prop names
interface PageProps {
  header?: React.ComponentType<HeaderProps>;
  footer?: React.ComponentType<FooterProps>;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

interface LayoutProps {
  topBar?: React.ComponentType;
  leftPanel?: React.ComponentType;
  mainContent: React.ReactNode;
  rightPanel?: React.ReactNode;
}

// ❌ Bad: Generic component prop names
interface PageProps {
  component1?: React.ComponentType;    // Unclear purpose
  element2?: React.ReactNode;          // Vague naming
  comp3?: React.ComponentType;         // Non-descriptive
}
```

### Error Message Props

Consistent error handling across all components:

```typescript
// ✅ Good: Standard error props
interface FormFieldProps {
  error?: string;              // Error message
  errorDescription?: string;   // Additional context
  ariaErrorMessage?: string;   // Accessibility
  onErrorClear?: () => void;   // Clear error callback
}

interface InputProps {
  error?: string;              // Error message
  isError?: boolean;           // Error state (optional visual indicator)
}

// All components use 'error' for string message, consistent pattern
```

### Documentation Template

Every component should include JSDoc with consistent format:

```typescript
/**
 * Button - Interactive clickable element
 * 
 * Supports multiple variants and sizes. Can show loading state.
 * All styling options are predefined for consistency.
 * 
 * @component
 * @example
 * return (
 *   <Button variant="primary" size="md" onClick={handleClick}>
 *     Click Me
 *   </Button>
 * )
 * 
 * @param {ButtonProps} props - Component props
 * @param {React.ReactNode} props.children - Button text or content
 * @param {'primary'|'secondary'|'ghost'} [props.variant='primary'] - Visual style
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md'] - Button size
 * @param {boolean} [props.isDisabled=false] - Disable interaction
 * @param {boolean} [props.isLoading=false] - Show loading indicator
 * @param {() => void} [props.onClick] - Click handler
 * @param {string} [props.className] - Additional CSS classes
 * 
 * @returns {React.ReactElement} Button element
 */
export const Button: React.FC<ButtonProps> = ({ ... }) => { };
```

### Prop Validation Checklist

Before finalizing any component API:

- [ ] Props interface clearly named with `Props` suffix
- [ ] Props grouped logically (content, events, behavior, styling, state, aria)
- [ ] All optional props marked with `?`
- [ ] Sensible defaults provided for optional props
- [ ] Event handlers use `on*` prefix
- [ ] Boolean state props use `is*` prefix
- [ ] Styling uses predefined `variant` and `size` enums only
- [ ] `className` reserved for component overrides only
- [ ] Return types consistent with similar components/hooks
- [ ] JSDoc with examples included
- [ ] Error props follow standard pattern

---

## File Organization

### Project Structure

```
src/
├── components/
│   ├── ui/                          # shadcn-ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── auth/                        # Feature components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── __tests__/
│   │       └── LoginForm.test.tsx
│   ├── trading/
│   │   ├── TradeForm.tsx
│   │   ├── OrderBook.tsx
│   │   └── __tests__/
│   ├── kyc/
│   └── ...
├── contexts/
│   ├── notificationContext.tsx
│   └── errorContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePriceStream.ts
│   ├── use-toast.ts
│   └── __tests__/
│       └── useAuth.test.ts
├── pages/
│   ├── Trade.tsx
│   ├── Dashboard.tsx
│   ├── Admin.tsx
│   └── __tests__/
├── lib/
│   ├── trading/
│   │   ├── orderMatching.ts
│   │   ├── marginCalculations.ts
│   │   ├── commissionCalculation.ts
│   │   ├── liquidationEngine.ts
│   │   ├── pnlCalculation.ts
│   │   ├── slippageCalculation.ts
│   │   └── __tests__/
│   ├── kyc/
│   │   ├── kycService.ts
│   │   ├── documentValidation.ts
│   │   └── __tests__/
│   ├── export/
│   │   ├── csvExport.ts
│   │   ├── pdfExport.ts
│   │   └── __tests__/
│   ├── logger.ts
│   ├── utils.ts
│   └── supabaseClient.ts
├── integrations/
│   └── supabase/
│       ├── client.ts
│       └── types.ts                 # Auto-generated
├── types/
│   ├── orders.ts
│   ├── positions.ts
│   ├── users.ts
│   └── index.ts
├── assets/
│   ├── icons/
│   ├── images/
│   └── flags/
├── App.tsx
├── main.tsx
├── index.css
└── vite-env.d.ts
```

### Feature-Based Organization

Group related components in subdirectories by feature:

```
components/trading/
├── TradeForm.tsx
├── OrderBook.tsx
├── PositionList.tsx
├── ChartWidget.tsx
├── __tests__/
│   ├── TradeForm.test.tsx
│   └── OrderBook.test.tsx
└── index.ts               # Optional: re-export exports
```

### Tests Co-location

Place tests in `__tests__/` directory within the same folder as source:

```
hooks/
├── useAuth.ts
├── usePriceStream.ts
└── __tests__/
    ├── useAuth.test.ts
    └── usePriceStream.test.ts
```

### Index Files (Optional)

Use `index.ts` to re-export related exports if the module is complex:

```typescript
// components/trading/index.ts
export { TradeForm } from './TradeForm';
export { OrderBook } from './OrderBook';
export { PositionList } from './PositionList';
```

---

## Naming Conventions

### Components

Use **PascalCase** for component file names and exports:

```typescript
// ✅ Good
export const TradeForm: React.FC = () => { };         // File: TradeForm.tsx
export const OrderBook: React.FC = () => { };         // File: OrderBook.tsx
export const PositionList: React.FC = () => { };      // File: PositionList.tsx

// ❌ Bad
export const tradeForm: React.FC = () => { };         // File: tradeForm.tsx
export const trade_form: React.FC = () => { };        // File: trade_form.tsx
```

### Hooks

Use **camelCase** with `use` prefix for custom hooks:

```typescript
// ✅ Good: Hooks use `use` prefix
export const useAuth = () => { };                     // File: useAuth.ts
export const usePriceStream = (symbols) => { };       // File: usePriceStream.ts
export const useRealtimePositions = (userId) => { };  // File: useRealtimePositions.ts

// ❌ Bad
export const auth = () => { };                        // Missing 'use' prefix
export const getPriceStream = () => { };              // Should use 'use' prefix
```

### Utility Functions & Services

Use **camelCase** for utility functions and services:

```typescript
// ✅ Good
export const orderMatching = (orders) => { };         // File: orderMatching.ts
export const calculateMargin = (leverage, equity) => { };
export const validateKycDocument = (doc) => { };      // File: documentValidation.ts
export const exportPortfolioToCSV = (positions) => { };

// ❌ Bad
export const OrderMatching = () => { };               // Should be camelCase
export const calculate_margin = () => { };            // Snake_case
```

### Constants

Use **UPPER_SNAKE_CASE** for constants:

```typescript
// ✅ Good
const MAX_LEVERAGE = 50;
const MIN_ORDER_SIZE = 0.01;
const COMMISSION_RATE = 0.0002;
const KYC_VERIFICATION_TIMEOUT = 86400000; // ms
const API_BASE_URL = 'https://api.example.com';

// ❌ Bad
const maxLeverage = 50;           // Use UPPER_SNAKE_CASE
const max-leverage = 50;          // Invalid syntax
```

### Types & Interfaces

Use **PascalCase** for types and interfaces:

```typescript
// ✅ Good
interface User { }
interface Order { }
type OrderStatus = 'pending' | 'filled' | 'cancelled';
type PriceUpdate = { symbol: string; price: number };

// ❌ Bad
interface user { }
type order_status = 'pending' | 'filled';
```

### Event Handlers

Prefix event handlers with `handle`:

```typescript
// ✅ Good
const handleSubmit = (e: React.FormEvent) => { };
const handleClick = () => { };
const handlePriceUpdate = (price: number) => { };
const handleError = (error: Error) => { };

// ❌ Bad
const submit = () => { };
const onClick = () => { };
const onPriceUpdate = (price: number) => { };
```

---

## Tailwind CSS & Styling

### Configuration

Tailwind is configured in `tailwind.config.ts` with custom colors, spacing, and utilities:

```typescript
// tailwind.config.ts
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        buy: "hsl(var(--buy))",
        sell: "hsl(var(--sell))",
        profit: "hsl(var(--profit))",
        loss: "hsl(var(--loss))",
      },
      spacing: {
        xs: '4px',    // Minimal gaps
        sm: '8px',    // Component gaps
        md: '16px',   // Section gaps
        lg: '24px',   // Major sections
        xl: '32px',   // Page padding
      },
    },
  },
};
```

### Color System

All colors are **CSS variables** defined in `index.css`:

```typescript
// ✅ Good: Use CSS variables
<button className="bg-primary text-primary-foreground" />
<div className="text-buy" />                           // Buy price green
<div className="bg-sell" />                            // Sell price red

// ❌ Bad: Hardcoded colors
<button className="bg-blue-500" />
<div style={{ color: '#22c55e' }} />
```

### Utility-First Approach

Use Tailwind utilities directly in `className` attributes:

```typescript
// ✅ Good: Utility-first
<div className="flex gap-4 p-6 rounded-lg bg-card border border-border">
  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
    Submit
  </button>
</div>

// ❌ Bad: CSS-in-JS or inline styles
<div style={{ display: 'flex', gap: '16px', padding: '24px' }}>
  <button style={{ backgroundColor: '#primary' }}>Submit</button>
</div>
```

### `cn()` Utility for Dynamic Classes

Import and use `cn()` (from `clsx`) for dynamic class combinations:

```typescript
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  isActive?: boolean;
}

export const CustomButton: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  isActive = false 
}) => (
  <button 
    className={cn(
      'px-4 py-2 rounded-md transition-colors',
      variant === 'primary' 
        ? 'bg-primary text-primary-foreground' 
        : 'bg-secondary text-secondary-foreground',
      isActive && 'ring-2 ring-offset-2 ring-primary'
    )}
  >
    Click me
  </button>
);
```

### Responsive Design

Use Tailwind breakpoint prefixes for responsive layouts:

```typescript
// ✅ Good: Mobile-first responsive
<div className="
  grid grid-cols-1 gap-4
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
  xl:grid-cols-5
  p-4 sm:p-6 md:p-8
">
  {items.map(item => <div key={item.id}>{item}</div>)}
</div>

// Breakpoints:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

### Border Radius

Use standardized border-radius scale only:

```typescript
// ✅ Good: Use only lg and md
<div className="rounded-lg" />      // 8px - cards, modals, containers
<button className="rounded-md" />  // 6px - buttons, inputs, badges

// ❌ Bad: Don't use rounded-xl, rounded-2xl, etc.
<div className="rounded-xl" />      // Not in design system
<div className="rounded-none" />    // Removed from system
```

### Icon Utilities

TradePro includes custom icon sizing utilities:

```typescript
// ✅ Good: Use icon utilities
<Icon className="icon-sm" />                    // 1rem
<MenuIcon className="icon-lg" />               // 1.5rem
<CheckIcon className="icon-xl" />              // 1.75rem

// Trading-specific utilities
<ArrowUpIcon className="text-buy" />           // Buy color (green)
<ArrowDownIcon className="text-sell" />        // Sell color (red)
<TrendingUpIcon className="trading-profit" />  // Profit green
<TrendingDownIcon className="trading-loss" />  // Loss red
```

### Dark Mode

Dark mode is already enabled via `darkMode: ["class"]`:

```typescript
// ✅ Good: Automatic dark mode support
<div className="
  bg-background text-foreground       // Auto switches in dark mode
  hover:bg-muted hover:text-muted-foreground
  dark:bg-slate-950
">
  Content
</div>

// Tailwind automatically handles light/dark:
// - Added 'dark' class to <html> element
// - CSS variables switch based on class presence
```

---

## Form Validation

### Schema-First Approach

Always define Zod schemas first, then infer TypeScript types:

```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// ✅ Good: Schema first
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be 8+ characters'),
  rememberMe: z.boolean().optional(),
});

// Infer type from schema
type LoginInput = z.infer<typeof loginSchema>;

// Use in component
const LoginForm: React.FC = () => {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      {form.formState.errors.email && (
        <span className="text-destructive">
          {form.formState.errors.email.message}
        </span>
      )}
    </form>
  );
};
```

### Common Validations

```typescript
// Email validation
z.string().email('Invalid email address')

// Password strength
z.string()
  .min(8, 'Minimum 8 characters')
  .regex(/[A-Z]/, 'Must include uppercase')
  .regex(/[0-9]/, 'Must include numbers')

// Trading amounts
z.number().positive('Must be positive').max(1000000, 'Exceeds limit')

// Select fields
z.enum(['BUY', 'SELL'], { errorMap: () => ({ message: 'Invalid action' }) })

// Custom validation
z.string().refine(
  (val) => !isReservedSymbol(val),
  'This symbol is reserved'
)
```

### Form Field Patterns

Use the standard form component from shadcn-ui:

```typescript
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export const TradeForm: React.FC = () => {
  const form = useForm<TradeInput>({
    resolver: zodResolver(tradeSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <Input {...field} placeholder="EURUSD" />
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
};
```

---

## Supabase Integration

### Client Import

**Always** use the correct import path:

```typescript
// ✅ Good
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// ❌ Bad
import { supabase } from '@/lib/supabaseClient';        // Wrong path!
import type { Database } from '@supabase/supabase-js';  // Wrong import!
```

### Type Safety

Import auto-generated types from Supabase:

```typescript
import type { Database } from '@/integrations/supabase/types';

// Type a single table row
type User = Database['public']['Tables']['users']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

// Type insertions
type UserInsert = Database['public']['Tables']['users']['Insert'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];

// Type updates
type UserUpdate = Database['public']['Tables']['users']['Update'];
```

### Querying Data

```typescript
// ✅ Good: Type-safe query
const { data: orders, error } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });

if (error) {
  console.error('Failed to fetch orders:', error);
  return [];
}

// Use data safely
return orders ?? [];

// ❌ Bad: Unhandled error
const { data } = await supabase.from('orders').select('*');
console.log(data.map(order => order.id)); // Might crash if error!
```

### Realtime Subscriptions

**Critical**: Always unsubscribe in cleanup to prevent memory leaks:

```typescript
// ✅ Good: Proper cleanup
export const useRealtimePositions = (userId: string) => {
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    const subscription = supabase
      .channel('positions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'positions', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPositions(prev => [...prev, payload.new as Position]);
          } else if (payload.eventType === 'UPDATE') {
            setPositions(prev =>
              prev.map(p => p.id === payload.new.id ? (payload.new as Position) : p)
            );
          } else if (payload.eventType === 'DELETE') {
            setPositions(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // ✅ CRITICAL: Unsubscribe on cleanup
    return () => subscription.unsubscribe();
  }, [userId]);

  return positions;
};

// ❌ Bad: No unsubscribe = memory leak
export const useRealtimePositions = (userId: string) => {
  const [positions, setPositions] = useState<Position[]>([]);

  supabase
    .channel('positions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'positions' }, (payload) => {
      setPositions(prev => [...prev, payload.new as Position]);
    })
    .subscribe();  // ❌ Never unsubscribed!

  return positions;
};
```

### Realtime Type Safety

Use minimal type definitions for Realtime payloads to handle partial data:

```typescript
// ✅ Good: Optional fields for Realtime data
interface RealtimePosition {
  id?: string;
  symbol?: string;
  size?: number;
  entry_price?: number;
  updated_at?: string;
}

const handlePositionUpdate = (payload: any) => {
  const position: RealtimePosition = payload.new;
  if (position.id && position.symbol) {
    // Safe to use
  }
};
```

### Row-Level Security (RLS)

All Supabase tables use RLS policies to enforce user isolation. Queries auto-filter by authenticated user:

```sql
-- Example RLS policy (auto-enforced)
CREATE POLICY "Users can only see their own orders"
ON orders
FOR SELECT
USING (auth.uid() = user_id);
```

**Important**: Always verify RLS policies exist for new tables before pushing to production.

---

## Error Handling

### Error Boundaries

App-level error boundary in `src/components/ErrorBoundary.tsx`:

```typescript
// ✅ Good: Page wrapped with error boundary
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <TradePage />
</ErrorBoundary>

// Catches render errors and displays fallback UI
```

### Async Operations

Always wrap async operations in try-catch:

```typescript
// ✅ Good: Proper error handling
const handleSubmit = async (data: OrderInput) => {
  try {
    const order = await createOrder(data);
    toast({ title: 'Success', description: 'Order created' });
    return order;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast({ title: 'Error', description: message });
    logger.error('Order creation failed:', error);
    throw error;
  }
};

// ❌ Bad: Unhandled error
const handleSubmit = async (data: OrderInput) => {
  const order = await createOrder(data); // May throw!
  return order;
};
```

### Toast Notifications

Use `useToast()` for user-facing error messages:

```typescript
import { useToast } from '@/hooks/use-toast';

export const TradeForm: React.FC = () => {
  const { toast } = useToast();

  const handleError = (error: unknown) => {
    toast({
      title: 'Trade Failed',
      description: error instanceof Error ? error.message : 'Unknown error',
      variant: 'destructive',
    });
  };

  return (
    <button onClick={() => handleError(new Error('Insufficient margin'))}>
      Place Order
    </button>
  );
};
```

### Logging

Use `console.error()` or Sentry via `logger`:

```typescript
import { logger } from '@/lib/logger';

try {
  await risky
Operation();
} catch (error) {
  // Log to console (always)
  console.error('Operation failed:', error);
  
  // Log to Sentry (if configured)
  logger.error('Operation failed', { 
    error, 
    context: 'tradeForm',
    userId: user.id 
  });
}
```

---

## Testing Patterns

### Unit Tests

Use **Vitest** for unit testing:

```typescript
// src/lib/trading/__tests__/orderMatching.test.ts
import { describe, it, expect, vi } from 'vitest';
import { executeOrder } from '../orderMatching';
import type { Order } from '@/types';

describe('Order Matching', () => {
  it('should execute market order immediately', () => {
    const order: Order = {
      id: '1',
      symbol: 'EURUSD',
      type: 'market',
      size: 1.0,
      price: 1.0850,
    };

    const result = executeOrder(order);
    expect(result.status).toBe('filled');
    expect(result.executedPrice).toBe(1.0850);
  });

  it('should reject order exceeding max leverage', () => {
    const order: Order = {
      id: '2',
      symbol: 'EURUSD',
      type: 'limit',
      leverage: 100, // Exceeds MAX_LEVERAGE
      price: 1.0800,
    };

    expect(() => executeOrder(order)).toThrow('Leverage exceeds limit');
  });
});
```

### Mocking Supabase

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vi as vitestVi } from 'vitest';
import * as supabase from '@/integrations/supabase/client';

describe('Auth Service', () => {
  beforeEach(() => {
    // Mock Supabase client
    vi.mock('@/integrations/supabase/client', () => ({
      supabase: {
        auth: {
          signInWithPassword: vi.fn(),
          signUp: vi.fn(),
        },
      },
    }));
  });

  it('should handle login failure', async () => {
    const mockSupabase = vi.mocked(supabase);
    mockSupabase.supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid credentials'),
    });

    // Test logic
  });
});
```

### React Component Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TradeForm } from './TradeForm';

describe('TradeForm', () => {
  it('renders form fields', () => {
    render(<TradeForm symbol="EURUSD" onSubmit={vi.fn()} />);
    
    expect(screen.getByLabelText(/symbol/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
  });

  it('shows validation errors', async () => {
    const { user } = render(<TradeForm symbol="EURUSD" onSubmit={vi.fn()} />);
    
    await user.click(screen.getByText(/submit/i));
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
npm run test                # Run tests once
npm run test:ui            # Interactive test UI
npm run test:watch        # Watch mode
```

---

## Performance Optimization

### Code Splitting

Vite automatically splits large dependencies. Configure manual chunks in `vite.config.ts`:

```typescript
// vite.config.ts - already configured
build: {
  rollupOptions: {
    output: {
      manualChunks: (id) => {
        if (id.includes('lightweight-charts')) return 'vendor-charts';
        if (id.includes('recharts')) return 'vendor-charts';
        if (id.includes('@supabase')) return 'vendor-supabase';
        if (id.includes('@radix-ui')) return 'vendor-ui';
        if (id.includes('react-hook-form')) return 'vendor-forms';
      },
    },
  },
}
```

**Bundle analysis**: Run `ANALYZE=true npm run build` to generate `dist/bundle-analysis.html`

### Lazy Loading Routes

All pages are lazy-loaded to reduce initial bundle size:

```typescript
// App.tsx
const Trade = lazy(() => import('@/pages/Trade'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Admin = lazy(() => import('@/pages/Admin'));

<Routes>
  <Route path="/trade" element={<Suspense><Trade /></Suspense>} />
  <Route path="/dashboard" element={<Suspense><Dashboard /></Suspense>} />
</Routes>
```

### Market Data Streaming

**For high-frequency price updates:**

1. **Selective Subscriptions** — Only subscribe to displayed symbols:
```typescript
// ✅ Good
const symbols = positions.map(p => p.symbol);
const subscription = usePriceStream(symbols);

// ❌ Bad: Subscribe to all symbols
const allSymbols = getAllAssets();
usePriceStream(allSymbols);
```

2. **Debounce State Updates** — Batch updates to prevent excessive re-renders:
```typescript
const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

channel.on('broadcast', { event: 'price_update' }, ({ payload }) => {
  if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
  updateTimeoutRef.current = setTimeout(() => {
    setPrices(prev => ({ ...prev, [payload.symbol]: payload.price }));
  }, 100);  // Batch every 100ms
});
```

3. **Memoized Price Cells** — Prevent individual rows from re-rendering:
```typescript
const PriceCell = React.memo(
  ({ price }: Props) => <span>{price}</span>,
  (prev, next) => prev.price === next.price
);
```

4. **Virtualized Lists** — For large order/position lists:
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={positions.length}
  itemSize={40}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <PositionRow position={positions[index]} />
    </div>
  )}
</FixedSizeList>
```

### Memory Management

```typescript
// ✅ Always unsubscribe Realtime channels
useEffect(() => {
  const subscription = supabase.channel('positions').on(...).subscribe();
  return () => subscription.unsubscribe();  // CRITICAL
}, []);

// ✅ Clear timers
useEffect(() => {
  const timer = setTimeout(() => { }, 5000);
  return () => clearTimeout(timer);
}, []);

// ✅ Remove event listeners
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

## Common Pitfalls

### 1. Multiple React Instances

The Vite config deduplicates React. **Don't install React separately** in subdependencies.

```javascript
// vite.config.ts - already configured
resolve: {
  dedupe: ["react", "react-dom", "react/jsx-runtime"],
}
```

### 2. Stale Auth State

**Always use the `useAuth()` hook**; don't cache `user` outside React context:

```typescript
// ✅ Good: Fresh auth state
const { user } = useAuth();
if (!user) return <Login />;

// ❌ Bad: Stale state
const user = getUser();  // Cached, may be outdated
if (!user) return <Login />;
```

### 3. Missing RLS Policies

**All new tables require RLS policies.** Queries auto-filter by user:

```sql
-- ✅ Always add RLS policy
CREATE POLICY "Users see only their data"
ON my_table
FOR SELECT
USING (auth.uid() = user_id);
```

### 4. Unsubscribed Realtime

**Critical memory leak risk**: Always unsubscribe from channels:

```typescript
// ✅ Good
useEffect(() => {
  const sub = supabase.channel('positions').on(...).subscribe();
  return () => sub.unsubscribe();
}, []);

// ❌ Bad: Memory leak
supabase.channel('positions').on(...).subscribe();
```

### 5. Hardcoded Values

Use **environment variables or constants**:

```typescript
// ✅ Good
const API_URL = import.meta.env.VITE_SUPABASE_URL;
const MAX_LEVERAGE = 50;

// ❌ Bad
const url = 'https://hardcoded-url.com';
const maxLeverage = 50;
```

### 6. Prop Drilling

Extract to Context/hook if passing through 3+ levels:

```typescript
// ✅ Good: Use Context
const { user } = useAuth();
const { notifications } = useNotifications();

// ❌ Bad: Drilling through 5 layers
<ParentComponent user={user} notifications={notifications}>
  <ChildComponent user={user} notifications={notifications} />
</ParentComponent>
```

### 7. Wrong Supabase Import

**Always use the correct path**:

```typescript
// ✅ Good
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// ❌ Wrong paths
import { supabase } from '@/lib/supabaseClient';           // Wrong!
import type { Database } from '@supabase/supabase-js';     // Wrong!
```

### 8. Manually Edited Supabase Types

**Never manually edit** `@/integrations/supabase/types.ts`. Regenerate after schema changes:

```bash
npm run supabase:pull  # Regenerates types from schema
```

### 9. Race Conditions in Cleanup

Use refs to track component mount status:

```typescript
// ✅ Good: Prevents state updates on unmounted component
const isMountedRef = useRef(true);

useEffect(() => {
  return () => {
    isMountedRef.current = false;
  };
}, []);

const fetchData = async () => {
  const data = await supabase.from('orders').select();
  if (isMountedRef.current) {
    setOrders(data);  // Only update if still mounted
  }
};
```

### 10. Missing Error Boundaries

Wrap feature areas with error boundaries:

```typescript
// ✅ Good
<ErrorBoundary>
  <TradingPage />
</ErrorBoundary>

// ❌ Bad: No protection
<TradingPage />  // May crash entire app
```

---

## Code Examples

### Complete Component Example

```typescript
import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

/**
 * OrderForm - Creates new trading orders
 * 
 * Validates order inputs using Zod schema and submits to Supabase.
 * Handles async operations with proper error handling and loading states.
 */

// Schema first
const orderSchema = z.object({
  symbol: z.string().min(2, 'Invalid symbol'),
  size: z.number().positive('Size must be positive'),
  type: z.enum(['market', 'limit', 'stop']),
  price: z.number().positive('Price must be positive').optional(),
});

type OrderInput = z.infer<typeof orderSchema>;

interface OrderFormProps {
  onSubmitSuccess?: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onSubmitSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      type: 'market',
    },
  });

  const handleSubmit = useCallback(async (data: OrderInput) => {
    if (!user) {
      toast({ title: 'Error', description: 'Please log in' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          symbol: data.symbol,
          size: data.size,
          type: data.type,
          price: data.price,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Order #${order.id} created`,
      });

      form.reset();
      onSubmitSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user, toast, form, onSubmitSuccess]);

  if (!user) {
    return <div className="text-center py-8">Please log in to place orders</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <Input {...field} placeholder="EURUSD" />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size (Lots)</FormLabel>
              <Input {...field} type="number" placeholder="1.0" step="0.01" />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Type</FormLabel>
              <select {...field} className={cn('border rounded-md px-3 py-2')}>
                <option value="market">Market</option>
                <option value="limit">Limit</option>
                <option value="stop">Stop</option>
              </select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (if Limit/Stop)</FormLabel>
              <Input {...field} type="number" placeholder="1.0850" step="0.0001" />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Placing...' : 'Place Order'}
        </Button>
      </form>
    </Form>
  );
};
```

### Custom Hook Example

```typescript
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Position = Tables<'positions'>['Row'];

/**
 * useRealtimePositions - Subscribes to real-time position updates
 * 
 * Automatically unsubscribes on unmount to prevent memory leaks.
 * 
 * @param userId - The user ID to subscribe for
 * @returns Current positions and loading state
 */
export const useRealtimePositions = (userId: string | undefined) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    const fetchPositions = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('positions')
          .select('*')
          .eq('user_id', userId);

        if (fetchError) throw fetchError;
        setPositions(data ?? []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPositions();

    // Subscribe to updates
    const subscription = supabase
      .channel(`positions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'positions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPositions(prev => [...prev, payload.new as Position]);
          } else if (payload.eventType === 'UPDATE') {
            setPositions(prev =>
              prev.map(p => p.id === payload.new.id ? (payload.new as Position) : p)
            );
          } else if (payload.eventType === 'DELETE') {
            setPositions(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // ✅ CRITICAL: Cleanup
    return () => subscription.unsubscribe();
  }, [userId]);

  return { positions, isLoading, error };
};
```

---

## Summary Checklist

Before submitting code:

- [ ] **TypeScript**: Used proper types, avoid `any` when possible
- [ ] **Components**: Functional, <300 lines, single responsibility
- [ ] **Props**: Destructured with types in signature
- [ ] **Naming**: PascalCase components, camelCase functions, UPPER_SNAKE_CASE constants
- [ ] **Styling**: Used Tailwind utilities, CSS variables for colors
- [ ] **Forms**: Zod schema first, React Hook Form integration
- [ ] **Supabase**: Used correct import paths, types from auto-generated file
- [ ] **Realtime**: Always unsubscribe in cleanup
- [ ] **Error Handling**: Try-catch wraps async operations, toast notifications for UI
- [ ] **Testing**: Tests co-located in `__tests__/`, proper mocking
- [ ] **Performance**: No unnecessary memoization, proper code splitting
- [ ] **Accessibility**: Semantic HTML, ARIA labels where needed
- [ ] **Documentation**: JSDoc for components, clear variable names

---

## References

- **Main Codebase Docs**: `/workspaces/Trade-X-Pro-Global/.github/copilot-instructions.md`
- **Tailwind Config**: `/workspaces/Trade-X-Pro-Global/tailwind.config.ts`
- **Vite Config**: `/workspaces/Trade-X-Pro-Global/vite.config.ts`
- **TypeScript Config**: `/workspaces/Trade-X-Pro-Global/tsconfig.json`
- **ESLint Config**: `/workspaces/Trade-X-Pro-Global/eslint.config.js`
- **Testing Setup**: `/workspaces/Trade-X-Pro-Global/vitest.config.ts`
