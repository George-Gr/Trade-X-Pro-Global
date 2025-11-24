import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
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
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        // Standard spacing scale (4px baseline)
        'xs': '4px',   // Use for minimal gaps
        'sm': '8px',   // Use for component gaps
        'md': '16px',  // Use for section gaps
        'lg': '24px',  // Use for major sections
        'xl': '32px',  // Use for page padding
        'xxl': '48px', // Use for hero sections
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
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
      },
      animation: {
        "accordion-down": "accordion-down 150ms ease-out",
        "accordion-up": "accordion-up 150ms ease-out",
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
    function ({ addUtilities }) {
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
      };
      
      addUtilities(newUtilities);
    },
  ],
};

export default config;
