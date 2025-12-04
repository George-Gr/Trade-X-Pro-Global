import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md gap-2 ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed icon-button text-sm font-semibold tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] shadow-sm hover:shadow-md hover:shadow-primary/20",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98] shadow-sm hover:shadow-md hover:shadow-destructive/20",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98] shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
        
        // Trading specific variants
        buy: "bg-buy text-buy-foreground hover:bg-buy-hover active:scale-[0.98] shadow-sm hover:shadow-md hover:shadow-buy/20",
        sell: "bg-sell text-sell-foreground hover:bg-sell-hover active:scale-[0.98] shadow-sm hover:shadow-md hover:shadow-sell/20",
        
        // Premium variants
        premium: "bg-gradient-to-r from-gold to-yellow-500 text-black font-bold hover:brightness-110 active:scale-[0.98] shadow-md hover:shadow-lg hover:shadow-gold/20 border border-yellow-400/50",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 active:scale-[0.98]",
        
        // Status variants (mapped to semantic colors)
        success: "bg-buy text-buy-foreground hover:bg-buy-hover active:scale-[0.98] shadow-sm",
        warning: "bg-gold text-gold-foreground hover:bg-gold-hover active:scale-[0.98] shadow-sm",
      },
      size: {
        default: "h-12 px-5 py-2", // 48px - Standard touch target
        sm: "h-10 rounded-md px-3 text-xs", // 40px
        lg: "h-14 rounded-md px-8 text-base", // 56px
        icon: "h-12 w-12", // 48px square
        xl: "h-16 rounded-md px-10 text-lg", // 64px
        xs: "h-8 rounded-sm px-2 text-[10px]", // 32px (Dense UI only)
      },
      animation: {
        none: "",
        subtle: "transition-transform duration-200",
        bouncy: "active:scale-95 transition-transform duration-150",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "subtle",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & {
  asChild?: boolean;
  loading?: boolean;
};

export default buttonVariants;
