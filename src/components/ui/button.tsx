import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { memo } from "react";

import { cn } from "@/lib/utils";
import buttonVariants, { ButtonProps } from "./buttonVariants";

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, "aria-label": ariaLabel, "aria-pressed": ariaPressed, "aria-expanded": ariaExpanded, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        aria-expanded={ariaExpanded}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
export { Button };
