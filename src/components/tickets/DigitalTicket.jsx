// src/components/tickets/DigitalTicket.jsx
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GradientText } from '@/components/ui/gradient-text';
import {
  Calendar,
  Clock,
  MapPin,
  Download,
  Share2,
  Ticket,
  User,
  Sparkles,
  CheckCircle,
  X,
  Printer,
  Copy,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

// Ticket gradients by type
const ticketGradients = {
  vip: 'from-purple-600 via-pink-600 to-rose-600',
  premium: 'from-amber-500 via-orange-500 to-red-500',
  regular: 'from-blue-600 via-indigo-600 to-purple-600',
  student: 'from-emerald-500 via-teal-500 to-cyan-500',
  group: 'from-indigo-600 via-purple-600 to-pink-600',
};

export function DigitalTicket({ ticket, onClose }) {
  const ticketRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  const gradient = ticketGradients[ticket.ticket_type] || ticketGradients.regular;

  // QR code data
  const qrData = ticket.qr_data || JSON.stringify({
    ticketId: ticket.id,
    ticketCode: ticket.ticket_code,
    eventId: ticket.event_id,
    type: ticket.ticket_type,
    seat: ticket.seat?.id,
  });

  // Download as image
  const handleDownloadImage = async () => {
    if (!ticketRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `ticket-${ticket.ticket_code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('Ticket downloaded as image!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download ticket');
    } finally {
      setDownloading(false);
    }
  };

  // Download as PDF
  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`ticket-${ticket.ticket_code}.pdf`);

      toast.success('Ticket downloaded as PDF!');
    } catch (error) {
      console.error('PDF error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  // Print ticket
  const handlePrint = () => {
    window.print();
    toast.success('Opening print dialog...');
  };

  // Copy ticket code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(ticket.ticket_code);
    toast.success('Ticket code copied!');
  };

  // Share ticket
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket for ${ticket.event?.title}`,
          text: `My ticket: ${ticket.ticket_code} for ${ticket.event?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error
        if (error.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      handleCopyCode();
    }
  };

  // Email ticket
  const handleEmailTicket = () => {
    const subject = encodeURIComponent(`Ticket for ${ticket.event?.title}`);
    const body = encodeURIComponent(`
Here's my ticket for ${ticket.event?.title}

Ticket Code: ${ticket.ticket_code}
Event: ${ticket.event?.title}
Date: ${ticket.event?.date}
Time: ${ticket.event?.time}
Location: ${ticket.event?.location}
${ticket.seat ? `Seat: ${ticket.seat.id}` : ''}
    `);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-12 right-0 text-white/70 hover:text-white hover:bg-white/10 z-10"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Ticket Card */}
        <div
          ref={ticketRef}
          className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl"
        >
          {/* Header with gradient */}
          <div className={cn('relative p-6 bg-gradient-to-r', gradient)}>
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-white/5" />

            <div className="relative">
              {/* Badges */}
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-white/20 text-white border-0 backdrop-blur">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {ticket.ticket_name || ticket.ticket_type?.toUpperCase()}
                </Badge>
                
                {ticket.is_checked_in ? (
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    USED
                  </Badge>
                ) : (
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    CONFIRMED
                  </Badge>
                )}
              </div>

              {/* Event Title */}
              <h2 className="text-2xl font-bold text-white mb-3 pr-8">
                {ticket.event?.title}
              </h2>

              {/* Date & Time */}
              <div className="flex flex-wrap gap-4 text-white/90 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(ticket.event?.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {ticket.event?.time || 'TBA'}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket tear line */}
          <div className="relative h-8 bg-slate-900">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-black/80 rounded-r-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-black/80 rounded-l-full" />
            <div className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-slate-700" />
          </div>

          {/* Ticket Details */}
          <div className="p-6 space-y-5">
            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Venue
                </p>
                <p className="text-white font-medium">
                  {ticket.event?.location || 'Location TBA'}
                </p>
              </div>
            </div>

            {/* Seat Info */}
            {ticket.seat && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Ticket className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    Seat
                  </p>
                  <p className="text-white font-bold text-2xl">
                    {ticket.seat.id}
                  </p>
                  <p className="text-sm text-slate-400 capitalize">
                    {ticket.seat.type} Section • Row {ticket.seat.row}
                  </p>
                </div>
              </div>
            )}

            {/* QR Code */}
            <div className="flex flex-col items-center py-6">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <QRCodeSVG
                  value={qrData}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
              
              {/* Ticket Code */}
              <button
                onClick={handleCopyCode}
                className="mt-4 flex items-center gap-2 group"
              >
                <p className="font-mono text-lg font-bold text-white tracking-wider">
                  {ticket.ticket_code}
                </p>
                <Copy className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </button>
              <p className="text-xs text-slate-500 mt-1">
                Tap to copy • Scan at entrance
              </p>
            </div>

            {/* Booking Reference */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <div>
                <p className="text-xs text-slate-500">Booking Ref</p>
                <p className="font-mono text-sm text-white">
                  {ticket.booking_reference}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Price</p>
                <p className="font-bold text-emerald-400">
                  ${ticket.price?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            {/* Checked-in Status */}
            {ticket.is_checked_in && (
              <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-emerald-400">
                    Checked In
                  </p>
                  <p className="text-xs text-emerald-400/70">
                    {ticket.checked_in_at && new Date(ticket.checked_in_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 pb-6 space-y-3">
            {/* Primary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="bg-white text-slate-900 hover:bg-slate-100"
                onClick={handleDownloadImage}
                disabled={downloading}
              >
                <Download className="w-4 h-4 mr-2" />
                Save Image
              </Button>
              <Button
                variant="outline"
                className="border-slate-700 text-white hover:bg-slate-800"
                onClick={handleDownloadPDF}
                disabled={downloading}
              >
                <Download className="w-4 h-4 mr-2" />
                Save PDF
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="flex-1 border-slate-700 text-white hover:bg-slate-800"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="flex-1 border-slate-700 text-white hover:bg-slate-800"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="flex-1 border-slate-700 text-white hover:bg-slate-800"
                onClick={handleEmailTicket}
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="px-6 pb-6">
            <p className="text-center text-xs text-slate-500">
              Screenshot or print this ticket for entry
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default DigitalTicket;