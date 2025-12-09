# COMPREHENSIVE FULL-STACK CODEBASE ANALYSIS PROMPT

You are now entering **HYPER-VIGILANT FULL-STACK AUDIT MODE** with architectural-level precision and obsessive attention to detail across the entire technology stack. Your mission is to conduct the most thorough, comprehensive codebase audit ever performed on this application—covering frontend, backend, database, infrastructure, security, performance, and everything in between.

## 🎯 MISSION OBJECTIVE

Perform a complete, multi-layered, end-to-end analysis of the ENTIRE codebase. Examine every architectural decision, every line of code, every database query, every API endpoint, every security boundary, every performance bottleneck, and every integration point. Leave absolutely nothing unexamined. Your holistic understanding of full-stack systems is your superpower—use it to uncover EVERYTHING that's wrong, suboptimal, insecure, or could be architected better.

## 📋 COMPREHENSIVE AUDIT SCOPE

Perform a complete, multi-layered analysis covering ALL aspects of the stack:

---

## 🎨 FRONTEND LAYER ANALYSIS

### Visual & UI Quality
- Pixel-perfect alignment and spacing consistency
- Typography scale adherence and consistency
- Color palette usage and design token compliance
- Border-radius, shadows, and visual effects consistency
- Responsive design at all breakpoints (320px → 1920px+)
- Visual hierarchy and information architecture
- Dark mode implementation (if applicable)
- Print stylesheet quality

### Component Architecture
- React component structure and organization
- Component composition vs inheritance patterns
- Custom hooks extraction and reusability
- Props interface design and typing quality
- Component file size and complexity (>300 lines flag)
- Prop drilling depth (>3 levels flag)
- State management patterns (useState, useReducer, Context)
- Component lifecycle and cleanup
- Error boundary coverage
- Suspense boundary implementation

### TypeScript Quality
- Type safety and strictness
- 'any' type usage (should be minimal)
- Type guards and discriminated unions
- Interface vs type usage consistency
- Generic type usage and constraints
- Utility type leveraging
- Type inference optimization
- Missing type definitions
- Third-party library type definitions

### State Management
- Local vs global state decisions
- Context API usage and performance
- State management library integration (Zustand, Redux, etc.)
- State normalization and structure
- Derived state vs stored state
- State synchronization with backend
- Optimistic updates implementation
- Cache invalidation strategies
- Real-time data handling (Supabase subscriptions)

### Routing & Navigation
- Route structure and organization
- Protected route implementation
- Route parameter handling
- Query parameter management
- Navigation guards and middleware
- Deep linking support
- Browser history management
- 404 and error page handling
- Route-based code splitting

### Forms & Validation
- Form library usage (React Hook Form, Formik)
- Client-side validation implementation
- Error message quality and clarity
- Real-time validation feedback
- Form state management
- Multi-step form handling
- File upload implementation
- Form accessibility (labels, ARIA)
- Validation schema consistency

### Interaction & Animation
- Hover states on all interactive elements
- Focus indicators for keyboard navigation
- Active/pressed states
- Loading states (buttons, forms, pages)
- Transition timing and easing consistency
- Animation performance (60fps verification)
- Skeleton loader accuracy
- Page transition effects
- Scroll animations
- Gesture handling
- Reduced motion preferences

### Accessibility (WCAG 2.1 AA)
- Semantic HTML usage
- ARIA attributes and roles correctness
- Keyboard navigation flow
- Focus management in modals/dialogs
- Screen reader compatibility
- Alt text quality for images
- Form label associations
- Color contrast ratios (4.5:1 minimum)
- Focus indicators (2px minimum)
- Heading hierarchy (h1→h2→h3)
- Skip to content links
- Live regions for dynamic content

### Performance Optimization
- Bundle size analysis
- Code splitting strategy
- Lazy loading implementation
- Image optimization (WebP, AVIF, lazy loading)
- Font loading strategy (FOIT/FOUT prevention)
- React.memo, useMemo, useCallback usage
- Unnecessary re-renders identification
- Virtual scrolling for long lists
- Debouncing and throttling
- Web Vitals (LCP, FID, CLS, INP, TTFB)
- Cumulative Layout Shift issues

### Tailwind CSS & Styling
- Design token adherence
- Arbitrary value usage (should be minimal)
- Utility class organization and ordering
- Responsive variant usage
- @apply usage (should be rare)
- Custom CSS necessity
- Dark mode class strategy
- Purge configuration
- Theme customization approach
- Component-specific styles organization

### Shadcn UI Integration
- Component library consistency
- Custom vs Shadcn components decision
- Theme customization via CSS variables
- Variant usage through CVA
- Radix UI primitive usage
- Accessibility features preservation
- Component composition patterns
- Custom component quality matching Shadcn

---

## ⚙️ BACKEND LAYER ANALYSIS (Deno + Supabase)

### API Architecture
- RESTful design principles adherence
- API endpoint naming conventions
- HTTP method usage correctness
- Request/response format consistency
- API versioning strategy
- Endpoint organization and grouping
- GraphQL schema design (if applicable)
- RPC function design and usage

### Deno Edge Functions
- Function organization and structure
- Environment variable handling
- Cold start optimization
- Function size and complexity
- Dependency management
- Error handling in functions
- Logging and monitoring
- Function timeout handling
- Memory usage optimization
- Concurrent request handling

### Authentication & Authorization
- Supabase Auth integration quality
- JWT token handling and validation
- Session management strategy
- Refresh token implementation
- Password policy enforcement
- Multi-factor authentication (if applicable)
- OAuth provider integration
- Role-based access control (RBAC)
- Permission checking consistency
- Auth state synchronization

### API Request/Response Handling
- Input validation and sanitization
- Request body parsing
- Query parameter validation
- Error response format consistency
- HTTP status code correctness
- Response payload optimization
- Pagination implementation
- Filtering and sorting
- Rate limiting implementation
- CORS configuration

### Error Handling
- Global error handler implementation
- Error logging and tracking
- User-friendly error messages
- Error recovery strategies
- Retry logic for transient failures
- Circuit breaker patterns
- Graceful degradation
- Error boundary coverage
- Logging context and correlation IDs

### Business Logic
- Domain logic organization
- Business rule implementation
- Validation logic placement (client vs server)
- Service layer abstraction
- Code reusability across functions
- Complex algorithm optimization
- Transaction handling
- Idempotency for critical operations
- Event-driven architecture patterns

### Integration Points
- Third-party API integrations
- Webhook handlers
- External service error handling
- API client implementation
- Rate limit handling for external APIs
- Timeout and retry configuration
- Circuit breaker for external services
- Mock data for testing
- Integration testing coverage

---

## 🗄️ DATABASE LAYER ANALYSIS (Supabase/PostgreSQL)

### Schema Design
- Table structure and normalization
- Relationship design (1:1, 1:N, N:M)
- Foreign key constraints
- Unique constraints
- Check constraints
- Default values appropriateness
- Enum type usage
- JSONB column usage (when appropriate)
- Timestamp columns (created_at, updated_at)
- Soft delete implementation
- Audit trail columns

### Data Types & Constraints
- Data type appropriateness
- VARCHAR length decisions
- Numeric precision and scale
- Date/timestamp with timezone usage
- Boolean vs enum decisions
- Array column usage
- UUID vs integer ID decisions
- NOT NULL constraint usage
- Domain types for reusability

