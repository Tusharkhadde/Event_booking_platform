import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import eventService from '@/services/eventService';
import useAuthStore from '@/store/authStore';
import { toast } from '@/hooks/useToast';

export function useEvents(filters = {}) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventService.getEvents(filters),
  });
}

export function useEvent(eventId) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getEventById(eventId),
    enabled: !!eventId,
  });
}

export function useOrganizerEvents() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['organizer-events', user?.id],
    queryFn: () => eventService.getEvents({ organizer_id: user.id }),
    enabled: !!user?.id,
  });
}

export function useFeaturedEvents(limit = 6) {
  return useQuery({
    queryKey: ['featured-events', limit],
    queryFn: () => eventService.getFeaturedEvents(limit),
  });
}

export function useUpcomingEvents(limit = 10) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['upcoming-events', limit, user?.id],
    queryFn: () => eventService.getUpcomingEventsForUser(user?.id),
    enabled: !!user?.id,
  });
}

export function useEventStats() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['event-stats', user?.id],
    queryFn: () => eventService.getEvents({ organizer_id: user.id }),
    enabled: !!user?.id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (eventData) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return eventService.createEvent({
        ...eventData,
        organizer_id: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      toast({
        title: 'Event created!',
        description: 'Your event has been created successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, updates }) => eventService.updateEvent(eventId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      queryClient.invalidateQueries({ queryKey: ['event', data.id] });
      toast({
        title: 'Event updated!',
        description: 'Your event has been updated successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventService.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      toast({
        title: 'Event deleted!',
        description: 'Your event has been deleted successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, status }) => eventService.updateEventStatus(eventId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      queryClient.invalidateQueries({ queryKey: ['event', data.id] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      toast({
        title: 'Status updated!',
        description: 'Event status has been updated.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}