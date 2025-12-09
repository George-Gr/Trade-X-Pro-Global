#!/bin/bash

echo "==================================="
echo "GitHub Codespaces Environment Check"
echo "==================================="
echo ""

# Check if running in Codespaces
if [ -n "$CODESPACE_NAME" ]; then
    echo "✅ Running in GitHub Codespaces"
    echo "   Codespace Name: $CODESPACE_NAME"
    echo "   Domain: $GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN"
    echo "   Expected HMR URL: wss://${CODESPACE_NAME}-8080.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
else
    echo "❌ Not running in GitHub Codespaces"
    echo "   This is a local environment"
fi

echo ""
echo "==================================="
echo "Port Configuration"
echo "==================================="
echo ""

# Check if port 8080 is in use
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Port 8080 is in use"
    lsof -i :8080 | grep LISTEN
else
    echo "⚠️  Port 8080 is not in use"
    echo "   Start the dev server with: npm run dev"
fi

echo ""
echo "==================================="
echo "Vite Cache Status"
echo "==================================="
echo ""

if [ -d "node_modules/.vite" ]; then
    echo "⚠️  Vite cache exists"
    echo "   Location: node_modules/.vite"
    echo "   Size: $(du -sh node_modules/.vite 2>/dev/null | cut -f1)"
    echo "   To clear: npm run dev:clean"
else
    echo "✅ No Vite cache found (clean state)"
fi

echo ""
echo "==================================="
echo "Recommendations"
echo "==================================="
echo ""

if [ -n "$CODESPACE_NAME" ]; then
    echo "1. Ensure port 8080 visibility is set to 'Public' in Codespaces Ports panel"
    echo "2. Clear cache and restart: npm run dev:clean"
    echo "3. Hard refresh browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
    echo "4. Check browser console for any remaining errors"
else
    echo "1. For local development, the standard configuration should work"
    echo "2. If issues persist, try: npm run dev:clean"
fi

echo ""