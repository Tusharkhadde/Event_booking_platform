// src/pages/organizer/LiveCheckinPage.jsx
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  Users,
  Ticket,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEvent } from '@/hooks/useEvents';
import { useGuests, useToggleGuestCheckin } from '@/hooks/useGuests';
import { formatDate } from '@/utils/helpers';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/common/EmptyState';

function LiveCheckinPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: guests, isLoading: guestsLoading } = useGuests(eventId);
  const toggleCheckinMutation = useToggleGuestCheckin();

  const [searchTerm, setSearchTerm] = useState('');
  const [scanCode, setScanCode] = useState('');

  const loading = eventLoading || guestsLoading;

  // Filter guests by name or ticket code
  const filteredGuests = useMemo(() => {
    if (!guests) return [];
    if (!searchTerm && !scanCode) return guests;

    const term = (searchTerm || scanCode).toLowerCase();

    return guests.filter((g) => {
      const nameMatch = g.name.toLowerCase().includes(term);
      const emailMatch = (g.email || '').toLowerCase().includes(term);
      const codeMatch = (g.ticket_code || '').toLowerCase().includes(term);
      return nameMatch || emailMatch || codeMatch;
    });
  }, [guests, searchTerm, scanCode]);

  const stats = useMemo(() => {
    if (!guests) {
      return { total: 0, checkedIn: 0, remaining: 0 };
    }
    const total = guests.length;
    const checkedIn = guests.filter((g) => g.checked_in).length;
    const remaining = total - checkedIn;
    return { total, checkedIn, remaining };
  }, [guests]);

  const handleCheckinToggle = (guest) => {
    toggleCheckinMutation.mutate({
      guestId: guest.id,
      checkedIn: !guest.checked_in,
    });
  };

  const handleScanSubmit = (e) => {
    e.preventDefault();
    // simulate scanning: search by code
    if (!scanCode) return;

    setSearchTerm(scanCode);
    setScanCode('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Live Check-in</h1>
          {event && (
            <p className="text-muted-foreground">
              {event.title} • {formatDate(event.date)}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total Guests"
          value={stats.total}
          color="text-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Checked In"
          value={stats.checkedIn}
          color="text-green-600"
        />
        <StatCard
          icon={XCircle}
          label="Remaining"
          value={stats.remaining}
          color="text-yellow-600"
        />
      </div>

      {/* Search & "Scan" section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Find Guest</CardTitle>
          <CardDescription>
            Search by name, email, or ticket code. Use the scan box to simulate QR code scanning.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Normal search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search guest by name, email, or ticket code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* QR / Code scan simulation */}
          <form onSubmit={handleScanSubmit} className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 md:max-w-sm">
              <QrCode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Scan or enter ticket code..."
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="outline">
              Simulate Scan
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Guests List */}
      {loading && <GuestListSkeleton />}

      {!loading && guests && guests.length === 0 && (
        <EmptyState
          icon={Users}
          title="No guests yet"
          description="Add guests to this event to start check-in."
        />
      )}

      {!loading && guests && guests.length > 0 && filteredGuests.length === 0 && (
        <EmptyState
          icon={Search}
          title="No matching guests"
          description="Try a different name, email, or ticket code."
        />
      )}

      {!loading && filteredGuests && filteredGuests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Guest List</CardTitle>
            <CardDescription>
              Showing {filteredGuests.length} of {guests.length} guests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredGuests.map((guest) => (
              <GuestRow
                key={guest.id}
                guest={guest}
                onToggle={() => handleCheckinToggle(guest)}
                loading={toggleCheckinMutation.isPending}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="p-3 rounded-full bg-muted">
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function GuestRow({ guest, onToggle, loading }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-2 rounded-lg border hover:bg-muted/50">
      <div className="flex flex-col">
        <div className="flex gap-2 items-center">
          <span className="font-medium">{guest.name}</span>
          {guest.ticket_code && (
            <Badge variant="outline" className="text-[10px]">
              {guest.ticket_code}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-1">
          {guest.email && <span>{guest.email}</span>}
          {guest.category && (
            <span className="capitalize">Category: {guest.category}</span>
          )}
          <span>RSVP: {guest.rsvp_status || 'pending'}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {guest.checked_in && (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Checked In
          </Badge>
        )}
        <Button
          size="sm"
          variant={guest.checked_in ? 'outline' : 'default'}
          onClick={onToggle}
          disabled={loading}
        >
          {guest.checked_in ? (
            <>
              <XCircle className="mr-1 h-4 w-4" />
              Undo
            </>
          ) : (
            <>
              <CheckCircle className="mr-1 h-4 w-4" />
              Check In
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function GuestListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-2 rounded-lg border"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default LiveCheckinPage;