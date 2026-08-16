import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 로그인 X -> /login
 */
function ProtectedRoute() {
  const { isAuthenticated, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
