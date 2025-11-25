import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-md border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-input bg-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-placeholder-foreground disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted read-only:bg-muted/50 read-only:cursor-default read-only:focus:ring-0 read-only:focus-visible:ring-0",
  {
    variants: {
      size: {
        sm: "h-9 px-3 py-2 text-sm",
        default: "h-10 px-3 py-2.5 text-base md:text-sm",
        lg: "h-11 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  description?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, label, error, description, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ size }), className)}
        ref={ref}
        aria-label={label}
        aria-describedby={description ? `${props.id}-description` : undefined}
        aria-invalid={!!error}
        aria-errormessage={error ? `${props.id}-error` : undefined}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
