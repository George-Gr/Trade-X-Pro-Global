import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import type { Plugin } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// Safely load lovable-tagger plugin - fails gracefully if not available
let componentTaggerPlugin: Plugin | undefined = undefined;
(async () => {
  try {
    const lovableTagger = await import("lovable-tagger");
    componentTaggerPlugin = lovableTagger.componentTagger() as Plugin;
  } catch (e) {
    // lovable-tagger not available - component tagging will be disabled
    // This is expected in some environments
  }
})();

// PWA Configuration
const PWA_CONFIG = {
  // App metadata
  name: 'TradeX Pro - Multi Asset CFD Trading Platform',
  shortName: 'TradeX Pro',
  description: 'Practice CFD trading risk-free with virtual funds on a professional trading platform.',
  themeColor: '#3b82f6',
  backgroundColor: '#0a0a0a',
  
  // Icons configuration
  icons: [
    {
      src: '/icons/icon-72x72.png',
      sizes: '72x72',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/icons/icon-96x96.png',
      sizes: '96x96',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/icons/icon-128x128.png',
      sizes: '128x128',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/icons/icon-144x144.png',
      sizes: '144x144',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/icons/icon-152x152.png',
      sizes: '152x152',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/icons/icon-384x384.png',
      sizes: '384x384',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable'
    }
  ],
  
  // Workbox configuration for service worker
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.trandexpro\.com\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 300, // 5 minutes
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /\.(css|js)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 86400, // 24 hours
          },
        },
      },
      {
        urlPattern: /\.(png|jpg|jpeg|svg|ico|woff|woff2)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 2592000, // 30 days
          },
        },
      },
    ],
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    componentTaggerPlugin,
    process.env.ANALYZE && visualizer({ filename: 'dist/bundle-analysis.html', open: false, gzipSize: true }),
    // Sentry source map upload plugin (production only)
    process.env.NODE_ENV === 'production' ? sentryVitePlugin({
      org: "trade-x-pro",
      project: "trade-x-pro-global",
      
      // Auth tokens are injected via the Sentry CLI (see package.json)
      authToken: process.env.SENTRY_AUTH_TOKEN,
      
      // Upload source maps for error tracking
      sourcemaps: {
        assets: "./dist/**",
        ignore: ["node_modules", "dist/assets"],
      },
      
      // Release configuration
      release: {
        name: process.env.npm_package_version || "unknown",
        create: true,
      },
      
      // Deploy configuration
      deploy: {
        env: process.env.NODE_ENV === 'production' ? "production" : "development",
      },
    }) : null,
  ].filter(Boolean) as unknown as (import("vite").Plugin)[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime.js"),
    },
    // Force single React instance across app and deps
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  // Ensure a single prebundled copy in dev server
  optimizeDeps: {
    include: [
      "react", 
      "react-dom", 
      "react/jsx-runtime",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-hover-card",
    ],
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
            if (id.includes('lightweight-charts')) return 'vendor-lightweight-charts';
// Split recharts into smaller chunks based on specific components
            if (id.includes('recharts') && id.includes('cartesian')) return 'vendor-recharts-cartesian';
            if (id.includes('recharts') && id.includes('pie')) return 'vendor-recharts-pie';
            if (id.includes('recharts') && id.includes('bar')) return 'vendor-recharts-bar';
            if (id.includes('recharts') && id.includes('line')) return 'vendor-recharts-line';
            if (id.includes('recharts')) return 'vendor-recharts-core';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('@radix-ui')) return 'vendor-ui';
            if (id.includes('react-hook-form') || id.includes('zod')) return 'vendor-forms';
            if (id.includes('@tanstack')) return 'vendor-query';
            if (id.includes('@sentry')) return 'vendor-monitoring';
            if (id.includes('date-fns')) return 'vendor-date';
          }
        },
        // Ensure chunks are optimized for caching
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    
    // Compression for better PWA performance
    target: 'es2015',
    cssTarget: 'chrome61',
    minify: true,
    cssCodeSplit: true,
    
    // Source map configuration for Sentry
    sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,
  },
}));
