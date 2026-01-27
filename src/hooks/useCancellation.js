// src/hooks/useCancellation.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cancellationService from '@/services/cancellationService';
import { toast } from '@/hooks/useToast';

export function useRequestCancellation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancellationService.requestCancellation,
    onSuccess: (data) => {
      toast({ title: 'Cancellation Requested', description: 'Waiting for organizer approval.' });
      queryClient.invalidateQueries({ queryKey: ['user-cancellations'] });
    },
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });
}

export function useEventCancellations(eventId) {
  return useQuery({
    queryKey: ['event-cancellations', eventId],
    queryFn: () => cancellationService.getEventCancellations(eventId),
    enabled: !!eventId,
  });
}

export function useUserCancellations() {
  return useQuery({
    queryKey: ['user-cancellations'],
    queryFn: cancellationService.getUserCancellations,
  });
}

export function useUpdateCancellationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancellationService.updateCancellationStatus,
    onSuccess: (data) => {
      toast({ title: 'Status Updated', description: `Cancellation ${data.status}.` });
      queryClient.invalidateQueries({ queryKey: ['event-cancellations'] });
    },
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });
}