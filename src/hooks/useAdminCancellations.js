// src/hooks/useAdminCancellations.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cancellationService from '@/services/cancellationService';
import { toast } from '@/hooks/useToast';

export function useAllCancellations() {
  return useQuery({
    queryKey: ['admin-cancellations'],
    queryFn: cancellationService.getAllCancellations,
  });
}

export function useAdminUpdateCancellationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cancellationId, status }) =>
      cancellationService.updateCancellationStatus(cancellationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cancellations'] });
      toast({
        title: 'Status updated',
        description: 'Cancellation status has been updated.',
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