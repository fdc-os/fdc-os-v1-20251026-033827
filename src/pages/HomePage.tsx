import { useAuthStore } from '@/lib/auth';
import { Navigate, Outlet } from 'react-router-dom';
export function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
}