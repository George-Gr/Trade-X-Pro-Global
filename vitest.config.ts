import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { Plugin } from "vite";

export default defineConfig({
  plugins: [react() as unknown as Plugin],
  test: {
    globals: true,
    environment: "jsdom",
    include: [
      "**/__tests__/**/*.test.ts",
      "**/__tests__/**/*.test.tsx",
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "src/test/**/*.test.ts",
    ],
    setupFiles: ["./vitest.setup.ts", "./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.*"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
