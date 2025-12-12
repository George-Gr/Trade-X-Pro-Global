# TradePro v10 - CFD Trading Simulation Platform

A broker-independent paper trading platform with unlimited virtual capital, advanced position management, social copy trading, and full regulatory compliance (KYC/AML).

**Trade with confidence. Learn without limits.** 📈

---

## 🎯 What is TradePro v10?

TradePro is a **professional-grade CFD trading simulator** that lets traders practice with:

- **Multi-asset trading**: Forex, stocks, commodities, crypto, indices, ETFs, bonds
- **Unlimited virtual capital**: No demo expiry, no forced resets
- **Social copy trading**: Learn from verified traders in our community network
- **Enterprise compliance**: Full KYC/AML verification with admin oversight
- **Risk management**: Margin calls, liquidation alerts, position monitoring
- **Realtime data**: Live price feeds and technical analysis tools

Perfect for:
- New traders learning the markets
- Experienced traders testing strategies
- Trading educators teaching students
- Financial institutions doing training

---

## 🚀 Quick Start (30 Minutes)

**New to TradePro?** → Start here: [QUICK_START.md](docs/PRIMARY/QUICK_START.md)

Need setup help? Follow these steps:

```bash
# 1. Clone the repository
git clone <repository-url>
cd Trade-X-Pro-Global

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Start development server
npm run dev

# 5. Open in browser
# Visit http://localhost:5173
```

---

## 📚 Documentation Hub

### For Getting Started
- **[README - Documentation Hub](docs/PRIMARY/README.md)** - Role-based navigation
- **[QUICK_START - 30-Min Onboarding](docs/PRIMARY/QUICK_START.md)** - Setup & first trade
- **[DOCUMENTATION_MAP - Find Anything](docs/PRIMARY/DOCUMENTATION_MAP.md)** - Complete index

### For Developers
- **[DEVELOPMENT_SETUP.md](project_resources/development/DEVELOPMENT_SETUP.md)** - Full environment guide
- **[ARCHITECTURE_DECISIONS.md](project_resources/rules_and_guidelines/ARCHITECTURE_DECISIONS.md)** - 9 key decisions explained
- **[STYLE_GUIDE.md](project_resources/rules_and_guidelines/STYLE_GUIDE.md)** - Code conventions
- **[TROUBLESHOOTING.md](project_resources/development/TROUBLESHOOTING.md)** - Problem-solving guide

### For Designers
- **[DESIGN_SYSTEM.md](project_resources/design_system_and_typography/DESIGN_SYSTEM.md)** - Colors, typography, spacing
- **[COMPONENT_API.md](project_resources/components/COMPONENT_API.md)** - Component specs & examples
- **[QUALITY_GATES.md](project_resources/design_system_and_typography/QUALITY_GATES.md)** - Standards & validation
- **[ACCESSIBILITY_STANDARDS.md](project_resources/rules_and_guidelines/ACCESSIBILITY_STANDARDS.md)** - WCAG 2.1 AA compliance

### For Architects
- **[ARCHITECTURE_DECISIONS.md](project_resources/rules_and_guidelines/ARCHITECTURE_DECISIONS.md)** - Technical decisions & rationale
- **[CONTRIBUTING_DESIGN_SYSTEM.md](project_resources/design_system_and_typography/CONTRIBUTING_DESIGN_SYSTEM.md)** - Governance & workflows
- **[PRD.md](PRD.md)** - Product requirements & features

---

## 💻 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite + SWC** - Fast build & development
- **Tailwind CSS v4** - Utility-first styling with CSS variables
- **shadcn-ui** - Component library (Radix UI primitives)

### Backend & Data
- **Supabase** - PostgreSQL, Auth, Realtime, Edge Functions
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Charts & Visualization
- **TradingView Lightweight Charts** - Professional trading charts
- **Recharts** - Data visualization

### Testing & Quality
- **Vitest** - Unit testing
- **Playwright** - End-to-end testing
- **ESLint** - Code quality
- **TypeScript Strict Mode** - Type checking (loose mode by default, strict via tsconfig.strict.json)

### Routing
- **React Router v6** - Client-side routing

---

## 🎨 Design System

TradePro uses a **professional trading interface design system**:

- **4px/8px spacing grid** - Consistent rhythm across UI
- **CSS variables for theming** - Dynamic light/dark modes
- **WCAG 2.1 Level AA** - Accessibility compliance
- **Component-driven architecture** - Reusable, tested components
- **Mobile-responsive design** - Works on all devices

See [DESIGN_SYSTEM.md](project_resources/design_system_and_typography/DESIGN_SYSTEM.md) for complete details.

---

## 📋 Available Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run dev:inspector   # Dev server with debugger

