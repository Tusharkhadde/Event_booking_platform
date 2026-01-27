// src/pages/user/TicketsPage.jsx
import { useUserBookings } from '@/hooks/useBookings';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/common/EmptyState';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { Ticket as TicketIcon, Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

function TicketsPage() {
  const { data: bookings, isLoading } = useUserBookings();

  if (isLoading) {
    return <TicketsSkeleton />;
  }

  const validBookings =
    bookings && bookings.length > 0
      ? bookings.filter((b) => b.status === 'confirmed')
      : [];

  if (!validBookings || validBookings.length === 0) {
    return (
      <EmptyState
        icon={TicketIcon}
        title="No valid tickets"
        description="Once you book events, your tickets will appear here."
        action={() => {}}
        actionLabel="Browse Events"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <p className="text-muted-foreground">
          Show these at the entrance for check-in
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tickets</CardTitle>
          <CardDescription>
            Each ticket is associated with a confirmed booking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {validBookings.map((booking) => (
            <TicketCard key={booking.id} booking={booking} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function TicketCard({ booking }) {
  const event = booking.event;
  const ticket = booking.ticket;

  const code = booking.booking_reference || booking.id;

  return (
    <div className="rounded-lg border p-3 flex flex-col md:flex-row md:items-center justify-between gap-2 bg-muted/30">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <TicketIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm">
            {event?.title || 'Event'}
          </p>
          <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground mt-1">
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
              <Badge variant="secondary" className="text-[10px]">
                {ticket.type} x {booking.qty}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Booking Ref: <span className="font-mono">{code}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Paid: {formatCurrency(booking.total_amount || 0)}
          </p>
        </div>
      </div>
      <div className="self-end md:self-center">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/events/${event?.id || booking.event_id}`}>
            View Event
          </Link>
        </Button>
      </div>
    </div>
  );
}

function TicketsSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64 mt-1" />
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

export default TicketsPage;