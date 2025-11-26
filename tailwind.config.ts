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
      },
      animation: {
        "accordion-down": "accordion-down 150ms ease-out",
        "accordion-up": "accordion-up 150ms ease-out",
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-in-up": "slideInUp 0.6s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
        "float": "float 3s ease-in-out infinite",
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
  // Define Tailwind plugin for trading color utilities
  corePlugins: {
    // Ensure we don't override custom utilities
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
