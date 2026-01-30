# Security Checklist

**Version:** 1.0  
**Last Updated:** January 30, 2026  
**Status:** Active  

---

## 🔐 Before Each Commit

- [ ] No `.env.local` file staged
- [ ] No API keys in code
- [ ] No secrets in commit messages
- [ ] `.env.example` is up-to-date
- [ ] `.gitignore` covers all sensitive files
- [ ] Run `git diff --cached | grep -i "SENTRY_DSN\|API_KEY\|SECRET"`

---

## 🚨 Before Each Push

- [ ] Run `git log --all -S "SENTRY_DSN\|API_KEY" | head`
- [ ] Review for accidentally committed secrets
- [ ] Verify no `.env.local` in last 5 commits
- [ ] Check for credential patterns in diff

---

## 🔑 Environment Variables

### Required for Local Development
- [ ] `VITE_SUPABASE_URL` set (e.g., `https://project.supabase.co`)
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` set (starts with `eyJ...`)
- [ ] `.env.local` exists and is in `.gitignore`

### Optional (Development Only)
- [ ] `VITE_DEBUG_REALTIME=false` (don't commit as true)
- [ ] `VITE_LOG_LEVEL=info` (development verbosity)
- [ ] `ALLOWED_ORIGINS=http://localhost:5173`

### Production Only (Never in Local Environment)
- [ ] `SENTRY_DSN` only in deployment platform (Vercel, Netlify, etc.)
- [ ] API keys rotated every 90 days
- [ ] Credentials audited monthly
- [ ] No hardcoded secrets anywhere in code

---

## 🔍 If You Find a Secret

### Immediate Actions
1. [ ] **STOP** - Do not commit or push
2. [ ] **Rotate** the exposed credential immediately
3. [ ] **Add to `.gitignore`** if file-based (e.g., `.env.local`)
4. [ ] **Update `.env.example`** without the secret value
5. [ ] **Notify the team** about the exposure

### Cleanup Steps
1. [ ] Create new credentials in Supabase/Sentry
2. [ ] Invalidate the old credentials
3. [ ] Use `git filter-branch` to remove from history:
   ```bash
   git filter-branch --tree-filter 'rm -f .env.local' -- --all
   ```
4. [ ] Force push changes:
   ```bash
   git push origin main --force
   ```
5. [ ] Update deployment platform with new secrets
6. [ ] Document incident in team Slack

---

## 📋 Team Responsibilities

| Role | Responsibility | Frequency |
|------|-----------------|-----------|
| **Developer** | Never commit secrets, use `.env.local` | Every commit |
| **Team Lead** | Audit `.env.example` for outdated vars | Quarterly |
| **DevOps** | Rotate Supabase/Sentry credentials | Every 90 days |
| **Security** | Review git history for secrets | Monthly |

---

## 🎯 Monthly Security Review

- [ ] Run `git log --all -S "SENTRY_DSN\|API_KEY\|PASSWORD"` to check history
- [ ] Review `.gitignore` effectiveness (no `.env*` tracked)
- [ ] Audit `.env.example` for outdated variables
- [ ] Rotate production credentials
- [ ] Review Supabase RLS policies
- [ ] Check Sentry error tracking is active
- [ ] Verify deployment secrets are not exposed

---

## ✅ Local Setup Checklist

When setting up locally:
- [ ] Copy `.env.example` to `.env.local`
- [ ] Get Supabase URL from project settings
- [ ] Get Supabase publishable key from API settings
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Run `npm install`
- [ ] Run `npm run dev` and verify it loads
- [ ] Never commit `.env.local`

---

## 🔐 File Permissions

### Files That Should Never Be Tracked
```
.env
.env.local
.env.*.local
.ssh/
secrets/
private/
credentials/
```

### Files That Should Be in .gitignore
```ignore
# Environment
.env
.env.local
.env.*.local

# Secrets
.ssh/
secrets/
credentials/
private_keys/

# IDE
.vscode/local.settings.json
.idea/
```

---

## 📞 Reporting Security Issues

If you find a security vulnerability:
1. **Do NOT** open a public issue
2. **Do NOT** commit or push the vulnerability
3. **Email** security@your-domain.com with details
4. **Include**:
   - Type of vulnerability
   - Location in code
   - Steps to reproduce
   - Potential impact

---

## 🚀 Deployment Security

### Before Each Deployment
- [ ] Verify no `.env.local` in deployment
- [ ] Confirm secrets are in platform variables (Vercel, Netlify, etc.)
- [ ] Check Sentry DSN is set in production
- [ ] Verify RLS policies are enforced in Supabase
- [ ] Test with production data (if available)

### Production Credentials
- [ ] Stored in deployment platform's secret manager
- [ ] Rotated every 90 days
- [ ] Backed up securely
- [ ] Access logged and monitored

---

## 📚 Resources

### Documentation
- [Supabase Security](https://supabase.com/docs/guides/security)
- [Supabase Environment Variables](https://supabase.com/docs/guides/environment-variables)
- [Sentry Security](https://docs.sentry.io/security/)

### Tools
- [git-secrets](https://github.com/awslabs/git-secrets) - Prevent secret commits
- [TruffleHog](https://github.com/trufflesecurity/truffleHog) - Secret scanning
- [OWASP: Secrets Management](https://owasp.org/www-community/Sensitive_Data_Exposure)

### Best Practices
- [12 Factor App - Config](https://12factor.net/config)
- [NIST: Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)

---

## ✨ Pro Tips

1. **Use `.env.local`** for all local secrets
2. **Never share** `.env.local` via Slack, email, etc.
3. **Rotate credentials** regularly (every 90 days)
4. **Use strong** variable names in `.env.example`
5. **Document** what each variable does
6. **Test locally** before pushing to production
7. **Review diffs** before committing
8. **Enable** branch protection on main

---

## 📊 Audit Trail

When a secret is exposed:
1. Record the date and time
2. Document what was exposed
3. Track when it was rotated
4. Log any affected systems
5. Update incident log
6. Share lessons learned with team

**Incident Log Location:** (Create as needed)

---

## 🔄 Quick Reference

| Task | Command | When |
|------|---------|------|
| Check staged files | `git diff --cached` | Before commit |
| Scan git history | `git log --all -S "PATTERN"` | Before push |
| Rotate Supabase key | Log in to Supabase Dashboard | Every 90 days |
| Rotate Sentry DSN | Log in to Sentry Dashboard | Every 90 days |
| Review .gitignore | `cat .gitignore` | Monthly |
| Check tracked secrets | `git ls-files \| grep -E ".env"` | Monthly |

---

## 🎓 Team Training

All developers must:
- [ ] Read this checklist
- [ ] Understand why secrets are dangerous
- [ ] Know where to get credentials
- [ ] Know how to report issues
- [ ] Follow pre-commit checklist
- [ ] Rotate credentials annually

---

## 📋 Sign-Off

By using this codebase, you agree to:
- ✅ Never commit secrets to git
- ✅ Use `.env.local` for sensitive data
- ✅ Rotate credentials every 90 days
- ✅ Report security issues immediately
- ✅ Follow this checklist for every commit

---

**Last Updated:** January 30, 2026  
**Next Review:** April 30, 2026  
**Checklist Owner:** DevOps Team
