import { useState, useEffect, useCallback } from "react";
import {
  getTasks,
  createTask as apiCreate,
  updateTask as apiUpdate,
  deleteTask as apiDelete,
} from "../services/taskApi";

/**
 * useTasks()
 * Central state management hook for the Task Manager feature (Practical 6).
 *
 * Provides:
 *   - State: tasks, loading, error, creating, updating, deleting
 *   - Operations: fetchTasks, createTask, updateTask, deleteTask
 *   - State synchronization with MongoDB backend responses
 */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  /* ── 1. Read: Fetch all tasks ──────────────────────────────── */
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTasks();
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load tasks. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /* ── 2. Create: POST /tasks ────────────────────────────────── */
  const createTask = useCallback(async (payload) => {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await apiCreate(payload);
      const newTask = res.data;
      // Synchronize React state with actual server response
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setCreateError(err.message || "Failed to create task.");
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  /* ── 3. Update: PUT /tasks/:id ─────────────────────────────── */
  const updateTask = useCallback(async (id, payload) => {
    setUpdating(true);
    setUpdateError(null);
    try {
      const res = await apiUpdate(id, payload);
      const updatedTask = res.data;
      // Synchronize React state with actual server response
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id || t._id === id ? { ...t, ...updatedTask } : t
        )
      );
      return updatedTask;
    } catch (err) {
      setUpdateError(err.message || "Failed to update task.");
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  /* ── 4. Delete: DELETE /tasks/:id ──────────────────────────── */
  const deleteTask = useCallback(async (id) => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiDelete(id);
      // Synchronize React state after successful deletion
      setTasks((prev) => prev.filter((t) => t.id !== id && t._id !== id));
    } catch (err) {
      setDeleteError(err.message || "Failed to delete task.");
      throw err;
    } finally {
      setDeleting(false);
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    creating,
    createError,
    updating,
    updateError,
    deleting,
    deleteError,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}

export default useTasks;
