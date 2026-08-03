import { useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";

const INITIAL = { title: "", description: "", status: "pending" };

/**
 * TaskForm
 * Inline card form for creating new tasks.
 * Validates client-side before calling onSubmit(payload).
 */
function TaskForm({ onSubmit }) {
  const [fields,   setFields]   = useState(INITIAL);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");

  /* ── Field change ─────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on edit
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  /* ── Validation ───────────────────────────── */
  const validate = () => {
    const errs = {};
    if (!fields.title.trim())       errs.title       = "Title is required.";
    if (!fields.description.trim()) errs.description = "Description is required.";
    return errs;
  };

  /* ── Submit ───────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");
    try {
      await onSubmit({
        title:       fields.title.trim(),
        description: fields.description.trim(),
        status:      fields.status,
      });
      setFields(INITIAL);
      setErrors({});
    } catch (err) {
      setApiError(err.message ?? "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-card">
      <h2 className="task-form-card__title">New Task</h2>

      {apiError && (
        <div className="task-api-error" role="alert">{apiError}</div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <div className="task-field">
          <label htmlFor="task-title" className="task-label">
            Title <span aria-hidden="true">*</span>
          </label>
          <input
            id="task-title"
            name="title"
            type="text"
            className={`task-input${errors.title ? " task-input--error" : ""}`}
            value={fields.title}
            onChange={handleChange}
            placeholder="Enter task title…"
            autoComplete="off"
            maxLength={120}
            aria-describedby={errors.title ? "task-title-err" : undefined}
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <span id="task-title-err" className="task-field-error" role="alert">
              {errors.title}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="task-field">
          <label htmlFor="task-desc" className="task-label">
            Description <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="task-desc"
            name="description"
            className={`task-textarea${errors.description ? " task-input--error" : ""}`}
            value={fields.description}
            onChange={handleChange}
            placeholder="Describe the task…"
            rows={3}
            maxLength={500}
            aria-describedby={errors.description ? "task-desc-err" : undefined}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <span id="task-desc-err" className="task-field-error" role="alert">
              {errors.description}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="task-field">
          <label htmlFor="task-status" className="task-label">Status</label>
          <select
            id="task-status"
            name="status"
            className="task-select"
            value={fields.status}
            onChange={handleChange}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button
          type="submit"
          className="task-btn task-btn--primary task-btn--full"
          disabled={loading}
          aria-busy={loading}
        >
          {loading
            ? <><Loader2 size={16} strokeWidth={2} className="task-spin" /> Creating…</>
            : <><PlusCircle size={16} strokeWidth={2} /> Create Task</>
          }
        </button>
      </form>
    </div>
  );
}

export default TaskForm;
