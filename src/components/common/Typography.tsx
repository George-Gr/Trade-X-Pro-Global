import * as React from 'react';
import { cn } from '@/lib/utils';
import type { FONT_SIZES } from '@/constants/typography';

/**
 * Typography component for consistent text rendering
 * Provides semantic HTML elements with proper styling
 */

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'body' | 'bodyMedium' | 'small' | 'caption' | 'mono' | 'monoSmall';

interface TypographyProps {
    variant?: TypographyVariant;
    className?: string;
    children: React.ReactNode;
    as?: React.ElementType;
    id?: string;
    role?: string;
    ariaLabel?: string;
}

const variantStyles: Record<TypographyVariant, string> = {
    h1: 'text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white',
    h2: 'text-3xl md:text-4xl font-semibold leading-snug tracking-tight text-white',
    h3: 'text-2xl md:text-3xl font-semibold leading-normal text-white',
    h4: 'text-xl md:text-2xl font-semibold leading-normal text-white',
    h5: 'text-base font-semibold leading-relaxed text-white',
    body: 'text-base font-normal leading-relaxed text-white',
    bodyMedium: 'text-base font-medium leading-relaxed text-white',
    small: 'text-sm font-normal leading-relaxed text-silver-gray',
    caption: 'text-xs font-medium leading-snug tracking-wider text-silver-gray',
    mono: 'font-mono text-sm font-medium tabular-nums text-white',
    monoSmall: 'font-mono text-xs font-medium tabular-nums text-silver-gray',
};

const elementMapping: Record<TypographyVariant, string> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    body: 'p',
    bodyMedium: 'p',
    small: 'p',
    caption: 'small',
    mono: 'code',
    monoSmall: 'code',
};

/**
 * Semantic typography component
 *
 * @example
 * <Typography variant="h1">Page Title</Typography>
 * <Typography variant="body">Body text content</Typography>
 * <Typography variant="mono">Code or numeric data</Typography>
 */
export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
    (
        {
            variant = 'body',
            className,
            children,
            as,
            id,
            role,
            ariaLabel,
        },
        ref
    ) => {
        const Component = as || elementMapping[variant];

        return (
            <Component
                ref={ref}
                className={cn(variantStyles[variant], className)}
                id={id}
                role={role}
                aria-label={ariaLabel}
            >
                {children}
            </Component>
        );
    }
);

Typography.displayName = 'Typography';

// ============================================================================
// SEMANTIC TYPOGRAPHY COMPONENTS
// ============================================================================

/**
 * Heading components with proper semantic HTML
 */

export const H1 = React.forwardRef<
    HTMLHeadingElement,
    Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography {...props} ref={ref} variant="h1" as="h1" />);
H1.displayName = 'H1';

export const H2 = React.forwardRef<
    HTMLHeadingElement,
    Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography {...props} ref={ref} variant="h2" as="h2" />);
H2.displayName = 'H2';

export const H3 = React.forwardRef<
    HTMLHeadingElement,
    Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography {...props} ref={ref} variant="h3" as="h3" />);
H3.displayName = 'H3';

export const H4 = React.forwardRef<
    HTMLHeadingElement,
    Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography {...props} ref={ref} variant="h4" as="h4" />);
H4.displayName = 'H4';

export const H5 = React.forwardRef<
    HTMLHeadingElement,
    Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography {...props} ref={ref} variant="h5" as="h5" />);
H5.displayName = 'H5';

/**
 * Body text components
 */

export const Body = React.forwardRef<
    HTMLParagraphElement,
    Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography {...props} ref={ref} variant="body" as="p" />);
Body.displayName = 'Body';

export const BodyMedium = React.forwardRef<
    HTMLParagraphElement,
    Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography {...props} ref={ref} variant="bodyMedium" as="p" />);
BodyMedium.displayName = 'BodyMedium';

export const Small = React.forwardRef<
    HTMLParagraphElement,
    Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography {...props} ref={ref} variant="small" as="p" />);
Small.displayName = 'Small';

export const Caption = React.forwardRef<
    HTMLElement,
    Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography {...props} ref={ref} variant="caption" as="small" />);
Caption.displayName = 'Caption';

/**
 * Monospace text components for data and prices
 */

export const Mono = React.forwardRef<
    HTMLElement,
    Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography {...props} ref={ref} variant="mono" as="code" />);
Mono.displayName = 'Mono';

export const MonoSmall = React.forwardRef<
    HTMLElement,
    Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography {...props} ref={ref} variant="monoSmall" as="code" />);
MonoSmall.displayName = 'MonoSmall';

// ============================================================================
// TRADING-SPECIFIC TYPOGRAPHY COMPONENTS
// ============================================================================

interface PriceProps {
    value: string | number;
    isProfit?: boolean;
    isLarge?: boolean;
    className?: string;
}

/**
 * Price display component with appropriate styling and tabular numbers
 */
export const Price = React.forwardRef<HTMLElement, PriceProps>(
    ({ value, isProfit, isLarge = false, className }, ref) => {
        return (
            <Mono
                ref={ref}
                className={cn(
                    isLarge && 'text-2xl md:text-3xl',
                    isProfit ? 'text-emerald-green' : 'text-crimson-red',
                    'font-bold',
                    className
                )}
            >
                {value}
            </Mono>
        );
    }
);
Price.displayName = 'Price';

/**
 * Symbol component for trading pairs/assets
 */
export const Symbol = React.forwardRef<HTMLSpanElement, { symbol: string; className?: string }>(
    ({ symbol, className }, ref) => (
        <span
            ref={ref}
            className={cn(
                'text-sm font-semibold leading-tight tracking-wide text-white uppercase',
                className
            )}
        >
            {symbol}
        </span>
    )
);
Symbol.displayName = 'Symbol';

/**
 * Change percentage component with directional coloring
 */
export const ChangePercent = React.forwardRef<
    HTMLElement,
    { value: string | number; className?: string }
>(({ value, className }, ref) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const isPositive = numValue >= 0;

    return (
        <Mono
            ref={ref}
            className={cn(
                isPositive ? 'text-emerald-green' : 'text-crimson-red',
                'font-semibold',
                className
            )}
        >
            {isPositive ? '+' : ''}{value}%
        </Mono>
    );
});
ChangePercent.displayName = 'ChangePercent';
