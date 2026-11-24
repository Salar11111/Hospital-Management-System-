import { useMemo, useState } from 'react';
import { ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react';
import {
  useCreateStaffMutation,
  useRemoveStaffMutation,
  useUpdateStaffStatusMutation,
  useUsers,
} from '../hooks';
import { PageHeader } from '../components/PageHeader';
import { PageLoader } from '../components/guards';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { getErrorMessage } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { ROLES } from '../lib/types';
const STAFF_ROLES = [
  ROLES.ADMIN,
  ROLES.DOCTOR,
  ROLES.NURSE,
  ROLES.RECEPTIONIST,
  ROLES.PHARMACIST,
  ROLES.LABTECH,
];
function Staff() {
  const currentUser = useAuthStore((s) => s.user);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUsers({
    page,
    limit: 15,
    role: role || void 0,
    search: search || void 0,
  });
  const users = useMemo(() => data?.items ?? [], [data]);
  const updateStatus = useUpdateStaffStatusMutation();
  const remove = useRemoveStaffMutation();
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState(null);
  const isSelf = (user) => user._id === currentUser?._id;
  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle="Manage hospital personnel accounts"
        action={
          <Button onClick={() => setCreating(true)}>
            <UserPlus className="h-4 w-4" /> Add staff
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          name="search"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-72"
        />
        <select
          className="input w-52"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All roles</option>
          {STAFF_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : users.length === 0 ? (
        <Card>
          <EmptyState icon={Users} title="No staff found" />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">Name</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Department</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70">
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                          {u.name.charAt(0)}
                        </span>
                        <span className="font-medium text-slate-800">{u.name}</span>
                        {isSelf(u) && <Badge>You</Badge>}
                      </div>
                    </td>
                    <td className="table-td text-slate-500">{u.email}</td>
                    <td className="table-td">
                      <Badge tone={u.role === ROLES.ADMIN ? 'teal' : 'blue'}>{u.role}</Badge>
                    </td>
                    <td className="table-td text-slate-500">{u.department ?? '\u2014'}</td>
                    <td className="table-td">
                      <Badge tone={u.isActive ? 'green' : 'red'}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>
                    <td className="table-td text-right">
                      {!isSelf(u) && u.role !== ROLES.ADMIN && (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant={u.isActive ? 'outline' : 'secondary'}
                            loading={updateStatus.isPending}
                            onClick={() =>
                              updateStatus.mutate({ id: u._id, isActive: !u.isActive })
                            }
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => setRemoving(u)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
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

      <CreateStaffModal open={creating} onClose={() => setCreating(false)} />

      <ConfirmDialog
        open={!!removing}
        title="Delete staff account"
        message={`Delete the account for ${removing?.name ?? ''}? This cannot be undone.`}
        confirmLabel="Delete account"
        loading={remove.isPending}
        onConfirm={async () => {
          if (!removing) return;
          try {
            await remove.mutateAsync(removing._id);
          } finally {
            setRemoving(null);
          }
        }}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
function CreateStaffModal({ open, onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.NURSE,
    phone: '',
    department: '',
    gender: '',
  });
  const [error, setError] = useState('');
  const create = useCreateStaffMutation();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await create.mutateAsync({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone || void 0,
        department: form.department || void 0,
        gender: form.gender || void 0,
      });
      onClose();
      setForm({
        name: '',
        email: '',
        password: '',
        role: ROLES.NURSE,
        phone: '',
        department: '',
        gender: '',
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add staff account"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={create.isPending}>
            <ShieldCheck className="h-4 w-4" /> Create account
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            name="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <div>
            <label className="label" htmlFor="staff-role">
              Role
            </label>
            <select
              id="staff-role"
              className="input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {[ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.PHARMACIST, ROLES.LABTECH].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label="Department"
            name="department"
            placeholder="e.g. Cardiology"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
}
export default Staff;
