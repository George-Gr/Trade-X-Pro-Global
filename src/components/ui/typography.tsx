import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Typography Scale for TradePro
 *
 * Hierarchy levels (defined in src/styles/typography.css):
 * H1 (32px, weight 700): Page titles, major sections
 * H2 (24px, weight 600): Main section headers
 * H3 (18px, weight 600): Card titles, feature titles
 * H4 (16px, weight 600): Subsection headers, form sections
 * Body (14px, weight 400): Default body text
 * Small (12px, weight 400): Secondary text, labels
 * Caption (12px, weight 500): Metadata, timestamps
 */

/**
 * Page Title (H1) - 32px, bold
 * Use for: Main page titles, dashboard headers
 */
export const H1 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn("typography-h1 tracking-tight", className)}
    {...props}
  />
));
H1.displayName = "H1";

/**
 * Section Title (H2) - 24px, semibold
 * Use for: Main section headers, major feature titles
 */
export const H2 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("typography-h2 tracking-tight", className)}
    {...props}
  />
));
H2.displayName = "H2";

/**
 * Card Title (H3) - 18px, semibold
 * Use for: Card titles, subsection headers, component section titles
 */
export const H3 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("typography-h3", className)} {...props} />
));
H3.displayName = "H3";

/**
 * Subsection Title (H4) - 16px, semibold
 * Use for: Subsection headers, form section titles, component headers
 */
export const H4 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h4 ref={ref} className={cn("typography-h4", className)} {...props} />
));
H4.displayName = "H4";

/**
 * Large Body Text - base (14px), normal
 * Use for: Regular paragraph text, descriptions
 */
export const BodyLarge = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("typography-body leading-relaxed", className)}
    {...props}
  />
));
BodyLarge.displayName = "BodyLarge";

/**
 * Body Text (default) - 14px, normal
 * Use for: Regular text, labels, form text
 */
export const Body = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("typography-body leading-relaxed", className)}
    {...props}
  />
));
Body.displayName = "Body";

/**
 * Small Body Text - 12px, normal
 * Use for: Captions, metadata, helper text
 */
export const BodySmall = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "typography-small leading-relaxed text-muted-foreground",
      className,
    )}
    {...props}
  />
));
BodySmall.displayName = "BodySmall";

/**
 * Label Text - 14px, medium
 * Use for: Form labels, field names
 */
export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("typography-label", className)} {...props} />
));
Label.displayName = "Label";

/**
 * Caption Text - 12px, medium
 * Use for: Timestamps, small metadata
 */
export const Caption = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("typography-caption text-muted-foreground", className)}
    {...props}
  />
));
Caption.displayName = "Caption";

// Export all components
export { H1 as Heading1, H2 as Heading2, H3 as Heading3, H4 as Heading4 };
