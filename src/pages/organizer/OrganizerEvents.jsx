import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  CheckSquare,
  QrCode,
  ClipboardList,
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
import { Skeleton } from '@/components/ui/skeleton';
import { useOrganizerEvents, useDeleteEvent, useUpdateEventStatus } from '@/hooks/useEvents';
import { formatDate, getStatusColor } from '@/utils/helpers';
import { EVENT_CATEGORIES } from '@/utils/constants';
import EmptyState from '@/components/common/EmptyState';
import { toast } from '@/hooks/useToast';

function OrganizerEvents() {
  const navigate = useNavigate();
  const { data: events, isLoading } = useOrganizerEvents();
  const deleteEventMutation = useDeleteEvent();
  const updateStatusMutation = useUpdateEventStatus();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Filter events
  const filteredEvents = events?.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      deleteEventMutation.mutate(eventToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setEventToDelete(null);
        },
      });
    }
  };

  const handleStatusChange = (eventId, newStatus) => {
    updateStatusMutation.mutate({ eventId, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-muted-foreground">
            Manage and organize your events
          </p>
        </div>
        <Button asChild>
          <Link to="/organizer/events/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
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

      {/* Events List */}
      {isLoading && <EventsListSkeleton />}

      {!isLoading && filteredEvents.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description={
            events?.length === 0
              ? "You haven't created any events yet. Create your first event!"
              : "No events match your filters. Try adjusting your search."
          }
          action={() => navigate('/organizer/events/create')}
          actionLabel="Create Event"
        />
      )}

      {!isLoading && filteredEvents.length > 0 && (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={() => navigate(`/organizer/events/edit/${event.id}`)}
              onDelete={() => handleDeleteClick(event)}
              onStatusChange={handleStatusChange}
              onViewPlanning={() => navigate(`/organizer/events/${event.id}/planning`)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{eventToDelete?.title}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EventCard({ event, onEdit, onDelete, onStatusChange, onViewPlanning }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Event Image */}
          <div className="aspect-video w-full overflow-hidden bg-muted md:aspect-square md:w-48">
            {event.banner_url && (
              <img
                src={event.banner_url}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            )}
            {!event.banner_url && (
              <div className="flex h-full items-center justify-center">
                <Calendar className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="flex flex-1 flex-col p-4">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex gap-2">
                <Badge variant="secondary" className="capitalize">
                  {event.category}
                </Badge>
                <Badge className={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
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
                      View Public Page
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Event
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onViewPlanning}>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Planning
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/organizer/guests/${event.id}`}>
                      <Users className="mr-2 h-4 w-4" />
                      Manage Guests
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/organizer/checklist/${event.id}`}>
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Checklist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/organizer/live-checkin/${event.id}`}>
                      <QrCode className="mr-2 h-4 w-4" />
                      Check-in
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {event.status === 'upcoming' && (
                    <DropdownMenuItem
                      onClick={() => onStatusChange(event.id, 'live')}
                    >
                      Set as Live
                    </DropdownMenuItem>
                  )}
                  {event.status === 'live' && (
                    <DropdownMenuItem
                      onClick={() => onStatusChange(event.id, 'completed')}
                    >
                      Mark as Completed
                    </DropdownMenuItem>
                  )}
                  {event.status !== 'cancelled' && (
                    <DropdownMenuItem
                      onClick={() => onStatusChange(event.id, 'cancelled')}
                      className="text-destructive"
                    >
                      Cancel Event
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="mb-1 text-lg font-semibold">{event.title}</h3>
            {event.description && (
              <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                {event.description}
              </p>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(event.date)}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-1">
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EventsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <Skeleton className="aspect-video w-full md:aspect-square md:w-48" />
              <div className="flex-1 p-4">
                <div className="mb-2 flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mb-4 h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default OrganizerEvents;