# Quick Reference: Sentry Integration for TradePro v10

**Last Updated**: November 16, 2024  
**Status**: Production Ready  

---

## Quick Start for Developers

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Add Sentry DSN to .env.local (optional for dev)
echo 'VITE_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0' >> .env.local

# 3. Start dev server
npm run dev

# 4. Test Sentry integration (dev only)
# Navigate to http://localhost:8080/dev/sentry-test
# Click buttons to trigger test errors
```

### Using the Logger
```typescript
import { logger } from '@/lib/logger';

// Info level
logger.info('User logged in', { userId: user.id });

// Warning level
logger.warn('High latency detected', { latency: 500 });

// Error level (primary Sentry integration point)
logger.error('Failed to place order', error, { orderId: 123 });

// Debug level
logger.debug('State updated', { previousState, newState });

// Time tracking
logger.time('myOperation');
// ... do work
logger.time('myOperation'); // logs elapsed time

// Async operations
await logger.timeAsync('loadData', async () => {
  return await fetchData();
});
```

### Production Deployment
```bash
# 1. Ensure .env.local has production Sentry DSN
VITE_SENTRY_DSN=https://your_real_public_key@o0.ingest.sentry.io/0

# 2. Push to main branch
git push origin main

# CI/CD Pipeline automatically:
# - Builds production bundle
# - Creates Sentry release
# - Uploads source maps
# - Verifies ingestion (staging)
# - Alerts on errors (Sentry dashboard)
```

### Triggering a Test Error (Production)
```typescript
// In production, trigger an error somewhere in the app:
import { logger } from '@/lib/logger';

const handleTestError = () => {
  try {
    throw new Error('Production test error');
  } catch (error) {
    logger.error('Test error from production', error as Error);
  }
};

// Or in React component:
const handleThrowError = () => {
  throw new Error('Test render error - caught by ErrorBoundary');
};
```

### Viewing Errors in Sentry
```
1. Go to https://sentry.io
2. Select your organization
3. Select your project (TradePro)
4. Errors appear within 1-2 minutes
5. Click error to see:
   - Stack trace (with source map resolved code)
   - Breadcrumbs (user actions leading to error)
   - Release information
   - User context
   - Local variables (if available)
```

---

## Common Commands

```bash
# Build for production
npm run build

# Check for build errors/warnings
npm run lint

# Run tests
npm test

# View bundle size
npm run build && cat stats.html  # Open in browser

# Check Sentry integration status
npm run dev  # Visit /dev/sentry-test in browser
```

---

## GitHub Secrets Setup (Ops/DevOps Team)

### Required Secrets
Add these to GitHub repository settings (Settings → Secrets and variables → Actions):

1. **SENTRY_AUTH_TOKEN**
   - Source: Sentry Dashboard → Settings → API Tokens
   - Permissions: `project:write`, `release:write`, `organization:read`

2. **SENTRY_ORG**
   - Example: `my-organization` (from Sentry URL: sentry.io/organizations/my-organization/)

3. **SENTRY_PROJECT**
   - Example: `tradepro` (from Sentry project settings)

4. **SENTRY_API_BASE_URL** (optional)
   - Default: `https://sentry.io`
   - Only set if using Sentry on-premise

### Verification
```bash
# In GitHub Actions, secrets are automatically available to workflows
# Check GitHub Secrets in repository settings (Settings → Secrets and variables)
# Verify by running CI workflow: Push to main branch, check Actions tab
```

---

## Monitoring & Alerts

### Sentry Dashboard
- **URL**: https://sentry.io/organizations/{ORG}/projects/{PROJECT}/
- **Key Metrics**:
  - Events: Total errors received
  - Users Affected: Unique users with errors
  - Issues: Grouped errors (same root cause)
  - Release Health: Crash-free percentage per release

### Setting Up Alerts
1. **Email Alerts**:
   - Settings → Alerts & Integrations → Create Alert Rule
   - Trigger: "An event occurs"
   - Notify: Your email

2. **Slack Integration** (recommended):
   - Integrations → Slack
   - Connect workspace
   - Create Alert Rule → Notify Slack channel

### Common Alert Rules
- **Critical**: Errors affecting >5% of users → Page on-call
- **High**: Specific error type increases 10x → Notify team Slack
- **Medium**: New error pattern detected → Log to incidents channel
- **Low**: All errors → Archive unless new

---

## Error Patterns & Debugging

### If Error Not Appearing in Sentry

**Check Local:**
```typescript
// Verify logger is active
import { logger } from '@/lib/logger';
console.log('Sentry active?', (window as any).__SENTRY_GLOBAL__ !== undefined);

// Test logger directly
logger.error('Test error', new Error('Test'), { test: true });
```

