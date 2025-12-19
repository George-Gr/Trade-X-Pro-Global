import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'flex w-full rounded-md border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-input bg-background placeholder:text-placeholder-foreground disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted read-only:bg-muted/50 read-only:cursor-default read-only:focus:ring-0 read-only:focus-visible:ring-0',
  {
    variants: {
      size: {
        sm: 'min-h-[60px] px-3 py-2 text-sm',
        default: 'min-h-[80px] px-3 py-2.5 text-sm',
        lg: 'min-h-[100px] px-4 py-3 text-base',
        mobile: 'min-h-[100px] px-4 py-3 text-sm md:text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface TextareaProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  mobileOptimized?: boolean;
  autoResize?: boolean;
  maxRows?: number;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, size, mobileOptimized, autoResize, maxRows, error, ...props },
    ref
  ) => {
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
          error && 'form-field-error', // FE-012: Apply error state styling
          className,
          mobileOptimized && 'mobile-optimized-textarea',
          autoResize && 'auto-resize-textarea'
        )}
        aria-invalid={!!error}
        aria-errormessage={error ? `${props.id}-error` : undefined}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
