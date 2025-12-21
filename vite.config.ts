import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { AsyncLocalStorage } from 'async_hooks';
import crypto from 'crypto';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

// Async local storage for per-request nonce tracking
const asyncLocalStorage = new AsyncLocalStorage<{ nonce: string }>();

// CORS middleware for development - handles cross-origin requests securely
const corsMiddleware = (): Plugin => ({
  name: 'cors-middleware',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // Secure CORS configuration with explicit origin allowlists
      const origin = req.headers.origin;
      const isProd = process.env.NODE_ENV === 'production';
      
      let allowedOrigins: string[] = [];
      
      if (isProd) {
        // Production: Strict allowlist
        allowedOrigins = [
          'https://tradepro.vercel.app',
          'https://www.tradepro.vercel.app'
        ];
      } else {
        // Development: Common development origins only
        allowedOrigins = [
          'http://localhost:5173',  // Vite dev server
          'http://127.0.0.1:5173',
          'http://localhost:3000',  // Common React dev server
          'http://127.0.0.1:3000',
          'http://localhost:8080',  // Common custom port
          'http://127.0.0.1:8080'
        ];
      }

      // Check if origin is allowed
      const isOriginAllowed = origin && allowedOrigins.includes(origin);
      
      if (isOriginAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else if (!isProd) {
        // In development, allow localhost origins by default for convenience
        // but log warnings only for explicitly unknown origins (not undefined)
        if (origin === undefined) {
          // No origin header - same-origin request, allow it
          res.setHeader('Access-Control-Allow-Origin', '*');
        } else {
          const isLocalhost = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
          if (isLocalhost) {
            res.setHeader('Access-Control-Allow-Origin', origin);
          } else {
            console.warn(`⚠️  CORS: Unknown origin blocked: ${origin}`);
            res.setHeader('Access-Control-Allow-Origin', 'null');
          }
        }
      }

      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type,Authorization,Accept,Origin,X-Requested-With,X-Requested-By'
      );
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

      // Security headers
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      next();
    });
  },
});

// CSP Nonce generation middleware - generates one nonce per request
// and makes it available to both CSP header and HTML transformation
const cspNonceMiddleware = (): Plugin => ({
  name: 'csp-nonce-middleware',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // Generate unique nonce for each request
      const nonce = crypto.randomBytes(16).toString('base64');
      
      // Store nonce in async local storage for access by transformIndexHtml hook
      asyncLocalStorage.run({ nonce }, () => {
        // Set CSP header with nonce (report-only mode for development)
        res.setHeader(
          'Content-Security-Policy-Report-Only',
          `default-src 'self'; script-src 'self' 'nonce-${nonce}' https://s3.tradingview.com https://www.tradingview.com https://cdn.jsdelivr.net; style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://finnhub.io https://api.nowpayments.io https://*.tradingview.com; frame-src https://www.tradingview.com https://s.tradingview.com; report-uri /csp-report; report-to csp-endpoint`
        );
        
        next();
      });
    });
  },
  // Use Vite's transformIndexHtml hook to inject nonce into HTML
  // This properly handles all SPA routes and index.html requests
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      // Retrieve nonce from async local storage (set by middleware)
      const store = asyncLocalStorage.getStore();
      const nonce = store?.nonce || crypto.randomBytes(16).toString('base64');
      
      // Replace all {CSP_NONCE} placeholders with actual nonce value
      return html.replace(/{CSP_NONCE}/g, nonce);
    },
  },
});

