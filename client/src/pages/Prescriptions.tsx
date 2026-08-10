import { useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, ClipboardList, Plus, Trash2, XCircle } from 'lucide-react';
import {
  useCancelPrescriptionMutation,
  useCreatePrescriptionMutation,
  useDispensePrescriptionMutation,
  useMedicines,
  usePatients,
  usePrescriptions,
} from '../hooks';
import { PageHeader } from '../components/PageHeader';
import { PageLoader } from '../components/guards';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { statusTone } from '../lib/badgeTone';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { getErrorMessage } from '../lib/api';
import { formatDate, refName } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import { ROLES, type PrescriptionStatus } from '../lib/types';

const STATUSES: PrescriptionStatus[] = ['Pending', 'Dispensed', 'Cancelled'];

interface ItemRow {
  medicine: string;
  quantity: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function Prescriptions() {
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePrescriptions({ page, limit: 15, status: status || undefined });

  const prescriptions = useMemo(() => data?.items ?? [], [data]);
  const dispense = useDispensePrescriptionMutation();
  const cancel = useCancelPrescriptionMutation();

  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const isPharmacist = user?.role === ROLES.PHARMACIST;
  const canCreate = user?.role === ROLES.DOCTOR || user?.role === ROLES.ADMIN;
  const canDispense = isPharmacist || user?.role === ROLES.ADMIN;
  const canCancel = user?.role === ROLES.DOCTOR || user?.role === ROLES.ADMIN;

  return (
    <div>
      <PageHeader
        title="Prescriptions"
        subtitle="Create and dispense prescriptions"
        action={
          canCreate ? (
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> New prescription
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
      ) : prescriptions.length === 0 ? (
        <Card>
          <EmptyState icon={ClipboardList} title="No prescriptions found" />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">Patient</th>
                  <th className="table-th">Doctor</th>
                  <th className="table-th">Items</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {prescriptions.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70">
                    <td className="table-td font-medium text-slate-800">{refName(p.patient)}</td>
                    <td className="table-td">Dr. {refName(p.doctor)}</td>
                    <td className="table-td">
                      {p.items.map((i) => i.name).join(', ')}
                    </td>
                    <td className="table-td whitespace-nowrap text-slate-500">{formatDate(p.createdAt)}</td>
                    <td className="table-td">
                      <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                    </td>
                    <td className="table-td text-right">
                      <div className="flex justify-end gap-1.5">
                        {canDispense && p.status === 'Pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            loading={dispense.isPending}
                            onClick={() => dispense.mutate(p._id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Dispense
                          </Button>
                        )}
                        {canCancel && p.status === 'Pending' && (
                          <Button size="sm" variant="ghost" onClick={() => setCancelling(p._id)}>
                            <XCircle className="h-3.5 w-3.5" /> Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </Card>
      )}

      <CreatePrescriptionModal open={creating} onClose={() => setCreating(false)} />

      <ConfirmDialog
        open={!!cancelling}
        title="Cancel prescription"
        message="Are you sure you want to cancel this prescription?"
        confirmLabel="Cancel prescription"
        loading={cancel.isPending}
        onConfirm={async () => {
          if (!cancelling) return;
          try {
            await cancel.mutateAsync(cancelling);
          } finally {
            setCancelling(null);
          }
        }}
        onCancel={() => setCancelling(null)}
      />
    </div>
  );
}

function CreatePrescriptionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [patient, setPatient] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ItemRow[]>([]);
  const [error, setError] = useState('');

  const { data: patientsData } = usePatients({ page: 1, limit: 100 });
  const { data: medicinesData } = useMedicines({ page: 1, limit: 100 });
  const create = useCreatePrescriptionMutation();

  const patients = useMemo(() => patientsData?.items ?? [], [patientsData]);
  const medicines = useMemo(() => medicinesData?.items ?? [], [medicinesData]);

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { medicine: '', quantity: '1', dosage: '', frequency: '', duration: '', instructions: '' },
    ]);

  const updateItem = (index: number, patch: Partial<ItemRow>) =>
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!patient) {
      setError('Select a patient');
      return;
    }
    const validItems = items.filter((i) => i.medicine && Number(i.quantity) > 0);
    if (validItems.length === 0) {
      setError('Add at least one medicine');
      return;
    }
    try {
      await create.mutateAsync({
        patient,
        notes: notes || undefined,
        items: validItems.map((i) => ({
          medicine: i.medicine,
          quantity: Number(i.quantity),
          dosage: i.dosage,
          frequency: i.frequency,
          duration: i.duration,
          instructions: i.instructions || undefined,
        })),
      });
      onClose();
      setPatient('');
      setNotes('');
      setItems([]);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New prescription"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={create.isPending}>
            Create prescription
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div>
          <label className="label" htmlFor="rx-patient">
            Patient
          </label>
          <select
            id="rx-patient"
            className="input"
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
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
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Medicines</label>
            <Button type="button" size="sm" variant="outline" onClick={addItem}>
              <Plus className="h-3.5 w-3.5" /> Add medicine
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-400">
              No medicines added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((row, index) => (
                <div key={index} className="rounded-lg border border-slate-200 p-3">
                  <div className="grid gap-3 sm:grid-cols-6">
                    <select
                      className="input sm:col-span-2"
                      value={row.medicine}
                      onChange={(e) => updateItem(index, { medicine: e.target.value })}
                    >
                      <option value="">Select medicine…</option>
                      {medicines.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <Input
                      label="Qty"
                      name={`qty-${index}`}
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(e) => updateItem(index, { quantity: e.target.value })}
                    />
                    <Input
                      label="Dosage"
                      name={`dosage-${index}`}
                      placeholder="e.g. 500mg"
                      value={row.dosage}
                      onChange={(e) => updateItem(index, { dosage: e.target.value })}
                    />
                    <Input
                      label="Frequency"
                      name={`freq-${index}`}
                      placeholder="2x daily"
                      value={row.frequency}
                      onChange={(e) => updateItem(index, { frequency: e.target.value })}
                    />
                    <div className="flex items-end gap-2">
                      <Input
                        label="Duration"
                        name={`dur-${index}`}
                        placeholder="7 days"
                        value={row.duration}
                        onChange={(e) => updateItem(index, { duration: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mb-0.5 text-red-500"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Input
                    label="Instructions"
                    name={`inst-${index}`}
                    placeholder="e.g. Take after meals"
                    value={row.instructions}
                    onChange={(e) => updateItem(index, { instructions: e.target.value })}
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <Textarea label="Notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </form>
    </Modal>
  );
}