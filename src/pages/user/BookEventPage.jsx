// src/pages/user/BookEventPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// Components
import { TicketSelection } from '@/components/booking/TicketSelection';
import { SeatMap } from '@/components/booking/SeatMap';
import { MockPaymentForm } from '@/components/payment/MockPaymentForm';
import { GlowingOrderSummary } from '@/components/payment/GlowingOrderSummary';
import { DigitalTicket } from '@/components/tickets/DigitalTicket';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { GradientText } from '@/components/ui/gradient-text';
import { AnimatedGradientBorder } from '@/components/ui/animated-gradient-border';
import { ParticleButton } from '@/components/ui/particle-button';
import { ShimmerButton } from '@/components/ui/shimmer-button';

// Icons
import {
  ArrowLeft,
  ArrowRight,
  Ticket,
  MapPin,
  CreditCard,
  CheckCircle,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Sparkles,
  Download,
  PartyPopper,
  QrCode,
  Share2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// Services
import {
  createBooking,
  processBookingPayment,
} from '@/services/bookingService';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

// Default ticket types - Used when event doesn't have specific tickets
const DEFAULT_TICKET_TYPES = [
  {
    id: 'vip',
    name: 'VIP Pass',
    type: 'vip',
    description: 'Front row seats, meet & greet, exclusive merch',
    price: 199.99,
    originalPrice: 249.99,
    features: ['Front Row Seats', 'Meet & Greet', 'Exclusive Merch', 'VIP Lounge'],
    available: 50,
    maxPerOrder: 4,
  },
  {
    id: 'premium',
    name: 'Premium',
    type: 'premium',
    description: 'Great seats with premium benefits',
    price: 149.99,
    originalPrice: 179.99,
    features: ['Priority Seating', 'Complimentary Drinks', 'Fast Track Entry'],
    available: 100,
    maxPerOrder: 6,
  },
  {
    id: 'regular',
    name: 'General Admission',
    type: 'regular',
    description: 'Standard entry to the event',
    price: 79.99,
    features: ['General Seating', 'Event Access'],
    available: 500,
    maxPerOrder: 10,
  },
  {
    id: 'student',
    name: 'Student',
    type: 'student',
    description: 'Discounted tickets for students (ID required)',
    price: 49.99,
    features: ['General Seating', 'Valid Student ID Required'],
    available: 100,
    maxPerOrder: 2,
  },
];

// Mock event data - Used when no event is passed
const MOCK_EVENT = {
  id: 'demo-event-1',
  title: 'Tech Conference 2024',
  description: 'The biggest tech event of the year featuring industry leaders and innovators.',
  date: '2024-12-15',
  time: '10:00 AM',
  end_time: '6:00 PM',
  location: 'Convention Center, New York',
  address: '123 Main Street, New York, NY 10001',
  image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
  organizer: 'TechCorp Inc.',
  category: 'Technology',
  has_seating: true,
  ticket_types: DEFAULT_TICKET_TYPES,
};

// Steps configuration
const STEPS = [
  { id: 'tickets', title: 'Select Tickets', icon: Ticket },
  { id: 'seats', title: 'Choose Seats', icon: MapPin },
  { id: 'payment', title: 'Payment', icon: CreditCard },
  { id: 'confirmation', title: 'Confirmation', icon: CheckCircle },
];

const BookEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get event from navigation state or use mock
  const passedEvent = location.state?.event;

  // State
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [booking, setBooking] = useState(null);
  const [generatedTickets, setGeneratedTickets] = useState([]);
  const [selectedViewTicket, setSelectedViewTicket] = useState(null);

  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        let eventData;
        let tickets;

        if (passedEvent) {
          // Use passed event from navigation
          eventData = passedEvent;
          tickets = passedEvent.ticket_types || DEFAULT_TICKET_TYPES;
        } else if (eventId && eventId !== 'demo') {
          // TODO: Fetch event from API
          // const response = await getEvent(eventId);
          // eventData = response;
          
          // For now, use mock with the eventId
          eventData = { ...MOCK_EVENT, id: eventId };
          tickets = DEFAULT_TICKET_TYPES;
        } else {
          // Use demo event
          eventData = MOCK_EVENT;
          tickets = DEFAULT_TICKET_TYPES;
        }

        setEvent(eventData);
        setTicketTypes(tickets);
        
        console.log('Event loaded:', eventData);
        console.log('Ticket types:', tickets);
        
      } catch (error) {
        console.error('Error loading event:', error);
        toast.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId, passedEvent]);

  // Calculate totals
  const calculateTotals = () => {
    const items = Object.entries(selectedTickets)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const ticketType = ticketTypes.find(t => t.id === id);
        if (!ticketType) return null;
        
        return {
          id: ticketType.id,
          type: ticketType.type,
          name: ticketType.name,
          price: ticketType.price,
          quantity: qty,
          total: ticketType.price * qty,
        };
      })
      .filter(Boolean);

    const subtotal = items.reduce((sum, t) => sum + t.total, 0);
    const taxAmount = (subtotal - discount) * 0.05; // 5% tax
    const total = subtotal - discount + taxAmount;

    return { 
      tickets: items, 
      subtotal, 
      tax: taxAmount, 
      total,
      ticketCount: items.reduce((sum, t) => sum + t.quantity, 0),
    };
  };

  const { tickets: ticketItems, subtotal, tax, total, ticketCount } = calculateTotals();

  // Check if event requires seating
  const requiresSeating = event?.has_seating && ticketCount > 0;

  // Determine if we should skip seat selection
  const shouldSkipSeats = !requiresSeating;

  // Navigation helpers
  const canGoNext = () => {
    switch (currentStep) {
      case 0: // Ticket Selection
        return ticketCount > 0;
      case 1: // Seat Selection
        if (shouldSkipSeats) return true;
        return selectedSeats.length === ticketCount;
      case 2: // Payment
        return false; // Payment handles its own flow
      default:
        return false;
    }
  };

  const goNext = () => {
    if (!canGoNext()) return;

    if (currentStep === 0 && shouldSkipSeats) {
      // Skip seat selection
      setCurrentStep(2);
    } else {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const goBack = () => {
    if (currentStep === 2 && shouldSkipSeats) {
      // Go back to ticket selection, skipping seats
      setCurrentStep(0);
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 0));
    }
  };

  // Handle discount
  const handleDiscountApplied = (discountAmount, promoData) => {
    setDiscount(discountAmount);
    if (promoData) {
      setAppliedPromo(promoData);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentResult) => {
    setProcessing(true);

    try {
      // Create booking
      const bookingData = await createBooking({
        userId: 'user_123', // Replace with actual user ID
        eventId: event.id,
        event: {
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
          image_url: event.image_url,
        },
        tickets: ticketItems,
        selectedSeats,
        subtotal,
        discount,
        tax,
        total,
        promoCode: appliedPromo?.code,
        billingDetails,
        paymentMethod: 'card',
      });

      // Process payment and generate tickets
      const result = await processBookingPayment(bookingData.id, paymentResult);

      setBooking(result.booking);
      setGeneratedTickets(result.tickets);

      // Celebrate! 🎉
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#6366f1', '#22c55e', '#f59e0b'],
      });

      // Move to confirmation
      setCurrentStep(3);
      toast.success('Payment successful! Your tickets are ready.');

    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error.message || 'Failed to process booking');
    } finally {
      setProcessing(false);
    }
  };

  // Handle payment error
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    toast.error(error.message || 'Payment failed. Please try again.');
  };

  // Progress percentage
  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 py-8">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="space-y-8">
            <Skeleton className="h-10 w-64 bg-slate-800" />
            <Skeleton className="h-24 w-full bg-slate-800 rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-48 w-full bg-slate-800 rounded-xl" />
                <Skeleton className="h-48 w-full bg-slate-800 rounded-xl" />
              </div>
              <Skeleton className="h-96 w-full bg-slate-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No event found
  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Event Not Found</h1>
          <p className="text-slate-400">The event you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/events')}>
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="text-slate-400 hover:text-white"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Step indicator */}
          <div className="hidden md:flex items-center gap-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <React.Fragment key={step.id}>
                  <div
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors',
                      isActive && 'bg-purple-500/20 text-purple-400',
                      isCompleted && 'text-emerald-400',
                      !isActive && !isCompleted && 'text-slate-500'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="hidden lg:inline">{step.title}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      'w-8 h-0.5 rounded',
                      index < currentStep ? 'bg-emerald-500' : 'bg-slate-700'
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile progress */}
          <div className="md:hidden flex items-center gap-2">
            <span className="text-sm text-slate-400">
              Step {currentStep + 1}/{STEPS.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <Progress value={progressPercentage} className="h-1 bg-slate-800" />
        </div>

        {/* Event Banner (shown during booking steps) */}
        {currentStep < 3 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-white text-lg truncate">
                      {event.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </span>
                    </div>
                  </div>
                  {ticketCount > 0 && (
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 flex-shrink-0">
                      <Ticket className="w-3 h-3 mr-1" />
                      {ticketCount} ticket{ticketCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Steps */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Ticket Selection */}
              {currentStep === 0 && (
                <motion.div
                  key="step-tickets"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-white" />
                      </div>
                      Select Your Tickets
                    </h2>
                    <p className="text-slate-400 mt-2">
                      Choose the ticket types and quantities you want to purchase.
                    </p>
                  </div>

                  <TicketSelection
                    ticketTypes={ticketTypes}
                    selectedTickets={selectedTickets}
                    onTicketChange={setSelectedTickets}
                    maxTickets={10}
                  />
                </motion.div>
              )}

              {/* Step 2: Seat Selection */}
              {currentStep === 1 && (
                <motion.div
                  key="step-seats"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      Choose Your Seats
                    </h2>
                    <p className="text-slate-400 mt-2">
                      Select {ticketCount} seat{ticketCount !== 1 ? 's' : ''} from the venue map below.
                    </p>
                  </div>

                  <SeatMap
                    eventId={event.id}
                    maxSeats={ticketCount}
                    selectedSeats={selectedSeats}
                    onSeatSelect={setSelectedSeats}
                  />
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 2 && (
                <motion.div
                  key="step-payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      Payment Details
                    </h2>
                    <p className="text-slate-400 mt-2">
                      Enter your billing information and complete the payment.
                    </p>
                  </div>

                  {/* Billing Details */}
                  <AnimatedGradientBorder>
                    <div className="p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-400" />
                        Billing Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Full Name *</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                              placeholder="John Doe"
                              value={billingDetails.name}
                              onChange={(e) =>
                                setBillingDetails(prev => ({ ...prev, name: e.target.value }))
                              }
                              className="bg-slate-800/80 border-slate-700 text-white h-12 pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Email *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              value={billingDetails.email}
                              onChange={(e) =>
                                setBillingDetails(prev => ({ ...prev, email: e.target.value }))
                              }
                              className="bg-slate-800/80 border-slate-700 text-white h-12 pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <Input
                            type="tel"
                            placeholder="+1 555 123 4567"
                            value={billingDetails.phone}
                            onChange={(e) =>
                              setBillingDetails(prev => ({ ...prev, phone: e.target.value }))
                            }
                            className="bg-slate-800/80 border-slate-700 text-white h-12 pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </AnimatedGradientBorder>

                  {/* Payment Form */}
                  <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6">
                    <MockPaymentForm
                      amount={total}
                      currency="USD"
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </div>

                  {/* Demo Info */}
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-white">Demo Mode</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Use test card <code className="text-purple-400 bg-slate-800 px-1 rounded">4242 4242 4242 4242</code> with any expiry date and CVV.
                            <br />
                            Try promo codes: <code className="text-emerald-400">DEMO</code>, <code className="text-emerald-400">SAVE10</code>, <code className="text-emerald-400">VIP25</code>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 3 && (
                <motion.div
                  key="step-confirmation"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-8"
                >
                  {/* Success Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
                    className="relative inline-block mb-8"
                  >
                    <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    {/* Decorative particles */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute -inset-4"
                    >
                      {[...Array(6)].map((_, i) => (
                        <Sparkles
                          key={i}
                          className="absolute w-4 h-4 text-yellow-400"
                          style={{
                            top: `${50 + 40 * Math.sin((i * Math.PI) / 3)}%`,
                            left: `${50 + 40 * Math.cos((i * Math.PI) / 3)}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      ))}
                    </motion.div>
                  </motion.div>

                  {/* Success Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Booking Confirmed!
                    </h2>
                    <GradientText
                      className="text-xl font-semibold"
                      colors="from-emerald-400 via-cyan-400 to-purple-400"
                    >
                      Your tickets are ready
                    </GradientText>
                  </motion.div>

                  {/* Booking Reference */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 mb-8"
                  >
                    <p className="text-slate-400">Booking Reference</p>
                    <p className="font-mono text-2xl font-bold text-white mt-1">
                      {booking?.booking_reference}
                    </p>
                  </motion.div>

                  {/* Generated Tickets */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid gap-3 max-w-lg mx-auto mb-8"
                  >
                    {generatedTickets.map((ticket, index) => (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <Card className="bg-slate-900 border-slate-700 overflow-hidden hover:border-purple-500/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedViewTicket(ticket)}
                        >
                          <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                  <QrCode className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left">
                                  <p className="font-mono text-sm text-white font-medium">
                                    {ticket.ticket_code}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {ticket.ticket_name}
                                    {ticket.seat && ` • Seat ${ticket.seat.id}`}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                View
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                    <ShimmerButton
                      onClick={() => {
                        if (generatedTickets.length > 0) {
                          setSelectedViewTicket(generatedTickets[0]);
                        }
                      }}
                      className="px-8"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      View Tickets
                    </ShimmerButton>
                    
                    <Button
                      variant="outline"
                      className="border-slate-700 text-white hover:bg-slate-800"
                      onClick={() => navigate('/user/tickets')}
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      My Tickets
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="border-slate-700 text-white hover:bg-slate-800"
                      onClick={() => navigate('/events')}
                    >
                      Browse Events
                    </Button>
                  </motion.div>

                  {/* Email confirmation note */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-sm text-slate-500 mt-8 flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Confirmation email sent to {billingDetails.email || 'your email'}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep < 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-between items-center mt-8 pt-6 border-t border-slate-800"
              >
                <Button
                  variant="outline"
                  className="border-slate-700 text-white hover:bg-slate-800"
                  onClick={goBack}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <ParticleButton
                  onClick={goNext}
                  disabled={!canGoNext()}
                  className={cn(
                    'min-w-[180px]',
                    !canGoNext() && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {currentStep === 0 && !requiresSeating ? 'Continue to Payment' : 
                   currentStep === 0 ? 'Select Seats' : 
                   'Continue to Payment'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </ParticleButton>
              </motion.div>
            )}

            {/* Back button for payment step */}
            {currentStep === 2 && (
              <div className="mt-6">
                <Button
                  variant="ghost"
                  className="text-slate-400 hover:text-white"
                  onClick={goBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to {shouldSkipSeats ? 'Tickets' : 'Seats'}
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          {currentStep < 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-8">
                <GlowingOrderSummary
                  event={event}
                  tickets={ticketItems}
                  selectedSeats={selectedSeats}
                  subtotal={subtotal}
                  onDiscountApplied={handleDiscountApplied}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Digital Ticket Modal */}
      <AnimatePresence>
        {selectedViewTicket && (
          <DigitalTicket
            ticket={selectedViewTicket}
            onClose={() => setSelectedViewTicket(null)}
          />
        )}
      </AnimatePresence>

      {/* Processing Overlay */}
      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
          >
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Processing your booking...</p>
              <p className="text-slate-400 text-sm mt-1">Please don't close this page</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookEventPage;