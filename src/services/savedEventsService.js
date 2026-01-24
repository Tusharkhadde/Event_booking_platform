import supabase from './supabaseClient';

export const savedEventsService = {
  // Get user's saved events
  async getSavedEvents(userId) {
    const { data, error } = await supabase
      .from('saved_events')
      .select(`
        id,
        created_at,
        event:events(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map((item) => item.event) || [];
  },

  // Save an event
  async saveEvent(userId, eventId) {
    const { data, error } = await supabase
      .from('saved_events')
      .insert([{ user_id: userId, event_id: eventId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Unsave an event
  async unsaveEvent(userId, eventId) {
    const { error } = await supabase
      .from('saved_events')
      .delete()
      .eq('user_id', userId)
      .eq('event_id', eventId);

    if (error) throw error;
  },

  // Check if event is saved
  async isEventSaved(userId, eventId) {
    const { data, error } = await supabase
      .from('saved_events')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },
};

export default savedEventsService;