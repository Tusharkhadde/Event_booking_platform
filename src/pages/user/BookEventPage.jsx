import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Ticket,
  Users,
  CreditCard,
  Check,
  Minus,
  Plus,
  Info,
} from 'lucide-react';
import { useValidatePromo } from '@/hooks/usePromos';
import { useTickets } from '@/hooks/useTickets';
import { useCreateBooking } from '@/hooks/useBookings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useEvent } from '@/hooks/useEvents';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { toast } from '@/hooks/useToast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import useAuthStore from '@/store/authStore';
import notificationService from '@/services/notificationService';

function BookEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // Get logged-in user and auth state
  const { user, isAuthenticated } = useAuthStore();

  // Fetch event data
  const { data: event, isLoading, error } = useEvent(eventId);

  // Fetch tickets from Supabase
  const { data: tickets, isLoading: ticketsLoading } = useTickets(eventId);

  // Booking mutation
  const createBookingMutation = useCreateBooking();

  // Compute overall loading state
  const loading = isLoading || ticketsLoading;

  const [step, setStep] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  
  // Attendee details
  const [attendeeDetails, setAttendeeDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const validatePromoMutation = useValidatePromo();

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= 10) {
      setQuantity(newQty);
    }
  };

  // Helper function to find selected ticket from Supabase tickets
  const getSelectedTicket = () => {
    if (!selectedTicket || !tickets) {
      return null;
    }
    let foundTicket = null;
    tickets.forEach((t) => {
      if (t.id === selectedTicket) {
        foundTicket = t;
      }
    });
    return foundTicket;
  };

  const handleApplyPromo = () => {
    if (!promoCode) {
      toast({
        title: 'Promo code required',
        description: 'Please enter a promo code.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTicket) {
      toast({
        title: 'Select a ticket first',
        description: 'Choose a ticket type before applying a promo.',
        variant: 'destructive',
      });
      return;
    }

    const ticket = getSelectedTicket();
    if (!ticket) {
      toast({
        title: 'No ticket selected',
        description: 'Select a valid ticket type.',
        variant: 'destructive',
      });
      return;
    }

    const subtotal = Number(ticket.price || 0) * quantity;

    validatePromoMutation.mutate(
      { code: promoCode, eventId: eventId, subtotal },
      {
        onSuccess: (result) => {
          setAppliedPromo(result.promo);
          setDiscountAmount(result.discountAmount);
          toast({
            title: 'Promo applied',
            description: `You saved ${formatCurrency(result.discountAmount)}.`,
            variant: 'success',
          });
        },
      }
    );
  };

  const calculateSubtotal = () => {
    if (!selectedTicket || !tickets) {
      return 0;
    }
    let foundTicket = null;
    tickets.forEach((t) => {
      if (t.id === selectedTicket) {
        foundTicket = t;
      }
    });
    if (!foundTicket) {
      return 0;
    }
    const price = Number(foundTicket.price || 0);
    return price * quantity;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const serviceFee = subtotal * 0.05;
    const appliedDiscount = discountAmount || 0;
    const total = subtotal - appliedDiscount + serviceFee;
    if (total < 0) {
      return 0;
    }
    return total;
  };

  const handleProceed = () => {
    if (step === 1 && !selectedTicket) {
      toast({
        title: 'Select a Ticket',
        description: 'Please select a ticket type to continue.',
        variant: 'destructive',
      });
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleConfirmBooking = async () => {
    // Check authentication
    if (!isAuthenticated) {
      toast({
        title: 'Login required',
        description: 'Please log in to confirm your booking.',
        variant: 'destructive',
      });
      navigate('/login', { state: { from: `/book/${eventId}` } });
      return;
    }

    // Check ticket selection
    if (!selectedTicket || !tickets) {
      toast({
        title: 'Select a ticket',
        description: 'Please select a ticket type before confirming.',
        variant: 'destructive',
      });
      return;
    }

    // Find the selected ticket
    let foundTicket = null;
    tickets.forEach((t) => {
      if (t.id === selectedTicket) {
        foundTicket = t;
      }
    });

    if (!foundTicket) {
      toast({
        title: 'Invalid ticket',
        description: 'Selected ticket type is not available.',
        variant: 'destructive',
      });
      return;
    }

    // Check available quantity
    if (foundTicket.available_qty < quantity) {
      toast({
        title: 'Not enough tickets',
        description: `Only ${foundTicket.available_qty} tickets available.`,
        variant: 'destructive',
      });
      return;
    }

    const unitPrice = Number(foundTicket.price || 0);
    const totalAmount = calculateTotal();

    // Create the booking
    createBookingMutation.mutate(
      {
        eventId: eventId,
        ticketId: foundTicket.id,
        qty: quantity,
        unitPrice,
        totalAmount,
        promoId: appliedPromo?.id || null,
        discountAmount: discountAmount || 0,
        attendeeDetails: {
          firstName: attendeeDetails.firstName,
          lastName: attendeeDetails.lastName,
          email: attendeeDetails.email,
          phone: attendeeDetails.phone,
        },
      },
      {
        onSuccess: async (booking) => {
          // Create notification for successful booking
          try {
            if (user && event) {
              await notificationService.createNotification({
                user_id: user.id,
                title: 'Booking Confirmed',
                message: `Your booking for "${event.title}" on ${formatDate(event.date)} is confirmed.`,
                type: 'booking',
                data: {
                  event_id: event.id,
                  booking_id: booking?.id,
                  date: event.date,
                },
              });
            }
          } catch (notifError) {
            console.error('Failed to create notification:', notifError);
          }

          // Move to confirmation step
          setStep(4);
        },
        onError: (error) => {
          toast({
            title: 'Booking failed',
            description: error.message || 'Failed to create booking. Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleAttendeeChange = (field, value) => {
    setAttendeeDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading event details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive">Failed to load event details</p>
        <Button onClick={() => navigate('/events')} className="mt-4">
          Browse Events
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-16">
        <p>Event not found</p>
        <Button onClick={() => navigate('/events')} className="mt-4">
          Browse Events
        </Button>
      </div>
    );
  }

  // Get selected ticket details for display
  const currentTicket = getSelectedTicket();

  return (
    <div className="container max-w-4xl py-8">
      {/* Back Button */}
      <Link
        to={`/events/${eventId}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Event
      </Link>

      {/* Event Summary */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <img
              src={event.banner_url || event.image || '/placeholder-event.jpg'}
              alt={event.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h1 className="text-xl font-bold">{event.title}</h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(event.date)}
                </div>
                {(event.start_time || event.time) && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {event.start_time || event.time}
                  </div>
                )}
                {(event.location || event.venue) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.location || event.venue}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: 'Select Tickets', icon: Ticket },
          { num: 2, label: 'Your Details', icon: Users },
          { num: 3, label: 'Payment', icon: CreditCard },
          { num: 4, label: 'Confirmation', icon: Check },
        ].map((s, index) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= s.num
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <s.icon className="h-5 w-5" />
            </div>
            <span
              className={`ml-2 text-sm hidden sm:inline ${
                step >= s.num ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              {s.label}
            </span>
            {index < 3 && (
              <div
                className={`w-12 sm:w-24 h-0.5 mx-2 ${
                  step > s.num ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Tickets */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Your Tickets</CardTitle>
                <CardDescription>
                  Choose the ticket type that suits you best
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(!tickets || tickets.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No tickets configured yet for this event.
                  </p>
                )}

                {tickets && tickets.length > 0 && (
                  <RadioGroup value={selectedTicket} onValueChange={setSelectedTicket}>
                    <div className="space-y-4">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className={
                            selectedTicket === ticket.id
                              ? 'relative rounded-lg border-2 border-primary bg-primary/5 p-4 cursor-pointer'
                              : 'relative rounded-lg border-2 border-border p-4 cursor-pointer hover:border-primary/50'
                          }
                          onClick={() => setSelectedTicket(ticket.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <RadioGroupItem
                                value={ticket.id}
                                id={ticket.id}
                                className="mt-1"
                              />
                              <div>
                                <Label
                                  htmlFor={ticket.id}
                                  className="text-lg font-semibold cursor-pointer"
                                >
                                  {ticket.type || ticket.name}
                                </Label>
                                {ticket.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {ticket.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">
                                {formatCurrency(ticket.price)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {ticket.available_qty} available
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {/* Quantity Selector */}
                {selectedTicket && (
                  <div className="mt-6 flex items-center justify-between p-4 bg-muted rounded-lg">
                    <span className="font-medium">Number of Tickets</span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-xl font-semibold w-8 text-center">
                        {quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= 10 || (currentTicket && quantity >= currentTicket.available_qty)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleProceed} className="w-full" disabled={!selectedTicket}>
                  Continue to Details
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 2: Attendee Details */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Attendee Details</CardTitle>
                <CardDescription>
                  Please provide the details for the ticket holder
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={attendeeDetails.firstName}
                      onChange={(e) => handleAttendeeChange('firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={attendeeDetails.lastName}
                      onChange={(e) => handleAttendeeChange('lastName', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={attendeeDetails.email}
                    onChange={(e) => handleAttendeeChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={attendeeDetails.phone}
                    onChange={(e) => handleAttendeeChange('phone', e.target.value)}
                  />
                </div>

                {/* Promo Code Section */}
                <div className="pt-4 border-t">
                  <Label htmlFor="promoCode">Promo Code (Optional)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="promoCode"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      disabled={!!appliedPromo}
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyPromo}
                      disabled={validatePromoMutation.isPending || !!appliedPromo}
                    >
                      {validatePromoMutation.isPending ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                  {appliedPromo && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Promo "{appliedPromo.code}" applied - You save{' '}
                      {formatCurrency(discountAmount)}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleProceed} className="flex-1">
                  Continue to Payment
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Enter your payment information to complete the booking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input id="cardName" placeholder="John Doe" />
                </div>

                <div className="flex items-start gap-2 p-4 bg-muted rounded-lg">
                  <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Your payment information is encrypted and secure. We never store your
                    full card details.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleConfirmBooking}
                  className="flex-1"
                  disabled={createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending
                    ? 'Processing...'
                    : `Confirm & Pay ${formatCurrency(calculateTotal())}`}
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                <p className="text-muted-foreground mb-6">
                  Your tickets have been booked successfully. A confirmation email has been
                  sent to your email address.
                </p>
                <div className="bg-muted p-4 rounded-lg mb-6">
                  <p className="text-sm text-muted-foreground">Booking Reference</p>
                  <p className="text-2xl font-mono font-bold">
                    EVT-{Date.now().toString(36).toUpperCase()}
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => navigate('/bookings')}>
                    View My Bookings
                  </Button>
                  <Button onClick={() => navigate('/events')}>Browse More Events</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentTicket ? (
                <>
                  <div className="flex justify-between">
                    <span>
                      {currentTicket.type || currentTicket.name} x {quantity}
                    </span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Service Fee (5%)</span>
                    <span>{formatCurrency(calculateSubtotal() * 0.05)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a ticket to see the order summary
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BookEventPage;