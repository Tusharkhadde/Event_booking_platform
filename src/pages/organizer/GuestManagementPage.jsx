import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useEvent } from '@/hooks/useEvents';
import { useGuests, useGuestStats, useAddGuest, useUpdateGuest, useDeleteGuest } from '@/hooks/useGuests';
import { guestSchema } from '@/validations/guestSchema';
import EmptyState from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

function GuestManagementPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);

  const { data: event } = useEvent(eventId);
  const { data: guests, isLoading: guestsLoading } = useGuests(eventId);
  const { data: stats, isLoading: statsLoading } = useGuestStats(eventId);
  
  const addGuestMutation = useAddGuest();
  const updateGuestMutation = useUpdateGuest();
  const deleteGuestMutation = useDeleteGuest();

  // Filter guests
  const filteredGuests = guests?.filter((guest) => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || guest.rsvp_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (guestId) => {
    if (confirm('Are you sure you want to remove this guest?')) {
      deleteGuestMutation.mutate({ guestId, eventId });
    }
  };

  const handleEdit = (guest) => {
    setEditingGuest(guest);
    setIsAddDialogOpen(true);
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setEditingGuest(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/organizer/events`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Guest List</h1>
          <p className="text-muted-foreground">Manage invitations for {event?.title}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard 
          title="Total Invited" 
          value={stats?.total_invites || 0} 
          icon={Users} 
          loading={statsLoading} 
        />
        <StatsCard 
          title="Confirmed" 
          value={stats?.confirmed || 0} 
          icon={CheckCircle} 
          color="text-green-600 bg-green-100 dark:bg-green-900" 
          loading={statsLoading} 
        />
        <StatsCard 
          title="Pending" 
          value={stats?.pending || 0} 
          icon={Clock} 
          color="text-yellow-600 bg-yellow-100 dark:bg-yellow-900" 
          loading={statsLoading} 
        />
        <StatsCard 
          title="Declined" 
          value={stats?.declined || 0} 
          icon={XCircle} 
          color="text-red-600 bg-red-100 dark:bg-red-900" 
          loading={statsLoading} 
        />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search guests..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Add Guest
        </Button>
      </div>

      {/* Guest List */}
      {guestsLoading && <GuestListSkeleton />}

      {!guestsLoading && filteredGuests?.length === 0 && (
        <EmptyState 
          icon={Users}
          title="No guests found"
          description={guests?.length === 0 ? "Start building your guest list." : "No guests match your filters."}
          action={guests?.length === 0 ? () => setIsAddDialogOpen(true) : null}
          actionLabel="Add First Guest"
        />
      )}

      {!guestsLoading && filteredGuests?.length > 0 && (
        <div className="grid gap-4">
          {filteredGuests.map((guest) => (
            <GuestItem 
              key={guest.id} 
              guest={guest} 
              onEdit={() => handleEdit(guest)}
              onDelete={() => handleDelete(guest.id)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <GuestDialog 
        open={isAddDialogOpen} 
        onOpenChange={closeDialog} 
        eventId={eventId}
        guestToEdit={editingGuest}
        addMutation={addGuestMutation}
        updateMutation={updateGuestMutation}
      />
    </div>
  );
}

function GuestItem({ guest, onEdit, onDelete }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>;
      case 'declined': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Declined</Badge>;
      default: return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {guest.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{guest.name}</p>
              <Badge variant="secondary" className="text-xs">{guest.category}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {guest.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {guest.email}</span>}
              {guest.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {guest.phone}</span>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium">Party Size: {1 + (guest.plus_ones || 0)}</p>
            {guest.table_number && <p className="text-xs text-muted-foreground">Table: {guest.table_number}</p>}
          </div>
          
          <div className="flex items-center gap-3">
            {getStatusBadge(guest.rsvp_status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Remove Guest
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GuestDialog({ open, onOpenChange, eventId, guestToEdit, addMutation, updateMutation }) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: '', email: '', phone: '', category: 'friends', rsvp_status: 'pending', plus_ones: 0, table_number: ''
    }
  });

  // Reset form when dialog opens/closes or guestToEdit changes
  if (open && guestToEdit && guestToEdit.id !== (window.currentGuestId)) {
    window.currentGuestId = guestToEdit.id; // Hacky way to prevent infinite reset loop
    reset({
      name: guestToEdit.name,
      email: guestToEdit.email || '',
      phone: guestToEdit.phone || '',
      category: guestToEdit.category,
      rsvp_status: guestToEdit.rsvp_status,
      plus_ones: guestToEdit.plus_ones || 0,
      table_number: guestToEdit.table_number || ''
    });
  } else if (open && !guestToEdit && window.currentGuestId !== null) {
    window.currentGuestId = null;
    reset({
      name: '', email: '', phone: '', category: 'friends', rsvp_status: 'pending', plus_ones: 0, table_number: ''
    });
  }

  const onSubmit = (data) => {
    if (guestToEdit) {
      updateMutation.mutate({ guestId: guestToEdit.id, updates: data }, { onSuccess: onOpenChange });
    } else {
      addMutation.mutate({ ...data, event_id: eventId }, { onSuccess: () => {
        reset();
        onOpenChange();
      }});
    }
  };

  const isLoading = addMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{guestToEdit ? 'Edit Guest' : 'Add Guest'}</DialogTitle>
          <DialogDescription>
            {guestToEdit ? 'Update guest details.' : 'Add a new guest to your list.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input {...register('name')} placeholder="Guest Name" />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input {...register('email')} placeholder="Email" />
              {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input {...register('phone')} placeholder="Phone" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-2">
              <Label>Category</Label>
              <Select onValueChange={(val) => setValue('category', val)} defaultValue={guestToEdit?.category || 'friends'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="colleague">Colleague</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>RSVP Status</Label>
              <Select onValueChange={(val) => setValue('rsvp_status', val)} defaultValue={guestToEdit?.rsvp_status || 'pending'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Plus Ones</Label>
              <Input type="number" {...register('plus_ones')} placeholder="0" min="0" />
            </div>
            <div className="grid gap-2">
              <Label>Table No.</Label>
              <Input {...register('table_number')} placeholder="Optional" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Guest'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StatsCard({ title, value, icon: Icon, color = "bg-primary/10 text-primary", loading }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          {loading ? <Skeleton className="h-8 w-12 mt-1" /> : <p className="text-3xl font-bold">{value}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

function GuestListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default GuestManagementPage;