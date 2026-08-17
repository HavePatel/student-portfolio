import { useState, useEffect, useRef } from "react";
import { X, Save, Loader2 } from "lucide-react";

/**
 * TaskModal
 * Modal dialog for editing an existing task (Practical 6).
 * Handles updating title, description, and completion status.
 */
function TaskModal({ task, onSave, onClose, loading: externalLoading }) {
  const [fields, setFields] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    completed: task?.completed === true || task?.status === "completed",
  });
  const [errors, setErrors] = useState({});
  const [internalLoading, setInternalLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const firstInputRef = useRef(null);
  const isLoading = externalLoading || internalLoading;

  // Auto-focus input on open
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Synchronize if task prop changes
  useEffect(() => {
    if (task) {
      setFields({
        title: task.title ?? "",
        description: task.description ?? "",
        completed: task.completed === true || task.status === "completed",
      });
    }
  }, [task]);

  // Escape key listener
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, isLoading]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFields((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!fields.title.trim()) {
      errs.title = "Title cannot be empty.";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setInternalLoading(true);
    setApiError("");

    const taskId = task.id || task._id;

    try {
      await onSave(taskId, {
        title: fields.title.trim(),
        description: fields.description.trim(),
        completed: Boolean(fields.completed),
        status: fields.completed ? "completed" : "pending",
      });
      onClose();
    } catch (err) {
      setApiError(err.message || "Failed to update task.");
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <div
      className="task-modal-backdrop"
      onClick={() => {
        if (!isLoading) onClose();
      }}
      role="presentation"
    >
      <div
        className="task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="task-modal__header">
          <h2 id="edit-modal-title" className="task-modal__title">
            Edit Task
          </h2>
          <button
            type="button"
            className="task-modal__close"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {apiError && (
          <div className="task-api-error" role="alert">
            {apiError}
          </div>
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
              Description <span className="task-label-opt">(optional)</span>
            </label>
            <textarea
              id="modal-desc"
              name="description"
              className="task-textarea"
              value={fields.description}
              onChange={handleChange}
              placeholder="Task notes or description…"
              rows={4}
              maxLength={500}
            />
          </div>

          {/* Completed Checkbox */}
          <div className="task-field task-field--checkbox">
            <label className="task-checkbox-label">
              <input
                type="checkbox"
                name="completed"
                checked={fields.completed}
                onChange={handleChange}
                className="task-checkbox"
              />
              <span>Completed</span>
            </label>
          </div>

          {/* Actions */}
          <div className="task-modal__actions">
            <button
              type="button"
              className="task-btn task-btn--ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="task-btn task-btn--primary"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="task-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save size={15} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
