# Documentation Quick Reference

**Updated:** December 2025  
**Purpose:** Find the right document for your immediate need

---

## 🚀 Getting Started (First Time?)

**You need**: SETUP.md (30 min read)
- How to clone the repo
- How to install dependencies
- How to configure environment variables
- How to start the dev server

**Then read**: CONTRIBUTING.md (20 min)
- Code standards and conventions
- How to commit changes
- What tests to write
- PR process

**Then read**: ARCHITECTURE.md (30 min)
- How the system is structured
- Frontend vs backend responsibilities
- Data flow patterns
- Security model

---

## 🔧 Common Tasks

### "I need to implement a new feature"
1. **Plan**: Read PRD.md (feature requirements)
2. **Reference**: Check ARCHITECTURE.md (data flow)
3. **Code**: Follow CONTRIBUTING.md (standards)
4. **Test**: Follow TESTING.md (test requirements)
5. **Review**: Use CODE_OF_CONDUCT.md Section 6.1 (review etiquette)

### "I need to make an API call"
1. **Reference**: API.md (endpoint documentation)
2. **Type Safety**: Check integrations/supabase/types.ts (auto-generated types)
3. **Error Handling**: API.md Section 10 (error patterns)
4. **Testing**: TESTING.md Section 4 (component test examples)

### "I need to understand the data model"
1. **Overview**: ARCHITECTURE.md Section 4 (database schema)
2. **Details**: TradePro v10 plan.md (complete schema definitions)
3. **Security**: SECURITY.md Section 2.4 (RLS policies)
4. **Code**: Check `/supabase/migrations/` (actual schema)

### "I'm stuck with an error"
1. **Frontend Setup**: SETUP.md Section 7 (troubleshooting)
2. **Security**: SECURITY.md (compliance issues)
3. **Testing**: TESTING.md Section 12 (debugging)
4. **Environment**: ENVIRONMENT.md (config issues)

### "I need to review someone's PR"
1. **Standards**: CONTRIBUTING.md Section 5 (code review standards)
2. **Design**: CONTRIBUTING.md Section 6 (design system)
3. **Security**: SECURITY.md Section 8.2 (security checklist)
4. **Testing**: TESTING.md Section 8 (coverage requirements)
5. **Community**: CODE_OF_CONDUCT.md Section 6.1 (review etiquette)

### "I'm concerned about security"
1. **Policy**: SECURITY.md (complete security framework)
2. **Report**: SECURITY.md Section 3 (vulnerability reporting)
3. **Code Review**: SECURITY.md Section 4 (secure coding patterns)
4. **Deployment**: ENVIRONMENT.md Section 2.3 (security best practices)

### "I need to test my code"
1. **Strategy**: TESTING.md Section 1 (coverage targets)
2. **Unit Tests**: TESTING.md Section 3 (Vitest examples)
3. **Components**: TESTING.md Section 4 (React Testing Library)
4. **E2E Tests**: TESTING.md Section 6 (Playwright)

### "I'm fixing a bug"
1. **Reproduce**: TESTING.md Section 12.2 (debugging techniques)
2. **Test**: TESTING.md Section 3.2 (write regression test)
3. **Fix**: Follow CONTRIBUTING.md standards
4. **Verify**: TESTING.md (run full test suite)

### "I need to deploy"
1. **Environment**: ENVIRONMENT.md (all stages)
2. **Security**: SECURITY.md Section 2.3 (deployment security)
3. **Checklist**: CONTRIBUTING.md Section 5 (before merge)
4. **Procedures**: DEPLOYMENT.md (coming soon)

---

## 📚 By Document

### CHANGELOG.md
**When you need it:**
- Publishing a release
- Documenting breaking changes
- Communicating updates

**Time to read:** 5 min
**Key sections:** Version structure, categories

### CONTRIBUTING.md
**When you need it:**
- Before every commit
- Understanding code standards
- Preparing a PR

**Time to read:** 20 min
**Key sections:** Naming conventions, testing requirements, design system

### ENVIRONMENT.md
**When you need it:**
- Setting up locally (first time)
- Understanding configuration
- Deploying to staging/production

