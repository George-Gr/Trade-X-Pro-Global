import React from 'react';
import { cn } from '../../lib/utils';

interface GranularSkeletonProps {
  type:
    | 'hero'
    | 'card'
    | 'chart'
    | 'table'
    | 'form'
    | 'navigation'
    | 'sidebar'
    | 'footer';
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function GranularSkeleton({
  type,
  className,
  animation = 'pulse',
  size = 'md',
}: GranularSkeletonProps) {
  const skeletonStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-[wave_2s_ease-in-out_infinite]',
    none: '',
  };

  const sizeStyles = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12',
  };

  const baseClasses = cn(
    'bg-muted rounded',
    skeletonStyles[animation],
    className
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'hero':
        return (
          <div className={cn(baseClasses, 'h-96 w-full')}>
            <div className="space-y-4 p-6">
              <div className={cn(baseClasses, sizeStyles[size])} />
              <div className={cn(baseClasses, 'h-4 w-3/4')} />
              <div className={cn(baseClasses, 'h-4 w-1/2')} />
              <div className="flex gap-4 mt-8">
                <div className={cn(baseClasses, 'h-12 w-32')} />
                <div className={cn(baseClasses, 'h-12 w-32')} />
              </div>
            </div>
          </div>
        );

      case 'card':
        return (
          <div className={cn(baseClasses, 'h-48 w-full')}>
            <div className="p-4 space-y-3">
              <div className={cn(baseClasses, sizeStyles[size])} />
              <div className={cn(baseClasses, 'h-32')} />
              <div className="flex justify-between">
                <div className={cn(baseClasses, 'h-4 w-20')} />
                <div className={cn(baseClasses, 'h-4 w-16')} />
              </div>
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className={cn(baseClasses, 'h-64 w-full')}>
            <div className="p-4 space-y-2">
              <div className={cn(baseClasses, sizeStyles[size])} />
              <div className={cn(baseClasses, 'h-48')} />
              <div className="flex gap-2 justify-end">
                <div className={cn(baseClasses, 'h-3 w-12')} />
                <div className={cn(baseClasses, 'h-3 w-12')} />
                <div className={cn(baseClasses, 'h-3 w-12')} />
              </div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className={cn(baseClasses, 'h-80 w-full')}>
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <div className={cn(baseClasses, 'h-6 w-1/4')} />
                <div className={cn(baseClasses, 'h-6 w-1/4')} />
                <div className={cn(baseClasses, 'h-6 w-1/4')} />
                <div className={cn(baseClasses, 'h-6 w-1/4')} />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-2">
                  <div className={cn(baseClasses, 'h-4 w-1/4')} />
                  <div className={cn(baseClasses, 'h-4 w-1/4')} />
                  <div className={cn(baseClasses, 'h-4 w-1/4')} />
                  <div className={cn(baseClasses, 'h-4 w-1/4')} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'form':
        return (
          <div className={cn(baseClasses, 'h-64 w-full')}>
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className={cn(baseClasses, 'h-4 w-1/3')} />
                  <div className={cn(baseClasses, 'h-10 w-full')} />
                </div>
              ))}
              <div className={cn(baseClasses, 'h-12 w-32 mt-6')} />
            </div>
          </div>
        );

      case 'navigation':
        return (
          <div className={cn(baseClasses, 'h-16 w-full')}>
            <div className="flex items-center justify-between p-4">
              <div className={cn(baseClasses, 'h-8 w-32')} />
              <div className="flex gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={cn(baseClasses, 'h-6 w-16')} />
                ))}
              </div>
              <div className={cn(baseClasses, 'h-8 w-24')} />
            </div>
          </div>
        );

      case 'sidebar':
        return (
          <div className={cn(baseClasses, 'h-96 w-full')}>
            <div className="p-4 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={cn(baseClasses, 'h-8 w-full')} />
              ))}
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className={cn(baseClasses, 'h-32 w-full')}>
            <div className="p-6 space-y-3">
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className={cn(baseClasses, 'h-4 w-3/4')} />
                    <div className={cn(baseClasses, 'h-3 w-1/2')} />
                    <div className={cn(baseClasses, 'h-3 w-2/3')} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <div className={cn(baseClasses, 'h-24 w-full')} />;
    }
  };

  return renderSkeleton();
}

// Container for multiple skeletons
interface SkeletonContainerProps {
  children: React.ReactNode;
  loading: boolean;
  fallback?: React.ReactNode;
  className?: string;
}

export function SkeletonContainer({
  children,
  loading,
  fallback,
  className,
}: SkeletonContainerProps) {
  if (!loading) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <div className={cn('space-y-4', className)}>{children}</div>;
}

// Progressive loading wrapper
interface ProgressiveSkeletonProps {
  sections: Array<{
    id: string;
    type: GranularSkeletonProps['type'];
    title?: string;
    loaded?: boolean;
  }>;
  className?: string;
}

export function ProgressiveSkeleton({
  sections,
  className,
}: ProgressiveSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {sections.map((section) => (
        <div key={section.id} className="space-y-2">
          {section.title && (
            <div className="text-lg font-semibold text-muted-foreground">
              {section.title}
            </div>
          )}
          {section.loaded ? (
            // Render actual content when loaded
            <div className="min-h-[200px] bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground">
                Content loaded for {section.id}
              </div>
            </div>
          ) : (
            // Render skeleton when not loaded
            <GranularSkeleton type={section.type} />
          )}
        </div>
      ))}
    </div>
  );
}
