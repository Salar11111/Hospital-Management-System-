import { useMemo, useState } from 'react';
import { CalendarDays, CalendarX2, Phone, Stethoscope } from 'lucide-react';
import { useDoctorSchedule, useDoctors, useUpdateDoctorScheduleMutation } from '../hooks';
import { PageHeader } from '../components/PageHeader';
import { PageLoader } from '../components/guards';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardBody } from '../components/ui/Card';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { useAuthStore } from '../stores/authStore';
import { ROLES } from '../lib/types';
function Doctors() {
  const user = useAuthStore((s) => s.user);
  const [department, setDepartment] = useState('');
  const { data, isLoading } = useDoctors({ page: 1, limit: 100, department: department || void 0 });
  const doctors = useMemo(() => data?.items ?? [], [data]);
  const departments = useMemo(
    () => Array.from(new Set(doctors.map((d) => d.department ?? '').filter(Boolean))),
    [doctors]
  );
  const [scheduleFor, setScheduleFor] = useState(null);
  return (
    <div>
      <PageHeader
        title="Doctors"
        subtitle="Browse the medical team"
        action={
          departments.length > 0 ? (
            <select
              className="input w-56"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          ) : (
            void 0
          )
        }
      />

      {isLoading ? (
        <PageLoader />
      ) : doctors.length === 0 ? (
        <Card>
          <EmptyState icon={Stethoscope} title="No doctors found" />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d) => (
            <Card key={d._id}>
              <CardBody className="space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white"
                    style={{ backgroundColor: d.avatarColor ?? '#6366f1' }}
                  >
                    {d.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">Dr. {d.name}</p>
                    <p className="truncate text-sm text-slate-500">
                      {d.profile?.specialization ?? d.department ?? 'General Practitioner'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  {d.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {d.phone}
                    </span>
                  )}
                  {d.department && <Badge tone="violet">{d.department}</Badge>}
                </div>
                <Button variant="outline" className="w-full" onClick={() => setScheduleFor(d._id)}>
                  <CalendarDays className="h-4 w-4" /> View schedule
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {scheduleFor && (
        <ScheduleModal
          doctorId={scheduleFor}
          isAdmin={user?.role === ROLES.ADMIN}
          onClose={() => setScheduleFor(null)}
        />
      )}
    </div>
  );
}
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
function ScheduleModal({ doctorId, isAdmin, onClose }) {
  const { data: doctor, isLoading } = useDoctorSchedule(doctorId);
  const updateSchedule = useUpdateDoctorScheduleMutation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const startEditing = () => {
    if (!doctor) return;
    setDraft(
      WEEKDAYS.map((day) => {
        const existing = doctor.schedule.find((s) => s.day === day);
        return existing
          ? { ...existing }
          : { day, startTime: '09:00', endTime: '17:00', isAvailable: false };
      })
    );
    setEditing(true);
    setError('');
  };
  const save = async () => {
    if (!draft) return;
    try {
      await updateSchedule.mutateAsync({ id: doctorId, schedule: draft });
      setEditing(false);
      setDraft(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save schedule');
    }
  };
  return (
    <Modal
      open
      onClose={onClose}
      title={`Weekly schedule \u2014 Dr. ${doctor?.name ?? ''}`}
      size="lg"
      footer={
        editing ? (
          <>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(false);
                setDraft(null);
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={save} loading={updateSchedule.isPending}>
              Save schedule
            </Button>
          </>
        ) : isAdmin ? (
          <Button onClick={startEditing}>Edit schedule</Button>
        ) : (
          void 0
        )
      }
    >
      {isLoading ? (
        <PageLoader />
      ) : !doctor || doctor.schedule.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="No schedule set"
          description="This doctor has not published a weekly schedule yet."
          action={isAdmin ? <Button onClick={startEditing}>Create schedule</Button> : void 0}
        />
      ) : (
        <div className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
            {WEEKDAYS.map((day) => {
              const entry = editing
                ? draft?.find((d) => d.day === day)
                : doctor.schedule.find((s) => s.day === day);
              const isAvailable = entry?.isAvailable ?? false;
              return (
                <div key={day} className="flex items-center justify-between bg-white px-4 py-3">
                  <span className="w-28 text-sm font-medium text-slate-700">{day}</span>
                  {editing && draft ? (
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={isAvailable}
                          onChange={(e) =>
                            setDraft(
                              draft.map((d) =>
                                d.day === day ? { ...d, isAvailable: e.target.checked } : d
                              )
                            )
                          }
                          className="h-4 w-4 rounded border-slate-300 text-primary-600"
                        />
                        Available
                      </label>
                      <input
                        type="time"
                        className="input w-28 py-1.5 text-sm"
                        disabled={!isAvailable}
                        value={entry?.startTime ?? '09:00'}
                        onChange={(e) =>
                          setDraft(
                            draft.map((d) =>
                              d.day === day ? { ...d, startTime: e.target.value } : d
                            )
                          )
                        }
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="time"
                        className="input w-28 py-1.5 text-sm"
                        disabled={!isAvailable}
                        value={entry?.endTime ?? '17:00'}
                        onChange={(e) =>
                          setDraft(
                            draft.map((d) =>
                              d.day === day ? { ...d, endTime: e.target.value } : d
                            )
                          )
                        }
                      />
                    </div>
                  ) : isAvailable ? (
                    <Badge tone="green">
                      {entry?.startTime} – {entry?.endTime}
                    </Badge>
                  ) : (
                    <Badge tone="gray">Off</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
export default Doctors;
