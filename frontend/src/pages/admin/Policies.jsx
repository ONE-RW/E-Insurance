import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { getPolicies } from "../../api/policies";
import { getCompanies } from "../../api/companies";
import DataTable from "../../components/DataTable";
import SearchableSelect from "../../components/SearchableSelect";
import StatusBadge from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

export default function Policies() {
  const [companyFilter, setCompanyFilter] = useState("");

  const { data: companies } = useQuery({ queryKey: ["companies"], queryFn: getCompanies });

  const { data: policies, isLoading } = useQuery({
    queryKey: ["policies", { insurance_company_id: companyFilter }],
    queryFn: () => getPolicies(companyFilter ? { insurance_company_id: companyFilter } : {}),
  });

  const columns = [
    { key: "policy_number", header: "Policy #" },
    { key: "vehicle", header: "Plate", render: (row) => row.vehicle?.plate_number || "-" },
    {
      key: "owner",
      header: "Owner",
      render: (row) => row.vehicle?.owner_name || "-",
    },
    { key: "company", header: "Insurer", render: (row) => row.insurance_company?.name || "-" },
    { key: "coverage_type", header: "Coverage" },
    { key: "start_date", header: "Start", render: (row) => formatDate(row.start_date) },
    { key: "end_date", header: "End", render: (row) => formatDate(row.end_date) },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Policies</h1>
          <p className="mt-1 text-sm text-gray-500">All insurance policies across every company.</p>
        </div>
      </div>

      <div className="mt-6 max-w-xs">
        <SearchableSelect
          label="Filter by company"
          id="companyFilter"
          allowClear
          placeholder="All companies"
          value={companyFilter}
          onChange={setCompanyFilter}
          options={(companies || []).map((c) => ({ id: c.id, label: c.name }))}
          wrapperClassName="mb-0"
        />
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={policies || []} emptyMessage="No policies found." />
        )}
      </div>
    </div>
  );
}
