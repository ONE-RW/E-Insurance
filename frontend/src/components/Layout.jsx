import { useState } from "react";
import { Outlet } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import IdleLogoutGuard from "./IdleLogoutGuard";

export default function Layout() {
  const { user } = useAuth();
  // Desktop-open by default (matches the sidebar's previous always-visible behavior). The mobile
  // drawer has its own separate open/close state inside Sidebar.jsx — this only controls the
  // `lg:` and up collapse/expand toggle.
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <IdleLogoutGuard />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className={`transition-[margin] duration-200 ${sidebarOpen ? "lg:ml-64" : "lg:ml-16"}`}>
        {/* Desktop-only toggle — always reachable regardless of the sidebar's open/collapsed
            state, so users can re-expand it after collapsing. The mobile hamburger lives inside
            Sidebar.jsx's own top bar and is unaffected by this. */}
        <div className="hidden items-center border-b border-gray-200 bg-white px-4 py-2 lg:flex">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
