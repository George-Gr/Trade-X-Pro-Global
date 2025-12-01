# Rules & Guidelines

**Last Updated:** December 2025

Complete reference documentation for Trade-X-Pro-Global development, governance, and community standards.

---

## 📚 Documentation Index

### Core Guidelines
- **[SECURITY.md](./SECURITY.md)** - Security architecture, policies, and incident response
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Development standards, code conventions, PR process
- **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)** - Community values, expected behavior, enforcement
- **[TESTING.md](./TESTING.md)** - Testing strategy, examples, best practices

### Setup & Deployment
- **[SETUP.md](./SETUP.md)** - Local development environment configuration
- **[ENVIRONMENT.md](../../../ENVIRONMENT.md)** - Environment variables for all stages
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment procedures *(pending)*

### Architecture & Reference
- **[ARCHITECTURE.md](../../../ARCHITECTURE.md)** - System design, data flows, scaling strategy
- **[API.md](../../../API.md)** - Complete endpoint reference and examples

---

## 🎯 Quick Navigation

### By Role

#### 👨‍💻 **New Developer**
Start here:
1. [SETUP.md](./SETUP.md) - Get your local environment working
2. [CONTRIBUTING.md](./CONTRIBUTING.md) - Learn code standards
3. [ARCHITECTURE.md](../../../ARCHITECTURE.md) - Understand system design

#### 🔍 **Code Reviewer**
Start here:
1. [CONTRIBUTING.md](./CONTRIBUTING.md) - Review standards (lines 50-100)
2. [TESTING.md](./TESTING.md) - Coverage requirements
3. [SECURITY.md](./SECURITY.md) - Security checklist (Section 8.2)

