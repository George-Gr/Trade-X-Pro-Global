import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed icon-button",
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
        default: "h-11 px-4 py-2",        // Increased from h-10 to h-11 (44px)
        sm: "h-10 rounded-md px-3",       // Increased from h-9 to h-10 (40px)
        lg: "h-12 rounded-md px-8",       // Increased from h-11 to h-12 (48px)
        icon: "h-12 w-12",               // Increased from h-10 w-10 to h-12 w-12 (48px)
        xl: "h-14 px-10",                // NEW - extra large (56px)
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
