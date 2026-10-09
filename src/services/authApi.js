/**
 * authApi.js
 * API service for Authentication operations (Practical 7).
 * Connects the React frontend to /register, /login, and /me backend endpoints.
 */

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

async function authFetch(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    });
  } catch {
    const error = new Error(
      "Unable to connect to server. Please check that the backend is running at " +
        BASE_URL
    );
    error.isNetworkError = true;
    throw error;
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      json.errors?.[0] ||
      json.message ||
      `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.errors = json.errors || [message];
    throw err;
  }

  return json;
}

/**
 * Register a new user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const registerApi = (email, password) =>
  authFetch("/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

/**
 * Log in an existing user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, token: string, user: { id: string, email: string } }>}
 */
export const loginApi = (email, password) =>
  authFetch("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

/**
 * Get current authenticated user details.
 * @param {string} token
 * @returns {Promise<{ success: boolean, user: { id: string, email: string } }>}
 */
export const getMeApi = (token) =>
  authFetch("/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

/**
 * Log out and terminate the server-side session.
 * The backend deletes the session record so the current JWT is rejected
 * everywhere, including other tabs sharing the same token.
 * @param {string} token
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const logoutApi = (token) =>
  authFetch("/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

/**
 * Request password reset instructions.
 * @param {string} email
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const forgotPasswordApi = (email) =>
  authFetch("/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

/**
 * Reset password using reset token.
 * @param {string} token
 * @param {string} password
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const resetPasswordApi = (token, password) =>
  authFetch(`/reset-password/${token}`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
