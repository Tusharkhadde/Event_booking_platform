import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  MoreVertical,
  Eye,
  X,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/common/EmptyState';
import { formatDate, getStatusColor } from '@/utils/helpers';

function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock data - In real app, fetch from Supabase
  const bookings = [
    {
      id: '1',
      event: {
        id: 'e1',
        title: 'Summer Music Festival 2024',
        date: '2024-07-15',
        time: '18:00',
        location: 'Central Park, New York',
        banner_url: null,
        category: 'concert',
      },
      ticket_type: 'VIP',
      quantity: 2,
      total_amount: 250,
      status: 'confirmed',
      booking_date: '2024-06-01',
    },
    {
      id: '2',
      event: {
        id: 'e2',
        title: 'Tech Conference 2024',
        date: '2024-08-20',
        time: '09:00',
        location: 'Convention Center, San Francisco',
        banner_url: null,
        category: 'conference',
      },
      ticket_type: 'Standard',
      quantity: 1,
      total_amount: 150,
      status: 'confirmed',
      booking_date: '2024-06-10',
    },
  ];

  const pastBookings = [
    {
      id: '3',
      event: {
        id: 'e3',
        title: 'Art Exhibition Opening',
        date: '2024-05-10',
        time: '19:00',
        location: 'Modern Art Museum',
        banner_url: null,
        category: 'other',
      },
      ticket_type: 'Standard',
      quantity: 2,
      total_amount: 80,
      status: 'completed',
      booking_date: '2024-05-01',
    },
  ];

  const cancelledBookings = [
    {
      id: '4',
      event: {
        id: 'e4',
        title: 'Jazz Night',
        date: '2024-04-20',
        time: '20:00',
        location: 'Blue Note Jazz Club',
        banner_url: null,
        category: 'concert',
      },
      ticket_type: 'Premium',
      quantity: 1,
      total_amount: 100,
      status: 'cancelled',
      booking_date: '2024-04-10',
    },
  ];

  const getBookingsByTab = (tab) => {
    switch (tab) {
      case 'upcoming':
        return bookings;
      case 'past':
        return pastBookings;
      case 'cancelled':
        return cancelledBookings;
      default:
        return [];
    }
  };

  const getBookingStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">
          View and manage your event bookings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming Events</CardDescription>
            <CardTitle className="text-3xl">{bookings.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
            <CardTitle className="text-3xl">
              ${bookings.reduce((sum, b) => sum + b.total_amount, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tickets</CardDescription>
            <CardTitle className="text-3xl">
              {bookings.reduce((sum, b) => sum + b.quantity, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Bookings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledBookings.length})
          </TabsTrigger>
        </TabsList>

        {['upcoming', 'past', 'cancelled'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {getBookingsByTab(tab).length === 0 && (
              <EmptyState
                icon={Ticket}
                title={`No ${tab} bookings`}
                description={
                  tab === 'upcoming'
                    ? "You don't have any upcoming bookings. Browse events to find something exciting!"
                    : `You don't have any ${tab} bookings.`
                }
                action={tab === 'upcoming' ? () => {} : undefined}
                actionLabel={tab === 'upcoming' ? 'Browse Events' : undefined}
              />
            )}

            {getBookingsByTab(tab).map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                statusColor={getBookingStatusColor(booking.status)}
              />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function BookingCard({ booking, statusColor }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Event Image */}
          <div className="aspect-video w-full overflow-hidden bg-muted sm:aspect-square sm:w-40">
            {booking.event.banner_url && (
              <img
                src={booking.event.banner_url}
                alt={booking.event.title}
                className="h-full w-full object-cover"
              />
            )}
            {!booking.event.banner_url && (
              <div className="flex h-full items-center justify-center">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Booking Details */}
          <div className="flex flex-1 flex-col p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <Badge className={statusColor}>{booking.status}</Badge>
                <Badge variant="secondary" className="ml-2 capitalize">
                  {booking.event.category}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/events/${booking.event.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Event
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download Ticket
                  </DropdownMenuItem>
                  {booking.status === 'confirmed' && (
                    <DropdownMenuItem className="text-destructive">
                      <X className="mr-2 h-4 w-4" />
                      Cancel Booking
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="mb-2 font-semibold">{booking.event.title}</h3>

            <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(booking.event.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{booking.event.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{booking.event.location}</span>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between">
              <div className="text-sm">
                <span className="text-muted-foreground">
                  {booking.quantity}x {booking.ticket_type} Ticket
                </span>
              </div>
              <div className="text-lg font-bold">
                ${booking.total_amount}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MyBookingsPage;