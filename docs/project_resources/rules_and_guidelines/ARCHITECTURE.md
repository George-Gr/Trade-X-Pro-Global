# Architecture Overview

Complete system architecture documentation for Trade-X-Pro-Global CFD trading platform.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER BROWSER (Client)                        │
│  React 18 + TypeScript + Vite + TailwindCSS + Shadcn/UI         │
├─────────────────────────────────────────────────────────────────┤
│ • Landing Page         • Dashboard         • Trading Platform    │
│ • Authentication       • Portfolio         • KYC Verification    │
│ • Risk Management      • History           • Admin Panel         │
└────────────┬──────────────────────────────────────────────────┬──┘
             │                                                  │
    ┌────────▼────────┐                        ┌───────────────▼─┐
    │  Supabase Auth  │                        │ Real-time Events│
    │  (JWT Tokens)   │                        │ (WebSocket)     │
    └────────┬────────┘                        └────────┬────────┘
             │                                         │
┌────────────┴─────────────────────────────────────────┴──────────┐
│                  Supabase Backend (Cloud)                        │
├──────────────────────────────────────────────────────────────────┤
│ PostgreSQL Database          │ Edge Functions (Deno)             │
│ ├─ Users & Profiles          │ ├─ Order Execution               │
│ ├─ Orders & Fills            │ ├─ Liquidation Engine            │
│ ├─ Positions                 │ ├─ Margin Calculations           │
│ ├─ Market Data               │ ├─ KYC Processing               │
│ ├─ Margin Calls              │ └─ Risk Monitoring               │
│ ├─ KYC Documents             │                                  │
│ └─ Audit Logs                │ Storage (File Upload)            │
│                              │ ├─ KYC Documents                │
│ Row-Level Security (RLS)     │ ├─ User Files                   │
│ ├─ Auto user_id filtering    │ └─ Attachments                  │
│ ├─ Admin-only tables         │                                  │
│ └─ Encrypted sensitive data  │ Real-time Subscriptions         │
│                              │ ├─ Price Updates                │
│                              │ ├─ Position Changes             │
│                              │ └─ Order Status                 │
└──────────────────────────────────────────────────────────────────┘
```

## Frontend Layer

### Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 7.2.2 | Build tool |
| Tailwind CSS | 4.1.17 | Styling |
| shadcn/ui | Latest | Component library |
| React Router | v6 | Routing |
| React Hook Form | Latest | Form management |
| Zod | Latest | Validation |
| React Query | Latest | Server state |
| TradingView Charts | Latest | Charting |
| Supabase JS | Latest | Backend client |

### Directory Structure

```
src/
├── components/            # React components by feature
│   ├── auth/             # Authentication flows
│   ├── trading/          # Trading interface
│   ├── kyc/              # KYC verification
│   ├── dashboard/        # Dashboard pages
│   ├── portfolio/        # Portfolio management
│   ├── risk/             # Risk management UI
│   ├── history/          # Trading history
│   ├── admin/            # Admin panel
│   ├── layout/           # Layout components
│   ├── common/           # Reusable components
│   ├── notifications/    # Notification system
│   ├── ui/               # shadcn/ui components
│   └── wallet/           # Wallet management
├── hooks/                # 40+ custom hooks
│   ├── useAuth.tsx
│   ├── useRealtimePositions.tsx
│   ├── usePriceStream.tsx
│   ├── useMarginMonitoring.tsx
│   └── ...
├── contexts/             # Global state
│   ├── AuthContext.tsx
│   ├── NotificationContext.tsx
│   ├── ThemeContext.tsx
│   └── ErrorContext.ts
├── lib/
│   ├── trading/          # Business logic (pure functions)
│   │   ├── orderMatching.ts
│   │   ├── marginCalculations.ts
│   │   ├── liquidationEngine.ts
│   │   ├── commissionCalculation.ts
│   │   └── ...
│   ├── supabaseBrowserClient.ts
│   └── utilities/
├── pages/                # Route components (lazy-loaded)
│   ├── Index.tsx
│   ├── Dashboard.tsx
│   ├── Trading.tsx
│   └── ...
└── __tests__/           # Test files
```

### Component Architecture

All components follow these patterns:

```typescript
// File: src/components/trading/OrderForm.tsx
import { FC } from 'react';

