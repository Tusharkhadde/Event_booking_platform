// src/services/transportService.js
import supabase from './supabaseClient';

export const transportService = {
  // User: get own requests
  async getUserTransportRequests() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const currentUser = userData?.user;
    if (!currentUser) return [];

    const { data, error } = await supabase
      .from('transport_requests')
      .select(`
        *,
        event:events(id, title, date, location)
      `)
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Organizer: get all requests for an event
  async getEventTransportRequests(eventId) {
    const { data, error } = await supabase
      .from('transport_requests')
      .select(`
        *,
        user:profiles!transport_requests_user_id_fkey(
          id, name, email, avatar_url
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // User: create new request
  async createTransportRequest(requestData) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const currentUser = userData?.user;
    if (!currentUser) throw new Error('Not authenticated');

    const payload = {
      ...requestData,
      user_id: currentUser.id,
    };

    const { data, error } = await supabase
      .from('transport_requests')
      .insert([payload])
      .select(`
        *,
        event:events(id, title, date, location)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Organizer: update status
  async updateTransportStatus(requestId, status) {
    const { data, error } = await supabase
      .from('transport_requests')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default transportService;