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
    server.middlewares.use((_req, res, next) => {
      // Generate unique nonce for each request
      const nonce = crypto.randomBytes(16).toString('base64');
      
      // Store nonce in async local storage for access by transformIndexHtml hook
      asyncLocalStorage.run({ nonce }, () => {
        // Determine CSP header based on environment
        const isProduction = process.env.NODE_ENV === 'production';
        const cspHeader = isProduction 
          ? 'Content-Security-Policy'
          : 'Content-Security-Policy-Report-Only';
        
        // Set CSP header with nonce (report-only mode for development, strict for production)
        res.setHeader(
          cspHeader,
          `default-src 'self'; script-src 'self' 'nonce-${nonce}' https://s3.tradingview.com https://www.tradingview.com https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://finnhub.io https://api.nowpayments.io https://api.tradingview.com https://s3.tradingview.com; frame-src https://www.tradingview.com https://s.tradingview.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests; block-all-mixed-content; report-uri /csp-report; report-to csp-endpoint`
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
    react({
      // Enable React 19 features
      babel: {
        plugins: [
          // React 19 concurrent features
          ['@babel/plugin-syntax-explicit-resource-management'],
          ['@babel/plugin-transform-react-jsx-development'],
        ],
      },
    }),
    corsMiddleware(),
    cspNonceMiddleware(),
    componentTaggerPlugin,
    // Bundle size monitoring and budgets
    {
      name: 'bundle-size-checker',
      generateBundle(_options: any, bundle: any) {
        if (process.env.NODE_ENV === 'production') {
          const sizes: Record<string, number> = {};
          const chunkGroups: Record<string, number> = {};
          
          // Define budgets for specific chunk groups (in bytes)
          const BUDGETS = {
            'vendor-react-core': 150 * 1024,       // 150KB for React core
            'vendor-charts-lightweight': 500 * 1024, // 500KB for Charts
            'vendor-state-query': 100 * 1024,      // 100KB for TanStack Query
            'vendor-ui-radix': 200 * 1024,         // 200KB for UI components
            'index': 300 * 1024,                   // 300KB for main entry
          };
          
          Object.keys(bundle).forEach(fileName => {
            const chunk = bundle[fileName];
            let byteLength = 0;
            
            if (chunk.type === 'chunk') {
              const code = chunk.code || '';
              byteLength = Buffer.byteLength(code, 'utf8');
              
              // Group sizes by chunk name prefix
              const chunkName = chunk.name || 'unknown';
              chunkGroups[chunkName] = (chunkGroups[chunkName] || 0) + byteLength;
              
            } else if (chunk.type === 'asset') {
              const source = chunk.source;
              
              if (typeof source === 'string') {
                byteLength = Buffer.byteLength(source, 'utf8');
              } else if (source instanceof Buffer) {
                byteLength = source.length;
              } else if (source instanceof Uint8Array) {
                byteLength = source.byteLength;
              } else if (ArrayBuffer.isView(source)) {
                byteLength = source.byteLength;
              } else if (source instanceof ArrayBuffer) {
                byteLength = source.byteLength;
              } else {
                try {
                  byteLength = Buffer.from(source).length;
                } catch {
                  byteLength = 0;
                }
              }
            }
            
            sizes[fileName] = byteLength;
          });
          
          // Log bundle sizes
          console.log('\n📦 Bundle Size Report:');
          Object.entries(sizes).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([file, size]) => {
            const sizeKB = (size / 1024).toFixed(2);
            console.log(`  ${file}: ${sizeKB} KB`);
          });

          console.log('\n📊 Chunk Group Analysis:');
          let hasBudgetViolations = false;
          
          Object.entries(chunkGroups).forEach(([group, size]) => {
            const sizeKB = (size / 1024).toFixed(2);
            const budget = BUDGETS[group as keyof typeof BUDGETS];
            
            if (budget) {
              const budgetKB = (budget / 1024).toFixed(2);
              const percent = ((size / budget) * 100).toFixed(0);
              
              if (size > budget) {
                console.warn(`⚠️  ${group}: ${sizeKB} KB (Budget: ${budgetKB} KB) - ${percent}% used`);
                hasBudgetViolations = true;
              } else {
                console.log(`✅ ${group}: ${sizeKB} KB (Budget: ${budgetKB} KB) - ${percent}% used`);
              }
            } else if (size > 100 * 1024) { // Report large chunks without specific budget
               console.log(`ℹ️  ${group}: ${sizeKB} KB`);
            }
          });
          
          // Check total size budget
          const mainBundle = Object.values(sizes).reduce((acc, size) => acc + size, 0);
          const mainBundleMB = mainBundle / (1024 * 1024);
          
          if (mainBundleMB > 2) {
            console.warn(`\n⚠️  Total Bundle: ${mainBundleMB.toFixed(2)}MB exceeds 2MB budget`);
          } else {
            console.log(`\n✅ Total Bundle: ${mainBundleMB.toFixed(2)}MB (within 2MB budget)`);
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
      // Optimize React imports to use specific entry points
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(
        __dirname,
        'node_modules/react/jsx-runtime.js'
      ),
      // Preload critical components
      'react-dom/client': path.resolve(__dirname, 'node_modules/react-dom/client'),
      'react-dom/server': path.resolve(__dirname, 'node_modules/react-dom/server'),
    },
    // Force single React instance across app and deps
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  // Ensure a single prebundled copy in dev server with optimized includes
  optimizeDeps: {
    include: [
      // Core React stack only
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-dom/client',
      'react-dom/server',
      
      // Essential UI components only
      '@radix-ui/react-tooltip',
      '@radix-ui/react-dialog',
      
      // Essential state management
      '@tanstack/react-query',
      'react-hook-form',
      
      // Essential utilities
      'zod',
      'clsx',
      'class-variance-authority',
      'hoist-non-react-statics',
    ],
    // Force re-optimization to fix dependency issues
    force: true,
    
    // Exclude heavy chart libraries and other large dependencies from prebundling
    exclude: [
      'recharts',
      '@supabase/supabase-js',
      'framer-motion',
      'sonner',
      'lucide-react',
      'lightweight-charts',
      'date-fns',
      'dompurify',
      '@sentry/react',
      'web-vitals',
    ],
  },
  build: {
    // Reduced from 600 to 400 - encourages better code splitting
    chunkSizeWarningLimit: 400,

    // Limit the number of parallel requests during runtime
    chunkLimit: 10,

    // Optimize chunk size
    chunkSize: 500,

    // Fix CommonJS modules like hoist-non-react-statics
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
    },

    // Enhanced code splitting and bundle optimization
    rollupOptions: {
      output: {
        // Improved manual chunks for better parallel loading and caching
        manualChunks: (id) => {
          // Core framework chunks
          if (id.includes('node_modules')) {
            // Chart libraries - split into separate chunks
            if (id.includes('lightweight-charts'))
              return 'vendor-charts-lightweight';
            if (id.includes('recharts')) {
              // Split recharts by functionality
              if (id.includes('cartesian')) return 'vendor-charts-recharts-cartesian';
              if (id.includes('pie')) return 'vendor-charts-recharts-pie';
              if (id.includes('bar')) return 'vendor-charts-recharts-bar';
              if (id.includes('line')) return 'vendor-charts-recharts-line';
              if (id.includes('radial')) return 'vendor-charts-recharts-radial';
              return 'vendor-charts-recharts-core';
            }
            
            // UI and component libraries
            if (id.includes('@radix-ui')) return 'vendor-ui-radix';
            if (id.includes('lucide-react')) return 'vendor-icons-lucide';
            if (id.includes('class-variance-authority')) return 'vendor-ui-cva';
            if (id.includes('clsx')) return 'vendor-ui-clsx';
            
            // State management and data fetching
            if (id.includes('@tanstack')) return 'vendor-state-query';
            if (id.includes('react-hook-form')) return 'vendor-forms-hook';
            if (id.includes('zod')) return 'vendor-forms-validation';
            
            // Database and API
            if (id.includes('@supabase')) return 'vendor-database-supabase';
            if (id.includes('dompurify')) return 'vendor-security-dompurify';
            
            // Date and utilities
            if (id.includes('date-fns')) return 'vendor-utils-date';
            if (id.includes('framer-motion')) return 'vendor-animation-framer';
            if (id.includes('sonner')) return 'vendor-notifications-sonner';
            
            // Core React
            if (id.includes('react-dom')) return 'vendor-react-dom';
            if (id.includes('react')) return 'vendor-react-core';
            
            // Monitoring and analytics
            if (id.includes('@sentry')) return 'vendor-monitoring-sentry';
            if (id.includes('web-vitals')) return 'vendor-monitoring-vitals';
          }
          return undefined;
        },
        // Optimize chunk naming for better caching
        chunkFileNames: 'chunks/[name]-[hash:8].js',
        entryFileNames: 'assets/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8].[ext]',
        
        // Optimize chunk size and parallel loading
        minifyInternalExports: true,
      },
      
      // Optimize chunk size limits
      maxChunkSize: 200000, // 200KB max per chunk
      minChunkSize: 5000,   // 5KB min per chunk
      
      // Enable treeshake options
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },

    // Enhanced compression and optimization
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
    
    // Optimize asset processing
    assetsInlineLimit: 4096, // Inline small assets (4KB)
    
    // Optimize for production
    reportCompressedSize: true,
    cssMinify: true,
  },
}));
