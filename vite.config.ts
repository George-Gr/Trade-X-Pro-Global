import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
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
    include: ["react", "react-dom", "react/jsx-runtime", "@radix-ui/react-tooltip"],
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // Core React - MUST be in its own chunk and loaded first
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            // Radix UI - all Radix components together
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            // React Router
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // TanStack Query
            if (id.includes('@tanstack') || id.includes('react-query')) {
              return 'vendor-query';
            }
            // Chart libraries
            if (id.includes('lightweight-charts') || id.includes('recharts')) {
              return 'vendor-charts';
            }
            // Supabase
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'vendor-supabase';
            }
            // Forms
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'vendor-forms';
            }
            // UI utilities
            if (id.includes('lucide-react') || id.includes('cmdk') || 
                id.includes('sonner') || id.includes('embla-carousel') ||
                id.includes('next-themes')) {
              return 'vendor-ui';
            }
            // Other utilities
            if (id.includes('date-fns') || id.includes('class-variance-authority') || 
                id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-utils';
            }
            // Everything else
            return 'vendor-other';
          }
        },
      },
    },
  },
}));
