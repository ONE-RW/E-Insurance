import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, KeyRound, LogOut, Monitor, Smartphone, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword, uploadAvatar } from "../api/profile";
import { getMySessions, revokeSession } from "../api/sessions";
import { getInitials } from "../components/Sidebar";
import FormField from "../components/FormField";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { formatDateTime } from "../utils/activityDisplay";

function SuccessBanner({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
      {message}
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">
      {message}
    </div>
  );
}

function AvatarSection() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      await uploadAvatar(file);
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload avatar.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-navy-900">Avatar</h2>
      <ErrorBanner message={error} />
      <div className="mt-4 flex items-center gap-5">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.full_name}
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-navy-700 text-2xl font-semibold text-white">
            {getInitials(user.full_name)}
          </div>
        )}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {uploading ? <Spinner size="sm" /> : <Camera className="h-4 w-4" />}
            Change Photo
          </button>
          <p className="mt-2 text-xs text-gray-500">PNG, JPEG or WEBP.</p>
        </div>
      </div>
    </div>
  );
}

function ProfileInfoSection() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ full_name: user.full_name || "", email: user.email || "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await updateProfile(form);
      await refreshUser();
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-navy-900">Profile Info</h2>
      <div className="mt-4">
        <SuccessBanner message={success} />
        <ErrorBanner message={error} />
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
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const emptyPasswordForm = { current_password: "", new_password: "", confirm_new_password: "" };

function ChangePasswordSection() {
  const [form, setForm] = useState(emptyPasswordForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.new_password !== form.confirm_new_password) {
      setError("New password and confirmation do not match.");
      return;
    }
    setSaving(true);
    try {
      await changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setForm(emptyPasswordForm);
      setSuccess("Password changed successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-navy-700" />
        <h2 className="text-lg font-bold text-navy-900">Change Password</h2>
      </div>
      <div className="mt-4">
        <SuccessBanner message={success} />
        <ErrorBanner message={error} />
        <form onSubmit={handleSubmit}>
          <FormField
            label="Current Password"
            id="current_password"
            type="password"
            required
            value={form.current_password}
            onChange={(e) => setForm({ ...form, current_password: e.target.value })}
          />
          <FormField
            label="New Password"
            id="new_password"
            type="password"
            required
            value={form.new_password}
            onChange={(e) => setForm({ ...form, new_password: e.target.value })}
          />
          <p className="-mt-3 mb-4 text-xs text-gray-500">
            At least 8 characters, with an uppercase letter, a lowercase letter, and a number.
          </p>
          <FormField
            label="Confirm New Password"
            id="confirm_new_password"
            type="password"
            required
            value={form.confirm_new_password}
            onChange={(e) => setForm({ ...form, confirm_new_password: e.target.value })}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Parses a small, friendly-ish label out of a raw User-Agent string, e.g.
// "Chrome on Windows". Falls back to a truncated raw string when nothing
// recognizable matches. This is intentionally a simple heuristic, not a
// full UA parser.
function describeUserAgent(userAgent) {
  if (!userAgent) return "Unknown device";

  let browser = "";
  if (/Edg\//i.test(userAgent)) browser = "Edge";
  else if (/Chrome\//i.test(userAgent)) browser = "Chrome";
  else if (/Firefox\//i.test(userAgent)) browser = "Firefox";
  else if (/Safari\//i.test(userAgent)) browser = "Safari";

  let os = "";
  if (/Windows/i.test(userAgent)) os = "Windows";
  else if (/Mac OS/i.test(userAgent)) os = "Mac OS";
  else if (/Android/i.test(userAgent)) os = "Android";
  else if (/iPhone|iPad/i.test(userAgent)) os = "iPhone";
  else if (/Linux/i.test(userAgent)) os = "Linux";

  if (browser && os) return `${browser} on ${os}`;
  if (browser) return browser;
  if (os) return os;

  return userAgent.length > 60 ? `${userAgent.slice(0, 60)}…` : userAgent;
}

function SessionRow({ session, onRevoke, revoking }) {
  const isMobile = /Mobile|Android|iPhone/i.test(session.user_agent || "");
  const DeviceIcon = isMobile ? Smartphone : Monitor;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-3 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
          <DeviceIcon className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-navy-900">{describeUserAgent(session.user_agent)}</p>
            {session.is_current && <StatusBadge tone="green" label="This device" />}
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {session.ip_address || "Unknown IP"} · Last active {formatDateTime(session.last_active_at)}
          </p>
        </div>
      </div>
      {!session.is_current && (
        <button
          type="button"
          onClick={() => onRevoke(session.id)}
          disabled={revoking}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      )}
    </div>
  );
}

function ActiveSessionsSection() {
  const queryClient = useQueryClient();

  const { data: sessions, isLoading, isError } = useQuery({
    queryKey: ["sessions", "me"],
    queryFn: getMySessions,
  });

  const revokeMut = useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", "me"] });
    },
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-navy-900">Active Sessions</h2>
      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">
            Failed to load active sessions.
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <EmptyState message="No active sessions found." />
        ) : (
          <div>
            {sessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                onRevoke={revokeMut.mutate}
                revoking={revokeMut.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
          <UserCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your account details, avatar and password.</p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <AvatarSection />
        <ProfileInfoSection />
        <ChangePasswordSection />
        <ActiveSessionsSection />
      </div>
    </div>
  );
}
