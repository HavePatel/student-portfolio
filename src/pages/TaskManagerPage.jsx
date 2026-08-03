import { useState, useMemo }  from "react";
import { RefreshCw, WifiOff } from "lucide-react";

import Container    from "../components/ui/Container";
import TaskForm     from "../components/task/TaskForm";
import TaskList     from "../components/task/TaskList";
import TaskFilters  from "../components/task/TaskFilters";
import TaskModal    from "../components/task/TaskModal";
import LoadingState from "../components/task/LoadingState";
import { useTasks } from "../hooks/useTasks";

import "../styles/task.css";

/* ── Tech badges shown in the hero ─────────────────────── */
const TECH_BADGES = ["React", "Express", "REST API", "CRUD", "Middleware", "JavaScript"];

/* ── Stats bar ───────────────────────────────────────────── */
function StatsBar({ tasks }) {
  const total     = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending   = total - completed;
  const pct       = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="task-stats">
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

/* ── Error banner ────────────────────────────────────────── */
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="task-error-banner" role="alert">
      <span className="task-error-banner__icon">
        <WifiOff size={20} strokeWidth={1.8} />
      </span>
      <div>
        <strong>Unable to connect to server.</strong>
        <p>{message}</p>
      </div>
      <button
        type="button"
        className="task-btn task-btn--outline task-btn--sm"
        onClick={onRetry}
      >
        <RefreshCw size={14} strokeWidth={2} />
        Retry
      </button>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
function TaskManagerPage() {
  const { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask } = useTasks();

  /* Filter / search state */
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("all");
  const [editingTask, setEditingTask] = useState(null);

  /* Client-side filter pipeline */
  const filtered = useMemo(() => {
    let result = tasks;

    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [tasks, statusFilter, search]);

  const resetFilters = () => { setSearch(""); setStatusFilter("all"); };

  return (
    <div className="task-page">

      {/* ── Hero ───────────────────────────────── */}
      <div className="task-hero">
        <Container>
          <p className="task-hero__eyebrow">TASK MANAGER</p>
          <h1 className="task-hero__headline">Manage Tasks with REST APIs</h1>
          <p className="task-hero__sub">
            A complete CRUD application built with React&nbsp;+&nbsp;Express&nbsp;+&nbsp;Middleware
          </p>
          <div className="task-hero__badges" aria-label="Technologies used">
            {TECH_BADGES.map((b) => (
              <span key={b} className="task-tech-badge">{b}</span>
            ))}
          </div>
        </Container>
      </div>

      {/* ── Body ───────────────────────────────── */}
      <div className="task-body">
        <Container>

          {/* Error state */}
          {error && !loading && (
            <ErrorBanner message={error} onRetry={fetchTasks} />
          )}

          <div className="task-layout">

            {/* ── LEFT: form + stats ──────────── */}
            <aside className="task-sidebar">
              <TaskForm onSubmit={createTask} />
              {!loading && tasks.length > 0 && (
                <StatsBar tasks={tasks} />
              )}
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
                  onDelete={deleteTask}
                  onClearFilters={resetFilters}
                />
              )}
            </main>

          </div>
        </Container>
      </div>

      {/* ── Edit modal ─────────────────────────── */}
      {editingTask && (
        <TaskModal
          task={editingTask}
          onSave={updateTask}
          onClose={() => setEditingTask(null)}
        />
      )}

    </div>
  );
}

export default TaskManagerPage;
