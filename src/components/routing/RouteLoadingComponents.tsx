import { ShimmerEffect } from '@/components/ui/LoadingSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, PieChart, Shield, TrendingUp } from 'lucide-react';

// Default route loading component
export const DefaultRouteLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="h-12 w-12 mx-auto bg-primary/20 rounded-full animate-pulse-slow">
          <ShimmerEffect className="absolute inset-0 rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-lg font-semibold text-primary-contrast">
          <Skeleton variant="text" className="h-6 w-32 mx-auto" />
        </div>
        <div className="text-sm text-secondary-contrast">
          <Skeleton variant="text" className="h-4 w-24 mx-auto" />
        </div>
      </div>
    </div>
  </div>
);

// Trading page specific loading
export const TradingPageLoading = () => (
  <div className="h-full flex flex-col">
    {/* Header with KYC banner */}
    <div className="shrink-0 px-4 pt-4">
      <div className="h-12 bg-muted/50 rounded animate-pulse" />
    </div>

    {/* Main trading layout */}
    <div className="flex-1 flex flex-col sm:flex-row overflow-hidden gap-0">
      {/* Watchlist sidebar */}
      <div className="hidden lg:flex w-80 border-r border-border shrink-0 overflow-hidden">
        <div className="w-full h-full bg-muted/50 animate-pulse rounded" />
      </div>

      {/* Chart and portfolio area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Chart area */}
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="w-full h-full bg-muted/50 animate-pulse rounded" />
        </div>

        {/* Portfolio dashboard */}
        <div className="h-64 border-t border-border shrink-0">
          <div className="w-full h-full bg-muted/50 animate-pulse rounded" />
        </div>
      </div>

      {/* Trading panel sidebar */}
      <div className="hidden md:flex w-64 lg:w-96 border-l border-border shrink-0 overflow-hidden">
        <div className="w-full h-full bg-muted/50 animate-pulse rounded" />
      </div>
    </div>
  </div>
);

// Portfolio page specific loading
export const PortfolioPageLoading = () => (
  <div className="h-full overflow-auto">
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Portfolio metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Positions table */}
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

// KYC page specific loading
export const KYCPageLoading = () => (
  <div className="h-full overflow-auto">
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Status alerts */}
      <div className="space-y-4">
        <div className="h-16 bg-muted/50 rounded animate-pulse" />
        <div className="h-16 bg-muted/50 rounded animate-pulse" />
      </div>

      {/* KYC form */}
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Documents table */}
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Admin page specific loading
export const AdminPageLoading = () => (
  <div className="h-full overflow-auto">
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Admin metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted/50 rounded animate-pulse" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin tables and charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// Dashboard specific loading
export const DashboardPageLoading = () => (
  <div className="h-full overflow-auto">
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Welcome header */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-muted/50 rounded animate-pulse" />
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart area */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-24 mb-3" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Positions and activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// Route-specific loading fallback components moved to routeLoadingConstants.ts

// Progressive loading indicator for complex routes
export const ProgressiveLoadingIndicator = ({
  stage = 'loading',
  totalStages = 3,
  currentStage = 1,
}: {
  stage?: string;
  totalStages?: number;
  currentStage?: number;
}) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-6 max-w-md">
      {/* Animated icon based on stage */}
      <div className="relative">
        <div className="h-16 w-16 mx-auto">
          {stage === 'trading' && (
            <TrendingUp className="h-16 w-16 text-primary animate-pulse" />
          )}
          {stage === 'data' && (
            <BarChart3 className="h-16 w-16 text-primary animate-pulse" />
          )}
          {stage === 'portfolio' && (
            <PieChart className="h-16 w-16 text-primary animate-pulse" />
          )}
          {stage === 'security' && (
            <Shield className="h-16 w-16 text-primary animate-pulse" />
          )}
        </div>
        <ShimmerEffect className="absolute inset-0 rounded-full" />
      </div>

      {/* Progress indicator */}
      <div className="space-y-3">
        <div className="text-lg font-semibold text-primary-contrast">
          {stage === 'trading' && 'Loading trading interface...'}
          {stage === 'data' && 'Fetching market data...'}
          {stage === 'portfolio' && 'Calculating portfolio metrics...'}
          {stage === 'security' && 'Verifying security clearance...'}
          {stage === 'default' && 'Loading page...'}
        </div>

        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStage / totalStages) * 100}%` }}
          />
        </div>

        <div className="text-sm text-secondary-contrast">
          Step {currentStage} of {totalStages}
        </div>
      </div>
    </div>
  </div>
);
