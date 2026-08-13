import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleGuard from "../components/RoleGuard";
import Layout from "../components/Layout";
import Spinner from "../components/Spinner";

import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import Forbidden from "../pages/Forbidden";
import Profile from "../pages/Profile";
import MyActivity from "../pages/MyActivity";

import SearchVehicle from "../pages/officer/SearchVehicle";

import AdminDashboard from "../pages/admin/Dashboard";
import AdminCompanies from "../pages/admin/Companies";
import AdminUsers from "../pages/admin/Users";
import AdminVehicles from "../pages/admin/Vehicles";
import AdminPolicies from "../pages/admin/Policies";
import AdminActivityLogs from "../pages/admin/ActivityLogs";
import AdminReports from "../pages/admin/Reports";

import InsurerDashboard from "../pages/insurer/Dashboard";
import InsurerPolicies from "../pages/insurer/Policies";

const ROLE_HOME = {
  admin: "/admin",
  insurer: "/insurer",
  officer: "/search",
};

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={ROLE_HOME[user.role] || "/login"} replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/403" element={<Forbidden />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/activity" element={<MyActivity />} />

          <Route element={<RoleGuard roles={["officer"]} />}>
            <Route path="/search" element={<SearchVehicle />} />
          </Route>

          <Route element={<RoleGuard roles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/companies" element={<AdminCompanies />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/vehicles" element={<AdminVehicles />} />
            <Route path="/admin/policies" element={<AdminPolicies />} />
            <Route path="/admin/logs" element={<AdminActivityLogs />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </Route>

          <Route element={<RoleGuard roles={["insurer"]} />}>
            <Route path="/insurer" element={<InsurerDashboard />} />
            <Route path="/insurer/policies" element={<InsurerPolicies />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
