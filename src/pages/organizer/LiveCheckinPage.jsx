// src/pages/organizer/LiveCheckinPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTickets } from '@/hooks/useTickets';
import { QRScanner } from '@/components/tickets/QRScanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Users,
  CheckCircle,
  Clock,
  Search,
  RefreshCw,
  ScanLine,
  List,
  BarChart3,
  Download,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

const LiveCheckinPage = () => {
  const { eventId } = useParams();
  const { tickets, stats, loading, validateTicket, checkInTicket, refresh } = useTickets(eventId);
  const [view, setView] = useState('scanner'); // scanner, list, stats
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(refresh, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [refresh]);

  const handleScan = async (ticket, confirmCheckin = false) => {
    if (confirmCheckin && ticket) {
      const success = await checkInTicket(ticket.id);
      if (success) {
        setRecentCheckins(prev => [
          { ...ticket, checked_in_at: new Date().toISOString() },
          ...prev.slice(0, 9)
        ]);
        // Play success sound
        const audio = new Audio('/sounds/success.mp3');
        audio.play().catch(() => {});
      }
    }
  };

  const handleValidate = async (ticketCode) => {
    return await validateTicket(ticketCode);
  };

  const handleManualCheckin = async (ticket) => {
    const success = await checkInTicket(ticket.id);
    if (success) {
      toast.success(`Checked in: ${ticket.profiles?.full_name || ticket.ticket_code}`);
    }
  };

  // Filter tickets for list view
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticket_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'checked_in') return matchesSearch && ticket.is_checked_in;
    if (filterType === 'pending') return matchesSearch && !ticket.is_checked_in && ticket.status === 'active';
    
    return matchesSearch;
  });

  const checkinProgress = stats ? (stats.checkedIn / stats.total) * 100 : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ScanLine className="w-6 h-6" />
            Live Check-in
          </h1>
          <p className="text-muted-foreground">
            Scan tickets or manually check in attendees
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-3xl font-bold">{stats?.total || 0}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Checked In</p>
                <p className="text-3xl font-bold text-green-600">{stats?.checkedIn || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-amber-600">
                  {(stats?.active || 0) - (stats?.checkedIn || 0)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{checkinProgress.toFixed(1)}%</span>
              </div>
              <Progress value={checkinProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={view === 'scanner' ? 'default' : 'outline'}
          onClick={() => setView('scanner')}
        >
          <ScanLine className="w-4 h-4 mr-2" />
          Scanner
        </Button>
        <Button
          variant={view === 'list' ? 'default' : 'outline'}
          onClick={() => setView('list')}
        >
          <List className="w-4 h-4 mr-2" />
          List View
        </Button>
        <Button
          variant={view === 'stats' ? 'default' : 'outline'}
          onClick={() => setView('stats')}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Statistics
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {view === 'scanner' && (
            <QRScanner
              onScan={handleScan}
              onValidate={handleValidate}
              eventId={eventId}
            />
          )}

          {view === 'list' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search attendees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="checked_in">Checked In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Attendee</TableHead>
                        <TableHead>Ticket</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.map(ticket => (
                        <TableRow key={ticket.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {ticket.profiles?.full_name || 'Guest'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {ticket.profiles?.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {ticket.ticket_code}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{ticket.ticket_type}</Badge>
                          </TableCell>
                          <TableCell>
                            {ticket.is_checked_in ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Checked In
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {!ticket.is_checked_in && ticket.status === 'active' && (
                              <Button
                                size="sm"
                                onClick={() => handleManualCheckin(ticket)}
                              >
                                Check In
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {view === 'stats' && (
            <Card>
              <CardHeader>
                <CardTitle>Check-in Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {stats?.byType && Object.entries(stats.byType).map(([type, data]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium capitalize">{type}</span>
                      <span className="text-muted-foreground">
                        {data.checkedIn} / {data.total}
                      </span>
                    </div>
                    <Progress 
                      value={(data.checkedIn / data.total) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Check-ins Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {recentCheckins.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No recent check-ins
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentCheckins.map((checkin, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {checkin.profiles?.full_name || 'Guest'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(checkin.checked_in_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {checkin.ticket_type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveCheckinPage;