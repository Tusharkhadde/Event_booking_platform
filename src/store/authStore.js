import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      isInitialized: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setProfile: (profile) => {
        set({ profile });
      },

      setSession: (session) => {
        set({ session, isAuthenticated: !!session });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setInitialized: (isInitialized) => {
        set({ isInitialized, isLoading: false });
      },

      login: (user, session, profile) => {
        set({
          user,
          session,
          profile,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      },

      logout: () => {
        set({
          user: null,
          profile: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateProfile: (profileData) => {
        const currentProfile = get().profile;
        set({
          profile: { ...currentProfile, ...profileData },
        });
      },

      getRole: () => {
        const profile = get().profile;
        return profile?.role || 'customer';
      },

      isAdmin: () => {
        const profile = get().profile;
        return profile?.role === 'admin';
      },

      isOrganizer: () => {
        const profile = get().profile;
        const role = profile?.role;
        return role === 'organizer' || role === 'admin';
      },

      isVendor: () => {
        const profile = get().profile;
        return profile?.role === 'vendor';
      },
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