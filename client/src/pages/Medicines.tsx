import { useMemo, useState, type FormEvent } from 'react';
import { PackagePlus, Pencil, Pill, Search, Trash2 } from 'lucide-react';
import {
  useCreateMedicineMutation,
  useMedicines,
  useRemoveMedicineMutation,
  useUpdateMedicineMutation,
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
import { formatDate, formatCurrency } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import { ROLES, type Medicine } from '../lib/types';

export default function Medicines() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === ROLES.ADMIN;
  const isPharmacist = user?.role === ROLES.PHARMACIST;
  const canManage = isAdmin || isPharmacist;

  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMedicines({
    page,
    limit: 15,
    search: query || undefined,
    lowStock: lowStock ? 'true' : undefined,
  });

  const medicines = useMemo(() => data?.items ?? [], [data]);
  const remove = useRemoveMedicineMutation();

  const [editing, setEditing] = useState<Medicine | null>(null);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<Medicine | null>(null);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  return (
    <div>
      <PageHeader
        title="Pharmacy"
        subtitle="Manage the medicine inventory"
        action={
          canManage ? (
            <Button onClick={() => setCreating(true)}>
              <PackagePlus className="h-4 w-4" /> Add medicine
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input
            name="search"
            placeholder="Search by name, generic, category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72"
          />
          <Button type="submit" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-primary-600"
            checked={lowStock}
            onChange={(e) => {
              setLowStock(e.target.checked);
              setPage(1);
            }}
          />
          Low stock only
        </label>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : medicines.length === 0 ? (
        <Card>
          <EmptyState icon={Pill} title="No medicines found" />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">Medicine</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Stock</th>
                  <th className="table-th">Price</th>
                  <th className="table-th">Expiry</th>
                  {canManage && <th className="table-th text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {medicines.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/70">
                    <td className="table-td">
                      <div>
                        <p className="font-medium text-slate-800">{m.name}</p>
                        {m.genericName && <p className="text-xs text-slate-400">{m.genericName}</p>}
                      </div>
                    </td>
                    <td className="table-td">
                      <Badge tone="violet">{m.category ?? 'General'}</Badge>
                    </td>
                    <td className="table-td">
                      <Badge tone={m.stockQuantity <= (m.reorderLevel ?? 10) ? 'red' : 'green'}>
                        {m.stockQuantity}
                      </Badge>
                    </td>
                    <td className="table-td">{formatCurrency(m.price)}</td>
                    <td className="table-td text-slate-500">{formatDate(m.expiryDate)}</td>
                    {canManage && (
                      <td className="table-td text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => setEditing(m)}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>
                          {isAdmin && (
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setRemoving(m)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </Card>
      )}

      {creating && <MedicineFormModal title="Add medicine" onClose={() => setCreating(false)} />}
      {editing && (
        <MedicineFormModal
          title="Edit medicine"
          medicine={editing}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={!!removing}
        title="Remove medicine"
        message={`Remove "${removing?.name ?? ''}" from the inventory? Its stock will be set to zero.`}
        confirmLabel="Remove"
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

const INITIAL_FORM = {
  name: '',
  genericName: '',
  category: '',
  stockQuantity: '0',
  price: '0',
  expiryDate: '',
  supplier: '',
  reorderLevel: '10',
};

function MedicineFormModal({
  title,
  medicine,
  onClose,
}: {
  title: string;
  medicine?: Medicine;
  onClose: () => void;
}) {
  const [form, setForm] = useState(() =>
    medicine
      ? {
          name: medicine.name,
          genericName: medicine.genericName ?? '',
          category: medicine.category ?? '',
          stockQuantity: String(medicine.stockQuantity ?? 0),
          price: String(medicine.price ?? 0),
          expiryDate: medicine.expiryDate ? String(medicine.expiryDate).slice(0, 10) : '',
          supplier: medicine.supplier ?? '',
          reorderLevel: String(medicine.reorderLevel ?? 10),
        }
      : INITIAL_FORM
  );
  const [error, setError] = useState('');
  const create = useCreateMedicineMutation();
  const update = useUpdateMedicineMutation();
  const loading = create.isPending || update.isPending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      genericName: form.genericName || undefined,
      category: form.category || undefined,
      stockQuantity: Number(form.stockQuantity),
      price: Number(form.price),
      expiryDate: form.expiryDate || undefined,
      supplier: form.supplier || undefined,
      reorderLevel: Number(form.reorderLevel),
    };
    try {
      if (medicine) {
        await update.mutateAsync({ id: medicine._id, payload });
      } else {
        await create.mutateAsync({
          name: form.name,
          ...payload,
        });
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Save medicine
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            name="name"
            required={!medicine}
            disabled={!!medicine}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Generic name"
            name="genericName"
            value={form.genericName}
            onChange={(e) => setForm({ ...form, genericName: e.target.value })}
          />
          <Input
            label="Category"
            name="category"
            placeholder="e.g. Antibiotic"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <Input
            label="Supplier"
            name="supplier"
            value={form.supplier}
            onChange={(e) => setForm({ ...form, supplier: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <Input
            label="Stock quantity"
            name="stockQuantity"
            type="number"
            min={0}
            required
            value={form.stockQuantity}
            onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
          />
          <Input
            label="Price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <Input
            label="Reorder level"
            name="reorderLevel"
            type="number"
            min={0}
            value={form.reorderLevel}
            onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
          />
          <Input
            label="Expiry date"
            name="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
}