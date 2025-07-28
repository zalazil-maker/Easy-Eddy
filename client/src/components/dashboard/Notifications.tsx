import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Clock, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";

interface NotificationsProps {
  userId: number;
}

interface Notification {
  id: number;
  type: "job_applications_sent" | "daily_followup" | "evening_summary";
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  scheduledFor?: string;
  readAt?: string;
}

export default function Notifications({ userId }: NotificationsProps) {
  const [showAll, setShowAll] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/users', userId, 'notifications'],
    queryFn: () => apiRequest<Notification[]>({
      url: `/api/users/${userId}/notifications`,
      method: "GET"
    })
  });

  const { data: unreadNotifications = [] } = useQuery({
    queryKey: ['/api/users', userId, 'notifications', 'unread'],
    queryFn: () => apiRequest<Notification[]>({
      url: `/api/users/${userId}/notifications/unread`,
      method: "GET"
    })
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest({
        url: `/api/notifications/${notificationId}/read`,
        method: "PATCH"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => 
      apiRequest({
        url: `/api/users/${userId}/notifications/read-all`,
        method: "PATCH"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'notifications'] });
    }
  });

  const formatTimeAgo = function(dateString: string) {
    try {
      const now = new Date();
      const date = new Date(dateString);
      
      // Cross-browser date handling
      if (isNaN(date.getTime()) || isNaN(now.getTime())) {
        return "Unknown";
      }
      
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return diffInMinutes + "m ago";
      if (diffInMinutes < 1440) return Math.floor(diffInMinutes / 60) + "h ago";
      return Math.floor(diffInMinutes / 1440) + "d ago";
    } catch (error) {
      console.error('Time formatting error:', error);
      return "Unknown";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "job_applications_sent":
        return <Check className="h-4 w-4 text-green-600" />;
      case "daily_followup":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "evening_summary":
        return <Bell className="h-4 w-4 text-purple-600" />;
      case "application_sent":
        return <Check className="h-4 w-4 text-green-600" />;
      case "job_search_started":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "cv_reminder":
        return <Bell className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "job_applications_sent":
        return "bg-green-50 border-green-200";
      case "daily_followup":
        return "bg-blue-50 border-blue-200";
      case "evening_summary":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);
  const unreadCount = unreadNotifications.length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={function() {
                try {
                  markAllAsReadMutation.mutate();
                } catch (error) {
                  console.error('Mark all read error:', error);
                }
              }}
              disabled={markAllAsReadMutation.isPending}
              className="flex items-center gap-1"
              style={{ cursor: 'pointer' }}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications yet</p>
              <p className="text-sm">You'll see job application updates here</p>
            </div>
            
            {/* Sample job application notifications */}
            <div className="space-y-3">
              <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Job Search Active</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Your daily job search is running. Applications are being sent to matching positions.
                    </p>
                    <span className="text-xs text-gray-500">2 minutes ago</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Application Sent</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Applied to Software Developer position at TechCorp. Your profile matches 95% of requirements.
                    </p>
                    <span className="text-xs text-gray-500">15 minutes ago</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border bg-orange-50 border-orange-200">
                <div className="flex items-start gap-3">
                  <Bell className="h-4 w-4 text-orange-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">CV Update Reminder</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Keep your CV up to date! Consider adding recent projects and skills to improve job matching.
                    </p>
                    <span className="text-xs text-gray-500">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <ScrollArea className="h-96">
              {displayedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.isRead ? "bg-white" : getNotificationColor(notification.type)
                  } ${!notification.isRead ? "shadow-sm" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium ${!notification.isRead ? "font-semibold" : ""}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={function() {
                                try {
                                  markAsReadMutation.mutate(notification.id);
                                } catch (error) {
                                  console.error('Mark as read error:', error);
                                }
                              }}
                              disabled={markAsReadMutation.isPending}
                              className="h-6 w-6 p-0"
                              style={{ cursor: 'pointer' }}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.data?.applicationsCount && (
                        <div className="mt-2 text-xs text-gray-500">
                          {notification.data.applicationsCount} applications
                          {notification.data.topCompanies && (
                            <span> • {notification.data.topCompanies.join(", ")}</span>
                          )}
                        </div>
                      )}
                      {notification.scheduledFor && new Date(notification.scheduledFor) > new Date() && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Scheduled for {new Date(notification.scheduledFor).toLocaleTimeString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
            
            {notifications.length > 5 && (
              <div className="text-center pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={function() {
                    try {
                      setShowAll(!showAll);
                    } catch (error) {
                      console.error('Show all toggle error:', error);
                    }
                  }}
                  className="text-sm"
                  style={{ cursor: 'pointer' }}
                >
                  {showAll ? "Show less" : "Show all " + notifications.length + " notifications"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}