# Security Policy

**Last Updated:** December 2025  
**Scope:** Trade-X-Pro-Global CFD Trading Platform (React 18 + Supabase + Edge Functions)

---

## 1. Supported Versions

Security updates are provided for the following versions:

| Version | Supported | End of Life | Status |
|---------|-----------|-------------|--------|
| 1.0.x   | ✅ Yes    | Dec 2026    | Current |
| 0.9.x   | ✅ Yes    | Jun 2025    | Legacy |
| < 0.9   | ❌ No     | —           | Deprecated |

## 2. Security Architecture

### 2.1 Authentication & Authorization
- **Method**: Supabase JWT-based authentication with auto-refresh
- **Session Duration**: 1 hour access token + 7 day refresh token
- **Row-Level Security (RLS)**: Enforced on ALL database tables
- **Admin Role**: Separate from user role, explicitly checked in Edge Functions

**Implementation Rules:**
```typescript
// ✅ CORRECT: Always check RLS context in Realtime subscriptions
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', userId)  // RLS policy auto-filters by session user
  .throwOnError();

// ❌ INCORRECT: Trusting client-side filtering
const allOrders = await supabase.from('orders').select('*');
// Will fail silently if RLS policy missing
```

### 2.2 Data Encryption
- **Transport**: TLS 1.3+ for all connections
- **At-Rest**: Supabase automatic encryption for sensitive fields (passwords, API keys)
- **End-to-End**: Customer funds encrypted with account-specific key derivation
- **Database**: PostgreSQL encrypted backups (point-in-time recovery 7 days)

### 2.3 API Security
- **Rate Limiting**: 1000 requests/minute per authenticated user (configurable per endpoint)
- **CORS**: Domain-specific whitelist (dev: localhost:5173, staging/prod via environment)
- **Headers**: Security headers enforced via Supabase network policies
  - Content-Security-Policy: strict-dynamic
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Referrer-Policy: strict-origin-when-cross-origin

### 2.4 Input Validation
- **Client-Side**: Zod schema validation on all forms (defensive only)
- **Server-Side**: Edge Function parameter validation (AUTHORITATIVE)
- **Database**: Column constraints + NOT NULL + DEFAULT values
- **Type Safety**: TypeScript strict mode + no-implicit-any disabled for incremental adoption

**Required Pattern:**
```typescript
import { z } from 'zod';

const orderSchema = z.object({
  symbol: z.string().min(1).max(20),
  side: z.enum(['buy', 'sell']),
  size: z.number().positive().finite(),
  leverage: z.number().min(1).max(50),
  stopLoss: z.number().optional(),
});

// Validation in Edge Function ONLY
const validated = orderSchema.parse(req.body);
```

## 3. Vulnerability Disclosure

### 3.1 Reporting Process
1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. **Email**: security@trade-x-pro.dev with:
   - Vulnerability type (e.g., XSS, SQL injection, RLS bypass)
   - Affected component/file path
   - Steps to reproduce
   - Proof of concept (if safe to share)
   - Proposed fix (optional)

### 3.2 Response Timeline
- **Acknowledgment**: Within 24 hours
- **Investigation**: Complete within 3 business days
- **Fix & Testing**: Within 5 business days
- **Public Disclosure**: Within 30 days of fix deployment

### 3.3 Vulnerability Severity Levels
| Severity | Definition | Response SLA | Example |
|----------|-----------|--------------|---------|
| **Critical** | Account takeover, data breach, fund loss | 24 hours | RLS bypass, authentication bypass |
| **High** | Unauthorized data access, privilege escalation | 3 days | Missing RLS policy, XSS in sensitive form |
| **Medium** | Limited unauthorized access, logic flaw | 7 days | Ineffective input validation, timing attack |
| **Low** | Information disclosure, minor UX flaw | 14 days | Verbose error messages, missing rate limit |

## 4. Secure Coding Standards

### 4.1 Frontend Security
```typescript
// ✅ DO: Sanitize user input
import DOMPurify from 'dompurify';

const cleanHtml = DOMPurify.sanitize(userInput);
const sanitized = cleanHtml.replace(/script/gi, '');

// ❌ DON'T: Render unvalidated HTML
dangerouslySetInnerHTML={{ __html: userInput }}

// ✅ DO: Use environment variables correctly
const API_URL = import.meta.env.VITE_API_URL;

// ❌ DON'T: Hardcode secrets
const API_KEY = 'pk_live_abc123...';

// ✅ DO: Cleanup subscriptions to prevent memory leaks
const subscriptionRef = useRef(null);
useEffect(() => {
  subscriptionRef.current = supabase.channel('x').on(...).subscribe();
  return () => supabase.removeChannel(subscriptionRef.current);
}, []);

// ❌ DON'T: Leave subscriptions open
supabase.channel('x').on(...).subscribe();
```

