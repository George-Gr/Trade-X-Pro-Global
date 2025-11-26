import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { NotificationsLoading } from "@/components/common/PageLoadingStates";

export default function Notifications() {
  return (
    <AuthenticatedLayout>
      <div className="h-full overflow-auto">
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
          <div>
            <h1 className="typography-h1">Notifications</h1>
            <p className="text-muted-foreground mt-2">
              Manage your notification preferences and view your notification history
            </p>
          </div>

          <NotificationPreferences />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}