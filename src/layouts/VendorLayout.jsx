// src/layouts/VendorLayout.jsx
import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  ClipboardList,
  Star,
  Settings,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import Header from '@/components/common/Header';

// Vendor navigation items
const vendorNavItems = [
  {
    path: '/vendor',
    icon: LayoutDashboard,
    label: 'Dashboard',
    end: true, // Exact match
  },
  {
    path: '/vendor/services',
    icon: Package,
    label: 'My Services',
  },
  {
    path: '/vendor/bookings',
    icon: ClipboardList,
    label: 'Bookings',
  },
  {
    path: '/vendor/availability',
    icon: Calendar,
    label: 'Availability',
  },
  {
    path: '/vendor/reviews',
    icon: Star,
    label: 'My Reviews',
  },
  {
    path: '/vendor/settings',
    icon: Settings,
    label: 'Settings',
  },
];

// Sidebar Component
function VendorSidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:z-30
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Vendor Portal</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:bg-accent md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {vendorNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.end 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-colors duration-200
                  ${isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent/50">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Pro Vendor</p>
              <p className="text-xs text-muted-foreground">View benefits</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function VendorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with menu button for mobile */}
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      {/* Vendor Sidebar */}
      <VendorSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main Content */}
      <main className="md:pl-64 pt-16">
        <div className="container py-6 px-4 md:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default VendorLayout;