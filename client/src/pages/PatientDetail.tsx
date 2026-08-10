import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Droplets, FileText, FlaskConical, Mail, Pencil, Phone, Pill, Plus } from 'lucide-react';
import {
  useCreateRecordMutation,
  usePatient,
  usePatientHistory,
  useUpdatePatientMutation,
} from '../hooks';
import { PageHeader } from '../components/PageHeader';
import { PageLoader } from '../components/guards';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { statusTone } from '../lib/badgeTone';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Input';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { getErrorMessage } from '../lib/api';
import { formatDate, refName } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import { ROLES } from '../lib/types';

function InfoRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-sm text-slate-800">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function PatientDetail() {
  const { id = '' } = useParams();
  const user = useAuthStore((s) => s.user);
  const { data: patient, isLoading } = usePatient(id);
  const { data: history, isLoading: historyLoading } = usePatientHistory(id);
  const updateMutation = useUpdatePatientMutation();
  const createRecordMutation = useCreateRecordMutation();

  const [editing, setEditing] = useState(false);
  const [addingRecord, setAddingRecord] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    dob: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    allergies: '',
    provider: '',
    policyNumber: '',
    expiryDate: '',
  });

  const openEdit = () => {
    if (!patient) return;
    setError('');
    setForm({
      dob: patient.dob ? String(patient.dob).slice(0, 10) : '',
      gender: patient.gender ?? '',
      bloodGroup: patient.bloodGroup ?? '',
      phone: patient.contact?.phone ?? '',
      email: patient.contact?.email ?? '',
      address: patient.contact?.address ?? '',
      emergencyContact: patient.contact?.emergencyContact ?? '',
      allergies: (patient.allergies ?? []).join(', '),
      provider: patient.insurance?.provider ?? '',
      policyNumber: patient.insurance?.policyNumber ?? '',
      expiryDate: patient.insurance?.expiryDate ? String(patient.insurance.expiryDate).slice(0, 10) : '',
    });
    setEditing(true);
  };

  const saveEdit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      dob: form.dob || undefined,
      gender: form.gender || undefined,
      bloodGroup: form.bloodGroup || undefined,
      contact: {
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        emergencyContact: form.emergencyContact || undefined,
      },
      allergies: form.allergies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      insurance: {
        provider: form.provider || undefined,
        policyNumber: form.policyNumber || undefined,
        expiryDate: form.expiryDate || undefined,
      },
    };
    try {
      await updateMutation.mutateAsync({ id, payload });
      setEditing(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const [recordForm, setRecordForm] = useState({
    diagnosis: '',
    symptoms: '',
    notes: '',
    bp: '',
    temperature: '',
  });

  const saveRecord = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createRecordMutation.mutateAsync({
        patient: id,
        diagnosis: recordForm.diagnosis,
        symptoms: recordForm.symptoms,
        notes: recordForm.notes || undefined,
        vitals: { bp: recordForm.bp || undefined, temperature: recordForm.temperature || undefined },
      });
      setAddingRecord(false);
      setRecordForm({ diagnosis: '', symptoms: '', notes: '', bp: '', temperature: '' });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (isLoading) return <PageLoader />;
  if (!patient) {
    return (
      <div>
        <PageHeader title="Patient" />
        <Card>
          <EmptyState icon={Phone} title="Patient not found" description="This record may have been removed." />
        </Card>
      </div>
    );
  }

  const isDoctor = user?.role === ROLES.DOCTOR;
  const records = history?.medicalRecords ?? [];
  const labOrders = history?.labOrders ?? [];
  const prescriptions = history?.prescriptions ?? [];

  return (
    <div>
      <PageHeader
        title={patient.name}
        subtitle={`Patient ${patient.patientId}`}
        action={
          <Button variant="outline" onClick={openEdit}>
            <Pencil className="h-4 w-4" /> Edit profile
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-700">
                  {patient.name.charAt(0)}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{patient.name}</p>
                  <p className="font-mono text-xs text-slate-500">{patient.patientId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow icon={Droplets} label="Blood Group" value={patient.bloodGroup} />
                <InfoRow icon={Calendar} label="DOB" value={formatDate(patient.dob)} />
                <InfoRow icon={Phone} label="Phone" value={patient.contact?.phone} />
                <InfoRow icon={Mail} label="Email" value={patient.contact?.email} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Address</p>
                <p className="text-sm text-slate-800">{patient.contact?.address || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Emergency Contact</p>
                <p className="text-sm text-slate-800">{patient.contact?.emergencyContact || '—'}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Allergies</p>
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies && patient.allergies.length > 0 ? (
                    patient.allergies.map((a) => (
                      <Badge key={a} tone="red">
                        {a}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">None recorded</span>
                  )}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Insurance</p>
                <p className="mt-1 text-sm text-slate-800">{patient.insurance?.provider || 'No insurance on file'}</p>
                {patient.insurance?.policyNumber && (
                  <p className="text-xs text-slate-500">Policy {patient.insurance.policyNumber}</p>
                )}
              </div>
            </CardBody>
          </Card>

          {isDoctor && (
            <Button className="w-full" onClick={() => { setError(''); setAddingRecord(true); }}>
              <Plus className="h-4 w-4" /> Add Medical Record
            </Button>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" /> Medical Records
              </CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {historyLoading ? (
                <PageLoader />
              ) : records.length === 0 ? (
                <EmptyState icon={FileText} title="No medical records yet" />
              ) : (
                <div className="divide-y divide-slate-100">
                  {records.map((r) => (
                    <div key={r._id} className="px-5 py-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-800">{r.diagnosis}</p>
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
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-slate-400" /> Prescriptions
              </CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {historyLoading ? (
                <PageLoader />
              ) : prescriptions.length === 0 ? (
                <EmptyState icon={Pill} title="No prescriptions" />
              ) : (
                <div className="divide-y divide-slate-100">
                  {prescriptions.map((p) => (
                    <div key={p._id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {p.items.map((i) => i.name).join(', ')}
                        </p>
                        <p className="text-xs text-slate-500">
                          Dr. {refName(p.doctor)} · {formatDate(p.createdAt)}
                        </p>
                      </div>
                      <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-slate-400" /> Lab Orders
              </CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {historyLoading ? (
                <PageLoader />
              ) : labOrders.length === 0 ? (
                <EmptyState icon={FlaskConical} title="No lab orders" />
              ) : (
                <div className="divide-y divide-slate-100">
                  {labOrders.map((l) => (
                    <div key={l._id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{l.testName}</p>
                        <p className="text-xs text-slate-500">
                          Dr. {refName(l.doctor)} · {formatDate(l.createdAt)}
                        </p>
                      </div>
                      <Badge tone={statusTone(l.status)}>{l.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit patient profile"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} loading={updateMutation.isPending}>
              Save changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Date of birth" name="dob" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            <Input label="Gender" name="gender" placeholder="Male / Female / Other" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
            <Input label="Blood group" name="bloodGroup" placeholder="A+, O-…" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
            <Input label="Phone" name="phone" placeholder="+1 555 000 0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Emergency contact" name="emergencyContact" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
          </div>
          <Input label="Address" name="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Allergies (comma separated)" name="allergies" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Insurance provider" name="provider" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
            <Input label="Policy number" name="policyNumber" value={form.policyNumber} onChange={(e) => setForm({ ...form, policyNumber: e.target.value })} />
            <Input label="Policy expiry" name="expiryDate" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          </div>
        </div>
      </Modal>

      <Modal
        open={addingRecord}
        onClose={() => setAddingRecord(false)}
        title="Add medical record"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddingRecord(false)}>
              Cancel
            </Button>
            <Button onClick={saveRecord} loading={createRecordMutation.isPending}>
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
            value={recordForm.diagnosis}
            onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
          />
          <Textarea
            label="Symptoms"
            name="symptoms"
            required
            value={recordForm.symptoms}
            onChange={(e) => setRecordForm({ ...recordForm, symptoms: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Blood pressure" name="bp" placeholder="120/80" value={recordForm.bp} onChange={(e) => setRecordForm({ ...recordForm, bp: e.target.value })} />
            <Input label="Temperature" name="temperature" placeholder="98.6°F" value={recordForm.temperature} onChange={(e) => setRecordForm({ ...recordForm, temperature: e.target.value })} />
          </div>
          <Textarea
            label="Notes"
            name="notes"
            value={recordForm.notes}
            onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}