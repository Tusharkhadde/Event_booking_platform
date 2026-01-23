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
} from 'lucide-react';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { profile } = useAuthStore();
  const role = profile?.role;

  const getNavigationItems = () => {
    if (role === 'admin') {
      return [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/events', icon: Calendar, label: 'Events' },
        { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
        { to: '/admin/settings', icon: Settings, label: 'Settings' },
      ];
    }

    if (role === 'organizer') {
      return [
        { to: '/organizer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/organizer/events', icon: Calendar, label: 'My Events' },
        { to: '/organizer/venues/create', icon: MapPin, label: 'Add Venue' },
        { to: '/organizer/calendar', icon: ClipboardList, label: 'Calendar' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
        { to: '/profile', icon: Settings, label: 'Settings' },
      ];
    }

    if (role === 'vendor') {
      return [
        { to: '/vendor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/vendor/orders', icon: ClipboardList, label: 'Orders' },
        { to: '/vendor/profile', icon: Users, label: 'Profile' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
      ];
    }

    // Customer navigation
    return [
      { to: '/events', icon: Calendar, label: 'Browse Events' },
      { to: '/my-bookings', icon: Ticket, label: 'My Bookings' },
      { to: '/tickets', icon: ClipboardList, label: 'My Tickets' },
      { to: '/notifications', icon: Bell, label: 'Notifications' },
      { to: '/profile', icon: Settings, label: 'Profile' },
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-200 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-end p-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

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
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {role === 'organizer' && (
            <div className="border-t p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                Quick Planning
              </p>
              <div className="space-y-1">
                <NavLink
                  to="/organizer/events/create?type=wedding"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Heart className="h-4 w-4" />
                  Wedding Planner
                </NavLink>
                <NavLink
                  to="/organizer/events/create?type=party"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <PartyPopper className="h-4 w-4" />
                  Party Planner
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
