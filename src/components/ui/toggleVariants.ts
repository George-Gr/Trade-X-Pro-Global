import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

export const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md h-10 px-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:bg-muted disabled:pointer-events-none disabled:cursor-not-allowed data-[state=on]:bg-accent text-sm font-medium transition-colors hover:text-muted-foreground focus-visible:ring-ring disabled:opacity-40 data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export default toggleVariants;
