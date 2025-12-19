import {
  LoadingIndicator,
  LoadingProgress,
} from '@/components/ui/loading-indicator';
import { useLoadingContext } from '@/contexts/LoadingContext';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * FE-010: Global Loading Indicator
 * Displays all active async operations in a floating panel
 */

export function GlobalLoadingIndicator() {
  const { operations, isLoading } = useLoadingContext();
  const operationsList = Array.from(operations.values());

  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="global-loading"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'fixed bottom-4 right-4 z-50',
          'bg-card border border-border rounded-lg shadow-lg',
          'backdrop-blur-sm bg-card/95',
          'p-4 max-w-sm'
        )}
      >
        <div className="space-y-3">
          {operationsList.map((op) => (
            <div key={op.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {op.message || 'Loading...'}
                </span>
                <LoadingIndicator
                  size="sm"
                  isLoading={true}
                  variant="spinner"
                />
              </div>
              {typeof op.progress === 'number' && (
                <LoadingProgress progress={op.progress} className="h-1.5" />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Compact loading indicator for use in headers/navbars
 */
export function CompactLoadingIndicator() {
  const { isLoading, operations } = useLoadingContext();

  if (!isLoading) return null;

  const count = operations.size;
  const firstOp = Array.from(operations.values())[0];

  return (
    <motion.div
      key="compact-loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
    >
      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
      {count === 1 ? (
        <span>{firstOp?.message || 'Loading...'}</span>
      ) : (
        <span>{count} operations in progress</span>
      )}
    </motion.div>
  );
}

/**
 * Loading overlay that covers the viewport
 */
interface LoadingScreenProps {
  message?: string;
  showSpinner?: boolean;
}

export function LoadingScreen({
  message = 'Loading...',
  showSpinner = true,
}: LoadingScreenProps) {
  const { isLoading } = useLoadingContext();

  if (!isLoading) return null;

  return (
    <motion.div
      key="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        {showSpinner && (
          <LoadingIndicator isLoading={true} size="lg" variant="spinner" />
        )}
        <p className="text-sm font-medium text-foreground text-center">
          {message}
        </p>
      </div>
    </motion.div>
  );
}
