# Day 2-3: Environment Configuration Quick Start

**Status:** Ready to Begin  
**Estimated Time:** 4-6 hours  
**Start Date:** January 31, 2026  

---

## 🎯 Objectives

- [ ] Create `.env.example` template
- [ ] Verify `.gitignore` coverage
- [ ] Scan git history for secrets
- [ ] Update README with setup guide
- [ ] Create SECURITY_CHECKLIST.md

---

## 📝 Task 2.1: Create .env.example Template

### What to Do
Create a template file showing all required environment variables.

### Commands
```bash
# Generate template
cp .env.local .env.example

# Remove secrets (replace with placeholders)
# Edit .env.example:
# - Replace actual URLs with examples (https://your-project.supabase.co)
# - Replace keys with placeholders (sk_live_xxxxx)
# - Add comments explaining each variable
```

### File Location
`/env.example`

### Template Content
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Sentry (Optional, for production only)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=sntrys_xxxxxxx

# Development (Optional)
VITE_DEBUG_REALTIME=false
VITE_LOG_LEVEL=info
```

### Success Criteria
- [ ] `.env.example` created
- [ ] No real secrets in file
- [ ] All required vars documented
- [ ] Comments explain each variable

---

## 🔐 Task 2.2: Verify .gitignore Coverage

### What to Do
Ensure sensitive files are not accidentally committed.

### Commands
```bash
# Check current .gitignore
cat .gitignore

# Verify key entries exist
grep -E "\.env|\.local|node_modules|secrets" .gitignore

# Test with dry-run
git add --dry-run .

# Look for .env files that shouldn't be tracked
git ls-files --others --ignored --exclude-standard
```

### Required Entries
```gitignore
# Environment
.env
.env.local
.env.*.local

# Secrets
.ssh/
secrets/

# Dependencies
node_modules/

# Build
dist/
build/

# IDE
.vscode/
.idea/

# Logs
*.log
```

### Success Criteria
- [ ] `.env` files ignored
- [ ] `.env.local` ignored
- [ ] `node_modules/` ignored
- [ ] `secrets/` directory ignored
- [ ] No real keys in git history

---

## 🔎 Task 2.3: Scan Git History for Secrets

### What to Do
Search git history for accidentally committed secrets.

### Commands
```bash
# Search for common secret patterns
git log --all --oneline --grep="SENTRY_DSN\|SUPABASE_KEY\|API_KEY\|SECRET"

# Search file content history
git log -p --all -S "SENTRY_DSN" | head -100
git log -p --all -S "sk_live_" | head -100
git log -p --all -S "pk_test_" | head -100

# Search for specific patterns
git log --all --source --remotes --branches -- '.env*'
```

### What to Look For
- [ ] SENTRY_DSN values
- [ ] Supabase keys (pk_*, sk_*)
- [ ] API tokens
- [ ] Private keys
- [ ] Credentials in commit messages

### If Secrets Found
```bash
# 1. Create new credentials (immediately!)
# 2. Add to .gitignore
# 3. Use git-filter-branch to rewrite history:
git filter-branch --tree-filter 'rm -f .env.local' -- --all

# 4. Force push (careful!)
git push origin main --force
```

### Success Criteria
- [ ] Git history scanned
- [ ] No secrets found (or cleaned up)
- [ ] `.env*` files in `.gitignore`
- [ ] Team notified of rotation

---

## 📖 Task 2.4: Update README with Setup Guide

### What to Do
Add environment setup section to README.

### File Location
`README.md` (update existing "Installation" or "Setup" section)

### Content to Add
```markdown
## 🔧 Environment Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Local Development

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/Trade-X-Pro-Global.git
   cd Trade-X-Pro-Global
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Copy template
   cp .env.example .env.local
   
   # Add your credentials
   # Get Supabase URL and keys from:
   # https://app.supabase.com/project/[your-project]/settings/api
   ```

4. **Start Dev Server**
   ```bash
   npm run dev
   # Opens http://localhost:5173
   ```

5. **Database Setup** (if migrations needed)
   ```bash
   npm run supabase:pull
   npm run supabase:push
   ```

### Environment Variables

See `.env.example` for all available variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable key |
| `SENTRY_DSN` | No | Error tracking (production only) |
| `VITE_DEBUG_REALTIME` | No | Enable realtime debugging |
| `VITE_LOG_LEVEL` | No | Log verbosity (info, debug, warn, error) |

### Security

⚠️ **NEVER commit `.env.local` to git**

- Environment variables are ignored in `.gitignore`
- Use `.env.example` as reference only
- Each developer maintains own `.env.local`
- Production secrets stored in deployment platform

For production deployment:
- Configure secrets in your deployment platform (Vercel, Netlify, etc.)
- Use `npm run build:sentry` to upload source maps
- See [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) for more
```

### Success Criteria
- [ ] README updated with setup section
- [ ] `.env.example` referenced
- [ ] Security warnings included
- [ ] Commands tested locally
- [ ] Team can follow guide successfully

---

## 🛡️ Task 2.5: Create SECURITY_CHECKLIST.md

### What to Do
Create a security checklist for the team.

### File Location
`SECURITY_CHECKLIST.md` (root of project)

### Content
```markdown
# Security Checklist

## 🔐 Before Each Commit

- [ ] No `.env.local` file staged
- [ ] No API keys in code
- [ ] No secrets in commit messages
- [ ] `.env.example` is up-to-date
- [ ] `.gitignore` covers all sensitive files

## 🚨 Before Each Push

- [ ] Run `git log --all -S "SENTRY_DSN\|API_KEY" | head`
- [ ] Review for accidentally committed secrets
- [ ] Secrets scan passed (if using automated tools)

## 🔑 Environment Variables

### Required for Local Development
- [ ] `VITE_SUPABASE_URL` set
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` set
- [ ] `.env.local` exists and is in `.gitignore`

### Optional (Development Only)
- [ ] `VITE_DEBUG_REALTIME=false` (don't commit as true)
- [ ] `VITE_LOG_LEVEL=info` (development verbosity)

### Production Only (Never Local)
- [ ] `SENTRY_DSN` only in deployment platform
- [ ] API keys rotated every 90 days
- [ ] Credentials audited monthly

## 🔍 If You Find a Secret

1. **Immediate Actions**
   - [ ] Rotate the exposed credential
   - [ ] Add to `.gitignore` if file-based
   - [ ] Update `.env.example` (without secret)
   - [ ] Notify the team

2. **Cleanup**
   - [ ] Use `git filter-branch` to remove from history
   - [ ] Force push changes
   - [ ] Update deployment credentials

## 📋 Team Responsibilities

| Role | Responsibility |
|------|-----------------|
| Developer | Never commit secrets, use `.env.local` |
| Lead | Audit `.env.example` quarterly |
| DevOps | Rotate secrets every 90 days |

## 🎯 Monthly Security Review

- [ ] Run `git log -all -S pattern` for accidental secrets
- [ ] Review `.gitignore` effectiveness
- [ ] Audit `.env.example` for outdated variables
- [ ] Rotate production credentials
- [ ] Review Supabase RLS policies

## Resources

- [Supabase: Environment Variables](https://supabase.com/docs/guides/environment-variables)
- [Sentry: Docs](https://docs.sentry.io/)
- [OWASP: Secrets Management](https://owasp.org/www-community/Sensitive_Data_Exposure)
```

### Success Criteria
- [ ] SECURITY_CHECKLIST.md created
- [ ] Pre-commit guidelines documented
- [ ] Monthly review schedule set
- [ ] Team notified of checklist
- [ ] Shared in onboarding docs

---

## ✅ Day 2-3 Completion Checklist

### Task 2.1: .env.example
- [ ] File created at root
- [ ] No real secrets included
- [ ] All variables documented
- [ ] Ready for team sharing

### Task 2.2: .gitignore
- [ ] Verified `.env*` coverage
- [ ] Verified `secrets/` coverage
- [ ] Verified `node_modules/` coverage
- [ ] No accidental matches

### Task 2.3: Git History Scan
- [ ] Scanned for SENTRY_DSN
- [ ] Scanned for Supabase keys
- [ ] Scanned for API tokens
- [ ] Documented findings
- [ ] Cleaned up if needed

### Task 2.4: README Update
- [ ] Setup section added
- [ ] Environment variables documented
- [ ] Security warnings included
- [ ] Instructions tested
- [ ] Examples working

### Task 2.5: SECURITY_CHECKLIST.md
- [ ] Created and complete
- [ ] Pre-commit checklist documented
- [ ] Monthly review schedule included
- [ ] Team guidelines clear
- [ ] Resources linked

---

## 🚀 Next Steps

After completing Day 2-3:
1. Have team review SECURITY_CHECKLIST.md
2. Each developer copies `.env.example` → `.env.local`
3. Verify no sensitive data in git
4. Proceed to Day 3-4 (RLS Policies)

---

## 📞 Troubleshooting

**Problem:** Variables not loading in dev server  
**Solution:** Restart dev server after `.env.local` changes

**Problem:** Old secret still visible in git  
**Solution:** Use `git filter-branch` then force push

**Problem:** .gitignore not working  
**Solution:** `git rm --cached .env.local && git add .gitignore`

---

## 📊 Estimated Time Breakdown

| Task | Effort | Time |
|------|--------|------|
| 2.1: .env.example | Low | 30 min |
| 2.2: .gitignore | Low | 30 min |
| 2.3: Git scan | Medium | 1 hour |
| 2.4: README update | Low | 1 hour |
| 2.5: Security checklist | Medium | 1.5 hours |
| Testing & verification | Medium | 1 hour |
| **Total** | **Medium** | **5 hours** |

---

**Ready to Start:** January 31, 2026  
**Target Completion:** February 1, 2026  
**Next Phase:** Day 3-4 (RLS Policies Review)
