// src/hooks/useMessages.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import messageService from '@/services/messageService';
import { toast } from '@/hooks/useToast';

// Organizer: messages for a specific event
export function useEventMessages(eventId) {
  return useQuery({
    queryKey: ['event-messages', eventId],
    queryFn: () => messageService.getEventMessages(eventId),
    enabled: !!eventId,
  });
}

// Organizer: send message in event context
export function useSendEventMessage(eventId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ receiverId, text }) =>
      messageService.sendMessage({ eventId, receiverId, text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-messages', eventId] });
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Vendor/User: all messages for current user (inbox)
export function useUserMessages() {
  return useQuery({
    queryKey: ['user-messages'],
    queryFn: messageService.getUserMessages,
  });
}