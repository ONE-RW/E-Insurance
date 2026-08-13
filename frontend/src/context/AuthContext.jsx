import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, login as apiLogin, logout as apiLogout } from "../api/auth";
import { setOnUnauthorized } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Register a handler so the axios interceptor can clear state and redirect
  // whenever any request comes back 401 Unauthorized (e.g. session expired).
  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
      navigate("/login", { replace: true });
    });
    return () => setOnUnauthorized(null);
  }, [navigate]);

  // Restore session on mount.
  useEffect(() => {
    let mounted = true;
    getMe()
      .then((data) => {
        if (mounted) setUser(data.user);
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function login(email, password) {
    const data = await apiLogin(email, password);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }

  async function refreshUser() {
    const data = await getMe();
    setUser(data.user);
    return data.user;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
