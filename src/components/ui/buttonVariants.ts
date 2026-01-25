import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md gap-2 ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed icon-button text-sm font-medium hover:shadow-lg active:shadow-md',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/95 active:bg-primary/90 active:scale-[0.98] hover:translate-y-[-1px] shadow-sm hover:shadow-md',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/95 active:bg-destructive/90 active:scale-[0.98] hover:translate-y-[-1px] shadow-sm hover:shadow-md',
        outline:
          'border border-input bg-background hover:bg-accent/5 hover:text-accent-foreground active:bg-accent/10 active:scale-[0.98] hover:translate-y-[-1px] shadow-sm hover:shadow-md',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80 active:scale-[0.98] hover:translate-y-[-1px] shadow-sm hover:shadow-md',
        ghost:
          'hover:bg-accent/10 active:bg-accent/20 active:scale-[0.98] hover:translate-y-[-1px] hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline active:text-primary/80 active:underline bg-transparent hover:bg-transparent',
        loading:
          'bg-primary/50 text-primary-foreground cursor-wait hover:bg-primary/50 active:scale-100',
        success:
          'bg-success text-success-foreground hover:bg-success/95 active:bg-success/90 active:scale-[0.98] hover:translate-y-[-1px] shadow-sm hover:shadow-md',
        warning:
          'bg-warning text-warning-foreground hover:bg-warning/95 active:bg-warning/90 active:scale-[0.98] hover:translate-y-[-1px] shadow-sm hover:shadow-md',
      },
      size: {
        xs: 'h-8 px-3 text-xs min-h-[32px]', // 32px height, 12px horizontal padding
        sm: 'h-10 px-4 text-sm min-h-[40px] md:min-h-[44px]', // 40px mobile, 44px desktop (touch target)
        default: 'h-12 px-5 text-base min-h-[44px]', // 48px height, 20px horizontal padding, 44px minimum
        lg: 'h-14 px-6 text-base md:text-lg min-h-[44px] md:min-h-[48px]', // 56px height, 24px horizontal padding
        icon: 'h-12 w-12 min-h-[44px] min-w-[44px]', // 44x44px minimum for touch targets
        xl: 'h-16 px-8 text-lg min-h-[48px] md:min-h-[52px]', // 64px height, 32px horizontal padding
      },
      animation: {
        none: '',
        subtle:
          'hover:animate-button-hover active:animate-button-press-instant',
        bouncy: 'hover:animate-button-hover active:animate-button-press',
        immediate: 'active:animate-button-press-instant',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'subtle',
    },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild: boolean | undefined;
    loading: boolean | undefined;
  };

export default buttonVariants;
