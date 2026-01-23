import supabase from './supabaseClient';

export const venueService = {
  // Get all venues with optional filtering
  async getAllVenues(filters = {}) {
    let query = supabase
      .from('venues')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    if (filters.minCapacity) {
      query = query.gte('capacity', filters.minCapacity);
    }

    if (filters.priceRange) {
      query = query.eq('price_range', filters.priceRange);
    }

    const { data, error } = await query;

    if (error) {
      console.error('getAllVenues error:', error);
      throw error;
    }

    return data || [];
  },

  // Get single venue by ID with reviews
  async getVenueById(id) {
    const { data, error } = await supabase
      .from('venues')
      .select(`
        *,
        reviews:venue_reviews(
          id,
          rating,
          comment,
          created_at,
          user:profiles!venue_reviews_user_id_fkey(
            id,
            name,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('getVenueById error:', error);
      throw error;
    }

    return data;
  },

  // Create a new venue
  async createVenue(venueData) {
    console.log('Creating venue with data:', venueData);

    const { data, error } = await supabase
      .from('venues')
      .insert([venueData])
      .select()
      .single();

    if (error) {
      console.error('createVenue error:', error);
      throw error;
    }

    console.log('Venue created:', data);
    return data;
  },

  // Update venue
  async updateVenue(id, updates) {
    const { data, error } = await supabase
      .from('venues')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('updateVenue error:', error);
      throw error;
    }

    return data;
  },

  // Delete venue
  async deleteVenue(id) {
    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('deleteVenue error:', error);
      throw error;
    }
  },

  // Upload multiple images to Supabase Storage
  async uploadVenueImages(files) {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = fileName;

      console.log(`Uploading file ${i + 1}/${files.length}: ${fileName}`);

      const { data, error: uploadError } = await supabase.storage
        .from('venue-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('venue-images')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        uploadedUrls.push(urlData.publicUrl);
        console.log('Public URL:', urlData.publicUrl);
      }
    }

    return uploadedUrls;
  },

  // Add a review to a venue
  async addReview(reviewData) {
    const { data, error } = await supabase
      .from('venue_reviews')
      .insert([reviewData])
      .select(`
        *,
        user:profiles!venue_reviews_user_id_fkey(
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('addReview error:', error);
      throw error;
    }

    return data;
  },

  // Get reviews for a venue
  async getVenueReviews(venueId) {
    const { data, error } = await supabase
      .from('venue_reviews')
      .select(`
        *,
        user:profiles!venue_reviews_user_id_fkey(
          id,
          name,
          avatar_url
        )
      `)
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getVenueReviews error:', error);
      throw error;
    }

    return data || [];
  },
};

export default venueService;