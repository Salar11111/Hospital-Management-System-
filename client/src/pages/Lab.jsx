import { useMemo, useState } from 'react';
import { FlaskConical, Plus, Trash2, XCircle } from 'lucide-react';
import {
  useCancelLabOrderMutation,
  useCompleteLabOrderMutation,
  useCreateLabOrderMutation,
  useLabOrders,
  usePatients,
} from '../hooks';
import { PageHeader } from '../components/PageHeader';
import { PageLoader } from '../components/guards';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { statusTone } from '../lib/badgeTone';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { getErrorMessage } from '../lib/api';
import { formatDate, refName } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import { ROLES } from '../lib/types';
const STATUSES = ['Pending', 'Completed', 'Cancelled'];
function Lab() {
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useLabOrders({ page, limit: 15, status: status || void 0 });
  const orders = useMemo(() => data?.items ?? [], [data]);
  const cancel = useCancelLabOrderMutation();
  const [creating, setCreating] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const canCreate = user?.role === ROLES.DOCTOR || user?.role === ROLES.ADMIN;
  const canComplete = user?.role === ROLES.LABTECH || user?.role === ROLES.ADMIN;
  const canCancel = user?.role === ROLES.DOCTOR || user?.role === ROLES.ADMIN;
  return (
    <div>
      <PageHeader
        title="Lab Orders"
        subtitle="Request and record laboratory tests"
        action={
          canCreate ? (
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> New lab order
            </Button>
          ) : (
            void 0
          )
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
      ) : orders.length === 0 ? (
        <Card>
          <EmptyState icon={FlaskConical} title="No lab orders found" />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">Patient</th>
                  <th className="table-th">Test</th>
                  <th className="table-th">Requested by</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/70">
                    <td className="table-td font-medium text-slate-800">{refName(o.patient)}</td>
                    <td className="table-td">{o.testName}</td>
                    <td className="table-td">Dr. {refName(o.doctor)}</td>
                    <td className="table-td whitespace-nowrap text-slate-500">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="table-td">
                      <Badge tone={statusTone(o.status)}>{o.status}</Badge>
                    </td>
                    <td className="table-td text-right">
                      <div className="flex justify-end gap-1.5">
                        {canComplete && o.status === 'Pending' && (
                          <Button size="sm" onClick={() => setCompleting(o)}>
                            Record results
                          </Button>
                        )}
                        {canCancel && o.status === 'Pending' && (
                          <Button size="sm" variant="ghost" onClick={() => setCancelling(o)}>
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
          <Pagination
            page={data?.page ?? 1}
            totalPages={data?.totalPages ?? 1}
            onPageChange={setPage}
          />
        </Card>
      )}

      <CreateLabOrderModal open={creating} onClose={() => setCreating(false)} />
      {completing && (
        <CompleteLabOrderModal order={completing} onClose={() => setCompleting(null)} />
      )}

      <ConfirmDialog
        open={!!cancelling}
        title="Cancel lab order"
        message={`Cancel the ${cancelling?.testName ?? ''} lab order for ${cancelling ? refName(cancelling.patient) : ''}?`}
        confirmLabel="Cancel order"
        loading={cancel.isPending}
        onConfirm={async () => {
          if (!cancelling) return;
          try {
            await cancel.mutateAsync(cancelling._id);
          } finally {
            setCancelling(null);
          }
        }}
        onCancel={() => setCancelling(null)}
      />
    </div>
  );
}
function CreateLabOrderModal({ open, onClose }) {
  const [form, setForm] = useState({ patient: '', testName: '', notes: '' });
  const [error, setError] = useState('');
  const { data: patientsData } = usePatients({ page: 1, limit: 100 });
  const create = useCreateLabOrderMutation();
  const patients = useMemo(() => patientsData?.items ?? [], [patientsData]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.patient || !form.testName) {
      setError('Patient and test name are required');
      return;
    }
    try {
      await create.mutateAsync({
        patient: form.patient,
        testName: form.testName,
        notes: form.notes || void 0,
      });
      onClose();
      setForm({ patient: '', testName: '', notes: '' });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New lab order"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={create.isPending}>
            Create order
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div>
          <label className="label" htmlFor="lab-patient">
            Patient
          </label>
          <select
            id="lab-patient"
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
        <Input
          label="Test name"
          name="testName"
          placeholder="e.g. Complete Blood Count"
          required
          value={form.testName}
          onChange={(e) => setForm({ ...form, testName: e.target.value })}
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
function CompleteLabOrderModal({ order, onClose }) {
  const [results, setResults] = useState([
    { parameter: '', value: '', unit: '', referenceRange: '' },
  ]);
  const [error, setError] = useState('');
  const complete = useCompleteLabOrderMutation();
  const updateRow = (index, patch) =>
    setResults((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const addRow = () =>
    setResults((prev) => [...prev, { parameter: '', value: '', unit: '', referenceRange: '' }]);
  const removeRow = (index) => setResults((prev) => prev.filter((_, i) => i !== index));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const valid = results
      .filter((r) => r.parameter.trim() && r.value.trim())
      .map((r) => ({
        parameter: r.parameter.trim(),
        value: r.value.trim(),
        unit: r.unit.trim() || void 0,
        referenceRange: r.referenceRange.trim() || void 0,
      }));
    if (valid.length === 0) {
      setError('Add at least one result with a parameter and value');
      return;
    }
    try {
      await complete.mutateAsync({ id: order._id, results: valid });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };
  return (
    <Modal
      open
      onClose={onClose}
      title={`Results \u2014 ${order.testName}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={complete.isPending}>
            Mark completed
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-500">
          Recording results for{' '}
          <span className="font-medium text-slate-700">{refName(order.patient)}</span>.
        </p>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="space-y-3">
          {results.map((row, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-5"
            >
              <Input
                label="Parameter"
                name={`param-${index}`}
                placeholder="Hemoglobin"
                value={row.parameter}
                onChange={(e) => updateRow(index, { parameter: e.target.value })}
              />
              <Input
                label="Value"
                name={`val-${index}`}
                placeholder="14.2"
                value={row.value}
                onChange={(e) => updateRow(index, { value: e.target.value })}
              />
              <Input
                label="Unit"
                name={`unit-${index}`}
                placeholder="g/dL"
                value={row.unit}
                onChange={(e) => updateRow(index, { unit: e.target.value })}
              />
              <Input
                label="Reference"
                name={`ref-${index}`}
                placeholder="13–17"
                value={row.referenceRange}
                onChange={(e) => updateRow(index, { referenceRange: e.target.value })}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => removeRow(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-3.5 w-3.5" /> Add result
        </Button>
      </form>
    </Modal>
  );
}
export default Lab;