// Safely load lovable-tagger plugin - fails gracefully if not available
let componentTaggerPlugin: Plugin | undefined = undefined;
(async () => {
  try {
    const lovableTagger = await import('lovable-tagger');
    componentTaggerPlugin = lovableTagger.componentTagger() as Plugin;
  } catch (e) {
    // lovable-tagger not available - component tagging will be disabled
  }
})();

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: false,
    hmr: {
      // GitHub Codespaces optimized configuration
      ...(process.env.CODESPACE_NAME
        ? {
            protocol: 'wss',
            host: `${process.env.CODESPACE_NAME}-8080.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`,
            clientPort: 443,
            timeout: 30000,
          }
        : {
            // Default configuration for local development
            protocol: 'ws',
            host: 'localhost',
            port: 8080,
          }),
    },
    watch: {
      // Essential for containerized environments like Codespaces
      usePolling: true,
      interval: 1000,
    },
  },
  plugins: [
    react(),
    corsMiddleware(),
    cspNonceMiddleware(),
    componentTaggerPlugin,
    // Bundle size monitoring and budgets
    {
      name: 'bundle-size-checker',
      generateBundle(_options: any, bundle: any) {
        if (process.env.NODE_ENV === 'production') {
          const sizes: Record<string, number> = {};
          
          Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk') {
          const code = chunk.code || '';
          sizes[fileName] = Buffer.byteLength(code, 'utf8');
        } else if (chunk.type === 'asset') {
          const source = chunk.source;
          let byteLength: number;
          
          if (typeof source === 'string') {
            byteLength = Buffer.byteLength(source, 'utf8');
          } else if (source instanceof Buffer) {
            byteLength = source.length;
          } else if (source instanceof Uint8Array) {
            byteLength = source.byteLength;
          } else if (ArrayBuffer.isView(source)) {
            // Handle other typed arrays (Uint16Array, Uint32Array, etc.)
            byteLength = source.byteLength;
          } else if (source instanceof ArrayBuffer) {
            byteLength = source.byteLength;
          } else {
            // Fallback: try to convert to Buffer
            try {
              byteLength = Buffer.from(source).length;
            } catch {
              // If all else fails, assume 0 bytes
              byteLength = 0;
            }
          }
          
          sizes[fileName] = byteLength;
        }
          });
          
          // Log bundle sizes
          console.log('\n📦 Bundle Size Report:');
          Object.entries(sizes).forEach(([file, size]) => {
        const sizeKB = (size / 1024).toFixed(2);
        console.log(`  ${file}: ${sizeKB} KB`);
          });
          
          // Check size budgets
          const mainBundle = Object.values(sizes).reduce((acc, size) => acc + size, 0);
          const mainBundleMB = mainBundle / (1024 * 1024);
          
          if (mainBundleMB > 2) {
        console.warn(`⚠️  Bundle size warning: ${mainBundleMB.toFixed(2)}MB exceeds 2MB budget`);
          } else {
        console.log(`✅ Bundle size within budget: ${mainBundleMB.toFixed(2)}MB`);
          }
        }
      },
    },
    // Bundle analyzer - run with ANALYZE=true npm run build
    process.env.ANALYZE &&
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // treemap, sunburst, or network
      }),
    // Sentry source map upload plugin (production only)
    process.env.NODE_ENV === 'production'
      ? sentryVitePlugin({
          org: 'trade-x-pro',
          project: 'trade-x-pro-global',

          authToken: process.env.SENTRY_AUTH_TOKEN,

          sourcemaps: {
            assets: './dist/**',
            ignore: ['node_modules', 'dist/assets'],
          },

          release: {
            name: process.env.npm_package_version || 'unknown',
            create: true,
          },
        })
      : null,
  ].filter(Boolean) as Plugin[],

  // Browser globals only - env variables handled via import.meta.env
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(
        __dirname,
        'node_modules/react/jsx-runtime.js'
      ),
    },
    // Force single React instance across app and deps
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  // Ensure a single prebundled copy in dev server
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-hover-card',
    ],
    // Force re-optimization to fix dependency issues
    force: true,
  },
  build: {
    // Reduced from 600 to 400 - encourages better code splitting
    chunkSizeWarningLimit: 400,

    // Limit the number of parallel requests during runtime
    chunkLimit: 10,

    // Optimize chunk size
    chunkSize: 500,

    // Additional PWA optimizations
    rollupOptions: {
      output: {
        // Optimized manual chunks for better bundle splitting
        // Each vendor chunk is split separately to enable parallel loading
        manualChunks: (id) => {
          // Vendor chunks - split charts into separate chunks
          if (id.includes('node_modules')) {
            if (id.includes('lightweight-charts'))
              return 'vendor-lightweight-charts';
            // Split recharts into smaller chunks based on specific components
            if (id.includes('recharts') && id.includes('cartesian'))
              return 'vendor-recharts-cartesian';
            if (id.includes('recharts') && id.includes('pie'))
              return 'vendor-recharts-pie';
            if (id.includes('recharts') && id.includes('bar'))
              return 'vendor-recharts-bar';
            if (id.includes('recharts') && id.includes('line'))
              return 'vendor-recharts-line';
            if (id.includes('recharts')) return 'vendor-recharts-core';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('@radix-ui')) return 'vendor-ui';
            if (id.includes('react-hook-form') || id.includes('zod'))
              return 'vendor-forms';
            if (id.includes('@tanstack')) return 'vendor-query';
            if (id.includes('@sentry')) return 'vendor-monitoring';
            if (id.includes('date-fns')) return 'vendor-date';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('react-dom')) return 'vendor-react-dom';
          }
          return undefined;
        },
        // Ensure chunks are optimized for caching
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // Compression for better PWA performance
    target: 'es2015',
    cssTarget: 'chrome61',
    minify: true,
    cssCodeSplit: true,

    // Source map configuration for Sentry
    sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,

    // Clear dist directory before build to ensure fresh builds
    emptyOutDir: true,

    // Prevent chunk file cache issues by using content-based hashing
    preserveEntrySignatures: 'exports-only',

    // Ensure consistent asset processing
    assetsInlineLimit: 0, // Inline assets as separate files
  },
}));
