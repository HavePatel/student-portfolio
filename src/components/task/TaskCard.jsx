import { Pencil, Trash2, Calendar, Clock, CheckCircle2, Circle } from "lucide-react";

/* ── Date helpers ────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/**
 * TaskCard
 * Displays a single task with status badge, timestamps, and edit/delete actions.
 * Delete action triggers the ConfirmDialog managed by the parent.
 */
function TaskCard({ task, onEdit, onDelete, onToggleStatus }) {
  const isCompleted =
    task.completed === true || task.status === "completed";

  return (
    <article
      className={`task-card${isCompleted ? " task-card--completed" : ""}`}
      aria-label={`Task: ${task.title}`}
    >
      {/* ── Status badge ───────────────────────── */}
      <div className="task-card__top">
        <button
          type="button"
          className={`task-status-badge ${
            isCompleted
              ? "task-status-badge--completed"
              : "task-status-badge--pending"
          }`}
          onClick={() => onToggleStatus && onToggleStatus(task)}
          title="Click to toggle status"
          aria-label={`Status: ${isCompleted ? "Completed" : "Pending"}`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 size={13} strokeWidth={2.2} />
              <span>Completed</span>
            </>
          ) : (
            <>
              <Circle size={13} strokeWidth={2.2} />
              <span>Pending</span>
            </>
          )}
        </button>

        {/* Priority badge — Practical 5 Supplementary */}
        {/* Falls back to 'medium' for existing docs without priority */}
        <span
          className={`task-priority-badge task-priority-badge--${task.priority ?? "medium"}`}
          aria-label={`Priority: ${task.priority ?? "medium"}`}
        >
          {(task.priority ?? "medium").toUpperCase()}
        </span>

        {task.id && (
          <span className="task-card__id" title={`MongoDB ID: ${task.id}`}>
            #{String(task.id).slice(-6)}
          </span>
        )}
      </div>

      {/* ── Body ───────────────────────────────── */}
      <div className="task-card__body">
        <h3 className={`task-card__title${isCompleted ? " task-card__title--done" : ""}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="task-card__desc">{task.description}</p>
        )}
      </div>

      {/* ── Meta ───────────────────────────────── */}
      <div className="task-card__meta">
        {task.createdAt && (
          <span className="task-meta-item" title="Created date">
            <Calendar size={13} strokeWidth={2} />
            {fmtDate(task.createdAt)}
          </span>
        )}
        {task.updatedAt && task.updatedAt !== task.createdAt && (
          <span className="task-meta-item" title="Last updated">
            <Clock size={13} strokeWidth={2} />
            {timeAgo(task.updatedAt)}
          </span>
        )}
      </div>

      {/* ── Footer actions ─────────────────────── */}
      <div className="task-card__footer">
        <button
          type="button"
          className="task-btn task-btn--outline task-btn--sm"
          onClick={() => onEdit(task)}
          aria-label={`Edit task: ${task.title}`}
        >
          <Pencil size={14} strokeWidth={2} />
          Edit
        </button>
        <button
          type="button"
          className="task-btn task-btn--danger-outline task-btn--sm"
          onClick={() => onDelete(task)}
          aria-label={`Delete task: ${task.title}`}
        >
          <Trash2 size={14} strokeWidth={2} />
          Delete
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
