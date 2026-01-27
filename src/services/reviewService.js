// src/services/reviewService.js
import supabase from './supabaseClient';

export const reviewService = {
  // Get reviews for an event with user profile
  async getEventReviews(eventId) {
    const { data, error } = await supabase
      .from('event_reviews')
      .select(`
        *,
        user:profiles!event_reviews_user_id_fkey(
          id,
          name,
          avatar_url
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Add a review
  async addEventReview({ event_id, user_id, rating, comment }) {
    const { data, error } = await supabase
      .from('event_reviews')
      .insert([{ event_id, user_id, rating, comment }])
      .select(`
        *,
        user:profiles!event_reviews_user_id_fkey(
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a review (user's own or admin)
  async deleteEventReview(reviewId) {
    const { error } = await supabase
      .from('event_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  },

  // Get rating summary for an event
  async getEventRatingSummary(eventId) {
    const { data, error } = await supabase
      .from('event_reviews')
      .select('rating')
      .eq('event_id', eventId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = data.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / data.length;

    return {
      average: parseFloat(average.toFixed(1)),
      count: data.length,
    };
  },
};

export default reviewService;