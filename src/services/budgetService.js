// src/services/budgetService.js
import supabase from './supabaseClient';

export const budgetService = {
  // Get or create budget for an event
  async getOrCreateBudget(eventId) {
    // Try to fetch existing budget
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (!error && data) return data;

    // If not found, create new with default values
    if (error && error.code === 'PGRST116') {
      const { data: created, error: createError } = await supabase
        .from('budgets')
        .insert([{ event_id: eventId, total_budget: 0, currency: 'USD' }])
        .select()
        .single();
      if (createError) throw createError;
      return created;
    }

    if (error) throw error;
    return data;
  },

  async updateBudget(budgetId, updates) {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', budgetId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getBudgetItems(budgetId) {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('budget_id', budgetId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addBudgetItem(itemData) {
    const { data, error } = await supabase
      .from('budget_items')
      .insert([itemData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteBudgetItem(itemId) {
    const { error } = await supabase
      .from('budget_items')
      .delete()
      .eq('id', itemId);
    if (error) throw error;
  },
};

export default budgetService;