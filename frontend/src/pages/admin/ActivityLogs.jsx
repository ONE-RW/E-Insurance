import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Filter, History } from "lucide-react";
import { getLogs } from "../../api/logs";
import { getUsers } from "../../api/users";
import DataTable from "../../components/DataTable";
import FormField from "../../components/FormField";
import Spinner from "../../components/Spinner";
import { ActionCell, formatDateTime } from "../../utils/activityDisplay";

const ROLES = ["admin", "insurer", "officer"];
const PAGE_LIMIT = 20;

const emptyFilters = { user_id: "", role: "", action: "", from: "", to: "" };

export default function ActivityLogs() {
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);

  const { data: users } = useQuery({ queryKey: ["users"], queryFn: () => getUsers() });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["logs", appliedFilters, page],
    queryFn: () =>
      getLogs({
        ...Object.fromEntries(Object.entries(appliedFilters).filter(([, v]) => v)),
        page,
        limit: PAGE_LIMIT,
      }),
    placeholderData: keepPreviousData,
  });

  function handleFilterSubmit(e) {
    e.preventDefault();
    setAppliedFilters(filters);
    setPage(1);
  }

  function clearFilters() {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  }

  const columns = [
    { key: "created_at", header: "Timestamp", render: (row) => formatDateTime(row.created_at) },
    {
      key: "user",
      header: "Actor",
      render: (row) => (row.user ? `${row.user.full_name} (${row.user.role})` : "System"),
    },
    { key: "action", header: "Action", render: (row) => <ActionCell action={row.action} /> },
    {
      key: "target",
      header: "Target",
      render: (row) => (row.target_type ? `${row.target_type}${row.target_id ? ` #${row.target_id}` : ""}` : "-"),
    },
    { key: "ip_address", header: "IP Address" },
  ];

  const logs = data?.logs || [];
  const total = data?.total ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
          <History className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Activity Logs</h1>
          <p className="mt-1 text-sm text-gray-500">Full audit trail of actions taken across the system.</p>
        </div>
      </div>

      <form onSubmit={handleFilterSubmit} className="mt-6 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <FormField
          as="select"
          label="User"
          id="user_id"
          wrapperClassName="mb-0"
          value={filters.user_id}
          onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
        >
          <option value="">All users</option>
          {(users || []).map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name}
            </option>
          ))}
        </FormField>
        <FormField
          as="select"
          label="Role"
          id="role"
          wrapperClassName="mb-0"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </FormField>
        <FormField
          label="Action"
          id="action"
          wrapperClassName="mb-0"
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          placeholder="e.g. create_policy"
        />
        <FormField
          label="From"
          id="from"
          type="date"
          wrapperClassName="mb-0"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
        />
        <FormField
          label="To"
          id="to"
          type="date"
          wrapperClassName="mb-0"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
        />
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
          >
            <Filter className="h-4 w-4" />
            Apply Filters
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </form>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className={isFetching ? "opacity-60 transition" : ""}>
            <DataTable
              columns={columns}
              data={logs}
              page={page}
              onPageChange={setPage}
              total={total}
              pageSize={PAGE_LIMIT}
              emptyMessage="No activity found for the selected filters."
            />
          </div>
        )}
      </div>
    </div>
  );
}
