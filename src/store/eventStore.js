import { create } from 'zustand';

const useEventStore = create((set, get) => ({
  events: [],
  currentEvent: null,
  filters: {
    category: '',
    status: '',
    search: '',
    dateFrom: null,
    dateTo: null,
  },

  setEvents: (events) => set({ events }),

  setCurrentEvent: (event) => set({ currentEvent: event }),

  addEvent: (event) => set((state) => ({
    events: [event, ...state.events],
  })),

  updateEvent: (eventId, updates) => set((state) => ({
    events: state.events.map((event) => {
      if (event.id === eventId) {
        return { ...event, ...updates };
      }
      return event;
    }),
    currentEvent: state.currentEvent?.id === eventId 
      ? { ...state.currentEvent, ...updates }
      : state.currentEvent,
  })),

  removeEvent: (eventId) => set((state) => ({
    events: state.events.filter((event) => event.id !== eventId),
    currentEvent: state.currentEvent?.id === eventId ? null : state.currentEvent,
  })),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),

  clearFilters: () => set({
    filters: {
      category: '',
      status: '',
      search: '',
      dateFrom: null,
      dateTo: null,
    },
  }),

  getFilteredEvents: () => {
    const state = get();
    let filtered = [...state.events];

    if (state.filters.category) {
      filtered = filtered.filter((e) => e.category === state.filters.category);
    }

    if (state.filters.status) {
      filtered = filtered.filter((e) => e.status === state.filters.status);
    }

    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      filtered = filtered.filter((e) => 
        e.title.toLowerCase().includes(searchLower) ||
        e.description?.toLowerCase().includes(searchLower) ||
        e.location?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  },
}));

export default useEventStore;