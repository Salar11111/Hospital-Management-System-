import { Link } from 'react-router-dom';
import { KeyRound, UserRound } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../stores/authStore';
import { formatDateTime } from '../lib/utils';

function Row({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value ?? '—'}</span>
    </div>
  );
}

export default function Settings() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Your account information" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-slate-400" /> Profile
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="mb-4 flex items-center gap-3">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-semibold text-white"
                style={{ backgroundColor: user.avatarColor ?? '#4f46e5' }}
              >
                {user.name.charAt(0)}
              </span>
              <div>
                <p className="text-base font-semibold text-slate-900">{user.name}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              <Row label="Role" value={user.role} />
              <Row label="Department" value={user.department} />
              <Row label="Phone" value={user.phone} />
              <Row label="Gender" value={user.gender} />
              {user.isActive !== undefined && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-500">Status</span>
                  <Badge tone={user.isActive ? 'green' : 'red'}>{user.isActive ? 'Active' : 'Deactivated'}</Badge>
                </div>
              )}
              <Row label="Last login" value={formatDateTime(user.lastLogin)} />
            </div>
          </CardBody>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-slate-400" /> Account & security
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-slate-500">
              Sign-in uses a secure cookie-based session. If you've forgotten your password you can reset it using the
              password reset flow.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Reset password →
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}