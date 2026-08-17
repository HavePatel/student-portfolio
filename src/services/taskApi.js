/**
 * taskApi.js
 * Central API service layer for Task Manager operations (Practical 6).
 * Connects the React frontend to the Node + Express + MongoDB backend.
 */

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/* ── Internal fetch wrapper ───────────────────────────────── */
async function apiFetch(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
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

/* ── Public API Functions ─────────────────────────────────── */

/**
 * Fetch all tasks from MongoDB.
 * @returns {Promise<{ success: boolean, data: Array, count: number }>}
 */
export const getTasks = () => apiFetch("/tasks");

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
