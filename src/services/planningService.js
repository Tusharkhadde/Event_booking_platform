import supabase from './supabaseClient';

export const planningService = {
  // Planning Templates
  async createTemplate(templateData) {
    const { data, error } = await supabase
      .from('planning_templates')
      .insert([templateData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTemplate(eventId) {
    const { data, error } = await supabase
      .from('planning_templates')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateTemplate(templateId, updates) {
    const { data, error } = await supabase
      .from('planning_templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async upsertTemplate(eventId, templateData) {
    const existing = await this.getTemplate(eventId);
    
    if (existing) {
      return this.updateTemplate(existing.id, templateData);
    }
    
    return this.createTemplate({ ...templateData, event_id: eventId });
  },

  // Planning Notes
  async createNote(noteData) {
    const { data, error } = await supabase
      .from('event_notes')
      .insert([noteData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getNotes(eventId) {
    const { data, error } = await supabase
      .from('event_notes')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getNoteBySection(eventId, sectionId) {
    const { data, error } = await supabase
      .from('event_notes')
      .select('*')
      .eq('event_id', eventId)
      .eq('section_id', sectionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateNote(noteId, content) {
    const { data, error } = await supabase
      .from('event_notes')
      .update({ content })
      .eq('id', noteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async upsertNote(eventId, sectionId, content) {
    const existing = await this.getNoteBySection(eventId, sectionId);
    
    if (existing) {
      return this.updateNote(existing.id, content);
    }
    
    return this.createNote({ event_id: eventId, section_id: sectionId, content });
  },

  async deleteNote(noteId) {
    const { error } = await supabase
      .from('event_notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
  },

  // Planning Items (Checklist items)
  async createItem(itemData) {
    const { data, error } = await supabase
      .from('planning_items')
      .insert([itemData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getItems(eventId) {
    const { data, error } = await supabase
      .from('planning_items')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getItemsBySection(eventId, sectionId) {
    const { data, error } = await supabase
      .from('planning_items')
      .select('*')
      .eq('event_id', eventId)
      .eq('section_id', sectionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async updateItem(itemId, updates) {
    const { data, error } = await supabase
      .from('planning_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleItemComplete(itemId, isCompleted) {
    const { data, error } = await supabase
      .from('planning_items')
      .update({ is_completed: isCompleted })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteItem(itemId) {
    const { error } = await supabase
      .from('planning_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  async getItemStats(eventId) {
    const { data, error } = await supabase
      .from('planning_items')
      .select('is_completed')
      .eq('event_id', eventId);

    if (error) throw error;

    const total = data.length;
    const completed = data.filter((item) => item.is_completed).length;
    const pending = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, progress };
  },
};

export default planningService;