**Time to read:** 15 min
**Key sections:** Required variables, Supabase setup, security

### ARCHITECTURE.md
**When you need it:**
- Learning the system
- Understanding data flow
- Planning a major feature

**Time to read:** 45 min
**Key sections:** Diagrams, state management, security architecture

### API.md
**When you need it:**
- Implementing features using API
- Understanding real-time subscriptions
- Learning error handling

**Time to read:** 30 min
**Key sections:** Endpoint reference, subscription patterns, error examples

### SECURITY.md
**When you need it:**
- Before committing sensitive code
- Responding to security issues
- Understanding compliance requirements

**Time to read:** 30 min (skim 10 min)
**Key sections:** Vulnerability disclosure, secure coding, RLS policies

### TESTING.md
**When you need it:**
- Writing tests
- Debugging failures
- Understanding coverage requirements

**Time to read:** 40 min
**Key sections:** Test structure, examples, best practices

### CODE_OF_CONDUCT.md
**When you need it:**
- Reviewing PRs
- Working with the team
- Reporting issues

**Time to read:** 15 min
**Key sections:** Expected behavior, code review etiquette, resolution process

### SETUP.md
**When you need it:**
- First time setup
- Fixing environment issues
- Setting up IDE

**Time to read:** 30 min
**Key sections:** Prerequisites, quick start, IDE setup, troubleshooting

---

## 🎯 By Role

### 👨‍💻 Developer (New)
**Essential Reading** (2 hours):
1. SETUP.md - Get running locally
2. CONTRIBUTING.md - Learn standards
3. ARCHITECTURE.md - Understand system
4. Your first issue + Code Review Example

**Recommended** (next week):
- TESTING.md (Section 3-4)
- API.md (your feature domain)
- SECURITY.md (Section 4)

