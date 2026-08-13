import { useQuery } from "@tanstack/react-query";
import { Building2, Car, FileText, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import { getCompanies } from "../../api/companies";
import { getUsers } from "../../api/users";
import { getVehicles } from "../../api/vehicles";
import { getPolicies } from "../../api/policies";
import Spinner from "../../components/Spinner";
import StatCard from "../../components/StatCard";

export default function Dashboard() {
  const companies = useQuery({ queryKey: ["companies"], queryFn: getCompanies });
  const users = useQuery({ queryKey: ["users"], queryFn: () => getUsers() });
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: () => getVehicles() });
  const policies = useQuery({ queryKey: ["policies"], queryFn: () => getPolicies() });

  const loading = companies.isLoading || users.isLoading || vehicles.isLoading || policies.isLoading;
  const activePolicies = policies.data?.filter((p) => p.status === "active").length ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">System-wide overview of E-Assurance data.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Insurance Companies" value={companies.data?.length ?? 0} icon={Building2} />
          <StatCard label="System Users" value={users.data?.length ?? 0} icon={Users} />
          <StatCard label="Registered Vehicles" value={vehicles.data?.length ?? 0} icon={Car} />
          <StatCard label="Active Policies" value={activePolicies} accent="text-green-700" icon={ShieldCheck} />
        </div>
      )}
    </div>
  );
}