**Check Sentry DSN:**
```bash
# In .env.local or CI environment
echo $VITE_SENTRY_DSN  # Should output: https://key@o0.ingest.sentry.io/0

# In Sentry dashboard
# Settings → Client Keys (DSN) → Copy and verify matches
```

**Check Network:**
```javascript
// In browser DevTools Network tab:
// Look for requests to: https://o0.ingest.sentry.io/api/0/envelope/
// Should see 200 OK responses
```

### Common Error Types

| Error | Cause | Solution |
|-------|-------|----------|
| "Sentry DSN not set" | VITE_SENTRY_DSN empty | Add real DSN to .env.local or CI |
| 401 Unauthorized | Invalid SENTRY_AUTH_TOKEN | Regenerate token in Sentry Settings |
| 403 Forbidden | Token lacks permissions | Add `project:write`, `release:write` perms |
| Events not appearing | Network blocked | Check browser DevTools Network tab for Sentry domain |
| Source maps not readable | Maps not uploaded | Check CI/CD workflow completed successfully |

---

## Performance Impact

### Bundle Size Impact
- Sentry SDK: ~50 KB (gzipped)
- Logger utility: ~10 KB (gzipped)
- **Total overhead**: ~60 KB (~12% of main bundle)

### Runtime Performance
- Sentry init: ~100ms (happens once on app load)
- Error capture: ~10ms per error (asynchronous, doesn't block UI)
- Breadcrumb recording: <1ms per action
- **Impact**: Negligible for production apps

### Network Impact
- Error event: ~5-10 KB per event
- Source maps: One-time upload during CI/CD
- **Recommendation**: Errors sent asynchronously (won't block user interactions)

---

## Incident Response Quick Guide

### When You Get a Sentry Alert

**Step 1: Assess Severity** (1 minute)
- How many users affected?
- What feature broken?
- Is it ongoing?

**Step 2: Investigate** (5 minutes)
1. Click Sentry alert
2. Check "Release" to identify which version
3. Review "Breadcrumbs" for user actions leading to error
4. Check "Stack Trace" to find failing line

**Step 3: Respond** (varies)
- If critical: Emergency hotfix or rollback
- If high: Prioritize for next sprint
- If medium: Add to backlog
- If low: Trend analysis, batch fix later

**Step 4: Follow Up** (after fix deployed)
1. Check Sentry release health
2. Confirm error rate drops to zero
3. Document root cause
4. Add unit test to prevent regression

### Complete Runbook
See: `docs/tasks_and_implementations/SENTRY_INCIDENT_RESPONSE_RUNBOOK.md`

---

## Useful Links

| Resource | URL |
|----------|-----|
| Sentry Docs | https://docs.sentry.io/ |
| Sentry React Docs | https://docs.sentry.io/platforms/javascript/guides/react/ |
| TradePro Logger | `src/lib/logger.ts` |
| Error Boundary | `src/components/ErrorBoundary.tsx` |
| Dev Test Page | `/dev/sentry-test` (dev only) |
| CI Workflow | `.github/workflows/ci-build-sentry.yml` |
| Incident Runbook | `docs/tasks_and_implementations/SENTRY_INCIDENT_RESPONSE_RUNBOOK.md` |
| Verification Doc | `docs/tasks_and_implementations/TASK_0_6_FINAL_VERIFICATION.md` |

---

## Troubleshooting

### "Sentry not initialized" warning
**Cause**: App running without Sentry DSN  
**Solution**: Add `VITE_SENTRY_DSN` to `.env.local` or CI environment

### Build fails with "sentry-cli not found"
**Cause**: GitHub runner missing sentry-cli  
**Solution**: Use official GitHub Action `getsentry/sentry-cli-action@v1` (already configured)

### Source maps showing "[Source code not available]"
**Cause**: Source maps not uploaded or paths don't match  
**Solution**: 
1. Check CI workflow completed: GitHub Actions tab
2. Verify map files in `dist/` directory
3. Check Sentry Settings → Source Maps

### Errors not appearing in Sentry for 1+ minute
**Cause**: Network delay or issue with Sentry project  
**Solution**:
1. Check browser Network tab for failures
2. Verify Sentry project exists and is active
3. Check GitHub Secrets are correct
4. Try manual test: `npm run dev` → visit `/dev/sentry-test`

---

## Support & Questions

For questions or issues:
1. Check this quick reference first
2. Review Sentry official docs: https://docs.sentry.io/
3. Check incident runbook for error patterns
4. Reach out to devops team for GitHub Secrets/CI issues

---

**Last Updated**: November 16, 2024  
**Status**: Production Ready  
**Questions?** Refer to SENTRY_INCIDENT_RESPONSE_RUNBOOK.md for detailed guide
