import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

const corsMiddleware = () => ({
  name: 'cors-middleware',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      const origin = req.headers.origin;
      const isProd = process.env.NODE_ENV === 'production';
      
      if (isProd) {
        res.setHeader('Access-Control-Allow-Origin', process.env.VITE_PRODUCTION_URL);
      } else {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
      }
      
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }
      
      next();
    });
  },
});

// CSP middleware for development only
const cspMiddleware = () => ({
  name: 'csp-middleware',
  apply: 'serve',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      res.setHeader(
        'Content-Security-Policy-Report-Only',
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://s3.tradingview.com https://www.tradingview.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src https://www.tradingview.com; object-src 'none'; base-uri 'self';"
      );
      
      next();
    });
  },
});

export default defineConfig(() => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    server: {
      host: '0.0.0.0',
      port: 8080,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 8080,
      },
    },
    plugins: [
      react(),
      corsMiddleware(),
      cspMiddleware(),
      
      // Simple bundle size monitoring
      {
        name: 'bundle-size-checker',
        generateBundle(options: any, bundle: any) {
          if (isProduction) {
            console.log('\n📦 Bundle Size Report:');
            const entries = Object.entries(bundle)
              .filter(([name]) => (name as string).endsWith('.js'))
              .sort(([,a], [,b]) => ((b as any).code?.length || 0) - ((a as any).code?.length || 0))
              .slice(0, 10);
              
            entries.forEach(([file, chunk]) => {
              const size = ((chunk as any).code?.length || 0) / 1024;
              console.log(`  ${file}: ${size.toFixed(2)} KB`);
            });
          }
        },
      },
      
      // Bundle analyzer
      process.env.ANALYZE && visualizer({
        filename: 'dist/bundle-analysis.html',
        open: true,
        gzipSize: true,
        template: 'treemap',
      }),
      
      // Sentry source map upload
      isProduction && sentryVitePlugin({
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
      }),
    ].filter(Boolean),

    define: {
      global: 'globalThis',
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'hoist-non-react-statics'],
    },
    
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'hoist-non-react-statics',
        '@tanstack/react-query',
        'react-hook-form',
        'zod',
        'clsx',
        'class-variance-authority',
      ],
      exclude: [
        'recharts',
        '@supabase/supabase-js',
        'framer-motion',
        'lightweight-charts',
        'date-fns',
        '@sentry/react',
      ],
    },
    
    build: {
      chunkSizeWarningLimit: 250,
      rollupOptions: {
        output: {
          // Simplified manual chunks
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-tooltip', 'lucide-react'],
            'vendor-state': ['@tanstack/react-query', 'react-hook-form', 'zod'],
            'vendor-charts': ['recharts', 'lightweight-charts'],
            'vendor-utils': ['date-fns', 'clsx', 'class-variance-authority'],
            'vendor-supabase': ['@supabase/supabase-js'],
          },
          chunkFileNames: 'chunks/[name]-[hash:8].js',
          entryFileNames: 'assets/[name]-[hash:8].js',
          assetFileNames: 'assets/[name]-[hash:8].[ext]',
        },
        treeshake: {
          moduleSideEffects: false,
        },
      },
      target: 'es2015',
      minify: true,
      cssCodeSplit: true,
      sourcemap: isProduction ? ('hidden' as const) : true,
      emptyOutDir: true,
      assetsInlineLimit: 4096,
      reportCompressedSize: true,
    },
  };
});
