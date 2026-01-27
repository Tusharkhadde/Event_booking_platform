import { Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserCancellations } from '@/hooks/useCancellation';
import { formatDate } from '@/utils/helpers';
import EmptyState from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

function MyCancellationsPage() {
  const { data: cancellations, isLoading } = useUserCancellations();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <HeaderSkeleton />
        <Card>
          <CardContent className="space-y-3 pt-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cancellations || cancellations.length === 0) {
    return (
      <EmptyState
        icon={XCircle}
        title="No cancellation requests"
        description="You haven't requested any booking cancellations yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">My Cancellations</h1>
        <p className="text-muted-foreground">
          Track the status of your booking cancellation requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cancellation History</CardTitle>
          <CardDescription>
            You have requested {cancellations.length} cancellation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {cancellations.map((cancellation) => (
            <CancellationRow key={cancellation.id} cancellation={cancellation} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function CancellationRow({ cancellation }) {
  const status = cancellation.status || 'pending';

  const getStatusBadge = (value) => {
    if (value === 'approved') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
          Approved
        </Badge>
      );
    }

    if (value === 'rejected') {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
          Rejected
        </Badge>
      );
    }

    return (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
        Pending
      </Badge>
    );
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 rounded-lg border bg-muted/40">
      <div>
        <p className="text-sm font-medium">
          Booking ID: <span className="font-mono">{cancellation.booking_id}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Requested on {formatDate(cancellation.created_at)}
        </p>
        {cancellation.reason && (
          <p className="text-xs text-muted-foreground mt-1">
            Reason: {cancellation.reason}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 self-end md:self-center">
        {getStatusBadge(status)}
      </div>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-80" />
    </div>
  );
}

export default MyCancellationsPage;