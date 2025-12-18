import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // Neo-Digital Premium Typography System
        // Display: Sora - geometric, modern, bold for headlines
        display: ["Sora", "ui-sans-serif", "system-ui", "sans-serif"],
        // Body: Space Grotesk - humanist grotesque, excellent readability
        sans: [
          "Space Grotesk",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        // Data/Mono: JetBrains Mono - for prices, numbers, code
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Consolas",
          "Monaco",
          "monospace",
        ],
      },

      /* === 8-POINT GRID SPACING SYSTEM === */
      spacing: {
        xs: "4px", // 4px
        sm: "8px", // 8px
        md: "12px", // 12px
        base: "16px", // 16px
        lg: "24px", // 24px
        xl: "32px", // 32px
        "2xl": "48px", // 48px
        "3xl": "56px", // 56px
        "4xl": "64px", // 64px
        "5xl": "80px", // 80px
        "6xl": "96px", // 96px
      },

      colors: {
        border: "hsl(var(--border))",
        "border-subtle": "hsl(var(--border-subtle))",
        "border-glow": "hsl(var(--border-glow))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        "background-surface": "hsl(var(--background-surface))",
        "background-elevated": "hsl(var(--background-elevated))",
        foreground: "hsl(var(--foreground))",
        "foreground-secondary": "hsl(var(--foreground-secondary))",
        "foreground-tertiary": "hsl(var(--foreground-tertiary))",
        "foreground-muted": "hsl(var(--foreground-muted))",
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
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

      /* === BORDER RADIUS === */
      borderRadius: {
        lg: "var(--radius)", // 8px
        md: "calc(var(--radius) - 2px)", // 6px
        sm: "calc(var(--radius) - 4px)", // 4px
        xl: "calc(var(--radius) + 4px)", // 12px
        "2xl": "calc(var(--radius) + 8px)", // 16px
        "3xl": "calc(var(--radius) + 16px)", // 24px
      },

      /* === TYPOGRAPHY SCALE === */
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }], // 10px
        xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
        sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
        base: ["1rem", { lineHeight: "1.5rem" }], // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
        xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
        "5xl": ["3rem", { lineHeight: "1.15" }], // 48px
        "6xl": ["3.75rem", { lineHeight: "1.1" }], // 60px
        "7xl": ["4.5rem", { lineHeight: "1.1" }], // 72px
        "8xl": ["6rem", { lineHeight: "1" }], // 96px
      },

      /* === LETTER SPACING === */
      letterSpacing: {
        tighter: "-0.02em",
        tight: "-0.01em",
        normal: "0",
        wide: "0.01em",
        wider: "0.02em",
      },

      /* === LINE HEIGHT === */
      lineHeight: {
        tight: "1.1",
        snug: "1.2",
        normal: "1.5",
        relaxed: "1.6",
        loose: "1.7",
      },

      /* === BOX SHADOWS (Elevation System) === */
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        glow: "var(--shadow-glow)",
        "glow-sm": "var(--shadow-glow-sm)",
        "glow-lg": "var(--shadow-glow-lg)",
        "inner-glow": "inset 0 1px 0 hsl(0 0% 100% / 0.1)",
      },

      /* === BACKGROUND IMAGE === */
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-pattern":
          "linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--secondary) / 0.15) 100%)",
        "pattern-grid":
          "linear-gradient(hsl(var(--primary) / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.05) 1px, transparent 1px)",
        "pattern-dots":
          "radial-gradient(circle, hsl(var(--primary) / 0.1) 1px, transparent 1px)",
      },

      /* === BACKDROP BLUR === */
      backdropBlur: {
        xs: "2px",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.4)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--primary) / 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "hsl(var(--primary) / 0.3)" },
          "50%": { borderColor: "hsl(var(--primary) / 0.6)" },
        },
        "button-press": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.98)" },
          "100%": { transform: "scale(1)" },
        },
        "button-hover": {
          "0%": { transform: "translateY(0) scale(1)" },
          "100%": { transform: "translateY(-2px) scale(1.01)" },
        },
        "card-hover": {
          "0%": { transform: "translateY(0) scale(1)" },
          "100%": { transform: "translateY(-4px) scale(1.02)" },
        },
        "loading-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "loading-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "number-count": {
          "0%": { opacity: "0.3" },
          "100%": { opacity: "1" },
        },
        "focus-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0.5)" },
          "50%": { boxShadow: "0 0 0 8px hsl(var(--primary) / 0.15)" },
        },
        "text-shimmer": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 150ms ease-out",
        "accordion-up": "accordion-up 150ms ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "slide-in-right": "slide-in-right 0.5s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        "border-glow": "border-glow 2s ease-in-out infinite",
        "button-press": "button-press 150ms ease-out",
        "button-hover": "button-hover 200ms ease-out",
        "card-hover": "card-hover 300ms ease-out",
        "loading-pulse": "loading-pulse 1.5s ease-in-out infinite",
        "loading-spin": "loading-spin 1s linear infinite",
        "number-count": "number-count 2s ease-out forwards",
        "focus-pulse": "focus-pulse 2s ease-in-out infinite",
        "text-shimmer": "text-shimmer 3s ease-in-out infinite",
      },
      transitionDuration: {
        DEFAULT: "200ms",
        "150": "150ms",
        "200": "200ms",
        "300": "300ms",
        "400": "400ms",
        "500": "500ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
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
      addVariant(
        "motion-safe",
        "@media (prefers-reduced-motion: no-preference)",
      );
      addVariant("motion-reduce", "@media (prefers-reduced-motion: reduce)");

      addUtilities({
        ".animate-none": { animation: "none" },
        ".transition-none": { transition: "none" },
      });
    },
    function ({
      addUtilities,
    }: {
      addUtilities: (utilities: Record<string, Record<string, string>>) => void;
    }) {
      const newUtilities = {
        // Glass morphism utilities
        ".glass": {
          background: "hsl(var(--card) / 0.8)",
          "backdrop-filter": "blur(12px)",
          "-webkit-backdrop-filter": "blur(12px)",
          border: "1px solid hsl(var(--border) / 0.5)",
        },
        ".glass-card": {
          background: "hsl(var(--card) / 0.8)",
          "backdrop-filter": "blur(10px)",
          "-webkit-backdrop-filter": "blur(10px)",
          border: "1px solid hsl(var(--primary) / 0.2)",
          "box-shadow":
            "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.1)",
        },

        // Pattern overlays
        ".pattern-grid": {
          "background-image":
            "linear-gradient(hsl(var(--primary) / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.05) 1px, transparent 1px)",
          "background-size": "50px 50px",
        },
        ".pattern-dots": {
          "background-image":
            "radial-gradient(circle, hsl(var(--primary) / 0.1) 1px, transparent 1px)",
          "background-size": "30px 30px",
        },
        ".pattern-mesh": {
          background:
            "radial-gradient(ellipse at top left, hsl(var(--primary) / 0.15), transparent 50%), radial-gradient(ellipse at bottom right, hsl(var(--secondary) / 0.15), transparent 50%)",
        },

        // Glow effects
        ".glow": { "box-shadow": "var(--shadow-glow)" },
        ".glow-sm": { "box-shadow": "var(--shadow-glow-sm)" },
        ".glow-lg": { "box-shadow": "var(--shadow-glow-lg)" },
        ".glow-text": { "text-shadow": "0 0 20px hsl(var(--primary) / 0.5)" },

        // Gradient utilities
        ".gradient-primary": { background: "var(--gradient-primary)" },
        ".gradient-hero": { background: "var(--gradient-hero)" },
        ".gradient-gold": { background: "var(--gradient-gold)" },
        ".gradient-card": { background: "var(--gradient-card)" },
        ".bg-gradient-primary": { background: "var(--gradient-primary)" },
        ".bg-gradient-hero": { background: "var(--gradient-hero)" },
        ".bg-gradient-gold": { background: "var(--gradient-gold)" },
        ".bg-gradient-card": { background: "var(--gradient-card)" },

        // Section spacing
        ".section-padding": { "padding-top": "5rem", "padding-bottom": "5rem" },
        ".section-padding-lg": {
          "padding-top": "6rem",
          "padding-bottom": "6rem",
        },

        // Container utilities
        ".container-wide": {
          "max-width": "1440px",
          "margin-left": "auto",
          "margin-right": "auto",
          "padding-left": "1rem",
          "padding-right": "1rem",
        },
        ".container-default": {
          "max-width": "1280px",
          "margin-left": "auto",
          "margin-right": "auto",
          "padding-left": "1rem",
          "padding-right": "1rem",
        },
        ".container-narrow": {
          "max-width": "1024px",
          "margin-left": "auto",
          "margin-right": "auto",
          "padding-left": "1rem",
          "padding-right": "1rem",
        },

        // Hover effects
        ".hover-lift": { transition: "transform 200ms ease" },
        ".hover-scale": { transition: "transform 200ms ease" },
        ".hover-glow": { transition: "box-shadow 200ms ease" },

        // Card interactions
        ".card-hover": { transition: "all 200ms ease" },
        ".card-glow-hover": { transition: "all 200ms ease" },

        // Button enhancements
        ".btn-lift": { transition: "all 200ms ease" },
        ".btn-glow": { position: "relative", overflow: "hidden" },

        // Link underline animation
        ".link-underline": { position: "relative", "text-decoration": "none" },

        // Icon sizing utilities
        ".icon-xs": { height: "0.75rem", width: "0.75rem" },
        ".icon-sm": { height: "1rem", width: "1rem" },
        ".icon-md": { height: "1.25rem", width: "1.25rem" },
        ".icon-lg": { height: "1.5rem", width: "1.5rem" },
        ".icon-xl": { height: "1.75rem", width: "1.75rem" },

        // Trading-specific utilities
        ".trading-buy": { color: "hsl(var(--buy))" },
        ".trading-sell": { color: "hsl(var(--sell))" },
        ".trading-profit": { color: "hsl(var(--profit))" },
        ".trading-loss": { color: "hsl(var(--loss))" },
        ".bg-trading-buy": { "background-color": "hsl(var(--buy))" },
        ".bg-trading-sell": { "background-color": "hsl(var(--sell))" },

        // Panel utilities
        ".panel": {
          "background-color": "hsl(var(--panel-bg))",
          "border-color": "hsl(var(--panel-border))",
        },
        ".bg-panel": { "background-color": "hsl(var(--panel-bg))" },
        ".border-panel": { "border-color": "hsl(var(--panel-border))" },

        // Typography display
        ".text-display": {
          "font-size": "clamp(2.25rem, 5vw, 4.5rem)",
          "font-weight": "700",
          "line-height": "1.1",
          "letter-spacing": "-0.02em",
        },
        ".text-headline": {
          "font-size": "clamp(1.875rem, 4vw, 3rem)",
          "font-weight": "700",
          "line-height": "1.15",
          "letter-spacing": "-0.015em",
        },
        ".text-title": {
          "font-size": "clamp(1.5rem, 3vw, 2.25rem)",
          "font-weight": "600",
          "line-height": "1.2",
          "letter-spacing": "-0.01em",
        },
        ".text-data": {
          "font-family": "var(--font-mono)",
          "font-variant-numeric": "tabular-nums",
        },

        // Accessible focus ring utility
        ".focus-ring": {
          outline: "3px solid hsl(var(--focus-color))",
          "outline-offset": "2px",
          "box-shadow":
            "0 0 0 6px hsl(var(--focus-ring-color) / 0.3), 0 0 0 8px hsl(var(--focus-ring-color) / 0.2)",
        },
      };

      addUtilities(newUtilities);
    },
  ],
};

export default config;
