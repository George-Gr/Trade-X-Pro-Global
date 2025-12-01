# API Documentation

Complete reference for Trade-X-Pro-Global API endpoints, data structures, and integration patterns.

## Overview

Trade-X-Pro-Global uses a hybrid architecture:
- **Frontend**: React 18 + TypeScript running on Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Real-time**: Supabase Realtime WebSocket subscriptions

All API communication flows through Supabase client library with automatic RLS enforcement.

## Quick Reference

| Endpoint Category | Purpose | Auth Required |
|------------------|---------|----------------|
| User Profile | Account & KYC data | Yes |
| Trading | Orders, positions, fills | Yes |
| Market Data | Price streams, symbols, history | No |
| Portfolio | Balances, P&L, analytics | Yes |
| Risk | Margin levels, liquidation alerts | Yes |
| Admin | System configuration, user management | Admin only |

## Core Endpoints

### Authentication

No direct authentication endpoints - uses Supabase Auth with JWT tokens.

```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// Session stored in supabase client automatically
// JWT token included in all subsequent requests
```

### User Profile

#### GET /profiles/{userId}

Retrieve user account information.

```typescript
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Response
{
  id: 'user-id',
  email: 'user@example.com',
  full_name: 'John Doe',
  balance: 10000.0000,
  equity: 9850.5000,
  margin_used: 500.0000,
  free_margin: 9350.5000,
  margin_level: 1970.00,
  leverage: 30.00,
  kyc_status: 'approved',
  account_status: 'active',
  created_at: '2025-01-01T00:00:00Z'
}
```

#### PUT /profiles/{userId}

Update user profile.

```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: 'Jane Doe',
    leverage: 25.00,
  })
  .eq('id', userId);
```

### Trading - Orders

#### POST /orders

Create new order.

```typescript
const { data: order, error } = await supabase
  .from('orders')
  .insert([
    {
      user_id: userId,
      symbol: 'EUR/USD',
      order_type: 'market',
      side: 'buy',
      quantity: 1.0,
      stop_loss_price: 1.0500,
      take_profit_price: 1.0650,
    },
  ])
  .select();

// Response
{
  id: 'order-uuid',
  user_id: 'user-id',
  symbol: 'EUR/USD',
  order_type: 'market',
  side: 'buy',
  quantity: 1.0,
  filled_quantity: 1.0,
  filled_price: 1.0600,
  status: 'filled',
  stop_loss_price: 1.0500,
  take_profit_price: 1.0650,
  created_at: '2025-01-01T12:00:00Z',
  filled_at: '2025-01-01T12:00:01Z'
}
```

#### GET /orders

List user's orders (paginated).

```typescript
const { data: orders, error } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .range(0, 49); // First 50 orders
```

#### PUT /orders/{orderId}

Modify open order.

```typescript
const { data, error } = await supabase
  .from('orders')
  .update({
    stop_loss_price: 1.0450,
    take_profit_price: 1.0700,
  })
  .eq('id', orderId)
  .eq('user_id', userId)
  .eq('status', 'open');
```

#### DELETE /orders/{orderId}

Cancel open order.

```typescript
const { data, error } = await supabase
  .from('orders')
  .delete()
  .eq('id', orderId)
  .eq('user_id', userId);
```

### Trading - Positions

#### GET /positions

Get active positions.

```typescript
const { data: positions, error } = await supabase
  .from('positions')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'open');

// Response
[
  {
    id: 'position-uuid',
    user_id: 'user-id',
    symbol: 'EUR/USD',
    side: 'buy',
    quantity: 1.0,
    entry_price: 1.0600,
    current_price: 1.0620,
    open_pnl: 20.00,
    margin_used: 353.33,
    created_at: '2025-01-01T12:00:00Z'
  }
]
```

#### PUT /positions/{positionId}

Close or modify position.

```typescript
const { data, error } = await supabase
  .from('positions')
  .update({
    status: 'closed',
    close_price: 1.0620,
    closed_at: new Date().toISOString(),
  })
  .eq('id', positionId)
  .eq('user_id', userId);
```

### Market Data

#### GET /market/symbols

Get list of tradable symbols.

```typescript
const { data: symbols, error } = await supabase
  .from('assets')
  .select('symbol, name, asset_class, contract_size, min_quantity')
  .eq('is_tradable', true);

// Response
[
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    asset_class: 'forex',
    contract_size: 100000,
    min_quantity: 0.01
  },
  // ...
]
```

#### Real-Time Price Streaming

Subscribe to live price updates.

```typescript
const subscription = supabase
  .channel('prices:EUR/USD')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'market_data', filter: `symbol=eq.EUR/USD` },
    (payload) => {
      console.log('Price update:', payload.new.price);
    }
  )
  .subscribe();

// Cleanup
supabase.removeChannel(subscription);
```

### Portfolio Analytics

#### GET /portfolio/summary

Get portfolio overview.

