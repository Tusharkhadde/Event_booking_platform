// src/services/promoService.js
import supabase from './supabaseClient';

export const promoService = {
  // Existing validatePromo here...
  async validatePromo({ code, eventId, subtotal }) {
    const normalizedCode = code.trim().toUpperCase();
    const today = new Date().toISOString().split('T')[0];

    const { data: promos, error } = await supabase
      .from('promos')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .gte('expiry_date', today)
      .or(`event_id.is.null,event_id.eq.${eventId}`);

    if (error) throw error;

    if (!promos || promos.length === 0) {
      throw new Error('Promo code not found or expired');
    }

    let promo = null;
    promos.forEach((p) => {
      if (p.event_id === eventId) {
        promo = p;
      }
    });
    if (!promo) {
      promo = promos[0];
    }

    if (promo.max_uses && promo.used_count >= promo.max_uses) {
      throw new Error('This promo code has reached its usage limit');
    }

    const numericSubtotal = Number(subtotal || 0);
    let discountAmount = 0;

    if (promo.discount_type === 'percentage') {
      discountAmount = numericSubtotal * (Number(promo.discount_value) / 100);
    } else {
      discountAmount = Number(promo.discount_value);
    }

    if (discountAmount > numericSubtotal) {
      discountAmount = numericSubtotal;
    }

    return {
      promo,
      discountAmount,
    };
  },

  // ========== ADMIN / ORGANIZER CRUD ==========

  async getAllPromos() {
    const { data, error } = await supabase
      .from('promos')
      .select(`
        *,
        event:events(id, title, date)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createPromo(promoData) {
    const payload = {
      ...promoData,
      code: promoData.code.trim().toUpperCase(),
    };

    const { data, error } = await supabase
      .from('promos')
      .insert([payload])
      .select(`
        *,
        event:events(id, title, date)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updatePromo(id, updates) {
    const payload = { ...updates };
    if (payload.code) {
      payload.code = payload.code.trim().toUpperCase();
    }

    const { data, error } = await supabase
      .from('promos')
      .update(payload)
      .eq('id', id)
      .select(`
        *,
        event:events(id, title, date)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async deletePromo(id) {
    const { error } = await supabase
      .from('promos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export default promoService;