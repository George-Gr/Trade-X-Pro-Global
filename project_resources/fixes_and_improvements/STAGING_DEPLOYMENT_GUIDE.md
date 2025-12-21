# CSP Nonce Staging Deployment Guide

**Date**: December 21, 2025  
**Task**: Task 3.2 — Deploy CSP nonce implementation to staging and monitor for 72 hours  
**Status**: Ready for deployment

---

## Overview

This guide walks through deploying the refactored CSP nonce implementation to a staging environment for safe 72-hour monitoring before production rollout.

### What's Being Deployed

- **Nonce Middleware**: AsyncLocalStorage-based per-request nonce generation
- **HTML Transformation**: Vite's `transformIndexHtml` hook for nonce injection
- **CSP Headers**: Report-only mode headers in `public/_headers`
- **Verification**: Nonce sync between CSP header and HTML attributes

### Key Commits

- `b7fe37f` — "refactor(csp): improve nonce generation with transformIndexHtml hook"
- `2bcdeff` — "docs: add CSP staging deployment guide for 72h monitoring"

---

## Pre-Deployment Checklist

- [x] Code changes committed to main branch
- [x] Dev server tested locally with nonce middleware active
- [x] TypeScript compilation verified (pre-existing errors only)
- [x] Nonce generation logic reviewed for correctness
- [x] CSP headers configured with report-only mode
- [x] Staging deployment guide documented

---

## Deployment Steps

### 1. Create or Update Staging Branch

```bash
# Option A: Create new staging branch
git checkout -b staging
git push origin staging

# Option B: Update existing staging branch
git checkout staging
git merge main
git push origin staging
```

### 2. Deploy to Staging Environment

#### If using Vercel:

```bash
# Vercel auto-deploys on push to connected branches
# Connect 'staging' branch in Vercel settings → Deployments
# Push to staging branch triggers automatic deployment
git push origin staging
```

#### If using Netlify:

```bash
# Connect staging branch in Netlify → Site settings → Build & Deploy
# Push to staging branch triggers preview deployment
git push origin staging
```

#### If using other platforms:

- Follow platform-specific process for staging deployment
- Ensure environment variables are set (`NODE_ENV=staging` or similar)
- Verify build command: `npm run build`

### 3. Verify Staging Deployment

#### Check CSP headers:

```bash
# Replace staging.example.com with your actual staging domain
curl -I https://staging.example.com | grep -i "content-security-policy"

# Expected output (report-only mode, line wrapped for readability):
# Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'nonce-...' https://s3.tradingview.com ...
```

#### Verify nonce injection in HTML:

```bash
# Check that nonce is injected into served HTML
curl https://staging.example.com | grep -o 'nonce="[A-Za-z0-9/+=]*"' | head -5

# Expected: Multiple matching nonce values
# Example: nonce="aBcD1234eFgH5678ijKl9012=="
```

#### Test in browser (F12 DevTools):

1. Open staging site in browser
2. Press F12 → Network tab
3. Look for response header: `Content-Security-Policy-Report-Only`
4. Go to Console tab → verify no CSP errors logged
5. Inspect `<script>` and `<style>` tags:
   - Should see `nonce="..."` attributes
   - Nonce values should match CSP header value (during that request)

---

## Monitoring Phase (72 hours)

### Setup CSP Violation Reporting

The CSP header includes reporting directives:

```
report-uri /csp-report; report-to csp-endpoint
```

#### Option 1: Use Sentry (Recommended)

```javascript
// Sentry automatically captures CSP violations if configured
// The CSP header will send violations to Sentry
// Monitor at: sentry.io → your-project → Issues → CSP Violations
```

#### Option 2: Custom Violation Endpoint

Create an endpoint at `/api/csp-report` to receive violations:

```javascript
POST /api/csp-report
Content-Type: application/json

{
  "csp-report": {
    "document-uri": "https://staging.example.com/trading",
    "violated-directive": "script-src 'self' 'nonce-...'",
    "effective-directive": "script-src",
    "original-policy": "...",
    "blocked-uri": "inline",
    "source-file": "https://staging.example.com/index.html",
    "line-number": 42,
    "column-number": 15,
    "status-code": 0
  }
}
```

#### Option 3: Browser Console via Report-Only

- CSP report-only mode does NOT block content
- But browsers may log violations to console
- Monitor browser console for messages like: "Refused to execute inline script because it violates CSP..."

