import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  MapPin,
  DollarSign,
  Filter,
  MoreVertical,
  Eye,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useVendorBookings, useUpdateBookingStatus } from '@/hooks/useVendor';
import { formatDate, formatCurrency, getInitials } from '@/utils/helpers';
import EmptyState from '@/components/common/EmptyState';

function VendorBookingsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseType, setResponseType] = useState('');
  const [responseNote, setResponseNote] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');

  const { data: bookings, isLoading } = useVendorBookings();
  const updateStatusMutation = useUpdateBookingStatus();

  const getFilteredBookings = () => {
    if (!bookings) return [];
    if (activeTab === 'all') return bookings;
    return bookings.filter((b) => b.status === activeTab);
  };

  const filteredBookings = getFilteredBookings();

  const getStatusCounts = () => {
    if (!bookings) return { pending: 0, accepted: 0, declined: 0, completed: 0 };
    return {
      pending: bookings.filter((b) => b.status === 'pending').length,
      accepted: bookings.filter((b) => b.status === 'accepted').length,
      declined: bookings.filter((b) => b.status === 'declined').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
    };
  };

  const counts = getStatusCounts();

  const openResponseDialog = (booking, type) => {
    setSelectedBooking(booking);
    setResponseType(type);
    setResponseNote('');
    setQuotedPrice(booking.quoted_price?.toString() || '');
    setResponseDialogOpen(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedBooking) return;

    const updates = {
      bookingId: selectedBooking.id,
      status: responseType,
      notes: responseNote || null,
    };

    if (responseType === 'accepted' && quotedPrice) {
      updates.final_price = parseFloat(quotedPrice);
    }

    updateStatusMutation.mutate(updates, {
      onSuccess: () => {
        setResponseDialogOpen(false);
        setSelectedBooking(null);
      },
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      declined: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Booking Requests</h1>
        <p className="text-muted-foreground">
          Manage booking requests from event organizers
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Pending" value={counts.pending} color="text-yellow-600" />
        <StatCard label="Accepted" value={counts.accepted} color="text-green-600" />
        <StatCard label="Declined" value={counts.declined} color="text-red-600" />
        <StatCard label="Completed" value={counts.completed} color="text-blue-600" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({bookings?.length || 0})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({counts.accepted})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading && <BookingsSkeleton />}

          {!isLoading && filteredBookings.length === 0 && (
            <Card className="py-12">
              <CardContent>
                <EmptyState
                  icon={Calendar}
                  title="No bookings found"
                  description={
                    activeTab === 'all'
                      ? "You haven't received any booking requests yet."
                      : `No ${activeTab} bookings.`
                  }
                />
              </CardContent>
            </Card>
          )}

          {!isLoading && filteredBookings.length > 0 && (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onAccept={() => openResponseDialog(booking, 'accepted')}
                  onDecline={() => openResponseDialog(booking, 'declined')}
                  onComplete={() => openResponseDialog(booking, 'completed')}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {responseType === 'accepted' && 'Accept Booking'}
              {responseType === 'declined' && 'Decline Booking'}
              {responseType === 'completed' && 'Mark as Completed'}
            </DialogTitle>
            <DialogDescription>
              {responseType === 'accepted' &&
                'Confirm the booking and set your final price.'}
              {responseType === 'declined' &&
                'Let the organizer know why you cannot accept this booking.'}
              {responseType === 'completed' &&
                'Confirm that you have completed this service.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Booking Summary */}
            {selectedBooking && (
              <div className="rounded-lg bg-muted p-4">
                <p className="font-medium">{selectedBooking.event?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBooking.organizer?.name} •{' '}
                  {formatDate(selectedBooking.event?.date)}
                </p>
              </div>
            )}

            {/* Price for Accept */}
            {responseType === 'accepted' && (
              <div className="space-y-2">
                <Label>Your Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter your price"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Note */}
            <div className="space-y-2">
              <Label>
                {responseType === 'declined' ? 'Reason (Optional)' : 'Note (Optional)'}
              </Label>
              <Textarea
                placeholder={
                  responseType === 'declined'
                    ? 'Let them know why you cannot accept...'
                    : 'Add a note...'
                }
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={updateStatusMutation.isPending}
              className={
                responseType === 'declined'
                  ? 'bg-red-600 hover:bg-red-700'
                  : responseType === 'accepted'
                  ? 'bg-green-600 hover:bg-green-700'
                  : ''
              }
            >
              {updateStatusMutation.isPending
                ? 'Processing...'
                : responseType === 'accepted'
                ? 'Accept Booking'
                : responseType === 'declined'
                ? 'Decline Booking'
                : 'Mark Completed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function BookingCard({ booking, onAccept, onDecline, onComplete, getStatusBadge }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Left: Organizer & Event Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={booking.organizer?.avatar_url} />
              <AvatarFallback>
                {getInitials(booking.organizer?.name || 'O')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold">{booking.organizer?.name || 'Organizer'}</p>
                <Badge className={getStatusBadge(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
              <p className="text-lg font-medium">{booking.event?.title || 'Event'}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(booking.event?.date)}
                </span>
                {booking.event?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {booking.event.location}
                  </span>
                )}
                {booking.service && (
                  <span className="flex items-center gap-1">
                    <Badge variant="outline">{booking.service.name}</Badge>
                  </span>
                )}
              </div>
              {booking.message && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {booking.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Price & Actions */}
          <div className="flex flex-col items-end gap-3">
            {booking.final_price && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Agreed Price</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(booking.final_price)}
                </p>
              </div>
            )}
            {!booking.final_price && booking.quoted_price && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Quoted Price</p>
                <p className="text-xl font-bold">
                  {formatCurrency(booking.quoted_price)}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {booking.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-600 hover:bg-red-50"
                    onClick={onDecline}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={onAccept}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Accept
                  </Button>
                </>
              )}
              {booking.status === 'accepted' && (
                <Button size="sm" onClick={onComplete}>
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Mark Completed
                </Button>
              )}
              {booking.status === 'completed' && (
                <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default VendorBookingsPage;