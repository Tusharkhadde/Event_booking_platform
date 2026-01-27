// src/pages/vendor/VendorMessagesPage.jsx
import { useUserMessages } from '@/hooks/useMessages';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Calendar } from 'lucide-react';
import { formatDate, getInitials } from '@/utils/helpers';
import EmptyState from '@/components/common/EmptyState';

function VendorMessagesPage() {
  const { data: messages, isLoading } = useUserMessages();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No messages yet"
        description="You haven't received any messages from organizers yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Communication from event organizers
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inbox</CardTitle>
          <CardDescription>
            Showing latest messages across all events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {messages.map((msg) => (
            <VendorMessageRow key={msg.id} msg={msg} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function VendorMessageRow({ msg }) {
  const counterpart = msg.sender; // For vendor, sender is typically organizer

  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-muted/40">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={counterpart?.avatar_url} />
          <AvatarFallback>
            {getInitials(counterpart?.name || 'U')}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {counterpart?.name || 'Organizer'}
            </span>
            {msg.event && (
              <Badge variant="outline" className="text-[10px]">
                {msg.event.title}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDate(msg.created_at)}
          </p>
          <p className="text-sm mt-1">{msg.message}</p>
        </div>
      </div>
      {msg.event && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(msg.event.date)}</span>
        </div>
      )}
    </div>
  );
}

export default VendorMessagesPage;