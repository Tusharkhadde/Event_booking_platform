import { NavLink, useLocation } from 'react-router-dom';
import {
  Calendar,
  LayoutDashboard,
  Users,
  Settings,
  ClipboardList,
  Ticket,
  CreditCard,
  Bell,
  Heart,
  PartyPopper,
  CheckSquare,
  X,
  MapPin,
  Utensils,
  Home,
  Star,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useAuthStore from '@/store/authStore';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { profile } = useAuthStore();
  const role = profile?.role;

  const getNavigationItems = () => {
    // Customer Navigation
    if (role === 'customer' || !role) {
      return [
        { to: '/dashboard', icon: Home, label: 'Dashboard' },
        { to: '/events', icon: Calendar, label: 'Browse Events' },
        { to: '/venues', icon: MapPin, label: 'Browse Venues' },
        { to: '/my-bookings', icon: Ticket, label: 'My Bookings' },
        { to: '/tickets', icon: ClipboardList, label: 'My Tickets' },
        { to: '/saved', icon: Heart, label: 'Saved Events' },
        { to: '/notifications', icon: Bell, label: 'Notifications', badge: 2 },
        { to: '/profile', icon: Settings, label: 'Profile' },
      ];
    }

    // Admin Navigation
    if (role === 'admin') {
      return [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/events', icon: Calendar, label: 'Events' },
        { to: '/admin/vendors', icon: Star, label: 'Vendors' },
        { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
        { to: '/admin/settings', icon: Settings, label: 'Settings' },
      ];
    }

    // Organizer Navigation
    if (role === 'organizer') {
      return [
        { to: '/organizer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/organizer/events', icon: Calendar, label: 'My Events' },
        { to: '/organizer/venues/create', icon: MapPin, label: 'Add Venue' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
        { to: '/profile', icon: Settings, label: 'Settings' },
      ];
    }

    // Vendor Navigation
    if (role === 'vendor') {
      return [
        { to: '/vendor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/vendor/services', icon: Star, label: 'My Services' },
        { to: '/vendor/bookings', icon: ClipboardList, label: 'Bookings' },
        { to: '/vendor/calendar', icon: Calendar, label: 'Availability' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
        { to: '/profile', icon: Settings, label: 'Profile' },
      ];
    }

    return [];
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-200 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile close button */}
          <div className="flex items-center justify-end p-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Help Section */}
          <div className="border-t p-4">
            <NavLink
              to="/help"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <HelpCircle className="h-5 w-5" />
              Help & Support
            </NavLink>
          </div>

          {/* Quick Actions for Organizers */}
          {role === 'organizer' && (
            <div className="border-t p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                Quick Actions
              </p>
              <div className="space-y-1">
                <NavLink
                  to="/organizer/events/create"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Calendar className="h-4 w-4" />
                  Create Event
                </NavLink>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;