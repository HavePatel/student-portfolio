import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, WifiOff, Lock, LogIn, UserPlus } from "lucide-react";

import Container from "../components/ui/Container";
import TaskForm from "../components/task/TaskForm";
import TaskList from "../components/task/TaskList";
import TaskFilters from "../components/task/TaskFilters";
import TaskModal from "../components/task/TaskModal";
import ConfirmDialog from "../components/task/ConfirmDialog";
import LoadingState from "../components/task/LoadingState";
import { useTasks } from "../hooks/useTasks";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";

import "../styles/task.css";
import "../styles/auth.css";

/* ── Tech badges shown in hero ───────────────────────────── */
const TECH_BADGES = [
  "React",
  "Node.js",
  "Express",
  "MongoDB",
  "Mongoose",
  "JWT Auth",
  "bcryptjs",
  "Middleware",
  "CRUD",
];

/* ── Stats bar ───────────────────────────────────────────── */
/* ── Stats bar ───────────────────────────────────────────── */
function StatsBar({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter(
    (t) => t.status === "completed" || (t.completed === true && !t.status)
  ).length;
  const ongoing = tasks.filter((t) => t.status === "ongoing").length;
  const pending = tasks.filter(
    (t) => t.status === "pending" || (!t.status && !t.completed)
  ).length;

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
      <div className="task-stat-item task-stat-item--ongoing">
        <strong>{ongoing}</strong>
        <span>Ongoing</span>
      </div>
      <div className="task-stat-item task-stat-item--done">
        <strong>{completed}</strong>
        <span>Completed</span>
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

/* ── Auth Required Prompt ────────────────────────────────── */
function AuthRequiredPrompt() {
  return (
    <div className="auth-card" style={{ margin: "2rem auto", textAlign: "center" }}>
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "rgba(217, 119, 6, 0.1)",
          color: "var(--tan)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.25rem",
        }}
      >
        <Lock size={28} />
      </div>
      <h2 className="auth-title" style={{ fontSize: "1.4rem" }}>
        Authentication Required
      </h2>
      <p className="auth-subtitle" style={{ marginBottom: "1.75rem" }}>
        Protected Task Manager API requires a valid JWT token. Please sign in or create an account to manage tasks.
      </p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <Link to="/login" className="auth-submit-btn" style={{ textDecoration: "none" }}>
          <LogIn size={16} /> Sign In
        </Link>
        <Link
          to="/register"
          className="auth-submit-btn"
          style={{
            textDecoration: "none",
            background: "var(--surface)",
            color: "var(--text)",
            borderColor: "var(--border)",
          }}
        >
          <UserPlus size={16} /> Register
        </Link>
      </div>
    </div>
  );
}

/* ── TaskManagerPage ─────────────────────────────────────── */
function TaskManagerPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
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
        const currentStatus = t.status
          ? t.status
          : t.completed === true
          ? "completed"
          : "pending";
        return currentStatus === statusFilter;
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
          <p className="task-hero__eyebrow">PRACTICAL 7 — AUTH & MIDDLEWARE PIPELINE</p>
          <h1 className="task-hero__headline">Authenticated Task Manager</h1>
          <p className="task-hero__sub">
            Full-stack task application powered by React, Node.js, Express, MongoDB,
            bcryptjs password hashing, and JWT Middleware Pipeline.
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
          {authLoading ? (
            <LoadingState count={3} />
          ) : !isAuthenticated ? (
            <AuthRequiredPrompt />
          ) : (
            <>
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
                      statusFilter={statusFilter}
                      onEdit={setEditingTask}
                      onDelete={setTaskToDelete}
                    />
                  )}
                </main>
              </div>
            </>
          )}
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
