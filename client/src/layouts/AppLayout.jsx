import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import {
  Activity,
  CalendarDays,
  ClipboardList,
  FlaskConical,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Pill,
  Settings,
  Stethoscope,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../lib/utils';
import { ROLES } from '../lib/types';
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
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
  const items = useMemo(
    () => NAV_ITEMS.filter((i) => !i.roles || !user || i.roles.includes(user.role)),
    [user]
  );
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            <HeartPulse className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">MediCore</p>
            <p className="text-xs text-slate-500">Hospital Management</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {user?.name?.charAt(0) ?? 'U'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-60 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white/90 px-6 backdrop-blur">
          <Settings className="mr-2 h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-medium text-slate-600">MediCore HMS</h2>
        </header>
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
export default AppLayout;
