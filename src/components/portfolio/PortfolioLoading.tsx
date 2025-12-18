import {
  PortfolioTableSkeleton,
  ChartSkeleton,
} from "@/components/ui/LoadingSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PortfolioLoading() {
  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div>
          <Skeleton variant="heading" className="h-10 w-1/3 mb-2" />
          <Skeleton variant="text" className="h-5 w-2/5" />
        </div>

        {/* Account Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  <Skeleton variant="text" className="h-3 w-3/4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton variant="metric" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Open Positions */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton variant="text" className="h-5 w-1/3" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioTableSkeleton rows={5} />
          </CardContent>
        </Card>

        {/* Trading Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton variant="text" className="h-5 w-2/3" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton variant="text" className="h-3 w-3/4" />
                    <Skeleton variant="metric" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* P&L Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton variant="text" className="h-5 w-2/3" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton variant="text" className="h-3 w-1/2" />
                    <Skeleton variant="metric" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton variant="text" className="h-5 w-2/3" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton variant="text" className="h-3 w-2/3" />
                    <Skeleton variant="metric" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton height="h-[400px]" />
          <ChartSkeleton height="h-[400px]" />
        </div>
      </div>
    </div>
  );
}
