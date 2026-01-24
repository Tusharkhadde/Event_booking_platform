import supabase from './supabaseClient';

export const menuService = {
  // Get all menus for an event with their items
  async getMenus(eventId) {
    const { data, error } = await supabase
      .from('menus')
      .select(`
        *,
        items:menu_items(*)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get a single menu with items
  async getMenuById(menuId) {
    const { data, error } = await supabase
      .from('menus')
      .select(`
        *,
        items:menu_items(*)
      `)
      .eq('id', menuId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new menu
  async createMenu(menuData) {
    const { data, error } = await supabase
      .from('menus')
      .insert([menuData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a menu
  async updateMenu(menuId, updates) {
    const { data, error } = await supabase
      .from('menus')
      .update(updates)
      .eq('id', menuId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a menu
  async deleteMenu(menuId) {
    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', menuId);

    if (error) throw error;
  },

  // Add an item to a menu
  async addMenuItem(itemData) {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([itemData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a menu item
  async updateMenuItem(itemId, updates) {
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a menu item
  async deleteMenuItem(itemId) {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  // Calculate total price based on items
  async calculateMenuPrice(menuId) {
    const { data, error } = await supabase
      .from('menu_items')
      .select('price')
      .eq('menu_id', menuId);

    if (error) throw error;

    const total = data.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    return total;
  },
};

export default menuService;