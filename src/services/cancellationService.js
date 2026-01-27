// src/services/cancellationService.js
import supabase from './supabaseClient';

export const cancellationService = {
  // User requests a cancellation
  async requestCancellation({ bookingId, reason }) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const currentUser = userData?.user;
    if (!currentUser) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('cancellations')
      .insert([
        {
          booking_id: bookingId,
          requester_id: currentUser.id,
          reason,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  // Get cancellations for a specific user (for Customer)
  async getUserCancellations() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const currentUser = userData?.user;
    if (!currentUser) return [];

    const { data, error } = await supabase
      .from('cancellations')
      .select(`
        *,
        booking:bookings(
          *,
          event:events(id, title, banner_url, date)
        )
      `)
      .eq('requester_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get cancellations for a specific event (for Organizer)
  async getEventCancellations(eventId) {
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('event_id', eventId);

    if (bookingsError) throw bookingsError;
    if (!bookings || bookings.length === 0) return [];

    const bookingIds = bookings.map((b) => b.id);

    const { data, error } = await supabase
      .from('cancellations')
      .select(`
        *,
        booking:bookings(
          *,
          user:profiles(id, name, email, avatar_url)
        )
      `)
      .in('booking_id', bookingIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Organizer/Admin updates status (Approve/Reject)
  async updateCancellationStatus(cancellationId, status, notes = null) {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (notes) {
      updateData.admin_notes = notes;
    }

    // Add resolved timestamp if approved or rejected
    if (status === 'approved' || status === 'rejected') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('cancellations')
      .update(updateData)
      .eq('id', cancellationId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  // Get a single cancellation by ID
  async getCancellationById(cancellationId) {
    const { data, error } = await supabase
      .from('cancellations')
      .select(`
        *,
        booking:bookings(
          *,
          event:events(id, title, date, location),
          user:profiles(id, name, email)
        ),
        requester:profiles!cancellations_requester_id_fkey(id, name, email, avatar_url)
      `)
      .eq('id', cancellationId)
      .single();

    if (error) throw error;
    return data;
  },

  // Check if a booking already has a pending cancellation
  async hasPendingCancellation(bookingId) {
    const { data, error } = await supabase
      .from('cancellations')
      .select('id, status')
      .eq('booking_id', bookingId)
      .eq('status', 'pending')
      .limit(1);

    if (error) throw error;
    return data && data.length > 0;
  },

  // ===== ADMIN METHODS =====

  // Get all cancellations (Admin-level)
  async getAllCancellations() {
    const { data, error } = await supabase
      .from('cancellations')
      .select(`
        *,
        booking:bookings(
          id,
          status,
          total_amount,
          event:events(id, title, date, banner_url),
          user:profiles(id, name, email, avatar_url)
        ),
        requester:profiles!cancellations_requester_id_fkey(id, name, email, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get cancellations with filters (Admin-level)
  async getFilteredCancellations(filters = {}) {
    let query = supabase
      .from('cancellations')
      .select(`
        *,
        booking:bookings(
          id,
          status,
          total_amount,
          event:events(id, title, date, banner_url),
          user:profiles(id, name, email, avatar_url)
        ),
        requester:profiles!cancellations_requester_id_fkey(id, name, email, avatar_url)
      `);

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Apply date range filter
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // Apply search filter (searches in reason)
    if (filters.search) {
      query = query.ilike('reason', `%${filters.search}%`);
    }

    // Order by created_at descending
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Get cancellation statistics (Admin-level)
  async getCancellationStats() {
    const { data, error } = await supabase
      .from('cancellations')
      .select('id, status, created_at');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      thisMonth: 0,
    };

    if (data) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      data.forEach((cancellation) => {
        // Count by status
        if (cancellation.status === 'pending') {
          stats.pending += 1;
        } else if (cancellation.status === 'approved') {
          stats.approved += 1;
        } else if (cancellation.status === 'rejected') {
          stats.rejected += 1;
        }

        // Count this month
        const createdAt = new Date(cancellation.created_at);
        if (createdAt >= startOfMonth) {
          stats.thisMonth += 1;
        }
      });
    }

    return stats;
  },

  // Bulk update cancellation statuses (Admin-level)
  async bulkUpdateStatus(cancellationIds, status, notes = null) {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (notes) {
      updateData.admin_notes = notes;
    }

    if (status === 'approved' || status === 'rejected') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('cancellations')
      .update(updateData)
      .in('id', cancellationIds)
      .select('*');

    if (error) throw error;
    return data || [];
  },
};

export default cancellationService;