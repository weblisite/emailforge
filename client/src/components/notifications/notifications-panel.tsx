import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, X, RefreshCw, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  userId: string;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: () => api.getNotifications(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => api.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Notification marked as read",
      });
    },
    onError: () => {
      toast({
        title: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      const promises = unreadNotifications.map(notification => 
        api.markNotificationRead(notification.id)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "All notifications marked as read",
      });
    },
    onError: () => {
      toast({
        title: "Failed to mark notifications as read",
        variant: "destructive",
      });
    },
  });

  // Update unread count when notifications change
  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    setUnreadCount(unread);
  }, [notifications]);

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <X className="h-4 w-4 text-danger" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'success':
        return <Badge className="badge-success">Success</Badge>;
      case 'warning':
        return <Badge className="badge-warning">Warning</Badge>;
      case 'error':
        return <Badge className="badge-danger">Error</Badge>;
      default:
        return <Badge className="badge-primary">Info</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="notifications-panel">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <Bell className="h-5 w-5 mr-2 text-primary" />
          <h5 className="mb-0">Notifications</h5>
          {unreadCount > 0 && (
            <Badge className="badge-primary ms-2">{unreadCount}</Badge>
          )}
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            data-testid="button-refresh-notifications"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              data-testid="button-mark-all-read"
            >
              {markAllAsReadMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Marking...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            data-testid="button-close-notifications"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="text-center py-4">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <div className="text-muted-foreground">No notifications yet</div>
            <small>You'll see important updates here</small>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                data-testid={`notification-${notification.id}`}
              >
                <div className="d-flex align-items-start">
                  <div className="notification-icon me-2 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div className="font-medium">{notification.title}</div>
                      <div className="d-flex gap-1">
                        {getNotificationBadge(notification.type)}
                        {!notification.isRead && (
                          <Badge className="badge-primary">New</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-muted-foreground mb-2">
                      {notification.message}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted-foreground">
                        {formatTimeAgo(notification.createdAt)}
                      </small>
                      {!notification.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markAsReadMutation.isPending}
                          data-testid={`button-mark-read-${notification.id}`}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="notifications-footer mt-3 pt-3 border-top">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted-foreground">
            {notifications.length} total notifications
          </small>
          <small className="text-muted-foreground">
            Auto-refresh every 30 seconds
          </small>
        </div>
      </div>
    </div>
  );
}
