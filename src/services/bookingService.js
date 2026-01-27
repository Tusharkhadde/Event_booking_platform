// src/services/bookingService.js
import supabase from './supabaseClient';

export const bookingService = {
  // Create a booking record when user confirms booking
  async createBooking({ eventId, ticketId, qty, unitPrice, totalAmount }) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const currentUser = userData?.user;
    if (!currentUser) throw new Error('Not authenticated');

    const payload = {
      user_id: currentUser.id,
      event_id: eventId,
      ticket_id: ticketId,
      qty,
      total_amount: totalAmount,
      unit_price: unitPrice,
      status: 'confirmed',
      payment_status: 'paid',
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert([payload])
      .select(
        `
        *,
        event:events(id, title, date, location, banner_url),
        ticket:tickets(id, type, price)
      `
      )
      .single();

    if (error) throw error;
    return data;
  },

  // Get all bookings for current user
  async getUserBookings() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const currentUser = userData?.user;
    if (!currentUser) return [];

    const { data, error } = await supabase
      .from('bookings')
      .select(
        `
        *,
        event:events(id, title, date, location, banner_url),
        ticket:tickets(id, type, price)
      `
      )
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

export default bookingService;