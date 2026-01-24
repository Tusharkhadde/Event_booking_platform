import supabase from './supabaseClient';

export const guestService = {
  // Get all guests for an event
  async getGuests(eventId) {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Add a new guest
  async addGuest(guestData) {
    const { data, error } = await supabase
      .from('guests')
      .insert([guestData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a guest (RSVP, details)
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

  // Delete a guest
  async deleteGuest(guestId) {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', guestId);

    if (error) throw error;
  },

  // Get Guest Statistics
  async getGuestStats(eventId) {
    const { data, error } = await supabase
      .from('guests')
      .select('rsvp_status, plus_ones')
      .eq('event_id', eventId);

    if (error) throw error;

    const stats = {
      total_guests: 0, // includes plus ones
      total_invites: data.length,
      confirmed: 0,
      declined: 0,
      pending: 0,
    };

    data.forEach((guest) => {
      const partySize = 1 + (guest.plus_ones || 0);
      
      if (guest.rsvp_status === 'accepted') {
        stats.confirmed += partySize;
      } else if (guest.rsvp_status === 'declined') {
        stats.declined += partySize; // usually 0 contribution if declined, but tracking intent
      } else {
        stats.pending += partySize;
      }
      
      // Total count based on acceptance + pending (potential)
      if (guest.rsvp_status !== 'declined') {
        stats.total_guests += partySize;
      }
    });

    return stats;
  },
};

export default guestService;