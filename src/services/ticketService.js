// src/services/ticketService.js
import supabase from './supabaseClient';

export const ticketService = {
  async getTicketsByEvent(eventId) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('event_id', eventId)
      .order('price', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createTicket(ticketData) {
    const { data, error } = await supabase
      .from('tickets')
      .insert([ticketData])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async updateTicket(ticketId, updates) {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTicket(ticketId) {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticketId);

    if (error) throw error;
  },
};

export default ticketService;