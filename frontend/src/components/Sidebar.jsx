import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Building2,
  Car,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

const LINKS_BY_ROLE = {
  admin: [
    { to: "/admin", label: "Dashboard", end: true, icon: LayoutDashboard },
    { to: "/admin/companies", label: "Companies", icon: Building2 },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/vehicles", label: "Vehicles", icon: Car },
    { to: "/admin/policies", label: "Policies", icon: FileText },
    { to: "/admin/logs", label: "Activity Logs", icon: History },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    { to: "/activity", label: "My Activity", icon: Activity },
  ],
  insurer: [
    { to: "/insurer", label: "Dashboard", end: true, icon: LayoutDashboard },
    { to: "/insurer/policies", label: "Policies", icon: FileText },
    { to: "/activity", label: "My Activity", icon: Activity },
  ],
  officer: [
    { to: "/search", label: "Search Vehicle", end: true, icon: Search },
    { to: "/activity", label: "My Activity", icon: Activity },
  ],
};

const ROLE_PILL_CLASSES = {
  admin: "bg-navy-200/20 text-navy-100 ring-1 ring-inset ring-navy-400/40",
  insurer: "bg-blue-500/20 text-blue-100 ring-1 ring-inset ring-blue-400/40",
  officer: "bg-green-500/20 text-green-100 ring-1 ring-inset ring-green-400/40",
};

export function getInitials(fullName) {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

function BrandHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between px-4 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-700">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-base font-bold leading-tight text-white">E-Assurance</p>
          <p className="text-xs text-navy-300">Rwanda National Police</p>
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-md p-1.5 text-navy-200 hover:bg-navy-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function NavLinks({ links, onNavigate }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive ? "bg-navy-700 text-white" : "text-navy-200 hover:bg-navy-800 hover:text-white"
    }`;

  return (
    <nav className="flex-1 space-y-1 px-3">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink key={link.to} to={link.to} end={link.end} onClick={onNavigate} className={linkClass}>
            <Icon className="h-5 w-5 shrink-0" />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function UserCard({ user, onLogout }) {
  const pillClass = ROLE_PILL_CLASSES[user.role] || "bg-gray-500/20 text-gray-100 ring-1 ring-inset ring-gray-400/40";

  return (
    <div className="border-t border-navy-800 px-3 py-4">
      <Link to="/profile" className="flex items-center gap-3 rounded-md px-2 py-2 transition hover:bg-navy-800">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.full_name}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-700 text-sm font-semibold text-white">
            {getInitials(user.full_name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{user.full_name}</p>
          <span className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${pillClass}`}>
            {user.role}
          </span>
        </div>
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-navy-700 px-3 py-2 text-sm font-medium text-white hover:bg-navy-600"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  );
}

export default function Sidebar({ open: desktopOpen = true, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const links = LINKS_BY_ROLE[user.role] || [];

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 bg-navy-900 px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-navy-200 hover:bg-navy-800 hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-navy-700">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white">E-Assurance</span>
        </div>
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col bg-navy-900 transition-transform duration-200 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <BrandHeader onClose={() => setMobileOpen(false)} />
        <LanguageSwitcher />
        <NavLinks links={links} onNavigate={() => setMobileOpen(false)} />
        <UserCard user={user} onLogout={handleLogout} />
      </div>

      {/* Desktop sidebar — collapsible via the toggle in Layout.jsx (and its own close button
          here), controlled by the `open`/`onClose` props rather than local state. */}
      <div
        className={`fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy-900 transition-transform duration-200 lg:flex ${
          desktopOpen ? "lg:translate-x-0" : "lg:-translate-x-full"
        }`}
      >
        <BrandHeader onClose={onClose} />
        <LanguageSwitcher />
        <NavLinks links={links} />
        <UserCard user={user} onLogout={handleLogout} />
      </div>
    </>
  );
}
