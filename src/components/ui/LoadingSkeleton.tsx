import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

interface DashboardStatsSkeletonProps {
  count?: number;
  className?: string;
  animated?: boolean;
}

export function DashboardStatsSkeleton({ count = 4, className, animated = true }: DashboardStatsSkeletonProps) {
  return (
    <div className={cn("dashboard-grid mb-8", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Card 
          key={index} 
          elevation="1" 
          variant="primary" 
          className={animated ? "animate-slide-in-up" : ""}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
            <div className="flex-1">
              <CardTitle className="typography-label text-primary-contrast tracking-wide">
                <Skeleton variant="text" className={cn("w-3/4 h-4", animated && "animate-loading-pulse")} />
              </CardTitle>
              <Skeleton variant="text" className={cn("w-1/2 h-3 mt-2", animated && "animate-loading-pulse")} />
            </div>
            <Skeleton variant="avatar" className={cn("h-5 w-5", animated && "animate-loading-pulse")} />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton variant="text" className={cn("w-1/2 h-8", animated && "animate-loading-pulse")} />
            <Skeleton variant="text" className={cn("w-1/3 h-3", animated && "animate-loading-pulse")} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface MarketWatchSkeletonProps {
  className?: string;
  height?: string;
  animated?: boolean;
}

export function MarketWatchSkeleton({ className, height = "h-[400px]", animated = true }: MarketWatchSkeletonProps) {
  return (
    <Card 
      elevation="2" 
      variant="primary" 
      className={cn("border-border/70 mb-xl", animated && "animate-slide-in-up", className)}
    >
      <CardHeader>
        <CardTitle className="text-base font-semibold text-primary-contrast">
          <Skeleton variant="text" className={cn("w-1/3 h-5", animated && "animate-loading-pulse")} />
        </CardTitle>
      </CardHeader>
      <CardContent className={cn(height, "bg-muted/50 rounded-lg")}>
        <div className="flex items-center justify-center h-full">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <Skeleton variant="avatar" className="h-12 w-12" />
            </div>
            <Skeleton variant="text" className="w-1/2 h-4 mx-auto" />
            <Skeleton variant="text" className="w-3/4 h-3 mx-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PortfolioTableSkeletonProps {
  rows?: number;
  className?: string;
}

export function PortfolioTableSkeleton({ rows = 5, className }: PortfolioTableSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-1/4 h-7" />
        <Skeleton variant="button" className="h-10 w-32" />
      </div>
      <div className="rounded-md border bg-card">
        <div className="rounded-md border-b bg-muted/50 p-4">
          <div className="grid grid-cols-8 gap-4">
            <Skeleton variant="text" className="h-4 w-16" />
            <Skeleton variant="text" className="h-4 w-12" />
            <Skeleton variant="text" className="h-4 w-16" />
            <Skeleton variant="text" className="h-4 w-20" />
            <Skeleton variant="text" className="h-4 w-20" />
            <Skeleton variant="text" className="h-4 w-24" />
            <Skeleton variant="text" className="h-4 w-16" />
            <Skeleton variant="text" className="h-4 w-12" />
          </div>
        </div>
        <div className="p-2 space-y-2">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 rounded p-4 hover:bg-muted/50 transition-colors">
              <div className="grid grid-cols-8 gap-4 flex-1">
                <div className="font-medium">
                  <Skeleton variant="text" className="h-5 w-12" />
                </div>
                <div>
                  <Skeleton variant="badge" className="h-6 w-12" />
                </div>
                <div>
                  <Skeleton variant="text" className="h-5 w-16" />
                </div>
                <div>
                  <Skeleton variant="text" className="h-5 w-20" />
                </div>
                <div>
                  <Skeleton variant="text" className="h-5 w-20" />
                </div>
                <div>
                  <div className="font-medium">
                    <Skeleton variant="text" className="h-5 w-24" />
                  </div>
                  <div className="text-xs opacity-75">
                    <Skeleton variant="text" className="h-3 w-16" />
                  </div>
                </div>
                <div>
                  <Skeleton variant="text" className="h-5 w-20" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4 justify-end">
                    <Skeleton variant="button" className="h-8 w-20" />
                    <Skeleton variant="button" className="h-8 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface RiskManagementSkeletonProps {
  className?: string;
}

export function RiskManagementSkeleton({ className }: RiskManagementSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6", className)}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-2 pb-4">
            <CardTitle className="text-sm font-medium">
              <Skeleton variant="text" className="h-4 w-20" />
            </CardTitle>
            <Skeleton variant="avatar" className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton variant="text" className="h-8 w-1/2" />
            <Skeleton variant="text" className="h-3 w-3/4 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface TradeFormSkeletonProps {
  className?: string;
}

export function TradeFormSkeleton({ className }: TradeFormSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-4">
          <Skeleton variant="text" className="h-6 w-1/2" />
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-1/3" />
            <Skeleton variant="input" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-2/3" />
            <Skeleton variant="input" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton variant="input" />
              <Skeleton variant="input" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-3/4" />
            <Skeleton variant="input" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <Skeleton variant="text" className="h-6 w-2/3" />
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-1/2" />
            <Skeleton variant="text" className="h-6 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-2/3" />
            <Skeleton variant="text" className="h-12 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-1/2" />
            <Skeleton variant="button" className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChartSkeletonProps {
  className?: string;
  height?: string;
}

export function ChartSkeleton({ className, height = "h-[300px]" }: ChartSkeletonProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" className="h-5 w-1/3" />
        <Skeleton variant="text" className="h-4 w-1/6" />
      </div>
      <div className={cn(height, "bg-muted/50 rounded-lg flex items-center justify-center")}>
        <div className="space-y-3 text-center">
          <Skeleton variant="avatar" className="h-16 w-16" />
          <Skeleton variant="text" className="h-4 w-1/2" />
          <Skeleton variant="text" className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}

interface ProfileSkeletonProps {
  className?: string;
}

export function ProfileSkeleton({ className }: ProfileSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="avatar" className="h-20 w-20" />
        <div className="space-y-2">
          <Skeleton variant="text" className="h-7 w-1/2" />
          <Skeleton variant="text" className="h-4 w-1/3" />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton variant="text" className="h-5 w-1/2" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton variant="text" className="h-4 w-1/3" />
              <Skeleton variant="text" className="h-4 w-1/4" />
            </div>
            <div className="flex justify-between">
              <Skeleton variant="text" className="h-4 w-1/3" />
              <Skeleton variant="text" className="h-4 w-1/4" />
            </div>
            <div className="flex justify-between">
              <Skeleton variant="text" className="h-4 w-1/3" />
              <Skeleton variant="text" className="h-4 w-1/4" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Skeleton variant="text" className="h-5 w-2/3" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton variant="text" className="h-4 w-1/3" />
              <Skeleton variant="text" className="h-4 w-1/4" />
            </div>
            <div className="flex justify-between">
              <Skeleton variant="text" className="h-4 w-1/3" />
              <Skeleton variant="text" className="h-4 w-1/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NotificationsSkeletonProps {
  count?: number;
  className?: string;
}

export function NotificationsSkeleton({ count = 5, className }: NotificationsSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
          <Skeleton variant="avatar" className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-4 w-3/4" />
            <Skeleton variant="text" className="h-3 w-1/2" />
            <Skeleton variant="text" className="h-3 w-1/3" />
          </div>
          <Skeleton variant="text" className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

interface KYCSkeletonProps {
  className?: string;
}

export function KYCSkeleton({ className }: KYCSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center py-8">
        <Skeleton variant="avatar" className="h-16 w-16 mx-auto mb-4" />
        <Skeleton variant="text" className="h-6 w-1/3 mx-auto mb-2" />
        <Skeleton variant="text" className="h-4 w-1/2 mx-auto" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3 p-4 border-2 border-dashed border-muted/50 rounded-lg hover:border-muted/70 transition-colors">
            <Skeleton variant="text" className="h-4 w-2/3" />
            <Skeleton variant="text" className="h-3 w-1/2" />
            <Skeleton variant="button" className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Enhanced shimmer animation with better performance
const ShimmerAnimation = () => {
  return (
    <div className="animate-pulse-slow">
      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

interface LoadingWrapperProps {
  children: React.ReactNode;
  isLoading: boolean;
  fallback: React.ReactNode;
  className?: string;
}

export function LoadingWrapper({ children, isLoading, fallback, className }: LoadingWrapperProps) {
  if (isLoading) {
    return (
      <div className={cn("animate-pulse-slow", className)} role="status" aria-label="Loading">
        {fallback}
      </div>
    );
  }
  
  return <div className={className}>{children}</div>;
}

// Custom shimmer effect for better UX
export const ShimmerEffect = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-r from-transparent via-white/20 to-transparent", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

// Enhanced Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dots' | 'spinner' | 'pulse' | 'bounce';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'spinner', 
  className, 
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const spinnerContent = (
    <div className={cn("flex items-center justify-center", className)}>
      {variant === 'spinner' && (
        <div className={cn("animate-loading-spin rounded-full border-2 border-current border-t-transparent", sizeClasses[size])} />
      )}
      
      {variant === 'dots' && (
        <div className="flex space-x-2">
          <div className={cn("rounded-full bg-current animate-loading-bounce", sizeClasses[size])} style={{ animationDelay: '0s' }} />
          <div className={cn("rounded-full bg-current animate-loading-bounce", sizeClasses[size])} style={{ animationDelay: '0.2s' }} />
          <div className={cn("rounded-full bg-current animate-loading-bounce", sizeClasses[size])} style={{ animationDelay: '0.4s' }} />
        </div>
      )}
      
      {variant === 'pulse' && (
        <div className={cn("rounded-full bg-current animate-loading-pulse", sizeClasses[size])} />
      )}
      
      {variant === 'bounce' && (
        <div className="flex space-x-1">
          <div className={cn("w-2 bg-current rounded-full animate-loading-bounce", size === 'sm' ? 'h-4' : size === 'lg' ? 'h-8' : 'h-6')} />
          <div className={cn("w-2 bg-current rounded-full animate-loading-bounce", size === 'sm' ? 'h-4' : size === 'lg' ? 'h-8' : 'h-6')} />
          <div className={cn("w-2 bg-current rounded-full animate-loading-bounce", size === 'sm' ? 'h-4' : size === 'lg' ? 'h-8' : 'h-6')} />
        </div>
      )}
      
      {text && (
        <span className="ml-3 text-sm text-foreground/70 animate-loading-pulse">
          {text}
        </span>
      )}
    </div>
  );

  return (
    <div className="flex items-center justify-center py-8">
      {spinnerContent}
    </div>
  );
}

// Page Loading Overlay
interface PageLoadingOverlayProps {
  visible?: boolean;
  text?: string;
}

export function PageLoadingOverlay({ visible = false, text = "Loading..." }: PageLoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" variant="bounce" />
        <p className="text-lg font-medium text-foreground animate-loading-pulse">
          {text}
        </p>
      </div>
    </div>
  );
}