### Indexing Strategy
- Index coverage for common queries
- Composite index design
- Partial index usage
- Unique index implementation
- Full-text search indexes (tsvector)
- Index maintenance overhead
- Missing indexes identification
- Unused indexes identification
- Index selectivity analysis

### Row Level Security (RLS)
- RLS policies on all tables
- Policy correctness and security
- Policy performance impact
- Policy testing coverage
- Bypass scenarios prevention
- Service role vs anon key usage
- RLS with complex relationships
- Policy naming conventions
- Policy documentation

### Database Functions & Triggers
- Function purpose and necessity
- PL/pgSQL code quality
- Function performance
- Trigger appropriateness
- Trigger ordering issues
- Side effect management
- Function security (SECURITY DEFINER)
- Return type correctness
- Error handling in functions

### Queries & Performance
- N+1 query problems
- Query optimization opportunities
- JOIN strategy (INNER, LEFT, etc.)
- Subquery vs JOIN decisions
- Aggregate function usage
- Window function usage
- Query result set size
- Explain analyze results
- Slow query identification
- Query batching opportunities

### Migrations & Versioning
- Migration file organization
- Up/down migration completeness
- Migration idempotency
- Seed data management
- Schema versioning strategy
- Migration testing
- Rollback strategy
- Production migration safety

### Data Integrity
- Referential integrity enforcement
- Cascade delete/update decisions
- Orphaned record prevention
- Data validation in database
- Transaction isolation levels
- Deadlock prevention
- Constraint violation handling

### Supabase-Specific Features
- Real-time subscription usage
- Storage bucket configuration
- Storage security policies
- Edge function triggers
- PostgREST API utilization
- Connection pooling configuration
- Database connection limits

---

## 🔒 SECURITY ANALYSIS

### Authentication Security
- Password hashing strength
- JWT secret management
- Token expiration settings
- Session timeout configuration
- Account lockout after failed attempts
- Password reset flow security
- Email verification enforcement
- OAuth state parameter validation

### Authorization Security
- RLS policy completeness
- Authorization check consistency
- Privilege escalation prevention
- Horizontal authorization checks
- Vertical authorization checks
- API endpoint authorization
- Resource ownership verification
- Admin vs user separation

### Input Validation & Sanitization
- SQL injection prevention
- XSS (Cross-Site Scripting) prevention
- Command injection prevention
- Path traversal prevention
- File upload validation
- Content type verification
- Input length restrictions
- Regular expression safety (ReDoS)
- HTML sanitization
- JSON parsing safety

### Data Protection
- Sensitive data encryption at rest
- Sensitive data encryption in transit
- PII (Personal Identifiable Information) handling
- Credit card data handling (PCI compliance)
- GDPR compliance considerations
- Data retention policies
- Data anonymization/pseudonymization
- Secure data deletion
- Backup encryption

### Environment & Secrets Management
- Environment variable usage
- Secrets in version control check
- API key exposure prevention
- Database credential security
- Third-party API key management
- .env file protection
- Production vs development separation
- Secret rotation strategy

### API Security
- CORS configuration correctness
- CSRF protection
- Rate limiting implementation
- API key validation
- Request signing/verification
- Webhook signature verification
- HTTP security headers
- SSL/TLS enforcement
- API documentation security

### File Upload Security
- File type validation
- File size limits
- Malware scanning (if applicable)
- Storage path randomization
- Direct file access prevention
- Image processing security
- CDN security configuration

### Dependencies & Supply Chain
- Dependency vulnerability scanning
- Outdated package identification
- Known CVE in dependencies
- Package integrity verification
- Dependency update strategy
- License compliance
- Unused dependency removal

---

## 🚀 PERFORMANCE ANALYSIS

### Frontend Performance
- Bundle size optimization
- Code splitting effectiveness
- Lazy loading coverage
- Image optimization
- Font loading strategy
- CSS optimization
- JavaScript execution time
- Memory leaks
- React DevTools Profiler analysis
- Lighthouse performance score

### Backend Performance
- API response time
- Database query performance
- Function execution time
- Cold start optimization (Edge Functions)
- Caching strategy
- Connection pooling
- Concurrent request handling
- Memory usage
- CPU usage

### Database Performance
- Query execution plans (EXPLAIN ANALYZE)
- Index usage verification
- Full table scan identification
- Lock contention issues
- Connection pool saturation
- Query timeout configuration
- Database size and growth
- Vacuum and maintenance jobs

### Caching Strategy
- Browser caching headers
- API response caching
- Database query caching
- CDN configuration
- Cache invalidation strategy
- Cache key design
- Cache hit ratio
- Stale data handling

### Network Performance
- API payload size
- HTTP/2 or HTTP/3 usage
- Compression (gzip, brotli)
- CDN usage for assets
- DNS resolution time
- Connection reuse
- Prefetch/preload/preconnect usage
- Asset delivery optimization

### Real-Time Performance
- WebSocket connection management
- Supabase real-time subscription efficiency
- Message queue size
- Event batching
- Connection pooling for real-time
- Reconnection strategy

---

## 🧪 TESTING & QUALITY ASSURANCE

### Test Coverage
- Unit test coverage percentage
- Integration test coverage
- E2E test coverage
- Component test coverage
- API endpoint test coverage
- Database function test coverage
- Critical path coverage

### Test Quality
- Test case completeness
- Edge case coverage
- Error scenario testing
- Positive and negative testing
- Boundary value testing
- Mock quality and realism
- Test data management
- Test isolation and independence

### Testing Strategy
- Testing framework selection
- Test organization and structure
- Test naming conventions
- Setup and teardown procedures
- Fixture management
- Database seeding for tests
- Test environment configuration
- CI/CD integration

### Code Quality Tools
- Linter configuration (ESLint, Deno lint)
- Formatter configuration (Prettier)
- Type checker configuration (TypeScript strict mode)
- Code complexity analysis
- Dead code detection
- Unused imports/variables
- Console.log statements in production code
- Commented-out code removal

---

## 📐 ARCHITECTURE & DESIGN PATTERNS

### Overall Architecture
- Architectural pattern (MVC, Hexagonal, Clean, etc.)
- Layer separation and boundaries
- Dependency direction
- Module organization
- Code coupling assessment
- Cohesion evaluation
- Scalability considerations
- Maintainability assessment

### Design Patterns
- Pattern appropriateness
- Pattern implementation quality
- Repository pattern usage
- Factory pattern usage
- Singleton pattern usage (and risks)
- Observer pattern for events
- Strategy pattern for algorithms
- Adapter pattern for integrations

### Code Organization
- File and folder structure
- Module boundaries
- Circular dependency detection
- Import path conventions
- Barrel exports usage
- Code duplication assessment
- Function/component size
- Separation of concerns

### API Design Patterns
- RESTful resource modeling
- Endpoint versioning
- Pagination strategy
- Filtering and sorting patterns
- Batch operation support
- Partial response support
- HATEOAS implementation (if applicable)
- Error response standardization

---

## 🔧 CONFIGURATION & INFRASTRUCTURE

### Build Configuration
- Vite configuration optimization
- TypeScript configuration strictness
- Environment variable handling
- Asset optimization configuration
- Source map configuration
- Development vs production builds
- Build output analysis

### Deployment Configuration
- Deployment strategy (Vercel, Netlify, etc.)
- Environment variable management
- Build script correctness
- Deployment automation
- Rollback strategy
- Blue-green deployment support
- Canary deployment support

### Monitoring & Logging
- Error tracking setup (Sentry, etc.)
- Application logging strategy
- Log levels appropriateness
- Structured logging
- Log aggregation
- Performance monitoring
- Uptime monitoring
- Alert configuration

### CI/CD Pipeline
- Pipeline configuration
- Automated testing in pipeline
- Linting and formatting checks
- Type checking in pipeline
- Build verification
- Deployment automation
- Environment promotion strategy
- Pipeline failure handling

### Environment Configuration
- Development environment setup
- Staging environment configuration
- Production environment configuration
- Environment parity
- Feature flags implementation
- Configuration management
- Secret management in different environments

---

## 📚 DOCUMENTATION & MAINTAINABILITY

### Code Documentation
- Inline comment quality and necessity
- JSDoc/TSDoc coverage
- Complex logic explanation
- Function documentation
- Component prop documentation
- API endpoint documentation
- Database schema documentation
- Architecture decision records (ADRs)

### Project Documentation
- README.md completeness
- Setup instructions accuracy
- Development workflow documentation
- Deployment instructions
- Environment variable documentation
- API documentation (OpenAPI/Swagger)
- Database schema visualization
- Architecture diagrams

### Code Readability
- Variable and function naming
- Code formatting consistency
- Code style consistency
- Magic number/string elimination
- Complex expression simplification
- Function length appropriateness
- Nested logic depth
- Early return usage

### Maintainability
- Technical debt identification
- Refactoring opportunities
- Deprecated code removal
- TODO/FIXME comment tracking
- Code smell identification
- Cyclomatic complexity
- Cognitive complexity
- Long-term sustainability assessment

---

## 🔄 DATA FLOW & STATE MANAGEMENT

### Data Flow Architecture
- Unidirectional data flow
- Data fetching strategy
- Cache management
- Optimistic updates
- Real-time data synchronization
- Offline support
- Data persistence strategy

### State Synchronization
- Client-server state sync
- Race condition handling
- Stale data detection
- Conflict resolution
- Eventually consistent patterns
- Event sourcing (if applicable)

### Error Recovery
- Network error handling
- Timeout handling
- Retry logic
- Exponential backoff
- Circuit breaker implementation
- Fallback strategies
- User feedback on errors

---

## 🌐 CROSS-CUTTING CONCERNS

### Internationalization (i18n)
- i18n library usage
- Translation coverage
- Language switching
- Date/time localization
- Number formatting
- RTL support (if applicable)
- Translation file organization

### Error Tracking & Debugging
- Error boundary implementation
- Error logging to service
- Source map configuration
- Debug information availability
- Error context collection
- User session tracking

### Feature Flags
- Feature flag implementation
- Flag configuration management
- A/B testing support
- Gradual rollout capability
- Flag cleanup strategy

### Analytics & Metrics
- Analytics integration
- Event tracking
- User behavior tracking
- Conversion tracking
- Custom metrics
- Privacy compliance

---

## 📊 OUTPUT REQUIREMENTS

Generate the **IMPLEMENTATION_ROADMAP.md** with:

### 1. Executive Summary
```
Overall Completion: [X%]
Frontend Status: [X%] - [Brief assessment]
Backend Status: [X%] - [Brief assessment]
Database Status: [X%] - [Brief assessment]
Security Status: [X%] - [Brief assessment]
Performance Status: [X%] - [Brief assessment]
Testing Coverage: [X%]
Critical Blockers: [Number]
High Priority Issues: [Number]
Medium Priority Issues: [Number]
Low Priority Issues: [Number]
Total Issues Found: [Number]
Estimated Time to Production-Ready: [X weeks/months]
```

### 2. Project Health Dashboard
- **What's Working Well**: Successfully implemented features and solid architectural decisions
- **Critical Issues**: Priority-ranked blockers preventing deployment or causing major problems
- **Technical Debt Summary**: Major refactoring needed, performance bottlenecks, security vulnerabilities
- **Architecture Assessment**: Overall system design evaluation
- **Scalability Assessment**: Can this handle growth?
- **Maintainability Assessment**: How easy is it to work with?
- **Security Posture**: Overall security health

### 3. PRD Alignment Analysis
Create a comprehensive matrix mapping PRD requirements to implementation status:
- ✅ **Fully Implemented**: Working as specified with tests
- ⚠️ **Partially Implemented**: Started but incomplete or buggy
- ❌ **Not Implemented**: Missing entirely
- 🔄 **Needs Refactoring**: Implemented but poorly or incorrectly

Include:
- Feature completion percentage
- User story implementation status
- Technical requirement fulfillment
- Business rule compliance
- Gap analysis with specific missing features

### 4. Comprehensive Issue Catalog

For EVERY issue found across ALL layers, document:

**Issue [LAYER]-[ID]: [Clear Action Title]**
- **Layer**: Frontend | Backend | Database | Security | Performance | Architecture | Testing | Infrastructure
- **Status**: ❌ Not Started | 🔄 In Progress | ✅ Complete
- **Severity**: 🚨 Critical | 🔴 High | 🟡 Medium | 🟢 Low
- **Category**: [Specific subcategory]
- **Component/Module**: Specific file paths and line numbers
- **PRD Reference**: Section/requirement this addresses
- **Dependencies**: Must complete [Issue X] first

**Problem Description**:
- What's wrong and why it matters
- Impact on users, security, performance, or maintainability
- Root cause analysis
- How this got into the codebase

**Current State**:
```typescript
// Show exact problematic code with context
// Include file path and line numbers
```

**User/System Impact**:
- Functional impact
- Security implications
- Performance degradation
- User experience problems
- Maintenance burden

**Solution**:
```typescript
// Show corrected implementation
// Include all necessary changes
// Show full context, not just snippets
```

**Implementation Steps**:
1. Detailed step-by-step instructions
2. Files to create/modify with full paths
3. Database migrations needed (with SQL)
4. Configuration changes required
5. Dependencies to install
6. Environment variables to add
7. RLS policies to create/update
8. Tests to write/update

**Acceptance Criteria**:
- [ ] Specific, testable outcome 1
- [ ] Specific, testable outcome 2
- [ ] All error cases handled
- [ ] Tests written and passing
- [ ] Security validated
- [ ] Performance verified
- [ ] Documentation updated

**Testing Steps**:
1. Unit tests to write/run
2. Integration tests needed
3. Manual testing procedures
4. Edge cases to verify
5. Browser/device testing
6. Load testing (if applicable)

**Security Considerations**:
- Security implications of the fix
- Additional security measures needed
- Penetration testing requirements

**Performance Considerations**:
- Performance impact of the fix
- Optimization opportunities
- Benchmarking requirements

**Estimated Effort**: [X hours/days]

### 5. Layer-Specific Breakdowns

#### 🎨 Frontend Issues Summary
- Total frontend issues: [X]
- By category: Visual [X], Component [X], State [X], Performance [X], A11y [X]
- Critical path blockers
- Quick wins
- Long-term improvements

#### ⚙️ Backend Issues Summary
- Total backend issues: [X]
- By category: API [X], Business Logic [X], Integration [X], Error Handling [X]
- Critical path blockers
- Quick wins
- Long-term improvements

#### 🗄️ Database Issues Summary
- Total database issues: [X]
- By category: Schema [X], RLS [X], Queries [X], Indexes [X], Migrations [X]
- Critical path blockers
- Quick wins
- Long-term improvements

#### 🔒 Security Issues Summary
- Total security issues: [X]
- By severity: Critical [X], High [X], Medium [X], Low [X]
- **MUST FIX BEFORE LAUNCH**
- CVE tracking
- Compliance requirements

#### 🚀 Performance Issues Summary
- Total performance issues: [X]
- Frontend metrics: LCP [X], FID [X], CLS [X]
- Backend metrics: Avg response time [X], P95 [X], P99 [X]
- Database metrics: Slow queries [X], Missing indexes [X]
- Optimization opportunities

### 6. Architecture Assessment

**Current Architecture**:
- Pattern analysis
- Strengths
- Weaknesses
- Scalability concerns
- Maintainability concerns

**Recommended Improvements**:
- Short-term fixes
- Long-term refactoring
- Pattern adoption suggestions
- Module reorganization

### 7. Technology Stack Evaluation

**Current Stack**:
- TypeScript [version] - [Assessment]
- React [version] - [Assessment]
- Tailwind CSS [version] - [Assessment]
- Vite [version] - [Assessment]
- Shadcn UI - [Assessment]
- Deno [version] - [Assessment]
- Supabase - [Assessment]

**Recommendations**:
- Version upgrades needed
- Alternative library suggestions
- Deprecated dependency replacement
- Missing tools/libraries to add

### 8. Testing Coverage Report

**Current Coverage**:
- Unit tests: [X%]
- Integration tests: [X%]
- E2E tests: [X%]
- Component tests: [X%]
- API tests: [X%]

**Coverage Gaps**:
- Untested critical paths
- Missing edge case tests
- Insufficient error scenario coverage
- Integration points lacking tests

**Testing Improvements Needed**:
- Tests to write
- Testing infrastructure needed
- CI/CD integration improvements

### 9. Security Audit Report

**Vulnerability Summary**:
- Critical: [X]
- High: [X]
- Medium: [X]
- Low: [X]

**Compliance Status**:
- OWASP Top 10 coverage
- GDPR considerations
- Data protection compliance
- Industry-specific requirements

**Security Hardening Checklist**:
- [ ] All inputs validated and sanitized
- [ ] All RLS policies in place and tested
- [ ] No secrets in code or version control
- [ ] All dependencies up-to-date and scanned
- [ ] HTTPS enforced everywhere
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Authentication flows secure
- [ ] Authorization checks comprehensive
- [ ] Sensitive data encrypted

### 10. Performance Benchmark Report

**Frontend Performance**:
- Lighthouse score: [X/100]
- Bundle size: [X KB]
- LCP: [X ms]
- FID: [X ms]
- CLS: [X]
- TTFB: [X ms]

**Backend Performance**:
- Average response time: [X ms]
- P95 response time: [X ms]
- P99 response time: [X ms]
- Concurrent user capacity: [X]
- Database query avg time: [X ms]

**Performance Goals**:
- Target metrics
- Current vs target gap
- Optimization priorities

### 11. Systematic Implementation Roadmap

#### 🚨 Phase 0: Critical Fixes (BLOCK DEPLOYMENT)
**Estimated Time**: [X hours/days]
**Must Complete Before Launch**: YES

Issues that MUST be fixed:
- Security vulnerabilities
- Data corruption risks
- Broken core functionality
- Accessibility blockers
- Compliance violations

**Task 0.1**: [Issue Title]
- Full task details as specified above
- [ ] Checklist item
- [ ] Checklist item

[Repeat for all critical issues]

**Phase 0 Completion Criteria**:
- [ ] All security vulnerabilities patched
- [ ] Core user flows work end-to-end
- [ ] No data integrity risks
- [ ] Basic accessibility standards met

---

#### 🔴 Phase 1: Core Features & High Priority (MVP)
**Estimated Time**: [X weeks]
**Dependencies**: Phase 0 complete

Features and fixes required for MVP:
- Complete core user stories
- Essential API endpoints
- Primary user flows
- Basic error handling
- Core security measures

**Task 1.1**: [Issue Title]
[Full task details]

**Task 1.2**: [Issue Title]
[Full task details]

[Continue for all Phase 1 tasks]

**Phase 1 Completion Criteria**:
- [ ] All PRD core features implemented
- [ ] User can complete primary workflows
- [ ] Basic performance acceptable
- [ ] Security fundamentals in place
- [ ] Error handling covers common cases

---

#### 🟡 Phase 2: Enhanced Functionality & Medium Priority
**Estimated Time**: [X weeks]
**Dependencies**: Phase 1 complete

Secondary features and improvements:
- Nice-to-have features
- Performance optimizations
- Enhanced error handling
- Improved UX polish
- Additional security hardening

**Task 2.1**: [Issue Title]
[Full task details]

[Continue for all Phase 2 tasks]

**Phase 2 Completion Criteria**:
- [ ] Secondary features complete
- [ ] Performance optimized
- [ ] Error handling comprehensive
- [ ] UX polished
- [ ] Security hardened

---

#### 🟢 Phase 3: Polish, Optimization & Low Priority
**Estimated Time**: [X weeks]
**Dependencies**: Phase 2 complete

Polish and refinements:
- UI/UX refinements
- Micro-interactions
- Edge case handling
- Documentation completion
- Test coverage improvements
- Technical debt reduction

**Task 3.1**: [Issue Title]
[Full task details]

[Continue for all Phase 3 tasks]

**Phase 3 Completion Criteria**:
- [ ] Application feels polished
- [ ] Edge cases handled
- [ ] Documentation complete
- [ ] Technical debt addressed
- [ ] Test coverage >80%

---

#### 🔵 Phase 4: Future Enhancements & Nice-to-Haves
**Estimated Time**: [X weeks]
**Dependencies**: Phase 3 complete

Post-launch improvements:
- Advanced features
- Experimental features
- Platform expansions
- Integration additions
- Advanced optimizations

**Task 4.1**: [Issue Title]
[Full task details]

[Continue for all Phase 4 tasks]

---

### 12. Visual Timeline & Dependencies

```
Gantt Chart:
Week 1-2:   🚨 Phase 0 [=========>] Critical Fixes
Week 3-6:   🔴 Phase 1 [===============>] Core Features (depends on Phase 0)
Week 7-10:  🟡 Phase 2 [===============>] Enhancements (depends on Phase 1)
Week 11-14: 🟢 Phase 3 [===============>] Polish (depends on Phase 2)
Week 15+:   🔵 Phase 4 [===============>] Future (depends on Phase 3)

Critical Path:
Issue 0.1 → Issue 0.3 → Issue 1.2 → Issue 1.5 → Issue 2.1 → Launch
```

**Dependency Map**:
```
[Issue 0.1: Database RLS] 
    ↓
[Issue 1.2: Auth Implementation]
    ↓
[Issue 1.5: User Dashboard]
    ↓
[Issue 2.3: User Profile]
```

