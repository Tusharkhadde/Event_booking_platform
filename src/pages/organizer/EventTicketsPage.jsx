// src/pages/organizer/EventTicketsPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useEvent } from '@/hooks/useEvents';
import {
  useTickets,
  useCreateTicket,
  useUpdateTicket,
  useDeleteTicket,
} from '@/hooks/useTickets';
import {
  ArrowLeft,
  Ticket,
  DollarSign,
  Users,
  Trash2,
  Edit,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/common/EmptyState';
import { formatCurrency, formatDate } from '@/utils/helpers';

function EventTicketsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: tickets, isLoading: ticketsLoading } = useTickets(eventId);

  const createTicketMutation = useCreateTicket(eventId);
  const updateTicketMutation = useUpdateTicket(eventId);
  const deleteTicketMutation = useDeleteTicket(eventId);

  const [newTicket, setNewTicket] = useState({
    type: 'Standard',
    description: '',
    price: '',
    total_qty: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [editingFields, setEditingFields] = useState({
    type: '',
    description: '',
    price: '',
    total_qty: '',
  });

  const loading = eventLoading || ticketsLoading;

  const handleNewChange = (field, value) => {
    setNewTicket({ ...newTicket, [field]: value });
  };

  const handleCreateTicket = () => {
    if (!eventId) return;
    if (!newTicket.type || !newTicket.price || !newTicket.total_qty) return;

    const price = Number(newTicket.price || 0);
    const totalQty = Number(newTicket.total_qty || 0);

    createTicketMutation.mutate({
      event_id: eventId,
      type: newTicket.type,
      description: newTicket.description || null,
      price,
      total_qty: totalQty,
      available_qty: totalQty,
    });

    setNewTicket({
      type: 'Standard',
      description: '',
      price: '',
      total_qty: '',
    });
  };

  const startEdit = (ticket) => {
    setEditingId(ticket.id);
    setEditingFields({
      type: ticket.type || '',
      description: ticket.description || '',
      price: ticket.price?.toString() || '',
      total_qty: ticket.total_qty?.toString() || '',
    });
  };

  const handleEditChange = (field, value) => {
    setEditingFields({ ...editingFields, [field]: value });
  };

  const handleSaveEdit = (ticket) => {
    const price = Number(editingFields.price || 0);
    const totalQty = Number(editingFields.total_qty || 0);
    const soldQty = (ticket.total_qty || 0) - (ticket.available_qty || 0);
    let newAvailable = totalQty - soldQty;
    if (newAvailable < 0) {
      newAvailable = 0;
    }

    updateTicketMutation.mutate({
      ticketId: ticket.id,
      updates: {
        type: editingFields.type,
        description: editingFields.description || null,
        price,
        total_qty: totalQty,
        available_qty: newAvailable,
      },
    });

    setEditingId(null);
  };

  const handleDeleteTicket = (ticketId) => {
    deleteTicketMutation.mutate(ticketId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Ticket Types
          </h1>
          {event && (
            <p className="text-muted-foreground text-sm">
              {event.title} • {formatDate(event.date)}
            </p>
          )}
        </div>
      </div>

      {loading && <TicketsSkeleton />}

      {!loading && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Create Ticket */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Ticket Type</CardTitle>
              <CardDescription>
                Define a new ticket tier for this event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Ticket Name</Label>
                <Input
                  value={newTicket.type}
                  onChange={(e) => handleNewChange('type', e.target.value)}
                  placeholder="e.g., Standard, VIP, VVIP"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input
                  value={newTicket.description}
                  onChange={(e) =>
                    handleNewChange('description', e.target.value)
                  }
                  placeholder="Optional description"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    className="pl-7"
                    type="number"
                    step="0.01"
                    value={newTicket.price}
                    onChange={(e) => handleNewChange('price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Total Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={newTicket.total_qty}
                  onChange={(e) => handleNewChange('total_qty', e.target.value)}
                  placeholder="e.g., 100"
                />
              </div>
              <Button
                className="mt-2"
                onClick={handleCreateTicket}
                disabled={createTicketMutation.isPending}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Ticket
              </Button>
            </CardContent>
          </Card>

          {/* List Tickets */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Existing Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!tickets || tickets.length === 0 ? (
                <EmptyState
                  icon={Ticket}
                  title="No tickets yet"
                  description="Add ticket types so attendees can book this event."
                />
              ) : (
                tickets.map((ticket) => (
                  <TicketRow
                    key={ticket.id}
                    ticket={ticket}
                    editingId={editingId}
                    editingFields={editingFields}
                    onStartEdit={() => startEdit(ticket)}
                    onChange={handleEditChange}
                    onSave={() => handleSaveEdit(ticket)}
                    onDelete={() => handleDeleteTicket(ticket.id)}
                    isUpdating={updateTicketMutation.isPending}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function TicketRow({
  ticket,
  editingId,
  editingFields,
  onStartEdit,
  onChange,
  onSave,
  onDelete,
  isUpdating,
}) {
  const isEditing = editingId === ticket.id;
  const sold = (ticket.total_qty || 0) - (ticket.available_qty || 0);

  if (isEditing) {
    return (
      <div className="p-3 rounded-lg border bg-muted/40 space-y-2">
        <div className="grid gap-2 md:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs">Ticket Name</Label>
            <Input
              value={editingFields.type}
              onChange={(e) => onChange('type', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Input
              value={editingFields.description}
              onChange={(e) => onChange('description', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Price</Label>
            <Input
              type="number"
              step="0.01"
              value={editingFields.price}
              onChange={(e) => onChange('price', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Total Qty</Label>
            <Input
              type="number"
              min="0"
              value={editingFields.total_qty}
              onChange={(e) => onChange('total_qty', e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isUpdating}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-2">
      <div>
        <p className="font-medium text-sm">{ticket.type}</p>
        {ticket.description && (
          <p className="text-xs text-muted-foreground">{ticket.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {formatCurrency(ticket.price)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Total: {ticket.total_qty}
          </span>
          <span className="flex items-center gap-1">
            <Badge variant="secondary" className="text-[10px]">
              Sold: {sold}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              Available: {ticket.available_qty}
            </Badge>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end md:self-center">
        <Button
          size="sm"
          variant="outline"
          onClick={onStartEdit}
        >
          <Edit className="mr-1 h-4 w-4" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}

function TicketsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full lg:col-span-2" />
    </div>
  );
}

export default EventTicketsPage;