#### 🛡️ **Security Officer**
Start here:
1. [SECURITY.md](./SECURITY.md) - Comprehensive security policy
2. [CONTRIBUTING.md](./CONTRIBUTING.md) - Security checklist (section 6)
3. [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Incident response

#### 📋 **Maintainer**
Start here:
1. [CONTRIBUTING.md](./CONTRIBUTING.md) - Process overview
2. [SECURITY.md](./SECURITY.md) - Enforcement procedures
3. [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community management

#### 🚀 **DevOps/Deployment**
Start here:
1. [ENVIRONMENT.md](../../../ENVIRONMENT.md) - Environment configuration
2. [SECURITY.md](./SECURITY.md) - Deployment security
3. DEPLOYMENT.md *(coming soon)* - Deployment procedures

---

## ✅ Compliance Checklist

Use this checklist before each release:

### Pre-Development
- [ ] Feature documented in PRD.md
- [ ] Similar features reviewed (no duplication)
- [ ] Database schema changes planned (RLS policies)
- [ ] Security review scheduled

### During Development
- [ ] Code follows CONTRIBUTING.md standards
- [ ] Tests written (see TESTING.md)
- [ ] Linting passes: `npm run lint`
- [ ] Types checked: `npm run type:check`
- [ ] No hardcoded secrets
- [ ] RLS cleanup in useEffect
- [ ] SECURITY.md checklist (Section 8.1)

### Before Code Review
- [ ] PR template filled completely
- [ ] Commit messages follow convention
- [ ] No console.log statements
- [ ] Changelog entry added
- [ ] Reviewed by >=1 maintainer

### Before Merge
- [ ] All CI/CD checks passing
- [ ] Security review completed
- [ ] Performance review (if needed)
- [ ] Accessibility tested (WCAG 2.1 AA)
- [ ] Documentation updated

### Before Production Deploy
- [ ] Staging deployment successful
- [ ] Integration tests passing
- [ ] Database backups confirmed
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured

---

## 📊 Standards Summary

### Code Standards
- **Format**: Prettier (on save)
- **Lint**: ESLint + TypeScript
- **Type Checking**: TypeScript strict mode (selective)
- **Components**: React 18 functional + TypeScript
- **State**: Context + Hooks + React Query
- **Testing**: Vitest (100% business logic, 80% components)

### Design Standards  
- **Framework**: Tailwind CSS 4
- **Colors**: #0A1628 navy, #F39C12 gold, #00C896 emerald, #FF4757 red
- **Typography**: Inter (headings/body), JetBrains Mono (data)
- **Spacing**: 8px grid
- **Components**: shadcn/ui + custom components

### Security Standards
- **Auth**: Supabase JWT with auto-refresh
- **Database**: PostgreSQL + RLS policies
- **Encryption**: TLS 1.3+ transport + at-rest encryption
- **Secrets**: Never in repo, always in .env.local
- **Auditing**: Immutable audit logs + Sentry monitoring

### Performance Standards
- **Lighthouse**: 90+ all categories
- **First Contentful Paint (FCP)**: <1.5s
- **Largest Contentful Paint (LCP)**: <2.5s
- **Cumulative Layout Shift (CLS)**: <0.1
- **Bundle Size**: <400KB initial

### Testing Standards
- **Unit Tests**: 100% business logic
- **Component Tests**: 80% coverage
- **E2E Tests**: Critical user paths
- **Integration Tests**: Realtime subscriptions
- **Accessibility**: WCAG 2.1 AA

---

## 🔄 Review Process

### Standard PR Review (Target: 24 hours)
1. **Automated Checks** (CI/CD pipeline)
   - ESLint & TypeScript checks
   - Unit tests
   - Build verification
2. **Code Review** (Maintainer)
   - Standards compliance
   - Design review
   - Performance impact
3. **Security Review** (If needed)
   - RLS policies
   - Input validation
   - Secret exposure check
4. **Merge & Deploy**
   - Auto-merge on main after approval
   - Automatic staging deployment
   - Manual prod deployment

---

## 📞 Getting Help

| Topic | Resource | Contact |
|-------|----------|---------|
| **Setup Issues** | SETUP.md Section 7 | dev@trade-x-pro.dev |
| **Code Standards** | CONTRIBUTING.md | code-review@trade-x-pro.dev |
| **Security Questions** | SECURITY.md Section 2-3 | security@trade-x-pro.dev |
| **Testing Help** | TESTING.md Section 11 | dev@trade-x-pro.dev |
| **Code of Conduct** | CODE_OF_CONDUCT.md | conduct@trade-x-pro.dev |
| **General Questions** | GitHub Discussions | dev@trade-x-pro.dev |

---

## 📅 Document Maintenance

**Review Schedule**:
- **Monthly**: Review for outdated practices
- **Quarterly**: Update with new learnings
- **Annually**: Comprehensive audit (December)

**Last Reviewed**: December 2025  
**Next Review**: December 2026

**Changes Made This Review**:
- ✅ Created SECURITY.md (was generic template)
- ✅ Created TESTING.md (was missing)
- ✅ Created CODE_OF_CONDUCT.md (was missing)
- ✅ Created SETUP.md (was missing)
- ✅ Updated links to new docs

---

## 🎓 Training Resources

### For Onboarding
1. Start with SETUP.md (30 min)
2. Read CONTRIBUTING.md (20 min)
3. Review ARCHITECTURE.md (30 min)
4. Study TESTING.md examples (30 min)
5. Practice: Create your first branch

### For Security Training
1. Review SECURITY.md Section 2-4 (45 min)
2. Study code examples (30 min)
3. Complete security review checklist (15 min)

### For Architecture Deep Dive
1. Read ARCHITECTURE.md (60 min)
2. Trace data flow example (30 min)
3. Review real codebase examples (60 min)

---

## 📝 Contributing to Documentation

Found an issue? Want to improve docs?

1. **Create issue** with:
   - Which document has the issue
   - Specific line/section
   - Proposed fix

2. **Submit PR** with:
   - Clear description of change
   - Why it's needed
   - Updated "Last Updated" date

3. **Get approval** from maintainer

---

## 🔗 Related Documentation

**Parent Directories:**
- `/docs/` - All project documentation
- `/docs/frontend/` - Frontend strategy & design system (10 docs)
- `/docs/project_resources/` - Backend specs, resources, knowledge base

**Top-Level Docs:**
- `PRD.md` - Product requirements & roadmap
- `CHANGELOG.md` - Version history & releases
- `README.md` - Project overview

---

**Last Updated**: December 2025  
**Maintained By**: Core Development Team  
**Questions?** Email dev@trade-x-pro.dev

*This documentation is authoritative. When in doubt, refer here first.*
