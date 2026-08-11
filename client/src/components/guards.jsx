import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Spinner } from '../components/ui/Button';
function RequireAuth() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
function RequireRole({ roles }) {
  const user = useAuthStore((s) => s.user);
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}
function PublicOnly() {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center p-12">
      <Spinner className="h-8 w-8 text-primary-600" />
    </div>
  );
}
export { PageLoader, PublicOnly, RequireAuth, RequireRole };
