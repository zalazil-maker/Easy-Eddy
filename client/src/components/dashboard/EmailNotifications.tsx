import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmailNotification } from "@shared/schema";

interface EmailNotificationsProps {
  userId: number;
}

export default function EmailNotifications({ userId }: EmailNotificationsProps) {
  const { data: notifications } = useQuery<EmailNotification[]>({
    queryKey: ["/api/users", userId, "notifications"],
  });

  const getNotificationColor = (subject: string) => {
    if (subject.includes("Application Sent")) return "border-brand-green";
    if (subject.includes("Response")) return "border-blue-500";
    if (subject.includes("Interview")) return "border-yellow-500";
    return "border-gray-300";
  };

  const getNotificationTitle = (subject: string) => {
    if (subject.includes("Application Sent")) return "Application Sent";
    if (subject.includes("Response")) return "Response Received";
    if (subject.includes("Interview")) return "Interview Scheduled";
    return "Notification";
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-black">Email Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications?.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              No notifications yet
            </div>
          ) : (
            notifications?.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`border-l-4 pl-3 ${getNotificationColor(notification.subject)}`}
              >
                <p className="text-sm font-medium text-black">
                  {getNotificationTitle(notification.subject)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTimeAgo(notification.sentAt!)}
                </p>
                <p className="text-xs text-gray-600">
                  {notification.subject.split(":")[1]?.trim() || "Job application update"}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
