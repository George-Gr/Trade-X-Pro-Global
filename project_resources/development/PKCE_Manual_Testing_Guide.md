# PKCE Authentication Manual Testing Guide

## Overview

This guide provides step-by-step instructions for manually testing the PKCE authentication implementation to ensure it works correctly before deployment.

## Prerequisites

- Development environment with TradePro v10 running
- Access to browser developer tools
- Understanding of authentication flows

## Test Environment Setup

### 1. Enable Feature Flags

Open browser console and enable the PKCE features:

```javascript
// Enable PKCE authentication flow
localStorage.setItem(
  'trade_x_pro_feature_flags',
  JSON.stringify({
    pkceAuthFlow: true,
    secureStorage: true,
    enhancedSecurityHeaders: true,
  })
);

// Reload the page to apply changes
location.reload();
```

### 2. Verify Feature Flag State

```javascript
// Check current feature flag state
const flags = JSON.parse(
  localStorage.getItem('trade_x_pro_feature_flags') || '{}'
);
console.log('Feature flags:', flags);
```

## Test Scenarios

### Test 1: Basic Authentication Flow

#### Steps:

1. **Navigate to Login Page**

   - Go to the application login page
   - Verify the page loads without errors

2. **Login with Valid Credentials**

   - Enter valid email and password
   - Click login button
   - Verify successful login and redirect to dashboard

3. **Verify Token Storage**

   - Open browser developer tools → Application → Local Storage
   - Look for keys starting with `secure_auth_`
   - Verify sensitive data (access_token, refresh_token) is encrypted
   - Verify non-sensitive data is stored as plain JSON

4. **Verify Session Persistence**
   - Refresh the page
   - Verify user remains logged in
   - Check that session data is preserved

#### Expected Results:

- ✅ Login successful
- ✅ Tokens stored with `secure_auth_` prefix
- ✅ Sensitive data appears encrypted (base64 encoded)
- ✅ Session persists after page refresh

### Test 2: Secure Storage Verification

#### Steps:

1. **Check Storage Implementation**

   ```javascript
   // In browser console, check storage type
   console.log('Supabase client auth storage:', supabase.auth.storage);
   ```

2. **Verify Encryption**

   - Look at stored data in localStorage
   - Sensitive keys should contain:
     - `data`: Base64 encoded encrypted content
     - `iv`: Initialization vector
     - `timestamp`: Storage timestamp
   - Non-sensitive keys should be plain JSON

3. **Test Data Retrieval**

   **Note:** The `SecureStorage` class is not available on the global `window` object by default. Here are three ways to access it for browser-console testing:

   1. **Import from module** (Recommended for module-enabled consoles or devtools snippets): `import { SecureStorage } from './src/lib/secureStorage.ts';`

      Then use: `const secureStorage = new SecureStorage(); const accessToken = secureStorage.getItem('access_token'); console.log('Access token retrieved:', accessToken ? 'Success' : 'Failed');`

   2. **Temporarily expose in development** (Recommended for quick testing): In your app bootstrap, add `window.SecureStorage = SecureStorage;` then refresh the page.

      Then use: `const secureStorage = new window.SecureStorage(); const accessToken = secureStorage.getItem('access_token'); console.log('Access token retrieved:', accessToken ? 'Success' : 'Failed');`

   3. **Inspect underlying storage directly**: Use localStorage/sessionStorage to check keys with your secure prefix.

      Example: `Object.keys(localStorage).filter(k => k.startsWith('secure_auth_')).forEach(k => console.log(k, localStorage.getItem(k)));`

#### Expected Results:

- ✅ Storage uses SecureStorage class
- ✅ Sensitive data is encrypted
- ✅ Data can be retrieved correctly
- ✅ Non-sensitive data remains plain text

### Test 3: Migration from Legacy Data

#### Steps:

1. **Create Legacy Data**

   ```javascript
   // Simulate old implicit flow data
   localStorage.setItem('sb-access_token', 'legacy_access_token_value');
   localStorage.setItem('sb-refresh_token', 'legacy_refresh_token_value');
   localStorage.setItem(
     'sb-user',
     JSON.stringify({ id: 'test_user', email: 'test@example.com' })
   );
   ```

2. **Enable PKCE Features**

   ```javascript
   localStorage.setItem(
     'trade_x_pro_feature_flags',
     JSON.stringify({
       pkceAuthFlow: true,
       secureStorage: true,
       enhancedSecurityHeaders: true,
     })
   );
   ```

3. **Trigger Migration**

   - Refresh the page
   - The migration should automatically detect and migrate legacy data

4. **Verify Migration**
   - Check that legacy keys (`sb-*`) are removed
   - Verify new keys (`secure_auth_*`) are created
   - Verify data content is preserved

#### Expected Results:

- ✅ Legacy data is detected
- ✅ Legacy keys are removed after migration
- ✅ New encrypted keys are created
- ✅ Data content is preserved

### Test 4: Rollback Functionality

#### Steps:

1. **Enable PKCE Features**

   - Ensure PKCE is enabled and working

