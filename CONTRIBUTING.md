# Contributing to Trade-X-Pro-Global

Thank you for your interest in contributing to Trade-X-Pro-Global! This document provides guidelines and instructions for contributing to our CFD trading simulation platform.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Node.js 18+ ([install nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm 9+ or pnpm 8+
- Git
- Familiarity with React 18, TypeScript, and Vite

### Development Setup

```bash
# Clone the repository
git clone https://github.com/George-Gr/Trade-X-Pro-Global.git
cd Trade-X-Pro-Global

# Install dependencies
npm install
# or
pnpm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

## Development Workflow

### 1. Branch Naming Convention

Follow the naming pattern: `{type}/{description}`

- `feature/add-margin-calculator` - New feature
- `fix/liquidation-engine-bug` - Bug fix
- `docs/api-documentation` - Documentation
- `refactor/optimize-realtime-subscriptions` - Code refactoring
- `test/increase-coverage` - Testing improvements
- `chore/update-dependencies` - Maintenance

### 2. Commit Convention

Use conventional commits for clear commit history:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semicolons, etc.)
- `refactor:` - Code refactoring without feature changes
- `perf:` - Performance improvements
- `test:` - Test additions or changes
- `chore:` - Build process, dependency updates
- `ci:` - CI/CD configuration changes

**Scope** (optional): Area of code affected (e.g., `trading`, `kyc`, `dashboard`)

**Examples**:
```
feat(trading): add stop-loss execution engine
fix(margin): correct liquidation threshold calculation
docs(setup): add environment variable guide
refactor(hooks): extract useRealtimePositions logic
```

### 3. Code Style

- Run `npm run lint` before committing
- Use `npm run lint --fix` to auto-fix issues
- Follow ESLint configuration in `eslint.config.js`
- Ensure TypeScript strict mode passes: `npm run type:strict`
- Use `const` by default, `let` when needed, avoid `var`

### 4. Testing Requirements

All new code must include tests:

```bash
# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test -- --coverage

# Run E2E tests
npm run test:e2e
```

**Test Coverage Minimums**:
- Business logic: 100% coverage
- Components: 80% coverage
- Utilities: 100% coverage

### 5. Component Guidelines

Review `/docs/project_resources/rules_and_guidelines/AGENT.md` for:
- Component architecture patterns
- Props interface design
- State management approach
- Realtime subscription cleanup
- Error handling patterns
- TypeScript best practices

Key principles:
- Keep components < 300 lines
- Extract reusable hooks
- Use TypeScript `interface` for props
- Always cleanup subscriptions in `useEffect`
- Handle Supabase errors gracefully

### 6. Frontend Design System

All UI changes must follow the unified design system:

**Colors** (Authoritative):
- Deep Navy: `#0A1628` (primary)
- Warm Gold: `#F39C12` (premium accents, max 5%)
- Emerald Green: `#00C896` (buy/profit)
- Crimson Red: `#FF4757` (sell/loss)
- Warm White: `#FAFAF5` (light background)
- Dark Charcoal: `#2C3E50` (dark background)

**Typography**:
- **Headings (H1-H5)**: Inter (700, 600 weights)
- **Body**: Inter (400 weight)
- **Data/Code**: JetBrains Mono

**Spacing**: 8px grid system

Reference: `/docs/frontend/final_documents/Unified-Frontend-Guidelines.md`

## Pull Request Process

### Before Submitting

1. Update `CHANGELOG.md` with your changes
2. Ensure all tests pass: `npm run test`
3. Check linting: `npm run lint`
4. Verify type safety: `npm run type:strict`
5. Test in browser: `npm run dev`
6. Create a feature branch from `main`

### PR Description Template

```markdown
## Description
Brief summary of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Changes
- Change 1
- Change 2

## Testing
- Test 1
- Test 2

## Related Issues
Closes #123

## Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] Types pass (type:strict)
- [ ] CHANGELOG.md updated
- [ ] Documentation updated (if needed)
```

### Review Process

- Maintainers will review within 2-3 business days
- Address feedback promptly
- Ensure all CI checks pass
- Get approval from at least one maintainer
- Squash commits if requested

## Documentation Standards

### Code Comments

Use JSDoc for exported functions:

```typescript
/**
 * Calculate required margin for a position
 * @param notionalValue - Position value in account currency
 * @param leverage - Fixed leverage for asset class
 * @returns Required margin in account currency
 */
export const calculateRequiredMargin = (
  notionalValue: number,
  leverage: number
): number => {
  return notionalValue / leverage;
};
```

### Markdown Documentation

- Use clear, concise language
- Include code examples where applicable
- Keep lines under 100 characters
- Use consistent heading hierarchy
- Add table of contents for documents > 1000 words
- Link to related documentation

## Performance Guidelines

- Lighthouse score must be 90+ before merge
- First Contentful Paint (FCP) target: < 1.5s
- Largest Contentful Paint (LCP) target: < 2.5s
- Cumulative Layout Shift (CLS) target: < 0.1
- Interactive (TTI) target: < 3.8s

Run local audit: `npm run build && npm run preview` then use Chrome DevTools Lighthouse

## Security Guidelines

- Never commit secrets or API keys
- Use `.env.example` for environment variable templates
- Always sanitize user input
- Validate data on both client and server
- Use Supabase Row-Level Security policies
- Keep dependencies updated: `npm audit fix`

## Accessibility Requirements

All components must meet WCAG 2.1 AA standards:

- [ ] Keyboard navigable
- [ ] Focus indicators visible
- [ ] Color not sole information source
- [ ] Text contrast ≥ 4.5:1 (normal), ≥ 3:1 (large)
- [ ] ARIA labels where appropriate
- [ ] Alt text for images
- [ ] Form labels associated with inputs

Run accessibility tests: `npm run test -- --coverage` with jest-axe

## Getting Help

- **Documentation**: `/docs/` folder and [PRD.md](PRD.md)
- **Design System**: `/docs/frontend/final_documents/Unified-Frontend-Guidelines.md`
- **Architecture**: `/docs/project_resources/rules_and_guidelines/AGENT.md`
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Start a discussion for questions and ideas

## Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` (maintained separately)
- GitHub commit history
- Release notes

## License

By contributing to Trade-X-Pro-Global, you agree that your contributions will be licensed under the MIT License. See [LICENSE](LICENSE) file for details.

---

**Thank you for contributing to Trade-X-Pro-Global! 🚀**
