/**
 * taskApi.js
 * Single source of truth for all Task Manager HTTP calls.
 * Swap BASE_URL to point at a production backend with zero component changes.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

/* ── Internal wrapper ─────────────────────────────────────── */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = json.errors?.[0] ?? `Request failed: ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.errors = json.errors ?? [message];
    throw err;
  }

  return json;
}

/* ── Public API ───────────────────────────────────────────── */

/** Fetch all tasks. Returns { success, data, count } */
export const getTasks = () => apiFetch("/tasks");

/** Create a new task. Returns { success, data } */
export const createTask = (payload) =>
  apiFetch("/tasks", {
    method: "POST",
    body:   JSON.stringify(payload),
  });

/** Update an existing task by id. Returns { success, data } */
export const updateTask = (id, payload) =>
  apiFetch(`/tasks/${id}`, {
    method: "PUT",
    body:   JSON.stringify(payload),
  });

/** Delete a task by id. Returns { success, message } */
export const deleteTask = (id) =>
  apiFetch(`/tasks/${id}`, { method: "DELETE" });
