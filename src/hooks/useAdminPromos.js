// src/hooks/useAdminPromos.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import promoService from '@/services/promoService';
import { toast } from '@/hooks/useToast';

export function useAdminPromos() {
  return useQuery({
    queryKey: ['admin-promos'],
    queryFn: promoService.getAllPromos,
  });
}

export function useCreatePromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: promoService.createPromo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
      toast({
        title: 'Promo created',
        description: 'New promo code has been added.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create promo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdatePromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => promoService.updatePromo(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
      toast({
        title: 'Promo updated',
        description: 'Promo details have been updated.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update promo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeletePromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: promoService.deletePromo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
      toast({
        title: 'Promo deleted',
        description: 'The promo code has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete promo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}