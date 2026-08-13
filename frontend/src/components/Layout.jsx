import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

export default function Layout() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <main className="lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
}
