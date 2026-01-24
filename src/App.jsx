// src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Store
import useThemeStore from "@/store/themeStore";

// Layouts
import PublicLayout from "@/layouts/PublicLayout";
import UserLayout from "@/layouts/UserLayout";
import OrganizerLayout from "@/layouts/OrganizerLayout";
import AdminLayout from "@/layouts/AdminLayout";
import VendorLayout from "@/layouts/VendorLayout";

// Common Components
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";

// Public Pages
import HomePage from "@/pages/public/HomePage";
import EventsPage from "@/pages/public/EventsPage";
import EventDetailsPage from "@/pages/public/EventDetailsPage";
import LoginPage from "@/pages/public/LoginPage";
import RegisterPage from "@/pages/public/RegisterPage";
import VenuesPage from "@/pages/public/VenuesPage";
import VenueDetailsPage from "@/pages/public/VenueDetailsPage";

// User/Customer Pages
import CustomerDashboard from "@/pages/user/CustomerDashboard";
import ProfilePage from "@/pages/user/ProfilePage";
import MyBookingsPage from "@/pages/user/MyBookingsPage";
import TicketsPage from "@/pages/user/TicketsPage";
import NotificationsPage from "@/pages/user/NotificationsPage";
import SavedEventsPage from "@/pages/user/SavedEventsPage";
import BookEventPage from "@/pages/user/BookEventPage";

// Organizer Pages
import OrganizerDashboard from "@/pages/organizer/OrganizerDashboard";
import OrganizerEvents from "@/pages/organizer/OrganizerEvents";
import CreateEventPage from "@/pages/organizer/CreateEventPage";
import EditEventPage from "@/pages/organizer/EditEventPage";
import EventPlanningPage from "@/pages/organizer/EventPlanningPage";
import CreateVenuePage from "@/pages/organizer/CreateVenuePage";
import GuestManagementPage from "@/pages/organizer/GuestManagementPage";
import MenuManagementPage from "@/pages/organizer/MenuManagementPage";
import WeddingShowcasePage from "@/pages/organizer/WeddingShowcasePage";

// Vendor Pages
import VendorDashboard from "@/pages/vendor/VendorDashboard";
import VendorServicesPage from "@/pages/vendor/VendorServicesPage";
import VendorBookingsPage from "@/pages/vendor/VendorBookingsPage";
import VendorAvailabilityPage from "@/pages/vendor/VendorAvailabilityPage";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminEvents from "@/pages/admin/AdminEvents";

function App() {
  const { initializeTheme } = useThemeStore();

  // ✅ Theme init only
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // ✅ TEMP: Supabase auth init disabled
  useEffect(() => {
    // console.log("Auth init disabled temporarily");
  }, []);

  // ✅ IMPORTANT: No loading guard, always render routes
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

        {/* ==================== CUSTOMER/USER ROUTES ==================== */}
        <Route
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/saved" element={<SavedEventsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/book/:eventId" element={<BookEventPage />} />
        </Route>

        {/* ==================== ORGANIZER ROUTES ==================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["organizer", "admin"]}>
              <OrganizerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/events" element={<OrganizerEvents />} />
          <Route path="/organizer/events/create" element={<CreateEventPage />} />
          <Route path="/organizer/events/edit/:id" element={<EditEventPage />} />
          <Route
            path="/organizer/events/:id/planning"
            element={<EventPlanningPage />}
          />
          <Route path="/organizer/venues/create" element={<CreateVenuePage />} />
          <Route
            path="/organizer/guests/:eventId"
            element={<GuestManagementPage />}
          />
          <Route
            path="/organizer/menus/:eventId"
            element={<MenuManagementPage />}
          />
          <Route
            path="/organizer/wedding-showcase"
            element={<WeddingShowcasePage />}
          />
        </Route>

        {/* ==================== VENDOR ROUTES ==================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["vendor", "admin"]}>
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/services" element={<VendorServicesPage />} />
          <Route path="/vendor/bookings" element={<VendorBookingsPage />} />
          <Route path="/vendor/availability" element={<VendorAvailabilityPage />} />
        </Route>

        {/* ==================== ADMIN ROUTES ==================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
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

      <Toaster />
    </>
  );
}

export default App;
