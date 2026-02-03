// src/pages/user/TicketsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import { DigitalTicket } from '@/components/tickets/DigitalTicket';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { GradientText } from '@/components/ui/gradient-text';
import { ShimmerButton } from '@/components/ui/shimmer-button';

// Icons
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Search,
  QrCode,
  Download,
  Share2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Grid3X3,
  List,
  Eye,
  Printer,
  Sparkles,
} from 'lucide-react';

// Services
import { getUserTickets } from '@/services/bookingService';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

// Mock tickets for demo
const MOCK_TICKETS = [
  {
    id: '1',
    ticket_code: 'TKT-ABC123-XYZ',
    booking_reference: 'EVT-ABC123-XYZ',
    ticket_type: 'vip',
    ticket_name: 'VIP Pass',
    price: 199.99,
    seat: { id: 'A1', type: 'vip', row: 'A', number: 1 },
    status: 'active',
    is_checked_in: false,
    event: {
      title: 'Tech Conference 2024',
      date: '2024-12-15',
      time: '10:00 AM',
      location: 'Convention Center, New York',
      image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    },
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    ticket_code: 'TKT-DEF456-ABC',
    booking_reference: 'EVT-ABC123-XYZ',
    ticket_type: 'vip',
    ticket_name: 'VIP Pass',
    price: 199.99,
    seat: { id: 'A2', type: 'vip', row: 'A', number: 2 },
    status: 'active',
    is_checked_in: false,
    event: {
      title: 'Tech Conference 2024',
      date: '2024-12-15',
      time: '10:00 AM',
      location: 'Convention Center, New York',
      image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    },
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    ticket_code: 'TKT-GHI789-DEF',
    booking_reference: 'EVT-DEF456-ABC',
    ticket_type: 'premium',
    ticket_name: 'Premium',
    price: 149.99,
    seat: { id: 'B5', type: 'premium', row: 'B', number: 5 },
    status: 'active',
    is_checked_in: false,
    event: {
      title: 'Music Festival 2024',
      date: '2024-12-20',
      time: '6:00 PM',
      location: 'Central Park, New York',
      image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    },
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '4',
    ticket_code: 'TKT-JKL012-GHI',
    booking_reference: 'EVT-GHI789-DEF',
    ticket_type: 'regular',
    ticket_name: 'Standard',
    price: 25.00,
    seat: null,
    status: 'used',
    is_checked_in: true,
    checked_in_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    event: {
      title: 'Art Exhibition',
      date: '2024-11-10',
      time: '2:00 PM',
      location: 'Modern Art Museum',
      image_url: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=400',
    },
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

// Ticket type styles
const ticketTypeStyles = {
  vip: {
    gradient: 'from-purple-600 to-pink-600',
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  premium: {
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  regular: {
    gradient: 'from-blue-600 to-cyan-600',
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  student: {
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
};

const TicketsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Load tickets
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getUserTickets('user_123');
      
      if (data.length === 0) {
        setTickets(MOCK_TICKETS);
      } else {
        setTickets(data);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTickets(MOCK_TICKETS);
    } finally {
      setLoading(false);
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticket_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.event?.title?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'upcoming') {
      return matchesSearch && 
        ticket.status === 'active' &&
        new Date(ticket.event?.date) >= new Date();
    }
    if (activeTab === 'used') {
      return matchesSearch && ticket.is_checked_in;
    }
    if (activeTab === 'expired') {
      return matchesSearch && 
        (ticket.status === 'cancelled' || 
         (ticket.status === 'active' && new Date(ticket.event?.date) < new Date()));
    }

    return matchesSearch;
  });

  // Stats
  const stats = {
    total: tickets.length,
    upcoming: tickets.filter(t => 
      t.status === 'active' && 
      new Date(t.event?.date) >= new Date()
    ).length,
    used: tickets.filter(t => t.is_checked_in).length,
  };

  // Handle download all
  const handleDownloadAll = () => {
    toast.success('Downloading all tickets...');
    // TODO: Implement batch download
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 py-8">
        <div className="container max-w-6xl mx-auto px-4">
          <Skeleton className="h-10 w-48 bg-slate-800 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Ticket className="w-8 h-8 text-purple-400" />
              My Tickets
            </h1>
            <p className="text-slate-400 mt-1">
              {stats.upcoming} upcoming ticket{stats.upcoming !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-slate-700 text-white hover:bg-slate-800"
              onClick={handleDownloadAll}
            >
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-slate-700 hover:bg-slate-800"
              onClick={loadTickets}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search by ticket code or event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700 text-white"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-900/50 border border-slate-700 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8',
                viewMode === 'grid' && 'bg-purple-600 text-white'
              )}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8',
                viewMode === 'list' && 'bg-purple-600 text-white'
              )}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-slate-900/50 border border-slate-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
              All ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-purple-600">
              Upcoming ({stats.upcoming})
            </TabsTrigger>
            <TabsTrigger value="used" className="data-[state=active]:bg-purple-600">
              Used ({stats.used})
            </TabsTrigger>
            <TabsTrigger value="expired" className="data-[state=active]:bg-purple-600">
              Expired
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tickets Grid/List */}
        <AnimatePresence mode="popLayout">
          {filteredTickets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Ticket className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No tickets found
              </h3>
              <p className="text-slate-400 mb-6">
                {searchQuery
                  ? 'Try adjusting your search'
                  : "You don't have any tickets yet"}
              </p>
              <ShimmerButton onClick={() => navigate('/events')}>
                Browse Events
              </ShimmerButton>
            </motion.div>
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            )}>
              {filteredTickets.map((ticket, index) => {
                const typeStyle = ticketTypeStyles[ticket.ticket_type] || ticketTypeStyles.regular;
                const isUpcoming = new Date(ticket.event?.date) >= new Date();
                const isUsed = ticket.is_checked_in;
                const isExpired = !isUpcoming && !isUsed;

                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card 
                      className={cn(
                        'bg-slate-900/50 border-slate-800 overflow-hidden cursor-pointer',
                        'hover:border-slate-700 transition-all duration-300',
                        'hover:shadow-lg hover:shadow-purple-500/10',
                        (isUsed || isExpired) && 'opacity-60'
                      )}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      {/* Gradient top bar */}
                      <div className={cn(
                        'h-1.5 bg-gradient-to-r',
                        typeStyle.gradient
                      )} />

                      <CardContent className={cn(
                        'p-4',
                        viewMode === 'list' && 'flex items-center gap-4'
                      )}>
                        {/* Event Image (Grid view) */}
                        {viewMode === 'grid' && (
                          <div className="relative h-32 -mx-4 -mt-4 mb-4">
                            {ticket.event?.image_url ? (
                              <img
                                src={ticket.event.image_url}
                                alt={ticket.event.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className={cn(
                                'w-full h-full bg-gradient-to-br flex items-center justify-center',
                                typeStyle.gradient
                              )}>
                                <Ticket className="w-12 h-12 text-white/30" />
                              </div>
                            )}
                            
                            {/* Status overlay */}
                            {isUsed && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Checked In
                                </Badge>
                              </div>
                            )}
                            {isExpired && !isUsed && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Expired
                                </Badge>
                              </div>
                            )}

                            {/* Type badge */}
                            <Badge className={cn(
                              'absolute top-3 right-3',
                              typeStyle.bg,
                              typeStyle.text,
                              typeStyle.border
                            )}>
                              {ticket.ticket_name}
                            </Badge>
                          </div>
                        )}

                        {/* List view image */}
                        {viewMode === 'list' && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            {ticket.event?.image_url ? (
                              <img
                                src={ticket.event.image_url}
                                alt={ticket.event.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className={cn(
                                'w-full h-full bg-gradient-to-br flex items-center justify-center',
                                typeStyle.gradient
                              )}>
                                <Ticket className="w-8 h-8 text-white/30" />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Content */}
                        <div className={cn(
                          'flex-1',
                          viewMode === 'list' && 'flex items-center justify-between'
                        )}>
                          <div>
                            {/* Ticket code */}
                            <p className="font-mono text-xs text-slate-500 mb-1">
                              {ticket.ticket_code}
                            </p>
                            
                            {/* Event title */}
                            <h3 className="font-semibold text-white mb-2 line-clamp-1">
                              {ticket.event?.title}
                            </h3>

                            {/* Event details */}
                            <div className={cn(
                              'text-xs text-slate-400 space-y-1',
                              viewMode === 'list' && 'flex gap-4 space-y-0'
                            )}>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(ticket.event?.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {ticket.event?.time}
                              </span>
                              {ticket.seat && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  Seat {ticket.seat.id}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className={cn(
                            'flex items-center gap-2',
                            viewMode === 'grid' ? 'mt-4' : 'ml-4'
                          )}>
                            {viewMode === 'list' && (
                              <Badge className={cn(
                                typeStyle.bg,
                                typeStyle.text,
                                typeStyle.border
                              )}>
                                {ticket.ticket_name}
                              </Badge>
                            )}
                            
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTicket(ticket);
                              }}
                            >
                              <QrCode className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Digital Ticket Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <DigitalTicket
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TicketsPage;