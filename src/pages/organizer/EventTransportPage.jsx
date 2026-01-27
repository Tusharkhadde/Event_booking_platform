// src/pages/organizer/EventTransportPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '@/hooks/useEvents';
import { useEventTransportRequests, useUpdateTransportStatus } from '@/hooks/useTransport';
import {
  ArrowLeft,
  Car,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/common/EmptyState';
import { formatDate, getInitials } from '@/utils/helpers';

function EventTransportPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: requests, isLoading: requestsLoading } = useEventTransportRequests(eventId);
  const updateStatusMutation = useUpdateTransportStatus();

  const loading = eventLoading || requestsLoading;

  const stats = getTransportStats(requests);

  const handleStatusChange = (id, status) => {
    updateStatusMutation.mutate({ requestId: id, status });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Transportation & Parking
          </h1>
          {event && (
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              {event.title}
              <span>•</span>
              {formatDate(event.date)}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      {loading && <StatsSkeleton />}

      {!loading && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Requests"
            value={stats.total}
          />
          <StatCard
            icon={Car}
            label="Pickup/Drop"
            value={stats.transport}
          />
          <StatCard
            icon={Car}
            label="Parking Only"
            value={stats.parkingOnly}
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
          />
        </div>
      )}

      {/* Requests List */}
      {loading && <RequestsSkeleton />}

      {!loading && (!requests || requests.length === 0) && (
        <EmptyState
          icon={Car}
          title="No transport requests"
          description="Guests have not submitted any transportation or parking requests yet."
        />
      )}

      {!loading && requests && requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requests</CardTitle>
            <CardDescription>
              Manage pickup, drop-off, and parking for your guests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.map((req) => (
              <RequestRow
                key={req.id}
                request={req}
                onStatusChange={handleStatusChange}
                isUpdating={updateStatusMutation.isPending}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getTransportStats(requests) {
  if (!requests || requests.length === 0) {
    return { total: 0, transport: 0, parkingOnly: 0, pending: 0 };
  }

  let total = requests.length;
  let transport = 0; // pickup/drop/both
  let parkingOnly = 0;
  let pending = 0;

  requests.forEach((r) => {
    if (r.type === 'parking') {
      parkingOnly += 1;
    } else {
      transport += 1;
    }

    if (r.status === 'pending') {
      pending += 1;
    }
  });

  return { total, transport, parkingOnly, pending };
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="p-2 rounded-full bg-muted">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

function RequestRow({ request, onStatusChange, isUpdating }) {
  const user = request.user;
  const isTransport = request.type !== 'parking';

  const statusBadge = getStatusBadge(request.status);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 rounded-lg border bg-muted/30">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user?.avatar_url} />
          <AvatarFallback>
            {getInitials(user?.name || 'U')}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{user?.name || 'Guest'}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <div className="flex flex-wrap gap-2 mt-1 text-[11px] text-muted-foreground">
            <Badge variant="secondary" className="text-[10px] capitalize">
              Type: {request.type}
            </Badge>
            {isTransport && request.pickup_location && (
              <span>Pickup: {request.pickup_location}</span>
            )}
            {isTransport && request.dropoff_location && (
              <span>Drop: {request.dropoff_location}</span>
            )}
            {request.desired_time && (
              <span>Time: {request.desired_time}</span>
            )}
            {request.parking_required && (
              <span>Parking: Required</span>
            )}
            {request.vehicle_details && (
              <span>Vehicle: {request.vehicle_details}</span>
            )}
          </div>
          {request.notes && (
            <p className="mt-1 text-xs text-muted-foreground">
              Notes: {request.notes}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 self-end md:self-center">
        {statusBadge}
        {request.status === 'pending' && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-600 hover:bg-red-50"
              onClick={() => onStatusChange(request.id, 'rejected')}
              disabled={isUpdating}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Reject
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onStatusChange(request.id, 'approved')}
              disabled={isUpdating}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Approve
            </Button>
          </>
        )}
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

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
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

export default EventTransportPage;