import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const skeletonVariants = cva(
  'animate-pulse-slow bg-muted relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'rounded-md',
        text: 'rounded h-4 w-full',
        heading: 'rounded h-8 w-3/4',
        subheading: 'rounded h-6 w-2/3',
        caption: 'rounded h-3 w-1/2',
        avatar: 'rounded-full h-10 w-10',
        avatarSm: 'rounded-full h-8 w-8',
        avatarLg: 'rounded-full h-16 w-16',
        avatarXl: 'rounded-full h-20 w-20',
        button: 'rounded-md h-10 w-24',
        buttonSm: 'rounded-md h-8 w-20',
        buttonLg: 'rounded-md h-12 w-32',
        card: 'rounded-lg h-32 w-full',
        cardSm: 'rounded-lg h-24 w-full',
        cardLg: 'rounded-lg h-48 w-full',
        table: 'rounded h-12 w-full',
        tableRow: 'rounded h-16 w-full',
        thumbnail: 'rounded-md h-24 w-24',
        thumbnailLg: 'rounded-md h-32 w-32',
        badge: 'rounded-full h-6 w-16',
        input: 'rounded-md h-10 w-full',
        inputLg: 'rounded-md h-12 w-full',
        metric: 'rounded h-8 w-1/2',
        metricLg: 'rounded h-10 w-3/4',
        status: 'rounded-full h-4 w-4',
      },
      shimmer: {
        true: "after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent after:-translate-x-full after:animate-shimmer",
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      shimmer: false,
    },
  }
);

export interface SkeletonProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, shimmer, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant, shimmer }), className)}
      {...props}
    />
  );
}

// Convenience components for common skeleton patterns
function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-2/3' : ''}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      <Skeleton variant="thumbnail" className="w-full h-48" />
      <Skeleton variant="heading" />
      <SkeletonText lines={2} />
    </div>
  );
}

function SkeletonTable({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-2">
      <Skeleton variant="table" className="bg-muted/50" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} variant="text" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonAvatar({ className }: { className?: string }) {
  return <Skeleton variant="avatar" className={className} />;
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonAvatar };
