# 🚀 Development Setup & Getting Started

**Version:** 1.0  
**Status:** Complete  
**Last Updated:** December 12, 2025

---

## ⚡ Quick Start (5 Minutes)

### Prerequisites

```bash
node --version    # Should be 18.0.0 or higher
npm --version     # Should be 9.0.0 or higher
git --version     # Any recent version
```

### Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/[your-org]/Trade-X-Pro-Global.git
cd Trade-X-Pro-Global

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Start development server
npm run dev
# Open http://localhost:8080
```

✅ **Done!** App is now running. See [QUICK_START.md](../../docs/PRIMARY/QUICK_START.md) for next steps.

---

## 📋 Complete Setup Guide

### 1. Prerequisites

**Required Software:**

- Node.js 18.0.0+ ([download](https://nodejs.org/))
- npm 9.0.0+ (comes with Node)
- Git ([download](https://git-scm.com/))
- VS Code (recommended, [download](https://code.visualstudio.com/))

**Recommended VS Code Extensions:**

- ESLint (`dbaeumer.vscode-eslint`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
- TypeScript Vue Plugin (`Vue.vscode-typescript-vue-plugin`)

**System Requirements:**

- At least 4GB RAM free
- At least 2GB disk space
- Stable internet connection

### 2. Clone Repository

```bash
# Using HTTPS (recommended for first-time setup)
git clone https://github.com/[your-org]/Trade-X-Pro-Global.git
cd Trade-X-Pro-Global

# OR using SSH (if you have SSH key configured)
git clone git@github.com:[your-org]/Trade-X-Pro-Global.git
cd Trade-X-Pro-Global
```

### 3. Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

**Expected packages (major ones):**

- react@18.x
- vite@5.x
- tailwindcss@4.x
- supabase@2.x
- shadcn-ui components

### 4. Environment Configuration

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...

# Optional: Analytics, API keys, etc.
# Add as needed for your setup
```

**Getting Supabase Credentials:**

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Settings → API
4. Copy URL and Publishable Key into `.env.local`

### 5. Verify Setup

```bash
# Type checking
npm run type-check
# Should show "✓ No errors found"

# Linting
npm run lint
# Should show "0 errors"

# Build preview
npm run build
# Should complete without errors
```

---

## 🔧 Running Development Server

### Start Dev Server

```bash
npm run dev
```

**Output should show:**

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8080/
  ➜  press h + enter to show help
```

Open http://localhost:8080 in your browser.

### Hot Module Replacement (HMR)

Changes to React components automatically reload in browser. No manual refresh needed!

```bash
# Edit a component file (e.g., src/components/Button.tsx)
# Browser updates automatically
```

### Accessing Dev Server from Other Machines

For testing on mobile or other devices:

```bash
# Find your machine IP
ipconfig getifaddr en0    # macOS
hostname -I              # Linux
ipconfig                 # Windows (look for IPv4)

# Access from other device
http://[YOUR_IP]:8080
```

---

## ✅ Quality Checks & Linting

### Type Checking

```bash
npm run type-check
```

Checks TypeScript without building. Run before commits.

### Linting

```bash
npm run lint
```

Checks code style and catches errors. Runs ESLint + Prettier.

### Format Code

```bash
npm run format
```

Automatically formats code to match project standards.

### Fix Linting Issues

```bash
npm run lint -- --fix
```

Automatically fixes fixable issues.

---

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (re-run on file changes)
npm run test -- --watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test src/lib/__tests__/calculations.test.ts
```

**Test files location:** `src/**/__tests__/*.test.ts`

### End-to-End Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e -- e2e/login.spec.ts

# Generate test report
npm run test:e2e -- --reporter=html
```

**Test files location:** `e2e/**/*.spec.ts`

---

## 🏗️ Building for Production

### Development Build

```bash
npm run build
```

Creates optimized bundle in `dist/` folder.

**Build checks:**

- TypeScript type checking ✅
- Linting ✅
- Minification ✅
- Code splitting ✅
- Asset optimization ✅

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally at http://localhost:4173

### Analyze Bundle Size

```bash
ANALYZE=true npm run build
```

Opens bundle analysis in browser. Shows what's taking up space.

---

## 🎨 Design System Validation

### Validate Design Compliance

```bash
npm run validate:design
```

Checks for:

- Hardcoded colors (should use CSS variables)
- Invalid spacing values (should be 4px/8px grid)
- Non-standard border radius
- Font size violations
- Tailwind best practices

**Fix automatically:**

```bash
npm run validate:design -- --fix
```

---

## 📱 Mobile Development

### Test on Mobile Device

```bash
npm run dev

