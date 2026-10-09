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
 * Session Management — 30-Second Inactivity Timeout:
 *   - User is logged out after 30 seconds of INACTIVITY (not total session age)
 *   - Activity events (mousedown, keydown, touchstart, scroll, pointermove)
 *     reset the timer and trigger a heartbeat to POST /auth/refresh, which
 *     slides the server-side session's lastActivityAt forward
 *   - The backend enforces the same 30s window on every protected request
 *     (server-side Session record keyed by the JWT's jti claim) — a valid
 *     JWT alone is not sufficient
 *   - lastActivityAt is stored in localStorage so a page refresh only counts
 *     the REMAINING idle time, not a fresh 30 seconds
 *   - Cross-tab: tabs share the token/session via localStorage; storage
 *     events sync login/logout, and an idle tab verifies with the server
 *     before logging out so activity in ANY tab keeps the session alive
 *   - On timeout: auth state is cleared, the server session is terminated,
 *     protected requests can no longer be authenticated, the user is
 *     redirected to /login, and a notification is shown
 */

import { createContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi, getMeApi, logoutApi } from "../services/authApi";
import { useToast } from "../hooks/useToast";

export const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT = 30 * 1000; // 30 seconds of inactivity
const TOKEN_RENEWAL_THRESHOLD = 5 * 60 * 1000; // Renew token if < 5 minutes remaining
const LAST_ACTIVITY_KEY = "lastActivityAt";
const TOKEN_KEY = "token";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/**
 * Decode JWT payload to extract the exp claim.
 * Returns expiration time in milliseconds, or null if token is invalid.
 */
function getTokenExpiration(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Get the last activity timestamp from localStorage.
 */
function getLastActivity() {
  const stored = localStorage.getItem(LAST_ACTIVITY_KEY);
  return stored ? parseInt(stored, 10) : null;
}

/**
 * Store the current activity timestamp in localStorage.
 */
function setLastActivity() {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const inactivityTimerRef = useRef(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Clear the inactivity timer
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  // Perform full logout: clear token, user, timer, lastActivity,
  // terminate the server-side session, notify, and redirect.
  const performLogout = useCallback(
    (message) => {
      clearInactivityTimer();
      const currentToken = localStorage.getItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      setToken(null);
      setUser(null);
      // Best-effort server-side session termination (fire-and-forget):
      // without this the session would only die on its next request.
      if (currentToken) {
        logoutApi(currentToken).catch(() => {});
      }
      if (message) {
        showToast(message, "info");
      }
      navigate("/login");
    },
    [clearInactivityTimer, showToast, navigate]
  );

  // Heartbeat + verification: tells the server the user is active. The
  // backend slides the session's lastActivityAt forward and returns a fresh
  // JWT. Used for activity tracking, token renewal, and as the authoritative
  // check before logging out (so activity in another tab keeps us alive).
  const verifySessionActive = useCallback(async () => {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (!currentToken) return false;

    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!res.ok) return false;

      const json = await res.json();
      if (json.success && json.token) {
        localStorage.setItem(TOKEN_KEY, json.token);
        setToken(json.token);
        if (json.user) {
          setUser(json.user);
        }
      }
      return true;
    } catch {
      // Network error — keep the local session; the inactivity timer
      // will verify again when it fires.
      return false;
    }
  }, []);

  // Always points at the latest scheduleInactivityTimer so the timer callback
  // can reschedule itself without a direct self-reference.
  const scheduleInactivityTimerRef = useRef(() => {});

  // Schedule the inactivity timer. `delay` lets a page refresh count only
  // the REMAINING idle time instead of restarting a fresh 30 seconds.
  // When the timer fires the server is consulted first: if another tab
  // was active, the session is still alive and the timer reschedules.
  const scheduleInactivityTimer = useCallback(
    (delay = INACTIVITY_TIMEOUT) => {
      clearInactivityTimer();
      inactivityTimerRef.current = setTimeout(() => {
        verifySessionActive().then((stillActive) => {
          if (stillActive) {
            scheduleInactivityTimerRef.current();
          } else {
            performLogout(
              "Your session has expired due to inactivity. Please log in again."
            );
          }
        });
      }, delay);
    },
    [clearInactivityTimer, verifySessionActive, performLogout]
  );

  useEffect(() => {
    scheduleInactivityTimerRef.current = () => scheduleInactivityTimer();
  }, [scheduleInactivityTimer]);

  // Handle user activity: update lastActivityAt, reset timer, and renew the
  // token if it is approaching expiration.
  const handleActivity = useCallback(() => {
    setLastActivity();
    scheduleInactivityTimer();

    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (currentToken) {
      const expirationTime = getTokenExpiration(currentToken);
      if (expirationTime) {
        const remainingTime = expirationTime - Date.now();
        if (remainingTime > 0 && remainingTime < TOKEN_RENEWAL_THRESHOLD) {
          verifySessionActive();
        }
      }
    }
  }, [scheduleInactivityTimer, verifySessionActive]);

  // Debounced activity handler to avoid excessive calls
  const debouncedActivityRef = useRef(null);
  const debouncedActivity = useCallback(() => {
    if (debouncedActivityRef.current) {
      clearTimeout(debouncedActivityRef.current);
    }
    debouncedActivityRef.current = setTimeout(() => {
      handleActivity();
    }, 1000);
  }, [handleActivity]);

  // Set up activity event listeners
  useEffect(() => {
    const events = ["mousedown", "keydown", "touchstart", "scroll", "pointermove"];
    events.forEach((event) => {
      window.addEventListener(event, debouncedActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, debouncedActivity);
      });
    };
  }, [debouncedActivity]);

  // Synchronize and verify token with backend GET /me on startup
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        if (isMounted) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // Check inactivity on page load/refresh using the persisted timestamp
      const lastActivity = getLastActivity();
      if (lastActivity) {
        const inactiveDuration = Date.now() - lastActivity;
        if (inactiveDuration >= INACTIVITY_TIMEOUT) {
          // User has been inactive for too long — logout
          if (isMounted) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(LAST_ACTIVITY_KEY);
            setToken(null);
            setUser(null);
            setLoading(false);
            showToast(
              "Your session has expired due to inactivity. Please log in again.",
              "info"
            );
            navigate("/login");
          }
          return;
        }
        // Refresh: only the remaining idle time counts
        scheduleInactivityTimer(INACTIVITY_TIMEOUT - inactiveDuration);
      } else {
        scheduleInactivityTimer();
      }

      try {
        const res = await getMeApi(storedToken);
        if (isMounted && res.success && res.user) {
          setUser(res.user);
          setToken(storedToken);
          // Set last activity to now on successful init
          setLastActivity();
          // Schedule inactivity timer
          scheduleInactivityTimer();
        }
      } catch {
        // Invalid or expired token on initial load
        if (isMounted) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(LAST_ACTIVITY_KEY);
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
  }, [scheduleInactivityTimer, showToast, navigate]);

  // Cross-tab synchronization: tabs share the token via localStorage, so
  // login, logout, and token renewal in one tab propagate to all others.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === TOKEN_KEY) {
        if (!e.newValue) {
          // Logged out in another tab
          performLogout("You have been logged out.");
        } else if (e.newValue !== token) {
          // Token renewed or logged in via another tab
          setToken(e.newValue);
          setLastActivity();
          scheduleInactivityTimer();
        }
      } else if (e.key === LAST_ACTIVITY_KEY) {
        // Activity happened in another tab — reset the local timer
        scheduleInactivityTimer();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [token, performLogout, scheduleInactivityTimer]);

  // Logout callback — clears token, user state, timer, and lastActivity
  const logout = useCallback(() => {
    performLogout(null);
  }, [performLogout]);

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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      clearInactivityTimer();
    };
  }, [clearInactivityTimer]);

  // Login handler
  const login = useCallback(
    async (email, password) => {
      const res = await loginApi(email, password);
      if (res.success && res.token) {
        localStorage.setItem(TOKEN_KEY, res.token);
        setToken(res.token);
        setUser(res.user || null);
        // Set last activity and schedule inactivity timer
        setLastActivity();
        scheduleInactivityTimer();
        return res;
      }
      throw new Error(res.errors?.[0] || "Login failed.");
    },
    [scheduleInactivityTimer]
  );

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
