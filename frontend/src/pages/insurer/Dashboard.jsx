import { useQuery } from "@tanstack/react-query";
import { Clock, FileText, LayoutDashboard, ShieldCheck, XCircle } from "lucide-react";
import { getPolicies } from "../../api/policies";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/Spinner";
import StatCard from "../../components/StatCard";

const DAY_MS = 1000 * 60 * 60 * 24;

export default function Dashboard() {
  const { user } = useAuth();
  const { data: policies, isLoading } = useQuery({
    queryKey: ["policies", { insurance_company_id: user?.insurance_company_id }],
    queryFn: () => getPolicies(),
  });

  const now = Date.now();
  const active = policies?.filter((p) => p.status === "active") || [];
  const expiringSoon = active.filter((p) => {
    const end = new Date(p.end_date).getTime();
    const daysLeft = (end - now) / DAY_MS;
    return daysLeft >= 0 && daysLeft <= 30;
  });
  const cancelled = policies?.filter((p) => p.status === "cancelled") || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Insurer Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user?.insurance_company_name ? `Overview for ${user.insurance_company_name}.` : "Overview of your policies."}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Policies" value={policies?.length ?? 0} icon={FileText} />
          <StatCard label="Active Policies" value={active.length} accent="text-green-700" icon={ShieldCheck} />
          <StatCard
            label="Expiring Soon (30 days)"
            value={expiringSoon.length}
            accent="text-amber-600"
            icon={Clock}
          />
          <StatCard label="Cancelled Policies" value={cancelled.length} accent="text-red-600" icon={XCircle} />
        </div>
      )}
    </div>
  );
}