```typescript
const { data: summary, error } = await supabase
  .rpc('calculate_portfolio_summary', { user_id: userId });

// Response
{
  total_balance: 10000.00,
  total_equity: 9850.50,
  total_margin_used: 500.00,
  free_margin: 9350.50,
  margin_level: 1970.00,
  total_open_pnl: -149.50,
  total_closed_pnl: 1200.75,
  open_positions_count: 2,
  open_orders_count: 1
}
```

#### GET /portfolio/history

Get trading history (paginated).

```typescript
const { data: history, error } = await supabase
  .from('fills')
  .select(`
    id, order_id, quantity, fill_price, filled_at,
    orders(symbol, side)
  `)
  .eq('orders.user_id', userId)
  .order('filled_at', { ascending: false })
  .range(0, 99);
```

### Risk Management

#### GET /risk/alerts

Get current margin and risk alerts.

```typescript
const { data: alerts, error } = await supabase
  .from('margin_calls')
  .select('*')
  .eq('user_id', userId)
  .is('resolved_at', null); // Unresolved alerts only

// Response
[
  {
    id: 'alert-uuid',
    user_id: 'user-id',
    alert_type: 'margin_call',
    margin_level: 145.50,
    message: 'Margin level below 150%',
    created_at: '2025-01-01T13:00:00Z'
  }
]
```

### KYC Verification

#### GET /kyc/status

Check KYC verification status.

```typescript
const { data: kyc, error } = await supabase
  .from('profiles')
  .select('kyc_status, kyc_rejection_reason')
  .eq('id', userId)
  .single();

// Response
{
  kyc_status: 'pending_documents', // pending_info | pending_documents | pending_review | approved | rejected
  kyc_rejection_reason: null
}
```

#### POST /kyc/documents

Upload KYC document.

```typescript
const { data, error } = await supabase
  .storage
  .from('kyc-documents')
  .upload(`${userId}/id-${Date.now()}`, file, {
    contentType: file.type,
  });
```

### Admin Endpoints

#### GET /admin/users

List all users (admin only).

```typescript
const { data: users, error } = await supabase
  .from('profiles')
  .select('id, email, kyc_status, account_status, created_at')
  .order('created_at', { ascending: false });
```

## Real-Time Subscriptions

### Realtime Subscription Pattern

```typescript
// IMPORTANT: Always include cleanup to prevent memory leaks
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseBrowserClient';

export const useMyData = (userId: string | null) => {
  const [data, setData] = useState([]);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    const fetchData = async () => {
      const { data: items } = await supabase
        .from('my_table')
        .select('*')
        .eq('user_id', userId);
      setData(items ?? []);
    };
    fetchData();

    // Subscribe to changes
    subscriptionRef.current = supabase
      .channel(`my_table:${userId}`)
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'my_table', 
          filter: `user_id=eq.${userId}` 
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => prev.map(item => 
              item.id === payload.new.id ? payload.new : item
            ));
          } else if (payload.eventType === 'DELETE') {
            setData(prev => prev.filter(item => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // CRITICAL: Cleanup to prevent memory leaks
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [userId]);

  return data;
};
```

## Error Handling

### Supabase Error Format

```typescript
const { data, error } = await supabase
  .from('table')
  .select('*');

if (error) {
  // Error structure
  {
    message: 'Auth required',
    code: 'AUTH_REQUIRED',
    status: 401,
  }
}
```

### Best Practices

```typescript
// ✅ DO: Always check and handle errors
const { data, error } = await supabase.from('table').select('*');
if (error) {
  console.error('Query failed:', error.message);
  throw error;
}

// ❌ DON'T: Ignore errors
const { data } = await supabase.from('table').select('*');

// ✅ DO: Use try-catch in async contexts
try {
  const result = await executeOrder(order);
} catch (err) {
  notifyUser('Order failed: ' + err.message);
}
```

## Rate Limiting

Supabase has built-in rate limiting:
- **Authenticated users**: 200 requests/second
- **Unauthenticated**: 10 requests/second per IP

No explicit rate limit headers returned, but exceeding limits results in 429 responses.

## Data Validation

All inputs are validated on client side with Zod and server side with Row-Level Security.

```typescript
import { z } from 'zod';

const OrderSchema = z.object({
  symbol: z.string().min(1),
  quantity: z.number().positive(),
  leverage: z.number().min(1).max(50),
});

// Validate before API call
const order = OrderSchema.parse(userInput);
```

## Pagination

```typescript
// Get items 0-49 (first 50)
const { data, count } = await supabase
  .from('table')
  .select('*', { count: 'exact' })
  .range(0, 49);

// Get items 50-99 (next 50)
const { data } = await supabase
  .from('table')
  .select('*')
  .range(50, 99);
```

## Authentication

All API requests automatically include JWT token from session.

```typescript
// Token managed by Supabase client
// Automatically added to Authorization header: "Bearer {token}"
// Refresh handled automatically when expired
```

## Security Headers

Configured in Vite config:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Resources

- [Supabase Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Row-Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated**: December 2025  
**API Version**: 1.0  
**Status**: Production Ready
