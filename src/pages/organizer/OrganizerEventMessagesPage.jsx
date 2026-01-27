// src/pages/organizer/OrganizerEventMessagesPage.jsx
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  UserCircle,
  MessageCircle,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useEvent } from '@/hooks/useEvents';
import { useEventMessages, useSendEventMessage } from '@/hooks/useMessages';
import { formatDate, getInitials } from '@/utils/helpers';
import { Skeleton } from '@/components/ui/skeleton';
import useAuthStore from '@/store/authStore';

function OrganizerEventMessagesPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();

  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: messages, isLoading: messagesLoading } = useEventMessages(eventId);
  const sendMessageMutation = useSendEventMessage(eventId);

  const [text, setText] = useState('');
  const [selectedReceiverId, setSelectedReceiverId] = useState('');

  const loading = eventLoading || messagesLoading;

  // Compute list of participants (senders and receivers)
  const participants = useMemo(() => {
    const map = {};
    if (!messages) {
      return [];
    }

    messages.forEach((msg) => {
      if (msg.sender) {
        map[msg.sender.id] = msg.sender;
      }
      if (msg.receiver) {
        map[msg.receiver.id] = msg.receiver;
      }
    });

    const arr = Object.values(map);
    // Filter out current organizer if desired
    if (profile && profile.id) {
      return arr.filter((p) => p.id !== profile.id);
    }
    return arr;
  }, [messages, profile]);

  const handleSend = () => {
    if (!text) return;

    sendMessageMutation.mutate(
      {
        receiverId: selectedReceiverId || null,
        text,
      },
      {
        onSuccess: () => {
          setText('');
        },
      }
    );
  };

  const handleReceiverChange = (e) => {
    setSelectedReceiverId(e.target.value);
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Event Messages
          </h1>
          {event && (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              {event.title} • {formatDate(event.date)}
            </p>
          )}
        </div>
      </div>

      {loading && <MessagesSkeleton />}

      {!loading && !messages && (
        <p className="text-sm text-muted-foreground">
          No messages yet. Start a conversation below.
        </p>
      )}

      {!loading && messages && (
        <div className="grid gap-4 lg:grid-cols-4 flex-1 min-h-0">
          {/* Participants list */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Participants
              </CardTitle>
              <CardDescription>Vendors or users you’ve chatted with</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-2">
              <Button
                variant={selectedReceiverId === '' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => setSelectedReceiverId('')}
              >
                All Messages
              </Button>

              {participants.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  No other participants yet.
                </p>
              )}

              {participants.length > 0 &&
                participants.map((p) => (
                  <button
                    key={p.id}
                    className={
                      selectedReceiverId === p.id
                        ? 'w-full flex items-center gap-2 rounded-md border bg-primary text-primary-foreground px-2 py-2 text-left text-sm'
                        : 'w-full flex items-center gap-2 rounded-md border border-transparent px-2 py-2 text-left text-sm hover:bg-muted'
                    }
                    onClick={() => setSelectedReceiverId(p.id)}
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={p.avatar_url} />
                      <AvatarFallback>
                        {getInitials(p.name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-xs">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {p.role}
                      </span>
                    </div>
                  </button>
                ))}
            </CardContent>
          </Card>

          {/* Messages + Input */}
          <Card className="lg:col-span-3 flex flex-col min-h-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Conversation</CardTitle>
              <CardDescription>
                Messages within this event.
                {' '}
                {selectedReceiverId && 'Filtered by selected participant.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 flex-1 min-h-0">
              {/* Messages List */}
              <div className="flex-1 min-h-0 overflow-y-auto space-y-2 border rounded-md p-3 bg-muted/30">
                {messages.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No messages yet. Start a conversation by sending a message below.
                  </p>
                )}

                {messages.length > 0 &&
                  messages
                    .filter((msg) => {
                      if (!selectedReceiverId) {
                        return true;
                      }
                      if (!msg.receiver_id) {
                        return false;
                      }
                      const fromSelected =
                        msg.sender_id === selectedReceiverId ||
                        msg.receiver_id === selectedReceiverId;
                      return fromSelected;
                    })
                    .map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        currentUserId={profile?.id}
                      />
                    ))}
              </div>

              {/* Input Area */}
              <div className="space-y-2 mt-2">
                <div className="space-y-1">
                  <LabelSmall>Send To (optional)</LabelSmall>
                  <select
                    className="h-9 rounded border bg-background text-xs px-2"
                    value={selectedReceiverId}
                    onChange={handleReceiverChange}
                  >
                    <option value="">All Participants (no specific receiver)</option>
                    {participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg, currentUserId }) {
  const isOwn = msg.sender_id === currentUserId;

  return (
    <div
      className={
        isOwn
          ? 'flex justify-end'
          : 'flex justify-start'
      }
    >
      <div
        className={
          isOwn
            ? 'max-w-xs md:max-w-md bg-primary text-primary-foreground rounded-lg px-3 py-2 text-xs'
            : 'max-w-xs md:max-w-md bg-background border rounded-lg px-3 py-2 text-xs'
        }
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-[11px]">
            {msg.sender?.name || 'User'}
          </span>
          {msg.receiver && (
            <Badge variant="secondary" className="text-[9px]">
              To {msg.receiver.name}
            </Badge>
          )}
        </div>
        <p className="whitespace-pre-wrap">{msg.message}</p>
      </div>
    </div>
  );
}

function MessagesSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full lg:col-span-3" />
    </div>
  );
}

function LabelSmall({ children }) {
  return (
    <span className="text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

export default OrganizerEventMessagesPage;