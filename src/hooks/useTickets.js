// src/hooks/useTickets.js
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import * as ticketService from "@/services/ticketService";
import supabase from "@/services/supabaseClient";
import { toast } from "sonner";

/* ---------------- CREATE ---------------- */
export const useCreateTicket = () => {
  const { user } = useAuth();

  const createTicket = async (data) => {
    try {
      const result = await ticketService.createTicket({
        ...data,
        user_id: user.id,
      });
      toast.success("Ticket created successfully");
      return result;
    } catch (err) {
      toast.error(err.message || "Failed to create ticket");
      throw err;
    }
  };

  return { createTicket };
};

/* ---------------- UPDATE ---------------- */
export const useUpdateTicket = () => {
  const updateTicket = async (ticketId, updates) => {
    try {
      await ticketService.updateTicket(ticketId, updates);
      toast.success("Ticket updated");
      return true;
    } catch (err) {
      toast.error(err.message || "Failed to update ticket");
      return false;
    }
  };

  return { updateTicket };
};

/* ---------------- DELETE ---------------- */
export const useDeleteTicket = () => {
  const deleteTicket = async (ticketId) => {
    try {
      await ticketService.deleteTicket(ticketId);
      toast.success("Ticket deleted");
      return true;
    } catch (err) {
      toast.error(err.message || "Failed to delete ticket");
      return false;
    }
  };

  return { deleteTicket };
};

/* ---------------- READ (MAIN) ---------------- */
export const useTickets = (eventId = null) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchUserTickets = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await ticketService.getUserTickets(user.id);
      setTickets(data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchEventTickets = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      const [ticketsData, statsData] = await Promise.all([
        ticketService.getEventTickets(eventId),
        ticketService.getTicketStats(eventId),
      ]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load event tickets");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    eventId ? fetchEventTickets() : fetchUserTickets();
  }, [eventId, fetchUserTickets, fetchEventTickets]);

  return {
    tickets,
    loading,
    error,
    stats,
    refresh: eventId ? fetchEventTickets : fetchUserTickets,
  };
};
