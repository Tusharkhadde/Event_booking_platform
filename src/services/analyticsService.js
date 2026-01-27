// src/services/analyticsService.js
import supabase from './supabaseClient';

export const analyticsService = {
  async getAdminAnalytics() {
    // 1) Fetch events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, category, status');

    if (eventsError) throw eventsError;

    // 2) Fetch users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, role');

    if (usersError) throw usersError;

    // Aggregate events by category
    const eventsByCategory = {};
    events.forEach((e) => {
      const cat = e.category || 'other';
      if (!eventsByCategory[cat]) {
        eventsByCategory[cat] = 0;
      }
      eventsByCategory[cat] += 1;
    });

    // Aggregate events by status
    const eventsByStatus = { upcoming: 0, live: 0, completed: 0, cancelled: 0 };
    events.forEach((e) => {
      const st = e.status || 'upcoming';
      if (eventsByStatus[st] === undefined) {
        eventsByStatus[st] = 0;
      }
      eventsByStatus[st] += 1;
    });

    // Aggregate users by role
    const usersByRole = { admin: 0, organizer: 0, vendor: 0, customer: 0 };
    users.forEach((u) => {
      const r = u.role || 'customer';
      if (usersByRole[r] === undefined) {
        usersByRole[r] = 0;
      }
      usersByRole[r] += 1;
    });

    return {
      eventsByCategory,
      eventsByStatus,
      usersByRole,
    };
  },
};

export default analyticsService;