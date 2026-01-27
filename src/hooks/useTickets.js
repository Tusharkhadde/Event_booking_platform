// src/hooks/useTickets.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ticketService from '@/services/ticketService';
import { toast } from '@/hooks/useToast';

export function useTickets(eventId) {
  return useQuery({
    queryKey: ['tickets', eventId],
    queryFn: () => ticketService.getTicketsByEvent(eventId),
    enabled: !!eventId,
  });
}

export function useCreateTicket(eventId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketData) => ticketService.createTicket(ticketData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', eventId] });
      toast({
        title: 'Ticket created',
        description: 'New ticket type has been added.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create ticket',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTicket(eventId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, updates }) => ticketService.updateTicket(ticketId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', eventId] });
      toast({
        title: 'Ticket updated',
        description: 'Ticket type has been updated.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update ticket',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteTicket(eventId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId) => ticketService.deleteTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', eventId] });
      toast({
        title: 'Ticket deleted',
        description: 'Ticket type has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete ticket',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}