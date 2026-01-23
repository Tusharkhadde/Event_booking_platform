import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import LoadingSpinner from './LoadingSpinner';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const { isAuthenticated, isLoading, isInitialized, profile } = useAuthStore();

  // Still loading auth state
  if (isLoading || !isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0) {
    const userRole = profile?.role || 'customer';
    const hasAccess = allowedRoles.includes(userRole);

    if (!hasAccess) {
      // Redirect to appropriate dashboard based on role
      if (userRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
      if (userRole === 'organizer') {
        return <Navigate to="/organizer/dashboard" replace />;
      }
      if (userRole === 'vendor') {
        return <Navigate to="/vendor/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;