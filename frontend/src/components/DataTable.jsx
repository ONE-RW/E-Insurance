import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import EmptyState from "./EmptyState";

/**
 * Generic sortable/paginated table.
 *
 * columns: [{ key, header, render?(row), sortable? }]
 * data: array of rows
 *
 * By default pagination and sorting are handled client-side. For server-side
 * pagination (e.g. activity logs), pass `page`, `onPageChange` and `total` —
 * the table will then treat `data` as already being the current page and
 * will not attempt to sort or slice it further.
 */
export default function DataTable({
  columns,
  data = [],
  rowKey = (row) => row.id,
  pageSize = 10,
  page: controlledPage,
  onPageChange,
  total: controlledTotal,
  emptyMessage = "No records found.",
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [internalPage, setInternalPage] = useState(1);

  const isControlled = controlledPage !== undefined && typeof onPageChange === "function";
  const page = isControlled ? controlledPage : internalPage;
  const setPage = isControlled ? onPageChange : setInternalPage;

  const sorted = useMemo(() => {
    if (isControlled || !sortKey) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, sortKey, sortDir, isControlled]);

  const total = isControlled ? controlledTotal ?? data.length : sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageData = isControlled ? data : sorted.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(col) {
    if (isControlled || col.sortable === false) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
  }

  if (!data.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col)}
                  className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 ${
                    !isControlled && col.sortable !== false ? "cursor-pointer select-none hover:text-gray-700" : ""
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {sortKey === col.key &&
                      (sortDir === "asc" ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageData.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3 text-gray-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
