// src/services/bookingService.js
import { v4 as uuidv4 } from 'uuid';

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Simulated delay for API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate booking reference
const generateBookingRef = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EVT-${timestamp}-${random}`;
};

// Generate ticket code
const generateTicketCode = () => {
  const prefix = 'TKT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// ============================================
// IN-MEMORY STORAGE (Replace with real DB)
// ============================================

let bookings = [];
let tickets = [];

// ============================================
// PROMO CODES DATABASE
// ============================================

const PROMO_CODES = {
  'DEMO': { 
    type: 'percentage', 
    value: 25, 
    description: '25% off your order',
    minAmount: 0,
    maxUses: null,
    usedCount: 0,
    active: true,
  },
  'SAVE10': { 
    type: 'percentage', 
    value: 10, 
    description: '10% off',
    minAmount: 50,
    maxUses: null,
    usedCount: 0,
    active: true,
  },
  'SAVE20': { 
    type: 'percentage', 
    value: 20, 
    description: '20% off',
    minAmount: 100,
    maxUses: null,
    usedCount: 0,
    active: true,
  },
  'VIP25': { 
    type: 'percentage', 
    value: 25, 
    description: '25% off for VIP',
    minAmount: 0,
    maxUses: null,
    usedCount: 0,
    active: true,
  },
  'FLAT20': { 
    type: 'fixed', 
    value: 20, 
    description: '$20 off',
    minAmount: 80,
    maxUses: null,
    usedCount: 0,
    active: true,
  },
  'FLAT50': { 
    type: 'fixed', 
    value: 50, 
    description: '$50 off',
    minAmount: 150,
    maxUses: null,
    usedCount: 0,
    active: true,
  },
  'WELCOME50': { 
    type: 'percentage', 
    value: 50, 
    maxDiscount: 100,
    description: '50% off (max $100)',
    minAmount: 0,
    maxUses: null,
    usedCount: 0,
    active: true,
  },
  'FREE100': { 
    type: 'fixed', 
    value: 100, 
    description: '$100 off',
    minAmount: 200,
    maxUses: null,
    usedCount: 0,
    active: true,
  },
  'FIRST': { 
    type: 'percentage', 
    value: 15, 
    description: '15% off first order',
    minAmount: 0,
    maxUses: null,
    usedCount: 0,
    active: true,
  },
  'EVENT2024': { 
    type: 'percentage', 
    value: 30, 
    maxDiscount: 75,
    description: '30% off (max $75)',
    minAmount: 0,
    maxUses: null,
    usedCount: 0,
    active: true,
  },
  'STUDENT15': { 
    type: 'percentage', 
    value: 15, 
    description: '15% student discount',
    minAmount: 0,
    maxUses: null,
    usedCount: 0,
    active: true,
  },
  'WEEKEND': { 
    type: 'percentage', 
    value: 20, 
    description: '20% weekend special',
    minAmount: 50,
    maxUses: null,
    usedCount: 0,
    active: true,
  },
};

// ============================================
// PROMO CODE VALIDATION
// ============================================

export const validatePromoCode = async (code, subtotal) => {
  // Simulate API delay
  await delay(500);

  // Validate inputs
  if (!code || typeof code !== 'string') {
    throw new Error('Please enter a promo code');
  }

  if (typeof subtotal !== 'number' || subtotal < 0) {
    throw new Error('Invalid order amount');
  }

  // Normalize code to uppercase
  const normalizedCode = code.trim().toUpperCase();

  // Check if code exists
  const promo = PROMO_CODES[normalizedCode];

  if (!promo) {
    throw new Error('Invalid promo code. Please check and try again.');
  }

  // Check if promo is active
  if (!promo.active) {
    throw new Error('This promo code is no longer active.');
  }

  // Check max uses
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    throw new Error('This promo code has reached its usage limit.');
  }

  // Check minimum amount
  if (promo.minAmount && subtotal < promo.minAmount) {
    throw new Error(`Minimum order amount of $${promo.minAmount.toFixed(2)} required for this code.`);
  }

  // Calculate discount
  let discount = 0;

  if (promo.type === 'percentage') {
    discount = (subtotal * promo.value) / 100;
    
    // Apply max discount cap if exists
    if (promo.maxDiscount && discount > promo.maxDiscount) {
      discount = promo.maxDiscount;
    }
  } else if (promo.type === 'fixed') {
    discount = promo.value;
    
    // Don't allow discount greater than subtotal
    if (discount > subtotal) {
      discount = subtotal;
    }
  }

  // Round to 2 decimal places
  discount = Math.round(discount * 100) / 100;

  // Return promo details
  return {
    valid: true,
    code: normalizedCode,
    discount: discount,
    type: promo.type,
    value: promo.value,
    description: promo.description,
    originalAmount: subtotal,
    finalAmount: Math.max(0, subtotal - discount),
    savings: discount,
    message: `Promo code applied! You save $${discount.toFixed(2)}`,
  };
};

// ============================================
// BOOKING FUNCTIONS
// ============================================

// Create a new booking
export const createBooking = async (bookingData) => {
  await delay(800);

  const bookingRef = generateBookingRef();
  const bookingId = uuidv4();

  const booking = {
    id: bookingId,
    booking_reference: bookingRef,
    user_id: bookingData.userId || 'guest_user',
    event_id: bookingData.eventId,
    event: bookingData.event,
    tickets: bookingData.tickets || [],
    selected_seats: bookingData.selectedSeats || [],
    subtotal: bookingData.subtotal || 0,
    discount: bookingData.discount || 0,
    tax: bookingData.tax || 0,
    total_amount: bookingData.total || 0,
    promo_code: bookingData.promoCode || null,
    billing_details: bookingData.billingDetails || {},
    payment_method: bookingData.paymentMethod || 'card',
    payment_status: 'pending',
    booking_status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };

  bookings.push(booking);
  
  console.log('✅ Booking created:', booking.booking_reference);
  
  return booking;
};

// Process payment and generate tickets
export const processBookingPayment = async (bookingId, paymentResult) => {
  await delay(1000);

  const bookingIndex = bookings.findIndex((b) => b.id === bookingId);
  
  if (bookingIndex === -1) {
    throw new Error('Booking not found');
  }

  const booking = { ...bookings[bookingIndex] };

  // Update booking with payment info
  booking.payment_status = 'completed';
  booking.booking_status = 'confirmed';
  booking.payment_id = paymentResult.transactionId;
  booking.payment_details = {
    transactionId: paymentResult.transactionId,
    orderId: paymentResult.orderId,
    amount: paymentResult.amount,
    currency: paymentResult.currency,
    cardBrand: paymentResult.cardBrand,
    last4: paymentResult.last4,
    timestamp: paymentResult.timestamp,
  };
  booking.paid_at = new Date().toISOString();
  booking.updated_at = new Date().toISOString();

  // Generate tickets for the booking
  const generatedTickets = [];
  let seatIndex = 0;

  for (const ticketType of booking.tickets) {
    const quantity = ticketType.quantity || 1;
    
    for (let i = 0; i < quantity; i++) {
      const seat = booking.selected_seats[seatIndex] || null;
      
      const ticket = {
        id: uuidv4(),
        booking_id: bookingId,
        booking_reference: booking.booking_reference,
        event_id: booking.event_id,
        event: {
          title: booking.event?.title,
          date: booking.event?.date,
          time: booking.event?.time,
          location: booking.event?.location,
          image_url: booking.event?.image_url,
        },
        user_id: booking.user_id,
        ticket_code: generateTicketCode(),
        ticket_type: ticketType.type || ticketType.id,
        ticket_name: ticketType.name || ticketType.type,
        price: ticketType.price || 0,
        seat: seat,
        status: 'active',
        is_checked_in: false,
        checked_in_at: null,
        created_at: new Date().toISOString(),
        valid_from: booking.event?.date,
        valid_until: booking.event?.date,
        qr_data: null,
      };

      // Generate QR data
      ticket.qr_data = JSON.stringify({
        ticketId: ticket.id,
        ticketCode: ticket.ticket_code,
        eventId: ticket.event_id,
        type: ticket.ticket_type,
        seat: ticket.seat?.id || null,
      });

      tickets.push(ticket);
      generatedTickets.push(ticket);
      
      if (seat) seatIndex++;
    }
  }

  // Update booking in storage
  bookings[bookingIndex] = booking;

  console.log('✅ Payment processed, tickets generated:', generatedTickets.length);

  return {
    booking,
    tickets: generatedTickets,
  };
};

// Get booking by ID
export const getBooking = async (bookingId) => {
  await delay(300);
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) throw new Error('Booking not found');
  return booking;
};

// Get booking by reference
export const getBookingByReference = async (reference) => {
  await delay(300);
  const booking = bookings.find((b) => b.booking_reference === reference);
  if (!booking) throw new Error('Booking not found');
  return booking;
};

// Get user's bookings
export const getUserBookings = async (userId) => {
  await delay(500);
  return bookings
    .filter((b) => b.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

// Get tickets for a booking
export const getBookingTickets = async (bookingId) => {
  await delay(300);
  return tickets.filter((t) => t.booking_id === bookingId);
};

// Get user's tickets
export const getUserTickets = async (userId) => {
  await delay(500);
  return tickets
    .filter((t) => t.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

// Get ticket by code
export const getTicketByCode = async (ticketCode) => {
  await delay(300);
  const ticket = tickets.find((t) => t.ticket_code === ticketCode);
  if (!ticket) throw new Error('Ticket not found');
  return ticket;
};

// Validate ticket for check-in
export const validateTicket = async (ticketCode, eventId) => {
  await delay(500);

  const ticket = tickets.find((t) => t.ticket_code === ticketCode);

  if (!ticket) {
    return { valid: false, message: 'Ticket not found', status: 'invalid' };
  }

  if (ticket.event_id !== eventId) {
    return { valid: false, message: 'Ticket is for a different event', status: 'wrong_event' };
  }

  if (ticket.status === 'cancelled') {
    return { valid: false, message: 'Ticket has been cancelled', status: 'cancelled' };
  }

  if (ticket.is_checked_in) {
    return {
      valid: false,
      message: `Already checked in at ${new Date(ticket.checked_in_at).toLocaleString()}`,
      status: 'already_used',
      ticket,
    };
  }

  return { valid: true, message: 'Valid ticket', status: 'valid', ticket };
};

// Check in ticket
export const checkInTicket = async (ticketId, checkedInBy) => {
  await delay(500);

  const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
  
  if (ticketIndex === -1) {
    throw new Error('Ticket not found');
  }

  const ticket = { ...tickets[ticketIndex] };
  
  if (ticket.is_checked_in) {
    throw new Error('Ticket already checked in');
  }

  ticket.is_checked_in = true;
  ticket.checked_in_at = new Date().toISOString();
  ticket.checked_in_by = checkedInBy;
  ticket.status = 'used';

  tickets[ticketIndex] = ticket;

  return ticket;
};

// Cancel booking
export const cancelBooking = async (bookingId, reason) => {
  await delay(800);

  const bookingIndex = bookings.findIndex((b) => b.id === bookingId);
  
  if (bookingIndex === -1) {
    throw new Error('Booking not found');
  }

  const booking = { ...bookings[bookingIndex] };
  booking.booking_status = 'cancelled';
  booking.cancellation_reason = reason;
  booking.cancelled_at = new Date().toISOString();
  booking.updated_at = new Date().toISOString();

  // Cancel all tickets
  tickets = tickets.map((t) => {
    if (t.booking_id === bookingId) {
      return { ...t, status: 'cancelled' };
    }
    return t;
  });

  bookings[bookingIndex] = booking;

  return booking;
};

// Transfer ticket
export const transferTicket = async (ticketId, newUserId, newUserEmail) => {
  await delay(800);

  const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
  
  if (ticketIndex === -1) {
    throw new Error('Ticket not found');
  }

  const ticket = { ...tickets[ticketIndex] };
  
  if (ticket.is_checked_in) {
    throw new Error('Cannot transfer a checked-in ticket');
  }

  if (ticket.status !== 'active') {
    throw new Error('Ticket is not active');
  }

  const previousUserId = ticket.user_id;
  ticket.user_id = newUserId;
  ticket.transferred_at = new Date().toISOString();
  ticket.transferred_from = previousUserId;
  ticket.transfer_count = (ticket.transfer_count || 0) + 1;

  // Regenerate ticket code for security
  ticket.ticket_code = generateTicketCode();
  ticket.qr_data = JSON.stringify({
    ticketId: ticket.id,
    ticketCode: ticket.ticket_code,
    eventId: ticket.event_id,
    type: ticket.ticket_type,
    seat: ticket.seat?.id || null,
  });

  tickets[ticketIndex] = ticket;

  return ticket;
};

// Get booking statistics
export const getBookingStats = async (eventId) => {
  await delay(300);

  const eventBookings = bookings.filter((b) => b.event_id === eventId);
  const eventTickets = tickets.filter((t) => t.event_id === eventId);

  return {
    totalBookings: eventBookings.length,
    confirmedBookings: eventBookings.filter((b) => b.booking_status === 'confirmed').length,
    cancelledBookings: eventBookings.filter((b) => b.booking_status === 'cancelled').length,
    totalTickets: eventTickets.length,
    checkedIn: eventTickets.filter((t) => t.is_checked_in).length,
    totalRevenue: eventBookings
      .filter((b) => b.payment_status === 'completed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0),
  };
};

// Get all available promo codes (for admin/display)
export const getAvailablePromoCodes = () => {
  return Object.entries(PROMO_CODES)
    .filter(([_, promo]) => promo.active)
    .map(([code, promo]) => ({
      code,
      description: promo.description,
      type: promo.type,
      value: promo.value,
      minAmount: promo.minAmount || 0,
    }));
};

// ============================================
// EXPORTS
// ============================================

export default {
  // Promo
  validatePromoCode,
  getAvailablePromoCodes,
  
  // Booking
  createBooking,
  processBookingPayment,
  getBooking,
  getBookingByReference,
  getUserBookings,
  cancelBooking,
  
  // Tickets
  getBookingTickets,
  getUserTickets,
  getTicketByCode,
  validateTicket,
  checkInTicket,
  transferTicket,
  
  // Stats
  getBookingStats,
};