// src/components/tickets/TicketCard.jsx
import React, { useState } from 'react';
import { QRCodeSVG } from 'react-qr-code';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  Clock,
  MapPin,
  Download,
  Share2,
  Send,
  MoreVertical,
  QrCode,
  CheckCircle,
  XCircle,
  Ticket,
  User
} from 'lucide-react';
import { cn } from '@/utils/cn';

const statusConfig = {
  active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  used: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
  expired: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
};

const ticketTypeConfig = {
  vip: { color: 'bg-purple-600', label: 'VIP' },
  premium: { color: 'bg-amber-500', label: 'Premium' },
  regular: { color: 'bg-blue-600', label: 'Regular' },
  early_bird: { color: 'bg-green-600', label: 'Early Bird' },
  student: { color: 'bg-cyan-600', label: 'Student' },
};

export const TicketCard = ({
  ticket,
  onDownload,
  onTransfer,
  onCancel,
  onShare,
  showActions = true,
  compact = false
}) => {
  const [showQR, setShowQR] = useState(false);
  
  const event = ticket.events || {};
  const status = ticket.is_checked_in ? 'used' : ticket.status;
  const statusInfo = statusConfig[status] || statusConfig.active;
  const typeInfo = ticketTypeConfig[ticket.ticket_type] || ticketTypeConfig.regular;
  const StatusIcon = statusInfo.icon;

  const qrData = JSON.stringify({
    ticketId: ticket.id,
    ticketCode: ticket.ticket_code,
    eventId: ticket.event_id,
  });

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className={cn("w-2 h-12 rounded-full", typeInfo.color)} />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{event.title}</p>
          <p className="text-sm text-muted-foreground">{ticket.ticket_code}</p>
        </div>
        <Badge className={statusInfo.color}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {status}
        </Badge>
        <Button variant="ghost" size="icon" onClick={() => setShowQR(true)}>
          <QrCode className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* Ticket Type Banner */}
        <div className={cn("h-2", typeInfo.color)} />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Ticket className="w-3 h-3" />
                {ticket.ticket_code}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusInfo.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {status}
              </Badge>
              <Badge variant="outline">{typeInfo.label}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Event Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          {/* Seat Info */}
          {ticket.seat_number && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Seat: {ticket.seat_number}</span>
            </div>
          )}

          {/* Check-in Info */}
          {ticket.is_checked_in && (
            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-lg text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">
                Checked in at {new Date(ticket.checked_in_at).toLocaleString()}
              </span>
            </div>
          )}

          {/* Actions */}
          {showActions && status === 'active' && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="default"
                className="flex-1"
                onClick={() => setShowQR(true)}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Show QR Code
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onDownload?.(ticket)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onShare?.(ticket)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTransfer?.(ticket)}>
                    <Send className="w-4 h-4 mr-2" />
                    Transfer Ticket
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onCancel?.(ticket)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Ticket
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Your Ticket</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="bg-white p-4 rounded-xl shadow-inner">
              <QRCodeSVG
                value={qrData}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <div className="text-center space-y-1">
              <p className="font-mono text-lg font-bold">{ticket.ticket_code}</p>
              <p className="text-sm text-muted-foreground">{event.title}</p>
              <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onDownload?.(ticket)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onShare?.(ticket)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TicketCard;