### 13. Risk Assessment & Mitigation

**High-Risk Areas**:
- Security vulnerabilities
- Performance bottlenecks
- Data migration challenges
- Third-party integration failures
- Scaling concerns

**Risk Mitigation Strategies**:
- Backup plans
- Rollback procedures
- Testing strategies
- Monitoring and alerts

### 14. Quality Gates & Checkpoints

**Before Each Phase Completion**:
- [ ] All tasks in phase completed
- [ ] Tests written and passing
- [ ] Code review completed
- [ ] Security review passed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Staging deployment successful
- [ ] Stakeholder approval obtained

### 15. Best Practices & Recommendations

#### Development Workflow
- Git branching strategy
- Commit message conventions
- PR review checklist
- Code review standards
- Testing requirements before merge

#### Code Quality Standards
- TypeScript strict mode enabled
- ESLint rules enforced
- Prettier formatting consistent
- Component size limits (<300 lines)
- Function complexity limits
- Test coverage minimums (>80%)

#### Security Best Practices
- Security review checklist
- Dependency update schedule
- Secret rotation policy
- Incident response plan
- Security testing requirements

#### Performance Best Practices
- Performance budget
- Bundle size limits
- Lighthouse score minimums
- Core Web Vitals targets
- Database query performance standards

#### Accessibility Standards
- WCAG 2.1 Level AA compliance
- Keyboard navigation requirements
- Screen reader testing
- Color contrast requirements
- Focus management standards

### 16. Maintenance & Monitoring Strategy

**Ongoing Maintenance**:
- Dependency update schedule
- Security patch policy
- Database maintenance tasks
- Performance monitoring
- Error tracking and resolution
- User feedback incorporation

**Monitoring Setup**:
- Application performance monitoring (APM)
- Error tracking service
- Uptime monitoring
- Database performance monitoring
- User analytics
- Business metrics tracking

### 17. Team Onboarding & Knowledge Transfer

**Documentation for New Developers**:
- Architecture overview
- Setup instructions
- Development workflow
- Testing strategy
- Deployment process
- Common issues and solutions

**Key Architectural Decisions**:
- Why TypeScript
- Why Deno over Node.js
- Why Supabase
- State management choice
- Styling approach (Tailwind + Shadcn)

### 18. Success Metrics

**Technical Metrics**:
- Build time: <[X] minutes
- Bundle size: <[X] KB
- Lighthouse score: >[X]/100
- Test coverage: >[X]%
- API response time: <[X]ms
- Database query time: <[X]ms
- Uptime: >[X]%

**Business Metrics**:
- Time to interactive: <[X]s
- Error rate: <[X]%
- User satisfaction score
- Feature adoption rate
- Support ticket volume

**Quality Metrics**:
- Code review approval rate
- Bug escape rate
- Mean time to resolution (MTTR)
- Technical debt ratio
- Security incident count

### 19. Long-Term Roadmap

**Next 3 Months**:
- Immediate priorities
- Quick wins
- Foundation building

**Next 6 Months**:
- Platform stabilization
- Performance optimization
- Feature expansion
- Technical debt reduction

**Next 12 Months**:
- Scalability improvements
- Advanced feature development
- Platform maturity
- Market expansion capabilities

### 20. Appendices

#### Appendix A: Code Examples & Patterns
- Recommended component patterns
- API endpoint templates
- Database query patterns
- Error handling examples
- Authentication flow examples
- Form validation patterns

#### Appendix B: Tool & Library Recommendations
- Development tools
- Testing libraries
- Monitoring services
- Security tools
- Performance analysis tools
- Documentation generators

#### Appendix C: Reference Architecture
- System architecture diagram
- Data flow diagrams
- Database schema visualization
- API endpoint map
- Component hierarchy
- Authentication flow diagram

#### Appendix D: Glossary
- Technical terms
- Acronyms
- Project-specific terminology
- Architecture patterns explained

---

## 🎯 SPECIFIC ANALYSIS INSTRUCTIONS

### 1. Be Comprehensive and Systematic
- Examine EVERY file in the codebase
- Check EVERY component, API endpoint, database table
- Review EVERY integration point
- Test EVERY user flow
- Validate EVERY security boundary
- Measure EVERY performance metric

### 2. Think Like Multiple Experts Simultaneously
- **As a Security Expert**: Find every vulnerability, every weak point, every potential exploit
- **As a Performance Engineer**: Identify every bottleneck, every inefficiency, every optimization opportunity
- **As a Frontend Specialist**: See every visual inconsistency, every UX friction point, every accessibility issue
- **As a Backend Architect**: Evaluate API design, business logic organization, error handling
- **As a Database Administrator**: Assess schema design, query performance, indexing strategy
- **As a DevOps Engineer**: Review deployment, monitoring, infrastructure configuration
- **As a QA Engineer**: Find missing tests, untested scenarios, quality gaps
- **As a Product Manager**: Verify PRD alignment, feature completeness, user value delivery

### 3. Prioritize Ruthlessly
- **Critical (🚨)**: Blocks launch, causes data loss, major security vulnerability, broken core functionality
- **High (🔴)**: Significantly impacts users, major performance issue, important feature gap
- **Medium (🟡)**: Noticeable issue, technical debt, optimization opportunity
- **Low (🟢)**: Minor refinement, nice-to-have, future enhancement

### 4. Be Specific, Never Vague
❌ **BAD**: "The authentication needs work"
✅ **GOOD**: "JWT tokens in localStorage are vulnerable to XSS. Move to httpOnly cookies. File: `src/utils/auth.ts` lines 45-52. Implement in Deno Edge Function at `supabase/functions/auth/index.ts`"

❌ **BAD**: "Database queries are slow"
✅ **GOOD**: "Query in `getUserPosts` function performs N+1 queries fetching post authors. Add JOIN to fetch authors in single query. File: `supabase/functions/posts/index.ts` line 67. Create composite index on (user_id, created_at) in posts table."

❌ **BAD**: "Components need refactoring"
✅ **GOOD**: "UserDashboard component is 450 lines. Extract PostList (lines 120-250), UserProfile (lines 260-380), and ActivityFeed (lines 390-440) into separate components. File: `src/components/UserDashboard.tsx`"

### 5. Provide Complete Solutions
For every issue, include:
- Exact file locations and line numbers
- Current problematic code
- Corrected implementation with full context
- Step-by-step implementation instructions
- Database migrations (if needed)
- RLS policies (if needed)
- Environment variables (if needed)
- Test cases to write
- Verification steps

### 6. Consider the Entire System Impact
When identifying an issue, consider:
- Does fixing this break anything else?
- What are the downstream effects?
- Are there related issues that should be fixed together?
- What's the migration path from current to fixed state?
- How does this affect existing users and data?

### 7. Map Everything to PRD
For every PRD requirement:
- Verify if implemented
- Check if correctly implemented
- Identify gaps
- Note quality of implementation
- Assess test coverage
- Validate error handling

### 8. Measure and Quantify
Don't just say "slow" or "bad" - provide metrics:
- "Bundle size is 2.3MB (target: <100KB after gzip)"
- "API response time is 2.4s (target: <200ms)"
- "Lighthouse score is 42/100 (target: >90)"
- "Test coverage is 23% (target: >80%)"
- "12 critical security vulnerabilities found"
- "47 missing accessibility features"

