// src/hooks/useCalendar.js
import { useQuery } from '@tanstack/react-query';
import eventService from '@/services/eventService';
import taskService from '@/services/taskService';
import useAuthStore from '@/store/authStore';

export function useOrganizerCalendar() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['organizer-calendar', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return { events: [], tasks: [] };
      }

      // Organizer events
      const events = await eventService.getOrganizerEvents(user.id);
      // Organizer tasks (for those events)
      const tasks = await taskService.getOrganizerTasks(user.id);

      return { events, tasks };
    },
    enabled: !!user?.id,
  });
}