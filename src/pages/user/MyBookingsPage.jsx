// src/pages/user/MyBookingsPage.jsx
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Ticket as TicketIcon,
  CreditCard,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/common/EmptyState';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { useUserBookings } from '@/hooks/useBookings';

function MyBookingsPage() {
  const { data: bookings, isLoading } = useUserBookings();

  const hasBookings = bookings && bookings.length > 0;

  if (isLoading) {
    return <BookingsSkeleton />;
  }

  if (!hasBookings) {
    return (
      <EmptyState
        icon={TicketIcon}
        title="No bookings yet"
        description="You haven't booked any events yet. Browse events to get started."
        action={() => {}}
        actionLabel="Browse Events"
      />
    );
  }

  const stats = getBookingStats(bookings);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">
          View and manage your event bookings
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Bookings" value={stats.total} />
        <StatCard label="Upcoming" value={stats.upcoming} />
        <StatCard label="Completed" value={stats.completed} />
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bookings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookings.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function getBookingStats(bookings) {
  let total = bookings.length;
  let upcoming = 0;
  let completed = 0;

  bookings.forEach((b) => {
    const eventDate = b.event?.date ? new Date(b.event.date) : null;
    if (!eventDate) {
      return;
    }
    const now = new Date();
    if (eventDate >= now) {
      upcoming += 1;
    } else {
      completed += 1;
    }
  });

  return { total, upcoming, completed };
}

function BookingRow({ booking }) {
  const event = booking.event;
  const ticket = booking.ticket;

  const statusBadge = getStatusBadge(booking.status);
  const paymentBadge = getPaymentBadge(booking.payment_status);

  return (
    <div className="rounded-lg border p-3 flex flex-col md:flex-row md:items-center justify-between gap-2 bg-muted/30">
      <div>
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm">
            {event?.title || 'Event'}
          </p>
          {statusBadge}
          {paymentBadge}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
          {event && (
            <>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(event.date)}
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              )}
            </>
          )}
          {ticket && (
            <span className="flex items-center gap-1">
              <TicketIcon className="h-3 w-3" />
              {ticket.type} x {booking.qty}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Total Paid: {formatCurrency(booking.total_amount || 0)}
        </p>
      </div>
      <div className="flex items-center gap-2 self-end md:self-center">
        <Button asChild variant="outline" size="sm">
          <Link to={`/events/${event?.id || booking.event_id}`}>
            View Event
          </Link>
        </Button>
      </div>
    </div>
  );
}

function getStatusBadge(status) {
  if (status === 'confirmed') {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 text-[10px] px-2 py-0">
        Confirmed
      </Badge>
    );
  }
  if (status === 'cancelled') {
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 text-[10px] px-2 py-0">
        Cancelled
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 text-[10px] px-2 py-0">
      Pending
    </Badge>
  );
}

function getPaymentBadge(paymentStatus) {
  if (paymentStatus === 'paid') {
    return (
      <Badge
        variant="outline"
        className="text-[10px] px-2 py-0 flex items-center gap-1"
      >
        <CreditCard className="h-3 w-3" />
        Paid
      </Badge>
    );
  }
  if (paymentStatus === 'failed') {
    return (
      <Badge
        variant="outline"
        className="text-[10px] px-2 py-0 flex items-center gap-1 text-red-700"
      >
        <CreditCard className="h-3 w-3" />
        Failed
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="text-[10px] px-2 py-0 flex items-center gap-1 text-yellow-700"
    >
      <CreditCard className="h-3 w-3" />
      Pending
    </Badge>
  );
}

function StatCard({ label, value }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingsSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64 mt-1" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default MyBookingsPage;