### 9. Balance Idealism with Pragmatism
- Identify the "perfect" solution
- Also identify the "good enough for now" solution
- Note when technical debt is acceptable
- Highlight where corners CANNOT be cut (security, data integrity)

### 10. Create Actionable, Independent Tasks
Each task should be:
- Completable by a developer without asking questions
- Testable with clear success criteria
- Estimatable with reasonable accuracy
- Independent or with clearly stated dependencies

---

## 🚀 EXECUTION METHODOLOGY

### Phase 1: Initial Reconnaissance (Quick Scan)
**Time**: 30-60 minutes

1. **Project Structure Review**
   - Examine folder organization
   - Identify main entry points
   - Map out application architecture
   - Review package.json dependencies
   - Check configuration files

2. **PRD Deep Dive**
   - Read PRD thoroughly
   - Extract all requirements
   - Categorize features
   - Identify acceptance criteria
   - Note non-functional requirements

3. **Quick Health Check**
   - Run the application
   - Test core user flows
   - Identify obvious critical issues
   - Check build and deployment setup

### Phase 2: Deep Dive Analysis (Systematic Audit)
**Time**: 4-8 hours (depending on codebase size)

1. **Frontend Layer (2-3 hours)**
   - Examine every component file
   - Test every page at all breakpoints
   - Check every interaction state
   - Verify accessibility with keyboard navigation
   - Review state management
   - Analyze bundle and performance

2. **Backend Layer (1-2 hours)**
   - Review all API endpoints
   - Check all Deno Edge Functions
   - Verify authentication/authorization
   - Review error handling
   - Check integration points

3. **Database Layer (1-2 hours)**
   - Review schema design
   - Check all RLS policies
   - Analyze query patterns
   - Review indexes
   - Check migrations

4. **Security Audit (1 hour)**
   - Check authentication security
   - Verify authorization everywhere
   - Review input validation
   - Check for common vulnerabilities
   - Verify secret management

5. **Performance Analysis (30 minutes)**
   - Run Lighthouse audits
   - Profile frontend rendering
   - Measure API response times
   - Check database query performance
   - Analyze bundle size

6. **Testing & Quality (30 minutes)**
   - Review test coverage
   - Check test quality
   - Verify CI/CD setup
   - Review code quality tools

### Phase 3: Issue Cataloging & Prioritization
**Time**: 1-2 hours

1. **Compile Issues**
   - List every issue found
   - Categorize by layer and type
   - Assign severity
   - Note file locations

2. **Prioritize**
   - Rank by impact and urgency
   - Identify dependencies
   - Group related issues
   - Determine critical path

3. **Estimate Effort**
   - Provide time estimates for each issue
   - Calculate phase totals
   - Consider team velocity
   - Add buffer for unknowns

### Phase 4: Report Generation
**Time**: 2-3 hours

1. **Write Comprehensive Report**
   - Executive summary
   - Detailed issue catalog
   - Phase-based roadmap
   - Recommendations and best practices

2. **Create Visual Assets**
   - Timeline diagrams
   - Dependency maps
   - Architecture diagrams
   - Progress trackers

3. **Quality Check**
   - Review for completeness
   - Verify all issues are actionable
   - Check for missing information
   - Validate estimates

### Phase 5: Systematic Execution (Ongoing)
**Time**: Weeks to months (depending on scope)

1. **Execute Phase by Phase**
   - Start with Phase 0 (Critical)
   - Complete all tasks in phase
   - Verify all acceptance criteria
   - Update progress tracking

2. **Continuous Testing**
   - Test each fix thoroughly
   - Run regression tests
   - Verify no new issues introduced
   - Update test suites

3. **Regular Progress Updates**
   - Daily/weekly status updates
   - Blockers and risks
   - Completed tasks
   - Upcoming work

---

## 📝 ANALYSIS PROMPT TEMPLATES

### Quick Start Analysis Prompt (Copy-Paste Ready)

```
Conduct a comprehensive, full-stack codebase audit of this TypeScript + React + Tailwind CSS + Vite + Shadcn UI + Deno + Supabase application.

ANALYZE EVERY LAYER:

🎨 FRONTEND:
- Visual consistency (alignment, spacing, typography, colors, borders, shadows)
- Component architecture (React structure, TypeScript quality, hooks, state management)
- Responsive design (test 320px→1920px)
- Interactions (hover, focus, loading, disabled states)
- Animations (timing, smoothness, transitions)
- Accessibility (WCAG 2.1 AA, keyboard nav, screen readers, ARIA)
- Tailwind CSS quality (design tokens, arbitrary values, organization)
- Shadcn UI integration
- Performance (bundle size, CLS, re-renders, optimization)
- UX friction points

⚙️ BACKEND:
- API architecture (RESTful design, endpoints, versioning)
- Deno Edge Functions (organization, performance, error handling)
- Authentication & authorization (Supabase Auth, JWT, RBAC)
- Request/response handling (validation, error responses, pagination)
- Business logic organization
- Integration points (third-party APIs, webhooks)
- Error handling and logging

🗄️ DATABASE:
- Schema design (normalization, relationships, constraints)
- Data types and constraints
- Indexing strategy (missing indexes, composite indexes)
- Row Level Security policies (completeness, correctness)
- Database functions and triggers
- Query performance (N+1 problems, optimization)
- Migrations (quality, versioning)
- Supabase-specific features (real-time, storage)

🔒 SECURITY:
- Authentication security (password handling, token management)
- Authorization (RLS policies, endpoint protection)
- Input validation & sanitization (SQL injection, XSS, CSRF)
- Data protection (encryption, PII handling)
- Secret management (no secrets in code)
- API security (CORS, rate limiting, headers)
- Dependency vulnerabilities
- OWASP Top 10 compliance

🚀 PERFORMANCE:
- Frontend (Lighthouse score, bundle size, Web Vitals)
- Backend (API response times, function execution)
- Database (query performance, indexes)
- Caching strategy
- Network optimization
- Real-time performance

🧪 TESTING:
- Test coverage (unit, integration, e2e)
- Test quality (edge cases, mocks, assertions)
- Testing strategy and organization
- CI/CD integration

📐 ARCHITECTURE:
- Overall architecture assessment
- Design patterns usage
- Code organization
- Module boundaries
- Scalability considerations
- Maintainability

🔧 CONFIGURATION:
- Build configuration (Vite, TypeScript)
- Deployment setup
- Environment management
- Monitoring and logging
- CI/CD pipeline

📚 DOCUMENTATION:
- Code documentation
- Project documentation (README, setup)
- API documentation
- Architecture decision records

PRD ALIGNMENT:
- Map every PRD requirement to implementation
- Identify: ✅ Complete | ⚠️ Partial | ❌ Missing | 🔄 Needs Refactoring

OUTPUT: Generate IMPLEMENTATION_ROADMAP.md with:

1. Executive Summary (completion %, status by layer, total issues, critical blockers)
2. Project Health Dashboard (what's working, critical issues, technical debt)
3. PRD Alignment Matrix (requirement mapping with gaps)
4. Comprehensive Issue Catalog (EVERY issue with: ID, severity, layer, category, file location, problem description, current code, solution, implementation steps, acceptance criteria, testing steps, effort estimate)
5. Layer-Specific Breakdowns (Frontend, Backend, Database, Security, Performance summaries)
6. Architecture Assessment
7. Security Audit Report (vulnerability summary, compliance status)
8. Performance Benchmark Report
9. Testing Coverage Report
10. Systematic Implementation Roadmap:
    - 🚨 Phase 0: Critical Fixes (blocks deployment)
    - 🔴 Phase 1: Core Features (MVP)
    - 🟡 Phase 2: Enhanced Functionality
    - 🟢 Phase 3: Polish & Optimization
    - 🔵 Phase 4: Future Enhancements
11. Visual Timeline & Dependencies (Gantt chart, dependency map)
12. Risk Assessment & Mitigation
13. Quality Gates & Checkpoints
14. Best Practices & Recommendations
15. Maintenance & Monitoring Strategy
16. Success Metrics

For EVERY issue provide:
- Issue ID, severity (🚨🔴🟡🟢), layer, category
- Exact file location and line numbers
- Problem description with system impact
- Current problematic code
- Corrected solution with full implementation
- Step-by-step instructions (files, migrations, tests, config)
- Acceptance criteria checklist
- Testing procedures
- Security considerations
- Performance considerations
- Estimated effort

Be BRUTALLY thorough. Check EVERYTHING. Find 100-500+ issues across all layers. Be specific with file paths and line numbers. No vague descriptions - only specific, measurable, actionable findings.

Map EVERY PRD requirement. Identify ALL gaps. Provide COMPLETE solutions.

After the report, systematically execute fixes phase by phase with real-time progress updates.

BEGIN THE MOST COMPREHENSIVE FULL-STACK AUDIT EVER CONDUCTED. 🎯
```

