import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, CalendarDays, ChevronRight } from 'lucide-react';
import {
  useAppointments,
  useBookAppointmentMutation,
  useDoctors,
  usePatients,
  useUpdateAppointmentStatusMutation,
} from '../hooks';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { statusTone } from '../lib/badgeTone';
import { Pagination } from '../components/Pagination';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageLoader } from '../components/guards';
import { getErrorMessage } from '../lib/api';
import { formatDate, refName } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import { ROLES, type AppointmentStatus } from '../lib/types';

const STATUSES: AppointmentStatus[] = ['Pending', 'Confirmed', 'Completed', 'No-Show', 'Cancelled'];

export default function Appointments() {
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAppointments({ page, limit: 15, status: status || undefined });

  const appointments = useMemo(() => data?.items ?? [], [data]);
  const updateStatus = useUpdateAppointmentStatusMutation();

  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState<{ id: string; label: string } | null>(null);

  const canManage =
    user?.role === ROLES.ADMIN || user?.role === ROLES.RECEPTIONIST || user?.role === ROLES.DOCTOR;
  const canBook =
    user?.role === ROLES.ADMIN || user?.role === ROLES.RECEPTIONIST || user?.role === ROLES.DOCTOR;

  const handleStatusChange = (id: string, value: string) => {
    if (value === 'Cancelled') {
      setCancelling({ id, label: appointments.find((a) => a._id === id)?.reason ?? 'this appointment' });
      return;
    }
    void updateStatus.mutateAsync({ id, status: value });
  };

  const confirmCancel = async () => {
    if (!cancelling) return;
    try {
      await updateStatus.mutateAsync({ id: cancelling.id, status: 'Cancelled', reason: 'Cancelled from schedule' });
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="Manage and book appointments"
        action={
          canBook ? (
            <Button onClick={() => setBooking(true)}>
              <CalendarPlus className="h-4 w-4" /> Book appointment
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm text-slate-500">Status</label>
        <select
          className="input w-48"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : appointments.length === 0 ? (
        <Card>
          <EmptyState icon={CalendarDays} title="No appointments found" />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">Date</th>
                  <th className="table-th">Time</th>
                  <th className="table-th">Patient</th>
                  <th className="table-th">Doctor</th>
                  <th className="table-th">Reason</th>
                  <th className="table-th">Status</th>
                  <th className="table-th" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/70">
                    <td className="table-td whitespace-nowrap">{formatDate(a.date)}</td>
                    <td className="table-td font-medium">{a.time}</td>
                    <td className="table-td font-medium text-slate-800">{refName(a.patient)}</td>
                    <td className="table-td">Dr. {refName(a.doctor)}</td>
                    <td className="table-td max-w-48 truncate text-slate-500">{a.reason}</td>
                    <td className="table-td">
                      {canManage ? (
                        <select
                          className="input w-32 py-1.5 text-xs"
                          value={a.status}
                          onChange={(e) => handleStatusChange(a._id, e.target.value)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                      )}
                    </td>
                    <td className="table-td text-right">
                      <Link
                        to={`/appointments/${a._id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        View <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </Card>
      )}

      <BookAppointmentModal open={booking} onClose={() => setBooking(false)} />
      <ConfirmDialog
        open={!!cancelling}
        title="Cancel appointment"
        message={`Are you sure you want to cancel this appointment for ${cancelling?.label ?? ''}?`}
        confirmLabel="Cancel appointment"
        loading={updateStatus.isPending}
        onConfirm={confirmCancel}
        onCancel={() => setCancelling(null)}
      />
    </div>
  );
}

function BookAppointmentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
    type: 'Consultation',
  });
  const [error, setError] = useState('');
  const { data: patientsData } = usePatients({ page: 1, limit: 100 });
  const { data: doctorsData } = useDoctors({ page: 1, limit: 100 });
  const book = useBookAppointmentMutation();

  const patients = useMemo(() => patientsData?.items ?? [], [patientsData]);
  const doctors = useMemo(() => doctorsData?.items ?? [], [doctorsData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.patient || !form.doctor || !form.date || !form.time) {
      setError('Patient, doctor, date and time are required');
      return;
    }
    try {
      await book.mutateAsync({
        patient: form.patient,
        doctor: form.doctor,
        date: form.date,
        time: form.time,
        reason: form.reason,
        notes: form.notes || undefined,
        type: form.type || undefined,
      });
      onClose();
      setForm({ patient: '', doctor: '', date: '', time: '', reason: '', notes: '', type: 'Consultation' });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Book appointment"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={book.isPending}>
            Book appointment
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="patient">
              Patient
            </label>
            <select
              id="patient"
              className="input"
              value={form.patient}
              onChange={(e) => setForm({ ...form, patient: e.target.value })}
              required
            >
              <option value="">Select patient…</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.patientId})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="doctor">
              Doctor
            </label>
            <select
              id="doctor"
              className="input"
              value={form.doctor}
              onChange={(e) => setForm({ ...form, doctor: e.target.value })}
              required
            >
              <option value="">Select doctor…</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  Dr. {d.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Date"
            name="date"
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <Input
            label="Time"
            name="time"
            type="time"
            required
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>
        <Input
          label="Visit type"
          name="type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        />
        <Input
          label="Reason"
          name="reason"
          required
          placeholder="Reason for visit"
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
        />
        <Textarea
          label="Notes"
          name="notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </form>
    </Modal>
  );
}