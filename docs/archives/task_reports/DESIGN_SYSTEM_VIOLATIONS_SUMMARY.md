# ⚡ Design System Audit - Violations Quick Reference

**Generated:** December 13, 2025  
**Compliance:** 92% → Target: 98%+

---

## 🔴 Critical Violations (Must Fix Today)

### 1. Legacy Non-Grid Spacing Values in tailwind.config.ts

**File:** `tailwind.config.ts` (lines 50-55)  
**Severity:** CRITICAL  
**Impact:** Violates QUALITY_GATES requirement for 4/8px grid

```typescript
// ❌ REMOVE THESE 7 VALUES:
'4.5': '1.125rem',    // 18px
'13': '3.25rem',      // 52px
'15': '3.75rem',      // 60px
'18': '4.5rem',       // 72px
'22': '5.5rem',       // 88px
'26': '6.5rem',       // 104px
'30': '7.5rem',       // 120px
```

**Fix Time:** 15 minutes  
**Verification:** npm run build, check for spacing errors

---

### 2. Undefined CSS Variables in accessibility.css

**File:** `src/styles/accessibility.css` (lines 60-85)  
**Severity:** HIGH  
**Impact:** 10 utility classes reference undefined variables

**Missing Definitions:**
```
--primary-contrast-bg
--primary-contrast-fg
--secondary-contrast-bg
--secondary-contrast-fg
--success-contrast-bg
--success-contrast-fg
--warning-contrast-bg
--warning-contrast-fg
--danger-contrast-bg
--danger-contrast-fg
```

**Add to src/index.css @layer base:**
```css
--primary-contrast-bg: 0 0% 100%;
--primary-contrast-fg: 222 47% 11%;
--secondary-contrast-bg: 220 14% 96%;
--secondary-contrast-fg: 220 9% 35%;
--success-contrast-bg: 160 84% 39%;
--success-contrast-fg: 0 0% 100%;
--warning-contrast-bg: 38 92% 50%;
--warning-contrast-fg: 0 0% 100%;
--danger-contrast-bg: 0 84% 60%;
--danger-contrast-fg: 0 0% 100%;
```

**Fix Time:** 30 minutes  
**Verification:** Check browser dev tools, no CSS warnings

---

## 🟡 High-Priority Issues (Fix This Week)

### 3. Hardcoded Easing Functions

**File:** `src/styles/micro-interactions.css`  
**Severity:** MEDIUM  
**Impact:** 2 instances of hardcoded easing instead of CSS variables

**Location 1 - Line 33:**
```css
// ❌ WRONG
animation: ripple var(--duration-slow) ease-out forwards;

// ✅ CORRECT
animation: ripple var(--duration-slow) var(--ease-out) forwards;
```

**Location 2 - Line 187:**
```css
// ❌ WRONG
animation: scale-bounce var(--duration-normal) ease-in-out infinite;

// ✅ CORRECT
animation: scale-bounce var(--duration-normal) var(--ease-in-out) infinite;
```

**Fix Time:** 15 minutes  
**Search:** grep for "ease-" without "var(" in micro-interactions.css

---

### 4. Hardcoded Colors in JavaScript

**File:** `src/lib/accessibility.tsx` (lines 367-375)  
**Severity:** MEDIUM  
**Impact:** 9 hex color values hardcoded instead of using CSS variables

**Current State:**
```typescript
primaryContrast: '#FFFFFF'        // ❌
secondary: '#6B7280'              // ❌
secondaryContrast: '#374151'      // ❌
success: '#16A34A'                // ❌
successContrast: '#FFFFFF'        // ❌
warning: '#D97706'                // ❌
warningContrast: '#FFFFFF'        // ❌
danger: '#DC2626'                 // ❌
dangerContrast: '#FFFFFF'         // ❌
```

**Solution Options:**
1. Create getter function from CSS variables
2. Import from design system config
3. Use color conversion utilities

**Fix Time:** 1-2 hours  
**Testing:** Verify color values match design system

---

### 5. Responsive Design Documentation Gap

