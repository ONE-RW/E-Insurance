import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Client-side UX gating only — the backend is the real authority on access.
 * Redirects to the 403 page if the logged-in user's role is not in `roles`.
 */
export default function RoleGuard({ roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
