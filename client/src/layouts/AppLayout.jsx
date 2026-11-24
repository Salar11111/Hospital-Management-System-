import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  ClipboardList,
  FlaskConical,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  Settings,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../lib/utils';
import { ROLES } from '../lib/types';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  {
    to: '/appointments',
    label: 'Appointments',
    icon: CalendarDays,
    roles: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT],
  },
  {
    to: '/patients',
    label: 'Patients',
    icon: Users,
    roles: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT],
  },
  {
    to: '/doctors',
    label: 'Doctors',
    icon: Stethoscope,
    roles: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT],
  },
  { to: '/records', label: 'Medical Records', icon: FileText, roles: [ROLES.ADMIN, ROLES.DOCTOR] },
  {
    to: '/prescriptions',
    label: 'Prescriptions',
    icon: ClipboardList,
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.PHARMACIST],
  },
  {
    to: '/lab',
    label: 'Lab Orders',
    icon: FlaskConical,
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.LABTECH],
  },
  { to: '/medicines', label: 'Pharmacy', icon: Pill, roles: [ROLES.ADMIN, ROLES.PHARMACIST] },
  { to: '/staff', label: 'Staff', icon: Users, roles: [ROLES.ADMIN] },
  { to: '/activity', label: 'Audit Logs', icon: Activity, roles: [ROLES.ADMIN] },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const items = useMemo(
    () => NAV_ITEMS.filter((i) => !i.roles || !user || i.roles.includes(user.role)),
    [user]
  );

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f5f8fa]">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-200 bg-white transition-transform duration-150',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-600 text-white">
              <HeartPulse className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">MediCore</p>
              <p className="text-xs text-slate-500">Hospital Management</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Portal navigation">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-800'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-800">
              {user?.name?.charAt(0) ?? 'U'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Settings className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <h2 className="text-sm font-medium text-slate-600">MediCore HMS</h2>
        </header>
        <div className="mx-auto w-full max-w-7xl px-4 py-5 lg:px-8 lg:py-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
