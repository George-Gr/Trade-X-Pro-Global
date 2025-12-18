import {
  DashboardStatsSkeleton,
  MarketWatchSkeleton,
} from "@/components/ui/LoadingSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLoading() {
  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Skeleton variant="heading" className="h-10 w-1/3 mb-2" />
          <Skeleton variant="text" className="h-5 w-1/2" />
        </div>

        {/* Stats Grid */}
        <DashboardStatsSkeleton count={4} />

        {/* Risk Management Section */}
        <div className="dashboard-grid mb-xl section-spacing">
          <Card elevation="1" variant="primary">
            <CardHeader>
              <CardTitle>
                <Skeleton variant="text" className="h-5 w-24" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton variant="text" className="h-8 w-1/2" />
                  <Skeleton variant="avatarSm" />
                </div>
                <Skeleton variant="text" className="h-3 w-2/3" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton variant="text" className="h-3 w-1/3" />
                      <Skeleton variant="text" className="h-3 w-1/4" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card elevation="1" variant="primary">
            <CardHeader>
              <CardTitle>
                <Skeleton variant="text" className="h-5 w-20" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton variant="metricLg" />
                <div className="space-y-2">
                  <Skeleton variant="text" className="h-3 w-1/2" />
                  <Skeleton variant="text" className="h-3 w-2/3" />
                </div>
                <div className="h-32 bg-muted/50 rounded-lg flex items-center justify-center">
                  <Skeleton variant="thumbnail" className="h-16 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card elevation="1" variant="primary">
            <CardHeader>
              <CardTitle>
                <Skeleton variant="text" className="h-5 w-24" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <Skeleton variant="status" />
                    <div className="flex-1 space-y-1">
                      <Skeleton variant="text" className="h-3 w-3/4" />
                      <Skeleton variant="text" className="h-2 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Watch */}
        <MarketWatchSkeleton />

        {/* Actions Section */}
        <Card
          elevation="1"
          variant="secondary"
          className="border-border/70 mb-xl"
        >
          <CardHeader>
            <CardTitle className="text-base font-semibold text-primary-contrast">
              <Skeleton variant="text" className="h-5 w-1/3" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-xl">
            {/* Quick Actions */}
            <div className="space-y-lg">
              <Skeleton variant="text" className="h-4 w-1/4 mb-md" />
              <div className="flex gap-md flex-wrap">
                <Skeleton variant="button" />
                <Skeleton variant="button" />
              </div>
            </div>

            {/* Ready to Start Trading */}
            <div className="space-y-lg">
              <Skeleton variant="text" className="h-4 w-1/3 mb-md" />
              <div className="space-y-lg">
                <Skeleton variant="text" className="h-5 w-full" />
                <div className="bg-quick-actions/50 rounded-lg p-lg border border-primary/20 space-y-md">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-md">
                      <Skeleton variant="avatarSm" />
                      <div>
                        <Skeleton variant="text" className="h-3 w-3/4" />
                        <Skeleton variant="text" className="h-2 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
                <Skeleton variant="buttonLg" />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-lg">
              <Skeleton variant="text" className="h-4 w-1/4 mb-md" />
              <div className="space-y-md">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-border/50 pb-md last:border-0 last:pb-0"
                  >
                    <div>
                      <Skeleton variant="text" className="h-4 w-1/3" />
                      <Skeleton variant="text" className="h-3 w-1/4" />
                    </div>
                    <Skeleton variant="text" className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
