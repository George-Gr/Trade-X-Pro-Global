# Environment Setup Guide

Complete guide for setting up development, staging, and production environments for Trade-X-Pro-Global.

## Quick Start

```bash
# Copy example environment file
cp .env.example .env.local

# Edit with your values
nano .env.local

# Start development server
npm run dev
```

## Environment Files

- `.env.example` - Template for all required variables
- `.env.local` - Local development (not committed)
- `.env.staging` - Staging environment (DevOps)
- `.env.production` - Production environment (DevOps)

## Required Variables

### Supabase Configuration

```env
# Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
```

Get these from your Supabase project dashboard:
1. Navigate to Project Settings > API
2. Copy the "Project URL" → `VITE_SUPABASE_URL`
3. Copy "anon/public" key → `VITE_SUPABASE_PUBLISHABLE_KEY`

### API Configuration

```env
# API endpoints
VITE_API_URL=https://api.tradex-pro.com
VITE_WS_URL=wss://ws.tradex-pro.com
```

**Development**: Point to local backend or staging API  
**Production**: Use production endpoints only

### Market Data (Optional)

```env
# Finnhub API for real market data (optional)
VITE_FINNHUB_API_KEY=your_api_key_here
```

Get free key from [Finnhub](https://finnhub.io)

### Error Tracking (Optional)

```env
# Sentry for error tracking
VITE_SENTRY_DSN=https://key@sentry.io/project-id
```

Set up free account at [Sentry.io](https://sentry.io)

### Environment Mode

```env
# Build environment
VITE_ENV=development  # development | staging | production
```

## Development Environment

### Setup Steps

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Add development values to .env.local
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
VITE_ENV=development

# 4. Start dev server with HMR
npm run dev

# 5. Open http://localhost:5173 in browser
```

### Dev Server Features

- Hot Module Replacement (HMR) enabled
- Vite fast refresh
- Source map debugging
- CORS proxy for API calls
- Automatic browser reload

### Optional: Local Backend

If running local Supabase instance:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local instance
supabase start

# Update .env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Staging Environment

### Prerequisites

- Access to staging Supabase project
- Staging API endpoints
- Staging deployment infrastructure

### Configuration

```bash
# Copy staging config
cp .env.example .env.staging

# Edit for staging
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=staging_key...
VITE_API_URL=https://api-staging.tradex-pro.com
VITE_ENV=staging
VITE_SENTRY_DSN=https://staging-key@sentry.io/staging-id
```

### Build for Staging

```bash
# Build with staging config
VITE_ENV=staging npm run build

# Preview built app
npm run preview
```

## Production Environment

### Prerequisites

- Production Supabase project
- Production API endpoints  
- Production CDN setup
- SSL certificates configured
- Monitoring/alerting setup

### Security Requirements

```bash
# Verify all production env vars are set
npm run build --mode production

# Check bundle analysis
ANALYZE=true npm run build

# Test production build locally
npm run preview
```

### Configuration Checklist

- [ ] Use production Supabase URL only
- [ ] Use production Publishable Key
- [ ] Set `VITE_ENV=production`
- [ ] Configure production API URLs
- [ ] Enable Sentry error tracking
- [ ] Review security headers in `vite.config.ts`
- [ ] Configure CORS for production domain
- [ ] Enable CSP headers
- [ ] Set up rate limiting

### Production Build

```bash
# Build production bundle
npm run build

# Generate source maps for debugging
npm run build -- --sourcemap

# Analyze bundle size
ANALYZE=true npm run build

# Verify no console logs in production
grep -r "console\." src/ || echo "No console logs found"
```

## Environment Variable Reference

### Complete List

| Variable | Required | Development | Staging | Production | Description |
|----------|----------|-------------|---------|------------|-------------|
| `VITE_SUPABASE_URL` | Yes | Local/Dev project URL | Staging URL | Production URL | Supabase instance URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Dev key | Staging key | Production key | Supabase anon/public API key |
| `VITE_API_URL` | No | `http://localhost:3000` | Staging API | Production API | Backend API base URL |
| `VITE_WS_URL` | No | `ws://localhost:3000` | Staging WS | Production WS | WebSocket endpoint for real-time |
| `VITE_ENV` | No | `development` | `staging` | `production` | Build environment mode |
| `VITE_SENTRY_DSN` | No | Not set | Staging DSN | Production DSN | Sentry error tracking DSN |
| `VITE_FINNHUB_API_KEY` | No | Optional dev key | Staging key | Production key | Market data provider API key |

## Vite Environment Variables

Variables prefixed with `VITE_` are exposed to client code. Never expose secrets with this prefix.

### Exposed to Client

```typescript
// These are available in browser code
import.meta.env.VITE_SUPABASE_URL
import.meta.env.VITE_ENV

// Check environment in components
if (import.meta.env.VITE_ENV === 'production') {
  // Production-only code
}
```

### Not Exposed (Server-Only)

Variables without `VITE_` prefix are only available in build scripts:

```typescript
// Not available in browser
process.env.PRIVATE_API_KEY
```

## Security Best Practices

### ✅ DO

- ✅ Store secrets in `.env.local` (local development only)
- ✅ Use environment-specific configs
- ✅ Rotate API keys regularly
- ✅ Use strong, unique keys per environment
- ✅ Version `.env.example` (template only, no secrets)
- ✅ Review `.gitignore` includes `.env*` files

### ❌ DON'T

- ❌ Commit `.env` files to git
- ❌ Use same key across environments
- ❌ Expose private keys with `VITE_` prefix
- ❌ Share `.env` files over insecure channels
- ❌ Use placeholder values in production
- ❌ Log environment variables

## Troubleshooting

### "VITE_SUPABASE_URL is undefined"

```bash
# Check .env.local exists
ls -la .env.local

# Verify it has correct content
cat .env.local | grep VITE_SUPABASE_URL

# Restart dev server
npm run dev
```

### "Cannot connect to Supabase"

```bash
# Verify URL is correct (no trailing slash)
# Wrong: https://project.supabase.co/
# Right: https://project.supabase.co

# Check Supabase project is running
# Try accessing URL in browser to verify

# Restart with clean env
rm .env.local
cp .env.example .env.local
# Edit .env.local with correct values
npm run dev
```

### "Sentry not tracking errors"

```bash
# Check DSN is set correctly
echo $VITE_SENTRY_DSN

# Verify format: https://key@sentry.io/project-id
# Test error: Visit /dev/sentry-test route

# Check browser console for Sentry initialization
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Sentry Documentation](https://docs.sentry.io)
- [PRD.md](./PRD.md) - Product requirements
- [README.md](./README.md) - Project overview

---

**Last Updated**: December 2025  
**Version**: 1.0
