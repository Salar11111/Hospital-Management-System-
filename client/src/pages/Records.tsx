import { useMemo, useState, type FormEvent } from 'react';
import { FileText, Plus, Search, Users } from 'lucide-react';
import { usePatientRecords, usePatients, useCreateRecordMutation } from '../hooks';
import { PageHeader } from '../components/PageHeader';
import { PageLoader } from '../components/guards';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { getErrorMessage } from '../lib/api';
import { formatDate, refName } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import { ROLES } from '../lib/types';

export default function Records() {
  const user = useAuthStore((s) => s.user);
  const isDoctor = user?.role === ROLES.DOCTOR;

  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [patientId, setPatientId] = useState('');

  const { data: patientPage, isLoading: searching } = usePatients(query ? { search: query, page: 1, limit: 8 } : undefined);
  const { data: records, isLoading: recordsLoading } = usePatientRecords(patientId);

  const results = useMemo(() => patientPage?.items ?? [], [patientPage]);

  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const createRecord = useCreateRecordMutation();
  const [form, setForm] = useState({ diagnosis: '', symptoms: '', notes: '', bp: '', temperature: '' });

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setQuery(search.trim());
  };

  const saveRecord = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createRecord.mutateAsync({
        patient: patientId,
        diagnosis: form.diagnosis,
        symptoms: form.symptoms,
        notes: form.notes || undefined,
        vitals: { bp: form.bp || undefined, temperature: form.temperature || undefined },
      });
      setAdding(false);
      setForm({ diagnosis: '', symptoms: '', notes: '', bp: '', temperature: '' });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Medical Records"
        subtitle="Search a patient to view or add medical records"
        action={
          patientId ? (
            <Button onClick={() => { setError(''); setAdding(true); }}>
              <Plus className="h-4 w-4" /> Add record
            </Button>
          ) : undefined
        }
      />

      <Card className="mb-6">
        <CardBody>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              name="search"
              placeholder="Search by patient name, ID, phone or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline" loading={searching}>
              <Search className="h-4 w-4" />
            </Button>
          </form>
          {results.length > 0 && (
            <ul className="mt-3 divide-y divide-slate-100">
              {results.map((p) => (
                <li key={p._id}>
                  <button
                    type="button"
                    onClick={() => setPatientId(p._id)}
                    className={`flex w-full items-center justify-between px-2 py-2.5 text-left hover:bg-slate-50 ${
                      patientId === p._id ? 'rounded-lg bg-primary-50' : ''
                    }`}
                  >
                    <span className="font-medium text-slate-800">{p.name}</span>
                    <span className="text-xs text-slate-400">
                      {p.patientId} · {p.contact?.phone ?? '—'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {!patientId ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Select a patient"
            description="Search above and choose a patient to view their medical records."
          />
        </Card>
      ) : recordsLoading ? (
        <PageLoader />
      ) : records && records.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" /> Records
            </CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100">
              {records.map((r) => (
                <div key={r._id} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{r.diagnosis}</p>
                    <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{r.symptoms}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Dr. {refName(r.doctor)}
                    {r.vitals?.bp ? ` · BP ${r.vitals.bp}` : ''}
                    {r.vitals?.temperature ? ` · Temp ${r.vitals.temperature}` : ''}
                  </p>
                  {r.notes && <p className="mt-2 rounded-lg bg-slate-50 p-2 text-sm text-slate-600">{r.notes}</p>}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={FileText}
            title="No medical records"
            description="This patient has no medical records yet."
            action={
              isDoctor ? (
                <Button onClick={() => { setError(''); setAdding(true); }}>
                  <Plus className="h-4 w-4" /> Add the first record
                </Button>
              ) : undefined
            }
          />
        </Card>
      )}

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add medical record"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button onClick={saveRecord} loading={createRecord.isPending}>
              Save record
            </Button>
          </>
        }
      >
        <form onSubmit={saveRecord} className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Input
            label="Diagnosis"
            name="diagnosis"
            required
            value={form.diagnosis}
            onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
          />
          <Textarea
            label="Symptoms"
            name="symptoms"
            required
            value={form.symptoms}
            onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Blood pressure" name="bp" placeholder="120/80" value={form.bp} onChange={(e) => setForm({ ...form, bp: e.target.value })} />
            <Input label="Temperature" name="temperature" placeholder="98.6°F" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} />
          </div>
          <Textarea label="Notes" name="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  );
}