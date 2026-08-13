import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Building2, CheckCircle2, Pencil, Plus } from "lucide-react";
import { getCompanies, createCompany, updateCompany, setCompanyStatus } from "../../api/companies";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";
import StatusBadge from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";

const emptyForm = { name: "", tin_number: "", address: "", phone: "", email: "" };

export default function Companies() {
  const queryClient = useQueryClient();
  const { data: companies, isLoading } = useQuery({ queryKey: ["companies"], queryFn: getCompanies });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["companies"] });
  }

  const createMut = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(err.response?.data?.error || "Failed to create company."),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateCompany(id, data),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(err.response?.data?.error || "Failed to update company."),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => setCompanyStatus(id, status),
    onSuccess: invalidate,
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(company) {
    setEditing(company);
    setForm({
      name: company.name || "",
      tin_number: company.tin_number || "",
      address: company.address || "",
      phone: company.phone || "",
      email: company.email || "",
    });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (editing) {
      updateMut.mutate({ id: editing.id, data: form });
    } else {
      createMut.mutate(form);
    }
  }

  const columns = [
    { key: "name", header: "Name" },
    { key: "tin_number", header: "TIN" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
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
          <button
            type="button"
            onClick={() => statusMut.mutate({ id: row.id, status: row.status === "active" ? "disabled" : "active" })}
            className={`inline-flex items-center gap-1 font-medium hover:underline ${
              row.status === "active" ? "text-red-600" : "text-green-700"
            }`}
          >
            {row.status === "active" ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {row.status === "active" ? "Disable" : "Enable"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Insurance Companies</h1>
            <p className="mt-1 text-sm text-gray-500">Manage registered insurance companies.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
        >
          <Plus className="h-4 w-4" />
          New Company
        </button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={companies || []} />
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Company" : "New Company"}>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <FormField
            label="Company Name"
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <FormField
            label="TIN Number"
            id="tin_number"
            required
            value={form.tin_number}
            onChange={(e) => setForm({ ...form, tin_number: e.target.value })}
          />
          <FormField
            label="Address"
            id="address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <FormField
            label="Phone"
            id="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <FormField
            label="Email"
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
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
              disabled={createMut.isPending || updateMut.isPending}
              className="rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
            >
              {editing ? "Save Changes" : "Create Company"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
