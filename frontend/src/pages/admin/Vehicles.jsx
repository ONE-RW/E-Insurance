import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Car, IdCard, Pencil, Search } from "lucide-react";
import { getVehicles, updateVehicle } from "../../api/vehicles";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";
import Spinner from "../../components/Spinner";

export default function Vehicles() {
  const queryClient = useQueryClient();
  const [plateFilter, setPlateFilter] = useState("");
  const [tinFilter, setTinFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({});

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicles", appliedFilters],
    queryFn: () => getVehicles(appliedFilters),
  });

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateVehicle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      closeModal();
    },
    onError: (err) => setError(err.response?.data?.error || "Failed to update vehicle."),
  });

  function handleFilterSubmit(e) {
    e.preventDefault();
    const next = {};
    if (plateFilter.trim()) next.plate = plateFilter.trim();
    if (tinFilter.trim()) next.owner_tin = tinFilter.trim();
    setAppliedFilters(next);
  }

  function clearFilters() {
    setPlateFilter("");
    setTinFilter("");
    setAppliedFilters({});
  }

  function openEdit(vehicle) {
    setEditing(vehicle);
    setForm({
      plate_number: vehicle.plate_number || "",
      chassis_number: vehicle.chassis_number || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || "",
      owner_name: vehicle.owner_name || "",
      owner_tin: vehicle.owner_tin || "",
      owner_national_id: vehicle.owner_national_id || "",
    });
    setError("");
  }

  function closeModal() {
    setEditing(null);
    setForm(null);
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!editing) return;
    updateMut.mutate({ id: editing.id, data: { ...form, year: form.year ? Number(form.year) : null } });
  }

  const columns = [
    { key: "plate_number", header: "Plate Number" },
    { key: "make", header: "Make" },
    { key: "model", header: "Model" },
    { key: "year", header: "Year" },
    { key: "owner_name", header: "Owner" },
    { key: "owner_tin", header: "Owner TIN" },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (row) => (
        <button
          type="button"
          onClick={() => openEdit(row)}
          className="inline-flex items-center gap-1 font-medium text-navy-700 hover:underline"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
          <Car className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Vehicles</h1>
          <p className="mt-1 text-sm text-gray-500">Search and manage registered vehicles.</p>
        </div>
      </div>

      <form onSubmit={handleFilterSubmit} className="mt-6 flex flex-wrap items-end gap-3">
        <FormField
          label="Plate Number"
          id="plateFilter"
          icon={Car}
          wrapperClassName="mb-0 w-48"
          value={plateFilter}
          onChange={(e) => setPlateFilter(e.target.value)}
          placeholder="e.g. RAD123A"
        />
        <FormField
          label="Owner TIN"
          id="tinFilter"
          icon={IdCard}
          wrapperClassName="mb-0 w-48"
          value={tinFilter}
          onChange={(e) => setTinFilter(e.target.value)}
          placeholder="e.g. 123456789"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear
        </button>
      </form>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={vehicles || []} emptyMessage="No vehicles found." />
        )}
      </div>

      <Modal open={!!editing} onClose={closeModal} title="Edit Vehicle" wide>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">
            {error}
          </div>
        )}
        {form && (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <FormField
                label="Plate Number"
                id="plate_number"
                required
                value={form.plate_number}
                onChange={(e) => setForm({ ...form, plate_number: e.target.value })}
              />
              <FormField
                label="Chassis Number"
                id="chassis_number"
                value={form.chassis_number}
                onChange={(e) => setForm({ ...form, chassis_number: e.target.value })}
              />
              <FormField
                label="Make"
                id="make"
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
              />
              <FormField
                label="Model"
                id="model"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
              <FormField
                label="Year"
                id="year"
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
              <FormField
                label="Owner Name"
                id="owner_name"
                required
                value={form.owner_name}
                onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
              />
              <FormField
                label="Owner TIN"
                id="owner_tin"
                required
                value={form.owner_tin}
                onChange={(e) => setForm({ ...form, owner_tin: e.target.value })}
              />
              <FormField
                label="Owner National ID"
                id="owner_national_id"
                value={form.owner_national_id}
                onChange={(e) => setForm({ ...form, owner_national_id: e.target.value })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMut.isPending}
                className="rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
