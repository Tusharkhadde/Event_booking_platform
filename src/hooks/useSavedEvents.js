import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import savedEventsService from '@/services/savedEventsService';
import useAuthStore from '@/store/authStore';
import { toast } from '@/hooks/useToast';

export function useSavedEvents() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['saved-events', user?.id],
    queryFn: () => savedEventsService.getSavedEvents(user.id),
    enabled: !!user?.id,
  });
}

export function useIsEventSaved(eventId) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['is-saved', user?.id, eventId],
    queryFn: () => savedEventsService.isEventSaved(user.id, eventId),
    enabled: !!user?.id && !!eventId,
  });
}

export function useSaveEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (eventId) => savedEventsService.saveEvent(user.id, eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['saved-events'] });
      queryClient.invalidateQueries({ queryKey: ['is-saved', user?.id, eventId] });
      toast({
        title: 'Event Saved',
        description: 'Event has been added to your saved list.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUnsaveEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (eventId) => savedEventsService.unsaveEvent(user.id, eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['saved-events'] });
      queryClient.invalidateQueries({ queryKey: ['is-saved', user?.id, eventId] });
      toast({
        title: 'Removed',
        description: 'Event has been removed from your saved list.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}