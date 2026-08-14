import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";

const ROLE_HOME = {
  admin: "/admin",
  insurer: "/insurer",
  officer: "/search",
};

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const idleLogout = searchParams.get("reason") === "idle";

  useEffect(() => {
    if (user) {
      navigate(ROLE_HOME[user.role] || "/", { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      const dest = location.state?.from?.pathname || ROLE_HOME[loggedInUser.role] || "/";
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-900">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900">E-Assurance</h1>
          <p className="mt-1 text-sm text-gray-500">
            Rwanda National Police — Vehicle Insurance Verification
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">
            {error}
          </div>
        ) : (
          idleLogout && (
            <div className="mb-4 rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-700 ring-1 ring-inset ring-blue-200">
              You were logged out due to inactivity.
            </div>
          )
        )}

        <form onSubmit={handleSubmit}>
          <FormField
            label="Email"
            id="email"
            type="email"
            autoComplete="username"
            required
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <FormField
            label="Password"
            id="password"
            type="password"
            autoComplete="current-password"
            required
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-md bg-navy-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
