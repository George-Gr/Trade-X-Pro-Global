# 🔧 Troubleshooting Guide

**Version:** 1.0  
**Status:** Complete  
**Last Updated:** December 12, 2025

---

## 🎯 Quick Problem Finder

| Problem | Section | Solution |
|---------|---------|----------|
| Port 8080 in use | Environment Issues | Kill process or use different port |
| Module not found | Build Errors | Reinstall dependencies |
| TypeScript errors | Type Check Errors | Clear cache and rebuild |
| Styling not applied | Styling Issues | Check Tailwind classes, CSS variables |
| Component not rendering | Component Issues | Check browser console, React DevTools |
| Design validation failing | Design System | Use `npm run validate:design --fix` |
| Tests failing | Testing Issues | Check test file, run with --watch |
| Build fails | Build Errors | Check console output, increase memory |

---

## 🌐 Environment Issues

### Port 8080 Already in Use

**Problem:**
```
Error: listen EADDRINUSE: address already in use :::8080
```

**Solutions:**

**Option 1: Kill existing process**
```bash
# macOS/Linux
lsof -i :8080 | grep LISTEN
kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Option 2: Use different port**
```bash
PORT=3000 npm run dev
# Now access http://localhost:3000
```

**Option 3: Restart machine**
```bash
# If above doesn't work, restart your computer
```

### Supabase Connection Failed

**Problem:**
```
Error: Failed to connect to Supabase
Error: Invalid API key
```

**Solutions:**

1. **Check credentials in `.env.local`**
```bash
cat .env.local
# Should show:
# VITE_SUPABASE_URL=https://xxx.supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

2. **Verify credentials are correct**
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Select your project
   - Settings → API
   - Copy exact URL and Publishable Key
   - Update `.env.local`
   - Restart dev server: `npm run dev`

3. **Check Supabase status**
   - Verify project is active in dashboard
   - Check if IP is whitelisted (usually not needed)
   - Try logging into Supabase dashboard directly

4. **Clear cache and retry**
```bash
rm -rf node_modules .vite dist
npm install
npm run dev
```

### Environment Variable Not Loaded

**Problem:**
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)  // undefined
```

**Solutions:**

1. **Restart dev server after changing `.env.local`**
```bash
# Stop server (Ctrl+C)
# Edit .env.local
npm run dev  # Restart
```

2. **Use correct prefix for Vite variables**
```bash
# ✅ CORRECT - Vite exposes VITE_* variables
VITE_SUPABASE_URL=...

# ❌ WRONG - Without VITE_ prefix, not exposed to frontend
SUPABASE_URL=...
```

3. **Check variable is actually defined**
```bash
grep VITE_SUPABASE_URL .env.local
# Should show the value
```

---

## 🏗️ Build Errors

### Module Not Found Error

**Problem:**
```
Error: Cannot find module '@/components/Button'
Error: Module not found: ./missing-file.tsx
```

**Solutions:**

1. **Check file path is correct**
```bash
# Check if file exists
ls src/components/Button.tsx

# If not, create it or fix the path
# Check that @ alias is configured in vite.config.ts
```

2. **Reinstall dependencies**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

3. **Clear caches**
```bash
npm run clean
npm install
npm run dev
```

### Import Path Issues

**Problem:**
```
Error: Cannot find module '@/integrations/supabase/client'
```

**Solutions:**

```bash
# ✅ CORRECT - Use @ alias for imports
import { supabase } from '@/integrations/supabase/client'

# ❌ WRONG - Don't use relative paths for shared code
import { supabase } from '../../../integrations/supabase/client'

# Check aliases in vite.config.ts and tsconfig.json
```

### Build Out of Memory

**Problem:**
```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
```

**Solutions:**

```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
# or
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```

### Build Takes Too Long

**Problem:**
```
Build takes > 2 minutes
```

**Solutions:**

```bash
# Check bundle size
ANALYZE=true npm run build

# Remove unused dependencies
npm prune --production

# Check if large libraries can be replaced
# Ask team lead about build optimization
```

---

## 📝 Type Check Errors

### TypeScript "Property does not exist" Error

**Problem:**
```
Error: Property 'color' does not exist on type 'Props'
```

**Solutions:**

1. **Add property to type definition**
```tsx
// ❌ WRONG
interface Props {
  title: string
}

// ✅ CORRECT
interface Props {
  title: string
  color?: string
}
```

2. **Use correct import for types**
```tsx
// ❌ WRONG - Missing 'type' keyword
import { Props } from './types'

// ✅ CORRECT
import type { Props } from './types'
```

3. **Check if type exists**
```bash
npm run type-check
# Shows all type errors with line numbers
```

### "Cannot find name" Error

**Problem:**
```
Error: Cannot find name 'FormData'
Error: Cannot find name 'fetch'
```

**Solutions:**

1. **Check TypeScript config has correct lib**
```json
// tsconfig.json should include:
"lib": ["ES2020", "DOM", "DOM.Iterable"]
```

2. **Add type declaration file**
```bash
touch src/types/globals.d.ts
# Add: declare const FormData: typeof FormData
```

3. **Restart TypeScript server**
   - VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"

### React Component Return Type Error

**Problem:**
```
Error: JSX element type 'Component' does not have any construct or call signatures
```

**Solutions:**

```tsx
// ✅ CORRECT
import type { FC } from 'react'

