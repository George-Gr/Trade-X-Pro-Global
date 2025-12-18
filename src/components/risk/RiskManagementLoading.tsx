import { RiskManagementSkeleton } from "@/components/ui/LoadingSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RiskManagementLoading() {
  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Skeleton variant="heading" className="h-8 w-1/3 mb-2" />
            <Skeleton variant="text" className="h-4 w-2/3" />
          </div>
        </div>

        {/* Risk Metrics Cards */}
        <RiskManagementSkeleton />

        {/* Risk Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton variant="text" className="h-5 w-1/4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 border border-border/50 rounded-lg"
                >
                  <Skeleton variant="avatarSm" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Skeleton variant="status" />
                      <Skeleton variant="text" className="h-4 w-1/3" />
                    </div>
                    <Skeleton variant="text" className="h-3 w-2/3" />
                    <Skeleton variant="text" className="h-2 w-1/2" />
                  </div>
                  <Skeleton variant="text" className="h-3 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton variant="text" className="h-5 w-1/3" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Account Risk Limits */}
              <div className="space-y-4">
                <Skeleton variant="text" className="h-5 w-1/2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton variant="text" className="h-3 w-3/4" />
                      <Skeleton variant="input" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Position Limits */}
              <div className="space-y-4">
                <Skeleton variant="text" className="h-5 w-1/2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton variant="text" className="h-3 w-3/4" />
                      <Skeleton variant="input" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Trading Restrictions */}
              <div className="space-y-4">
                <Skeleton variant="text" className="h-5 w-1/2" />
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton variant="text" className="h-4 w-2/3" />
                      <Skeleton variant="text" className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Skeleton variant="button" className="h-12 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Analysis Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton variant="text" className="h-5 w-2/3" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Skeleton variant="avatar" />
                  <Skeleton variant="text" className="h-4 w-1/2" />
                  <Skeleton variant="text" className="h-3 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton variant="text" className="h-5 w-2/3" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="text-center space-y-2">
                      <Skeleton variant="metric" />
                      <Skeleton variant="text" className="h-3 w-3/4" />
                    </div>
                  ))}
                </div>
                <div className="h-[200px] bg-muted/50 rounded-lg flex items-center justify-center">
                  <Skeleton variant="thumbnail" className="h-16 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
