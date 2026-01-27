// src/services/vendorService.js
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

  // Get a single service by ID
  async getServiceById(serviceId) {
    const { data, error } = await supabase
      .from('vendor_services')
      .select(`
        *,
        vendor:profiles!vendor_id(id, name, avatar_url, email)
      `)
      .eq('id', serviceId)
      .single();

    if (error) throw error;
    return data;
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
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
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
      .update({ ...updates, updated_at: new Date().toISOString() })
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

  // Toggle service active status
  async toggleServiceStatus(serviceId, isActive) {
    return this.updateService(serviceId, { is_active: isActive });
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
        service:vendor_services(id, name, category, price)
      `)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get organizer's booking requests
  async getOrganizerBookings(organizerId, status = null) {
    let query = supabase
      .from('vendor_bookings')
      .select(`
        *,
        vendor:profiles!vendor_id(id, name, email, avatar_url),
        event:events(id, title, date, location),
        service:vendor_services(id, name, category, price)
      `)
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get a single booking by ID
  async getBookingById(bookingId) {
    const { data, error } = await supabase
      .from('vendor_bookings')
      .select(`
        *,
        organizer:profiles!organizer_id(id, name, email, avatar_url, phone),
        vendor:profiles!vendor_id(id, name, email, avatar_url, phone),
        event:events(id, title, date, location, description),
        service:vendor_services(id, name, category, price, description)
      `)
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update booking status
  async updateBookingStatus(bookingId, status, notes = null) {
    const updates = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    if (notes) updates.notes = notes;
    
    // Add timestamp based on status
    if (status === 'confirmed') {
      updates.confirmed_at = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
    }

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
      .insert([{
        ...bookingData,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============ AVAILABILITY ============

  // Get vendor availability for a month
  async getVendorAvailability(vendorId, year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const { data, error } = await supabase
      .from('vendor_availability')
      .select('*')
      .eq('vendor_id', vendorId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get vendor availability for a date range
  async getVendorAvailabilityRange(vendorId, startDate, endDate) {
    const { data, error } = await supabase
      .from('vendor_availability')
      .select('*')
      .eq('vendor_id', vendorId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

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
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'vendor_id,date'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Set availability for multiple dates
  async setMultipleDatesAvailability(vendorId, dates, isAvailable) {
    const records = dates.map(date => ({
      vendor_id: vendorId,
      date,
      is_available: isAvailable,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('vendor_availability')
      .upsert(records, {
        onConflict: 'vendor_id,date'
      })
      .select();

    if (error) throw error;
    return data;
  },

  // Check if vendor is available on a specific date
  async checkAvailability(vendorId, date) {
    const { data, error } = await supabase
      .from('vendor_availability')
      .select('is_available')
      .eq('vendor_id', vendorId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    
    // If no record exists, assume available
    return data ? data.is_available : true;
  },

  // ============ STATS ============

  // Get vendor dashboard stats
  async getVendorStats(vendorId) {
    const { data: bookings, error } = await supabase
      .from('vendor_bookings')
      .select('status, final_price, created_at')
      .eq('vendor_id', vendorId);

    if (error) throw error;

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const stats = {
      totalBookings: bookings.length,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalEarnings: 0,
      monthlyEarnings: 0,
      monthlyBookings: 0,
    };

    bookings.forEach((booking) => {
      const bookingDate = new Date(booking.created_at);
      const isThisMonth = bookingDate.getMonth() === thisMonth && 
                          bookingDate.getFullYear() === thisYear;

      switch (booking.status) {
        case 'pending':
          stats.pendingBookings++;
          break;
        case 'confirmed':
          stats.confirmedBookings++;
          break;
        case 'completed':
          stats.completedBookings++;
          const earnings = parseFloat(booking.final_price || 0);
          stats.totalEarnings += earnings;
          if (isThisMonth) {
            stats.monthlyEarnings += earnings;
          }
          break;
        case 'cancelled':
          stats.cancelledBookings++;
          break;
      }

      if (isThisMonth) {
        stats.monthlyBookings++;
      }
    });

    return stats;
  },

  // ============ REVIEWS ============

  // Get vendor reviews
  async getVendorReviews(vendorId, options = {}) {
    let query = supabase
      .from('vendor_reviews')
      .select(`
        *,
        reviewer:profiles!vendor_reviews_reviewer_id_fkey(
          id,
          name,
          avatar_url
        ),
        booking:vendor_bookings(
          id,
          service:vendor_services(name, category)
        )
      `)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get average rating and summary
  async getVendorRatingSummary(vendorId) {
    const { data, error } = await supabase
      .from('vendor_reviews')
      .select('rating')
      .eq('vendor_id', vendorId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { 
        average: 0, 
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    data.forEach(({ rating }) => {
      sum += rating;
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    return {
      average: parseFloat((sum / data.length).toFixed(1)),
      count: data.length,
      distribution,
    };
  },

  // Create a review (after booking completion)
  async createReview(reviewData) {
    const { data, error } = await supabase
      .from('vendor_reviews')
      .insert([{
        ...reviewData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Check if user can review a vendor (has completed booking)
  async canUserReviewVendor(userId, vendorId) {
    const { data, error } = await supabase
      .from('vendor_bookings')
      .select('id')
      .eq('organizer_id', userId)
      .eq('vendor_id', vendorId)
      .eq('status', 'completed')
      .limit(1);

    if (error) throw error;

    // Check if already reviewed
    const { data: existingReview } = await supabase
      .from('vendor_reviews')
      .select('id')
      .eq('reviewer_id', userId)
      .eq('vendor_id', vendorId)
      .limit(1);

    return {
      hasCompletedBooking: data && data.length > 0,
      hasAlreadyReviewed: existingReview && existingReview.length > 0,
      canReview: (data && data.length > 0) && (!existingReview || existingReview.length === 0)
    };
  },

  // ============ VENDOR PROFILE ============

  // Get vendor profile with stats
  async getVendorProfile(vendorId) {
    const [profile, rating, services] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', vendorId)
        .single(),
      this.getVendorRatingSummary(vendorId),
      this.getVendorServices(vendorId)
    ]);

    if (profile.error) throw profile.error;

    return {
      ...profile.data,
      rating,
      services: services.filter(s => s.is_active),
      totalServices: services.length
    };
  },
};

export default vendorService;