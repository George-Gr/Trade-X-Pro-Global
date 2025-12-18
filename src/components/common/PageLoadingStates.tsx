import {
  NotificationsSkeleton,
  ProfileSkeleton,
  KYCSkeleton,
} from "@/components/ui/LoadingSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SettingsLoading() {
  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <Skeleton variant="heading" className="h-8 w-1/3 mb-2" />
          <Skeleton variant="text" className="h-4 w-1/2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton variant="text" className="h-5 w-1/3" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Personal Information */}
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

                  {/* Security Settings */}
                  <div className="space-y-4">
                    <Skeleton variant="text" className="h-5 w-1/2" />
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 border border-border/50 rounded-lg"
                        >
                          <div className="space-y-1">
                            <Skeleton variant="text" className="h-4 w-2/3" />
                            <Skeleton variant="text" className="h-3 w-1/2" />
                          </div>
                          <Skeleton variant="buttonSm" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="space-y-4">
                    <Skeleton variant="text" className="h-5 w-1/2" />
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <Skeleton variant="text" className="h-4 w-2/3" />
                          <Skeleton variant="text" className="h-3 w-1/2" />
                        </div>
                        <Skeleton variant="text" className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProfileSkeleton />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton variant="text" className="h-5 w-2/3" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="button"
                      className="w-full h-10"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationsLoading() {
  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Skeleton variant="heading" className="h-8 w-1/3 mb-2" />
            <Skeleton variant="text" className="h-4 w-1/2" />
          </div>
          <Skeleton variant="button" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Notifications */}
          <div className="lg:col-span-2">
            <NotificationsSkeleton count={8} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton variant="text" className="h-5 w-2/3" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Skeleton variant="text" className="h-4 w-2/3" />
                        <Skeleton variant="text" className="h-3 w-1/2" />
                      </div>
                      <Skeleton variant="text" className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton variant="text" className="h-5 w-1/2" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 bg-muted/50 rounded"
                    >
                      <Skeleton variant="text" className="h-4 w-2/3" />
                      <Skeleton variant="text" className="h-4 w-1/4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WalletLoading() {
  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <Skeleton variant="heading" className="h-8 w-1/3 mb-2" />
          <Skeleton variant="text" className="h-4 w-2/3" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Balance */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton variant="text" className="h-5 w-1/3" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton variant="metricLg" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton variant="text" className="h-3 w-full" />
                        <Skeleton variant="metric" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton variant="text" className="h-5 w-1/3" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Skeleton variant="avatarSm" />
                        <div>
                          <Skeleton variant="text" className="h-4 w-24" />
                          <Skeleton variant="text" className="h-3 w-16" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton variant="text" className="h-4 w-20" />
                        <Skeleton
                          variant="text"
                          className="h-3 w-12 opacity-75"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Deposit/Withdraw */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton variant="text" className="h-5 w-2/3" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton variant="text" className="h-4 w-full" />
                  <Skeleton variant="inputLg" />
                  <Skeleton variant="button" className="w-full h-12" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton variant="text" className="h-5 w-2/3" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="button"
                      className="w-full h-10"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export function KYCLoading() {
  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <Skeleton variant="heading" className="h-8 w-1/3 mb-2" />
          <Skeleton variant="text" className="h-4 w-2/3" />
        </div>

        <KYCSkeleton />
      </div>
    </div>
  );
}
