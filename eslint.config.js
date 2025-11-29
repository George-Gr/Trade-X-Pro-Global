import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      
      // Prevent listener leaks
      "no-restricted-globals": [
        "error",
        {
          name: "addEventListener",
          message: "Use React's useEffect hook with proper cleanup instead of direct addEventListener"
        },
        {
          name: "removeEventListener", 
          message: "Use React's useEffect cleanup instead of direct removeEventListener"
        }
      ],
      
      // Enforce proper cleanup
      "react-hooks/exhaustive-deps": "warn",
    },
  },
);
