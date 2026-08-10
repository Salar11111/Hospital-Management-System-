import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Users } from 'lucide-react';
import { usePatients } from '../hooks';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/Pagination';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { PageLoader } from '../components/guards';

export default function Patients() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = usePatients({ page, limit: 15, search: query || undefined });

  const patients = useMemo(() => data?.items ?? [], [data]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle="Search and manage patient records"
        action={
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              name="search"
              placeholder="Search name, ID, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72"
            />
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        }
      />

      {isLoading ? (
        <PageLoader />
      ) : patients.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No patients found"
            description="Try adjusting your search or check back later."
          />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">Patient ID</th>
                  <th className="table-th">Name</th>
                  <th className="table-th">Phone</th>
                  <th className="table-th">Blood Group</th>
                  <th className="table-th">Gender</th>
                  <th className="table-th" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70">
                    <td className="table-td font-mono text-xs text-slate-500">{p.patientId}</td>
                    <td className="table-td font-medium text-slate-800">{p.name}</td>
                    <td className="table-td">{p.contact?.phone ?? '—'}</td>
                    <td className="table-td">
                      <Badge tone={p.bloodGroup && p.bloodGroup !== 'Unknown' ? 'blue' : 'gray'}>
                        {p.bloodGroup ?? 'Unknown'}
                      </Badge>
                    </td>
                    <td className="table-td text-slate-600">{p.gender ?? '—'}</td>
                    <td className="table-td text-right">
                      <Link
                        to={`/patients/${p._id}`}
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
          {isFetching && <p className="px-4 pb-3 text-right text-xs text-slate-400">Updating…</p>}
        </Card>
      )}
    </div>
  );
}