---

### Deep Dive Analysis Prompt (Maximum Detail)

```
You are entering HYPER-VIGILANT FULL-STACK AUDIT MODE.

MISSION: Conduct the most thorough, comprehensive, multi-layered analysis of this entire codebase ever performed. Leave absolutely nothing unexamined.

TECH STACK:
- Frontend: TypeScript + React + Tailwind CSS + Vite + Shadcn UI
- Backend: Deno Edge Functions + Supabase
- Database: PostgreSQL (Supabase)
- Deployment: [Your deployment platform]

AUDIT METHODOLOGY:

Phase 1: RECONNAISSANCE (30-60 min)
- Review project structure and organization
- Read PRD thoroughly and extract ALL requirements
- Run application and test core flows
- Identify obvious critical issues
- Map application architecture

Phase 2: DEEP DIVE ANALYSIS (4-8 hours)

🎨 FRONTEND LAYER (2-3 hours):
Examine with pixel-perfect precision:
- Every component file (structure, typing, hooks, state)
- Every page at every breakpoint (320, 375, 414, 768, 1024, 1280, 1536, 1920px)
- Every interaction state (hover, focus, active, loading, disabled, error)
- Every animation and transition (timing, smoothness, easing)
- Accessibility with keyboard navigation and screen reader
- Typography scale, spacing scale, color palette adherence
- Tailwind CSS usage (arbitrary values, design tokens, organization)
- Shadcn UI integration quality
- Bundle size and code splitting
- React DevTools Profiler analysis
- Lighthouse audit
- Web Vitals measurement

Hunt for:
- Alignment issues (down to 1px)
- Inconsistent spacing/colors/fonts
- Missing interaction states
- Poor responsive design
- Accessibility violations
- Animation jank
- Performance issues
- UX friction points
- Prop drilling
- Unnecessary re-renders
- TypeScript 'any' usage
- Component complexity >300 lines

⚙️ BACKEND LAYER (1-2 hours):
Examine systematically:
- Every API endpoint (naming, HTTP methods, request/response format)
- Every Deno Edge Function (structure, performance, error handling)
- Authentication implementation (Supabase Auth integration)
- Authorization checks (EVERYWHERE)
- Input validation and sanitization
- Error handling patterns
- Business logic organization
- Third-party integrations
- Webhook handlers
- Environment variable usage
- Logging strategy

Hunt for:
- Missing authorization checks
- Poor error handling
- Input validation gaps
- Inconsistent API design
- Complex functions needing refactoring
- Hardcoded values
- Missing rate limiting
- Poor logging

🗄️ DATABASE LAYER (1-2 hours):
Examine comprehensively:
- Schema design (tables, relationships, constraints)
- Data types and column definitions
- Indexes (existing, missing, unused)
- RLS policies on EVERY table
- Database functions and triggers
- Migrations (quality, versioning)
- Query patterns in codebase
- EXPLAIN ANALYZE for slow queries
- Foreign key constraints
- Default values
- Enum types

Hunt for:
- Missing RLS policies
- Poor schema design
- Missing indexes
- N+1 query problems
- Inefficient queries
- Missing constraints
- Poor migration quality
- Data integrity issues

🔒 SECURITY AUDIT (1 hour):
Check exhaustively:
- Authentication security (password hashing, token management)
- Authorization (RLS, API endpoints, UI)
- Input validation EVERYWHERE
- Output encoding
- SQL injection prevention
- XSS prevention
- CSRF protection
- Secret management (no secrets in code!)
- Dependency vulnerabilities
- CORS configuration
- Security headers
- Rate limiting
- File upload security
- API key exposure

Hunt for OWASP Top 10:
- A01: Broken Access Control
- A02: Cryptographic Failures
- A03: Injection
- A04: Insecure Design
- A05: Security Misconfiguration
- A06: Vulnerable Components
- A07: Authentication Failures
- A08: Software/Data Integrity
- A09: Logging/Monitoring Failures
- A10: Server-Side Request Forgery

🚀 PERFORMANCE ANALYSIS (30 min):
Measure and analyze:
- Lighthouse score (target: >90)
- Bundle size (target: <100KB gzipped)
- Core Web Vitals (LCP, FID/INP, CLS)
- API response times (target: <200ms)
- Database query times
- React component re-renders
- Memory leaks
- Image optimization
- Font loading
- Code splitting effectiveness
- Caching strategy

🧪 TESTING & QUALITY (30 min):
Review comprehensively:
- Test coverage percentage
- Unit test quality
- Integration test coverage
- E2E test coverage
- Component test coverage
- API test coverage
- Test organization
- Mock quality
- Edge case coverage
- CI/CD pipeline
- Linter configuration
- Formatter setup
- TypeScript strict mode

📐 ARCHITECTURE REVIEW:
Assess holistically:
- Overall architecture pattern
- Layer separation
- Module organization
- Code coupling
- Design patterns usage
- Scalability considerations
- Maintainability
- Technical debt

Phase 3: PRD ALIGNMENT (1 hour)
For EVERY requirement in PRD:
- Locate implementation in codebase
- Verify correctness
- Check test coverage
- Validate error handling
- Assess quality
- Rate: ✅ Complete | ⚠️ Partial | ❌ Missing | 🔄 Needs Refactoring

Phase 4: ISSUE CATALOGING (1-2 hours)
Document EVERY issue found:
- Assign unique ID
- Determine severity
- Categorize by layer and type
- Note exact file location
- Describe problem and impact
- Provide complete solution
- Write implementation steps
- Create acceptance criteria
- Estimate effort

Phase 5: ROADMAP GENERATION (2-3 hours)
Create detailed implementation roadmap:
- Executive summary with metrics
- Project health dashboard
- PRD alignment matrix
- Comprehensive issue catalog
- Layer-specific breakdowns
- Security audit report
- Performance benchmark
- Testing coverage report
- Systematic implementation phases
- Visual timeline
- Risk assessment
- Best practices
- Monitoring strategy

SEVERITY CLASSIFICATION:
🚨 CRITICAL: Blocks launch, data loss risk, major security vulnerability, broken core functionality
🔴 HIGH: Significant user impact, major performance issue, important feature gap, security concern
🟡 MEDIUM: Noticeable issue, technical debt, optimization opportunity, minor UX friction
🟢 LOW: Minor refinement, nice-to-have, future enhancement, code quality improvement

OUTPUT REQUIREMENTS:

Generate IMPLEMENTATION_ROADMAP.md with ALL sections:
1. Executive Summary (completion stats, blockers, timeline)
2. Project Health Dashboard (strengths, critical issues, technical debt, assessments)
3. PRD Alignment Matrix (every requirement mapped)
4. Comprehensive Issue Catalog (100-500+ issues)
5. Frontend Issues Summary
6. Backend Issues Summary
7. Database Issues Summary
8. Security Issues Summary (MUST FIX BEFORE LAUNCH)
9. Performance Issues Summary
10. Architecture Assessment
11. Technology Stack Evaluation
12. Testing Coverage Report
13. Security Audit Report
14. Performance Benchmark Report
15. Systematic Implementation Roadmap:
    - Phase 0: Critical Fixes
    - Phase 1: Core Features (MVP)
    - Phase 2: Enhanced Functionality
    - Phase 3: Polish & Optimization
    - Phase 4: Future Enhancements
16. Visual Timeline & Dependencies
17. Risk Assessment & Mitigation
18. Quality Gates & Checkpoints
19. Best Practices & Recommendations
20. Maintenance & Monitoring Strategy
21. Team Onboarding Guide
22. Success Metrics
23. Long-Term Roadmap
24. Appendices (code examples, tool recommendations, architecture diagrams)

For EVERY SINGLE ISSUE:
- Issue [LAYER]-[ID]: Title
- Layer, Status, Severity, Category
- File location with line numbers
- PRD reference
- Dependencies
- Problem description (what, why, impact, root cause)
- Current problematic code
- User/system impact
- Complete solution code
- Implementation steps (files, migrations, config, tests)
- Acceptance criteria checklist
- Testing steps (unit, integration, manual, edge cases)
- Security considerations
- Performance considerations
- Estimated effort

CRITICAL REQUIREMENTS:
✅ Be SPECIFIC - exact file paths, line numbers, measurements
✅ Be COMPLETE - full code examples, all steps, all considerations
✅ Be ACTIONABLE - any developer can pick up and execute
✅ Be THOROUGH - find 100-500+ issues across all layers
✅ Be PRECISE - no vague descriptions, only concrete findings
✅ Map EVERY PRD requirement
✅ Provide COMPLETE solutions with migrations, tests, config
✅ Consider ENTIRE system impact for each fix
✅ Create INDEPENDENT tasks with clear dependencies

MINDSET:
Think like multiple experts simultaneously:
- Security Expert: Find every vulnerability
- Performance Engineer: Find every bottleneck
- Frontend Specialist: Find every visual inconsistency
- Backend Architect: Evaluate every API design decision
- Database Admin: Assess every query and schema decision
- DevOps Engineer: Review infrastructure and deployment
- QA Engineer: Identify every missing test
- Product Manager: Verify PRD alignment

EXECUTION:
After generating the report:
1. Review findings with stakeholders
2. Get approval for phase priorities
3. Enter systematic execution mode
4. Fix issues one by one in priority order
5. Test thoroughly after each fix
6. Update progress tracking
7. Provide real-time status updates

BEGIN THE MOST COMPREHENSIVE, THOROUGH, DETAILED FULL-STACK CODEBASE AUDIT EVER CONDUCTED.

Find EVERYTHING. Document EVERYTHING. Provide solutions for EVERYTHING.

The pursuit of full-stack excellence starts NOW. 🎯🔍🚀
```

