// src/hooks/useGuests.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import guestService from '@/services/guestService';
import { toast } from '@/hooks/useToast';

// Get all guests for an event
export function useGuests(eventId) {
  return useQuery({
    queryKey: ['guests', eventId],
    queryFn: () => guestService.getGuests(eventId),
    enabled: !!eventId,
  });
}

// Guest stats (total, confirmed, pending, declined, etc.)
export function useGuestStats(eventId) {
  return useQuery({
    queryKey: ['guest-stats', eventId],
    queryFn: () => guestService.getGuestStats(eventId),
    enabled: !!eventId,
  });
}

// Add a guest
export function useAddGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guestData) => guestService.addGuest(guestData),
    onSuccess: (data) => {
      // Invalidate guests & stats for this event
      if (data && data.event_id) {
        queryClient.invalidateQueries({ queryKey: ['guests', data.event_id] });
        queryClient.invalidateQueries({ queryKey: ['guest-stats', data.event_id] });
      }
      toast({
        title: 'Guest added',
        description: 'The guest has been added to your event.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add guest',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Update guest (general purpose, used by GuestManagementPage)
export function useUpdateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ guestId, updates }) =>
      guestService.updateGuest(guestId, updates),
    onSuccess: (data) => {
      if (data && data.event_id) {
        queryClient.invalidateQueries({ queryKey: ['guests', data.event_id] });
        queryClient.invalidateQueries({ queryKey: ['guest-stats', data.event_id] });
      }
      toast({
        title: 'Guest updated',
        description: 'Guest details have been updated.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update guest',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Delete guest
export function useDeleteGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ guestId, eventId }) => guestService.deleteGuest(guestId),
    onSuccess: (_, variables) => {
      if (variables && variables.eventId) {
        queryClient.invalidateQueries({ queryKey: ['guests', variables.eventId] });
        queryClient.invalidateQueries({ queryKey: ['guest-stats', variables.eventId] });
      }
      toast({
        title: 'Guest removed',
        description: 'The guest has been removed from your event.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to remove guest',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Toggle guest check-in (used by LiveCheckinPage)
export function useToggleGuestCheckin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ guestId, checkedIn }) =>
      guestService.toggleCheckin(guestId, checkedIn),
    onSuccess: (data) => {
      if (data && data.event_id) {
        queryClient.invalidateQueries({ queryKey: ['guests', data.event_id] });
        queryClient.invalidateQueries({ queryKey: ['guest-stats', data.event_id] });
      }
      toast({
        title: data.checked_in ? 'Guest checked in' : 'Check-in undone',
        description: data.name,
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Check-in failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}