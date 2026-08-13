import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Calendar,
  Car,
  FileText,
  Hash,
  IdCard,
  Search,
  SearchX,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { searchByPlate, searchByTin } from "../../api/search";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import FormField from "../../components/FormField";

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function DaysRemaining({ days }) {
  if (days === undefined || days === null) return null;
  if (days < 0) {
    return (
      <span className="text-sm font-semibold text-red-600">
        Expired {Math.abs(days)} day{Math.abs(days) === 1 ? "" : "s"} ago
      </span>
    );
  }
  const amber = days <= 30;
  return (
    <span className={`text-sm font-semibold ${amber ? "text-amber-600" : "text-green-700"}`}>
      {days} day{days === 1 ? "" : "s"} remaining
    </span>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-800">{children}</dd>
    </div>
  );
}

function ResultCard({ vehicle, insured, policy }) {
  if (!vehicle) {
    return <EmptyState message="No record found for this search." icon={<SearchX className="mb-3 h-10 w-10 text-gray-300" />} />;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Plate Number</p>
          <p className="text-xl font-bold text-navy-900">{vehicle.plate_number}</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold tracking-wide ${
            insured ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {insured ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
          {insured ? "INSURED" : "NOT INSURED"}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <Field icon={Car} label="Make / Model">
          {vehicle.make} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ""}
        </Field>
        <Field icon={User} label="Owner">
          {vehicle.owner_name}
        </Field>
        <Field icon={IdCard} label="Owner TIN">
          {vehicle.owner_tin}
        </Field>
        <Field icon={Hash} label="Chassis Number">
          {vehicle.chassis_number || "-"}
        </Field>
      </dl>

      {policy && (
        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Policy Details</p>
          <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            <Field icon={Building2} label="Insurance Company">
              <span className="font-semibold text-navy-900">{policy.insurance_company?.name}</span>
            </Field>
            <Field icon={FileText} label="Policy Number">
              {policy.policy_number}
            </Field>
            <Field icon={ShieldCheck} label="Coverage Type">
              <span className="capitalize">{policy.coverage_type}</span>
            </Field>
            <Field icon={Calendar} label="Expiry Date">
              {formatDate(policy.end_date)}
            </Field>
          </div>
          <div className="mt-3">
            <DaysRemaining days={policy.days_remaining} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchVehicle() {
  const [mode, setMode] = useState("plate");
  const [input, setInput] = useState("");
  const [query, setQuery] = useState(null);

  const plateQuery = useQuery({
    queryKey: ["search", "plate", query?.value],
    queryFn: () => searchByPlate(query.value),
    enabled: query?.mode === "plate",
  });

  const tinQuery = useQuery({
    queryKey: ["search", "tin", query?.value],
    queryFn: () => searchByTin(query.value),
    enabled: query?.mode === "tin",
  });

  const activeQuery = mode === "plate" ? plateQuery : tinQuery;
  const hasSearched = query?.mode === mode;

  function handleSubmit(e) {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    setQuery({ mode, value });
  }

  function switchMode(newMode) {
    if (newMode === mode) return;
    setMode(newMode);
    setInput("");
    setQuery(null);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
          <Search className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Vehicle Insurance Search</h1>
          <p className="mt-1 text-sm text-gray-500">Verify insurance status by plate number or owner TIN.</p>
        </div>
      </div>

      <div className="mt-6 flex w-fit gap-1 rounded-lg bg-gray-200 p-1">
        <button
          type="button"
          onClick={() => switchMode("plate")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            mode === "plate" ? "bg-white text-navy-900 shadow" : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Search by Plate Number
        </button>
        <button
          type="button"
          onClick={() => switchMode("tin")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            mode === "tin" ? "bg-white text-navy-900 shadow" : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Search by TIN
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <FormField
          id="searchInput"
          icon={mode === "plate" ? Car : IdCard}
          wrapperClassName="mb-0 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "plate" ? "e.g. RAD123A" : "e.g. 123456789"}
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-navy-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </form>

      <div className="mt-8">
        {hasSearched && activeQuery.isFetching && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {hasSearched && !activeQuery.isFetching && activeQuery.isError && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">
            {activeQuery.error?.response?.data?.error || "Search failed. Please try again."}
          </div>
        )}

        {hasSearched && !activeQuery.isFetching && activeQuery.isSuccess && mode === "plate" && (
          <ResultCard
            vehicle={activeQuery.data.vehicle}
            insured={activeQuery.data.insured}
            policy={activeQuery.data.policy}
          />
        )}

        {hasSearched &&
          !activeQuery.isFetching &&
          activeQuery.isSuccess &&
          mode === "tin" &&
          (activeQuery.data.vehicles?.length ? (
            <div className="space-y-4">
              {activeQuery.data.vehicles.map((item, idx) => (
                <ResultCard
                  key={item.vehicle?.id ?? idx}
                  vehicle={item.vehicle}
                  insured={item.insured}
                  policy={item.policy}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              message="No vehicles found for this TIN."
              icon={<SearchX className="mb-3 h-10 w-10 text-gray-300" />}
            />
          ))}
      </div>
    </div>
  );
}
