// src/hooks/useNotifications.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import notificationService from "@/services/notificationService";
import useAuthStore from "@/store/authStore";
import { toast } from "@/hooks/useToast";

export function useNotifications() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => notificationService.getNotifications(user.id),
    enabled: !!user?.id,
  });
}

// ✅ Mark ONE notification as read
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (notificationId) =>
      notificationService.markAsRead(notificationId),

    onSuccess: () => {
      queryClient.invalidateQueries(["notifications", user?.id]);
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to mark as read",
        variant: "destructive",
      });
    },
  });
}

// ✅ Mark ALL notifications as read
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(user.id),

    onSuccess: () => {
      queryClient.invalidateQueries(["notifications", user?.id]);
      toast({
        title: "Done",
        description: "All notifications marked as read",
      });
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to mark all as read",
        variant: "destructive",
      });
    },
  });
}

// ✅ Delete notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (notificationId) =>
      notificationService.deleteNotification(notificationId),

    onSuccess: () => {
      queryClient.invalidateQueries(["notifications", user?.id]);
      toast({
        title: "Deleted",
        description: "Notification deleted successfully",
      });
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete notification",
        variant: "destructive",
      });
    },
  });
}

export function useUnreadCount() {
  const { data } = useNotifications();
  if (!data) return 0;
  return data.filter((n) => !n.is_read).length;
}
