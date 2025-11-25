import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md gap-2 ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed icon-button text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85 active:scale-95",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/85 active:scale-95",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/50 active:text-accent-foreground/80",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 active:scale-95",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/50 active:text-accent-foreground/80",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80 active:underline",
      },
      size: {
        xs: "h-8 px-2 text-xs",               // 32px height
        sm: "h-10 px-3 text-sm",              // 40px height
        default: "h-12 px-4 text-base",       // 48px height
        lg: "h-14 px-6 text-base",            // 56px height
        icon: "h-12 w-12",                    // 48px height (square)
        xl: "h-16 px-8 text-lg",              // 64px height
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & {
  asChild?: boolean;
};

export default buttonVariants;
