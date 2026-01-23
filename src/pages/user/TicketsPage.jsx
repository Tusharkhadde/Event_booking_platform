import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  QrCode,
  Download,
  Share2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmptyState from '@/components/common/EmptyState';
import { formatDate } from '@/utils/helpers';
import { toast } from '@/hooks/useToast';

function TicketsPage() {
  const [activeTab, setActiveTab] = useState('valid');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Mock data - In real app, fetch from Supabase
  const validTickets = [
    {
      id: 't1',
      ticket_code: 'EVT-2024-ABC123',
      event: {
        id: 'e1',
        title: 'Summer Music Festival 2024',
        date: '2024-07-15',
        time: '18:00',
        location: 'Central Park, New York',
        category: 'concert',
      },
      ticket_type: 'VIP',
      seat: 'A-15',
      status: 'valid',
      purchased_at: '2024-06-01',
    },
    {
      id: 't2',
      ticket_code: 'EVT-2024-DEF456',
      event: {
        id: 'e1',
        title: 'Summer Music Festival 2024',
        date: '2024-07-15',
        time: '18:00',
        location: 'Central Park, New York',
        category: 'concert',
      },
      ticket_type: 'VIP',
      seat: 'A-16',
      status: 'valid',
      purchased_at: '2024-06-01',
    },
    {
      id: 't3',
      ticket_code: 'EVT-2024-GHI789',
      event: {
        id: 'e2',
        title: 'Tech Conference 2024',
        date: '2024-08-20',
        time: '09:00',
        location: 'Convention Center, San Francisco',
        category: 'conference',
      },
      ticket_type: 'Standard',
      seat: null,
      status: 'valid',
      purchased_at: '2024-06-10',
    },
  ];

  const usedTickets = [
    {
      id: 't4',
      ticket_code: 'EVT-2024-JKL012',
      event: {
        id: 'e3',
        title: 'Art Exhibition Opening',
        date: '2024-05-10',
        time: '19:00',
        location: 'Modern Art Museum',
        category: 'other',
      },
      ticket_type: 'Standard',
      seat: null,
      status: 'used',
      purchased_at: '2024-05-01',
      used_at: '2024-05-10',
    },
  ];

  const getTicketsByTab = (tab) => {
    switch (tab) {
      case 'valid':
        return validTickets;
      case 'used':
        return usedTickets;
      default:
        return [];
    }
  };

  const handleDownloadTicket = (ticket) => {
    toast({
      title: 'Download Started',
      description: `Downloading ticket ${ticket.ticket_code}`,
    });
  };

  const handleShareTicket = async (ticket) => {
    const shareData = {
      title: ticket.event.title,
      text: `Check out my ticket for ${ticket.event.title}!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Ticket link copied to clipboard',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <p className="text-muted-foreground">
          View and manage your event tickets
        </p>
      </div>

      {/* Tickets Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="valid">
            Valid Tickets ({validTickets.length})
          </TabsTrigger>
          <TabsTrigger value="used">
            Used Tickets ({usedTickets.length})
          </TabsTrigger>
        </TabsList>

        {['valid', 'used'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {getTicketsByTab(tab).length === 0 && (
              <EmptyState
                icon={Ticket}
                title={`No ${tab} tickets`}
                description={
                  tab === 'valid'
                    ? "You don't have any valid tickets. Book an event to get started!"
                    : "You don't have any used tickets yet."
                }
                action={tab === 'valid' ? () => {} : undefined}
                actionLabel={tab === 'valid' ? 'Browse Events' : undefined}
              />
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {getTicketsByTab(tab).map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onViewQR={() => setSelectedTicket(ticket)}
                  onDownload={() => handleDownloadTicket(ticket)}
                  onShare={() => handleShareTicket(ticket)}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* QR Code Dialog */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={() => setSelectedTicket(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ticket QR Code</DialogTitle>
            <DialogDescription>
              Show this QR code at the event entrance
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="flex flex-col items-center space-y-4">
              {/* Simulated QR Code */}
              <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                <QrCode className="h-24 w-24 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-mono text-lg font-bold">
                  {selectedTicket.ticket_code}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedTicket.event.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedTicket.ticket_type}
                  {selectedTicket.seat && ` • Seat ${selectedTicket.seat}`}
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => handleDownloadTicket(selectedTicket)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Ticket
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TicketCard({ ticket, onViewQR, onDownload, onShare }) {
  const isUsed = ticket.status === 'used';

  return (
    <Card className={isUsed ? 'opacity-75' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant={isUsed ? 'secondary' : 'default'}>
              {isUsed && <Check className="mr-1 h-3 w-3" />}
              {ticket.ticket_type}
            </Badge>
            {ticket.seat && (
              <Badge variant="outline" className="ml-2">
                Seat {ticket.seat}
              </Badge>
            )}
          </div>
          <Badge variant={isUsed ? 'secondary' : 'outline'}>
            {isUsed ? 'Used' : 'Valid'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">{ticket.event.title}</h3>
          <p className="font-mono text-sm text-muted-foreground">
            {ticket.ticket_code}
          </p>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(ticket.event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{ticket.event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{ticket.event.location}</span>
          </div>
        </div>

        {!isUsed && (
          <div className="flex gap-2">
            <Button className="flex-1" onClick={onViewQR}>
              <QrCode className="mr-2 h-4 w-4" />
              View QR
            </Button>
            <Button variant="outline" size="icon" onClick={onDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {isUsed && (
          <p className="text-sm text-muted-foreground">
            Used on {formatDate(ticket.used_at)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default TicketsPage;