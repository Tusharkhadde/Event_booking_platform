import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  CreditCard,
  Ticket,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import EmptyState from '@/components/common/EmptyState';
import { formatDateTime } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "@/hooks/useNotifications";


function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();

  const unreadCount = notifications
    ? notifications.filter((n) => !n.is_read).length
    : 0;

  const getNotificationIcon = (type) => {
    if (type === 'booking') return Ticket;
    if (type === 'payment') return CreditCard;
    if (type === 'reminder') return Calendar;
    if (type === 'system') return AlertCircle;
    return Info;
  };

  const getNotificationColor = (type) => {
    if (type === 'booking') {
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400';
    }
    if (type === 'reminder') {
      return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400';
    }
    if (type === 'system') {
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400';
    }
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
  };

  const handleMarkRead = (id) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllMutation.mutate();
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <HeaderSkeleton />
        <Card>
          <CardContent className="p-0">
            <NotificationSkeletonList />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your bookings, events, and reminders
          </p>
        </div>
        {notifications && notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markAllMutation.isPending}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Unread Badge */}
      {notifications && notifications.length > 0 && (
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="default">{unreadCount} unread</Badge>
          )}
          <p className="text-sm text-muted-foreground">
            Total {notifications.length} notifications
          </p>
        </div>
      )}

      {/* Empty State */}
      {(!notifications || notifications.length === 0) && (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! Check back later for updates."
        />
      )}

      {/* Notifications List */}
      {notifications && notifications.length > 0 && (
        <Card>
          <CardContent className="p-0">
            {notifications.map((notification, index) => {
              const Icon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);

              return (
                <div key={notification.id}>
                  <div
                    className={cn(
                      'flex items-start gap-4 p-4 transition-colors hover:bg-muted/50',
                      !notification.is_read && 'bg-primary/5'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn('rounded-full p-2', iconColor)}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {notification.title}
                            {!notification.is_read && (
                              <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                            )}
                          </p>
                          {notification.message && (
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(notification.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkRead(notification.id)}
                          disabled={markReadMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(notification.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <Skeleton className="h-9 w-32" />
    </div>
  );
}

function NotificationSkeletonList() {
  return (
    <div className="space-y-2 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
}

export default NotificationsPage;