2. **Trigger Rollback**

   ```javascript
   // Disable PKCE features
   localStorage.setItem(
     'trade_x_pro_feature_flags',
     JSON.stringify({
       pkceAuthFlow: false,
       secureStorage: false,
       enhancedSecurityHeaders: true,
     })
   );
   ```

3. **Verify Rollback**
   - Refresh the page
   - Verify authentication still works
   - Check that data is accessible via localStorage

#### Expected Results:

- ✅ Application continues to function
- ✅ Authentication works with fallback storage
- ✅ No data loss during rollback

### Test 5: OAuth Flow with PKCE

#### Steps:

1. **Test OAuth Login**

   - Navigate to OAuth login option (if available)
   - Click to initiate OAuth flow
   - Complete OAuth authentication
   - Verify successful login

2. **Verify OAuth Token Storage**
   - Check that OAuth tokens are stored securely
   - Verify tokens are encrypted

#### Expected Results:

- ✅ OAuth flow completes successfully
- ✅ OAuth tokens are stored securely
- ✅ User is authenticated after OAuth

### Test 6: Security Headers

#### Steps:

1. **Check Network Requests**
   - Open browser developer tools → Network tab
   - Perform authentication actions
   - Check request headers for security headers:
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY`
     - `Referrer-Policy: strict-origin-when-cross-origin`

#### Expected Results:

- ✅ Security headers are present in auth requests
- ✅ Headers match expected values

### Test 7: Error Handling

#### Steps:

1. **Test Invalid Credentials**

   - Enter invalid email/password
   - Verify appropriate error messages

2. **Test Network Errors**

   - Simulate network issues
   - Verify graceful error handling

3. **Test Storage Failures**
   - Simulate storage failures
   - Verify fallback behavior

#### Expected Results:

- ✅ Clear error messages for invalid credentials
- ✅ Graceful handling of network errors
- ✅ Fallback to localStorage if secure storage fails

## Edge Cases

### Test 8: Multiple Browser Tabs

1. **Open Multiple Tabs**
   - Open application in multiple browser tabs
   - Login in one tab
   - Verify authentication syncs across tabs

### Test 9: Session Expiry

1. **Test Token Expiry**
   - Wait for token expiry (or manually expire)
   - Verify automatic token refresh
   - Verify graceful handling of expired sessions

### Test 10: Browser Storage Limits

1. **Test Storage Limits**
   - Fill browser storage
   - Verify application handles storage limits gracefully

## Performance Testing

### Test 11: Authentication Performance

1. **Measure Login Time**
   - Time authentication process
   - Compare with baseline (implicit flow)
   - Verify performance impact is acceptable (< 100ms additional)

### Test 12: Storage Performance

1. **Test Storage Operations**
   - Measure storage read/write times
   - Verify encryption doesn't significantly impact performance

## Security Verification

### Test 13: XSS Protection

1. **Test XSS Attempts**
   - Attempt to inject malicious scripts
   - Verify CSP and secure storage prevent token theft

### Test 14: Token Exposure

1. **Check Token Visibility**
   - Verify tokens are not visible in plain text
   - Verify tokens are not exposed in URLs or logs

## Cleanup

### Test 15: Data Cleanup

1. **Test Logout**

   - Logout from application
   - Verify all authentication data is cleared
   - Verify secure storage cleanup

2. **Test Data Migration Cleanup**
   - Verify no duplicate data remains
   - Verify migration state is properly tracked

## Troubleshooting

### Common Issues:

1. **Crypto API Not Available**

   - Ensure HTTPS or localhost for crypto.subtle
   - Check browser compatibility

2. **Migration Failures**

   - Check console for error messages
   - Verify feature flags are set correctly

3. **Authentication Failures**
   - Check Supabase configuration
   - Verify PKCE flow is enabled in Supabase dashboard

### Debug Commands:

```javascript
// Check feature flags
console.log(
  'Feature flags:',
  JSON.parse(localStorage.getItem('trade_x_pro_feature_flags') || '{}')
);

// Check migration state
console.log(
  'Migration state:',
  JSON.parse(localStorage.getItem('auth_migration_state') || '{}')
);

// Check storage keys
console.log(
  'Storage keys:',
  Object.keys(localStorage).filter(
    (k) => k.startsWith('secure_auth_') || k.startsWith('sb-')
  )
);

// Test secure storage (see Secure Storage Verification section for access methods)
import { SecureStorage } from './src/lib/secureStorage.ts';
const storage = new SecureStorage();
console.log(
  'Storage test:',
  storage.getItem('access_token') ? 'Working' : 'Failed'
);
```

## Success Criteria Checklist

- [ ] PKCE authentication flow works correctly
- [ ] Tokens are stored securely (encrypted)
- [ ] Migration from legacy data works
- [ ] Rollback functionality works
- [ ] OAuth flow works with PKCE
- [ ] Security headers are applied
- [ ] Error handling is graceful
- [ ] Performance impact is acceptable
- [ ] XSS protection is effective
- [ ] Session management works correctly
- [ ] Cleanup works properly

## Next Steps

After successful manual testing:

1. Deploy to staging environment
2. Run automated E2E tests
3. Gradual production rollout with monitoring
4. Full deployment after validation
