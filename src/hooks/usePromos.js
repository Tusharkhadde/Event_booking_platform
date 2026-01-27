// src/hooks/usePromos.js
import { useMutation } from '@tanstack/react-query';
import promoService from '@/services/promoService';
import { toast } from '@/hooks/useToast';

export function useValidatePromo() {
  return useMutation({
    mutationFn: promoService.validatePromo,
    onError: (error) => {
      toast({
        title: 'Promo invalid',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}