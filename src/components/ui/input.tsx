import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 border-input bg-background px-3 py-2.5 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-placeholder-foreground disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted read-only:bg-muted/50 read-only:cursor-default read-only:focus:ring-0 read-only:focus-visible:ring-0 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
