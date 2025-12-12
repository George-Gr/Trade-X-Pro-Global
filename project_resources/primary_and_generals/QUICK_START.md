# ⚡ Quick Start - Get Up to Speed in 30 Minutes

**Perfect for:** New developers, first time contributors, anyone new to TradePro v10

---

## 🎯 Goal

By the end of this guide (30 minutes), you'll:
- ✅ Understand the project structure
- ✅ Have development environment running
- ✅ Know where to find information
- ✅ Be ready for your first task

---

## Part 1: Environment Setup (10 minutes)

### Prerequisites
- Node.js 18+ (`node --version`)
- npm 9+ (`npm --version`)
- Git installed (`git --version`)
- VS Code (optional but recommended)

### Clone & Setup

```bash
# Clone repository
git clone https://github.com/[org]/Trade-X-Pro-Global.git
cd Trade-X-Pro-Global

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials:
# VITE_SUPABASE_URL=https://[project].supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...

# Verify everything works
npm run type-check && npm run build
```

### Start Development Server

```bash
npm run dev
# Open http://localhost:8080
```

✅ **If you see the app running, environment setup is complete!**

---

## Part 2: Project Overview (5 minutes)

### Tech Stack at a Glance

```
Frontend:      React 18 + TypeScript + Vite
UI:            shadcn-ui + Tailwind CSS v4
State:         React Context + React Query
Database:      Supabase (PostgreSQL + Auth)
Testing:       Vitest (unit) + Playwright (E2E)
Charts:        TradingView Lightweight Charts
```

### Folder Structure

```
src/
├── components/       # React components (by feature)
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── lib/             # Business logic (pure functions)
├── contexts/        # React Context
├── styles/          # Global CSS + design tokens
└── types/           # TypeScript type definitions

project_resources/
├── design_system_and_typography/  # Design specs
├── rules_and_guidelines/          # Code & architecture
├── components/                    # Component specs
└── development/                   # Setup & troubleshooting

docs/
├── PRIMARY/         # Start here (you are here!)
└── archives/        # Historical reference
```

---

## Part 3: Understanding Design System (10 minutes)

### Three Key Files to Know

#### 1. **DESIGN_SYSTEM.md** - The Design Blueprint
What: Colors, typography, spacing, component guidelines  
When: Reference when styling components  
Example: "What sizes are buttons?" → Check DESIGN_SYSTEM.md

#### 2. **COMPONENT_API.md** - Component Reference
What: Complete specifications for each component  
When: Building UI with components  
Example: "How do I make a button disabled?" → Check COMPONENT_API.md

#### 3. **STYLE_GUIDE.md** - Code Standards
What: TypeScript, React, Tailwind, naming conventions  
When: Writing code that follows project standards  
Example: "How should I name files?" → Check STYLE_GUIDE.md

### Quick Design System Rules

**Colors** - Use CSS variables (never hardcode)
```tsx
// ❌ WRONG
<div style={{ color: '#FF0000' }}>Error</div>

// ✅ RIGHT
<div className="text-red-600">Error</div>
```

**Spacing** - Use 4px/8px grid (via Tailwind)
```tsx
// ❌ WRONG
<div style={{ padding: '15px' }}>Content</div>

// ✅ RIGHT
<div className="p-4">Content</div>  {/* 16px = 4×4px */}
```

**Typography** - Use predefined scale
```tsx
// ❌ WRONG
<h1 style={{ fontSize: '30px' }}>Title</h1>

// ✅ RIGHT
<h1 className="text-2xl font-bold">Title</h1>
```

---

## Part 4: Finding Your Way (5 minutes)

### Navigation Map

```
📚 Where to Find Things:

Design Questions
└─ DESIGN_SYSTEM.md (colors, typography, spacing)
   
Component Questions  
└─ COMPONENT_API.md (props, usage examples, do's/don'ts)

Code Style Questions
└─ STYLE_GUIDE.md (naming, patterns, conventions)

"How do I...?" Questions
└─ TROUBLESHOOTING.md (common problems & solutions)

Setup/Environment Questions
└─ DEVELOPMENT_SETUP.md (install, config, build)

Accessibility Questions
└─ ACCESSIBILITY_STANDARDS.md (WCAG, testing, requirements)

Architecture Questions
└─ ARCHITECTURE_DECISIONS.md (why we made decisions)
```

### Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server
npm run type-check      # Check TypeScript
npm run lint            # Check code style

# Testing
npm run test            # Run unit tests
npm run test:e2e        # Run end-to-end tests
npm run test:coverage   # See coverage report

# Design System
npm run validate:design # Validate design compliance

# Build
npm run build           # Build for production
npm run preview         # Preview production build
```

---

## ✅ Checklist - You're Ready When...

- [ ] ✅ Environment set up (npm install completed)
- [ ] ✅ Dev server running (http://localhost:8080 works)
- [ ] ✅ You can see the app in browser
- [ ] ✅ You know about DESIGN_SYSTEM.md
- [ ] ✅ You know about COMPONENT_API.md
- [ ] ✅ You know about STYLE_GUIDE.md
- [ ] ✅ You know about TROUBLESHOOTING.md
- [ ] ✅ You bookmarked DOCUMENTATION_MAP.md

---

## 🚀 Your First Task Ideas

### Task 1: Explore the Codebase (15 minutes)
```
1. Open src/pages/ - Look at a page component
2. Find the components it uses in src/components/
3. Reference those components in COMPONENT_API.md
4. Understand the structure
```

### Task 2: Make a Small Style Change (20 minutes)
```
1. Find a button in the app
2. Check COMPONENT_API.md for button variants
3. Try changing the variant
4. See the change in dev server (hot reload!)
```

### Task 3: Add Component to Page (30 minutes)
```
1. Pick a page in src/pages/
2. Find a component you want to add in COMPONENT_API.md
3. Copy the example code
4. Add it to your page
5. Test in browser
```

---

## 📞 Getting Help

### Common Questions

**Q: "Where do I put new files?"**  
A: See STYLE_GUIDE.md - File Organization section

**Q: "How do I use a component?"**  
A: Check COMPONENT_API.md for that component

**Q: "What's the design for this?"**  
A: Check DESIGN_SYSTEM.md

**Q: "My code has an error"**  
A: Check TROUBLESHOOTING.md for that error type

**Q: "Why do we do it this way?"**  
A: Check ARCHITECTURE_DECISIONS.md

### Still Stuck?

1. **Search the docs** - Use Ctrl+F in the document
2. **Check DOCUMENTATION_MAP.md** - Find the right doc
3. **Ask in Slack** - #engineering-help channel
4. **Ask a teammate** - They're familiar with the code

---

## 📚 Next Steps

**After completing this guide:**

1. ✅ Pick your **first real task** (check with tech lead)
2. ✅ Reference **DESIGN_SYSTEM.md** and **COMPONENT_API.md** as you code
3. ✅ Follow **STYLE_GUIDE.md** for code conventions
4. ✅ Run `npm run lint` before committing
5. ✅ Ask questions in **#engineering-help** Slack

---

## 🎓 Recommended Reading Order

After this quick start, read these in order:

1. ✅ **This file** (QUICK_START.md) - You just read it!
2. **[ARCHITECTURE_DECISIONS.md](/project_resources/rules_and_guidelines/ARCHITECTURE_DECISIONS.md)** (15 min)
   - Understand why we made key technical decisions
3. **[STYLE_GUIDE.md](/project_resources/rules_and_guidelines/STYLE_GUIDE.md)** (30 min)
   - Learn code conventions and patterns
4. **[DESIGN_SYSTEM.md](/project_resources/design_system_and_typography/DESIGN_SYSTEM.md)** (30 min)
   - Reference when building UI

---

**Welcome to the team! You're ready to start contributing. Let's build something great! 🚀**

---

**Created:** December 12, 2025  
**Last Updated:** December 12, 2025  
**Version:** 1.0
