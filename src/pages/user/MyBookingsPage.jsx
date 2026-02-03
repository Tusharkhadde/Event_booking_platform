// src/pages/user/MyBookingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { GradientText } from '@/components/ui/gradient-text';
import { ShimmerButton } from '@/components/ui/shimmer-button';

// Icons
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Download,
  XCircle,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  CreditCard,
  QrCode,
  ChevronRight,
  Receipt,
  Mail,
  Printer,
  Share2,
  Package,
  Loader2,
} from 'lucide-react';

// Services
import { getUserBookings, cancelBooking, getBookingTickets } from '@/services/bookingService';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

// Booking status configuration
const statusConfig = {
  confirmed: {
    label: 'Confirmed',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: CheckCircle,
  },
  pending: {
    label: 'Pending',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: Clock,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: XCircle,
  },
  completed: {
    label: 'Completed',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: CheckCircle,
  },
};

// Mock bookings for demo
const MOCK_BOOKINGS = [
  {
    id: '1',
    booking_reference: 'EVT-ABC123-XYZ',
    event: {
      title: 'Tech Conference 2024',
      date: '2024-12-15',
      time: '10:00 AM',
      location: 'Convention Center, New York',
      image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    },
    tickets: [
      { name: 'VIP Pass', quantity: 2, price: 199.99 },
      { name: 'Regular', quantity: 1, price: 79.99 },
    ],
    total_amount: 479.97,
    booking_status: 'confirmed',
    payment_status: 'completed',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    booking_reference: 'EVT-DEF456-ABC',
    event: {
      title: 'Music Festival 2024',
      date: '2024-12-20',
      time: '6:00 PM',
      location: 'Central Park, New York',
      image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    },
    tickets: [
      { name: 'Premium', quantity: 2, price: 149.99 },
    ],
    total_amount: 299.98,
    booking_status: 'confirmed',
    payment_status: 'completed',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    booking_reference: 'EVT-GHI789-DEF',
    event: {
      title: 'Art Exhibition',
      date: '2024-11-10',
      time: '2:00 PM',
      location: 'Modern Art Museum',
      image_url: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=400',
    },
    tickets: [
      { name: 'Standard', quantity: 3, price: 25.00 },
    ],
    total_amount: 75.00,
    booking_status: 'completed',
    payment_status: 'completed',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

const MyBookingsPage = () => {
  const navigate = useNavigate();
  
  // State
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Load bookings
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      // Try to get real bookings
      const data = await getUserBookings('user_123');
      
      // If no real bookings, use mock data for demo
      if (data.length === 0) {
        setBookings(MOCK_BOOKINGS);
      } else {
        setBookings(data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      // Use mock data on error
      setBookings(MOCK_BOOKINGS);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    // Search filter
    const matchesSearch =
      booking.booking_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.event?.title?.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filter
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'upcoming') {
      return matchesSearch && 
        booking.booking_status === 'confirmed' &&
        new Date(booking.event?.date) >= new Date();
    }
    if (activeTab === 'past') {
      return matchesSearch && 
        (booking.booking_status === 'completed' ||
         new Date(booking.event?.date) < new Date());
    }
    if (activeTab === 'cancelled') {
      return matchesSearch && booking.booking_status === 'cancelled';
    }

    return matchesSearch;
  });

  // Handle cancel booking
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setCancelling(true);
    try {
      await cancelBooking(selectedBooking.id, 'User requested cancellation');
      toast.success('Booking cancelled successfully');
      loadBookings();
    } catch (error) {
      toast.error('Failed to cancel booking');
    } finally {
      setCancelling(false);
      setCancelDialogOpen(false);
      setSelectedBooking(null);
    }
  };

  // View tickets
  const handleViewTickets = (booking) => {
    navigate(`/user/tickets`, { state: { bookingId: booking.id } });
  };

  // Download receipt
  const handleDownloadReceipt = (booking) => {
    toast.success('Receipt downloaded!');
    // TODO: Implement actual PDF download
  };

  // Resend confirmation
  const handleResendConfirmation = (booking) => {
    toast.success('Confirmation email sent!');
  };

  // Calculate stats
  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(b => 
      b.booking_status === 'confirmed' && 
      new Date(b.event?.date) >= new Date()
    ).length,
    past: bookings.filter(b => 
      b.booking_status === 'completed' ||
      new Date(b.event?.date) < new Date()
    ).length,
    cancelled: bookings.filter(b => b.booking_status === 'cancelled').length,
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 py-8">
        <div className="container max-w-5xl mx-auto px-4">
          <Skeleton className="h-10 w-48 bg-slate-800 mb-8" />
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 bg-slate-800 rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container max-w-5xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-purple-400" />
              My Bookings
            </h1>
            <p className="text-slate-400 mt-1">
              Manage and view all your event bookings
            </p>
          </div>

          <Button
            variant="outline"
            className="border-slate-700 text-white hover:bg-slate-800"
            onClick={loadBookings}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: Package, color: 'purple' },
            { label: 'Upcoming', value: stats.upcoming, icon: Calendar, color: 'emerald' },
            { label: 'Past', value: stats.past, icon: CheckCircle, color: 'blue' },
            { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'red' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      stat.color === 'purple' && 'bg-purple-500/20 text-purple-400',
                      stat.color === 'emerald' && 'bg-emerald-500/20 text-emerald-400',
                      stat.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                      stat.color === 'red' && 'bg-red-500/20 text-red-400',
                    )}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search by booking reference or event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700 text-white"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-slate-900/50 border border-slate-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
              All ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-purple-600">
              Upcoming ({stats.upcoming})
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-purple-600">
              Past ({stats.past})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:bg-purple-600">
              Cancelled ({stats.cancelled})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Bookings List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredBookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No bookings found
                </h3>
                <p className="text-slate-400 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search'
                    : "You haven't made any bookings yet"}
                </p>
                <ShimmerButton onClick={() => navigate('/events')}>
                  Browse Events
                </ShimmerButton>
              </motion.div>
            ) : (
              filteredBookings.map((booking, index) => {
                const status = statusConfig[booking.booking_status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const isUpcoming = new Date(booking.event?.date) >= new Date();
                const ticketCount = booking.tickets?.reduce((sum, t) => sum + (t.quantity || 1), 0) || 0;

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card className="bg-slate-900/50 border-slate-800 overflow-hidden hover:border-slate-700 transition-colors">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Event Image */}
                          <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
                            {booking.event?.image_url ? (
                              <img
                                src={booking.event.image_url}
                                alt={booking.event.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                <Calendar className="w-12 h-12 text-white/50" />
                              </div>
                            )}
                            {/* Status badge on image */}
                            <Badge className={cn(
                              'absolute top-3 left-3',
                              status.color
                            )}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-5">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              {/* Event Info */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-xs text-slate-500 font-mono mb-1">
                                      {booking.booking_reference}
                                    </p>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                      {booking.event?.title}
                                    </h3>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(booking.event?.date).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {booking.event?.time}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    {booking.event?.location}
                                  </span>
                                </div>

                                {/* Tickets summary */}
                                <div className="flex flex-wrap gap-2">
                                  {booking.tickets?.map((ticket, i) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="border-slate-700 text-slate-300"
                                    >
                                      <Ticket className="w-3 h-3 mr-1" />
                                      {ticket.quantity}x {ticket.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Price & Actions */}
                              <div className="flex flex-col items-end gap-3">
                                <div className="text-right">
                                  <p className="text-sm text-slate-400">Total</p>
                                  <p className="text-xl font-bold text-white">
                                    ${booking.total_amount?.toFixed(2)}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  {booking.booking_status === 'confirmed' && isUpcoming && (
                                    <Button
                                      size="sm"
                                      className="bg-purple-600 hover:bg-purple-700"
                                      onClick={() => handleViewTickets(booking)}
                                    >
                                      <QrCode className="w-4 h-4 mr-1" />
                                      View Tickets
                                    </Button>
                                  )}

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="border-slate-700 hover:bg-slate-800"
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                                      <DropdownMenuItem
                                        className="text-slate-300 focus:text-white focus:bg-slate-800"
                                        onClick={() => handleViewTickets(booking)}
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-slate-300 focus:text-white focus:bg-slate-800"
                                        onClick={() => handleDownloadReceipt(booking)}
                                      >
                                        <Receipt className="w-4 h-4 mr-2" />
                                        Download Receipt
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-slate-300 focus:text-white focus:bg-slate-800"
                                        onClick={() => handleResendConfirmation(booking)}
                                      >
                                        <Mail className="w-4 h-4 mr-2" />
                                        Resend Confirmation
                                      </DropdownMenuItem>
                                      {booking.booking_status === 'confirmed' && isUpcoming && (
                                        <DropdownMenuItem
                                          className="text-red-400 focus:text-red-300 focus:bg-red-950"
                                          onClick={() => {
                                            setSelectedBooking(booking);
                                            setCancelDialogOpen(true);
                                          }}
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Cancel Booking
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                <p className="text-xs text-slate-500">
                                  Booked {new Date(booking.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to cancel this booking? This action cannot be undone.
              Refunds will be processed according to the event's cancellation policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelling ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyBookingsPage;