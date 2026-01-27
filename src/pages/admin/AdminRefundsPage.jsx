// src/pages/admin/AdminRefundsPage.jsx
import { useState, useMemo } from 'react';
import { useAllCancellations, useAdminUpdateCancellationStatus } from '@/hooks/useAdminCancellations';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/common/EmptyState';
import { formatDate, formatCurrency, getInitials } from '@/utils/helpers';
import {
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  X,
} from 'lucide-react';

function AdminRefundsPage() {
  const { data: cancellations, isLoading } = useAllCancellations();
  const updateStatusMutation = useAdminUpdateCancellationStatus();

  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    if (!cancellations) return [];

    const term = searchTerm.toLowerCase();

    return cancellations.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) {
        return false;
      }

      let matches = true;
      if (term) {
        const booking = c.booking;
        const user = booking?.user;
        const event = booking?.event;

        const userName = user?.name?.toLowerCase() || '';
        const userEmail = user?.email?.toLowerCase() || '';
        const eventTitle = event?.title?.toLowerCase() || '';
        const reason = (c.reason || '').toLowerCase();

        const combined = `${userName} ${userEmail} ${eventTitle} ${reason}`;

        if (combined.indexOf(term) === -1) {
          matches = false;
        }
      }
      return matches;
    });
  }, [cancellations, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    if (!cancellations || cancellations.length === 0) {
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
    let total = cancellations.length;
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    cancellations.forEach((c) => {
      if (c.status === 'approved') {
        approved += 1;
      } else if (c.status === 'rejected') {
        rejected += 1;
      } else {
        pending += 1;
      }
    });

    return { total, pending, approved, rejected };
  }, [cancellations]);

  const handleStatusChange = (id, status) => {
    updateStatusMutation.mutate({ cancellationId: id, status });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Cancellations & Refunds</h1>
        <p className="text-muted-foreground">
          Manage cancellation requests and refund approvals
        </p>
      </div>

      {/* Stats */}
      {isLoading && <StatsSkeleton />}

      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total Requests" value={stats.total} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Approved" value={stats.approved} />
          <StatCard label="Rejected" value={stats.rejected} />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by Status:</span>
            <div className="flex gap-1">
              <FilterButton
                label="All"
                value="all"
                current={statusFilter}
                onClick={() => setStatusFilter('all')}
              />
              <FilterButton
                label="Pending"
                value="pending"
                current={statusFilter}
                onClick={() => setStatusFilter('pending')}
              />
              <FilterButton
                label="Approved"
                value="approved"
                current={statusFilter}
                onClick={() => setStatusFilter('approved')}
              />
              <FilterButton
                label="Rejected"
                value="rejected"
                current={statusFilter}
                onClick={() => setStatusFilter('rejected')}
              />
            </div>
          </div>
          <div className="flex-1">
            <Label className="text-xs">Search</Label>
            <Input
              placeholder="Search by user, event, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {isLoading && <ListSkeleton />}

      {!isLoading && (!filtered || filtered.length === 0) && (
        <EmptyState
          icon={Clock}
          title="No cancellation requests found"
          description={
            statusFilter === 'all'
              ? 'There are no cancellation requests at the moment.'
              : `No ${statusFilter} requests at the moment.`
          }
        />
      )}

      {!isLoading && filtered && filtered.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Cancellation Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filtered.map((c) => (
              <CancellationRow
                key={c.id}
                cancellation={c}
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

function FilterButton({ label, value, current, onClick }) {
  const isActive = value === current;
  let className =
    'text-xs px-2 py-1 rounded border border-border bg-background text-foreground';
  if (isActive) {
    className =
      'text-xs px-2 py-1 rounded border border-primary bg-primary text-primary-foreground';
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {label}
    </button>
  );
}

function CancellationRow({ cancellation, onStatusChange, isUpdating }) {
  const booking = cancellation.booking;
  const user = booking?.user;
  const event = booking?.event;

  const statusBadge = getStatusBadge(cancellation.status);

  const amount = booking?.total_amount
    ? formatCurrency(booking.total_amount)
    : 'N/A';

  const reasonText = cancellation.reason || 'No reason provided';

  return (
    <div className="p-3 rounded-lg border bg-muted/40 flex flex-col md:flex-row md:items-center justify-between gap-2">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user?.avatar_url} />
          <AvatarFallback>
            {getInitials(user?.name || 'U')}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{user?.name || 'User'}</p>
            {statusBadge}
          </div>
          {user && (
            <p className="text-xs text-muted-foreground">
              {user.email}
            </p>
          )}
          {event && (
            <p className="text-xs text-muted-foreground mt-1">
              Event: {event.title} ({formatDate(event.date)})
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Amount: {amount}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Reason: {reasonText}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Requested: {formatDate(cancellation.created_at)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end md:self-center">
        {cancellation.status === 'pending' && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-600 hover:bg-red-50"
              onClick={() => onStatusChange(cancellation.id, 'rejected')}
              disabled={isUpdating}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Reject
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onStatusChange(cancellation.id, 'approved')}
              disabled={isUpdating}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Approve
            </Button>
          </>
        )}
        {cancellation.status !== 'pending' && (
          <Badge variant="outline" className="text-[10px] px-2 py-0">
            Reviewed
          </Badge>
        )}
      </div>
    </div>
  );
}

function getStatusBadge(status) {
  if (status === 'approved') {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 text-[10px] px-2 py-0">
        Approved
      </Badge>
    );
  }
  if (status === 'rejected') {
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 text-[10px] px-2 py-0">
        Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 text-[10px] px-2 py-0">
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

function ListSkeleton() {
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

export default AdminRefundsPage;