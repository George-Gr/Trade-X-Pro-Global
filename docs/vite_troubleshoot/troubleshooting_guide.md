# 🔧 Troubleshooting Guide: WebSocket & CORS Issues

## Root Causes Identified

### 1. **WebSocket Connection Failures**
- **Problem**: HMR trying to connect with incorrect host configuration
- **Cause**: Your config had `clientPort: 8080` instead of `443` for Codespaces
- **Impact**: WebSocket couldn't establish secure connection through GitHub's proxy

### 2. **CORS Manifest Error**
- **Problem**: GitHub Codespaces redirecting manifest.json through auth
- **Cause**: Static manifest.json being blocked by Codespaces auth flow
- **Impact**: Browser couldn't load PWA manifest

### 3. **Middleware Configuration Issues**
- **Problem**: Custom middleware wasn't properly integrated
- **Cause**: Using deprecated `middlewares` array and `middlewareMode` incorrectly
- **Impact**: CORS headers not applied correctly

---

## 🚀 Step-by-Step Solution

### Step 1: Update Configuration Files

Replace your `vite.config.ts` with the fixed version provided. Key changes:

```typescript
// ✅ FIXED: Proper Codespaces HMR configuration
hmr: {
  ...(process.env.CODESPACE_NAME ? {
    protocol: 'wss',
    host: `${process.env.CODESPACE_NAME}-8080.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`,
    clientPort: 443,  // Changed from 8080 to 443
    timeout: 30000,
  } : {
    protocol: 'ws',
    host: 'localhost',
    port: 8080,
  })
}

// ✅ FIXED: File watching for containers
watch: {
  usePolling: true,
  interval: 1000,
}

// ✅ FIXED: Proper middleware integration
const corsMiddleware = (): Plugin => ({
  name: 'cors-middleware',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // CORS headers
    });
  },
});
```

### Step 2: Update index.html

The manifest.json is now loaded conditionally to avoid auth redirects:

```html
<!-- Only load manifest if not in auth flow -->
<script>
  if (!window.location.href.includes('pf-signin')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    link.crossOrigin = 'use-credentials';
    document.head.appendChild(link);
  }
</script>
```

### Step 3: Configure GitHub Codespaces Port

1. Open the **Ports** panel in Codespaces (usually at bottom of VS Code)
2. Find port **8080**
3. Right-click → **Port Visibility** → Select **Public**
4. This allows WebSocket connections through GitHub's proxy

### Step 4: Clear Cache and Restart

```bash
# Option 1: Quick clean restart
npm run dev:clean

# Option 2: Deep clean (if issues persist)
npm run dev:fresh

# Option 3: Manual clean
rm -rf node_modules/.vite .vite dist
rm -rf node_modules/.cache
npm install
npm run dev
```

### Step 5: Verify Setup

```bash
# Make the script executable
chmod +x check-codespaces.sh

# Run diagnostic
./check-codespaces.sh
```

### Step 6: Browser Configuration

1. **Hard refresh**: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Clear site data**:
   - Open DevTools (F12)
   - Application tab → Clear storage → Clear site data
3. **Disable cache**: DevTools → Network tab → Check "Disable cache"

---

## ✅ Expected Results

After applying fixes, you should see:

```bash
VITE v7.2.2  ready in 843 ms

➜  Local:   http://localhost:8080/
➜  Network: http://0.0.0.0:8080/
➜  Network: https://miniature-space-dollop-697gpp9jv77pc575r-8080.app.github.dev/
➜  press h + enter to show help
```

**Browser Console (Clean)**:
- ✅ No WebSocket errors
- ✅ HMR connected successfully
- ✅ No CORS errors
- ✅ Manifest loaded (or safely skipped if in auth flow)

---

## 🔍 If Issues Persist

### WebSocket Still Failing?

**Check 1: Environment Variables**
```bash
echo $CODESPACE_NAME
echo $GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
```
Both should have values. If not, restart Codespaces.

**Check 2: Port Forwarding**
```bash
gh codespace ports
```
Ensure 8080 is listed and visibility is "public"

**Check 3: Browser Extensions**
Disable ad blockers and privacy extensions that might block WebSockets

### CORS Errors Continue?

**Check 1: Manifest Loading**
Look for this in Network tab:
- ❌ Redirecting to auth → Update index.html script
- ✅ 200 OK or 404 → Configuration working

**Check 2: Service Workers**
Old service workers might cache bad configs:
```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    registrations.forEach(r => r.unregister());
    location.reload();
  });
```

### Nuclear Option (Last Resort)

```bash
# Complete environment reset
rm -rf node_modules package-lock.json
rm -rf .vite node_modules/.vite dist
npm cache clean --force
npm install
npm run dev
```

---

## 📊 Performance Tips

After fixing, optimize development:

```bash
# Faster rebuilds
npm run dev:rebuild

# Analyze bundle
ANALYZE=true npm run build

# Type checking
npm run type:strict
```

---

## 🎯 Key Differences: Before vs After

| Aspect | ❌ Before | ✅ After |
|--------|----------|---------|
| HMR Client Port | 8080 | 443 (for Codespaces) |
| Host Detection | Explicit host binding | Auto-detection with env vars |
| File Watching | Default | Polling enabled |
| Manifest Loading | Always | Conditional (skip auth) |
| CORS Middleware | Broken array syntax | Proper `configureServer` |
| Error Handling | Silent failures | Graceful fallbacks |

---

## 📚 Additional Resources

- [Vite Server Options](https://vitejs.dev/config/server-options.html)
- [GitHub Codespaces Port Forwarding](https://docs.github.com/en/codespaces/developing-in-codespaces/forwarding-ports-in-your-codespace)
- [WebSocket Debugging](https://javascript.info/websocket)

---

## 💡 Prevention

To avoid these issues in future:

1. **Always use environment detection** for host configuration
2. **Enable polling** for containerized environments
3. **Test port visibility** when deploying to Codespaces
4. **Clear cache** when changing Vite config
5. **Use conditional resource loading** for PWA assets

---

## Need More Help?

If you still experience issues:

1. Check browser console → Copy full error
2. Check terminal output → Copy Vite startup logs
3. Run `./check-codespaces.sh` → Copy output
4. Share all three for detailed diagnosis