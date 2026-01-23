import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Stores
import useThemeStore from '@/store/themeStore';
import useAuthStore from '@/store/authStore';

// Services
import authService from '@/services/authService';
import profileService from '@/services/profileService';

// Layouts
import PublicLayout from '@/layouts/PublicLayout';
import UserLayout from '@/layouts/UserLayout';
import OrganizerLayout from '@/layouts/OrganizerLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Common Components
import ProtectedRoute from '@/components/common/ProtectedRoute';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Toaster } from '@/components/ui/sonner';

// Public Pages
import HomePage from '@/pages/public/HomePage';
import EventsPage from '@/pages/public/EventsPage';
import EventDetailsPage from '@/pages/public/EventDetailsPage';
import LoginPage from '@/pages/public/LoginPage';
import RegisterPage from '@/pages/public/RegisterPage';
import VenuesPage from '@/pages/public/VenuesPage';
import VenueDetailsPage from '@/pages/public/VenueDetailsPage';

// User Pages
import ProfilePage from '@/pages/user/ProfilePage';
import MyBookingsPage from '@/pages/user/MyBookingsPage';
import TicketsPage from '@/pages/user/TicketsPage';
import NotificationsPage from '@/pages/user/NotificationsPage';

// Organizer Pages
import OrganizerDashboard from '@/pages/organizer/OrganizerDashboard';
import OrganizerEvents from '@/pages/organizer/OrganizerEvents';
import CreateEventPage from '@/pages/organizer/CreateEventPage';
import EditEventPage from '@/pages/organizer/EditEventPage';
import EventPlanningPage from '@/pages/organizer/EventPlanningPage';
import CreateVenuePage from '@/pages/organizer/CreateVenuePage';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminEvents from '@/pages/admin/AdminEvents';

function App() {
  const { initializeTheme } = useThemeStore();
  const { 
    login, 
    logout, 
    setLoading, 
    setInitialized, 
    isLoading, 
    isInitialized 
  } = useAuthStore();

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Initialize auth on mount
  useEffect(() => {
    let isMounted = true;
    let initTimeout;

    const initAuth = async () => {
      try {
        setLoading(true);
        const session = await authService.getSession();

        if (!isMounted) return;

        if (session && session.user) {
          // Don't wait for profile - fetch it in background
          profileService.getProfile(session.user.id)
            .then(userProfile => {
              if (isMounted) {
                login(session.user, session, userProfile);
              }
            })
            .catch(profileError => {
              console.error('Profile fetch error:', profileError);
              if (isMounted) {
                login(session.user, session, null);
              }
            });
        } else {
          if (isMounted) {
            setInitialized(true);
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
        if (isMounted) {
          setInitialized(true);
        }
      }
    };

    // Safety timeout - force app to initialize after 3 seconds
    initTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn('Forcing app initialization due to timeout');
        setInitialized(true);
      }
    }, 3000);

    initAuth();

    // Auth state change listener
    const { data: { subscription } } = authService.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);

        if (!isMounted) return;

        if (event === 'SIGNED_IN' && session) {
          // Don't wait for profile - fetch in background
          login(session.user, session, null);
          
          // Fetch profile in background
          profileService.getProfile(session.user.id)
            .then(userProfile => {
              if (isMounted) {
                useAuthStore.getState().setProfile(userProfile);
              }
            })
            .catch(error => {
              console.error('Profile fetch on sign in:', error);
            });
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            logout();
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Just update the session, don't refetch profile
          if (isMounted) {
            useAuthStore.getState().setSession(session);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      subscription?.unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" text="Loading EventSphere..." />
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/venues/:id" element={<VenueDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ==================== USER ROUTES ==================== */}
        <Route
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* ==================== ORGANIZER ROUTES ==================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <OrganizerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/events" element={<OrganizerEvents />} />
          <Route path="/organizer/events/create" element={<CreateEventPage />} />
          <Route path="/organizer/events/edit/:id" element={<EditEventPage />} />
          <Route path="/organizer/events/:id/planning" element={<EventPlanningPage />} />
          <Route path="/organizer/venues/create" element={<CreateVenuePage />} />
        </Route>

        {/* ==================== ADMIN ROUTES ==================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/events" element={<AdminEvents />} />
        </Route>

        {/* ==================== FALLBACK ==================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast Notifications */}
      <Toaster />
    </>
  );
}
export default App;
