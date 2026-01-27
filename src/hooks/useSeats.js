// src/hooks/useSeats.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import seatService from '@/services/seatService';
import { toast } from '@/hooks/useToast';

export function useSeats(venueId) {
  return useQuery({
    queryKey: ['seats', venueId],
    queryFn: () => seatService.getSeatsByVenue(venueId),
    enabled: !!venueId,
  });
}

export function useGenerateSeatLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seatService.generateSeatLayout,
    onSuccess: (data) => {
      if (data && data[0] && data[0].venue_id) {
        queryClient.invalidateQueries({ queryKey: ['seats', data[0].venue_id] });
      }
      toast({
        title: 'Seat layout created',
        description: 'Seats have been generated for this venue.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to generate seats',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useToggleSeatAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ seatId, isAvailable }) =>
      seatService.toggleSeatAvailability(seatId, isAvailable),
    onSuccess: (data) => {
      if (data && data.venue_id) {
        queryClient.invalidateQueries({ queryKey: ['seats', data.venue_id] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Failed to update seat',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}