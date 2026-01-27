import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEventCancellations, useUpdateCancellationStatus } from '@/hooks/useCancellation';
import { formatDate } from '@/utils/helpers';
import EmptyState from '@/components/common/EmptyState';

function EventCancellationsPage() {
  const { eventId } = useParams();
  const { data: cancellations, isLoading } = useEventCancellations(eventId);
  const updateStatus = useUpdateCancellationStatus();

  const handleAction = (id, status) => {
    updateStatus.mutate({ cancellationId: id, status });
  };

  if (isLoading) return <div>Loading...</div>;

  if (!cancellations || cancellations.length === 0) {
    return <EmptyState icon={Clock} title="No Cancellation Requests" description="You have no pending cancellations." />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Cancellation Requests</h1>
      {cancellations.map((c) => {
        const booking = c.bookings;
        const user = booking?.users;
        return (
          <Card key={c.id}>
            <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Reason: {c.reason || 'No reason provided'}</p>
                  <p className="text-xs text-muted-foreground">Requested: {formatDate(c.created_at)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {c.status === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700" 
                      onClick={() => handleAction(c.id, 'approved')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleAction(c.id, 'rejected')}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </>
                )}
                <Badge variant={c.status === 'approved' ? 'default' : 'destructive'}>
                  {c.status.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default EventCancellationsPage;