const MyComponent: FC = () => {
  return <div>Content</div>
}

// ✅ ALSO CORRECT
function MyComponent() {
  return <div>Content</div>
}

// ❌ WRONG
const MyComponent = () => {
  return <div>Content</div>
} // Missing return type
```

---

## 🎨 Styling Issues

### Tailwind Classes Not Applied

**Problem:**
```html
<!-- Not styled -->
<div className="text-red-600 bg-blue-500">No color</div>
```

**Solutions:**

1. **Check Tailwind is configured**
```bash
grep tailwindcss tailwind.config.ts
# Should exist and be configured
```

2. **Verify file is included in Tailwind scanning**
```javascript
// tailwind.config.js
content: [
  "./src/**/*.{js,ts,jsx,tsx}",  // Make sure this includes your files
]
```

3. **Restart dev server**
```bash
# Stop: Ctrl+C
npm run dev
```

4. **Don't use arbitrary values**
```tsx
// ❌ WRONG - Won't work
<div className="text-[#FF0000]">Red text</div>

// ✅ CORRECT - Use predefined colors
<div className="text-red-600">Red text</div>

// ✅ CORRECT - Use CSS variables
<div className="text-primary">Primary color</div>
```

### CSS Variables Not Working

**Problem:**
```javascript
const color = 'hsl(var(--primary))'  // undefined
```

**Solutions:**

1. **Check CSS variable is defined in styles**
```bash
grep "primary:" src/styles/variables.css
# Should show: --primary: 262 83% 58%
```

2. **Use correct syntax in TypeScript**
```tsx
// ❌ WRONG
style={{ color: 'hsl(var(--primary))' }}

// ✅ CORRECT
style={{ color: 'hsl(var(--primary))' }}

// ✅ BETTER - Use Tailwind
className="text-primary"
```

3. **Check dark mode is working**
```tsx
// Browser DevTools → Elements
// <html> should have class="dark" in dark mode
```

### Design System Validation Failing

**Problem:**
```
Design validation failed:
- Found hardcoded color #FF0000
- Found spacing value 13px (not 4/8px grid)
```

**Solutions:**

```bash
# See all violations
npm run validate:design

# Auto-fix violations
npm run validate:design -- --fix

# Manual fix
# 1. Search for hardcoded value
# 2. Replace with CSS variable or Tailwind class
# 3. Run validation again
```

---

## ⚛️ Component Issues

### Component Not Rendering

**Problem:**
```
Page loads but component is not visible
```

**Solutions:**

1. **Check browser console for errors**
   - Press F12 → Console
   - Look for red error messages
   - Note the error and search in this guide

2. **Check React DevTools**
   - Install React DevTools browser extension
   - Check component tree exists
   - Check component props are correct

3. **Check if component is imported**
```tsx
// ❌ WRONG - Not imported
<MyComponent />

// ✅ CORRECT
import { MyComponent } from '@/components/MyComponent'
<MyComponent />
```

4. **Check rendering logic**
```tsx
// ❌ WRONG - Conditional might be false
{showComponent && <Component />}

// ✅ CORRECT - Debug to see if condition is true
{showComponent && <Component />}
// Add console.log('showComponent:', showComponent)
```

### Form Not Submitting

**Problem:**
```
Form visible but doesn't submit when clicking button
```

**Solutions:**

1. **Check button has type="submit"**
```tsx
// ❌ WRONG
<button onClick={handleSubmit}>Submit</button>

// ✅ CORRECT
<button type="submit">Submit</button>
```

2. **Check form wraps inputs**
```tsx
// ✅ CORRECT
<form onSubmit={form.handleSubmit(onSubmit)}>
  <Input />
  <Button type="submit">Submit</Button>
</form>

// ❌ WRONG - Button outside form
<form onSubmit={form.handleSubmit(onSubmit)}>
  <Input />
</form>
<Button type="submit">Submit</Button>
```

3. **Check validation isn't blocking**
```bash
# Open browser console
# Try submitting form
# Check for validation errors
# Fix validation in schema
```

### Modal/Dialog Not Closing

**Problem:**
```
Dialog/Modal opens but won't close
```

**Solutions:**

```tsx
// ❌ WRONG - Missing state management
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <Button>Close</Button>
  </DialogContent>
</Dialog>

// ✅ CORRECT
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <Button onClick={() => setOpen(false)}>Close</Button>
  </DialogContent>
</Dialog>
```

---

## 🧪 Testing Issues

### Tests Failing

**Problem:**
```
FAIL  src/components/Button.test.tsx
  ✕ renders correctly (15ms)
    ReferenceError: fetch is not defined
