import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, CheckCircle2, Filter, KeyRound, Pencil, Plus, Users as UsersIcon } from "lucide-react";
import { getUsers, createUser, updateUser, setUserStatus, resetUserPassword } from "../../api/users";
import { getCompanies } from "../../api/companies";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";
import SearchableSelect from "../../components/SearchableSelect";
import StatusBadge from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";

const ROLES = ["admin", "insurer", "officer"];

const emptyForm = {
  full_name: "",
  email: "",
  password: "",
  role: "officer",
  insurance_company_id: "",
};

export default function Users() {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["users", { role: roleFilter }],
    queryFn: () => getUsers(roleFilter ? { role: roleFilter } : {}),
  });

  const { data: companies } = useQuery({ queryKey: ["companies"], queryFn: getCompanies });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwTarget, setPwTarget] = useState(null);
  const [pwValue, setPwValue] = useState("");
  const [pwError, setPwError] = useState("");

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  }

  const createMut = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(err.response?.data?.error || "Failed to create user."),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(err.response?.data?.error || "Failed to update user."),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => setUserStatus(id, status),
    onSuccess: invalidate,
  });

  const pwMut = useMutation({
    mutationFn: ({ id, password }) => resetUserPassword(id, password),
    onSuccess: () => {
      setPwModalOpen(false);
      setPwTarget(null);
      setPwValue("");
      setPwError("");
    },
    onError: (err) => setPwError(err.response?.data?.error || "Failed to reset password."),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(user) {
    setEditing(user);
    setForm({
      full_name: user.full_name || "",
      email: user.email || "",
      password: "",
      role: user.role,
      insurance_company_id: user.insurance_company_id || "",
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
    const payload = {
      full_name: form.full_name,
      email: form.email,
      role: form.role,
      insurance_company_id: form.role === "insurer" ? form.insurance_company_id || null : null,
    };
    if (editing) {
      updateMut.mutate({ id: editing.id, data: payload });
    } else {
      createMut.mutate({ ...payload, password: form.password });
    }
  }

  function openPasswordReset(user) {
    setPwTarget(user);
    setPwValue("");
    setPwError("");
    setPwModalOpen(true);
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();
    if (!pwTarget) return;
    pwMut.mutate({ id: pwTarget.id, password: pwValue });
  }

  const columns = [
    { key: "full_name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role", render: (row) => <StatusBadge status={row.role} tone="gray" label={row.role} /> },
    { key: "insurance_company_name", header: "Company", render: (row) => row.insurance_company_name || "-" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex flex-wrap gap-3">
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
            onClick={() => openPasswordReset(row)}
            className="inline-flex items-center gap-1 font-medium text-navy-700 hover:underline"
          >
            <KeyRound className="h-4 w-4" />
            Reset Password
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
            <UsersIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Users</h1>
            <p className="mt-1 text-sm text-gray-500">Manage insurer and officer accounts.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
        >
          <Plus className="h-4 w-4" />
          New User
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <label htmlFor="roleFilter" className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
          <Filter className="h-4 w-4" />
          Filter by role
        </label>
        <select
          id="roleFilter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-navy-600 focus:outline-none focus:ring-1 focus:ring-navy-600"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={users || []} />
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit User" : "New User"}>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <FormField
            label="Full Name"
            id="full_name"
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <FormField
            label="Email"
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {!editing && (
            <>
              <FormField
                label="Password"
                id="password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <p className="-mt-3 mb-4 text-xs text-gray-500">
                At least 8 characters, with an uppercase letter, a lowercase letter, and a number.
              </p>
            </>
          )}
          <FormField
            as="select"
            label="Role"
            id="role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value, insurance_company_id: "" })}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </FormField>
          {form.role === "insurer" && (
            <SearchableSelect
              label="Insurance Company"
              id="insurance_company_id"
              required
              placeholder="Search companies…"
              value={form.insurance_company_id}
              onChange={(id) => setForm({ ...form, insurance_company_id: id })}
              options={(companies || []).map((c) => ({ id: c.id, label: c.name }))}
            />
          )}
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
              {editing ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={pwModalOpen}
        onClose={() => setPwModalOpen(false)}
        title={`Reset Password${pwTarget ? ` — ${pwTarget.full_name}` : ""}`}
      >
        {pwError && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">
            {pwError}
          </div>
        )}
        <form onSubmit={handlePasswordSubmit}>
          <FormField
            label="New Password"
            id="newPassword"
            type="password"
            required
            value={pwValue}
            onChange={(e) => setPwValue(e.target.value)}
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPwModalOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pwMut.isPending}
              className="rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
            >
              Reset Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
