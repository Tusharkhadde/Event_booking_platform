// src/components/common/Header.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  LogOut,
  Menu,
  User,
  Settings,
  LayoutDashboard,
  MapPin,
  Loader2,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AccessibilityToolbar from '@/components/common/AccessibilityToolbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ThemeToggle from './ThemeToggle';
import useAuthStore from '@/store/authStore';
import authService from '@/services/authService';
import { getInitials } from '@/utils/helpers';
import { useUnreadCount } from '@/hooks/useNotifications';

function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { isAuthenticated, profile, user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Always call hook unconditionally
  const unreadCount = useUnreadCount();

  const displayName = profile?.name || user?.email || 'User';
  const displayEmail = profile?.email || user?.email || '';

  const getDashboardLink = () => {
    const role = profile?.role;
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'organizer') return '/organizer/dashboard';
    if (role === 'vendor') return '/vendor/dashboard';
    return '/dashboard';
  };

  const handleLogout = async () => {
    console.log('Logout clicked'); // DEBUG

    try {
      setIsSigningOut(true);

      // Try to end Supabase session, but even if it fails, we clear local state.
      try {
        await authService.signOut();
      } catch (e) {
        console.error('Supabase signOut error (ignored):', e);
      }

      // Clear local auth state
      logout();
      console.log('After logout store state:', useAuthStore.getState()); // DEBUG

      // Navigate to login
      navigate('/login', { replace: true });
    } finally {
      setIsSigningOut(false);
      setDropdownOpen(false);
    }
  };

  const handleNavigate = (path) => {
    setDropdownOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left: logo & mobile menu */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">EventSphere</span>
          </Link>
        </div>

        {/* Middle nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/events"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Events
          </Link>
          <Link
            to="/venues"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Venues
          </Link>
          {isAuthenticated && profile?.role === 'organizer' && (
            <Link
              to="/organizer/events"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              My Events
            </Link>
          )}
        </nav>

        {/* Right side: theme + auth section */}
        <div className="flex items-center gap-4">
          <AccessibilityToolbar />
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/notifications')}
                aria-label="Notifications"
              >
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>
              </Button>

              {/* User dropdown */}
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {displayEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleNavigate(getDashboardLink())}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {(profile?.role === 'organizer' || profile?.role === 'admin') && (
                    <DropdownMenuItem onClick={() => handleNavigate('/organizer/venues/create')}>
                      <MapPin className="mr-2 h-4 w-4" />
                      Add Venue
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isSigningOut}
                    className="text-red-600 focus:text-red-600"
                  >
                    {isSigningOut ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    {isSigningOut ? 'Logging out...' : 'Log out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button onClick={() => navigate('/register')}>Sign up</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;