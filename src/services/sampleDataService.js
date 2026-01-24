import supabase from './supabaseClient';
import sampleWedding from '@/data/sampleWeddingEvent.json';

/**
 * Seeds a complete sample wedding event for the current organizer.
 * 
 * @param {string} organizerId - The logged-in organizer's user id (auth.users.id)
 */
export async function seedSampleWeddingEvent(organizerId) {
  if (!organizerId) {
    throw new Error('Organizer ID is required to seed sample data');
  }

  // 1) Insert event
  const eventPayload = {
    organizer_id: organizerId,
    title: sampleWedding.event.title,
    description: sampleWedding.event.description,
    category: sampleWedding.event.category,
    location: sampleWedding.event.location,
    venue_name: sampleWedding.venue.name,
    date: sampleWedding.event.date,
    start_time: sampleWedding.event.start_time,
    end_time: sampleWedding.event.end_time,
    status: sampleWedding.event.status,
    banner_url: sampleWedding.event.banner_url,
    max_attendees: sampleWedding.event.max_attendees,
    is_public: sampleWedding.event.is_public === true ? true : false
  };

  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert([eventPayload])
    .select()
    .single();

  if (eventError) {
    console.error('Error inserting event:', eventError);
    throw eventError;
  }

  const eventId = event.id;

  // 2) Insert menus and menu items
  for (const menu of sampleWedding.menus) {
    const { data: insertedMenu, error: menuError } = await supabase
      .from('menus')
      .insert([
        {
          event_id: eventId,
          name: menu.name,
          type: menu.type,
          description: menu.description,
          price_per_person: menu.price_per_person
        }
      ])
      .select()
      .single();

    if (menuError) {
      console.error('Error inserting menu:', menuError);
      throw menuError;
    }

    const menuId = insertedMenu.id;

    if (menu.items && menu.items.length > 0) {
      const menuItemsPayload = menu.items.map((item) => ({
        menu_id: menuId,
        item_name: item.name,
        description: item.description,
        category: item.category,
        is_vegetarian: item.is_vegetarian,
        is_vegan: item.is_vegan,
        is_gluten_free: item.is_gluten_free,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('menu_items')
        .insert(menuItemsPayload);

      if (itemsError) {
        console.error('Error inserting menu items:', itemsError);
        throw itemsError;
      }
    }
  }

  // 3) Insert guests
  if (sampleWedding.guests && sampleWedding.guests.length > 0) {
    const guestsPayload = sampleWedding.guests.map((g) => ({
      event_id: eventId,
      name: g.name,
      email: g.email,
      phone: g.phone,
      category: g.category,
      rsvp_status: g.rsvp_status,
      plus_ones: g.plus_ones,
      table_number: g.table_number
    }));

    const { error: guestsError } = await supabase
      .from('guests')
      .insert(guestsPayload);

    if (guestsError) {
      console.error('Error inserting guests:', guestsError);
      throw guestsError;
    }
  }

  // 4) Insert planning tasks
  if (sampleWedding.planning_tasks && sampleWedding.planning_tasks.length > 0) {
    const tasksPayload = sampleWedding.planning_tasks.map((t) => ({
      event_id: eventId,
      title: t.title,
      description: t.description,
      due_date: t.due_date,
      status: t.status
    }));

    const { error: tasksError } = await supabase
      .from('tasks')
      .insert(tasksPayload);

    if (tasksError) {
      console.error('Error inserting tasks:', tasksError);
      throw tasksError;
    }
  }

  // 5) Optional: store ticket tiers as JSON config on events (if you added ticket_config column)
  if (sampleWedding.ticket_tiers && sampleWedding.ticket_tiers.length > 0) {
    const { error: ticketConfigError } = await supabase
      .from('events')
      .update({ ticket_config: sampleWedding.ticket_tiers })
      .eq('id', eventId);

    if (ticketConfigError) {
      console.error('Error saving ticket tiers config:', ticketConfigError);
      throw ticketConfigError;
    }
  }

  return event; // Return created event
}