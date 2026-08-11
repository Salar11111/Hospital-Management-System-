import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, UserRound } from 'lucide-react';
import { useAppointment, useUpdateAppointmentStatusMutation } from '../hooks';
import { PageLoader } from '../components/guards';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/Button';
import { statusTone } from '../lib/badgeTone';
import { Badge } from '../components/ui/Badge';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { formatDate, refName } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import { ROLES } from '../lib/types';
function AppointmentDetail() {
  const { id = '' } = useParams();
  const user = useAuthStore((s) => s.user);
  const { data: appointment, isLoading } = useAppointment(id);
  const updateStatus = useUpdateAppointmentStatusMutation();
  const [cancelling, setCancelling] = useState(false);
  if (isLoading) return <PageLoader />;
  if (!appointment) {
    return (
      <div>
        <PageHeader title="Appointment" />
        <Card>
          <EmptyState icon={CalendarDays} title="Appointment not found" />
        </Card>
      </div>
    );
  }
  const canComplete =
    user?.role === ROLES.ADMIN || user?.role === ROLES.RECEPTIONIST || user?.role === ROLES.DOCTOR;
  const canCancel = user?.role !== ROLES.PHARMACIST && user?.role !== ROLES.LABTECH;
  return (
    <div>
      <Link
        to="/appointments"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to appointments
      </Link>

      <PageHeader
        title="Appointment details"
        subtitle={formatDate(appointment.date)}
        action={
          <div className="flex gap-2">
            {canComplete &&
              appointment.status !== 'Completed' &&
              appointment.status !== 'Cancelled' && (
                <Button
                  variant="outline"
                  loading={updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: appointment._id, status: 'Completed' })}
                >
                  <CheckCircle2 className="h-4 w-4" /> Mark completed
                </Button>
              )}
            {canCancel &&
              appointment.status !== 'Cancelled' &&
              appointment.status !== 'Completed' && (
                <Button variant="danger" onClick={() => setCancelling(true)}>
                  Cancel appointment
                </Button>
              )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{appointment.reason}</CardTitle>
            <Badge tone={statusTone(appointment.status)}>{appointment.status}</Badge>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Date & time</p>
                  <p className="text-sm font-medium text-slate-800">
                    {formatDate(appointment.date)} · {appointment.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Visit type</p>
                  <p className="text-sm font-medium text-slate-800">
                    {appointment.type ?? 'Consultation'}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Patient</p>
                  <Link
                    to={`/patients/${typeof appointment.patient === 'string' ? appointment.patient : appointment.patient._id}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    {refName(appointment.patient)}
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Doctor</p>
                  <p className="text-sm font-medium text-slate-800">
                    Dr. {refName(appointment.doctor)}
                  </p>
                </div>
              </div>
            </div>
            {appointment.notes && (
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Notes</p>
                <p className="mt-1 text-sm text-slate-700">{appointment.notes}</p>
              </div>
            )}
            {appointment.cancellationReason && (
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-red-500">
                  Cancellation reason
                </p>
                <p className="mt-1 text-sm text-red-700">{appointment.cancellationReason}</p>
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Booking info</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Created</p>
              <p className="text-slate-800">{formatDate(appointment.createdAt)}</p>
            </div>
            {appointment.consultedAt && (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Consulted at</p>
                <p className="text-slate-800">{formatDate(appointment.consultedAt)}</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={cancelling}
        title="Cancel appointment"
        message="Are you sure you want to cancel this appointment?"
        confirmLabel="Cancel appointment"
        loading={updateStatus.isPending}
        onConfirm={async () => {
          try {
            await updateStatus.mutateAsync({ id: appointment._id, status: 'Cancelled' });
          } finally {
            setCancelling(false);
          }
        }}
        onCancel={() => setCancelling(false)}
      />
    </div>
  );
}
export default AppointmentDetail;
