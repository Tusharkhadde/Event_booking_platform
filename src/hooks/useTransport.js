// src/hooks/useTransport.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import transportService from '@/services/transportService';
import { toast } from '@/hooks/useToast';

// User: own transport requests
export function useUserTransportRequests() {
  return useQuery({
    queryKey: ['user-transport-requests'],
    queryFn: transportService.getUserTransportRequests,
  });
}

// Organizer: all transport requests for an event
export function useEventTransportRequests(eventId) {
  return useQuery({
    queryKey: ['event-transport-requests', eventId],
    queryFn: () => transportService.getEventTransportRequests(eventId),
    enabled: !!eventId,
  });
}

// User: create request
export function useCreateTransportRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transportService.createTransportRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-transport-requests'] });
      toast({
        title: 'Request submitted',
        description: 'Your transportation/parking request has been recorded.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to submit request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Organizer: update status
export function useUpdateTransportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, status }) =>
      transportService.updateTransportStatus(requestId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['event-transport-requests', data.event_id],
      });
      toast({
        title: 'Status updated',
        description: `Request marked as ${data.status}.`,
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