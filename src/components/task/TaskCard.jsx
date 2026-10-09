import { Pencil, Trash2, Calendar, Clock, CheckCircle2, Circle, PlayCircle } from "lucide-react";

/* ── Status display mapping (non-clickable indicator) ── */
const STATUS_DISPLAY = {
  pending: { label: "Pending", icon: Circle, className: "task-status-badge--pending" },
  ongoing: { label: "Ongoing", icon: PlayCircle, className: "task-status-badge--ongoing" },
  completed: { label: "Completed", icon: CheckCircle2, className: "task-status-badge--completed" },
};

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
 * Displays a single compact task row with a single non-clickable status indicator,
 * title, desc, priority, ID, and right-aligned Edit/Delete actions.
 */
function TaskCard({ task, onEdit, onDelete }) {
  const currentStatus = task.status
    ? task.status
    : task.completed === true
    ? "completed"
    : "pending";

  const isCompleted = currentStatus === "completed";
  const statusInfo = STATUS_DISPLAY[currentStatus] || STATUS_DISPLAY.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <article
      className={`task-card${isCompleted ? " task-card--completed" : ""}`}
      aria-label={`Task: ${task.title}`}
    >
      {/* ── Status indicator (non-clickable) ── */}
      <div className="task-status-indicator" role="status" aria-label={`Status: ${statusInfo.label}`}>
        <span className={`task-status-badge ${statusInfo.className}`}>
          <StatusIcon size={11} strokeWidth={2.2} aria-hidden="true" />
          <span>{statusInfo.label}</span>
        </span>
      </div>

      {/* ── Body & Meta ───────────────────────── */}
      <div className="task-card__info">
        <h3 className={`task-card__title${isCompleted ? " task-card__title--done" : ""}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="task-card__desc">{task.description}</p>
        )}
        <div className="task-card__meta">
          {task.createdAt && (
            <span className="task-meta-item" title="Created date">
              <Calendar size={12} strokeWidth={2} />
              {fmtDate(task.createdAt)}
            </span>
          )}
          {task.updatedAt && task.updatedAt !== task.createdAt && (
            <span className="task-meta-item" title="Last updated">
              <Clock size={12} strokeWidth={2} />
              {timeAgo(task.updatedAt)}
            </span>
          )}
        </div>
      </div>

      {/* ── Priority & ID ──────────────────────── */}
      <div className="task-card__prio-id">
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

      {/* ── Actions (aligned right) ────────────── */}
      <div className="task-card__actions">
        <button
          type="button"
          className="task-btn task-btn--outline task-btn--sm"
          onClick={() => onEdit(task)}
          aria-label={`Edit task: ${task.title}`}
        >
          <Pencil size={13} strokeWidth={2} />
          Edit
        </button>
        <button
          type="button"
          className="task-btn task-btn--danger-outline task-btn--sm"
          onClick={() => onDelete(task)}
          aria-label={`Delete task: ${task.title}`}
        >
          <Trash2 size={13} strokeWidth={2} />
          Delete
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
