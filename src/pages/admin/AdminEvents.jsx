import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Search,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate, getStatusColor } from '@/utils/helpers';
import { EVENT_CATEGORIES } from '@/utils/constants';
import { toast } from '@/hooks/useToast';

function AdminEvents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  // Mock data - In real app, fetch from Supabase
  const events = [
    {
      id: '1',
      title: 'Summer Music Festival 2024',
      organizer: 'John Doe',
      category: 'concert',
      status: 'upcoming',
      date: '2024-07-15',
      location: 'Central Park, NYC',
      ticketsSold: 450,
      revenue: 22500,
    },
    {
      id: '2',
      title: 'Tech Conference 2024',
      organizer: 'Jane Smith',
      category: 'conference',
      status: 'live',
      date: '2024-06-20',
      location: 'Convention Center, SF',
      ticketsSold: 320,
      revenue: 48000,
    },
    {
      id: '3',
      title: 'Wedding Celebration',
      organizer: 'Bob Wilson',
      category: 'wedding',
      status: 'completed',
      date: '2024-06-10',
      location: 'Grand Hotel',
      ticketsSold: 150,
      revenue: 7500,
    },
    {
      id: '4',
      title: 'Birthday Bash',
      organizer: 'Alice Brown',
      category: 'party',
      status: 'cancelled',
      date: '2024-05-25',
      location: 'City Hall',
      ticketsSold: 0,
      revenue: 0,
    },
  ];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalRevenue = events.reduce((sum, e) => sum + e.revenue, 0);
  const totalTickets = events.reduce((sum, e) => sum + e.ticketsSold, 0);

  const handleAction = (event, action) => {
    setSelectedEvent(event);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    toast({
      title: 'Action Completed',
      description: `Event ${actionType} successfully.`,
    });
    setActionDialogOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Event Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage all events on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{events.length}</p>
            <p className="text-sm text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">
              {events.filter((e) => e.status === 'upcoming').length}
            </p>
            <p className="text-sm text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{totalTickets.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Tickets Sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EVENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Events ({filteredEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      by {event.organizer} • {event.location}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {event.category}
                    </Badge>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="hidden text-right md:block">
                    <p className="text-sm font-medium">${event.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.ticketsSold} tickets
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/events/${event.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Event
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {event.status !== 'completed' && event.status !== 'cancelled' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleAction(event, 'approved')}
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleAction(event, 'cancelled')}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Event
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionType} "{selectedEvent?.title}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'cancelled' ? 'destructive' : 'default'}
              onClick={confirmAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminEvents;