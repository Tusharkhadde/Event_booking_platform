// src/services/messageService.js
import supabase from './supabaseClient';

export const messageService = {
  // All messages for an event (for organizer)
  async getEventMessages(eventId) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, name, avatar_url, role),
        receiver:profiles!messages_receiver_id_fkey(id, name, avatar_url, role)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Send a message in context of an event
  async sendMessage({ eventId, receiverId, text }) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const currentUser = userData?.user;
    if (!currentUser) throw new Error('Not authenticated');

    const payload = {
      event_id: eventId,
      sender_id: currentUser.id,
      receiver_id: receiverId || null,
      message: text,
    };

    const { data, error } = await supabase
      .from('messages')
      .insert([payload])
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, name, avatar_url, role),
        receiver:profiles!messages_receiver_id_fkey(id, name, avatar_url, role)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Messages for current user (vendor inbox)
  async getUserMessages() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const currentUser = userData?.user;
    if (!currentUser) return [];

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, name, avatar_url, role),
        receiver:profiles!messages_receiver_id_fkey(id, name, avatar_url, role),
        event:events(id, title, date)
      `)
      .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

export default messageService;