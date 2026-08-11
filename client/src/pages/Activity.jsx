import { useMemo, useState } from 'react';
import { Activity as ActivityIcon, MonitorSmartphone } from 'lucide-react';
import { useAuditLogs } from '../hooks';
import { PageHeader } from '../components/PageHeader';
import { PageLoader } from '../components/guards';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
import { formatDateTime } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import { ROLES } from '../lib/types';
function Activity() {
  const user = useAuthStore((s) => s.user);
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAuditLogs({ page, limit: 20, action: action || void 0 });
  const logs = useMemo(() => data?.items ?? [], [data]);
  const actions = useMemo(
    () => Array.from(new Set((data?.items ?? []).map((l) => l.action))).sort(),
    // actions list from the full page set is limited; expand across pages would need an endpoint. Keep simple.
    [data]
  );
  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="A trail of administrative actions recorded in the system"
      />

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm text-slate-500">Action</label>
        <select
          className="input w-56"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : logs.length === 0 ? (
        <Card>
          <EmptyState
            icon={ActivityIcon}
            title="No activity recorded"
            description="Administrative actions will appear here."
          />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">Time</th>
                  <th className="table-th">User</th>
                  <th className="table-th">Action</th>
                  <th className="table-th">Resource</th>
                  <th className="table-th">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/70">
                    <td className="table-td whitespace-nowrap">{formatDateTime(l.createdAt)}</td>
                    <td className="table-td">
                      <span className="font-medium text-slate-800">{l.user?.name ?? '\u2014'}</span>
                      {user?.role === ROLES.ADMIN && l.user?.email && (
                        <span className="block text-xs text-slate-400">{l.user.email}</span>
                      )}
                    </td>
                    <td className="table-td">
                      <Badge
                        tone={
                          l.action.startsWith('login') || l.action.startsWith('logout')
                            ? 'blue'
                            : 'gray'
                        }
                      >
                        {l.action}
                      </Badge>
                    </td>
                    <td className="table-td">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <MonitorSmartphone className="h-3.5 w-3.5 text-slate-400" /> {l.resource}
                      </span>
                    </td>
                    <td className="table-td font-mono text-xs text-slate-500">
                      {l.ip ?? '\u2014'}
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
    </div>
  );
}
export default Activity;
