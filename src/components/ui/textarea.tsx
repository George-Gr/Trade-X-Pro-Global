import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex w-full rounded-md border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-input bg-input hover:border-primary/50 transition-colors duration-200 placeholder:text-placeholder-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted read-only:bg-muted/50 read-only:cursor-default read-only:focus:ring-0 read-only:focus-visible:ring-0",
  {
    variants: {
      size: {
        sm: "min-h-16 px-3 py-2 text-sm",
        default: "min-h-20 px-3 py-2.5 text-sm",
        lg: "min-h-24 px-4 py-3 text-base",
        mobile: "min-h-24 px-4 py-3 text-sm md:text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  VariantProps<typeof textareaVariants> {
  mobileOptimized?: boolean;
  autoResize?: boolean;
  maxRows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, mobileOptimized, autoResize, maxRows, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Auto-resize functionality for mobile
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;

        if (maxRows) {
          const rowHeight = 24; // Approximate height per row
          const maxHeight = rowHeight * maxRows;
          textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
        } else {
          textarea.style.height = `${scrollHeight}px`;
        }
      }
    }, [autoResize, maxRows, props.value]);

    return (
      <textarea
        ref={autoResize ? textareaRef : ref}
        className={cn(
          textareaVariants({ size: mobileOptimized ? 'mobile' : size }),
          className,
          mobileOptimized && "mobile-optimized-textarea",
          autoResize && "auto-resize-textarea"
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