interface Props {
  symbol: string;
  onSubmit: (order: Order) => Promise<void>;
  isLoading?: boolean;
}

export const OrderForm: FC<Props> = ({ symbol, onSubmit, isLoading }) => {
  // Component implementation
  return <form>{/* JSX */}</form>;
};
```

**Rules**:
- ✅ Keep components < 300 lines
- ✅ Use TypeScript interfaces for props
- ✅ Extract reusable hooks
- ✅ Cleanup subscriptions in useEffect
- ✅ Handle Supabase errors gracefully

### State Management Layers

```
Component useState (local state)
    ↓
Custom Hooks (useAuth, usePriceStream)
    ↓
Context API (NotificationContext, AuthContext)
    ↓
React Query (server state caching)
    ↓
Supabase Realtime (live subscriptions)
```

### Design System

**Colors** (Authoritative):
- Deep Navy: `#0A1628` (primary)
- Warm Gold: `#F39C12` (premium accents)
- Emerald Green: `#00C896` (profit/buy)
- Crimson Red: `#FF4757` (loss/sell)
- Warm White: `#FAFAF5` (light)
- Dark Charcoal: `#2C3E50` (dark)

**Typography**:
- **Headings**: Inter (700, 600 weights)
- **Body**: Inter (400 weight)
- **Data**: JetBrains Mono

**Spacing**: 8px grid system

See `/docs/frontend/final_documents/Unified-Frontend-Guidelines.md` for complete guide.

## Backend Layer

### Supabase Architecture

#### PostgreSQL Database

**Core Tables**:

1. **Profiles**
   - User accounts, balances, KYC status
   - Account settings, trading preferences
   - Margin levels, account status

2. **Orders**
   - Order history (market, limit, stop)
   - Status tracking (pending, filled, cancelled)
   - Links to fills when executed

3. **Fills**
   - Individual fill records
   - Execution prices, quantities
   - Partial fill tracking

4. **Positions**
   - Open/closed positions
   - Entry prices, current market value
   - Unrealized & realized P&L

5. **Market Data**
   - Asset master list (forex, stocks, indices, etc.)
   - Trading specifications (leverage, spreads)
   - Tradability status

6. **Margin Calls**
   - Margin call alerts
   - Liquidation events
   - Risk level tracking

7. **KYC Data**
   - Verification requests
   - Document uploads
   - Verification status

8. **Audit Logs**
   - All user actions
   - Security events
   - Compliance tracking

#### Row-Level Security (RLS)

Every table has RLS policies enforcing user isolation:

```sql
-- Example: Users can only see their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can see all orders
CREATE POLICY "Admin can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Edge Functions (Deno)

TypeScript functions for complex business logic:

1. **Order Execution**
   - Market order matching
   - Limit order processing
   - Stop-loss/take-profit triggering
   - Slippage calculation

2. **Liquidation Engine**
   - Margin level monitoring
   - Force position closure
   - Loss realization
   - Wallet update

3. **Risk Monitoring**
   - Real-time margin tracking
   - Margin call detection
   - Risk threshold enforcement
   - Alert generation

4. **KYC Processing**
   - Document validation
   - Verification workflow
   - Status updates

### Realtime Subscriptions

```typescript
// Clients subscribe to changes via WebSocket
channel('orders:user_id')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'orders' },
    handleOrderUpdate
  )
  .subscribe();
```

**Channels**:
- `orders:*` - Order updates
- `positions:*` - Position changes
- `prices:SYMBOL` - Price updates
- `margin_calls:*` - Risk alerts

## Data Flow Patterns

### Order Placement

```
User Input → Validation (Zod)
    ↓
Order Creation API call
    ↓
Supabase Insert with RLS check
    ↓
Edge Function executes order
    ↓
Database updates (Order + Position)
    ↓
Realtime broadcast to client
    ↓
