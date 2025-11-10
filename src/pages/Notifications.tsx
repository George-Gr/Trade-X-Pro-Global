import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";

export default function Notifications() {
  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-2">
          Manage your notification preferences and view your notification history
        </p>
      </div>

        <NotificationPreferences />
      </div>
    </div>
  );
}