### 👨‍💼 Developer (Experienced)
**Quick Refresh**:
1. CHANGELOG.md (what's new)
2. CONTRIBUTING.md (any changes to standards)
3. Your assigned issue

**Reference**:
- API.md (for unfamiliar APIs)
- ARCHITECTURE.md (for major features)

### 🔍 Code Reviewer
**Before Reviewing**:
1. CONTRIBUTING.md Section 5 (review standards)
2. CODE_OF_CONDUCT.md Section 6.1 (etiquette)
3. TESTING.md Section 8 (coverage checklist)
4. SECURITY.md Section 8.2 (security checklist)

**During Review**: Reference specific sections as needed

### 🛡️ Security Officer
**Setup** (first day):
1. SECURITY.md (entire document)
2. CONTRIBUTING.md Section 6 (developer responsibilities)

**Regular Tasks**:
- SECURITY.md Section 3.1 (process new reports)
- SECURITY.md Section 6 (incident response)

### 🚀 DevOps/Deployment
**Initial Setup**:
1. ENVIRONMENT.md (configuration)
2. ARCHITECTURE.md Section 5 (deployment architecture)

**Deployment Day**:
- ENVIRONMENT.md (stage-specific config)
- SECURITY.md Section 2.3 (security headers)

### 📚 Tech Lead / Maintainer
**Daily**:
- GitHub Issues & PRs
- CONTRIBUTING.md Section 5 (review standards)
- CODE_OF_CONDUCT.md (community management)

**Weekly**:
- CHANGELOG.md (release planning)
- TESTING.md (coverage metrics)
- SECURITY.md (incident review)

**Monthly**:
- ARCHITECTURE.md (design decisions)
- PRD.md (feature progress)

---

## 🔗 Cross-Document Navigation

**Understanding Features?**
1. PRD.md (requirements)
2. ARCHITECTURE.md (data flow)
3. API.md (endpoints)
4. CONTRIBUTING.md (standards)

**Understanding Security?**
1. SECURITY.md (policies)
2. ARCHITECTURE.md Section 5 (security architecture)
3. CONTRIBUTING.md Section 6 (developer responsibilities)
4. ENVIRONMENT.md Section 2.3 (production security)

**Understanding Testing?**
1. TESTING.md (complete guide)
2. CONTRIBUTING.md Section 4 (minimum requirements)
3. Specific test files in codebase

**Getting a New Developer Started?**
1. This document (navigation)
2. SETUP.md (local environment)
3. CONTRIBUTING.md (standards)
4. ARCHITECTURE.md (system overview)
5. TESTING.md (testing requirements)
6. Create first issue (hands-on)

---

## ⏱️ Reading Time Estimates

| Document | Quick (Skim) | Full Read | Deep Dive |
|----------|--------------|-----------|-----------|
| CHANGELOG.md | 3 min | 5 min | 10 min |
| CONTRIBUTING.md | 10 min | 20 min | 40 min |
| ENVIRONMENT.md | 10 min | 15 min | 30 min |
| ARCHITECTURE.md | 20 min | 45 min | 90 min |
| API.md | 15 min | 30 min | 60 min |
| SECURITY.md | 15 min | 30 min | 60 min |
| TESTING.md | 20 min | 40 min | 90 min |
| CODE_OF_CONDUCT.md | 10 min | 15 min | 30 min |
| SETUP.md | 15 min | 30 min | 60 min |
| **Total** | **98 min** | **190 min** | **390 min** |

**Recommendation:**
- **First Week**: Full read of essentials (SETUP, CONTRIBUTING, ARCHITECTURE)
- **Ongoing**: Skim relevant sections before tasks
- **Monthly**: Deep dive into one document

---

## 🆘 Help Matrix

| Problem | First Check | Then Check | Contact |
|---------|-------------|------------|---------|
| **Can't start dev server** | SETUP.md §7 | ENVIRONMENT.md | dev@trade-x-pro.dev |
| **Test failing** | TESTING.md §12 | Test file comments | dev@trade-x-pro.dev |
| **PR rejected for standards** | CONTRIBUTING.md | CODE_OF_CONDUCT.md | code-review@trade-x-pro.dev |
| **Security question** | SECURITY.md | CONTRIBUTING.md §6 | security@trade-x-pro.dev |
| **API error** | API.md §10 | API.md examples | dev@trade-x-pro.dev |
| **Incident** | SECURITY.md §6 | Contact list | security@trade-x-pro.dev |
| **Community issue** | CODE_OF_CONDUCT.md | SECURITY.md | conduct@trade-x-pro.dev |
| **Feature requirement** | PRD.md | ARCHITECTURE.md | dev@trade-x-pro.dev |

---

## 📱 Mobile-Friendly Summary

### Essential Commands
```bash
npm run dev        # Start development
npm run test       # Run tests
npm run lint       # Check code style
npm run build      # Production build
```

### Key Files to Know
```
src/lib/trading/           # Business logic
src/hooks/                 # React hooks
src/components/            # UI components
supabase/migrations/       # Database schema
docs/                      # All documentation
```

### Common Code Patterns
- See CONTRIBUTING.md (code examples)
- See TESTING.md (test examples)
- See ARCHITECTURE.md (architecture patterns)

---

## 🎓 Learning Path

### Week 1 (First Time)
- [ ] Read SETUP.md
- [ ] Run `npm run dev`
- [ ] Read CONTRIBUTING.md
- [ ] Create first branch
- [ ] Complete first issue (with review)

### Week 2
- [ ] Read ARCHITECTURE.md
- [ ] Read TESTING.md
- [ ] Write tests for your code
- [ ] Complete 2-3 more issues

### Week 3
- [ ] Read API.md
- [ ] Read SECURITY.md Section 4
- [ ] Start reviewing PRs
- [ ] Begin mentoring if possible

### Month 2
- [ ] Deep dive on your domain area
- [ ] Read deployment docs
- [ ] Become domain expert
- [ ] Help with architecture discussions

---

## 📞 Contact & Resources

**Questions About**: **Contact**:
- Setup Issues | dev@trade-x-pro.dev
- Code Standards | code-review@trade-x-pro.dev
- Security | security@trade-x-pro.dev
- Community | conduct@trade-x-pro.dev
- General | GitHub Discussions

**External Resources**:
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Save this file for quick reference!**

Last updated: December 2025
