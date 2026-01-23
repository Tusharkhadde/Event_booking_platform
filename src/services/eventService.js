import supabase from './supabaseClient';

export const eventService = {
  async createEvent(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getEvent(eventId) {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!organizer_id(id, name, email, avatar_url)
      `)
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return data;
  },

  async getAllEvents(filters = {}) {
    let query = supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!organizer_id(id, name, email, avatar_url)
      `)
      .eq('is_public', true)
      .order('date', { ascending: true });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
    }

    if (filters.dateFrom) {
      query = query.gte('date', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('date', filters.dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getOrganizerEvents(organizerId) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateEvent(eventId, updates) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteEvent(eventId) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  },

  async updateEventStatus(eventId, status) {
    const { data, error } = await supabase
      .from('events')
      .update({ status })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUpcomingEvents(limit = 10) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!organizer_id(id, name, email, avatar_url)
      `)
      .eq('is_public', true)
      .gte('date', today)
      .eq('status', 'upcoming')
      .order('date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getFeaturedEvents(limit = 6) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!organizer_id(id, name, email, avatar_url)
      `)
      .eq('is_public', true)
      .gte('date', today)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async uploadEventBanner(eventId, file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${eventId}-${Date.now()}.${fileExt}`;
    const filePath = `event-banners/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('events')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('events')
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from('events')
      .update({ banner_url: urlData.publicUrl })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getEventStats(organizerId) {
    const { data: events, error } = await supabase
      .from('events')
      .select('status')
      .eq('organizer_id', organizerId);

    if (error) throw error;

    const stats = {
      total: events.length,
      upcoming: 0,
      live: 0,
      completed: 0,
      cancelled: 0,
    };

    events.forEach((event) => {
      if (stats[event.status] !== undefined) {
        stats[event.status]++;
      }
    });

    return stats;
  },
};

export default eventService;