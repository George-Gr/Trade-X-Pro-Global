import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import type { Plugin } from "vite";

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
      },
      // Limit the number of parallel requests during runtime
      maxParallelRequests: 10,
    },
    // Optimize for production builds
    target: 'es2015',
    // Use default minification (esbuild)
    minify: true,
    // Optimize for faster builds
    cssCodeSplit: true,
    // Optimize chunk size
    chunkSize: 500,
  },
}));
