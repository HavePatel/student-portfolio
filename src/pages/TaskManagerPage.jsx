import { useState, useMemo } from "react";
import { RefreshCw, WifiOff } from "lucide-react";

import Container from "../components/ui/Container";
import TaskForm from "../components/task/TaskForm";
import TaskList from "../components/task/TaskList";
import TaskFilters from "../components/task/TaskFilters";
import TaskModal from "../components/task/TaskModal";
import ConfirmDialog from "../components/task/ConfirmDialog";
import LoadingState from "../components/task/LoadingState";
import { useTasks } from "../hooks/useTasks";
import { useToast } from "../hooks/useToast";

import "../styles/task.css";

/* ── Tech badges shown in hero ───────────────────────────── */
const TECH_BADGES = [
  "React",
  "Node.js",
  "Express",
  "MongoDB",
  "Mongoose",
  "REST API",
  "CRUD",
];

/* ── Stats bar ───────────────────────────────────────────── */
function StatsBar({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter(
    (t) => t.completed === true || t.status === "completed"
  ).length;
  const pending = total - completed;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="task-stats" aria-label="Task statistics">
      <div className="task-stat-item">
        <strong>{total}</strong>
        <span>Total</span>
      </div>
      <div className="task-stat-item task-stat-item--pending">
        <strong>{pending}</strong>
        <span>Pending</span>
      </div>
      <div className="task-stat-item task-stat-item--done">
        <strong>{completed}</strong>
        <span>Completed</span>
      </div>
      <div className="task-stat-item">
        <strong>{pct}%</strong>
        <span>Done</span>
      </div>
    </div>
  );
}

/* ── Error banner for GET failures ───────────────────────── */
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="task-error-banner" role="alert">
      <span className="task-error-banner__icon">
        <WifiOff size={20} />
      </span>
      <div>
        <strong>Unable to load tasks.</strong>
        <p>{message}</p>
      </div>
      <button
        type="button"
        className="task-btn task-btn--outline task-btn--sm"
        onClick={onRetry}
      >
        <RefreshCw size={14} />
        Retry
      </button>
    </div>
  );
}

/* ── TaskManagerPage ─────────────────────────────────────── */
function TaskManagerPage() {
  const {
    tasks,
    loading,
    error,
    creating,
    updating,
    deleting,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();

  const { showToast } = useToast();

  /* Filter / search state */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  /* Modal state */
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  /* Client-side filter pipeline */
  const filtered = useMemo(() => {
    let result = tasks;

    if (statusFilter !== "all") {
      result = result.filter((t) => {
        const isDone = t.completed === true || t.status === "completed";
        return statusFilter === "completed" ? isDone : !isDone;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [tasks, statusFilter, search]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  /* ── Wrapped CRUD actions with toast feedback ─────────── */
  const handleCreateTask = async (payload) => {
    try {
      const created = await createTask(payload);
      showToast("Task created successfully.", "success");
      return created;
    } catch (err) {
      showToast(err.message || "Failed to create task.", "error");
      throw err;
    }
  };

  const handleUpdateTask = async (id, payload) => {
    try {
      const updated = await updateTask(id, payload);
      showToast("Task updated successfully.", "success");
      return updated;
    } catch (err) {
      showToast(err.message || "Failed to update task.", "error");
      throw err;
    }
  };

  const handleToggleStatus = async (task) => {
    const taskId = task.id || task._id;
    const isCompleted = task.completed === true || task.status === "completed";
    try {
      await updateTask(taskId, {
        completed: !isCompleted,
        status: !isCompleted ? "completed" : "pending",
      });
      showToast(
        !isCompleted ? "Task marked as completed." : "Task marked as pending.",
        "success"
      );
    } catch (err) {
      showToast(err.message || "Failed to update task status.", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    const taskId = taskToDelete.id || taskToDelete._id;
    try {
      await deleteTask(taskId);
      showToast("Task deleted successfully.", "success");
      setTaskToDelete(null);
    } catch (err) {
      showToast(err.message || "Failed to delete task.", "error");
    }
  };

  return (
    <div className="task-page">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="task-hero">
        <Container>
          <p className="task-hero__eyebrow">TASK MANAGER</p>
          <h1 className="task-hero__headline">Full-Stack CRUD Demo</h1>
          <p className="task-hero__sub">
            A full-stack task management application powered by React, Node.js,
            Express, and MongoDB.
          </p>
          <div className="task-hero__badges" aria-label="Technologies used">
            {TECH_BADGES.map((b) => (
              <span key={b} className="task-tech-badge">
                {b}
              </span>
            ))}
          </div>
        </Container>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="task-body">
        <Container>
          {/* Error banner for GET failures */}
          {error && !loading && (
            <ErrorBanner message={error} onRetry={fetchTasks} />
          )}

          <div className="task-layout">
            {/* ── LEFT: form + stats ──────────── */}
            <aside className="task-sidebar">
              <TaskForm onSubmit={handleCreateTask} loading={creating} />
              {!loading && tasks.length > 0 && <StatsBar tasks={tasks} />}
            </aside>

            {/* ── RIGHT: filters + list ───────── */}
            <main className="task-main" aria-label="Task list">
              <TaskFilters
                search={search}
                onSearchChange={setSearch}
                status={statusFilter}
                onStatusChange={setStatusFilter}
                totalCount={tasks.length}
                filteredCount={filtered.length}
              />

              {loading ? (
                <LoadingState count={3} />
              ) : (
                <TaskList
                  tasks={filtered}
                  allTasks={tasks}
                  onEdit={setEditingTask}
                  onDelete={setTaskToDelete}
                  onToggleStatus={handleToggleStatus}
                  onClearFilters={resetFilters}
                />
              )}
            </main>
          </div>
        </Container>
      </div>

      {/* ── Edit Modal ──────────────────────────────────────── */}
      {editingTask && (
        <TaskModal
          task={editingTask}
          onSave={handleUpdateTask}
          onClose={() => setEditingTask(null)}
          loading={updating}
        />
      )}

      {/* ── Supplementary Problem: Delete Confirmation Modal ── */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        task={taskToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
        loading={deleting}
      />
    </div>
  );
}

export default TaskManagerPage;
