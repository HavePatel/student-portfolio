import { useState } from "react";
import { Pencil, Trash2, Calendar, Clock } from "lucide-react";

/* ── Date helpers ────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso);
  const m    = Math.floor(diff / 60000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/**
 * TaskCard
 * Displays a single task with status badge, edit, and delete controls.
 * Renders a confirm-delete inline prompt instead of a browser dialog.
 */
function TaskCard({ task, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting,      setDeleting]      = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <article
      className={`task-card${task.status === "completed" ? " task-card--completed" : ""}`}
      aria-label={`Task: ${task.title}`}
    >
      {/* ── Status badge ───────────────────────── */}
      <span
        className={`task-status-badge task-status-badge--${task.status}`}
        aria-label={`Status: ${task.status}`}
      >
        {task.status === "completed" ? "Completed" : "Pending"}
      </span>

      {/* ── Body ───────────────────────────────── */}
      <div className="task-card__body">
        <h3 className="task-card__title">{task.title}</h3>
        <p  className="task-card__desc">{task.description}</p>
      </div>

      {/* ── Meta ───────────────────────────────── */}
      <div className="task-card__meta">
        <span className="task-meta-item" title="Created">
          <Calendar size={13} strokeWidth={2} />
          {fmtDate(task.createdAt)}
        </span>
        {task.updatedAt && task.updatedAt !== task.createdAt && (
          <span className="task-meta-item" title="Last updated">
            <Clock size={13} strokeWidth={2} />
            {timeAgo(task.updatedAt)}
          </span>
        )}
      </div>

      {/* ── Footer actions ─────────────────────── */}
      <div className="task-card__footer">
        {confirmDelete ? (
          /* Inline confirm prompt */
          <div className="task-confirm" role="alert">
            <span className="task-confirm__msg">Delete this task?</span>
            <button
              type="button"
              className="task-btn task-btn--danger task-btn--sm"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Confirm delete"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
            <button
              type="button"
              className="task-btn task-btn--ghost task-btn--sm"
              onClick={() => setConfirmDelete(false)}
              aria-label="Cancel delete"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
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
              onClick={() => setConfirmDelete(true)}
              aria-label={`Delete task: ${task.title}`}
            >
              <Trash2 size={14} strokeWidth={2} />
              Delete
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export default TaskCard;
