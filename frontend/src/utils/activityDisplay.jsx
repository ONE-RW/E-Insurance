import {
  Activity,
  Ban,
  Camera,
  KeyRound,
  LogIn,
  LogOut,
  Pencil,
  PlusCircle,
  Search,
  User,
  XCircle,
} from "lucide-react";

// Maps every `action` string actually written by the backend's activityLogger
// (see backend/src/controllers/*Controller.js) to a representative icon.
// Any action not listed here falls back to a generic Activity icon rather
// than rendering nothing.
export const ACTION_ICONS = {
  login: LogIn,
  login_failed: LogIn,
  logout: LogOut,
  search: Search,
  create_policy: PlusCircle,
  update_policy: Pencil,
  cancel_policy: XCircle,
  create_user: PlusCircle,
  update_user: Pencil,
  disable_user: Ban,
  create_company: PlusCircle,
  update_company: Pencil,
  create_vehicle: PlusCircle,
  update_vehicle: Pencil,
  update_profile: User,
  change_password: KeyRound,
  update_avatar: Camera,
};

export function ActionCell({ action }) {
  const Icon = ACTION_ICONS[action] || Activity;
  const isFailure = action === "login_failed";
  return (
    <span className={`inline-flex items-center gap-1.5 ${isFailure ? "text-red-600" : ""}`}>
      <Icon className="h-4 w-4 shrink-0" />
      {action}
    </span>
  );
}

export function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}
