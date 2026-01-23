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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import useAuth from '@/hooks/useAuth';
import { getInitials } from '@/utils/helpers';

function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuthStore();
  const { signOut, isSigningOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getDashboardLink = () => {
    const role = profile?.role;
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'organizer') return '/organizer/dashboard';
    if (role === 'vendor') return '/vendor/dashboard';
    return '/profile';
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    signOut();
  };

  const handleNavigate = (path) => {
    setDropdownOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
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

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {isAuthenticated && (
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar>
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>
                      {getInitials(profile?.name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {profile?.name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.email || ''}
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
          )}

          {!isAuthenticated && (
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