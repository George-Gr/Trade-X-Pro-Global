import { TradeFormSkeleton, ChartSkeleton } from "@/components/ui/LoadingSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TradeLoading() {
  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Skeleton variant="heading" className="h-8 w-1/4 mb-2" />
            <Skeleton variant="text" className="h-4 w-1/3" />
          </div>
          <Skeleton variant="button" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Trading Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton variant="text" className="h-5 w-1/3" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TradeFormSkeleton />
              </CardContent>
            </Card>

            {/* Market Depth */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton variant="text" className="h-5 w-1/4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <div className="flex space-x-2">
                        <Skeleton variant="text" className="h-3 w-16" />
                        <Skeleton variant="text" className="h-3 w-12" />
                      </div>
                      <Skeleton variant="text" className="h-3 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Chart */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton variant="text" className="h-4 w-1/2" />
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Skeleton variant="text" className="h-3 w-16" />
                  <Skeleton variant="badge" />
                </div>
              </CardHeader>
              <CardContent>
                <ChartSkeleton height="h-[250px]" />
              </CardContent>
            </Card>

            {/* Order Book */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton variant="text" className="h-4 w-1/3" />
                </CardTitle>
                <Skeleton variant="text" className="h-3 w-1/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Buy Orders */}
                  <div className="space-y-1">
                    <Skeleton variant="text" className="h-3 w-full" />
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex justify-between p-1 bg-success-contrast/10 rounded">
                        <Skeleton variant="text" className="h-3 w-1/3" />
                        <Skeleton variant="text" className="h-3 w-1/3" />
                        <Skeleton variant="text" className="h-3 w-1/6" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Spread */}
                  <div className="p-2 bg-muted/50 rounded text-center">
                    <Skeleton variant="text" className="h-3 w-1/4" />
                  </div>
                  
                  {/* Sell Orders */}
                  <div className="space-y-1">
                    <Skeleton variant="text" className="h-3 w-full" />
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex justify-between p-1 bg-danger-contrast/10 rounded">
                        <Skeleton variant="text" className="h-3 w-1/3" />
                        <Skeleton variant="text" className="h-3 w-1/3" />
                        <Skeleton variant="text" className="h-3 w-1/6" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton variant="text" className="h-4 w-1/3" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center space-x-2">
                        <Skeleton variant="status" />
                        <div>
                          <Skeleton variant="text" className="h-3 w-12" />
                          <Skeleton variant="text" className="h-2 w-16" />
                        </div>
                      </div>
                      <Skeleton variant="text" className="h-3 w-8 text-right" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton variant="text" className="h-4 w-2/3" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton variant="button" className="w-full h-10" />
                  <Skeleton variant="button" className="w-full h-10" />
                  <Skeleton variant="button" className="w-full h-10" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}