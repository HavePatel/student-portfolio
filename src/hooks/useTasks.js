import { useState, useEffect, useCallback } from "react";
import {
  getTasks,
  createTask as apiCreate,
  updateTask as apiUpdate,
  deleteTask as apiDelete,
} from "../services/taskApi";

/**
 * useTasks()
 * Central state manager for the Task Manager feature.
 * Components consume this hook — they never call taskApi directly.
 *
 * Returns:
 *   tasks, loading, error,
 *   fetchTasks, createTask, updateTask, deleteTask
 */
export function useTasks() {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  /* ── Fetch ─────────────────────────────────── */
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTasks();
      setTasks(res.data ?? []);
    } catch (err) {
      setError(err.message ?? "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  /* ── Create ────────────────────────────────── */
  const createTask = useCallback(async (payload) => {
    const res = await apiCreate(payload);   // throws on error
    setTasks((prev) => [res.data, ...prev]);
    return res.data;
  }, []);

  /* ── Update ────────────────────────────────── */
  const updateTask = useCallback(async (id, payload) => {
    const res = await apiUpdate(id, payload);  // throws on error
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    return res.data;
  }, []);

  /* ── Delete ────────────────────────────────── */
  const deleteTask = useCallback(async (id) => {
    await apiDelete(id);   // throws on error
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
