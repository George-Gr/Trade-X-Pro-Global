# Sentry Incident Response Runbook

**Last Updated:** November 16, 2025  
**Owner:** Engineering Team  
**Escalation:** On-Call Engineer → Team Lead → DevOps

---

## Quick Reference

| Severity | Response Time | Action | Owner |
|----------|---------------|--------|-------|
| Critical (Errors > 50/min) | 5 min | Page on-call → Check release → Rollback if needed | On-Call |
| High (Errors > 10/min, Production) | 15 min | Investigate root cause → Create ticket → Plan fix | Team Lead |
| Medium (New issue type, Production) | 1 hour | Log issue → Add to backlog → Assign | Engineer |
| Low (Issues in staging/dev) | Next sprint | Document → Reference in future PRs | QA Lead |

---

## Incident Response Steps

### 1️⃣ **Alert Triggers (You receive Slack/Email notification)**

**Check immediately:**
- What triggered the alert? (URL provided in notification)
- What's the error type? (e.g., ReferenceError, Network error, etc.)
- How many errors in the last 5 minutes?

### 2️⃣ **Open Sentry Dashboard**

1. Click the link in the Slack/email alert
2. You arrive at the issue detail page showing:
   - **Release info**: Version that introduced the error
   - **Error graph**: Frequency spike visualization
   - **Latest events**: Most recent occurrence with stack trace
   - **Affected users**: How many users encountered it

### 3️⃣ **Assess Severity**

Ask these questions:

```
Is it a production error? (Not dev/staging)
  ↓ YES → Is it blocking users? → YES → CRITICAL (see 4A)
  ↓ NO  → Add to backlog (see 4C)

Is it a known issue from a recent deploy?
  ↓ YES → Consider rollback (see 4A)
  ↓ NO  → Investigate (see 4B)

Is it a third-party API outage?
  ↓ YES → Document & wait for service recovery (see 4B)
  ↓ NO  → Continue diagnosis
```

### 4️⃣ **Response by Severity**

#### 4️⃣A: **CRITICAL** (Production, blocking, recent deploy)

```bash
Timeline: 5 minutes

1. Acknowledge alert in Slack (thread reply: "investigating")

2. Verify if rollback is needed:
   - Go to Sentry → Releases
   - Compare error frequency between current & previous release
   - If current release has 10x more errors → likely the cause

3. Rollback if needed:
   # In your CI/CD or deployment tool:
   git revert <commit-sha>
   git push origin main

4. Monitor recovery:
   - Watch Sentry error graph for decline
   - Monitor app health metrics (CPU, memory, response time)
   - Wait ~10 minutes for error rate to stabilize

5. Post-incident:
   - Create urgent ticket: "Hotfix: [Error Type]"
   - Assign to team lead
   - Schedule post-mortem in 24 hours

6. Communication:
   - Update Slack thread: "Rolled back to v0.0.1, monitoring error rate"
   - Notify customers if needed (depends on company policy)
```

#### 4️⃣B: **HIGH** (Production, not blocking, or investigation needed)

```bash
Timeline: 15 minutes

1. Open the latest event in Sentry
   - Click "Latest events" → Inspect full stack trace
   - Look for file/function with error

2. Check the stack trace:
   - First frame pointing to YOUR code? → Bug in app
   - Third-party library? → Check library version/changelog
   - Network error? → Check third-party API status (statuspage.io)

3. Reproduce locally (optional but recommended):
   - Read the breadcrumbs (sequence of actions before error)
   - Attempt to replicate in dev environment
   - If reproduced → understand root cause

4. Create a ticket in your issue tracker:
   Title: "[Sentry] Error Type in Feature Name (v0.0.2)"
   Description:
   ```
   Error: TypeError: Cannot read property 'x' of undefined
   Release: v0.0.2 (2025-11-16)
   Affected users: ~50
   Stack trace: [Paste from Sentry]
   Breadcrumbs: [List steps that led to error]
   
   Root cause: [Your hypothesis]
   Fix: [Proposed solution]
   ```

5. Assign to appropriate engineer & prioritize

6. Update Sentry comment:
   - Go to issue → Resolve as "Fixed in <branch>"
   - Add comment: "Ticket #123 created, fix in progress"
```

#### 4️⃣C: **MEDIUM** (New error type, not urgent)

```bash
Timeline: 1 hour

1. Log in your issue tracker as a task:
   - Title: "[Sentry] New Issue: Error Type"
   - Add to current sprint or backlog
   - Link Sentry issue in description

2. Monitor for escalation:
   - If error frequency spikes → move to HIGH
   - If affects many users → move to HIGH

3. Schedule fix:
   - Assign to engineer with relevant expertise
   - Include in next sprint planning

4. Mark in Sentry:
   - Status: "Unresolved"
   - Add assignee
   - Add label for team tracking
```

