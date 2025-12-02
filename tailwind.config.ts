import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import { COLORS, SEMANTIC_COLORS } from "./src/constants/designTokens";
import { FONT_FAMILIES, FONT_WEIGHTS } from "./src/constants/typography";
import { SPACING, CONTAINER_SIZES } from "./src/constants/spacing";

const config: Config = {
  darkMode: "class",
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // Primary font - Inter for headings and body
        sans: [
          FONT_FAMILIES.primary,
        ],
        // Monospace - JetBrains Mono for data and prices
        mono: [FONT_FAMILIES.mono],
      },
      spacing: {
        // 8px Grid System spacing scale
        0: SPACING[0],
        1: SPACING[1],
        2: SPACING[2],
        3: SPACING[3],
        4: SPACING[4],
        5: SPACING[5],
        6: SPACING[6],
        7: SPACING[7],
        8: SPACING[8],
        9: SPACING[9],
        10: SPACING[10],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        /* WCAG AA Compliant Accessibility Colors */
        "primary-contrast": "hsl(var(--primary-contrast))",
        "primary-contrast-light": "hsl(var(--primary-contrast-light))",
        "secondary-contrast": "hsl(var(--secondary-contrast))",
        "secondary-contrast-light": "hsl(var(--secondary-contrast-light))",
        "tertiary-contrast": "hsl(var(--tertiary-contrast))",
        "tertiary-contrast-light": "hsl(var(--tertiary-contrast-light))",
        "muted-contrast": "hsl(var(--muted-contrast))",
        "muted-contrast-light": "hsl(var(--muted-contrast-light))",
        "success-contrast": "hsl(var(--success-contrast))",
        "warning-contrast": "hsl(var(--warning-contrast))",
        "danger-contrast": "hsl(var(--danger-contrast))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          hover: "hsl(var(--gold-hover))",
          foreground: "hsl(var(--gold-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        placeholder: {
          foreground: "hsl(var(--placeholder-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        buy: {
          DEFAULT: "hsl(var(--buy))",
          hover: "hsl(var(--buy-hover))",
          foreground: "hsl(var(--buy-foreground))",
        },
        sell: {
          DEFAULT: "hsl(var(--sell))",
          hover: "hsl(var(--sell-hover))",
          foreground: "hsl(var(--sell-foreground))",
        },
        profit: "hsl(var(--profit))",
        loss: "hsl(var(--loss))",
        panel: {
          bg: "hsl(var(--panel-bg))",
          border: "hsl(var(--panel-border))",
        },
        price: {
          up: "hsl(var(--price-up))",
          down: "hsl(var(--price-down))",
          neutral: "hsl(var(--price-neutral))",
        },
        "quick-actions": "hsl(var(--quick-actions))",
      },
      borderRadius: {
        // Standardized border-radius scale
        lg: "var(--radius)",              // 8px - Use for: cards, modals, containers, drawers
        md: "calc(var(--radius) - 2px)",  // 6px - Use for: buttons, inputs, badges, small components
        sm: "calc(var(--radius) - 4px)",  // 4px - Use for: very small elements (rare)

        // Special cases (use sparingly)
        "rounded-full": "9999px",         // Use for: circular elements, avatars, badges

        // ⚠️ Deprecated - don't use in new code:
        // - rounded-none (0px) - removed from UI system
        // - rounded-xl (20px+) - use lg (8px) instead
        // - rounded-2xl (24px+) - use lg (8px) instead
        // - rounded-3xl (30px+) - use lg (8px) instead
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fadeIn": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fadeOut": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slideInUp": {
          from: {
            opacity: "0",
            transform: "translateY(20px)"
          },
          to: {
            opacity: "1",
            transform: "translateY(0)"
          },
        },
        "scaleIn": {
          from: {
            opacity: "0",
            transform: "scale(0.95)"
          },
          to: {
            opacity: "1",
            transform: "scale(1)"
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px)"
          },
          "50%": {
            transform: "translateY(-10px)"
          },
        },
        // Button interactions
        "button-press": {
          "0%": {
            transform: "scale(1)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
          },
          "50%": {
            transform: "scale(0.98)",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
          },
          "100%": {
            transform: "scale(1)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
          },
        },
        "button-hover": {
          "0%": {
            transform: "translateY(0) scale(1)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
          },
          "100%": {
            transform: "translateY(-2px) scale(1.01)",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)"
          },
        },
        // Card interactions
        "card-hover": {
          "0%": {
            transform: "translateY(0) scale(1)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          },
          "100%": {
            transform: "translateY(-4px) scale(1.02)",
            boxShadow: "0 8px 15px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.08)"
          },
        },
        // Loading animations
        "loading-pulse": {
          "0%, 100%": {
            opacity: "1"
          },
          "50%": {
            opacity: "0.4"
          },
        },
        "loading-spin": {
          "0%": {
            transform: "rotate(0deg)"
          },
          "100%": {
            transform: "rotate(360deg)"
          },
        },
        "loading-bounce": {
          "0%, 80%, 100%": {
            transform: "translateY(0)"
          },
          "40%": {
            transform: "translateY(-10px)"
          },
        },
        // Progress animations
        "progress-fill": {
          "0%": {
            transform: "translateX(-100%)"
          },
          "100%": {
            transform: "translateX(0)"
          },
        },
        // Success/Error feedback
        "success-check": {
          "0%": {
            strokeDasharray: "50",
            strokeDashoffset: "50",
            opacity: "0"
          },
          "50%": {
            strokeDasharray: "50",
            strokeDashoffset: "0",
            opacity: "1"
          },
          "100%": {
            strokeDasharray: "50",
            strokeDashoffset: "0",
            opacity: "1"
          },
        },
        "error-shake": {
          "0%, 100%": {
            transform: "translateX(0)"
          },
          "25%": {
            transform: "translateX(-4px)"
          },
          "75%": {
            transform: "translateX(4px)"
          },
        },
        // Page transitions
        "page-slide-in": {
          "0%": {
            transform: "translateX(100%)",
            opacity: "0"
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1"
          },
        },
        "page-fade-in": {
          "0%": {
            opacity: "0"
          },
          "100%": {
            opacity: "1"
          },
        },
        // Number counting
        "number-count": {
          "0%": {
            opacity: "0.3"
          },
          "100%": {
            opacity: "1"
          },
        },
        // Focus and attention
        "focus-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.5)"
          },
          "50%": {
            boxShadow: "0 0 0 8px rgba(59, 130, 246, 0.15)"
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 150ms ease-out",
        "accordion-up": "accordion-up 150ms ease-out",
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-in-up": "slideInUp 0.6s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
        "float": "float 3s ease-in-out infinite",
        // Button interactions
        "button-press": "button-press 150ms ease-out",
        "button-hover": "button-hover 200ms ease-out",
        "button-press-instant": "button-press 75ms ease-out",
        // Card interactions
        "card-hover": "card-hover 300ms ease-out",
        // Loading animations
        "loading-pulse": "loading-pulse 1.5s ease-in-out infinite",
        "loading-spin": "loading-spin 1s linear infinite",
        "loading-bounce": "loading-bounce 1s infinite",
        // Progress animations
        "progress-fill": "progress-fill 1s ease-out forwards",
        // Success/Error feedback
        "success-check": "success-check 0.6s ease-out forwards",
        "error-shake": "error-shake 0.5s ease-in-out",
        // Page transitions
        "page-slide-in": "page-slide-in 0.3s ease-out",
        "page-fade-in": "page-fade-in 0.3s ease-out",
        // Number counting
        "number-count": "number-count 2s ease-out forwards",
        // Focus and attention
        "focus-pulse": "focus-pulse 2s ease-in-out infinite",
        // Reduced motion utilities
        "none": "none",
        "auto": "auto",
      },
      transitionDuration: {
        "DEFAULT": "150ms",
        "150": "150ms",
        "200": "200ms",
        "300": "300ms",
        "500": "500ms",
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    function ({
      addVariant,
      addUtilities,
    }: {
      addVariant: (name: string, rule: string) => void;
      addUtilities: (utilities: Record<string, Record<string, string>>) => void;
    }) {
      // Add reduced-motion variants
      addVariant('motion-safe', '@media (prefers-reduced-motion: no-preference)');
      addVariant('motion-reduce', '@media (prefers-reduced-motion: reduce)');

      // Add utilities for reduced motion
      addUtilities({
        '.animate-none': {
          'animation': 'none',
        },
        '.transition-none': {
          'transition': 'none',
        },
      });
    },
    function ({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
      const newUtilities = {
        // Icon sizing utilities
        '.icon-xs': {
          'height': '0.75rem',
          'width': '0.75rem',
        },
        '.icon-sm': {
          'height': '1rem',
          'width': '1rem',
        },
        '.icon-md': {
          'height': '1.25rem',
          'width': '1.25rem',
        },
        '.icon-lg': {
          'height': '1.5rem',
          'width': '1.5rem',
        },
        '.icon-xl': {
          'height': '1.75rem',
          'width': '1.75rem',
        },

        // Icon spacing utilities for specific components
        '.icon-inline': {
          'pointer-events': 'none',
          'width': '1rem',
          'height': '1rem',
          'flex-shrink': '0',
        },
        '.icon-button': {
          'pointer-events': 'none',
          'width': '1rem',
          'height': '1rem',
          'flex-shrink': '0',
        },
        '.icon-sidebar': {
          'pointer-events': 'none',
          'width': '1rem',
          'height': '1rem',
          'flex-shrink': '0',
        },
        '.icon-command': {
          'height': '1.25rem',
          'width': '1.25rem',
          'color': 'hsl(var(--muted-foreground))',
        },

        // Component-specific utilities
        '.sidebar-trigger': {
          'width': '1rem',
          'height': '1rem',
          'flex-shrink': '0',
        },
        '.sidebar-button': {
          'width': '1rem',
          'height': '1rem',
          'flex-shrink': '0',
        },
        '.table-icon': {
          'height': '0.625rem',
          'width': '0.625rem',
          'color': 'hsl(var(--muted-foreground))',
        },
        '.chart-icon': {
          'height': '0.75rem',
          'width': '0.75rem',
          'color': 'hsl(var(--muted-foreground))',
        },

        // Trading-specific color utilities
        '.trading-buy': {
          'color': 'hsl(var(--buy))',
        },
        '.trading-sell': {
          'color': 'hsl(var(--sell))',
        },
        '.trading-profit': {
          'color': 'hsl(var(--profit))',
        },
        '.trading-loss': {
          'color': 'hsl(var(--loss))',
        },
        '.bg-trading-buy': {
          'background-color': 'hsl(var(--buy))',
        },
        '.bg-trading-sell': {
          'background-color': 'hsl(var(--sell))',
        },
        '.border-trading-buy': {
          'border-color': 'hsl(var(--buy))',
        },
        '.border-trading-sell': {
          'border-color': 'hsl(var(--sell))',
        },
        '.ring-trading-buy': {
          'box-shadow': '0 0 0 3px hsl(var(--buy) / 0.1)',
        },
        '.ring-trading-sell': {
          'box-shadow': '0 0 0 3px hsl(var(--sell) / 0.1)',
        },

        // Panel-specific utilities
        '.panel': {
          'background-color': 'hsl(var(--panel-bg))',
          'border-color': 'hsl(var(--panel-border))',
        },
        '.bg-panel': {
          'background-color': 'hsl(var(--panel-bg))',
        },
        '.border-panel': {
          'border-color': 'hsl(var(--panel-border))',
        },
        '.panel-header': {
          'background-color': 'hsl(var(--panel-bg))',
          'border-bottom': '1px solid hsl(var(--panel-border))',
        },
        '.panel-content': {
          'background-color': 'hsl(var(--panel-bg))',
        },
        '.panel-footer': {
          'background-color': 'hsl(var(--panel-bg))',
          'border-top': '1px solid hsl(var(--panel-border))',
        },

        // Gradient utilities
        '.gradient-primary': {
          'background': 'var(--gradient-primary)',
        },
        '.gradient-hero': {
          'background': 'var(--gradient-hero)',
        },
        '.gradient-buy': {
          'background': 'var(--gradient-buy)',
        },
        '.gradient-sell': {
          'background': 'var(--gradient-sell)',
        },
        '.gradient-card': {
          'background': 'var(--gradient-card)',
        },
        '.bg-gradient-primary': {
          'background': 'var(--gradient-primary)',
        },
        '.bg-gradient-hero': {
          'background': 'var(--gradient-hero)',
        },
        '.bg-gradient-buy': {
          'background': 'var(--gradient-buy)',
        },
        '.bg-gradient-sell': {
          'background': 'var(--gradient-sell)',
        },
        '.bg-gradient-card': {
          'background': 'var(--gradient-card)',
        },
      };

      addUtilities(newUtilities);
    },
  ],
};

export default config;
