import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import venueService from '@/services/venueService';
import { toast } from '@/hooks/useToast';

export function useVenues(filters = {}) {
  return useQuery({
    queryKey: ['venues', filters],
    queryFn: () => venueService.getAllVenues(filters),
  });
}

export function useVenue(id) {
  return useQuery({
    queryKey: ['venue', id],
    queryFn: () => venueService.getVenueById(id),
    enabled: !!id,
  });
}

export function useCreateVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: venueService.createVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast({
        title: 'Venue Created',
        description: 'The venue has been successfully added.',
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

export function useAddVenueReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: venueService.addReview,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['venue', variables.venue_id] });
      toast({
        title: 'Review Added',
        description: 'Thank you for your feedback!',
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