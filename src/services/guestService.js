// src/services/guestService.js
import supabase from './supabaseClient';

const guestService = {
  async getGuests(eventId) {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addGuest(guestData) {
    const { data, error } = await supabase
      .from('guests')
      .insert([guestData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateGuest(guestId, updates) {
    const { data, error } = await supabase
      .from('guests')
      .update(updates)
      .eq('id', guestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteGuest(guestId) {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', guestId);

    if (error) throw error;
  },

  async getGuestStats(eventId) {
    const { data, error } = await supabase
      .from('guests')
      .select('rsvp_status, plus_ones')
      .eq('event_id', eventId);

    if (error) throw error;

    const stats = {
      total_invites: data.length,
      confirmed: 0,
      pending: 0,
      declined: 0,
    };

    data.forEach((g) => {
      const status = g.rsvp_status || 'pending';
      if (status === 'accepted') stats.confirmed += 1;
      else if (status === 'declined') stats.declined += 1;
      else stats.pending += 1;
    });

    return stats;
  },

  async toggleCheckin(guestId, checkedIn) {
    const updates = {
      checked_in: checkedIn,
      checked_in_at: checkedIn ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from('guests')
      .update(updates)
      .eq('id', guestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default guestService;