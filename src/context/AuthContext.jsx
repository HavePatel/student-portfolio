/**
 * AuthContext.jsx
 * Context Provider for JWT Authentication State (Practical 7).
 *
 * Provides:
 *   - user, token, isAuthenticated, loading state
 *   - login(email, password)
 *   - register(email, password)
 *   - logout()
 *
 * Persists token in localStorage and validates session with GET /me on initial load.
 */

import { createContext, useState, useEffect, useCallback } from "react";
import { loginApi, registerApi, getMeApi } from "../services/authApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronize and verify token with backend GET /me on startup
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        if (isMounted) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await getMeApi(storedToken);
        if (isMounted && res.success && res.user) {
          setUser(res.user);
          setToken(storedToken);
        }
      } catch {
        // Invalid or expired token on initial load
        if (isMounted) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Logout callback
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  // Listen for 401 unauthorized events dispatched by API services
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  // Login handler
  const login = useCallback(async (email, password) => {
    const res = await loginApi(email, password);
    if (res.success && res.token) {
      localStorage.setItem("token", res.token);
      setToken(res.token);
      setUser(res.user || null);
      return res;
    }
    throw new Error(res.errors?.[0] || "Login failed.");
  }, []);

  // Register handler
  const register = useCallback(async (email, password) => {
    const res = await registerApi(email, password);
    return res;
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
