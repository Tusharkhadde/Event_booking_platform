// src/pages/user/MyTransportPage.jsx
import { useState } from 'react';
import { Car, MapPin, Clock } from 'lucide-react';
import { useUserTransportRequests, useCreateTransportRequest } from '@/hooks/useTransport';
import { useEvents } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/common/EmptyState';
import { formatDate } from '@/utils/helpers';

function MyTransportPage() {
  const { data: requests, isLoading: requestsLoading } = useUserTransportRequests();
  // For demo simplicity, we fetch events and let user choose. In real app, use their bookings.
  const { data: events } = useEvents({ status: 'upcoming' });

  const createRequestMutation = useCreateTransportRequest();

  const [form, setForm] = useState({
    event_id: '',
    type: 'pickup',
    pickup_location: '',
    dropoff_location: '',
    desired_time: '',
    passengers: '1',
    parking_required: false,
    vehicle_details: '',
    notes: '',
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = () => {
    if (!form.event_id || !form.type) {
      return;
    }

    const payload = {
      event_id: form.event_id,
      type: form.type,
      pickup_location: form.pickup_location || null,
      dropoff_location: form.dropoff_location || null,
      desired_time: form.desired_time || null,
      passengers: Number(form.passengers || 1),
      parking_required: form.parking_required === true,
      vehicle_details: form.vehicle_details || null,
      notes: form.notes || null,
    };

    createRequestMutation.mutate(payload, {
      onSuccess: () => {
        setForm({
          event_id: '',
          type: 'pickup',
          pickup_location: '',
          dropoff_location: '',
          desired_time: '',
          passengers: '1',
          parking_required: false,
          vehicle_details: '',
          notes: '',
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Car className="h-6 w-6 text-primary" />
          My Transportation & Parking
        </h1>
        <p className="text-muted-foreground">
          Request pickup/drop and parking for your events
        </p>
      </div>

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">New Request</CardTitle>
          <CardDescription>
            Choose an event and specify your transportation or parking needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Event</Label>
            <select
              className="h-9 rounded border bg-background text-sm px-2 w-full"
              value={form.event_id}
              onChange={(e) => handleChange('event_id', e.target.value)}
            >
              <option value="">Select event</option>
              {events &&
                events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({formatDate(ev.date)})
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Request Type</Label>
            <select
              className="h-9 rounded border bg-background text-sm px-2 w-full"
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="pickup">Pickup</option>
              <option value="dropoff">Drop-off</option>
              <option value="both">Pickup & Drop-off</option>
              <option value="parking">Parking Only</option>
            </select>
          </div>

          {/* Transport fields */}
          {form.type !== 'parking' && (
            <>
              <div className="space-y-1">
                <Label>Pickup Location</Label>
                <Input
                  placeholder="e.g., Home address"
                  value={form.pickup_location}
                  onChange={(e) => handleChange('pickup_location', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Drop-off Location</Label>
                <Input
                  placeholder="e.g., Event venue"
                  value={form.dropoff_location}
                  onChange={(e) => handleChange('dropoff_location', e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label>Preferred Time</Label>
            <Input
              placeholder="e.g., 6:30 PM"
              value={form.desired_time}
              onChange={(e) => handleChange('desired_time', e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Number of Passengers</Label>
            <Input
              type="number"
              min="1"
              value={form.passengers}
              onChange={(e) => handleChange('passengers', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="parking_required"
              type="checkbox"
              checked={form.parking_required}
              onChange={(e) => handleChange('parking_required', e.target.checked)}
            />
            <Label htmlFor="parking_required" className="text-sm">
              Parking required
            </Label>
          </div>

          {form.parking_required && (
            <div className="space-y-1">
              <Label>Vehicle Details</Label>
              <Input
                placeholder="e.g., Car model, registration number"
                value={form.vehicle_details}
                onChange={(e) => handleChange('vehicle_details', e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1">
            <Label>Notes (optional)</Label>
            <Input
              placeholder="Any extra info for organizer"
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </div>

          <Button
            className="mt-2"
            onClick={handleSubmit}
            disabled={createRequestMutation.isPending}
          >
            Submit Request
          </Button>
        </CardContent>
      </Card>

      {/* Existing Requests */}
      {requestsLoading && <RequestsSkeleton />}

      {!requestsLoading && (!requests || requests.length === 0) && (
        <EmptyState
          icon={Car}
          title="No requests yet"
          description="You haven't requested any transportation or parking yet."
        />
      )}

      {!requestsLoading && requests && requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.map((req) => (
              <UserRequestRow key={req.id} req={req} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function UserRequestRow({ req }) {
  const statusBadge = getStatusBadge(req.status);
  const isTransport = req.type !== 'parking';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 rounded-lg border bg-muted/40">
      <div>
        {req.event && (
          <p className="font-medium text-sm flex items-center gap-2">
            {req.event.title}
            <Badge variant="outline" className="text-[10px]">
              {formatDate(req.event.date)}
            </Badge>
          </p>
        )}
        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-[10px] capitalize">
            Type: {req.type}
          </Badge>
          {isTransport && req.pickup_location && (
            <span>Pickup: {req.pickup_location}</span>
          )}
          {isTransport && req.dropoff_location && (
            <span>Drop: {req.dropoff_location}</span>
          )}
          {req.desired_time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {req.desired_time}
            </span>
          )}
          {req.parking_required && (
            <span>Parking: Required</span>
          )}
        </div>
        {req.notes && (
          <p className="text-xs text-muted-foreground mt-1">
            Notes: {req.notes}
          </p>
        )}
      </div>
      <div className="self-end md:self-center">
        {statusBadge}
      </div>
    </div>
  );
}

function getStatusBadge(status) {
  if (status === 'approved') {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
        Approved
      </Badge>
    );
  }

  if (status === 'rejected') {
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
        Rejected
      </Badge>
    );
  }

  if (status === 'completed') {
    return (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
        Completed
      </Badge>
    );
  }

  return (
    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
      Pending
    </Badge>
  );
}

function RequestsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  );
}

export default MyTransportPage;