// src/hooks/useBookings.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import bookingService from '@/services/bookingService';
import { toast } from '@/hooks/useToast';

export function useUserBookings() {
  return useQuery({
    queryKey: ['user-bookings'],
    queryFn: bookingService.getUserBookings,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      toast({
        title: 'Booking created',
        description: 'Your booking has been saved.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Booking failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}