// src/services/taskService.js
import supabase from './supabaseClient';

export const taskService = {
  // All tasks for events owned by this organizer (for calendar)
  async getOrganizerTasks(organizerId) {
    if (!organizerId) return [];

    const { data, error } = await supabase
      .from('tasks')
      .select(
        `
        *,
        event:events!tasks_event_id_fkey(id, title, date, organizer_id)
      `
      )
      .eq('event.organizer_id', organizerId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Tasks for a specific event
  async getTasksByEvent(eventId) {
    if (!eventId) return [];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('event_id', eventId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Create task
  async createTask(taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  // Update task
  async updateTask(taskId, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  // Delete task
  async deleteTask(taskId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  },

  // Toggle status between pending/completed
  async toggleTaskStatus(taskId, currentStatus) {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';

    const { data, error } = await supabase
      .from('tasks')
      .update({ status: nextStatus })
      .eq('id', taskId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },
};

export default taskService;