import supabase from './supabaseClient';

export const adminService = {
  // Get all users with optional role filtering
  async getUsers(role = null) {
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Approve or reject vendor
  async updateVendorStatus(userId, isApproved) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_approved: isApproved })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get platform stats
  async getAdminStats() {
    // Get counts
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
    const { count: vendorsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'vendor');
    
    // Get pending vendors count
    const { count: pendingVendors } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'vendor')
      .eq('is_approved', false);

    return {
      totalUsers: usersCount || 0,
      totalEvents: eventsCount || 0,
      totalVendors: vendorsCount || 0,
      pendingVendors: pendingVendors || 0,
    };
  }
};

export default adminService;