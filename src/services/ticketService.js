// src/services/ticketService.js
import supabase from "@/services/supabaseClient";
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

// Generate unique ticket code
const generateTicketCode = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = uuidv4().split('-')[0];
  return `TKT-${timestamp}-${randomPart}`.toUpperCase();
};

// Generate QR code data URL
export const generateQRCode = async (ticketData) => {
  try {
    const qrData = JSON.stringify({
      ticketId: ticketData.id,
      ticketCode: ticketData.ticket_code,
      eventId: ticketData.event_id,
      userId: ticketData.user_id,
      type: ticketData.ticket_type,
      validFrom: ticketData.valid_from,
      validUntil: ticketData.valid_until
    });
    
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Create ticket
export const createTicket = async (ticketData) => {
  const ticketCode = generateTicketCode();
  
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      ...ticketData,
      ticket_code: ticketCode,
      status: 'active',
      is_checked_in: false,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  
  // Generate and store QR code
  const qrCode = await generateQRCode(data);
  
  await supabase
    .from('tickets')
    .update({ qr_code: qrCode })
    .eq('id', data.id);

  return { ...data, qr_code: qrCode };
};

// Create multiple tickets (bulk)
export const createBulkTickets = async (bookingId, eventId, userId, ticketType, quantity, pricePerTicket) => {
  const tickets = [];
  
  for (let i = 0; i < quantity; i++) {
    const ticketCode = generateTicketCode();
    tickets.push({
      booking_id: bookingId,
      event_id: eventId,
      user_id: userId,
      ticket_code: ticketCode,
      ticket_type: ticketType,
      price: pricePerTicket,
      seat_number: null,
      status: 'active',
      is_checked_in: false,
      checked_in_at: null,
      created_at: new Date().toISOString()
    });
  }

  const { data, error } = await supabase
    .from('tickets')
    .insert(tickets)
    .select();

  if (error) throw error;

  // Generate QR codes for all tickets
  const ticketsWithQR = await Promise.all(
    data.map(async (ticket) => {
      const qrCode = await generateQRCode(ticket);
      await supabase
        .from('tickets')
        .update({ qr_code: qrCode })
        .eq('id', ticket.id);
      return { ...ticket, qr_code: qrCode };
    })
  );

  return ticketsWithQR;
};

// Get user tickets
export const getUserTickets = async (userId) => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      events (
        id,
        title,
        description,
        date,
        time,
        location,
        image_url,
        organizer_id
      ),
      bookings (
        id,
        booking_reference,
        total_amount
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Get ticket by code
export const getTicketByCode = async (ticketCode) => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      events (
        id,
        title,
        date,
        time,
        location,
        image_url
      ),
      profiles (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('ticket_code', ticketCode)
    .single();

  if (error) throw error;
  return data;
};

// Validate ticket (for scanning)
export const validateTicket = async (ticketCode, eventId) => {
  try {
    const ticket = await getTicketByCode(ticketCode);
    
    if (!ticket) {
      return { valid: false, message: 'Ticket not found', status: 'invalid' };
    }

    if (ticket.event_id !== eventId) {
      return { valid: false, message: 'Ticket is for a different event', status: 'wrong_event' };
    }

    if (ticket.status === 'cancelled') {
      return { valid: false, message: 'Ticket has been cancelled', status: 'cancelled' };
    }

    if (ticket.status === 'expired') {
      return { valid: false, message: 'Ticket has expired', status: 'expired' };
    }

    if (ticket.is_checked_in) {
      return { 
        valid: false, 
        message: `Already checked in at ${new Date(ticket.checked_in_at).toLocaleString()}`, 
        status: 'already_used',
        ticket 
      };
    }

    return { valid: true, message: 'Valid ticket', status: 'valid', ticket };
  } catch (error) {
    return { valid: false, message: 'Error validating ticket', status: 'error' };
  }
};

// Check in ticket
export const checkInTicket = async (ticketId, checkedInBy) => {
  const { data, error } = await supabase
    .from('tickets')
    .update({
      is_checked_in: true,
      checked_in_at: new Date().toISOString(),
      checked_in_by: checkedInBy
    })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;

  // Log check-in
  await supabase.from('ticket_check_ins').insert({
    ticket_id: ticketId,
    checked_in_by: checkedInBy,
    checked_in_at: new Date().toISOString()
  });

  return data;
};

// Get event tickets (for organizers)
export const getEventTickets = async (eventId) => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      profiles (
        id,
        full_name,
        email
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Get ticket statistics
export const getTicketStats = async (eventId) => {
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('event_id', eventId);

  if (error) throw error;

  const stats = {
    total: tickets.length,
    active: tickets.filter(t => t.status === 'active').length,
    checkedIn: tickets.filter(t => t.is_checked_in).length,
    cancelled: tickets.filter(t => t.status === 'cancelled').length,
    byType: {}
  };

  tickets.forEach(ticket => {
    if (!stats.byType[ticket.ticket_type]) {
      stats.byType[ticket.ticket_type] = { total: 0, checkedIn: 0 };
    }
    stats.byType[ticket.ticket_type].total++;
    if (ticket.is_checked_in) {
      stats.byType[ticket.ticket_type].checkedIn++;
    }
  });

  return stats;
};

// Transfer ticket
export const transferTicket = async (ticketId, newUserId, transferredBy) => {
  const { data: ticket, error: fetchError } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (fetchError) throw fetchError;

  if (ticket.is_checked_in) {
    throw new Error('Cannot transfer a checked-in ticket');
  }

  // Log transfer
  await supabase.from('ticket_transfers').insert({
    ticket_id: ticketId,
    from_user_id: ticket.user_id,
    to_user_id: newUserId,
    transferred_by: transferredBy,
    transferred_at: new Date().toISOString()
  });

  // Update ticket
  const { data, error } = await supabase
    .from('tickets')
    .update({
      user_id: newUserId,
      transfer_count: (ticket.transfer_count || 0) + 1
    })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;

  // Regenerate QR code
  const qrCode = await generateQRCode(data);
  await supabase
    .from('tickets')
    .update({ qr_code: qrCode })
    .eq('id', ticketId);

  return { ...data, qr_code: qrCode };
};

// Cancel ticket
export const cancelTicket = async (ticketId, reason) => {
  const { data, error } = await supabase
    .from('tickets')
    .update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString()
    })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update ticket
export const updateTicket = async (ticketId, updates) => {
  const { data, error } = await supabase
    .from('tickets')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete ticket
export const deleteTicket = async (ticketId) => {
  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', ticketId);

  if (error) throw error;
  return true;
};

// Resend ticket email
export const resendTicketEmail = async (ticketId) => {
  // This would integrate with your email service
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      *,
      events (*),
      profiles (*)
    `)
    .eq('id', ticketId)
    .single();

  if (error) throw error;

  // Trigger email sending (implement based on your email service)
  console.log('Resending ticket email for:', ticket);
  
  return ticket;
};

export default {
  generateQRCode,
  createTicket,
  createBulkTickets,
  getUserTickets,
  getTicketByCode,
  validateTicket,
  checkInTicket,
  getEventTickets,
  getTicketStats,
  transferTicket,
  cancelTicket,
  updateTicket,
  deleteTicket,
  resendTicketEmail
};