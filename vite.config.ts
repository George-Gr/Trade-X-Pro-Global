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
    },
  },
  build: {
    // Increase or lower as needed; this only controls the warning threshold.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split large node_modules dependencies into smaller vendor chunks to
        // avoid a single large JS chunk. Tune groups as project libs change.
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // React and React-DOM must be loaded first - always in their own chunks
            if (id.includes('/react/') || id.includes('/react-dom/')) return 'vendor-react';
            // Radix UI components depend on React
            if (id.includes('@radix-ui')) return 'vendor-radix';
            // React Router depends on React
            if (id.includes('react-router')) return 'vendor-router';
            // Chart libraries depend on React
            if (id.includes('lightweight-charts') || id.includes('recharts')) return 'vendor-charts';
            // TanStack Query depends on React
            if (id.includes('@tanstack') || id.includes('react-query')) return 'vendor-query';
            // UI libraries that depend on React (lucide, cmdk, sonner, embla-carousel)
            if (id.includes('lucide-react') || id.includes('cmdk') || id.includes('sonner') || id.includes('embla-carousel')) return 'vendor-ui';
            // Supabase client
            if (id.includes('@supabase') || id.includes('supabase')) return 'vendor-supabase';
            // Date utilities
            if (id.includes('date-fns')) return 'vendor-utils';
            // Form and validation
            if (id.includes('zod') || id.includes('@hookform') || id.includes('react-hook-form')) return 'vendor-forms';
            // Styling and theming utilities
            if (id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('next-themes')) return 'vendor-styling';
            // Misc utilities and libraries
            return 'vendor-other';
          }
        },
      },
    },
  },
}));
