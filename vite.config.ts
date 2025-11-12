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
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('lightweight-charts') || id.includes('recharts')) return 'vendor-charts';
            if (id.includes('@supabase') || id.includes('supabase')) return 'vendor-supabase';
            if (id.includes('@tanstack') || id.includes('react-query')) return 'vendor-query';
            if (id.includes('lucide-react') || id.includes('cmdk') || id.includes('sonner')) return 'vendor-ui';
            return 'vendor';
          }
        },
      },
    },
  },
}));
