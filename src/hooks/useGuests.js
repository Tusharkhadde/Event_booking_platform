import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import guestService from '@/services/guestService';
import { toast } from '@/hooks/useToast';

export function useGuests(eventId) {
  return useQuery({
    queryKey: ['guests', eventId],
    queryFn: () => guestService.getGuests(eventId),
    enabled: !!eventId,
  });
}

export function useGuestStats(eventId) {
  return useQuery({
    queryKey: ['guest-stats', eventId],
    queryFn: () => guestService.getGuestStats(eventId),
    enabled: !!eventId,
  });
}

export function useAddGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: guestService.addGuest,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guests', variables.event_id] });
      queryClient.invalidateQueries({ queryKey: ['guest-stats', variables.event_id] });
      toast({
        title: 'Guest Added',
        description: 'The guest has been added to the list.',
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

export function useUpdateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ guestId, updates }) => guestService.updateGuest(guestId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['guests', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['guest-stats', data.event_id] });
      toast({
        title: 'Guest Updated',
        description: 'Guest details have been updated.',
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

export function useDeleteGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ guestId }) => guestService.deleteGuest(guestId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guests', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['guest-stats', variables.eventId] });
      toast({
        title: 'Guest Removed',
        description: 'The guest has been removed from the list.',
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