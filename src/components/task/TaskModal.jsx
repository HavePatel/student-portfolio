import { useState, useEffect, useRef } from "react";
import { X, Save, Loader2 } from "lucide-react";

/**
 * TaskModal
 * Slide-in modal for editing an existing task.
 * Traps focus when open. Closes on Escape or backdrop click.
 */
function TaskModal({ task, onSave, onClose }) {
  const [fields,   setFields]   = useState({
    title:       task?.title       ?? "",
    description: task?.description ?? "",
    status:      task?.status      ?? "pending",
  });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");

  const firstInputRef = useRef(null);

  /* Focus first input when modal opens */
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  /* Sync fields if task prop changes */
  useEffect(() => {
    if (task) {
      setFields({
        title:       task.title,
        description: task.description,
        status:      task.status,
      });
    }
  }, [task]);

  /* Escape key closes modal */
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* ── Handlers ─────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!fields.title.trim())       errs.title       = "Title is required.";
    if (!fields.description.trim()) errs.description = "Description is required.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");
    try {
      await onSave(task.id, {
        title:       fields.title.trim(),
        description: fields.description.trim(),
        status:      fields.status,
      });
      onClose();
    } catch (err) {
      setApiError(err.message ?? "Failed to update task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="task-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      {/* Panel — stop propagation so clicks inside don't close */}
      <div
        className="task-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Edit task"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="task-modal__header">
          <h2 className="task-modal__title">Edit Task</h2>
          <button
            type="button"
            className="task-modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {apiError && (
          <div className="task-api-error" role="alert">{apiError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="task-field">
            <label htmlFor="modal-title" className="task-label">
              Title <span aria-hidden="true">*</span>
            </label>
            <input
              id="modal-title"
              ref={firstInputRef}
              name="title"
              type="text"
              className={`task-input${errors.title ? " task-input--error" : ""}`}
              value={fields.title}
              onChange={handleChange}
              placeholder="Task title…"
              maxLength={120}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "modal-title-err" : undefined}
            />
            {errors.title && (
              <span id="modal-title-err" className="task-field-error" role="alert">
                {errors.title}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="task-field">
            <label htmlFor="modal-desc" className="task-label">
              Description <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="modal-desc"
              name="description"
              className={`task-textarea${errors.description ? " task-input--error" : ""}`}
              value={fields.description}
              onChange={handleChange}
              placeholder="Describe the task…"
              rows={4}
              maxLength={500}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "modal-desc-err" : undefined}
            />
            {errors.description && (
              <span id="modal-desc-err" className="task-field-error" role="alert">
                {errors.description}
              </span>
            )}
          </div>

          {/* Status */}
          <div className="task-field">
            <label htmlFor="modal-status" className="task-label">Status</label>
            <select
              id="modal-status"
              name="status"
              className="task-select"
              value={fields.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Actions */}
          <div className="task-modal__actions">
            <button
              type="button"
              className="task-btn task-btn--ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="task-btn task-btn--primary"
              disabled={loading}
              aria-busy={loading}
            >
              {loading
                ? <><Loader2 size={15} strokeWidth={2} className="task-spin" /> Saving…</>
                : <><Save    size={15} strokeWidth={2} /> Save Changes</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
