import * as React from "react";
import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";
import buttonVariants from "./buttonVariants";
import { VariantProps } from "class-variance-authority";

export interface LinkProps
  extends Omit<RouterLinkProps, "to">,
    Omit<VariantProps<typeof buttonVariants>, "variant"> {
  to: string;
  external?: boolean;
  className?: string;
}

/**
 * Consistent Link component with button-like styling
 * Uses button variant="link" for consistent styling across the app
 * 
 * Usage:
 * <Link to="/path">Internal Link</Link>
 * <Link to="https://example.com" external>External Link</Link>
 */
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, to, external = false, size, children, ...props }, ref) => {
    if (external) {
      return (
        <a
          href={to}
          className={cn(buttonVariants({ variant: "link", size, className }))}
          target="_blank"
          rel="noopener noreferrer"
          ref={ref}
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <RouterLink
        to={to}
        className={cn(buttonVariants({ variant: "link", size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </RouterLink>
    );
  }
);

Link.displayName = "Link";

export { Link };
