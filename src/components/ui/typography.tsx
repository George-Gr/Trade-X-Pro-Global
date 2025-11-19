import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Typography Scale for TradePro
 * 
 * Hierarchy levels:
 * H1 (text-3xl, font-bold): Page titles, major sections
 * H2 (text-2xl, font-semibold): Main section headers
 * H3 (text-xl, font-semibold): Subsection headers, feature titles
 * H4 (text-lg, font-semibold): Card titles, form sections
 * Body (text-base): Default body text
 * Body Small (text-sm): Secondary text, labels
 * Caption (text-xs): Metadata, timestamps
 */

/**
 * Page Title (H1) - 3xl, bold
 * Use for: Main page titles, dashboard headers
 */
export const H1 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn("text-3xl font-bold leading-tight tracking-tight", className)}
    {...props}
  />
));
H1.displayName = "H1";

/**
 * Section Title (H2) - 2xl, semibold
 * Use for: Main section headers, major feature titles
 */
export const H2 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-2xl font-semibold leading-tight tracking-tight", className)}
    {...props}
  />
));
H2.displayName = "H2";

/**
 * Subsection Title (H3) - xl, semibold
 * Use for: Subsection headers, component section titles
 */
export const H3 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-semibold leading-snug", className)}
    {...props}
  />
));
H3.displayName = "H3";

/**
 * Card Title (H4) - lg, semibold
 * Use for: Card titles, form section titles, component headers
 */
export const H4 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn("text-lg font-semibold leading-snug", className)}
    {...props}
  />
));
H4.displayName = "H4";

/**
 * Large Body Text - base, normal
 * Use for: Regular paragraph text, descriptions
 */
export const BodyLarge = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-base font-normal leading-relaxed", className)}
    {...props}
  />
));
BodyLarge.displayName = "BodyLarge";

/**
 * Body Text (default) - sm, normal
 * Use for: Regular text, labels, form text
 */
export const Body = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm font-normal leading-relaxed", className)}
    {...props}
  />
));
Body.displayName = "Body";

/**
 * Small Body Text - xs, normal
 * Use for: Captions, metadata, helper text
 */
export const BodySmall = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs font-normal leading-relaxed text-muted-foreground", className)}
    {...props}
  />
));
BodySmall.displayName = "BodySmall";

/**
 * Label Text - sm, medium
 * Use for: Form labels, field names
 */
export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-sm font-medium leading-tight", className)}
    {...props}
  />
));
Label.displayName = "Label";

/**
 * Caption Text - xs, medium
 * Use for: Timestamps, small metadata
 */
export const Caption = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs font-medium leading-tight text-muted-foreground", className)}
    {...props}
  />
));
Caption.displayName = "Caption";

// Export all components
export {
  H1 as Heading1,
  H2 as Heading2,
  H3 as Heading3,
  H4 as Heading4,
};
