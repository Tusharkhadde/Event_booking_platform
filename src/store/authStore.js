// src/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,            // Supabase auth.user (or null)
      profile: null,         // profiles row (or null)
      session: null,         // Supabase session (or null)
      isAuthenticated: false,
      isLoading: false,      // we will NOT use loading gates for now
      isInitialized: false,  // Track init state

      login: (user, session, profile) =>
        set({
          user,
          session,
          profile,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        }),

      logout: () =>
        set({
          user: null,
          profile: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),

      // Role helper methods
      getRole: () => get().profile?.role || 'customer',
      isAdmin: () => get().profile?.role === 'admin',
      isOrganizer: () => get().profile?.role === 'organizer',
      isVendor: () => get().profile?.role === 'vendor',
    }),
    {
      name: 'eventsphere-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;