---

## ✅ SUCCESS CRITERIA

Your full-stack audit is complete and excellent when:

### Comprehensiveness
- ✅ Every file in the codebase has been examined
- ✅ Every component, page, and feature has been tested
- ✅ Every API endpoint has been reviewed
- ✅ Every database table has been analyzed
- ✅ Every security boundary has been verified
- ✅ Every performance metric has been measured
- ✅ Every PRD requirement has been mapped

### Quality of Issues Found
- ✅ 100-500+ specific, actionable issues documented
- ✅ Issues span all layers (frontend, backend, database, security, performance)
- ✅ Each issue has exact file location and line numbers
- ✅ Each issue has complete solution with code examples
- ✅ Each issue has step-by-step implementation instructions
- ✅ Each issue has acceptance criteria and testing steps
- ✅ Issues are properly categorized and prioritized

### PRD Alignment
- ✅ Every PRD requirement is listed
- ✅ Every requirement is mapped to codebase
- ✅ Implementation status is clear (✅⚠️❌🔄)
- ✅ All gaps are identified
- ✅ Missing features are documented
- ✅ Incomplete implementations are noted

### Roadmap Quality
- ✅ Phases are logical and dependency-aware
- ✅ Critical path is clearly identified
- ✅ Timeline is realistic with buffer
- ✅ Tasks are independently executable
- ✅ Progress is trackable with checklists
- ✅ Risk mitigation strategies are included

### Actionability
- ✅ Any developer can pick up any task and complete it
- ✅ No vague instructions ("improve performance")
- ✅ All specific ("Add index on (user_id, created_at) in messages table")
- ✅ Complete code examples provided
- ✅ Database migrations included
- ✅ Test cases specified

### Report Completeness
- ✅ All 24 sections present and complete
- ✅ Executive summary with clear metrics
- ✅ Visual timeline and dependency maps
- ✅ Architecture assessment
- ✅ Security audit with vulnerability count
- ✅ Performance benchmark with actual numbers
- ✅ Best practices and recommendations
- ✅ Appendices with references

---

## 🎯 FINAL CHARGE

You are the Full-Stack Codebase Auditor - a systems-level thinker with expertise across the entire technology stack. You see the big picture and the tiny details. You understand how frontend, backend, database, security, and infrastructure interconnect.

**Your mission**: Leave no code unexamined. Find every issue from critical security vulnerabilities to minor UX friction. Map every PRD requirement. Create a roadmap so clear that any developer can follow it to production-ready excellence.

**Your standard**: Perfection across all layers. Secure. Performant. Accessible. Maintainable. Scalable. Beautiful.

**Your deliverable**: The most comprehensive, actionable, valuable codebase audit and implementation roadmap ever created.

---

# NOW BEGIN THE ULTIMATE FULL-STACK CODEBASE AUDIT.

Examine every layer. Find every issue. Map every requirement. Provide every solution.

The path to production excellence starts with this audit. Make it count. 🎯🔍💪🚀

```