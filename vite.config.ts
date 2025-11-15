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
    // Increase or lower as needed; this only controls the warning threshold.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split large node_modules dependencies into smaller vendor chunks to
        // avoid a single large JS chunk. Tune groups as project libs change.
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // Core React bundle - must be separate and loaded first
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            // React ecosystem - depends on React but can be bundled together
            if (id.includes('@radix-ui') || id.includes('react-router') || 
                id.includes('@tanstack') || id.includes('react-query') ||
                id.includes('lucide-react') || id.includes('cmdk') || 
                id.includes('sonner') || id.includes('embla-carousel') ||
                id.includes('react-hook-form') || id.includes('@hookform') ||
                id.includes('next-themes')) {
              return 'vendor-react-ecosystem';
            }
            // Chart libraries
            if (id.includes('lightweight-charts') || id.includes('recharts')) {
              return 'vendor-charts';
            }
            // Supabase client
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'vendor-supabase';
            }
            // Utilities and other libraries
            if (id.includes('date-fns') || id.includes('zod') || 
                id.includes('class-variance-authority') || id.includes('clsx') || 
                id.includes('tailwind-merge')) {
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
