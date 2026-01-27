// src/services/seatService.js
import supabase from './supabaseClient';

export const seatService = {
  // Get all seats for a venue
  async getSeatsByVenue(venueId) {
    const { data, error } = await supabase
      .from('seats')
      .select('*')
      .eq('venue_id', venueId)
      .order('row_label', { ascending: true })
      .order('seat_number', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Bulk-generate seats for a venue (rows A.., seats 1..)
  async generateSeatLayout({ venueId, rowCount, seatsPerRow }) {
    const rows = [];
    let index = 0;

    while (index < rowCount) {
      const rowLabel = String.fromCharCode(65 + index); // A, B, C...
      rows.push(rowLabel);
      index += 1;
    }

    const payload = [];
    rows.forEach((row) => {
      let seatIndex = 1;
      while (seatIndex <= seatsPerRow) {
        payload.push({
          venue_id: venueId,
          row_label: row,
          seat_number: String(seatIndex),
          is_available: true,
        });
        seatIndex += 1;
      }
    });

    const { data, error } = await supabase
      .from('seats')
      .insert(payload)
      .select('*');

    if (error) throw error;
    return data;
  },

  // Toggle availability
  async toggleSeatAvailability(seatId, isAvailable) {
    const { data, error } = await supabase
      .from('seats')
      .update({ is_available: isAvailable })
      .eq('id', seatId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default seatService;