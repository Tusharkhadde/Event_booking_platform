import { useState } from 'react';
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
import { toast } from '@/hooks/useToast';

function NotificationsPage() {
  // Mock data - In real app, fetch from Supabase
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'booking',
      title: 'Booking Confirmed',
      message: 'Your booking for Summer Music Festival 2024 has been confirmed.',
      is_read: false,
      created_at: '2024-06-15T10:30:00',
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Successful',
      message: 'Payment of $250.00 for Summer Music Festival 2024 was successful.',
      is_read: false,
      created_at: '2024-06-15T10:29:00',
    },
    {
      id: '3',
      type: 'reminder',
      title: 'Event Reminder',
      message: 'Tech Conference 2024 is happening in 3 days. Don\'t forget to attend!',
      is_read: true,
      created_at: '2024-06-14T09:00:00',
    },
    {
      id: '4',
      type: 'info',
      title: 'Venue Change',
      message: 'The venue for Art Exhibition has been changed to Gallery West.',
      is_read: true,
      created_at: '2024-06-13T15:45:00',
    },
    {
      id: '5',
      type: 'alert',
      title: 'Event Cancelled',
      message: 'Jazz Night on April 20th has been cancelled. Refund will be processed.',
      is_read: true,
      created_at: '2024-06-12T11:20:00',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getNotificationIcon = (type) => {
    const icons = {
      booking: Ticket,
      payment: CreditCard,
      reminder: Calendar,
      info: Info,
      alert: AlertCircle,
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colors = {
      booking: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
      payment: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
      reminder: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
      info: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
      alert: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === notificationId) {
          return { ...n, is_read: true };
        }
        return n;
      })
    );
    toast({
      title: 'Marked as read',
      description: 'Notification marked as read.',
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
    toast({
      title: 'All marked as read',
      description: 'All notifications marked as read.',
    });
  };

  const deleteNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== notificationId)
    );
    toast({
      title: 'Notification deleted',
      description: 'Notification has been removed.',
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: 'All cleared',
      description: 'All notifications have been cleared.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your events and bookings
          </p>
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            )}
            <Button variant="outline" onClick={clearAllNotifications}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Unread Count Badge */}
      {unreadCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="default">{unreadCount} unread</Badge>
        </div>
      )}

      {/* Notifications List */}
      {notifications.length === 0 && (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! Check back later for updates."
        />
      )}

      {notifications.length > 0 && (
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
                          <p className="font-medium">
                            {notification.title}
                            {!notification.is_read && (
                              <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary" />
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
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
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(notification.id)}
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

export default NotificationsPage;