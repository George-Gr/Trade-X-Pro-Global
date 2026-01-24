import React from 'react';
import { cn } from '@/lib/utils';

export interface PlaceholderProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  animate?: boolean;
  rounded?: boolean;
  children?: React.ReactNode;
}

export function Placeholder({
  className,
  width,
  height,
  animate = true,
  rounded = false,
  children,
}: PlaceholderProps) {
  return (
    <div
      className={cn(
        'bg-muted',
        animate && 'animate-pulse',
        rounded && 'rounded-full',
        !rounded && 'rounded-md',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      {children}
    </div>
  );
}

export function TextPlaceholder({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Placeholder
          key={i}
          height={16}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function CardPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-4 space-y-3', className)}>
      <Placeholder height={20} width="40%" />
      <TextPlaceholder lines={2} />
    </div>
  );
}

export default Placeholder;
