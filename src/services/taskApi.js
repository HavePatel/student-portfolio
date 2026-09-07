/**
 * taskApi.js
 * Central API service layer for Task Manager operations (Practical 6 + Practical 7).
 * Connects the React frontend to the Node + Express + MongoDB backend.
 *
 * Automatically attaches Authorization: Bearer <token> for protected requests.
 * Handles 401 Unauthorized responses by clearing stored tokens and dispatching
 * session expiration events to the application layer.
 */

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/* ── Internal fetch wrapper with JWT header injection & 401 handling ────── */
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
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
    if (res.status === 401) {
      // Clear token on 401 Unauthorized (expired or invalid token)
      localStorage.removeItem("token");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

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

/* ── Public API Functions ─────────────────────────────────── */

/**
 * Fetch all tasks from MongoDB.
 * @returns {Promise<{ success: boolean, data: Array, count: number }>}
 */
export const getTasks = () => apiFetch("/tasks");

/**
 * Fetch a single task by MongoDB ObjectId.
 * Practical 5 Supplementary Requirement.
 *
 * Possible responses from the server:
 *   200  { success: true,  data: task }           — task found
 *   400  { success: false, errors: [...] }         — invalid ObjectId
 *   401  { success: false, errors: [...] }         — no / expired JWT
 *   404  { success: false, errors: ["Task not found."] } — valid ID, no doc
 *
 * @param {string} id  MongoDB ObjectId string
 * @returns {Promise<{ success: boolean, data: Object }>}
 */
export const getTaskById = (id) => apiFetch(`/tasks/${id}`);

/**
 * Create a new task in MongoDB.
 * @param {{ title: string, description?: string, completed?: boolean, status?: string }} payload
 * @returns {Promise<{ success: boolean, data: Object }>}
 */
export const createTask = (payload) =>
  apiFetch("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });

/**
 * Update an existing task in MongoDB by ID.
 * @param {string} id
 * @param {{ title?: string, description?: string, completed?: boolean, status?: string }} payload
 * @returns {Promise<{ success: boolean, data: Object }>}
 */
export const updateTask = (id, payload) =>
  apiFetch(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

/**
 * Delete a task from MongoDB by ID.
 * @param {string} id
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const deleteTask = (id) =>
  apiFetch(`/tasks/${id}`, {
    method: "DELETE",
  });