#### 4️⃣D: **LOW** (Staging/dev, or rare edge case)

```bash
Timeline: Next sprint

1. Document in Sentry:
   - Add comment with context
   - Mark as "Ignored" if it's expected behavior
   - Link to any existing related issues

2. Reference in code reviews:
   - When similar code is reviewed, mention this issue
   - Use as learning opportunity

3. Fix in next sprint:
   - Add to backlog (not blocking)
   - Group similar issues together
```

---

## Root Cause Analysis Template

When investigating an error, fill this out:

```markdown
## Error: [Error Type]
- **When**: [Timestamp]
- **Where**: [File/Function]
- **Stack Trace**: [Paste top 5 frames]

## Why It Happened
1. [First contributing factor]
2. [Second contributing factor]
3. [Third contributing factor]

## How to Fix
```bash
# Code change:
- File: src/components/Component.tsx
- Change: [Description]
- Test: [How to verify fix]
```

## How to Prevent
- [ ] Add unit test for this code path
- [ ] Add error boundary in parent component
- [ ] Add input validation
- [ ] Document expected behavior
```

---

## Common Error Patterns & Fixes

### Pattern 1: "Cannot read property of undefined"
```
Cause: Code accessing property on null/undefined value
Fix:   Add null check or optional chaining (?.)
Test:  Create test case for when value is undefined
```

### Pattern 2: "Network error" or "Failed to fetch"
```
Cause: Third-party API down or request timeout
Fix:   Add retry logic, fallback, or graceful degradation
Test:  Mock API error and verify fallback behavior
```

### Pattern 3: "Maximum call stack exceeded"
```
Cause: Infinite loop or circular dependency
Fix:   Review recursive function or dependency chain
Test:  Add guard condition to break recursion
```

### Pattern 4: "ReferenceError: X is not defined"
```
Cause: Variable/function used before definition
Fix:   Move definition before usage or import it
Test:  Ensure proper import order in tests
```

---

## Sentry Dashboard Tips

### Find errors quickly:
1. **Releases**: See which version introduced the error
2. **Trends**: Spot patterns (time-of-day spikes, recurring issues)
3. **Users affected**: Sort by impact
4. **Environment filters**: Separate prod/staging/dev

### Create a custom view:
```
Sentry > Saved Searches > New Search

Conditions:
  is:unresolved
  environment:production
  error.type:[TypeError, ReferenceError]
  last_seen:-24h
  
Sort by: Users affected (descending)
```

---

## Escalation Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| On-Call Engineer | Slack: @on-call-bot | 24/7 (rotation) |
| Team Lead | Slack: @team-lead | 9am-6pm PT |
| DevOps / Platform | Slack: #devops-oncall | 24/7 (escalation) |

---

## Post-Incident Review

After critical incidents, schedule a 30-minute retrospective:

```markdown
## Post-Incident Review: [Error Type] (Date)

### Timeline
- 14:32: Alert triggered
- 14:35: Acknowledged
- 14:42: Root cause identified
- 14:50: Fix deployed
- 15:00: Error rate returned to normal

### Root Cause
[Detailed explanation]

### Contributing Factors
1. [Factor 1]
2. [Factor 2]

### Actions to Prevent Recurrence
- [ ] Add test case for this scenario
- [ ] Add monitoring/alerting for early detection
- [ ] Document expected behavior
- [ ] Code review checklist item added

### Follow-ups
- [ ] Ticket #123 (Fix) - Due: [Date]
- [ ] Ticket #124 (Test) - Due: [Date]
- [ ] Ticket #125 (Monitoring) - Due: [Date]
```

---

## Useful Commands

### Check error status locally:
```bash
# Start dev server
npm run dev

# Visit test page
# http://localhost:5173/dev/sentry-test

# Click "Throw Error" to trigger ErrorBoundary
```

### Deploy a hotfix:
```bash
# Create hotfix branch
git checkout -b hotfix/error-type-fix

# Make fix and commit
git add .
git commit -m "Fix: Handle undefined value in Component"

# Create PR with urgency label
git push origin hotfix/error-type-fix

# After review, merge to main
# CI will auto-deploy
```

### Mark issue resolved in Sentry:
1. Go to Sentry issue
2. Click "Resolve" → "Fixed in v0.0.3" (select your release)
3. Add comment: "Fixed in PR #456"
4. Sentry will auto-resolve when release is deployed

---

## Health Checks

Run these weekly:

- [ ] No unresolved critical issues in Sentry
- [ ] All errors have owners assigned
- [ ] Oldest unresolved issue is < 30 days old
- [ ] Error rate is stable or declining
- [ ] New issues are triaged within 24 hours

---

**Questions?** Ask in #engineering or tag @team-lead
