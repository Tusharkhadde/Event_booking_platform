import supabase from './supabaseClient';

export const vendorService = {
  // ============ SERVICES ============
  
  // Get all services for a vendor
  async getVendorServices(vendorId) {
    const { data, error } = await supabase
      .from('vendor_services')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get all active services (for browsing)
  async getAllActiveServices(filters = {}) {
    let query = supabase
      .from('vendor_services')
      .select(`
        *,
        vendor:profiles!vendor_id(id, name, avatar_url)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Create a service
  async createService(serviceData) {
    const { data, error } = await supabase
      .from('vendor_services')
      .insert([serviceData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a service
  async updateService(serviceId, updates) {
    const { data, error } = await supabase
      .from('vendor_services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a service
  async deleteService(serviceId) {
    const { error } = await supabase
      .from('vendor_services')
      .delete()
      .eq('id', serviceId);

    if (error) throw error;
  },

  // ============ BOOKINGS ============

  // Get vendor's bookings
  async getVendorBookings(vendorId, status = null) {
    let query = supabase
      .from('vendor_bookings')
      .select(`
        *,
        organizer:profiles!organizer_id(id, name, email, avatar_url),
        event:events(id, title, date, location),
        service:vendor_services(id, name, category)
      `)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Update booking status
  async updateBookingStatus(bookingId, status, notes = null) {
    const updates = { status };
    if (notes) updates.notes = notes;

    const { data, error } = await supabase
      .from('vendor_bookings')
      .update(updates)
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create a booking request (by organizer)
  async createBookingRequest(bookingData) {
    const { data, error } = await supabase
      .from('vendor_bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============ AVAILABILITY ============

  // Get vendor availability for a month
  async getVendorAvailability(vendorId, year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const { data, error } = await supabase
      .from('vendor_availability')
      .select('*')
      .eq('vendor_id', vendorId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;
    return data || [];
  },

  // Set availability for a date
  async setAvailability(vendorId, date, isAvailable, note = null) {
    const { data, error } = await supabase
      .from('vendor_availability')
      .upsert({
        vendor_id: vendorId,
        date,
        is_available: isAvailable,
        note,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============ STATS ============

  // Get vendor dashboard stats
  async getVendorStats(vendorId) {
    const { data: bookings, error } = await supabase
      .from('vendor_bookings')
      .select('status, final_price')
      .eq('vendor_id', vendorId);

    if (error) throw error;

    const stats = {
      totalBookings: bookings.length,
      pendingBookings: 0,
      completedBookings: 0,
      totalEarnings: 0,
    };

    bookings.forEach((booking) => {
      if (booking.status === 'pending') {
        stats.pendingBookings++;
      } else if (booking.status === 'completed') {
        stats.completedBookings++;
        stats.totalEarnings += parseFloat(booking.final_price || 0);
      }
    });

    return stats;
  },

  // ============ REVIEWS ============

  // Get vendor reviews
  async getVendorReviews(vendorId) {
    const { data, error } = await supabase
      .from('vendor_reviews')
      .select(`
        *,
        reviewer:profiles!reviewer_id(id, name, avatar_url)
      `)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get average rating
  async getVendorRating(vendorId) {
    const { data, error } = await supabase
      .from('vendor_reviews')
      .select('rating')
      .eq('vendor_id', vendorId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = data.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: (sum / data.length).toFixed(1),
      count: data.length,
    };
  },
};

export default vendorService;