# Building
npm run build           # Production build
npm run preview         # Preview production build locally
npm run build:analyze   # Analyze bundle size (ANALYZE=true npm run build)

# Quality & Testing
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking
npm run test            # Run unit tests (Vitest)
npm run test:watch      # Unit tests in watch mode
npm run test:ui         # Test UI dashboard
npm run test:e2e        # Run E2E tests (Playwright)

# Database & Supabase
npm run supabase:start   # Start local Supabase instance
npm run supabase:stop    # Stop local Supabase instance
npm run supabase:pull    # Pull schema & regenerate types
npm run supabase:push    # Push migrations to Supabase
```

---

## 📦 Project Structure

```
src/
├── components/        # React components (feature-based)
├── hooks/            # Custom React hooks
├── lib/              # Business logic & utilities
├── pages/            # Page components
├── types/            # TypeScript type definitions
├── contexts/         # React context providers
├── styles/           # Global styles
├── integrations/     # External service integration (Supabase)
└── workers/          # Web workers

project_resources/
├── design_system_and_typography/  # Design tokens & system
├── components/                     # Component API reference
├── development/                    # Setup guides
├── rules_and_guidelines/          # Standards & decisions

docs/
├── PRIMARY/          # Main documentation entry point
└── archives/         # Historical documentation
```

---

## 🔐 Environment Setup

Create `.env.local` in the project root with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Get these from your [Supabase project settings](https://supabase.com/dashboard/).

See [DEVELOPMENT_SETUP.md](project_resources/development/DEVELOPMENT_SETUP.md) for full configuration details.

---

## 🤝 Contributing

1. Read [CONTRIBUTING_DESIGN_SYSTEM.md](project_resources/design_system_and_typography/CONTRIBUTING_DESIGN_SYSTEM.md) for design governance
2. Follow [STYLE_GUIDE.md](project_resources/rules_and_guidelines/STYLE_GUIDE.md) for code conventions
3. Check [QUALITY_GATES.md](project_resources/design_system_and_typography/QUALITY_GATES.md) for validation rules
4. Review [ARCHITECTURE_DECISIONS.md](project_resources/rules_and_guidelines/ARCHITECTURE_DECISIONS.md) for design rationale

---

## 🐛 Troubleshooting

Encountering issues? Check [TROUBLESHOOTING.md](project_resources/development/TROUBLESHOOTING.md) organized by category:

- Environment setup errors
- Build errors
- Type errors
- Styling issues
- Component problems
- Testing failures
- Database issues
- Runtime errors

---

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

---

## 📞 Getting Help

| Question | Resource |
|----------|----------|
| How do I set up? | [QUICK_START.md](docs/PRIMARY/QUICK_START.md) |
| How does design system work? | [DESIGN_SYSTEM.md](project_resources/design_system_and_typography/DESIGN_SYSTEM.md) |
| How do I use components? | [COMPONENT_API.md](project_resources/components/COMPONENT_API.md) |
| What are the design decisions? | [ARCHITECTURE_DECISIONS.md](project_resources/rules_and_guidelines/ARCHITECTURE_DECISIONS.md) |
| Where do I find something? | [DOCUMENTATION_MAP.md](docs/PRIMARY/DOCUMENTATION_MAP.md) |
| How do I fix an error? | [TROUBLESHOOTING.md](project_resources/development/TROUBLESHOOTING.md) |
| What are the standards? | [STYLE_GUIDE.md](project_resources/rules_and_guidelines/STYLE_GUIDE.md) & [QUALITY_GATES.md](project_resources/design_system_and_typography/QUALITY_GATES.md) |

---

## 🔄 Deployment

TradePro can be deployed to:

- **Vercel** - Recommended for Vite + React apps
- **Netlify** - Also fully supported
- **Docker** - Custom deployment available
- **Self-hosted** - Node.js server required

Build configuration in `vite.config.ts` and `.netlify/functions/` for Edge Functions.

For production deployment, ensure:
1. `npm run build` completes without errors
2. `npm run test` passes all tests
3. `npm run lint` shows no issues
4. Environment variables are configured
5. Database migrations are applied

---

## 📄 License

[Add your license here]

---

## ✨ Status

**Version:** 2.0  
**Documentation Status:** ✅ Complete & Updated  
**Last Updated:** December 2025

---

## 🎓 Learn More

- [Product Requirements](PRD.md) - Feature specifications & roadmap
- [AI Agent Guide](project_resources/rules_and_guidelines/AGENT.md) - AI coding agent instructions
- [Security Standards](project_resources/rules_and_guidelines/SECURITY.md) - Security requirements

---

**Ready to start?** → [Open QUICK_START.md](docs/PRIMARY/QUICK_START.md) 🚀