### 4.2 Backend Security (Edge Functions)
```typescript
// ✅ DO: Validate authentication
const { data: { user }, error: authError } = await supabase.auth.getUser(req);
if (authError || !user) return new Response('Unauthorized', { status: 401 });

// ✅ DO: Check RLS context for admin operations
const isAdmin = (await supabase.from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()).data?.role === 'admin';

if (!isAdmin) return new Response('Forbidden', { status: 403 });

// ❌ DON'T: Trust client-provided user IDs
const userId = req.body.userId;  // ❌ Attacker can spoof
const userId = user.id;          // ✅ Use authenticated context

// ✅ DO: Log security events
console.log({
  timestamp: new Date().toISOString(),
  event: 'admin_access',
  userId: user.id,
  action: 'liquidate_position',
  position_id: params.id,
  status: 'success'
});

// ❌ DON'T: Log sensitive data
console.log({ apiKey, password, token });
```

### 4.3 Database Security (RLS Policies)
```sql
-- ✅ DO: Create per-table RLS policies
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_positions ON positions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY admin_positions ON positions
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- ❌ DON'T: Leave RLS disabled
-- ❌ DON'T: Use overly permissive policies
CREATE POLICY everyone_reads ON positions
  FOR SELECT USING (true);  -- ❌ Security risk
```

## 5. Compliance & Certifications

### 5.1 Data Protection
- **GDPR**: Compliant user data handling, right to deletion, data portability
- **CCPA**: Consumer privacy rights implemented
- **Encryption**: Industry-standard AES-256 for sensitive data
- **Backup**: Daily encrypted backups with 30-day retention

### 5.2 Financial Regulations
- **Account Verification**: KYC/AML compliance via automated checks
- **Transaction Limits**: Per-user daily limits enforced in Edge Functions
- **Audit Trail**: Immutable audit log of all financial activities
- **Suspicious Activity**: Real-time detection and manual review queue

### 5.3 API Security
- **OpenAPI Spec**: Documented endpoint requirements
- **Rate Limiting**: Prevents brute force and DDoS attacks
- **Token Rotation**: Automatic session refresh for stale tokens

## 6. Incident Response

### 6.1 Detection
- **Automated Monitoring**: Sentry error tracking with alerting
- **Log Aggregation**: Realtime analysis of Edge Function logs
- **Threshold Alerts**: Unusual trading volume, margin calls, liquidations
- **Security Scanning**: Regular SAST/DAST runs (pre-production)

### 6.2 Response Procedure
1. **Isolate**: Revoke compromised credentials immediately
2. **Assess**: Determine scope (data affected, user count, duration)
3. **Remediate**: Deploy security patch or hotfix
4. **Notify**: Affected users (if required by regulation)
5. **Review**: Post-incident analysis, preventive measures

### 6.3 Post-Incident
- **Root Cause Analysis**: Document within 5 days
- **Code Review**: Re-review affected components
- **Security Patch**: Release update with detailed changelog
- **Communication**: Transparent incident report

## 7. Dependencies & Supply Chain

### 7.1 Dependency Management
- **Audit**: Run `npm audit` on every build (CI/CD)
- **Updates**: Review security updates monthly
- **Policies**: Auto-reject high/critical vulnerabilities in PRs
- **Pinning**: Lock exact versions in package-lock.json

### 7.2 Third-Party Integrations
- **Supabase**: Regular security updates (auto-enabled)
- **TradingView Charts**: Sandboxed library with minimal permissions
- **Finnhub API**: Rate-limited, isolated API key per environment
- **Sentry**: Encrypted error reporting, no PII in default config

## 8. Developer Responsibilities

### 8.1 Before Committing
- ✅ Run `npm run lint` (catch security patterns)
- ✅ Run `npm run test` (ensure business logic secure)
- ✅ Review `.env.example` (no secrets leaked)
- ✅ Check git history: `git log -p --grep="password|secret|key"`

### 8.2 Before Merging
- ✅ Code review by 1+ maintainer
- ✅ Security review for:
  - RLS policies on new tables
  - Input validation in Edge Functions
  - Cleanup in useEffect subscriptions
  - No hardcoded credentials
- ✅ All tests passing

### 8.3 Before Deploying
- ✅ Production database backed up
- ✅ Environment variables verified
- ✅ Rate limiting configured correctly
- ✅ Monitoring alerts enabled
- ✅ Incident response team notified

## 9. Security Contacts

- **Security Team**: security@trade-x-pro.dev
- **Incident Hotline**: +1 (XXX) XXX-XXXX (24/7)
- **Legal**: legal@trade-x-pro.dev
- **Compliance**: compliance@trade-x-pro.dev

## 10. Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [Supabase Security Docs](https://supabase.com/docs/guides/auth)
- [TypeScript Security](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [GDPR Compliance](https://gdpr-info.eu/)

---

**Questions?** Open an issue in the private security repository or email security@trade-x-pro.dev
