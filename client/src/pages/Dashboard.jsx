import { useMemo } from 'react';
import {
  Activity,
  CalendarCheck,
  DollarSign,
  FlaskConical,
  HeartPulse,
  Pill,
  Stethoscope,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAppointments, useDashboard } from '../hooks';
import { Badge } from '../components/ui/Badge';
import { statusTone } from '../lib/badgeTone';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { PageLoader } from '../components/guards';
import { EmptyState } from '../components/EmptyState';
import { formatCurrency, refName } from '../lib/utils';
import { ROLES } from '../lib/types';
function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </CardBody>
    </Card>
  );
}
function TodayHeader() {
  return (
    <h2 className="text-lg font-semibold text-slate-900">
      {
        /* @__PURE__ */ new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
      }
    </h2>
  );
}
function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === ROLES.ADMIN;
  const { data: stats, isLoading: statsLoading } = useDashboard(isAdmin);
  const { data: apptPage, isLoading: apptLoading } = useAppointments(
    isAdmin ? void 0 : { page: 1, limit: 100, status: void 0 }
  );
  const counts = stats?.counts;
  const today = useMemo(() => {
    const d = /* @__PURE__ */ new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);
  const futureAppointments = useMemo(
    () => (apptPage?.items ?? []).filter((a) => String(a.date).slice(0, 10) >= today),
    [apptPage, today]
  );
  if (isAdmin && statsLoading) return <PageLoader />;
  if (!isAdmin && apptLoading) return <PageLoader />;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="page-subtitle">Here is what's happening across MediCore.</p>
      </div>

      {isAdmin && counts ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Patients"
            value={counts.totalPatients}
            icon={Users}
            accent="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Doctors"
            value={counts.totalDoctors}
            icon={Stethoscope}
            accent="bg-violet-50 text-violet-600"
          />
          <StatCard
            label="Appointments Today"
            value={counts.todayAppointments}
            icon={CalendarCheck}
            accent="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Pending Lab Orders"
            value={counts.pendingLabOrders}
            icon={FlaskConical}
            accent="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Total Users"
            value={counts.totalUsers}
            icon={Activity}
            accent="bg-slate-100 text-slate-600"
          />
          <StatCard
            label="Revenue (Dispensed)"
            value={formatCurrency(counts.revenue)}
            icon={DollarSign}
            accent="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Low Stock Medicines"
            value={stats?.lowStock.length ?? 0}
            icon={Pill}
            accent="bg-red-50 text-red-600"
          />
          <StatCard
            label="Today's Date"
            value={today}
            icon={HeartPulse}
            accent="bg-primary-50 text-primary-600"
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Appointments"
            value={futureAppointments.length}
            icon={CalendarCheck}
            accent="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Pending"
            value={futureAppointments.filter((a) => a.status === 'Pending').length}
            icon={Activity}
            accent="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Confirmed"
            value={futureAppointments.filter((a) => a.status === 'Confirmed').length}
            icon={CalendarCheck}
            accent="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="My Role"
            value={user?.role ?? ''}
            icon={HeartPulse}
            accent="bg-violet-50 text-violet-600"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{isAdmin ? <TodayHeader /> : 'Upcoming Appointments'}</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            {isAdmin && stats ? (
              stats.todaysSchedule.length === 0 ? (
                <EmptyState
                  icon={CalendarCheck}
                  title="No appointments today"
                  description="The schedule for today is clear."
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {stats.todaysSchedule.map((a) => (
                    <div key={a.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-14 text-sm font-medium text-slate-900">{a.time}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{a.patientName}</p>
                          <p className="text-xs text-slate-500">Dr. {a.doctorName}</p>
                        </div>
                      </div>
                      <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                    </div>
                  ))}
                </div>
              )
            ) : futureAppointments.length === 0 ? (
              <EmptyState icon={CalendarCheck} title="No upcoming appointments" />
            ) : (
              <div className="divide-y divide-slate-100">
                {futureAppointments.slice(0, 8).map((a) => (
                  <Link
                    key={a._id}
                    to={`/appointments/${a._id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-16 shrink-0 text-sm font-medium text-slate-900">
                        {String(a.date).slice(0, 10)} {a.time}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{refName(a.patient)}</p>
                        <p className="text-xs text-slate-500">Dr. {refName(a.doctor)}</p>
                      </div>
                    </div>
                    <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Medicines</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {!stats || stats.lowStock.length === 0 ? (
                <EmptyState icon={Pill} title="All medicines stocked" />
              ) : (
                <div className="divide-y divide-slate-100">
                  {stats.lowStock.map((m) => (
                    <Link
                      key={m._id}
                      to="/medicines"
                      className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">{m.name}</p>
                        <p className="text-xs text-slate-500">
                          {m.category} · {m.genericName ? `Generic: ${m.genericName}` : ''}
                        </p>
                      </div>
                      <Badge tone={m.stockQuantity <= 10 ? 'red' : 'amber'}>
                        {m.stockQuantity} left
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
export default Dashboard;