**File:** `project_resources/design_system_and_typography/DESIGN_SYSTEM.md` (lines 515-520)  
**Severity:** MEDIUM  
**Impact:** Documentation defines 3 breakpoints; implementation has 5

**Documentation Claims:**
```
Mobile:  320px - 639px
Tablet:  640px - 1023px
Desktop: 1024px+
```

**Actual Implementation (tailwind.config.ts):**
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1400px
```

**Fix:** Update documentation to match implementation (add md, xl, 2xl)

**Fix Time:** 30 minutes  
**Verification:** Team review for accuracy

---

## ⚠️ Warnings (Improve Soon)

### 6. Documentation Gaps for Custom Components

**Affected Components:**
- Dialog (partially documented)
- Alert (sizes not specified)
- Badge (interactive behavior unclear)

**Missing:** Complete prop tables with examples

**Fix Time:** 2-3 hours  
**Priority:** Medium (post Phase 1)

---

### 7. Component API Inconsistency

**Issue:** shadcn-ui components well-documented, but custom components lack complete API specs

**Files Affected:**
- src/components/ui/dialog.tsx
- src/components/ui/alert.tsx
- src/components/ui/badge.tsx

**Action:** Create comprehensive prop documentation for each

**Fix Time:** 3+ hours  
**Priority:** Low (documentation only)

---

## ✅ Verified Compliant Areas

| Category | Status | Notes |
|----------|--------|-------|
| Typography | 100% ✅ | Perfect alignment across all specs |
| Spacing Grid (4/8px) | ✅ | Core system excellent, legacy values need removal |
| Primary Colors | ✅ | All using HSL CSS variables |
| Semantic Colors | ✅ | Success, Warning, Destructive properly defined |
| Animation Timings | ✅ | Duration system perfect (instant-slower) |
| Easing Functions | ⚠️ | Defined well, but 2 hardcoded instances |
| Touch Targets | ✅ | 44x44px minimum enforced |
| Keyboard Navigation | ✅ | Full support implemented |
| Screen Reader | ✅ | ARIA utilities available |
| Reduced Motion | ✅ | Respects prefers-reduced-motion |
| Dark Mode | ✅ | CSS variable system supports both |
| Focus Indicators | ✅ | Focus-visible styling implemented |

---

## 🚀 Quick Fix Checklist

### Critical (Fix Today)
- [ ] Remove 7 legacy spacing values from tailwind.config.ts
- [ ] Define 10 missing contrast CSS variables
- [ ] Search codebase for usage of legacy spacing values
- [ ] Test build and run lint checks

### High Priority (This Week)
- [ ] Replace 2 hardcoded easing functions with CSS variables
- [ ] Convert 9 hardcoded colors in accessibility.tsx
- [ ] Update DESIGN_SYSTEM.md breakpoint documentation
- [ ] Run npm run lint, npm run test

### Medium Priority (Next Week)
- [ ] Complete component API documentation
- [ ] Create prop tables for Dialog, Alert, Badge
- [ ] Team review and approval

---

## 📊 Compliance Progress

```
Current:  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░ 92%

Target:   █████████████████████████████████░░░░░░░░ 98%

Phase 1:  ███████████████████░░░░░░░░░░░░░░░░░░░░░░ 96% (+4%)
Phase 2:  ██████████████████████░░░░░░░░░░░░░░░░░░░ 97% (+1%)
Phase 3:  ███████████████████████████████░░░░░░░░░░ 99%+ (+2%)
```

---

## 🔗 Related Documents

- [DESIGN_SYSTEM_AUDIT_REPORT.md](DESIGN_SYSTEM_AUDIT_REPORT.md) - Full detailed audit
- [project_resources/design_system_and_typography/DESIGN_SYSTEM.md](project_resources/design_system_and_typography/DESIGN_SYSTEM.md) - Primary spec
- [project_resources/design_system_and_typography/QUALITY_GATES.md](project_resources/design_system_and_typography/QUALITY_GATES.md) - Quality standards
- [tailwind.config.ts](tailwind.config.ts) - Tailwind configuration

---

**Last Updated:** December 13, 2025  
**Next Review:** December 20, 2025
