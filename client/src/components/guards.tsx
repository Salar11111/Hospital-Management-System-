import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Spinner } from '../components/ui/Button';
import type { Role } from '../lib/types';

export function RequireAuth() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export function RequireRole({ roles }: { roles: Role[] }) {
  const user = useAuthStore((s) => s.user);

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}

export function PublicOnly() {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center p-12">
      <Spinner className="h-8 w-8 text-primary-600" />
    </div>
  );
}