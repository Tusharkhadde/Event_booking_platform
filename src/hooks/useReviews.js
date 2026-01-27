// src/hooks/useReviews.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import reviewService from '@/services/reviewService';
import useAuthStore from '@/store/authStore';
import { toast } from '@/hooks/useToast';

// Fetch reviews for a specific event
export function useEventReviews(eventId) {
  return useQuery({
    queryKey: ['event-reviews', eventId],
    queryFn: () => reviewService.getEventReviews(eventId),
    enabled: !!eventId,
  });
}

// Fetch rating summary for a specific event
export function useEventRatingSummary(eventId) {
  return useQuery({
    queryKey: ['event-rating-summary', eventId],
    queryFn: () => reviewService.getEventRatingSummary(eventId),
    enabled: !!eventId,
  });
}

// Add review for event
export function useAddEventReview(eventId) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ rating, comment }) =>
      reviewService.addEventReview({
        event_id: eventId,
        user_id: user.id,
        rating,
        comment,
      }),
    onSuccess: () => {
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['event-reviews', eventId] });
        queryClient.invalidateQueries({ queryKey: ['event-rating-summary', eventId] });
      }
      toast({
        title: 'Review submitted',
        description: 'Thank you for your feedback.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to submit review',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Delete review (for future admin UI)
export function useDeleteEventReview(eventId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId) => reviewService.deleteEventReview(reviewId),
    onSuccess: () => {
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['event-reviews', eventId] });
        queryClient.invalidateQueries({ queryKey: ['event-rating-summary', eventId] });
      }
      toast({
        title: 'Review deleted',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete review',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}