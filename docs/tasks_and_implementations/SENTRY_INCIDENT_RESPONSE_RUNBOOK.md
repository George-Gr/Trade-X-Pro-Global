# Sentry Incident Response Runbook

**Version:** 1.0  
**Created:** November 16, 2025  
**Audience:** On-call engineers, DevOps team, development leads  
**Escalation:** Team lead → DevOps → CTO

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Alert Triage Workflow](#alert-triage-workflow)
3. [Severity Classification](#severity-classification)
4. [Common Issue Types & Resolution](#common-issue-types--resolution)
5. [Rollback Procedures](#rollback-procedures)
6. [Communication Templates](#communication-templates)
7. [Post-Incident Review](#post-incident-review)

---

## Quick Reference

### During a Sentry Alert

| Action | Command / Link |
|--------|---------|
| Access Sentry | https://sentry.io/organizations/[your-org]/issues/ |
| View Release Info | Sentry → Issues → [Issue] → Releases tab |
| Check Deploy History | GitHub → Actions tab |
| Rollback (if needed) | `git revert [commit-sha]` + `git push origin main` |
| Check Slack | #[engineering-channel] for alert message |
| Incident Channel | Create or join #incident-[date] in Slack |

### SLA Response Times

| Severity | Response | Resolution Target |
|----------|----------|-------------------|
| Critical (P1) | 15 min | 1 hour |
| High (P2) | 30 min | 4 hours |
| Medium (P3) | 1 hour | 1 business day |
| Low (P4) | Next business day | Best effort |

---

## Alert Triage Workflow

### Step 1: Receive Alert (Slack or Email)

When you receive a Sentry alert:

```
Example Slack alert:
[Sentry] 🔴 New issue: "Cannot read property 'x' of undefined"
    Project: TradePro v10
    Events: 23 in last hour
    Release: 0.0.0 (commit abc123)
    Users affected: 5
    First seen: 2 min ago
    Link: https://sentry.io/...
```

**Acknowledge receipt in Slack:**
```
:eyes: Investigating...
```

### Step 2: Classify Severity

Use the matrix below to determine incident priority:

```
CRITICAL (P1):
  - Authentication/login broken for ALL users
  - Unhandled exception causing app crash
  - Data loss or corruption
  - Security vulnerability actively exploited
  → Immediately escalate to team lead
  → Create #incident-[date] Slack channel
  → Notify @devops

HIGH (P2):
  - Feature broken for subset of users (>10%)
  - Performance degradation (>50% slower)
  - Payment/trading functionality broken
  → Notify team lead (within 30 min)
  → Investigate and determine if rollback needed

MEDIUM (P3):
  - Minor UI glitch affecting small user set (<10%)
  - Intermittent errors that self-resolve
  - Logging/monitoring errors
  → Address in current sprint
  → Can wait for business hours

LOW (P4):
  - Development/testing code errors
  - Deprecated API warnings
  → No action required immediately
  → Log for future cleanup
```

### Step 3: Investigate (Severity-based timeline)

#### For P1/P2:

1. **Open Sentry Issue:**
   - Click the alert link
   - Note the error type, affected endpoint, and error count

2. **Collect Context:**
   - **Error Details:** Full stack trace, message
   - **Release Info:** Version, commit SHA, deploy time
   - **Users Affected:** Count, affected user IDs (if available)
   - **Frequency:** Error count over time
   - **First Occurrence:** When issue started
   - **Breadcrumbs:** User actions before error (from Sentry breadcrumbs)

3. **Check Recent Changes:**
   ```bash
   # List last 5 commits to main
   git log --oneline -5 origin/main
   
   # View the commit that introduced the error (compare deploy time)
   git show [commit-sha]
   ```

4. **Check Release Info in Sentry:**
   - Click **Releases** tab in Sentry issue
   - Note the release version (e.g., 0.0.1, commit abc123)
   - Confirm source maps are present (check file count)

5. **Determine Root Cause:**
   - **Code issue?** → Review the changed file from commit
   - **Configuration?** → Check environment variables, feature flags
   - **Third-party API?** → Check Finnhub, Supabase status
   - **Client-side?** → Check browser console (from user reports)
   - **Infrastructure?** → Check if deployment failed or rollout incomplete

#### For P3/P4:

- Add to sprint backlog or tech debt list
- No immediate investigation required

### Step 4: Decide: Fix or Rollback?

```
Decision Tree:
├─ Error on main branch (live)?
│  ├─ YES:
│  │  ├─ Root cause CLEAR & fix is QUICK (<30 min)?
│  │  │  └─ CREATE HOTFIX BRANCH: git checkout -b hotfix/issue-xxx
│  │  └─ Root cause UNCLEAR or fix is COMPLEX?
│  │     └─ ROLLBACK (see Step 5)
│  └─ NO: (error on staging/develop)
│     └─ Create bug ticket for next sprint
│
└─ Error on staging/develop (not production)?
   └─ Create bug ticket, no immediate action needed
```

### Step 5: Rollback (if needed)

**Only execute for P1/P2 production errors when fix timeline is uncertain.**

```bash
# 1. Identify the commit to revert (from Sentry release info)
REVERT_COMMIT=abc123

# 2. Create and push revert commit
git revert ${REVERT_COMMIT} --no-edit
git push origin main

# 3. Verify rollback in GitHub Actions
# (Wait for CI build to complete and artifact to upload)

# 4. Confirm in Sentry
# (New events should stop appearing after ~2 min)
# Go to Sentry → Issues → [Issue] → check "Resolved" status
```

**Post-Rollback Steps:**
1. Update Slack: `Rolled back [commit]. Issue should resolve in ~2 min. Investigating root cause.`
2. Create a bug ticket (priority: high)
3. Schedule post-incident review (see Step 7)

### Step 6: Create a Hotfix (optional)

If root cause is clear and fix is simple:

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/issue-description

# 2. Fix the issue (edit file)
# ... make changes ...

# 3. Commit and push
git add .
git commit -m "Hotfix: [issue description]"
git push origin hotfix/issue-description

# 4. Create Pull Request
# Go to GitHub → Compare & pull request
# Title: "Hotfix: [issue description]"
# Description: "Fixes #[sentry-issue-id]. Root cause: [explanation]"

# 5. Merge after approval (1 review)
# GitHub will auto-deploy to main
```

### Step 7: Communicate Status

**During investigation:**
```
🔍 Investigating Sentry alert: [Issue Name]
   Severity: P[1-4]
   Affected: [N] users
   Status: Root cause analysis in progress
   ETA: [time estimate]
```

**If rollback executed:**
```
⏮️ Rolled back commit [short-sha]
   Status: Monitoring error rate
   ETA to fix: [time]
   Details: [brief explanation]
```

**When resolved:**
```
✅ Resolved: [Issue Name]
   Solution: [Fix/Rollback/Monitoring]
   Deploy: [Release version] at [time UTC]
   Post-incident review: [link/date if applicable]
```

### Step 8: Verify Resolution

1. **Check Sentry:**
   - Go to the issue
   - Verify error count trending to zero (should stop within 5 min of fix/rollback)
   - Mark as **Resolved** in Sentry

2. **Monitor for 30 minutes:**
   - Watch for recurrence or new related errors
   - Keep Slack thread open
   - Stay on-call

3. **Close Incident:**
   - Update Slack: `✅ Incident closed. Error rate normal.`
   - Archive #incident-[date] channel

---

## Severity Classification

### P1 (Critical) — Immediate Action

**Triggers:**
- App crash on load (white screen for all users)
- Authentication broken (all users locked out)
- Data loss (balances/positions disappearing)
- Security breach (unauthorized access)
- Trading platform completely unavailable

**Response:**
- Page on-call engineer immediately
- Create #incident channel
- Post mortem within 24 hours
- Max allowed downtime: 15 minutes

**Example:**
```
[Sentry] 🚨 CRITICAL: TypeError: Cannot read property 'user' of undefined
  Affects: 100% of users
  Error rate: 45 errors/min
  Started: 2025-11-16 14:32:15 UTC
  Release: 0.4.2
```

### P2 (High) — Urgent Response

**Triggers:**
- Feature broken for >10% of users (e.g., trading not working for 1000 users)
- Performance degradation >50% (page takes 30s instead of 5s)
- Database connectivity issues
- Payment processing failing intermittently

**Response:**
- Notify team lead within 30 minutes
- Decide fix vs. rollback within 1 hour
- Target resolution: 4 hours
- Daily status update until resolved

**Example:**
```
[Sentry] ⚠️ HIGH: "TypeError: prices is undefined" in OrderExecution
  Affects: ~500 users (5%)
  Error rate: 2 errors/min
  Started: 2025-11-16 14:15:00 UTC
  Release: 0.4.2
```

### P3 (Medium) — Standard Response

**Triggers:**
- Feature broken for <10% of users
- Intermittent errors (self-resolve)
- UI glitches (visual only, functional)
- Non-critical backend issues

**Response:**
- Add to sprint backlog
- Prioritize in next standup
- Target resolution: 1 business day
- No escalation required

**Example:**
```
[Sentry] ℹ️ MEDIUM: "Margin level calculation off by 0.001%"
  Affects: Unknown (rare edge case)
  Error rate: <1 error/hour
  Started: 2025-11-16 10:00:00 UTC
  Release: 0.4.1
```

### P4 (Low) — Backlog

**Triggers:**
- Development/staging errors
- Deprecated API warnings
- Logging infrastructure errors
- Test failures

**Response:**
- Create ticket for future cleanup
- No immediate action
- Review in tech debt sessions

---

## Common Issue Types & Resolution

### Issue: "TypeError: Cannot read property X of undefined"

**Root Causes:**
1. Missing null check (most common)
2. API response changed format
3. User data not loaded yet (race condition)

**Investigation:**
```bash
# 1. Get line number from stack trace
# 2. Check the file in Sentry (breadcrumbs show context)
# 3. Look at recent commits for that file
git log --oneline -10 -- src/path/to/file.tsx

# 4. Review the change
git show [commit-sha]

# 5. Check if null check is missing
grep -n "if (.*\..*) {" src/path/to/file.tsx
```

**Fix Pattern:**
```typescript
// ❌ BEFORE: Assumes data exists
const value = data.property.nested.value;

// ✅ AFTER: Safe navigation
const value = data?.property?.nested?.value || defaultValue;
```

---

### Issue: "ReferenceError: X is not defined"

**Root Causes:**
1. Variable scope issue
2. Missing import statement
3. Async/await timing issue

**Quick Fix:**
```bash
# Find where variable is used
grep -rn "variableName" src/

# Check if it's imported
grep -n "import.*variableName" src/path/to/file.tsx
```

---

### Issue: "Error: Insufficient balance"

**Root Causes:**
1. Margin calculation error
2. Commission not deducted correctly
3. Duplicate order execution

**Investigation:**
```
1. Check Sentry breadcrumbs for user action sequence
2. Look at order details: amount, commission, balance
3. Check database: profiles table for user balance
4. Review recent changes to orderExecution hook
```

---

### Issue: "Error: Network timeout (Finnhub API)"

**Root Causes:**
1. Finnhub API down
2. Network connectivity issue
3. Rate limiting exceeded

**Quick Check:**
```bash
# Check if Finnhub is reachable
curl -s "https://finnhub.io/api/v1/quote?symbol=EURUSD&token=[KEY]"

# Check rate limit status
grep -i "rate" sentry-error-breadcrumbs
```

**Workaround:**
- Alert users that real-time prices unavailable
- Use cached/fallback prices
- No user action needed (system handles gracefully)

---

## Rollback Procedures

### When to Rollback

**Rollback immediately if:**
- P1 severity and root cause unclear
- Fix timeline >30 minutes
- Multiple users reporting complete feature loss
- Data integrity at risk

**Rollback can wait if:**
- Fix is simple and quick (<15 min)
- Issue affects <1% of users
- System already implemented a workaround

### Rollback Steps

```bash
# 1. List recent commits
git log --oneline -10 origin/main

# 2. Identify commit to revert (usually last commit before issue started)
COMMIT_TO_REVERT=abc123def

# 3. Create revert commit
git checkout main
git pull origin main
git revert ${COMMIT_TO_REVERT} --no-edit
git push origin main

# 4. Monitor GitHub Actions
# Go to GitHub.com → Actions tab
# Wait for CI build to complete (should take ~5 min)

# 5. Monitor Sentry
# Go to Sentry issue → refresh
# Should see "Resolved" after ~5 minutes and error rate trending to 0
```

### Post-Rollback

1. **Notify team:**
   ```
   Rolled back [commit] due to [reason]
   Issue: [Sentry link]
   New plan: Fix in hotfix branch before re-deploying
   ```

2. **Create ticket:**
   - Title: `[P2] Fix [issue description]`
   - Assignee: Code owner of affected file
   - Linked issue: Sentry link

3. **Schedule fix meeting:**
   - Root cause analysis
   - Code review process
   - Testing plan before re-deploy

---

## Communication Templates

### Slack Template: Alert Received

```
:alert: Sentry Alert Acknowledged
Issue: [Error Name]
Severity: P[1-4]
Affected Users: [Count/Percentage]
Release: [Version]
First Occurrence: [Time UTC]

Status: :hourglass: Investigating
ETA: [30 min for P1-2, 1 hour for P3]

Details: [Brief description]
Sentry Link: [URL]
```

### Slack Template: Issue Identified

```
:mag: Root Cause Identified
Issue: [Error Name]
Cause: [Technical explanation]
Solution: [Fix/Rollback/Workaround]

Estimated Time: [30 min for fix, immediate for rollback]
Next Step: [Testing/Deployment]
```

### Slack Template: Resolved

```
:white_check_mark: Issue Resolved
Issue: [Error Name]
Solution: [What was done]
Resolution Time: [Duration]
Release: [Version deployed]

Monitoring for 30 min to confirm stability.
Will close incident if no recurrence.
```

### Email Template: Post-Incident Review

```
Subject: Post-Incident Review - [Issue Name] - [Date]

Incident Summary:
- Duration: [start time] - [end time] UTC
- Severity: P[1-2]
- Root Cause: [Explanation]
- Users Affected: [Count]
- Data Loss: [Yes/No and details]

Timeline:
1. [Time] - Alert received, investigation started
2. [Time] - Root cause identified
3. [Time] - Fix/Rollback deployed
4. [Time] - Verified resolved

Preventive Measures:
1. [Test/Monitoring improvement]
2. [Code review process change]
3. [Documentation update]

Action Items:
- [ ] [Item 1] - Owner: [Name] - Due: [Date]
- [ ] [Item 2] - Owner: [Name] - Due: [Date]

Attendees: [Names]
Meeting: [Date/Time to discuss]
```

---

## Post-Incident Review

### When to Schedule

- P1 issues: Within 24 hours
- P2 issues: Within 48 hours
- P3/P4 issues: Optional (can defer)

### Meeting Agenda (45 minutes)

```
1. Timeline Review (10 min)
   - When did error start?
   - When was alert received?
   - How long to root cause?
   - How long to resolution?

2. Root Cause Analysis (15 min)
   - What failed?
   - Why did tests not catch it?
   - What was the exact code issue?

3. Detection & Response (10 min)
   - Did Sentry alert fire correctly?
   - Was response time acceptable?
   - Could we have automated detection?

4. Preventive Actions (10 min)
   - What prevents recurrence?
   - Code reviews / tests to add
   - Documentation to update
   - Monitoring to improve
```

### Required Outcomes

- [ ] Root cause document (shared in Slack #incidents)
- [ ] Minimum 1 action item assigned (with owner and due date)
- [ ] Test added to prevent regression
- [ ] Team training/discussion completed

---

## Escalation Path

```
Incident severity determines escalation:

P1 (Critical):
  Immediate: On-call engineer
           → Page team lead (Slack + phone)
           → Notify @devops (infrastructure issues)
           → Update CTO if >15 min unresolved

P2 (High):
  Within 30 min: Notify team lead via Slack
              → Escalate if >1 hour unresolved

P3 (Medium):
  Next business day standup discussion
  No escalation required

P4 (Low):
  Backlog/sprint planning
  No escalation required
```

---

## Contact Information

| Role | Slack | On-Call |
|------|-------|---------|
| Team Lead | @team-lead | [PagerDuty link] |
| DevOps | @devops | [PagerDuty link] |
| Database | @db-admin | [PagerDuty link] |
| Frontend | @frontend-lead | [PagerDuty link] |
| Backend | @backend-lead | [PagerDuty link] |

---

**Document Version:** 1.0  
**Last Updated:** November 16, 2025  
**Next Review:** Monthly (or after first P1 incident)