### Monitoring Tasks (Daily for 3 days)

**Day 1:**

- [ ] Verify staging site loads without errors
- [ ] Check CSP headers are present and correct
- [ ] Review browser console for any violations
- [ ] Confirm nonce values are injected and changing per request

**Day 2:**

- [ ] Review accumulated CSP violations (if any)
- [ ] Test key user flows: login, trading, portfolio, etc.
- [ ] Check for script/style/font load errors
- [ ] Verify WebSocket connections (Supabase realtime) working

**Day 3:**

- [ ] Final review of all violation reports
- [ ] Confirm no critical functionality broken
- [ ] Document any violations found and categorize by type
- [ ] Prepare for production rollout if monitoring passed

### Common Violations to Watch For

| Violation                                                  | Cause                                     | Solution                                           |
| ---------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------- |
| "Refused to execute inline script because it violates CSP" | Missing nonce on `<script>` tag           | Add `nonce="{CSP_NONCE}"` to script tag            |
| "Refused to apply style from X because of CSP"             | Style without nonce or domain not allowed | Add `nonce="{CSP_NONCE}"` or domain to `style-src` |
| "Refused to load font from X because of CSP"               | Font domain not in `font-src`             | Add domain to `font-src` directive in CSP          |
| "Refused to connect to X because of CSP"                   | API domain not in `connect-src`           | Add domain to `connect-src` directive              |
| "Refused to load image from X because of CSP"              | Image domain not in `img-src`             | Add domain to `img-src` directive                  |

### Violation Response Action Plan

If violations are found, take these actions:

1. **Identify the violation type** (script, style, font, connect, etc.)
2. **Determine the cause** (missing nonce, domain not allowed, etc.)
3. **If missing nonce on inline content:**

   - Locate the inline `<script>` or `<style>` tag in source
   - Add `nonce="{CSP_NONCE}"` attribute
   - Commit and re-deploy to staging
   - Confirm violation stops in monitoring logs

4. **If new domain needed:**

   - Add domain to appropriate CSP directive in `public/_headers`
   - Commit and re-deploy to staging
   - Confirm violation stops

5. **If third-party conflict:**
   - Document the conflict with vendor
   - Decide: adjust CSP further OR escalate to vendor for CSP compliance
   - Do NOT disable report-only mode without full investigation

### End of 72-hour Monitoring

**Success Criteria:**

- ✅ No CSP violations blocking legitimate content
- ✅ All user flows function normally (login, trading, realtime updates)
- ✅ Nonces are generated correctly and injected into HTML
- ✅ CSP headers present in all responses
- ✅ No console errors related to CSP

**If successful:**
→ Proceed to Task 3.3 (Enable Strict Enforcement)

**If violations found:**
→ Fix violations, re-deploy to staging, monitor another 24 hours

---

## Post-Monitoring: Enable Strict Enforcement

Once 72-hour monitoring passes without critical violations:

### Task 3.3 — Enable Strict Enforcement

1. **Update `public/_headers`:**

   - Replace `Content-Security-Policy-Report-Only` with `Content-Security-Policy`
   - Deploy to staging first for one final test

2. **Production Rollout:**

   - After staging validation, deploy to production
   - Monitor production CSP headers and violation reports

3. **Cleanup:**
   - Remove `Content-Security-Policy-Report-Only` headers once strict CSP active
   - Update documentation

---

## Rollback Plan

If critical issues arise during staging deployment:

```bash
# Rollback staging to previous version
git revert <commit-sha>
git push origin staging

# Or reset to specific commit
git reset --hard <previous-commit>
git push origin staging --force
```

The report-only mode ensures no production impact during monitoring.

---

## References

- **Vite transformIndexHtml Hook**: https://vitejs.dev/guide/ssr.html#transformindexhtml-hook
- **MDN CSP Reference**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **CSP Nonce Guide**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP#nonce
- **CSP Report-Only Mode**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only

---

## Questions & Support

For questions during staging deployment:

1. Check `/docs/archives/audit_reports/Imp Roadmap Config Audit.md` for detailed remediation context
2. Review vite.config.ts implementation for nonce middleware logic
3. Consult public/\_headers for CSP directive reference
4. Check browser Network/Console tabs for CSP header details

---

**Deployment Status**: ✅ Ready  
**Last Updated**: 2025-12-21  
**Next Step**: Deploy to staging environment
