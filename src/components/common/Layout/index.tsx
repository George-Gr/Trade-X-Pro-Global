import React from 'react';
import { cn } from '@/lib/utils';
import { SPACING } from '@/constants/spacing';

/**
 * Layout components that enforce the unified spacing system
 * All components use the 8px grid system
 */

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    maxWidth?: keyof typeof MAX_WIDTHS;
    fluid?: boolean;
}

const MAX_WIDTHS = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
} as const;

/**
 * Main page container with proper margins and max-width
 * Enforces 40% whitespace rule
 *
 * @example
 * <Container>
 *   <H1>Page Title</H1>
 * </Container>
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
    ({ children, className, maxWidth = '7xl', fluid = false }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'mx-auto w-full',
                    !fluid && MAX_WIDTHS[maxWidth],
                    'px-6 md:px-12', // Page margins (mobile: 24px, desktop: 48px)
                    className
                )}
            >
                {children}
            </div>
        );
    }
);
Container.displayName = 'Container';

interface SectionProps {
    children: React.ReactNode;
    className?: string;
    spacing?: 'tight' | 'normal' | 'loose';
}

/**
 * Section component with proper vertical spacing
 * Automatically enforces section gaps and whitespace
 *
 * @example
 * <Section spacing="normal">
 *   <H2>Section Title</H2>
 *   <Body>Section content</Body>
 * </Section>
 */
export const Section = React.forwardRef<HTMLElement, SectionProps>(
    ({ children, className, spacing = 'normal' }, ref) => {
        const spacingMap = {
            tight: 'py-8 md:py-12',
            normal: 'py-12 md:py-16',
            loose: 'py-16 md:py-24',
        };

        return (
            <section
                ref={ref}
                className={cn(
                    spacingMap[spacing],
                    'w-full',
                    'space-y-8 md:space-y-12', // Section internal spacing
                    className
                )}
            >
                {children}
            </section>
        );
    }
);
Section.displayName = 'Section';

interface FlexProps {
    children: React.ReactNode;
    className?: string;
    direction?: 'row' | 'col';
    gap?: 'tight' | 'normal' | 'loose';
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

/**
 * Flex layout component with consistent spacing
 * Enforces 8px grid system gaps
 *
 * @example
 * <Flex gap="normal" justify="between">
 *   <Button>Cancel</Button>
 *   <Button>Submit</Button>
 * </Flex>
 */
export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
    (
        {
            children,
            className,
            direction = 'row',
            gap = 'normal',
            align = 'center',
            justify = 'start',
        },
        ref
    ) => {
        const directionMap = {
            row: 'flex-row',
            col: 'flex-col',
        };

        const gapMap = {
            tight: 'gap-2',
            normal: 'gap-3',
            loose: 'gap-4',
        };

        const alignMap = {
            start: 'items-start',
            center: 'items-center',
            end: 'items-end',
            stretch: 'items-stretch',
        };

        const justifyMap = {
            start: 'justify-start',
            center: 'justify-center',
            end: 'justify-end',
            between: 'justify-between',
            around: 'justify-around',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'flex',
                    directionMap[direction],
                    gapMap[gap],
                    alignMap[align],
                    justifyMap[justify],
                    className
                )}
            >
                {children}
            </div>
        );
    }
);
Flex.displayName = 'Flex';

interface GridProps {
    children: React.ReactNode;
    className?: string;
    cols?: 1 | 2 | 3 | 4 | 6 | 12;
    gap?: 'tight' | 'normal' | 'loose';
}

