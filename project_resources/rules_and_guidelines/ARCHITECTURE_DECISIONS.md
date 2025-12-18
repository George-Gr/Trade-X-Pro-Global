# 🏗️ Architecture Decisions & Design Rationale

**Version:** 1.0  
**Status:** Complete  
**Last Updated:** December 12, 2025

---

## 📋 Quick Navigation

- [ADR-001: Feature-Based Code Organization](#adr-001-feature-based-code-organization)
- [ADR-002: Tailwind CSS + CSS Variables for Styling](#adr-002-tailwind-css--css-variables-for-styling)
- [ADR-003: 8px/4px Spacing Grid System](#adr-003-8px4px-spacing-grid-system)
- [ADR-004: Loose TypeScript Configuration](#adr-004-loose-typescript-configuration)
- [ADR-005: React Context + React Query for State](#adr-005-react-context--react-query-for-state)
- [ADR-006: shadcn-ui Component Library](#adr-006-shadcn-ui-component-library)
- [ADR-007: CSS Variables for Dark Mode](#adr-007-css-variables-for-dark-mode)
- [ADR-008: Playwright for E2E Testing](#adr-008-playwright-for-e2e-testing)
- [ADR-009: Supabase for Backend](#adr-009-supabase-for-backend)

---

## 📄 ADR-001: Feature-Based Code Organization

### Decision

Organize code by **features/domains** rather than by technical layers (components, lib, hooks, etc.).

### Status

✅ **APPROVED** | Dec 2024  
**Owner:** Architecture Team

### Context

Initial project used layer-based organization:

```
src/
├── components/     (all components)
├── lib/           (all utilities)
├── hooks/         (all hooks)
└── pages/         (all pages)
```

This caused issues:

- Difficult to find related code
- Hard to move features between projects
- Unclear dependencies between modules
- Scaling pain as project grew

### Decision

Adopt **feature-based organization** with clear module boundaries:

```
src/
├── components/trading/      (trading feature)
├── components/portfolio/    (portfolio feature)
├── components/auth/         (authentication)
├── lib/                     (shared utilities)
├── hooks/                   (shared hooks)
└── types/                   (shared types)
```

### Rationale

1. **Cohesion:** Related code lives together
2. **Scalability:** Features can grow independently
3. **Extraction:** Features can be moved to separate packages
4. **Clarity:** Clear folder structure = faster navigation
5. **Modularity:** Easier to understand feature scope

### Consequences

- ✅ Easier to onboard new developers
- ✅ Faster to locate feature code
- ✅ Clear feature boundaries
- ⚠️ More folders to create initially
- ⚠️ Need discipline to maintain boundaries

### When to Revisit

- If team grows > 20 people
- If splitting into monorepo becomes necessary
- If performance issues require restructuring

### Related Documents

- STYLE_GUIDE.md - File Organization section
- PRD.md - Feature descriptions

---

## 📄 ADR-002: Tailwind CSS + CSS Variables for Styling

### Decision

Use **Tailwind CSS v4** for utility-first styling with **CSS variables** for design tokens.

### Status

✅ **APPROVED** | Dec 2024  
**Owner:** Design System Team

### Context

Initially considered:

1. **CSS Modules** - Good scoping, verbose
2. **Styled Components** - JS-in-CSS, runtime overhead
3. **Tailwind CSS** - Utility-first, smaller bundle
4. **Plain CSS** - Flexible, hard to maintain scale

Chose Tailwind + CSS Variables to get benefits of both utility framework + tokenization.

### Decision

```tsx
// Use Tailwind utilities with CSS variable fallback
<div className="bg-primary text-white p-4">
  This uses CSS variables under the hood: background: hsl(var(--primary)) color:
  hsl(var(--foreground))
</div>
```

### Rationale

1. **Speed:** Utility-first = rapid prototyping
2. **Consistency:** CSS variables enforce design tokens
3. **Dark Mode:** CSS variables work with prefers-color-scheme
4. **Bundle Size:** Only used utilities in output
5. **Maintainability:** Updates in one place (variables)
6. **Type Safety:** Tailwind integration with TypeScript
7. **Accessibility:** Built-in a11y utilities

### Consequences

- ✅ Smaller CSS bundles
- ✅ Consistent design system
- ✅ Fast development iteration
- ✅ Easy dark mode switching
- ⚠️ Must learn Tailwind class names
- ⚠️ No hardcoded colors allowed
- ⚠️ Team must agree on class naming

### Best Practices

```tsx
// ✅ CORRECT - Use Tailwind classes
<Button className="text-primary bg-white">

// ✅ CORRECT - Use CSS variables for custom styles
style={{ color: 'hsl(var(--accent))' }}

// ❌ WRONG - Hardcoded color
<div style={{ backgroundColor: '#FF0000' }}>

// ❌ WRONG - Arbitrary values
<div className="p-[13px]">
```

### When to Revisit

- If Tailwind v5+ introduces breaking changes
- If CSS Variables support degrades in target browsers
- If performance metrics show CSS is bottleneck

### Related Documents

- DESIGN_SYSTEM.md - CSS variables section
- STYLE_GUIDE.md - Tailwind best practices

---

## 📄 ADR-003: 8px/4px Spacing Grid System

### Decision

Use an **8px base spacing unit with 4px subdivisions** for all layout and spacing.

### Status

✅ **APPROVED** | Dec 2024  
**Owner:** Design System Team

### Context

Spacing inconsistencies caused visual misalignment:

- Developers used arbitrary values: 13px, 17px, 5px
- No visual consistency in designs
- Hard to scale design system
- Difficult to explain spacing to developers

### Decision

Enforce 4px/8px grid:

```css
/* 4px base grid with 8px steps */
4px   (xs)
8px   (sm)
12px  (gap between elements)
16px  (md)
24px  (lg)
32px  (xl)
48px  (2xl)
64px  (3xl)
96px  (4xl)
128px (5xl)
```

### Rationale

1. **Visual Harmony:** 8px = standard in design systems
2. **Flexibility:** 4px allows micro-adjustments
3. **Scalability:** Easy to multiply (2x, 3x)
4. **Mobile-Friendly:** Works with screen pixel density
5. **Implementation:** Tailwind natively supports 4px grid
6. **Consistency:** Predictable spacing throughout

### Consequences

- ✅ Visually consistent spacing
- ✅ Design changes easier
- ✅ Developer guidelines clear
- ✅ Scales from mobile → desktop
- ⚠️ Developers must follow grid
- ⚠️ Audit tool validates compliance

### Implementation

```tsx
// ✅ CORRECT - 8px grid
<div className="p-4 space-y-6">    {/* 16px padding, 24px gaps */}
  <div className="mb-3">          {/* 12px margin */}
    Content
  </div>
</div>

// ❌ WRONG - Non-grid values
<div style={{ padding: '13px', marginBottom: '5px' }}>

// Automated validation:
npm run validate:design  // Catches spacing violations
```

### When to Revisit

- If 8px/4px proves inflexible for specific components
- If performance metrics show over-engineering
- If design language changes significantly

### Related Documents

- DESIGN_SYSTEM.md - Spacing & Layout section
- STYLE_GUIDE.md - Spacing utilities
- QUALITY_GATES.md - Validation rules

---

## 📄 ADR-004: Loose TypeScript Configuration

### Decision

Use **loose TypeScript configuration** (`noImplicitAny: false`, `strictNullChecks: false`) for rapid development, with strict mode for critical paths.

### Status

✅ **APPROVED** | Nov 2024  
**Owner:** Architecture Team

### Context

Strict TypeScript has benefits but slows development:

```typescript
// Strict mode requires this much boilerplate:
const getData = (id?: string | undefined | null): Promise<Data | null> => {
  if (!id) return Promise.resolve(null);
  return fetch(`/api/${id}`).then((r) => r.json());
};

// Loose mode allows faster iteration:
const getData = (id) => {
  return fetch(`/api/${id}`).then((r) => r.json());
};
```

### Decision

Use loose TypeScript config by default:

```json
// tsconfig.json
{
  "compilerOptions": {
    "noImplicitAny": false,
    "strictNullChecks": false,
    "strict": false
  }
}
```

But require strict typing for:

- Public APIs
- Shared utilities in `src/lib/`
- Component props
- Business logic in `src/lib/trading/`

### Rationale

1. **Speed:** Developers iterate faster
2. **Adoption:** New developers onboard easier
3. **Pragmatism:** Not all code needs strict typing
4. **Flexibility:** Tradeoff between DX and type safety
5. **Maintainability:** Still get basic type checking

### Consequences

- ✅ Faster development
- ✅ Easier onboarding
- ✅ Less ceremony for simple code
- ⚠️ Some bugs caught later (null, undefined)
- ⚠️ Less IDE autocomplete without explicit types
- ⚠️ Requires developer discipline

### Best Practices

```typescript
// ✅ COMPONENT PROPS - Always strict
interface ButtonProps {
  variant: "default" | "secondary" | "outline";
  size: "sm" | "md" | "lg";
  onClick: (event: React.MouseEvent) => void;
  children: React.ReactNode;
}

// ✅ PUBLIC FUNCTIONS - Always strict
export function calculatePortfolioValue(positions: Position[]): number {
  return positions.reduce((sum, p) => sum + p.value, 0);
}

// ✅ EVENT HANDLERS - Use appropriate types
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const value = event.target.value; // TypeScript knows this is string
};

// ✅ LOOSE - Internal implementations
const formatData = (data) => {
  return data.map((item) => ({
    ...item,
    formatted: new Date(item.date).toLocaleDateString(),
  }));
};
```

### When to Revisit

- If type-related bugs exceed 5% of issues
- If team size > 10 requires more structure
- If moving to stricter project

### Related Documents

- STYLE_GUIDE.md - TypeScript standards section
- tsconfig.json - Configuration file

---

## 📄 ADR-005: React Context + React Query for State

### Decision

Use **React Context for global UI state** and **React Query for server state**.

### Status

✅ **APPROVED** | Dec 2024  
**Owner:** Architecture Team

### Context

Considered:

1. **Redux** - Powerful but over-engineered for this project
2. **Zustand** - Minimal but less ecosystem
3. **Context + Hooks** - Built-in, sufficient
4. **React Query** - Best-in-class server state
5. **MobX** - Declarative but complex

### Decision

Split state responsibility:

**React Context** (Global UI State):

```typescript
// src/contexts/auth.tsx
<AuthProvider>
  <ThemeProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </ThemeProvider>
</AuthProvider>
```

**React Query** (Server State):

```typescript
const { data, isLoading } = useQuery({
  queryKey: ["positions"],
  queryFn: () => supabase.from("positions").select(),
});
```

### Rationale

1. **Simplicity:** Built-in React features, not external lib for Context
2. **Server State:** React Query handles caching, retries, sync
3. **Performance:** Context only for small global state
4. **Learning Curve:** Developers already know React
5. **Bundle Size:** Smaller than Redux/Zustand
6. **Ecosystem:** React Query has excellent dev tools

### Consequences

- ✅ Simple state management
- ✅ React Query handles server sync
- ✅ Context good for UI state
- ✅ Excellent React Query DevTools
- ⚠️ Context causes re-renders if not memoized
- ⚠️ React Query learning curve
- ⚠️ Not ideal for large nested state

### Implementation

```tsx
// ✅ CONTEXT - UI state only
<AuthProvider>
  <ThemeProvider>
    <SidebarProvider>
      <App />
    </SidebarProvider>
  </ThemeProvider>
</AuthProvider>;

// ✅ REACT QUERY - Server state
const { data: positions } = useQuery({
  queryKey: ["positions", portfolioId],
  queryFn: () => fetchPositions(portfolioId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: true,
});

// ✅ LOCAL HOOKS - Component state
const [isOpen, setIsOpen] = useState(false);
```

### When to Revisit

- If state management needs become more complex
- If team standardizes on different approach
- If React 19 changes state patterns

### Related Documents

- STYLE_GUIDE.md - State management patterns
- src/hooks/ - Example custom hooks

---

## 📄 ADR-006: shadcn-ui Component Library

### Decision

Use **shadcn-ui** as primary component library (Radix UI + Tailwind CSS).

### Status

✅ **APPROVED** | Dec 2024  
**Owner:** Design System Team

### Context

Evaluated:

1. **Material-UI** - Comprehensive, heavy, styled-components
2. **Chakra UI** - Great a11y, emotion CSS-in-JS
3. **shadcn-ui** - Lightweight, copy-paste, Tailwind-native
4. **Headless UI** - Minimal, requires more setup
5. **Custom Components** - Full control, high maintenance

### Decision

Adopt shadcn-ui with custom extensions:

```
src/components/ui/          # shadcn-ui components
├── button.tsx
├── input.tsx
├── card.tsx
├── dialog.tsx
└── ...
```

Custom variants and extensions in separate files:

```
src/components/custom/      # Project-specific components
├── TradeButton.tsx          # Button with trading defaults
├── PortfolioCard.tsx        # Card for portfolios
└── ...
```

### Rationale

1. **Tailwind Native:** Uses Tailwind, aligns with our stack
2. **Customizable:** Copy-paste = full control
3. **Accessibility:** Built on Radix UI (excellent a11y)
4. **Bundle Size:** Only copy what you use
5. **Developer Experience:** Copy-paste better than npm dependency
6. **Type Safety:** Full TypeScript support
7. **Community:** Large ecosystem of extensions

### Consequences

- ✅ Lightweight, customizable components
- ✅ Tailwind-first approach
- ✅ Excellent accessibility
- ✅ Full control over styling
- ⚠️ Must manually update when shadcn-ui updates
- ⚠️ Copy-paste maintenance overhead
- ⚠️ Breaking changes in Radix UI affect all copies

### Implementation

```tsx
// ✅ USE shadcn-ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function MyComponent() {
  return (
    <Card>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}

// ✅ EXTEND with custom components
import { Button } from "@/components/ui/button";

export function TradeButton(props) {
  return <Button variant="default" className="w-full" {...props} />;
}
```

### When to Revisit

- If Radix UI introduces breaking changes
- If need component library with NPM updates
- If team prefers different design system

### Related Documents

- COMPONENT_API.md - Component specifications
- DESIGN_SYSTEM.md - Design tokens
- project_resources/components/ - Component files

---

## 📄 ADR-007: CSS Variables for Dark Mode

### Decision

Use **CSS variables with `prefers-color-scheme`** for dark mode instead of JavaScript toggles.

### Status

✅ **APPROVED** | Dec 2024  
**Owner:** Design System Team

### Context

Initial approach used JavaScript theme switching:

```javascript
// Old approach - JS-based
localStorage.setItem("theme", "dark");
document.documentElement.classList.add("dark");
```

Issues:

- Flash of wrong color on page load
- Complex JavaScript state management
- Manual synchronization with OS preference
- Performance penalty from JS execution

### Decision

Use CSS-native dark mode:

```css
/* src/styles/root.css */
@media (prefers-color-scheme: dark) {
  :root {
    --primary: 262 83% 58%; /* Light: purple */
    --foreground: 210 40% 98%; /* Light: light gray */
    --background: 222 84% 5%; /* Dark: dark gray */
  }
}

@media (prefers-color-scheme: light) {
  :root {
    --primary: 262 83% 58%; /* Light: same purple */
    --foreground: 222 84% 5%; /* Light: dark gray */
    --background: 0 0% 100%; /* Light: white */
  }
}
```

### Rationale

1. **No Flash:** Color scheme loads before paint
2. **User Preference:** Respects OS dark mode setting
3. **Performance:** No JavaScript execution needed
4. **Simplicity:** Pure CSS, no complex state
5. **Accessibility:** Respects user preference
6. **Maintenance:** Single source of truth (CSS variables)

### Consequences

- ✅ No flash on load
- ✅ Automatic OS integration
- ✅ Better performance
- ✅ Simpler to understand
- ⚠️ No manual theme toggle (uses OS)
- ⚠️ Older browsers need fallback
- ⚠️ Can't override per-component

### Implementation

```tsx
// ✅ AUTOMATIC - Dark mode works without code
// Browser automatically applies dark mode CSS based on OS preference
<div className="bg-background text-foreground">
  This text automatically adapts to dark mode
</div>

// NO SETUP NEEDED - Just use color classes
// Dark mode CSS variables are automatically applied

// Browser DevTools:
// - Light mode: background = white
// - Dark mode: background = dark gray
```

### When to Revisit

- If need manual theme toggle button
- If design requires multiple themes
- If `prefers-color-scheme` support becomes obsolete

### Related Documents

- DESIGN_SYSTEM.md - Color system section
- styles/root.css - Implementation

---

## 📄 ADR-008: Playwright for E2E Testing

### Decision

Use **Playwright** for end-to-end testing.

### Status

✅ **APPROVED** | Dec 2024  
**Owner:** QA Team

### Context

Evaluated:

1. **Cypress** - Great DX but resource-heavy
2. **Playwright** - Fast, multiple browsers, good DX
3. **Puppeteer** - Lower-level, more setup
4. **WebDriver** - Selenium, heavy, slow
5. **No E2E** - Skip E2E entirely

### Decision

Adopt Playwright for E2E testing:

```typescript
// e2e/login.spec.ts
import { test, expect } from "@playwright/test";

test("user can log in", async ({ page }) => {
  await page.goto("http://localhost:8080");
  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[type="password"]', "password");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("http://localhost:8080/dashboard");
});
```

### Rationale

1. **Speed:** Fast test execution
2. **Reliability:** Great flake resistance
3. **Multi-Browser:** Test Chrome, Firefox, Safari
4. **Debugging:** Built-in debugging tools
5. **Codegen:** Can generate tests from actions
6. **Parallelization:** Run tests in parallel
7. **CI-Friendly:** Works great in GitHub Actions

### Consequences

- ✅ Fast test execution
- ✅ Multiple browser support
- ✅ Good debugging experience
- ✅ Easy to write and maintain
- ⚠️ Learning curve for new developers
- ⚠️ Flaky tests if not written carefully
- ⚠️ Resource usage in CI/CD

### Best Practices

```typescript
// ✅ CORRECT - Wait for elements
await expect(page.locator("button")).toBeVisible();
await page.click("button");

// ✅ CORRECT - Use test fixtures
test.beforeEach(async ({ page }) => {
  await loginUser(page);
});

// ❌ WRONG - Hard-coded waits
await page.waitForTimeout(2000);

// ❌ WRONG - Flaky selectors
await page.click(".btn"); // Too generic
```

### When to Revisit

- If team wants different E2E approach
- If Playwright introduces breaking changes
- If need different browser automation

### Related Documents

- e2e/ - Test files
- playwright.config.ts - Configuration

---

## 📄 ADR-009: Supabase for Backend

### Decision

Use **Supabase** as backend infrastructure (managed PostgreSQL, Auth, Realtime, Edge Functions).

### Status

✅ **APPROVED** | Dec 2024  
**Owner:** Backend Team

### Context

Considered:

1. **Firebase** - Ease of use but vendor lock-in
2. **AWS** - Powerful but complex setup
3. **Vercel Postgres** - Good but limited features
4. **Supabase** - Open-source, PostgreSQL, great DX
5. **Self-hosted DB** - Full control, high ops burden

### Decision

Use Supabase managed services:

- **PostgreSQL:** Primary database
- **Auth:** User authentication (JWT)
- **Realtime:** WebSocket subscriptions
- **Edge Functions:** Serverless functions
- **Storage:** File uploads

### Rationale

1. **Type Safety:** Generate types from schema
2. **Realtime:** Built-in WebSocket subscriptions
3. **SQL Power:** Full PostgreSQL capabilities
4. **Open Source:** Not vendor locked (can self-host)
5. **DX:** Great client SDK + TypeScript support
6. **Scaling:** Handles growth automatically
7. **Cost:** Generous free tier for development

### Consequences

- ✅ Strong type generation
- ✅ Real-time features built-in
- ✅ PostgreSQL power
- ✅ Managed infrastructure
- ⚠️ Some vendor lock-in (managed)
- ⚠️ Network latency for queries
- ⚠️ Costs scale with usage

### Implementation

```typescript
// ✅ USE Supabase client
import { supabase } from "@/integrations/supabase/client";

// Query with type safety
const { data, error } = await supabase
  .from("positions")
  .select()
  .eq("portfolio_id", portfolioId);

// Types automatically generated from schema
const position: Database["public"]["Tables"]["positions"]["Row"];

// Real-time subscriptions
supabase
  .channel("positions")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "positions" },
    (payload) => {
      console.log("Position changed:", payload);
    },
  )
  .subscribe();
```

### When to Revisit

- If need different database engine
- If costs become prohibitive
- If want to self-host backend

### Related Documents

- src/integrations/supabase/ - Client and types
- supabase/ - Migrations and functions
- DEVELOPMENT_SETUP.md - Database setup

---

## 🔄 Decision Review Process

### How Decisions Are Made

1. **Identify Problem:** What decision needs to be made?
2. **Gather Options:** What are the alternatives?
3. **Evaluate:** Pros/cons of each option
4. **Decide:** Choose best option
5. **Document:** Write ADR explaining decision
6. **Communicate:** Share with team
7. **Review:** Every 6 months

### When to Challenge a Decision

If you disagree with a decision:

1. **Understand Why:** Read the ADR
2. **Gather Data:** Can you prove it's wrong?
3. **Propose Alternative:** What would you choose instead?
4. **Schedule Discussion:** Talk with Architecture Team
5. **Document Change:** Update ADR if agreed

### When to Revisit an ADR

- If circumstances change significantly
- If new data proves decision wrong
- If team consensus shifts
- If every 6 months in review cycle

---

## 📚 Related Documents

- **STYLE_GUIDE.md** - Code standards derived from these decisions
- **DESIGN_SYSTEM.md** - Design system based on ADR-002, ADR-003, ADR-007
- **DEVELOPMENT_SETUP.md** - Setup reflects these architectural choices
- **PRD.md** - Product requirements that drove some decisions

---

## 🎯 Key Takeaways

1. **Feature-First:** Code organized by business domains, not technical layers
2. **Styling:** Tailwind CSS + CSS Variables for consistent, maintainable design
3. **Spacing:** 8px/4px grid for visual harmony
4. **Types:** Loose TypeScript for speed, strict for critical code
5. **State:** Context for UI, React Query for server
6. **Components:** shadcn-ui as foundation
7. **Dark Mode:** CSS variables, no JavaScript
8. **Testing:** Playwright for E2E reliability
9. **Backend:** Supabase for simplicity + power

---

**Last Updated:** December 12, 2025  
**Version:** 1.0  
**Status:** Complete
