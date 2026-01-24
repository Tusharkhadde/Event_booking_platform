// src/components/common/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const { isAuthenticated, profile } = useAuthStore();

  // If not logged in, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Role-based check
  if (allowedRoles.length > 0) {
    const userRole = profile?.role || 'customer';
    const hasAccess = allowedRoles.includes(userRole);

    if (!hasAccess) {
      // redirect based on role or home
      if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (userRole === 'organizer') return <Navigate to="/organizer/dashboard" replace />;
      if (userRole === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;