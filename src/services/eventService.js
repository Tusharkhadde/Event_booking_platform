// src/services/eventService.js
import supabase from './supabaseClient';

// Get all published events with filters
export const getEvents = async (filters = {}) => {
  let query = supabase
    .from('events')
    .select(`
      *,
      organizer:profiles!organizer_id(
        id,
        full_name,
        avatar_url,
        company_name
      ),
      venue:venues(
        id,
        name,
        city,
        state
      )
    `)
    .eq('is_published', true)
    .eq('is_cancelled', false);

  // Apply filters
  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.city) {
    query = query.eq('venues.city', filters.city);
  }

  if (filters.dateFrom) {
    query = query.gte('date', filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte('date', filters.dateTo);
  }

  if (filters.priceMin !== undefined) {
    query = query.gte('min_ticket_price', filters.priceMin);
  }

  if (filters.priceMax !== undefined) {
    query = query.lte('max_ticket_price', filters.priceMax);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  // Sorting
  switch (filters.sortBy) {
    case 'date':
      query = query.order('date', { ascending: true });
      break;
    case 'price_low':
      query = query.order('min_ticket_price', { ascending: true });
      break;
    case 'price_high':
      query = query.order('max_ticket_price', { ascending: false });
      break;
    case 'popular':
      query = query.order('view_count', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return { 
    events: data || [], 
    totalCount: count,
    page,
    totalPages: Math.ceil(count / limit)
  };
};

// Get single event with full details
export const getEventById = async (eventId) => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      organizer:profiles!organizer_id(
        id,
        full_name,
        avatar_url,
        company_name,
        bio
      ),
      venue:venues(
        id,
        name,
        address,
        city,
        state,
        amenities,
        images
      )
    `)
    .eq('id', eventId)
    .single();

  if (error) throw error;

  // Increment view count
  await supabase
    .from('events')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', eventId);

  return data;
};

// Get featured events
export const getFeaturedEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      organizer:profiles!organizer_id(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('is_published', true)
    .eq('is_featured', true)
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true })
    .limit(6);

  if (error) throw error;
  return data || [];
};

// Get trending events (based on views and bookings)
export const getTrendingEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      organizer:profiles!organizer_id(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('is_published', true)
    .gte('date', new Date().toISOString())
    .order('view_count', { ascending: false })
    .limit(8);

  if (error) throw error;
  return data || [];
};

// Get upcoming events for a user
export const getUpcomingEventsForUser = async (userId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      event:events(
        *,
        organizer:profiles!organizer_id(
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('user_id', userId)
    .eq('booking_status', 'confirmed')
    .gte('event.date', new Date().toISOString())
    .order('event.date', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Get event recommendations based on user history
export const getRecommendedEvents = async (userId) => {
  // First get user's booking history to understand preferences
  const { data: bookings } = await supabase
    .from('bookings')
    .select('event:events(category, tags)')
    .eq('user_id', userId)
    .limit(10);

  // Extract categories and tags
  const categories = [...new Set(bookings?.map(b => b.event?.category) || [])];
  
  if (categories.length === 0) {
    // Return popular events if no history
    return getTrendingEvents();
  }

  // Get similar events
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      organizer:profiles!organizer_id(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('is_published', true)
    .in('category', categories)
    .gte('date', new Date().toISOString())
    .order('view_count', { ascending: false })
    .limit(8);

  if (error) throw error;
  return data || [];
};

// Search events with autocomplete
export const searchEvents = async (query) => {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from('events')
    .select('id, title, date, location, image_url')
    .eq('is_published', true)
    .ilike('title', `%${query}%`)
    .limit(5);

  if (error) throw error;
  return data || [];
};

// Get event categories with counts
export const getEventCategories = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('category')
    .eq('is_published', true)
    .gte('date', new Date().toISOString());

  if (error) throw error;

  // Count categories
  const categoryCounts = {};
  data?.forEach(event => {
    if (event.category) {
      categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
    }
  });

  return Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
    icon: getCategoryIcon(name)
  }));
};

// Helper to get category icon
const getCategoryIcon = (category) => {
  const icons = {
    'Music': '🎵',
    'Sports': '⚽',
    'Business': '💼',
    'Technology': '💻',
    'Food & Drink': '🍽️',
    'Arts': '🎨',
    'Education': '📚',
    'Health': '🏥',
    'Fashion': '👗',
    'Travel': '✈️'
  };
  return icons[category] || '📅';
};

// Save/unsave event for user
export const toggleSaveEvent = async (userId, eventId) => {
  // Check if already saved
  const { data: existing } = await supabase
    .from('saved_events')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .single();

  if (existing) {
    // Unsave
    const { error } = await supabase
      .from('saved_events')
      .delete()
      .eq('id', existing.id);
    
    if (error) throw error;
    return { saved: false };
  } else {
    // Save
    const { error } = await supabase
      .from('saved_events')
      .insert({ user_id: userId, event_id: eventId });
    
    if (error) throw error;
    return { saved: true };
  }
};

// Check if event is saved by user
export const isEventSaved = async (userId, eventId) => {
  const { data, error } = await supabase
    .from('saved_events')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .single();

  return !!data;
};

// Create a new event
export const createEvent = async (eventData) => {
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update an event
export const updateEvent = async (eventId, updates) => {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete an event
export const deleteEvent = async (eventId) => {
  const { data, error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update event status (publish, unpublish, cancel)
export const updateEventStatus = async (eventId, status) => {
  const updateData = {};
  
  if (status === 'published') {
    updateData.is_published = true;
    updateData.published_at = new Date().toISOString();
  } else if (status === 'unpublished') {
    updateData.is_published = false;
  } else if (status === 'cancelled') {
    updateData.is_cancelled = true;
    updateData.cancelled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export default {
  getEvents,
  getEventById,
  getFeaturedEvents,
  getTrendingEvents,
  getUpcomingEventsForUser,
  getRecommendedEvents,
  searchEvents,
  getEventCategories,
  toggleSaveEvent,
  isEventSaved,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
};