```

**Solutions:**

1. **Check test setup**
```bash
# Make sure vitest.setup.ts exists and is configured
grep setup vitest.config.ts
```

2. **Mock external APIs**
```typescript
// In your test file
global.fetch = vi.fn(() =>
  Promise.resolve({ ok: true, json: () => ({}) })
)
```

3. **Run tests with debugging**
```bash
npm run test -- --reporter=verbose
npm run test -- --watch  # Re-run on file changes
```

4. **Check imports in test**
```tsx
// ✅ CORRECT
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ❌ WRONG - Missing imports
render(<Component />)  // render is not defined
```

### Test Timeout

**Problem:**
```
Timeout: Task timed out after 5000ms
```

**Solutions:**

```typescript
// Increase timeout
it('should do something async', async () => {
  // test code
}, 10000)  // 10 second timeout

// Or globally in vitest.config.ts
testTimeout: 10000
```

### Cannot Find Test File

**Problem:**
```
Error: Cannot find test file for components/Button.tsx
```

**Solutions:**

Create test file in right location:
```bash
# Create test file
mkdir -p src/components/Button/__tests__
touch src/components/Button/__tests__/index.test.tsx

# ✅ CORRECT LOCATIONS
src/components/Button/__tests__/index.test.tsx
src/lib/__tests__/utils.test.ts
src/hooks/__tests__/useCustom.test.ts
```

---

## 🗄️ Database Issues

### Cannot Connect to Supabase

**Problem:**
```
Error: Connection refused
Error: getaddrinfo ENOTFOUND
```

**Solutions:**

```bash
# 1. Check internet connection
ping google.com

# 2. Try pulling schema again
npm run supabase:pull

# 3. Check Supabase project is active
# Go to https://app.supabase.com and verify

# 4. Check credentials
cat .env.local | grep SUPABASE
```

### Database Schema Out of Sync

**Problem:**
```
Column 'new_column' does not exist
```

**Solutions:**

```bash
# Pull latest schema from Supabase
npm run supabase:pull

# This regenerates src/integrations/supabase/types.ts
# Commit the changes
```

### Types Not Updated After Schema Change

**Problem:**
```
Type 'user' is not assignable to type 'never'
```

**Solutions:**

```bash
# Regenerate types from Supabase
npm run supabase:pull

# Clear cache
rm -rf node_modules/.vite

# Type check
npm run type-check

# If still wrong, restart TypeScript server in VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

---

## 🚨 Runtime Issues

### Blank White Page

**Problem:**
```
App loads but shows blank white page
```

**Solutions:**

1. **Open browser console (F12)**
   - Check for red JavaScript errors
   - Look for the error message
   - Debug from there

2. **Check if React is rendering**
```javascript
// In browser console
document.getElementById('root')
// Should show <div id="root"> with content
```

3. **Check main.tsx is correct**
```typescript
// src/main.tsx should have:
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### Memory Leak Warning in Console

**Problem:**
```
Warning: An update to Component inside a StrictMode tree is not wrapped in act(...)
```

**Solutions:**

```tsx
// ✅ CORRECT - Cleanup effect
useEffect(() => {
  const subscription = supabase.on('change', handler).subscribe()
  
  return () => {
    supabase.removeChannel(subscription)  // Cleanup!
  }
}, [])

// ❌ WRONG - No cleanup
useEffect(() => {
  const subscription = supabase.on('change', handler).subscribe()
  // Missing return cleanup
}, [])
```

### Console Error: "Cannot find module"

**Problem:**
```
Uncaught Error: Cannot find module '@/lib/utils'
```

**Solutions:**

1. **Check module path exists**
```bash
ls src/lib/utils.ts
```

2. **Check import path matches**
```tsx
// If file is src/lib/utils.ts, import should be:
import { helper } from '@/lib/utils'
```

3. **Check @ alias is configured**
```javascript
// vite.config.ts should have:
resolve: {
  alias: {
    '@': '/src',
  },
}
```

---

## 🆘 Getting Help

### Debugging Checklist

Before asking for help, try:
- [ ] Read relevant section in this guide
- [ ] Check browser console for errors (F12)
- [ ] Run `npm run lint` and `npm run type-check`
- [ ] Restart dev server: Ctrl+C then `npm run dev`
- [ ] Clear cache: `rm -rf .vite node_modules/.vite`
- [ ] Restart VS Code
- [ ] Restart computer if nothing works

### Information to Provide When Asking

```
1. Error message (copy full message)
2. Steps to reproduce (exact steps)
3. What you've already tried
4. OS and Node version:
   - node --version
   - npm --version
   - uname -a (or system info)
5. Error stack trace if available
```

### Where to Get Help

1. **Search this guide** (Ctrl+F for error keyword)
2. **Check [WebAIM](https://webaim.org/)** (a11y issues)
3. **Check [Stack Overflow](https://stackoverflow.com/)** (search error)
4. **Ask in #dev-help** Slack channel
5. **Schedule pairing session** with team

---

**Last Updated:** December 12, 2025  
**Version:** 1.0  
**Status:** Complete
