# Content Security Policy (CSP) Production Implementation Guide

**For TradePro v10 - Regulated CFD Trading Platform**

## Overview

This document provides the production-ready CSP policy for TradePro v10, designed specifically for a regulated trading platform that must balance security with the requirements of third-party trading widgets and real-time data feeds.

## Current Status

- ✅ **Development**: CSP in report-only mode (`Content-Security-Policy-Report-Only`)
- ⚠️ **Production**: Ready for deployment with nonce-based scripts + temporary inline styles
- 🚨 **Risk**: Current policy would break TradingView widgets if deployed as-is

## Production CSP Policy

### Recommended Policy (Option A - Nonce-based)

```http
Content-Security-Policy: default-src 'self';
script-src 'self' 'nonce-{NONCE}' https://s3.tradingview.com https://www.tradingview.com https://cdn.jsdelivr.net https://unpkg.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net;
img-src 'self' data: https: blob:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://finnhub.io https://api.nowpayments.io https://api.tradingview.com https://s3.tradingview.com;
frame-src https://www.tradingview.com https://s.tradingview.com;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
block-all-mixed-content;
report-uri /csp-report;
report-to csp-endpoint
```

### Policy Breakdown

| Directive                   | Value                                  | Purpose                                                                      |
| --------------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| `default-src`               | `'self'`                               | Default allow self only                                                      |
| `script-src`                | `'self' 'nonce-{NONCE}' ...`           | Allow scripts from trusted sources + nonce for inline scripts                |
| `style-src`                 | `'self' 'unsafe-inline' ...`           | Allow styles from trusted sources + inline styles (required for TradingView) |
| `font-src`                  | `'self' https://fonts.gstatic.com ...` | Allow fonts from Google Fonts and CDN                                        |
| `img-src`                   | `'self' data: https: blob:`            | Allow images from self, data URIs, HTTPS, and blob URLs                      |
| `connect-src`               | `'self' https://*.supabase.co ...`     | Allow connections to Supabase, APIs, and TradingView                         |
| `frame-src`                 | `https://www.tradingview.com ...`      | Allow TradingView iframe embeds                                              |
| `object-src`                | `'none'`                               | Block plugins (Flash, etc.)                                                  |
| `base-uri`                  | `'self'`                               | Prevent base tag injection                                                   |
| `form-action`               | `'self'`                               | Restrict form submissions                                                    |
| `frame-ancestors`           | `'none'`                               | Prevent clickjacking                                                         |
| `upgrade-insecure-requests` | -                                      | Force HTTPS                                                                  |
| `block-all-mixed-content`   | -                                      | Block HTTP resources on HTTPS pages                                          |

## Implementation Steps

### 1. Update Headers File

Replace the current report-only policy in `public/_headers`:

```diff
- Content-Security-Policy-Report-Only: ...
+ Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{NONCE}' ...
```

### 2. Update Vite Configuration

Modify `vite.config.ts` to use strict CSP in production:

```typescript
// In cspNonceMiddleware
if (process.env.NODE_ENV === 'production') {
  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'nonce-${nonce}' ...`
  );
} else {
  res.setHeader(
    'Content-Security-Policy-Report-Only',
    `default-src 'self'; script-src 'self' 'nonce-${nonce}' ...`
  );
}
```

### 3. Add CSP Report Endpoint

Create a CSP violation reporting endpoint:

```typescript
// src/pages/api/csp-report.ts
export default function handler(req, res) {
  if (req.method === 'POST') {
    const report = req.body;
    // Log CSP violations for monitoring
    console.warn('CSP Violation:', report);

    // In production, send to security monitoring service
    // await sendToSecurityMonitoring(report);

    res.status(204).end();
  } else {
    res.status(405).end();
  }
}
```

### 4. Update HTML Templates

Ensure all inline scripts use nonces:

```html
<script nonce="{CSP_NONCE}">
  // Your inline scripts here
</script>
```

## TradingView Compatibility

### Required TradingView Sources

```http
script-src: https://s3.tradingview.com https://www.tradingview.com
style-src: https://s3.tradingview.com https://www.tradingview.com
connect-src: https://s3.tradingview.com https://api.tradingview.com
frame-src: https://www.tradingview.com https://s.tradingview.com
img-src: https://s3.tradingview.com
```

### Known Issues

1. **Inline Styles**: TradingView widgets inject inline styles - hence `'unsafe-inline'` in `style-src`
2. **Dynamic Scripts**: Some TradingView features load scripts dynamically - covered by `script-src` domains
3. **WebSocket Connections**: Real-time data uses WebSockets - covered by `connect-src`

## Security Considerations

### Why This Policy is Secure

1. **Nonce-based Scripts**: Prevents XSS by requiring unique nonces for inline scripts
2. **Strict Source Control**: Only allows connections to known, trusted domains
3. **Clickjacking Protection**: `frame-ancestors 'none'` prevents embedding in malicious frames
4. **Mixed Content Blocking**: `block-all-mixed-content` prevents HTTP resources on HTTPS pages
5. **Protocol Upgrades**: `upgrade-insecure-requests` forces HTTPS

### Remaining Risks

1. **Inline Styles**: `'unsafe-inline'` in `style-src` allows CSS injection (mitigated by DOMPurify)
2. **Third-party Dependencies**: TradingView and other widgets are outside our control
3. **WebSocket Security**: Real-time connections need proper authentication

## Monitoring and Maintenance

### CSP Violation Monitoring

1. **Real-time Alerts**: Set up alerts for CSP violations
2. **Weekly Reviews**: Review violation reports weekly
3. **Incident Response**: Have a plan for handling legitimate violations

### Policy Updates

1. **Quarterly Reviews**: Review and update policy quarterly
2. **New Features**: Update policy when adding new third-party services
3. **Security Incidents**: Update policy in response to security incidents

## Testing

### Pre-deployment Testing

1. **Staging Environment**: Test with strict CSP in staging
2. **Manual Testing**: Test all TradingView widgets and features
3. **Automated Testing**: Add CSP compliance tests to CI/CD

### Post-deployment Monitoring

1. **Violation Reports**: Monitor CSP violation reports
2. **User Experience**: Monitor for broken functionality
3. **Performance Impact**: Monitor for performance degradation

## Rollback Plan

If CSP causes issues in production:

1. **Immediate**: Switch back to report-only mode
2. **Investigation**: Analyze violation reports
3. **Fix**: Update policy to allow necessary resources
4. **Re-deploy**: Deploy updated policy

## Compliance

This CSP policy helps meet regulatory requirements for:

- **PCI DSS**: Protects against XSS and injection attacks
- **SOX**: Provides audit trail for security violations
- **GDPR**: Helps prevent data exfiltration via XSS
- **Industry Standards**: Follows OWASP CSP recommendations

## Next Steps

1. [ ] Update `public/_headers` with production policy
2. [ ] Modify `vite.config.ts` for environment-specific headers
3. [ ] Create CSP violation reporting endpoint
4. [ ] Test in staging environment
5. [ ] Deploy to production with monitoring
6. [ ] Monitor and adjust based on violation reports