UI updates via subscription
```

### Price Streaming

```
Market Data Provider (Finnhub)
    ↓
Supabase RPC updates market_data table
    ↓
Realtime subscription triggered
    ↓
Client receives price update
    ↓
Component re-renders with new price
    ↓
Chart updates via TradingView API
    ↓
P&L calculations refresh
```

### Margin Monitoring

```
Position opens
    ↓
Realtime monitoring starts
    ↓
Price updates trigger calculation
    ↓
Margin level drops below threshold
    ↓
Edge Function creates margin_call record
    ↓
Notification sent to user (UI + email)
    ↓
At 50% margin level: auto-liquidation
```

## Security Architecture

### Authentication

- **Method**: Supabase Auth with JWT tokens
- **Session**: Browser stored in localStorage
- **Expiration**: 1 hour (auto-refresh)
- **MFA**: Supported via TOTP

### Authorization

- **RLS**: Row-level security on all tables
- **Admin**: Role-based access control
- **API Keys**: Environment-based rotation

### Data Protection

- **Encryption**: TLS 1.3 for transit
- **Sensitive Fields**: Encrypted at rest
- **CORS**: Origin validation
- **CSP**: Content security policy headers

### Audit Trail

- **Audit Logs**: All user actions logged
- **Timestamp**: Event creation time recorded
- **IP Address**: Request source tracked
- **Changes**: Before/after state recorded

## Performance Optimization

### Frontend

- **Code Splitting**: Lazy-loaded routes
- **Caching**: React Query deduplication
- **Memoization**: useMemo for expensive calculations
- **Virtual Lists**: Virtualized tables for large datasets
- **Web Workers**: Background computation

### Backend

- **Indexes**: Strategic database indexes
- **Connection Pooling**: PgBouncer for Supabase
- **Query Optimization**: Efficient RLS policies
- **Pagination**: Limit result sets

### Network

- **Service Worker**: Offline caching
- **CDN**: Static asset delivery
- **Compression**: Gzip/Brotli compression
- **HTTP/2**: Connection multiplexing

## Scaling Strategy

### Current (MVP)

- Single Supabase project
- PostgreSQL (up to 2GB storage free tier)
- Real-time subscriptions for <1000 concurrent users

### Growth Phase (100+ users)

- Database optimization (more indexes)
- Query caching layer
- Realtime optimization (selective subscriptions)

### Enterprise

- Database replication
- Read replicas for analytics
- Connection pooling upgrade
- Custom Edge Functions SLA

## Development Workflow

```
Feature Branch → Local Development
    ↓
Lint & Type Check
    ↓
Unit Tests (npm run test)
    ↓
E2E Tests (npm run test:e2e)
    ↓
Build Verification (npm run build)
    ↓
Pull Request Review
    ↓
Merge to main
    ↓
CI/CD Pipeline
    ↓
Automated Deployment
    ↓
Production Live
```

## Monitoring & Observability

### Sentry (Error Tracking)

```typescript
import * as Sentry from "@sentry/react";

// Automatic error capture
// Source maps for debugging
// Release tracking
```

### Logging

```typescript
// Structured logging
console.log('Order placed', {
  orderId: order.id,
  symbol: order.symbol,
  quantity: order.quantity,
  timestamp: new Date().toISOString(),
});
```

### Metrics

- Page load times
- Order execution latency
- API response times
- Error rates
- User sessions

## Disaster Recovery

### Backup Strategy

- Daily automated snapshots (Supabase managed)
- Point-in-time recovery available
- Data retention: 7 days

### RTO/RPO

- Recovery Time Objective: 30 minutes
- Recovery Point Objective: 1 hour

## Documentation References

- **Frontend**: `/docs/frontend/` - Design system, component specs
- **Backend**: `/docs/project_resources/knowledge/` - Database schema, formulas
- **Guidelines**: `/docs/project_resources/rules_and_guidelines/` - Best practices
- **API**: `/API.md` - Endpoint reference

---

**Last Updated**: December 2025  
**Version**: 1.0  
**Status**: Production Ready
