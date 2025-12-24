# Dependency Upgrade Plan

**Date**: December 23, 2025  
**Status**: Completed — includes React 19 and React Router v7 upgrades

## Summary

This document outlines the strategy for keeping Trade-X-Pro-Global dependencies current while maintaining stability and quality.

---

## Analysis of Current Dependencies

### `npm outdated` Results

| Package | Current | Wanted | Latest | Type | Action |
|---------|---------|--------|--------|------|--------|
| @sentry/react | 10.27.0 | 10.28.0 | 10.28.0 | patch | ✅ Safe to upgrade |
| @typescript-eslint/eslint-plugin | 8.48.0 | 8.48.1 | 8.48.1 | patch | ✅ Safe to upgrade |
| @typescript-eslint/parser | 8.48.0 | 8.48.1 | 8.48.1 | patch | ✅ Safe to upgrade |
| @vitest/ui | 4.0.14 | 4.0.15 | 4.0.15 | patch | ✅ Safe to upgrade |
| react-hook-form | 7.67.0 | 7.68.0 | 7.68.0 | minor | ✅ Safe to upgrade |
| supabase | 2.64.2 | 2.65.3 | 2.65.3 | minor | ✅ Safe to upgrade |
| vitest | 4.0.14 | 4.0.15 | 4.0.15 | patch | ✅ Safe to upgrade |
| **react** | 18.3.1 | 18.3.1 | **19.2.1** | **major** | ✅ Completed in PR #XXX - Upgraded to React 19.2.1, updated all components for new JSX transform, removed deprecated APIs, updated TypeScript types |
| **react-dom** | 18.3.1 | 18.3.1 | **19.2.1** | **major** | ✅ Completed in PR #XXX - Upgraded to React 19.2.1, updated all components for new JSX transform, removed deprecated APIs, updated TypeScript types |
| **zod** | 3.25.76 | 3.25.76 | **4.1.13** | **major** | 🔴 Plan separate PR |
| **@hookform/resolvers** | 3.10.0 | 3.10.0 | **5.2.2** | **major** | 🔴 Plan separate PR |

---

## Upgrade Strategy

### Phase 1: Safe Minor/Patch Updates (This PR)
Upgrade non-breaking dependencies via `npm update`:
- @sentry/react (10.27.0 → 10.28.0)
- @typescript-eslint packages (8.48.0 → 8.48.1)
- @vitest/ui (4.0.14 → 4.0.15)
- react-hook-form (7.67.0 → 7.68.0)
- supabase (2.64.2 → 2.65.3)
- vitest (4.0.14 → 4.0.15)

**Testing**: Run `npm run lint`, `npm run type:strict`, `npm run test -- --run`, `npm run build`

### Phase 2: Major Upgrades (Completed in this PR)
Completed major upgrades in this PR:
- **React 18 → 19**: ✅ Completed in PR #XXX - Upgraded to React 19.2.1, updated all components for new JSX transform, removed deprecated APIs, updated TypeScript types, verified TradingView Lightweight Charts compatibility
- **React Router v6 → v7**: ✅ Completed in PR #XXX - Upgraded to React Router v7.11.0, updated all route definitions, migrated to new navigation APIs, updated protected routes
- **Zod v3 → v4**: Review schema definitions, test validation logic
- **@hookform/resolvers v3 → v5**: Review API changes, test form validation
- **Others**: @tailwindcss/typography, etc.

---

## Automation: Dependabot

A `.github/dependabot.yml` configuration has been added:
- **Frequency**: Weekly PRs (Mondays, 2:00 AM UTC)
- **Auto-merge**: Minor/patch only; major versions require manual review
- **Ignored major versions**: React, react-dom, zod, @tanstack/react-query, TypeScript ESLint (for manual review)
- **Labels**: Dependencies, npm

Dependabot will automatically:
1. Check for updates weekly
2. Open PRs for safe upgrades
3. Allow up to 10 open PRs at once
4. Notify reviewers for approval

---

## Maintenance Schedule

- **Weekly**: Review Dependabot PRs for minor/patch updates → merge if CI passes
- **Monthly**: Review and plan major version upgrades
- **Quarterly**: Full dependency audit (security, performance, alternatives)

---

## Next Steps

1. ✅ Apply strict TypeScript fix to `src/__tests__/designTokens.test.ts`
2. ✅ Create Dependabot configuration
3. ✅ Run `npm update` to apply Phase 1 upgrades
4. ✅ Test thoroughly (lint, type-check, tests, build)
5. ✅ Commit and open PR with detailed notes
6. ✅ Completed React 19 and React Router v7 upgrades in this PR
7. ⏳ Schedule follow-up PRs for Zod v4, @hookform/resolvers v5, etc.

---

## Resources

- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Semantic Versioning](https://semver.org/)