# Then on mobile, visit:
http://[YOUR_COMPUTER_IP]:8080
```

### Simulate Mobile Browsers

Using Chrome DevTools:

1. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. Click Device Toolbar icon (top-left)
3. Select device (iPhone, Android, etc.)

### Mobile-Specific Testing

```bash
# Test at different breakpoints
npm run dev

# Check these sizes in DevTools:
# - 320px (iPhone SE)
# - 640px (iPad)
# - 1024px (desktop)
```

---

## 🗄️ Database Setup

### Pull Latest Schema

```bash
npm run supabase:pull
```

Downloads latest database schema and generates TypeScript types.

**When to run:**

- After schema changes in Supabase
- When team member updates migrations
- Before starting work on new features

### Push Migrations

```bash
npm run supabase:push
```

Applies local migrations to Supabase. Only use if you modified migrations locally.

### Reset Database

```bash
npm run supabase:reset
```

⚠️ **CAUTION:** Deletes all data and resets to base schema. Use only in development!

---

## 🔐 Environment Variables

### Required Variables

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
```

### Optional Variables

```env
# Analytics
VITE_ANALYTICS_ID=optional

# API endpoints
VITE_API_URL=https://api.example.com

# Feature flags
VITE_ENABLE_BETA_FEATURES=false
```

### Never Commit Secrets

```bash
# ✅ GOOD - .env.local is gitignored
.env.local          # Created locally, ignored by git

# ❌ BAD - Don't create these
.env                # Not gitignored, gets committed
.env.production     # Not gitignored, gets committed
```

---

## 🚨 Troubleshooting

### Port 8080 Already in Use

```bash
# Find what's using port 8080
lsof -i :8080           # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill the process or use different port
PORT=3000 npm run dev
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use clean command if available
npm run clean
npm install
```

### TypeScript Errors Won't Go Away

```bash
# Full type check
npm run type-check

# Clear cache and rebuild
rm -rf .vite dist
npm run build
```

### Supabase Connection Failed

1. Check `.env.local` has correct credentials
2. Verify internet connection
3. Verify Supabase project is active
4. Check if IP is allowed in Supabase
5. Try: `npm run supabase:pull`

### Build Fails with "Out of Memory"

```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## 📚 File Organization

### Project Structure

```
Trade-X-Pro-Global/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Business logic (pure functions)
│   ├── contexts/       # React Context
│   ├── types/          # TypeScript types
│   ├── styles/         # Global CSS
│   └── App.tsx         # Root component
├── public/             # Static assets
├── e2e/               # E2E tests
├── supabase/          # Database migrations
├── .env.local         # Local environment (git-ignored)
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Dependencies
```

### Creating New Components

```bash
# Create component folder
mkdir src/components/MyComponent

# Create files
touch src/components/MyComponent/index.tsx
touch src/components/MyComponent/__tests__/index.test.tsx
```

### Adding Dependencies

```bash
# Install new dependency
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Add to Supabase types (if updating schema)
npm run supabase:pull
```

---

## 🔄 Git Workflow

### Before Committing

```bash
# Format code
npm run format

# Type check
npm run type-check

# Lint
npm run lint

# Run tests
npm run test
```

### Committing

```bash
# Stage changes
git add .

# Commit with message
git commit -m "feat: add new feature"

# Push to branch
git push origin feature-branch
```

### Creating PR

1. Push your branch to GitHub
2. Go to repository
3. Click "New Pull Request"
4. Select your branch
5. Add description
6. Request reviewers

---

## 📖 Common Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run preview          # Preview production build
npm run build            # Build for production

# Quality
npm run type-check       # TypeScript check
npm run lint            # Lint code
npm run format          # Format code
npm run validate:design # Check design compliance

# Testing
npm run test            # Run unit tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
npm run test:e2e        # Run E2E tests

# Database
npm run supabase:pull   # Pull schema
npm run supabase:push   # Push migrations
npm run supabase:reset  # Reset database

# Other
npm run clean           # Clean build artifacts
npm run help            # Show all commands
```

---

## ✅ First-Time Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created with Supabase credentials
- [ ] Dev server starts (`npm run dev`)
- [ ] App loads in browser
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tests pass (`npm run test`)
- [ ] Read [QUICK_START.md](../../docs/PRIMARY/QUICK_START.md)

---

## 🆘 Getting Help

**Problem Solving Steps:**

1. Check [TROUBLESHOOTING.md](/project_resources/development/TROUBLESHOOTING.md)
2. Search error message online
3. Check project GitHub Issues
4. Ask in #dev-help Slack channel
5. Schedule pair programming session

**Provide When Asking for Help:**

- Error message (full output)
- Steps to reproduce
- What you've already tried
- Your OS and Node version

---

**Last Updated:** December 12, 2025  
**Version:** 1.0  
**Status:** Complete