/**
 * Grid layout component with responsive columns
 * Enforces consistent gaps
 *
 * @example
 * <Grid cols={3} gap="normal">
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Grid>
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
    ({ children, className, cols = 1, gap = 'normal' }, ref) => {
        const colsMap = {
            1: 'grid-cols-1',
            2: 'grid-cols-2',
            3: 'grid-cols-3',
            4: 'grid-cols-4',
            6: 'grid-cols-6',
            12: 'grid-cols-12',
        };

        const gapMap = {
            tight: 'gap-2',
            normal: 'gap-3',
            loose: 'gap-4',
        };

        return (
            <div
                ref={ref}
                className={cn('grid', colsMap[cols], gapMap[gap], className)}
            >
                {children}
            </div>
        );
    }
);
Grid.displayName = 'Grid';

interface StackProps {
    children: React.ReactNode;
    className?: string;
    spacing?: 'tight' | 'normal' | 'loose';
    divider?: boolean;
}

/**
 * Stack component - vertical flex with consistent spacing
 * Shortcut for common vertical layouts
 *
 * @example
 * <Stack spacing="normal">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Stack>
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
    ({ children, className, spacing = 'normal', divider = false }, ref) => {
        const spacingMap = {
            tight: 'space-y-2',
            normal: 'space-y-3',
            loose: 'space-y-4',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'flex flex-col',
                    spacingMap[spacing],
                    divider && 'divide-y divide-charcoal-gray/30',
                    className
                )}
            >
                {children}
            </div>
        );
    }
);
Stack.displayName = 'Stack';

interface PaddedBoxProps {
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Padded box component for consistent internal spacing
 * Applies consistent padding based on size
 *
 * @example
 * <PaddedBox size="md">
 *   <Body>Padded content</Body>
 * </PaddedBox>
 */
export const PaddedBox = React.forwardRef<HTMLDivElement, PaddedBoxProps>(
    ({ children, className, size = 'md' }, ref) => {
        const sizeMap = {
            sm: 'p-2', // 8px padding
            md: 'p-3', // 16px padding
            lg: 'p-4', // 24px padding
        };

        return (
            <div ref={ref} className={cn(sizeMap[size], className)}>
                {children}
            </div>
        );
    }
);
PaddedBox.displayName = 'PaddedBox';

interface SpacerProps {
    size?: 'sm' | 'md' | 'lg';
    orientation?: 'vertical' | 'horizontal';
}

/**
 * Spacer component for adding consistent whitespace
 * Enforces 8px grid system
 *
 * @example
 * <div>Content</div>
 * <Spacer size="lg" />
 * <div>More content</div>
 */
export const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
    ({ size = 'md', orientation = 'vertical' }, ref) => {
        const sizeMap = {
            sm: orientation === 'vertical' ? 'h-2' : 'w-2',
            md: orientation === 'vertical' ? 'h-3' : 'w-3',
            lg: orientation === 'vertical' ? 'h-4' : 'w-4',
        };

        return <div ref={ref} className={cn(sizeMap[size])} />;
    }
);
Spacer.displayName = 'Spacer';

interface InsetProps {
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    horizontal?: boolean;
    vertical?: boolean;
}

/**
 * Inset component for applying consistent margins
 * Useful for creating breathing room around content
 *
 * @example
 * <Inset size="lg" horizontal vertical>
 *   <Card>Card with insets</Card>
 * </Inset>
 */
export const Inset = React.forwardRef<HTMLDivElement, InsetProps>(
    (
        {
            children,
            className,
            size = 'md',
            horizontal = true,
            vertical = true,
        },
        ref
    ) => {
        const sizeMap = {
            sm: 'm-2',
            md: 'm-3',
            lg: 'm-4',
        };

        const horizontalMap = {
            sm: 'mx-2',
            md: 'mx-3',
            lg: 'mx-4',
        };

        const verticalMap = {
            sm: 'my-2',
            md: 'my-3',
            lg: 'my-4',
        };

        let marginClass = '';
        if (horizontal && vertical) {
            marginClass = sizeMap[size];
        } else if (horizontal) {
            marginClass = horizontalMap[size];
        } else if (vertical) {
            marginClass = verticalMap[size];
        }

        return (
            <div ref={ref} className={cn(marginClass, className)}>
                {children}
            </div>
        );
    }
);
Inset.displayName = 'Inset';
