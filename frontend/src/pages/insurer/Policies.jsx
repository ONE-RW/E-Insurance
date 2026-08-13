import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Car, FileText, Pencil, Plus, Search, XCircle } from "lucide-react";
import { getPolicies, createPolicy, updatePolicy, cancelPolicy } from "../../api/policies";
import { getVehicleByPlate, createVehicle } from "../../api/vehicles";
import { useAuth } from "../../context/AuthContext";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";
import StatusBadge from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";

const COVERAGE_TYPES = ["third_party", "comprehensive"];

const emptyPolicyForm = { policy_number: "", coverage_type: "third_party", start_date: "", end_date: "" };
const emptyVehicleForm = {
  chassis_number: "",
  make: "",
  model: "",
  year: "",
  owner_name: "",
  owner_tin: "",
  owner_national_id: "",
};

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

export default function Policies() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: policies, isLoading } = useQuery({ queryKey: ["policies"], queryFn: () => getPolicies() });

  // --- Create policy modal state ---
  const [createOpen, setCreateOpen] = useState(false);
  const [plateInput, setPlateInput] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [vehicleNotFound, setVehicleNotFound] = useState(false);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicleForm);
  const [policyForm, setPolicyForm] = useState(emptyPolicyForm);
  const [createError, setCreateError] = useState("");

  const lookupMut = useMutation({
    mutationFn: (plate) => getVehicleByPlate(plate),
    onSuccess: (found) => {
      setVehicle(found);
      setVehicleNotFound(false);
    },
    onError: (err) => {
      if (err.response?.status === 404) {
        setVehicle(null);
        setVehicleNotFound(true);
      } else {
        setCreateError(err.response?.data?.error || "Vehicle lookup failed.");
      }
    },
  });

  const createPolicyMut = useMutation({
    mutationFn: async () => {
      let vehicleId = vehicle?.id;
      if (!vehicleId) {
        const created = await createVehicle({
          plate_number: plateInput.trim(),
          chassis_number: vehicleForm.chassis_number,
          make: vehicleForm.make,
          model: vehicleForm.model,
          year: vehicleForm.year ? Number(vehicleForm.year) : undefined,
          owner_name: vehicleForm.owner_name,
          owner_tin: vehicleForm.owner_tin,
          owner_national_id: vehicleForm.owner_national_id,
        });
        vehicleId = created.id;
      }
      return createPolicy({
        vehicle_id: vehicleId,
        policy_number: policyForm.policy_number,
        coverage_type: policyForm.coverage_type,
        start_date: policyForm.start_date,
        end_date: policyForm.end_date,
        insurance_company_id: user?.insurance_company_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      closeCreateModal();
    },
    onError: (err) => setCreateError(err.response?.data?.error || "Failed to create policy."),
  });

  function openCreateModal() {
    setPlateInput("");
    setVehicle(null);
    setVehicleNotFound(false);
    setVehicleForm(emptyVehicleForm);
    setPolicyForm(emptyPolicyForm);
    setCreateError("");
    setCreateOpen(true);
  }

  function closeCreateModal() {
    setCreateOpen(false);
  }

  function handleLookup(e) {
    e.preventDefault();
    if (!plateInput.trim()) return;
    setCreateError("");
    lookupMut.mutate(plateInput.trim());
  }

  function resetLookup() {
    setVehicle(null);
    setVehicleNotFound(false);
    setVehicleForm(emptyVehicleForm);
  }

  function handleCreateSubmit(e) {
    e.preventDefault();
    setCreateError("");
    createPolicyMut.mutate();
  }

  // --- Edit policy modal state ---
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(emptyPolicyForm);
  const [editError, setEditError] = useState("");

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updatePolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      setEditing(null);
    },
    onError: (err) => setEditError(err.response?.data?.error || "Failed to update policy."),
  });

  function openEdit(policy) {
    setEditing(policy);
    setEditForm({
      policy_number: policy.policy_number,
      coverage_type: policy.coverage_type,
      start_date: policy.start_date?.slice(0, 10) || "",
      end_date: policy.end_date?.slice(0, 10) || "",
    });
    setEditError("");
  }

  function handleEditSubmit(e) {
    e.preventDefault();
    if (!editing) return;
    updateMut.mutate({ id: editing.id, data: editForm });
  }

  // --- Cancel policy ---
  const [cancelTarget, setCancelTarget] = useState(null);
  const cancelMut = useMutation({
    mutationFn: (id) => cancelPolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      setCancelTarget(null);
    },
  });

  const columns = [
    { key: "policy_number", header: "Policy #" },
    { key: "vehicle", header: "Plate", render: (row) => row.vehicle?.plate_number || "-" },
    { key: "owner", header: "Owner", render: (row) => row.vehicle?.owner_name || "-" },
    { key: "coverage_type", header: "Coverage" },
    { key: "start_date", header: "Start", render: (row) => formatDate(row.start_date) },
    { key: "end_date", header: "End", render: (row) => formatDate(row.end_date) },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => openEdit(row)}
            className="inline-flex items-center gap-1 font-medium text-navy-700 hover:underline"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
          {row.status === "active" && (
            <button
              type="button"
              onClick={() => setCancelTarget(row)}
              className="inline-flex items-center gap-1 font-medium text-red-600 hover:underline"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Policies</h1>
            <p className="mt-1 text-sm text-gray-500">
              {user?.insurance_company_name ? `Policies underwritten by ${user.insurance_company_name}.` : "Your policies."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
        >
          <Plus className="h-4 w-4" />
          New Policy
        </button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={policies || []} emptyMessage="No policies yet." />
        )}
      </div>

      {/* Create Policy Modal */}
      <Modal open={createOpen} onClose={closeCreateModal} title="New Policy" wide>
        {createError && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">
            {createError}
          </div>
        )}

        {!vehicle && !vehicleNotFound && (
          <form onSubmit={handleLookup} className="flex items-end gap-3">
            <FormField
              label="Vehicle Plate Number"
              id="plateInput"
              required
              icon={Car}
              wrapperClassName="mb-0 flex-1"
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value)}
              placeholder="e.g. RAD123A"
            />
            <button
              type="submit"
              disabled={lookupMut.isPending}
              className="inline-flex items-center gap-2 rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
            >
              <Search className="h-4 w-4" />
              {lookupMut.isPending ? "Looking up..." : "Look up Vehicle"}
            </button>
          </form>
        )}

        {(vehicle || vehicleNotFound) && (
          <div className="mb-4 flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
            <span className="text-sm text-gray-600">
              Plate: <span className="font-semibold text-navy-900">{plateInput}</span>
            </span>
            <button type="button" onClick={resetLookup} className="text-sm font-medium text-navy-700 hover:underline">
              Change plate
            </button>
          </div>
        )}

        {vehicle && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            Vehicle found: {vehicle.make} {vehicle.model} — Owner: {vehicle.owner_name}
          </div>
        )}

        {vehicleNotFound && (
          <>
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No vehicle found with this plate number. Enter the vehicle details below to register it.
            </div>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <FormField
                label="Chassis Number"
                id="chassis_number"
                required
                value={vehicleForm.chassis_number}
                onChange={(e) => setVehicleForm({ ...vehicleForm, chassis_number: e.target.value })}
              />
              <FormField
                label="Make"
                id="make"
                required
                value={vehicleForm.make}
                onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
              />
              <FormField
                label="Model"
                id="model"
                required
                value={vehicleForm.model}
                onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
              />
              <FormField
                label="Year"
                id="year"
                type="number"
                value={vehicleForm.year}
                onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
              />
              <FormField
                label="Owner Name"
                id="owner_name"
                required
                value={vehicleForm.owner_name}
                onChange={(e) => setVehicleForm({ ...vehicleForm, owner_name: e.target.value })}
              />
              <FormField
                label="Owner TIN"
                id="owner_tin"
                required
                value={vehicleForm.owner_tin}
                onChange={(e) => setVehicleForm({ ...vehicleForm, owner_tin: e.target.value })}
              />
              <FormField
                label="Owner National ID"
                id="owner_national_id"
                value={vehicleForm.owner_national_id}
                onChange={(e) => setVehicleForm({ ...vehicleForm, owner_national_id: e.target.value })}
              />
            </div>
          </>
        )}

        {(vehicle || vehicleNotFound) && (
          <form onSubmit={handleCreateSubmit} className="mt-2 border-t border-gray-100 pt-4">
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <FormField
                label="Policy Number"
                id="policy_number"
                required
                value={policyForm.policy_number}
                onChange={(e) => setPolicyForm({ ...policyForm, policy_number: e.target.value })}
              />
              <FormField
                as="select"
                label="Coverage Type"
                id="coverage_type"
                value={policyForm.coverage_type}
                onChange={(e) => setPolicyForm({ ...policyForm, coverage_type: e.target.value })}
              >
                {COVERAGE_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ")}
                  </option>
                ))}
              </FormField>
              <FormField
                label="Start Date"
                id="start_date"
                type="date"
                required
                value={policyForm.start_date}
                onChange={(e) => setPolicyForm({ ...policyForm, start_date: e.target.value })}
              />
              <FormField
                label="End Date"
                id="end_date"
                type="date"
                required
                value={policyForm.end_date}
                onChange={(e) => setPolicyForm({ ...policyForm, end_date: e.target.value })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createPolicyMut.isPending}
                className="rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
              >
                {createPolicyMut.isPending ? "Creating..." : "Create Policy"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Policy Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Policy">
        {editError && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">
            {editError}
          </div>
        )}
        <form onSubmit={handleEditSubmit}>
          <FormField
            label="Policy Number"
            id="editPolicyNumber"
            required
            value={editForm.policy_number}
            onChange={(e) => setEditForm({ ...editForm, policy_number: e.target.value })}
          />
          <FormField
            as="select"
            label="Coverage Type"
            id="editCoverageType"
            value={editForm.coverage_type}
            onChange={(e) => setEditForm({ ...editForm, coverage_type: e.target.value })}
          >
            {COVERAGE_TYPES.map((c) => (
              <option key={c} value={c}>
                {c.replace("_", " ")}
              </option>
            ))}
          </FormField>
          <FormField
            label="Start Date"
            id="editStartDate"
            type="date"
            required
            value={editForm.start_date}
            onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
          />
          <FormField
            label="End Date"
            id="editEndDate"
            type="date"
            required
            value={editForm.end_date}
            onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(null)}
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
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Policy">
        <p className="text-sm text-gray-600">
          Are you sure you want to cancel policy{" "}
          <span className="font-semibold text-navy-900">{cancelTarget?.policy_number}</span>? This action cannot be
          undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setCancelTarget(null)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Keep Policy
          </button>
          <button
            type="button"
            onClick={() => cancelMut.mutate(cancelTarget.id)}
            disabled={cancelMut.isPending}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {cancelMut.isPending ? "Cancelling..." : "Cancel Policy"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
