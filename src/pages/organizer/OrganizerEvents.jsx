import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Utensils } from 'lucide-react';
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

import {
  useOrganizerEvents,
  useDeleteEvent,
  useUpdateEventStatus,
} from '@/hooks/useEvents';
import { formatDate, getStatusColor } from '@/utils/helpers';
import { EVENT_CATEGORIES } from '@/utils/constants';
import EmptyState from '@/components/common/EmptyState';

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

  const filteredEvents =
    events?.filter((event) => {
      const matchesSearch = event.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || event.status === statusFilter;
      const matchesCategory =
        categoryFilter === 'all' || event.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    }) || [];

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!eventToDelete) return;
    deleteEventMutation.mutate(eventToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setEventToDelete(null);
      },
    });
  };

  const handleStatusChange = (eventId, status) => {
    updateStatusMutation.mutate({ eventId, status });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
        <CardContent className="p-4 flex flex-col gap-4 md:flex-row">
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
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {EVENT_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* List */}
      {isLoading && <EventsListSkeleton />}

      {!isLoading && filteredEvents.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description="Create your first event to get started."
          action={() => navigate('/organizer/events/create')}
          actionLabel="Create Event"
        />
      )}

      {!isLoading &&
        filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={() =>
              navigate(`/organizer/events/edit/${event.id}`)
            }
            onDelete={() => handleDeleteClick(event)}
            onViewPlanning={() =>
              navigate(`/organizer/events/${event.id}/planning`)
            }
            onStatusChange={handleStatusChange}
          />
        ))}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{eventToDelete?.title}"?
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
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EventCard({ event, onEdit, onDelete, onViewPlanning, onStatusChange }) {
  return (
    <Card>
      <CardContent className="p-4 flex justify-between">
        <div>
          <h3 className="text-lg font-semibold">{event.title}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(event.date)}
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">{event.category}</Badge>
            <Badge className={getStatusColor(event.status)}>
              {event.status}
            </Badge>
          </div>
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
                View
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
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
              <Link to={`/organizer/menus/${event.id}`}>
                <Utensils className="mr-2 h-4 w-4" />
                Manage Menu
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

            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}

function EventsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

export default OrganizerEvents;
